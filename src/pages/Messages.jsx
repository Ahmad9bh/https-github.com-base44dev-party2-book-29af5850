import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { Message } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { currentLanguage } = useLocalization();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);
  
   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userConversations = await Conversation.filter({ 
        participant_ids: { '$in': [currentUser.id] } 
      }, '-last_message_timestamp');
      setConversations(userConversations);

      if (userConversations.length > 0) {
        setSelectedConversation(userConversations[0]);
      }
    } catch (error) {
      console.error("Failed to load messaging data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const convMessages = await Message.filter({ conversation_id: conversationId }, 'created_date');
      setMessages(convMessages);
    } catch (error) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, error);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setSending(true);
    try {
      const messageData = {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_name: user.full_name,
        content: newMessage
      };
      
      await Message.create(messageData);
      
      // Also update the conversation for sorting
      await Conversation.update(selectedConversation.id, {
          last_message_content: newMessage,
          last_message_timestamp: new Date().toISOString()
      });
      
      setNewMessage('');
      loadMessages(selectedConversation.id); // Reload messages
      // Optional: real-time would be better here, but for now we refetch
    } catch (error) {
       console.error("Failed to send message:", error);
    } finally {
        setSending(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="h-[calc(100vh-120px)] grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {/* Conversations List */}
        <div className="col-span-1 border-r">
          <CardHeader>
            <CardTitle>{getLocalizedText('messages', currentLanguage)}</CardTitle>
             <CardDescription>Your conversations</CardDescription>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-80px)]">
            {conversations.map(convo => {
              const otherParticipantIndex = convo.participant_ids.findIndex(id => id !== user.id);
              return (
                <div
                  key={convo.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === convo.id ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedConversation(convo)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={convo.participant_avatars[otherParticipantIndex]} />
                      <AvatarFallback>{convo.participant_names[otherParticipantIndex]?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{convo.participant_names[otherParticipantIndex]}</div>
                       <p className="text-sm text-gray-500 truncate">{convo.last_message_content}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        {convo.last_message_timestamp && formatDistanceToNow(new Date(convo.last_message_timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle>
                    {selectedConversation.participant_names[selectedConversation.participant_ids.findIndex(id => id !== user.id)]}
                </CardTitle>
                <CardDescription>
                    Regarding: {selectedConversation.venue_name}
                </CardDescription>
              </CardHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user.id ? 'justify-end' : ''}`}>
                             {msg.sender_id !== user.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{msg.sender_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.sender_id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <CardContent className="pt-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{getLocalizedText('no_conversation_selected_title', currentLanguage) || 'Select a Conversation'}</h3>
                <p className="text-gray-600">{getLocalizedText('no_conversation_selected_desc', currentLanguage) || 'Choose a conversation from the list to start messaging.'}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}