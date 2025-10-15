import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Send,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Users,
  Clock,
  X,
} from 'lucide-react';
import { formatDate, formatTimeAgo, messageService } from '../utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'worker';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    type: 'client' | 'worker';
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface ChatProps {
  currentUser: {
    id: string;
    name: string;
    type: 'client' | 'worker';
  };
  conversations?: Conversation[];
  onSendMessage?: (conversationId: string, content: string) => void;
  onStartConversation?: (participantId: string) => void;
  initialWorkerId?: string;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({
  currentUser,
  conversations: initialConversations = [],
  onSendMessage,
  onStartConversation,
  initialWorkerId,
  onClose,
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(!!initialWorkerId);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initial worker chat
  useEffect(() => {
    if (initialWorkerId && !selectedConversation) {
      // Find or create conversation with the worker
      const existingConversation = conversations.find(conv =>
        conv.participants.some(p => p.id === initialWorkerId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else if (onStartConversation) {
        onStartConversation(initialWorkerId);
        // For demo, create a mock conversation
        const mockConv: Conversation = {
          id: `conv_${initialWorkerId}`,
          participants: [
            { id: currentUser.id, name: currentUser.name, type: currentUser.type },
            { id: initialWorkerId, name: 'Worker', type: 'worker' }
          ],
          lastMessage: undefined,
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        };
        setSelectedConversation(mockConv);
      }
    }
  }, [initialWorkerId, conversations, onStartConversation, currentUser, selectedConversation]);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messageService.getConversations() as Conversation[];
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const data = await messageService.getConversationMessages(selectedConversation.id) as Message[];
          setMessages(data);
          scrollToBottom();
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  // Real-time message polling
  useEffect(() => {
    if (!showChat || !selectedConversation) return;

    const pollInterval = setInterval(() => {
      // Simulate receiving new messages
      const shouldReceiveMessage = Math.random() < 0.1; // 10% chance every 3 seconds
      const shouldShowTyping = Math.random() < 0.05; // 5% chance to show typing
      
      if (shouldReceiveMessage) {
        const otherParticipant = conversations
          .find((conv: Conversation) => conv.id === selectedConversation.id)
          ?.participants.find((p: { id: string; name: string; type: 'client' | 'worker'; avatar?: string }) => p.id !== currentUser.id);
        
        if (otherParticipant) {
          const newMessage: Message = {
            id: Date.now().toString(),
            senderId: otherParticipant.id,
            senderName: otherParticipant.name,
            senderType: otherParticipant.type as 'client' | 'worker',
            content: getRandomMessage(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          setMessages((prev: Message[]) => [...prev, newMessage]);
          setIsTyping(false); // Stop typing when message is sent
          scrollToBottom();
          
          // Show notification for new message
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Nouveau message de ${otherParticipant.name}`, {
              body: newMessage.content,
              icon: '/favicon.ico'
            });
          }
          
          console.log('New message received:', newMessage);
        }
      } else if (shouldShowTyping && !isTyping) {
        setIsTyping(true);
        // Stop typing after 2-4 seconds
        setTimeout(() => setIsTyping(false), 2000 + Math.random() * 2000);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [showChat, selectedConversation, currentUser.id]);

  const getRandomMessage = () => {
    const messages = [
      "D'accord, je comprends.",
      "Pouvez-vous me donner plus de détails ?",
      "Je suis disponible demain.",
      "Quel est le budget prévu ?",
      "Parfait, on se voit bientôt !",
      "J'ai une question concernant le projet.",
      "Le travail avance bien.",
      "Merci pour votre réponse rapide.",
      "À quelle heure souhaitez-vous commencer ?",
      "Je confirme la prise de rendez-vous."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const sentMessage = await messageService.sendMessage(selectedConversation.id, newMessage.trim()) as Message;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }

    if (onSendMessage) {
      onSendMessage(selectedConversation.id, newMessage);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUser.id);
  };

  useEffect(() => {
    if (showChat) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [showChat]);

  const totalUnreadCount = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);

  return (
    <>
      {/* Chat Dialog */}
      <Dialog
        open={showChat}
        onClose={() => {
          setShowChat(false);
          if (onClose) onClose();
        }}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '700px',
            maxHeight: '90vh',
            borderRadius: 3,
          },
          '@keyframes typing': {
            '0%, 60%, 100%': { transform: 'translateY(0)' },
            '30%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>Messages</Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setShowChat(false);
                if (onClose) onClose();
              }}
              sx={{ color: 'text.secondary' }}
            >
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: '600px', display: 'flex' }}>
          {/* Conversations List */}
          <Box sx={{ 
            width: 320, 
            borderRight: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Conversations
              </Typography>
            </Box>
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {conversations.map((conversation: Conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <ListItem key={conversation.id} sx={{ px: 0 }}>
                    <ListItemButton
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{ px: 2, py: 1.5 }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount}
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              height: 18,
                              minWidth: 18,
                            },
                          }}
                        >
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {otherParticipant?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
                            {otherParticipant?.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.2 }}>
                            {conversation.lastMessage?.content || 'Nouvelle conversation'}
                          </Typography>
                        }
                      />
                      <Box sx={{ ml: 1, textAlign: 'right', minWidth: 50 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {conversation.lastMessage ? formatTimeAgo(conversation.lastMessage.timestamp) : ''}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar>
                      {getOtherParticipant(selectedConversation)?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {getOtherParticipant(selectedConversation)?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getOtherParticipant(selectedConversation)?.type === 'worker' ? 'Artisan' : 'Client'}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <IconButton size="small">
                        <Phone size={16} />
                      </IconButton>
                      <IconButton size="small">
                        <Video size={16} />
                      </IconButton>
                    </Box>
                  </Stack>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  <Stack spacing={2}>
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === currentUser.id;
                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                              color: isOwnMessage ? 'white' : 'text.primary',
                              border: isOwnMessage ? 'none' : `1px solid`,
                              borderColor: isOwnMessage ? 'transparent' : 'divider',
                            }}
                          >
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                              }}
                            >
                              {formatTimeAgo(message.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            border: `1px solid`,
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                bgcolor: 'text.secondary',
                                borderRadius: '50%',
                                animation: 'typing 1.4s infinite ease-in-out',
                                '&:nth-of-type(1)': { animationDelay: '0s' },
                                '&:nth-of-type(2)': { animationDelay: '0.2s' },
                                '&:nth-of-type(3)': { animationDelay: '0.4s' },
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                bgcolor: 'text.secondary',
                                borderRadius: '50%',
                                animation: 'typing 1.4s infinite ease-in-out',
                                '&:nth-of-type(1)': { animationDelay: '0s' },
                                '&:nth-of-type(2)': { animationDelay: '0.2s' },
                                '&:nth-of-type(3)': { animationDelay: '0.4s' },
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                bgcolor: 'text.secondary',
                                borderRadius: '50%',
                                animation: 'typing 1.4s infinite ease-in-out',
                                '&:nth-of-type(1)': { animationDelay: '0s' },
                                '&:nth-of-type(2)': { animationDelay: '0.2s' },
                                '&:nth-of-type(3)': { animationDelay: '0.4s' },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Écrit...
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </Stack>
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        },
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '&:disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled',
                        },
                      }}
                    >
                      <Send size={20} />
                    </IconButton>
                  </Stack>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <MessageCircle size={48} color="#ccc" />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  Sélectionnez une conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choisissez une conversation pour commencer à discuter
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onClose={() => setShowNewChat(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle conversation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sélectionnez un contact pour démarrer une conversation
          </Typography>
          <List>
            {/* Mock contacts - in real app, this would come from API */}
            <ListItem sx={{ px: 0 }}>
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar>M</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Marie Dupont"
                  secondary="Client - Plomberie"
                />
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar>P</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Pierre Durand"
                  secondary="Client - Électricité"
                />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChat(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Chat;