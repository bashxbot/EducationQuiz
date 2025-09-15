
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Copy, Check, MoreVertical, Trash2 } from 'lucide-react';
import { useChatHistory } from '../hooks/use-app-storage';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

interface StreamingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const TypingIndicator = () => (
  <div className="flex justify-start mb-4 animate-slide-up">
    <div className="glass-card rounded-lg p-3 max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default function Chat() {
  const { messages, addMessage, clearMessages } = useChatHistory();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    try {
      // Start streaming response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const streamingMsg: StreamingMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };
      
      setStreamingMessage(streamingMsg);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Finalize the message
              setStreamingMessage(prev => {
                if (prev) {
                  addMessage({
                    role: 'assistant',
                    content: prev.content,
                  });
                }
                return null;
              });
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setStreamingMessage(prev => 
                  prev ? { ...prev, content: prev.content + parsed.content } : null
                );
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
      setStreamingMessage(null);
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages();
    setStreamingMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const allMessages = [...messages, ...(streamingMessage ? [streamingMessage] : [])];

  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Header */}
      <div className="glass-card border-b p-4 flex justify-between items-center animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold font-display gradient-text">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Ask me anything!</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover-lift">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={handleClearChat} className="text-destructive hover:bg-destructive/20">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 float-animation">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium font-display gradient-text">Welcome to AI Chat</h3>
              <p className="text-muted-foreground">Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex chat-message ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg p-3 glass-card-hover transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground ml-auto neon-primary'
                      : 'glass-card'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="glass-border rounded-md"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={`${className} glass-border px-1 py-0.5 rounded text-accent`} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {(msg as StreamingMessage).isStreaming && (
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 neon-primary" />
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
                    className="mt-1 h-6 px-2 text-xs btn-glass hover-lift"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3 text-success" />
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
      <div className="fixed bottom-16 left-0 right-0 p-4 glass-card">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 input-glass focus-enhanced"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="btn-neon micro-bounce"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
