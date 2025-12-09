'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import apiClient from '@/lib/api/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    propertyId?: string;
    page?: string;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', context?: any) => void;
  clearHistory: () => void;
  toggleChat: () => void;
  requestAdminTransfer: () => void;
  isTransferRequested: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTransferRequested, setIsTransferRequested] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Load chat history from localStorage and handle user changes
  useEffect(() => {
    if (!user?.id) {
      // User logged out - clear everything
      console.log('[ChatContext] User logged out - clearing messages');
      setMessages([]);
      setLastUserId(null);
      setIsTransferRequested(false);
      return;
    }

    // Check if user changed
    if (lastUserId && user.id !== lastUserId) {
      console.log('[ChatContext] User changed from', lastUserId, 'to', user.id, '- clearing old messages');
      setMessages([]);
      setIsTransferRequested(false);
    }

    // Update last user ID
    setLastUserId(user.id);

    // Load this user's chat history
    const historyKey = `chatHistory_${user.id}`;
    console.log('[ChatContext] Loading chat history for user:', user.id, user.firstName, user.lastName);
    const savedHistory = localStorage.getItem(historyKey);
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        console.log('[ChatContext] Loaded', parsed.length, 'messages from localStorage');
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('[ChatContext] Failed to load chat history:', e);
        setMessages([]);
      }
    } else {
      console.log('[ChatContext] No saved history found for this user');
      setMessages([]);
    }
  }, [user?.id]);

  // Save chat history to localStorage
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      const historyKey = `chatHistory_${user.id}`;
      console.log('[ChatContext] Saving', messages.length, 'messages for user:', user.id);
      localStorage.setItem(historyKey, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system', context?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      context
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearHistory = () => {
    setMessages([]);
    if (user?.id) {
      const historyKey = `chatHistory_${user.id}`;
      localStorage.removeItem(historyKey);
    }
    setIsTransferRequested(false);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const requestAdminTransfer = async () => {
    setIsTransferRequested(true);
    
    // Send notification to admin
    try {
      await apiClient.post('/notifications', {
        type: 'chat_transfer',
        message: `${user?.firstName || 'Un utilisateur'} ${user?.lastName || ''} (${user?.email}) demande à parler avec un administrateur via le chat.`,
        priority: 'high',
        relatedUser: user?.id
      });
      
      addMessage(
        "Votre demande a été transmise à notre équipe. Un administrateur vous contactera bientôt via votre email ou le chat.",
        'system'
      );
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      addMessage(
        "Votre demande a été enregistrée. Un administrateur vous contactera bientôt.",
        'system'
      );
    }
  };

  // Auto-send welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessage(
          `Bonjour ${user?.firstName || 'cher utilisateur'} ! 👋\n\nJe suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez me poser des questions sur :\n• Nos biens immobiliers\n• Les prix et disponibilités\n• La prise de rendez-vous\n• Les informations sur un bien spécifique\n\nSi nécessaire, je peux aussi vous mettre en contact avec un administrateur.`,
          'assistant'
        );
      }, 500);
    }
  }, [isOpen]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isTyping,
        addMessage,
        clearHistory,
        toggleChat,
        requestAdminTransfer,
        isTransferRequested
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
