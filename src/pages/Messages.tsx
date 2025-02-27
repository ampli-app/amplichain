
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  Info, 
  Plus,
  MessageCircle,
  ArrowLeft,
  User,
  MoreHorizontal,
  Smile
} from 'lucide-react';

// Mock data for conversations
const mockConversations = [
  {
    id: 'conv1',
    user: {
      id: 'user1',
      name: 'Maya Reeves',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
      status: 'online',
      lastActive: 'Just now'
    },
    lastMessage: {
      text: 'Hey, I loved the beats you sent over!',
      time: '10:42 AM',
      isRead: true,
      isOwn: false
    },
    unread: 0
  },
  {
    id: 'conv2',
    user: {
      id: 'user2',
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
      status: 'offline',
      lastActive: '3h ago'
    },
    lastMessage: {
      text: 'Can we schedule a call to discuss the project?',
      time: 'Yesterday',
      isRead: true,
      isOwn: true
    },
    unread: 0
  },
  {
    id: 'conv3',
    user: {
      id: 'user3',
      name: 'Sarah Parker',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1970&auto=format&fit=crop',
      status: 'online',
      lastActive: 'Just now'
    },
    lastMessage: {
      text: 'The session is booked for next Tuesday at 2 PM.',
      time: 'Tuesday',
      isRead: false,
      isOwn: false
    },
    unread: 2
  }
];

// Mock data for messages in a conversation
const mockMessages = [
  {
    id: 'msg1',
    text: 'Hey Alex, I loved the beats you sent over!',
    time: '10:42 AM',
    isOwn: false,
    userId: 'user1'
  },
  {
    id: 'msg2',
    text: 'Thanks Maya! I\'m glad you liked them. I spent a lot of time on those samples.',
    time: '10:45 AM',
    isOwn: true,
    userId: 'currentUser'
  },
  {
    id: 'msg3',
    text: 'The melody on track 3 is exactly what I was looking for. Could we schedule a session to work on it further?',
    time: '10:47 AM',
    isOwn: false,
    userId: 'user1'
  },
  {
    id: 'msg4',
    text: 'Absolutely! I\'m free next week on Tuesday and Thursday. What works for you?',
    time: '10:50 AM',
    isOwn: true,
    userId: 'currentUser'
  },
  {
    id: 'msg5',
    text: 'Tuesday would be perfect. How about 2 PM?',
    time: '10:55 AM',
    isOwn: false,
    userId: 'user1'
  }
];

export default function Messages() {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState(conversations[0]?.id || null);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Adjust layout for mobile when conversation is selected
  useEffect(() => {
    if (isMobileView && activeConversation) {
      setShowConversationList(false);
    } else {
      setShowConversationList(true);
    }
  }, [isMobileView, activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the active conversation data
  const currentConversation = conversations.find(conv => conv.id === activeConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: `msg${messages.length + 1}`,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      userId: 'currentUser'
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Update the last message in conversations
    setConversations(conversations.map(conv => 
      conv.id === activeConversation
        ? {
            ...conv,
            lastMessage: {
              text: newMessage,
              time: 'Just now',
              isRead: true,
              isOwn: true
            }
          }
        : conv
    ));
    
    // Simulate receiving a reply (for demo purposes)
    if (activeConversation === 'conv1') {
      setTimeout(() => {
        const replyMsg = {
          id: `msg${messages.length + 2}`,
          text: 'Sounds good! Looking forward to our session.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          userId: 'user1'
        };
        
        setMessages(prev => [...prev, replyMsg]);
        
        // Update the last message in conversations
        setConversations(prevConversations => prevConversations.map(conv => 
          conv.id === activeConversation
            ? {
                ...conv,
                lastMessage: {
                  text: 'Sounds good! Looking forward to our session.',
                  time: 'Just now',
                  isRead: true,
                  isOwn: false
                }
              }
            : conv
        ));
        
        toast({
          title: "New message",
          description: `${currentConversation?.user.name}: Sounds good! Looking forward to our session.`,
        });
      }, 2000);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const handleConversationSelect = (convId: string) => {
    setActiveConversation(convId);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

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
                {/* Conversation List */}
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
                          Messages
                        </h2>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            placeholder="Search conversations" 
                            className="pl-10 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="overflow-y-auto flex-1">
                        {filteredConversations.length > 0 ? (
                          filteredConversations.map((conv) => (
                            <button 
                              key={conv.id}
                              onClick={() => handleConversationSelect(conv.id)}
                              className={`p-4 w-full text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-start gap-3 ${
                                activeConversation === conv.id ? 'bg-gray-100 dark:bg-gray-700/50' : ''
                              }`}
                            >
                              <div className="relative flex-shrink-0">
                                <Avatar className="h-10 w-10 border dark:border-gray-600">
                                  <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                {conv.user.status === 'online' && (
                                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-700"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-medium truncate">{conv.user.name}</h3>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">{conv.lastMessage.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {conv.lastMessage.isOwn ? 'You: ' : ''}{conv.lastMessage.text}
                                  </p>
                                  {conv.unread > 0 && (
                                    <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                      {conv.unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <MessageCircle className="mx-auto h-8 w-8 opacity-30 mb-2" />
                            <p>No conversations found</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t dark:border-gray-700">
                        <Button className="w-full" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Message
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Chat Area */}
                <AnimatePresence mode="wait">
                  {(!showConversationList || !isMobileView) && currentConversation && (
                    <motion.div 
                      initial={{ opacity: 0, x: isMobileView ? 20 : 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isMobileView ? 20 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col h-full"
                    >
                      <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isMobileView && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleBackToList}
                              className="mr-1"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </Button>
                          )}
                          <Avatar className="h-9 w-9 border dark:border-gray-600">
                            <AvatarImage src={currentConversation.user.avatar} alt={currentConversation.user.name} />
                            <AvatarFallback>{currentConversation.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{currentConversation.user.name}</h3>
                            <p className="text-xs text-gray-500">
                              {currentConversation.user.status === 'online' ? 'Online' : `Last active ${currentConversation.user.lastActive}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                            <Video className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-850">
                        {messages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {!message.isOwn && (
                              <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                                <AvatarImage src={currentConversation.user.avatar} alt={currentConversation.user.name} />
                                <AvatarFallback>{currentConversation.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div 
                              className={`max-w-[80%] ${message.isOwn 
                                ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                                : 'bg-white dark:bg-gray-700 dark:text-gray-100 rounded-2xl rounded-tl-sm border dark:border-gray-600'}`}
                            >
                              <div className="p-3">
                                <p>{message.text}</p>
                              </div>
                              <div className={`px-3 pb-1 text-xs ${message.isOwn ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-500">
                            <Smile className="h-5 w-5" />
                          </Button>
                          <Input 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim()}
                            className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Empty State */}
                {!currentConversation && !isMobileView && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="max-w-md">
                      <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                      <p className="text-gray-500 mb-6">Select a conversation or start a new one to begin messaging</p>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Message
                      </Button>
                    </div>
                  </div>
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
