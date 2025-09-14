
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Trash2, Copy, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useChatHistory, type ChatMessage } from "@/hooks/use-app-storage";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface StreamingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, clearHistory } = useChatHistory();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsLoading(true);
      
      // Add user message immediately
      const userMsg = addMessage({ role: "user", content });
      
      // Create streaming message
      const streamingId = `streaming_${Date.now()}`;
      setStreamingMessage({
        id: streamingId,
        role: "assistant",
        content: "",
        isStreaming: true
      });

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingMessage(prev => prev ? {
                    ...prev,
                    content: fullContent
                  } : null);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Finalize streaming message
        setStreamingMessage(null);
        addMessage({ role: "assistant", content: fullContent });
        
      } catch (error) {
        setStreamingMessage(null);
        // Fallback to regular API
        const response = await apiRequest("POST", "/api/chat/message", { content });
        const data = await response.json();
        addMessage({ role: "assistant", content: data.aiMessage.content });
      }
      
      setIsLoading(false);
      return null;
    },
    onSuccess: () => {
      setMessage("");
    },
    onError: () => {
      setIsLoading(false);
      setStreamingMessage(null);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

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

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const allMessages = [...messages];
  if (streamingMessage) {
    allMessages.push(streamingMessage as ChatMessage);
  }

  const quickPrompts = [
    "Explain quadratic equations",
    "Help with physics laws", 
    "Study tips for exams"
  ];

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Always ready to help</p>
          </div>
        </div>
        {allMessages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            data-testid="button-clear-chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
            <p className="text-muted-foreground mb-4">Ask me anything about your studies!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          allMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-accent' : 'bg-primary'
              }`}>
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-accent-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-card border'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {(msg as StreamingMessage).isStreaming && (
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                
                {msg.role === 'assistant' && !((msg as StreamingMessage).isStreaming) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="mt-1 h-6 px-2 text-xs"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && !streamingMessage && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about your studies..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={sendMessageMutation.isPending || isLoading}
            data-testid="input-chat-message"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending || isLoading}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
