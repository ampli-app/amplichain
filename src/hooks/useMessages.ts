
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
  const { user } = useAuth();

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
        conversationsData.map(async (conv) => {
          // 3.1 Pobierz uczestników
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id, unread_count')
            .eq('conversation_id', conv.id);
          
          if (participantsError) throw participantsError;
          
          // 3.2 Znajdź ID innych uczestników (nie bieżącego użytkownika)
          const otherParticipantIds = participants
            ?.filter(p => p.user_id !== user.id)
            .map(p => p.user_id) || [];
          
          // 3.3 Pobierz dane o nieprzeczytanych wiadomościach dla bieżącego użytkownika
          const unreadCount = participants?.find(p => p.user_id === user.id)?.unread_count || 0;
          
          // 3.4 Pobierz dane profilu innych uczestników
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
          
          // 3.5 Jeśli to konwersacja marketplace, pobierz dane produktu
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
          
          // 3.6 Zwróć kompletny obiekt konwersacji
          return {
            ...conv,
            otherUser,
            product,
            unread_count: unreadCount
          } as Conversation;
        })
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
  }, [user]);

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
      // Używamy funkcji RPC z Supabase
      const { data, error } = await supabase
        .rpc('find_or_create_conversation', { 
          p_user_id1: user.id, 
          p_user_id2: otherUserId,
          p_type: type,
          p_product_id: productId
        });
      
      if (error) throw error;
      
      // Odśwież listę konwersacji
      fetchConversations();
      
      return data;
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
    error,
    retryFetchConversations: fetchConversations
  };
}
