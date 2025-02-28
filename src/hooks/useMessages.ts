
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, Profile } from '@/types/messages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'private' | 'marketplace'>('private');
  const [error, setError] = useState<string | null>(null);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const { user } = useAuth();

  // Funkcja pomocnicza do pobierania szczegółów konwersacji
  const fetchConversationDetails = useCallback(async (conv) => {
    try {
      // 1. Pobierz uczestników
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, unread_count')
        .eq('conversation_id', conv.id);
      
      if (participantsError) throw participantsError;
      
      // 2. Znajdź ID innych uczestników (nie bieżącego użytkownika)
      const otherParticipantIds = participants
        ?.filter(p => p.user_id !== user?.id)
        .map(p => p.user_id) || [];
      
      // 3. Pobierz dane o nieprzeczytanych wiadomościach dla bieżącego użytkownika
      const unreadCount = participants?.find(p => p.user_id === user?.id)?.unread_count || 0;
      
      // 4. Pobierz dane profilu innych uczestników
      let otherUser = null;
      if (otherParticipantIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherParticipantIds[0])
          .single();
          
        if (!userError && userData) {
          otherUser = userData;
        }
      }
      
      // 5. Jeśli to konwersacja marketplace, pobierz dane produktu
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
      
      // 6. Zwróć kompletny obiekt konwersacji
      return {
        ...conv,
        otherUser,
        product,
        unread_count: unreadCount
      } as Conversation;
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów konwersacji:', error);
      throw error;
    }
  }, [user]);

  // Pobieranie listy konwersacji
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingConversations(true);
      setError(null);
      
      // 1. Pobierz ID konwersacji, w których użytkownik uczestniczy
      const { data: userConversations, error: convError } = await supabase
        .rpc('get_user_conversations', { p_user_id: user.id });
      
      if (convError) throw convError;
      
      if (!userConversations || userConversations.length === 0) {
        setConversations([]);
        setLoadingConversations(false);
        return;
      }
      
      // 2. Pobierz szczegóły konwersacji
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', userConversations);
      
      if (conversationsError) throw conversationsError;
      
      if (!conversationsData) {
        setConversations([]);
        setLoadingConversations(false);
        return;
      }
      
      // 3. Dla każdej konwersacji pobierz uczestników i inne potrzebne dane
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(conv => fetchConversationDetails(conv))
      );
      
      // 4. Sortuj konwersacje według ostatniej wiadomości
      const sortedConversations = conversationsWithDetails.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
      
      setConversations(sortedConversations);
    } catch (error: any) {
      console.error('Błąd podczas pobierania konwersacji:', error);
      setError('Nie udało się pobrać konwersacji. Spróbuj ponownie później.');
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać konwersacji. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setLoadingConversations(false);
    }
  }, [user, fetchConversationDetails]);

  // Pobieranie wiadomości dla wybranej konwersacji
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !user) return;
    
    try {
      setLoadingMessages(true);
      setError(null);
      
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
      } else {
        setMessages([]);
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
      setError(null);
      setCreatingConversation(true);
      
      // Sprawdź, czy konwersacja już istnieje
      let existingConversationId: string | null = null;
      
      if (type === 'private') {
        // Wyszukaj prywatną konwersację między dwoma użytkownikami
        const { data: userParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
        
        if (userParticipations && userParticipations.length > 0) {
          const userConversationIds = userParticipations.map(p => p.conversation_id);
          
          // Znajdź konwersacje, w których uczestniczy drugi użytkownik
          const { data: otherUserParticipations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', userConversationIds);
            
          if (otherUserParticipations && otherUserParticipations.length > 0) {
            // Sprawdź, czy któraś z tych konwersacji jest prywatna i nie dotyczy produktu
            const { data: privateConversations } = await supabase
              .from('conversations')
              .select('id')
              .eq('type', 'private')
              .is('product_id', null)
              .in('id', otherUserParticipations.map(p => p.conversation_id));
              
            if (privateConversations && privateConversations.length > 0) {
              existingConversationId = privateConversations[0].id;
            }
          }
        }
      } else if (type === 'marketplace' && productId) {
        // Wyszukaj konwersację marketplace dotyczącą konkretnego produktu
        const { data: userParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
        
        if (userParticipations && userParticipations.length > 0) {
          const userConversationIds = userParticipations.map(p => p.conversation_id);
          
          // Znajdź konwersacje, w których uczestniczy drugi użytkownik
          const { data: otherUserParticipations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', userConversationIds);
            
          if (otherUserParticipations && otherUserParticipations.length > 0) {
            // Sprawdź, czy któraś z tych konwersacji dotyczy tego produktu
            const { data: marketplaceConversations } = await supabase
              .from('conversations')
              .select('id')
              .eq('type', 'marketplace')
              .eq('product_id', productId)
              .in('id', otherUserParticipations.map(p => p.conversation_id));
              
            if (marketplaceConversations && marketplaceConversations.length > 0) {
              existingConversationId = marketplaceConversations[0].id;
            }
          }
        }
      }
      
      // Jeśli znaleziono istniejącą konwersację, użyj jej
      if (existingConversationId) {
        setCurrentConversation(existingConversationId);
        return existingConversationId;
      }
      
      // W przeciwnym razie utwórz nową konwersację
      // 1. Utwórz nową konwersację
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          type: type,
          product_id: productId
        })
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      if (!conversationData) {
        throw new Error('Nie udało się utworzyć konwersacji');
      }
      
      // 2. Dodaj uczestników
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationData.id, user_id: user.id },
          { conversation_id: conversationData.id, user_id: otherUserId }
        ]);
        
      if (participantsError) throw participantsError;
      
      // 3. Pobierz pełne dane konwersacji
      const conversationWithDetails = await fetchConversationDetails(conversationData);
      
      // 4. Dodaj nową konwersację do stanu
      setConversations(prev => [conversationWithDetails, ...prev]);
      
      // 5. Ustaw nową konwersację jako aktywną
      setCurrentConversation(conversationData.id);
      
      return conversationData.id;
    } catch (error: any) {
      console.error('Błąd podczas tworzenia konwersacji:', error);
      setError('Nie udało się utworzyć konwersacji. Spróbuj ponownie później.');
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć konwersacji. Spróbuj ponownie później.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setCreatingConversation(false);
    }
  }, [user, fetchConversationDetails]);

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
    error,
    retryFetchConversations: fetchConversations,
    creatingConversation
  };
}
