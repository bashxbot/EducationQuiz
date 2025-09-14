import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export default function Chat() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/history"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat/message", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Math Help",
    "Science Questions", 
    "Study Tips"
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-message">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-primary-foreground h-4 w-4" />
              </div>
              <Card className="max-w-[80%]">
                <CardContent className="p-4">
                  <p className="text-sm mb-2">Hello! I'm your AI learning assistant. I can help you with:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Step-by-step problem solving</li>
                    <li>• Concept explanations</li>
                    <li>• Study guidance</li>
                    <li>• Homework help</li>
                  </ul>
                  <p className="text-sm mt-2">What would you like to learn about today?</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => (
            <div key={msg.id} className="chat-message">
              <div className={`flex items-start gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-accent' : 'bg-primary'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="text-accent-foreground h-4 w-4" />
                  ) : (
                    <Bot className="text-primary-foreground h-4 w-4" />
                  )}
                </div>
                <Card className={`max-w-[80%] ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                }`}>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap" data-testid={`message-${msg.role}`}>
                      {msg.content}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about your studies..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => setMessage(prompt)}
              className="text-xs"
              data-testid={`button-prompt-${prompt.toLowerCase().replace(' ', '-')}`}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
