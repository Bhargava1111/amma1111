import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Bot, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatSession {
  id: string;
  status: 'active' | 'waiting' | 'closed';
  agent?: {
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  messages: Message[];
  startedAt: string;
  category: string;
}

const ChatSupport: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [supportCategory, setSupportCategory] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportCategories = [
    { id: 'general', label: 'General Inquiry', color: 'bg-blue-100 text-blue-800' },
    { id: 'order', label: 'Order Issues', color: 'bg-green-100 text-green-800' },
    { id: 'payment', label: 'Payment Problems', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'product', label: 'Product Questions', color: 'bg-purple-100 text-purple-800' },
    { id: 'technical', label: 'Technical Support', color: 'bg-red-100 text-red-800' },
    { id: 'returns', label: 'Returns & Refunds', color: 'bg-orange-100 text-orange-800' }
  ];

  const quickReplies = [
    "Hello! How can I help you today?",
    "I need help with my order",
    "I have a question about a product",
    "I'm having payment issues",
    "I want to return an item"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async (category: string) => {
    setIsConnecting(true);
    setSupportCategory(category);
    
    try {
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          category,
          userEmail: user?.Email,
          userName: user?.Name
        })
      });

      if (response.ok) {
        const session = await response.json();
        setChatSession(session);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Hello! I'm here to help you with ${category}. How can I assist you today?`,
          isUser: false,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      // Add fallback offline message
      const offlineMessage: Message = {
        id: Date.now().toString(),
        text: "I'm currently offline, but I'll do my best to help you! You can also reach us at support@manafoods.com or call +1 (555) 123-4567.",
        isUser: false,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages([offlineMessage]);
      
      setChatSession({
        id: 'offline-' + Date.now(),
        status: 'active',
        agent: {
          name: 'Support Bot',
          isOnline: false
        },
        messages: [offlineMessage],
        startedAt: new Date().toISOString(),
        category
      });
    }
    
    setIsConnecting(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: chatSession?.id,
          message: text.trim(),
          userId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update message status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );

        // Add response message
        setTimeout(() => {
          const responseMessage: Message = {
            id: data.id || (Date.now() + 1).toString(),
            text: data.response || getAutoResponse(text.trim()),
            isUser: false,
            timestamp: new Date().toISOString(),
            status: 'delivered'
          };
          
          setMessages(prev => [...prev, responseMessage]);
          setIsTyping(false);
        }, 1000 + Math.random() * 2000); // Simulate realistic response time
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback auto-response
      setTimeout(() => {
        const autoResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getAutoResponse(text.trim()),
          isUser: false,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, autoResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const getAutoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('tracking')) {
      return "I can help you with order-related questions! Please provide your order number, and I'll look up the details for you.";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      return "For payment issues, I can help you troubleshoot. What specific payment problem are you experiencing?";
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "I can assist with returns and refunds. Our return policy allows 30 days for most items. Do you have a specific item you'd like to return?";
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      return "I'm here to help with product questions! What would you like to know about our products?";
    }
    
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return "For shipping and delivery questions, I can provide tracking information and estimated delivery times. What's your order number?";
    }
    
    return "Thank you for contacting us! I'll do my best to help you. Could you please provide more details about your question?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setMessages([]);
    setChatSession(null);
    setSupportCategory('');
  };

  const handleQuickReply = (reply: string) => {
    setCurrentMessage(reply);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 sm:w-96 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl transition-all duration-300`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <div className="flex flex-col">
              <CardTitle className="text-sm font-medium">
                {chatSession?.agent?.name || 'Customer Support'}
              </CardTitle>
              {chatSession?.agent && (
                <div className="flex items-center space-x-1 text-xs opacity-90">
                  <div className={`w-2 h-2 rounded-full ${chatSession.agent.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span>{chatSession.agent.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-700 p-1"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="text-white hover:bg-blue-700 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {!chatSession ? (
              <div className="flex-1 p-4 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">How can we help you?</h3>
                  <p className="text-sm text-gray-600 mb-4">Choose a category to start chatting</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {supportCategories.map(category => (
                    <Button
                      key={category.id}
                      variant="outline"
                      size="sm"
                      onClick={() => startChat(category.id)}
                      disabled={isConnecting}
                      className="h-auto p-2 text-left"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Badge className={`text-xs ${category.color}`}>
                          {category.label}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>support@manafoods.com</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.isUser && (
                            <div className="ml-2">
                              {message.status === 'sent' && <Clock className="w-3 h-3 opacity-70" />}
                              {message.status === 'delivered' && <CheckCircle className="w-3 h-3 opacity-70" />}
                              {message.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-300" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 1 && (
                  <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-1">
                      {quickReplies.slice(1).map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-auto py-1 px-2"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => sendMessage(currentMessage)}
                      disabled={!currentMessage.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatSupport;
