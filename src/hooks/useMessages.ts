
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, Profile } from '@/types/messages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Funkcja pomocnicza do pobierania konwersacji
const fetchConversationDetails = async (userId: string): Promise<Conversation[]> => {
  try {
    // 1. Najpierw pobierz tylko ID konwersacji, w których uczestniczy użytkownik
    const { data: participantsData, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, unread_count')
      .eq('user_id', userId);
    
    if (participantsError) throw participantsError;
    if (!participantsData || participantsData.length === 0) return [];
    
    // 2. Pobierz szczegóły konwersacji na podstawie ID
    const conversationIds = participantsData.map(p => p.conversation_id);
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds);
    
    if (conversationsError) throw conversationsError;
    if (!conversationsData) return [];
    
    // 3. Przygotuj mapę liczników nieprzeczytanych wiadomości
    const unreadCountMap = participantsData.reduce((map, item) => {
      map[item.conversation_id] = item.unread_count;
      return map;
    }, {} as Record<string, number>);
    
    // 4. Uzupełnij konwersacje o dodatkowe dane (inni uczestnicy, produkty)
    const conversationsWithDetails = await Promise.all(
      conversationsData.map(async (conv) => {
        // 4.1 Pobierz innych uczestników konwersacji
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', userId);
        
        if (participantsError) throw participantsError;
        
        // 4.2 Pobierz dane profilu drugiego uczestnika
        let otherUser = null;
        if (participants && participants.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', participants[0].user_id)
            .single();
            
          if (!userError && userData) {
            otherUser = userData;
          }
        }
        
        // 4.3 Jeśli to konwersacja marketplace, pobierz informacje o produkcie
        let product = null;
        if (conv.type === 'marketplace' && conv.product_id) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, title, price, image_url')
            .eq('id', conv.product_id)
            .single();
            
          if (!productError && productData) {
            product = productData;
          }
        }
        
        // 4.4 Zwróć kompletny obiekt konwersacji
        return {
          ...conv,
          otherUser,
          product,
          unread_count: unreadCountMap[conv.id] || 0
        } as Conversation;
      })
    );
    
    // 5. Sortuj konwersacje według ostatniej wiadomości
    return conversationsWithDetails.sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów konwersacji:', error);
    throw error;
  }
};

// Hook do zarządzania wiadomościami
export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'private' | 'marketplace'>('private');
  const { user } = useAuth();

  // Pobieranie listy konwersacji
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingConversations(true);
      const conversations = await fetchConversationDetails(user.id);
      setConversations(conversations);
    } catch (error: any) {
      console.error('Błąd podczas pobierania konwersacji:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać konwersacji. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Pobieranie wiadomości dla wybranej konwersacji
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !user) return;
    
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, full_name, avatar_url, username, role)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setMessages(data as Message[]);
        
        // Oznacz wiadomości jako przeczytane
        if (data.length > 0) {
          const unreadMessages = data.filter(m => !m.is_read && m.sender_id !== user.id);
          
          if (unreadMessages.length > 0) {
            // Aktualizuj status wiadomości na przeczytane
            await Promise.all(
              unreadMessages.map(msg => 
                supabase
                  .from('messages')
                  .update({ is_read: true })
                  .eq('id', msg.id)
              )
            );
            
            // Aktualizuj licznik nieprzeczytanych
            await supabase
              .from('conversation_participants')
              .update({ unread_count: 0 })
              .eq('conversation_id', conversationId)
              .eq('user_id', user.id);
              
            // Aktualizuj lokalny stan konwersacji
            setConversations(prevConversations => 
              prevConversations.map(conv => 
                conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
              )
            );
          }
        }
      }
    } catch (error: any) {
      console.error('Błąd podczas pobierania wiadomości:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać wiadomości. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Wysyłanie nowej wiadomości
  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!user || !text.trim() || !conversationId) return null;
    
    try {
      const newMessage = {
        conversation_id: conversationId,
        sender_id: user.id,
        text: text.trim(),
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select('*, sender:profiles(id, full_name, avatar_url, username, role)')
        .single();
        
      if (error) throw error;
      
      // Dodaj nową wiadomość do stanu
      if (data) {
        setMessages(prev => [...prev, data as Message]);
      }
      
      return data as Message;
    } catch (error: any) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user]);

  // Tworzenie nowej konwersacji lub znalezienie istniejącej
  const findOrCreateConversation = useCallback(async (
    otherUserId: string, 
    type: 'private' | 'marketplace' = 'private',
    productId: string | null = null
  ) => {
    if (!user) return null;
    
    try {
      // Sprawdź, czy istnieje już konwersacja między tymi użytkownikami
      let existingConversationId: string | null = null;
      
      if (type === 'private') {
        // Szukaj prywatnej konwersacji między użytkownikami
        const { data: myParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
        
        if (myParticipations && myParticipations.length > 0) {
          const myConversationIds = myParticipations.map(p => p.conversation_id);
          
          const { data: theirParticipations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', myConversationIds);
          
          if (theirParticipations && theirParticipations.length > 0) {
            // Znajdź konwersację typu 'private' bez product_id
            const { data: conversations } = await supabase
              .from('conversations')
              .select('id')
              .eq('type', 'private')
              .is('product_id', null)
              .in('id', theirParticipations.map(p => p.conversation_id));
            
            if (conversations && conversations.length > 0) {
              existingConversationId = conversations[0].id;
            }
          }
        }
      } else if (type === 'marketplace' && productId) {
        // Szukaj konwersacji marketplace dla danego produktu
        const { data: myParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
        
        if (myParticipations && myParticipations.length > 0) {
          const myConversationIds = myParticipations.map(p => p.conversation_id);
          
          const { data: theirParticipations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', myConversationIds);
          
          if (theirParticipations && theirParticipations.length > 0) {
            const { data: conversations } = await supabase
              .from('conversations')
              .select('id')
              .eq('type', 'marketplace')
              .eq('product_id', productId)
              .in('id', theirParticipations.map(p => p.conversation_id));
            
            if (conversations && conversations.length > 0) {
              existingConversationId = conversations[0].id;
            }
          }
        }
      }
      
      // Jeśli znaleziono istniejącą konwersację, zwróć jej ID
      if (existingConversationId) {
        return existingConversationId;
      }
      
      // W przeciwnym razie utwórz nową konwersację
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({ type, product_id: productId })
        .select('id')
        .single();
      
      if (conversationError) throw conversationError;
      
      // Dodaj uczestników do nowej konwersacji
      const participantsToInsert = [
        { conversation_id: newConversation.id, user_id: user.id },
        { conversation_id: newConversation.id, user_id: otherUserId }
      ];
      
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToInsert);
      
      if (participantsError) throw participantsError;
      
      // Odśwież listę konwersacji
      fetchConversations();
      
      return newConversation.id;
    } catch (error: any) {
      console.error('Błąd podczas tworzenia konwersacji:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć konwersacji. Spróbuj ponownie później.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchConversations]);

  // Obsługa subskrypcji na zmiany w wiadomościach w czasie rzeczywistym
  useEffect(() => {
    if (!user) return;
    
    // Subskrybuj na nowe wiadomości
    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: currentConversation ? `conversation_id=eq.${currentConversation}` : undefined
        },
        async (payload) => {
          if (!currentConversation || payload.new.conversation_id !== currentConversation) return;
          
          // Pobierz informacje o nadawcy
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username, role')
            .eq('id', payload.new.sender_id)
            .single();
            
          const newMessage = {
            ...payload.new,
            sender: senderData
          } as Message;
          
          // Jeśli wiadomość jest od innego użytkownika, oznacz ją jako przeczytaną
          if (payload.new.sender_id !== user.id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
              
            // Aktualizuj licznik nieprzeczytanych
            await supabase
              .from('conversation_participants')
              .update({ unread_count: 0 })
              .eq('conversation_id', payload.new.conversation_id)
              .eq('user_id', user.id);
          }
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Odśwież listę konwersacji, gdy jakaś zostanie zaktualizowana
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, currentConversation, fetchConversations]);

  // Pobierz konwersacje po zalogowaniu
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Pobierz wiadomości, gdy zmieni się aktywna konwersacja
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation, fetchMessages]);

  return {
    conversations,
    filteredConversations: conversations.filter(c => c.type === activeTab),
    currentConversation,
    setCurrentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
    findOrCreateConversation,
    activeTab,
    setActiveTab,
  };
}
