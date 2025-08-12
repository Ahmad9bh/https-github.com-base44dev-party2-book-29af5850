import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, X, Sparkles } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { Venue } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: "Hello! I'm Party2Go's AI Assistant. How can I help you find the perfect venue today?"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
        const venues = await Venue.list('-created_date', 20);
        const venueContext = venues.map(v => `- ${v.title} in ${v.location.city} for $${v.price_per_hour}/hr, capacity ${v.capacity}. Link: ${createPageUrl('VenueDetails', {id: v.id})}`).join('\n');

        const conversationHistory = messages.map(m => `${m.sender}: ${m.text}`).join('\n');

        const prompt = `
            You are a friendly and helpful AI assistant for Party2Go, a venue booking platform.
            Your goal is to help users find venues and answer their questions.
            Keep your answers concise and helpful. If you recommend a venue, provide the link.

            Current Conversation:
            ${conversationHistory}
            user: ${input}

            Available Venues Context:
            ${venueContext}

            Respond as 'bot':
        `;

      const response = await InvokeLLM({ prompt });
      
      const botMessage = { sender: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      const errorMessage = { sender: 'bot', text: "Sorry, I'm having a little trouble right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chatbot LLM failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-indigo-600 hover:bg-indigo-700"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 z-50">
          <Card className="shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-indigo-600" />
                <CardTitle>AI Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                      {message.sender === 'bot' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                      {message.sender === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User /></AvatarFallback></Avatar>}
                    </div>
                  ))}
                   {loading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                   )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about venues..."
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}