
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { User, Send, Search, Plus, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { motion } from 'framer-motion';

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
        setConversations(conversations.map(conv => 
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border overflow-hidden bg-white dark:bg-rhythm-900 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 h-[70vh]">
                {/* Sidebar */}
                <div className="border-r dark:border-rhythm-800">
                  <div className="p-4 border-b dark:border-rhythm-800">
                    <h2 className="text-xl font-semibold mb-4">Messages</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                      <Input 
                        placeholder="Search conversations" 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto h-[calc(70vh-80px)]">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map((conv) => (
                        <div 
                          key={conv.id}
                          onClick={() => setActiveConversation(conv.id)}
                          className={`p-4 cursor-pointer transition-colors hover:bg-rhythm-100 dark:hover:bg-rhythm-800/50 ${
                            activeConversation === conv.id ? 'bg-rhythm-100 dark:bg-rhythm-800/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                                <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {conv.user.status === 'online' && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-rhythm-800"></span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-medium truncate">{conv.user.name}</h3>
                                <span className="text-xs text-rhythm-500">{conv.lastMessage.time}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-rhythm-600 dark:text-rhythm-400 truncate">
                                  {conv.lastMessage.isOwn ? 'You: ' : ''}{conv.lastMessage.text}
                                </p>
                                {conv.unread > 0 && (
                                  <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                    {conv.unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-rhythm-500">
                        <p>No conversations found</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Chat area */}
                <div className="col-span-2 flex flex-col h-full">
                  {currentConversation ? (
                    <>
                      <div className="p-4 border-b dark:border-rhythm-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={currentConversation.user.avatar} alt={currentConversation.user.name} />
                            <AvatarFallback>{currentConversation.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{currentConversation.user.name}</h3>
                            <p className="text-xs text-rhythm-500">
                              {currentConversation.user.status === 'online' ? 'Online' : `Last active ${currentConversation.user.lastActive}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Video className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Info className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.isOwn 
                              ? 'bg-primary text-white rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl' 
                              : 'bg-rhythm-100 dark:bg-rhythm-800 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl'}`}
                            >
                              <div className="p-3">
                                <p>{message.text}</p>
                              </div>
                              <div className={`px-3 pb-1 text-xs ${message.isOwn ? 'text-primary-foreground/70' : 'text-rhythm-500'}`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 border-t dark:border-rhythm-800">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="text-center max-w-md">
                        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                        <p className="text-rhythm-500 mb-6">Select a conversation or start a new one to begin messaging</p>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
