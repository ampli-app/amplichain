
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageCircle,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { EmptyState } from '@/components/messages/EmptyState';
import { ConversationHeader } from '@/components/messages/ConversationHeader';
import { MessageInput } from '@/components/messages/MessageInput';
import { NewMessageButton } from '@/components/messages/NewMessageButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Messages() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  
  const { 
    conversations,
    filteredConversations,
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
    retryFetchConversations,
    creatingConversation
  } = useMessages();

  // Sprawdź czy widok jest mobilny
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Dostosuj układ dla widoku mobilnego, gdy konwersacja jest wybrana
  useEffect(() => {
    if (isMobileView && currentConversation) {
      setShowConversationList(false);
    } else {
      setShowConversationList(true);
    }
  }, [isMobileView, currentConversation]);

  // Przewiń do dołu, gdy pojawią się nowe wiadomości
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const handleConversationSelect = (convId: string) => {
    setCurrentConversation(convId);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (currentConversation) {
      await sendMessage(currentConversation, text);
    }
  };

  const handleNewMessage = async (userId: string) => {
    const conversationId = await findOrCreateConversation(userId);
    if (conversationId) {
      setCurrentConversation(conversationId);
    }
  };
  
  // Filtruj konwersacje na podstawie wyszukiwania
  const displayedConversations = filteredConversations.filter(conv => {
    const otherUserName = conv.otherUser?.full_name || conv.otherUser?.username || '';
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Pobierz dane aktywnej konwersacji
  const activeConversationData = currentConversation 
    ? conversations.find(conv => conv.id === currentConversation) 
    : null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Zaloguj się, aby zobaczyć wiadomości</h1>
            <Button asChild>
              <a href="/login">Zaloguj się</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
              <div className="flex flex-col md:flex-row h-[70vh]">
                {/* Lista konwersacji */}
                <AnimatePresence mode="wait">
                  {(showConversationList || !isMobileView) && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full md:w-80 lg:w-96 border-r dark:border-gray-700 flex flex-col"
                    >
                      <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                          Wiadomości
                        </h2>
                        
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'marketplace')}>
                          <TabsList className="w-full mb-4">
                            <TabsTrigger value="private" className="flex-1">Prywatne</TabsTrigger>
                            <TabsTrigger value="marketplace" className="flex-1">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Marketplace
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                        
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            placeholder="Szukaj konwersacji" 
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="overflow-y-auto flex-1">
                        {loadingConversations ? (
                          <div className="p-8 text-center">
                            <p className="text-gray-500">Ładowanie konwersacji...</p>
                          </div>
                        ) : error ? (
                          <EmptyState 
                            title="Błąd"
                            description={error}
                            error={true}
                            onRetry={retryFetchConversations}
                            isLoading={loadingConversations}
                          />
                        ) : displayedConversations.length > 0 ? (
                          displayedConversations.map((conv) => (
                            <ConversationItem 
                              key={conv.id}
                              conversation={conv}
                              isActive={currentConversation === conv.id}
                              onClick={() => handleConversationSelect(conv.id)}
                            />
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <MessageCircle className="mx-auto h-8 w-8 opacity-30 mb-2" />
                            <p>Nie znaleziono konwersacji</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t dark:border-gray-700">
                        <NewMessageButton 
                          onSelectUser={handleNewMessage} 
                          isLoading={creatingConversation} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Obszar czatu */}
                <AnimatePresence mode="wait">
                  {(!showConversationList || !isMobileView) && activeConversationData && (
                    <motion.div 
                      initial={{ opacity: 0, x: isMobileView ? 20 : 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isMobileView ? 20 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col h-full"
                    >
                      <ConversationHeader 
                        conversation={activeConversationData}
                        onBackClick={handleBackToList}
                        isMobileView={isMobileView}
                      />
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-850">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Ładowanie wiadomości...</p>
                          </div>
                        ) : messages.length > 0 ? (
                          <>
                            {messages.map((message, index) => {
                              // Sprawdź, czy ta wiadomość jest pierwszą od tego nadawcy w serii
                              const showAvatar = index === 0 || 
                                messages[index - 1].sender_id !== message.sender_id;
                                
                              return (
                                <MessageBubble 
                                  key={message.id} 
                                  message={message}
                                  showAvatar={showAvatar}
                                />
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">
                              Rozpocznij konwersację z {activeConversationData.otherUser?.full_name || 'użytkownikiem'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <MessageInput 
                        onSendMessage={handleSendMessage}
                        placeholder={`Napisz do ${activeConversationData.otherUser?.full_name || 'użytkownika'}...`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Pusty stan */}
                {!activeConversationData && !isMobileView && !error && (
                  <EmptyState 
                    title="Twoje wiadomości"
                    description="Wybierz konwersację lub rozpocznij nową, aby pisać wiadomości"
                    isLoading={creatingConversation}
                  />
                )}
                
                {/* Stan błędu w obszarze głównym */}
                {!activeConversationData && !isMobileView && error && (
                  <EmptyState 
                    title="Błąd"
                    description={error}
                    error={true}
                    onRetry={retryFetchConversations}
                    isLoading={loadingConversations}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
