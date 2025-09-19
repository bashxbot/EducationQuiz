import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Copy, Check, MoreVertical, Trash2, MessageCircle, Sparkles } from 'lucide-react';
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
  <div className="flex justify-start mb-4">
    <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-3 max-w-[80%] border border-border">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

const suggestedQuestions = [
  "Explain photosynthesis in simple terms",
  "Help me solve this math problem",
  "What is the difference between mitosis and meiosis?",
  "How do I improve my study habits?",
  "Explain the water cycle",
  "What are the laws of thermodynamics?"
];

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

  const handleSubmit = async (e: React.FormEvent, questionText?: string) => {
    e.preventDefault();
    const userMessage = questionText || input.trim();
    if (!userMessage || isLoading) return;

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
    <div className="premium-container max-h-screen flex flex-col">
      {/* Chat Header */}
      <Card className="premium-card glass-morphism animate-slide-up mb-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gradient-primary">AI Learning Assistant</h2>
                <p className="text-sm text-foreground-secondary">Ask me anything about your studies!</p>
              </div>
            </div>

            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Container */}
      <Card className="premium-card flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {allMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gradient-primary">Welcome to AI Chat</h3>
                  <p className="text-muted-foreground max-w-md">
                    I'm here to help you with your studies. Ask me questions about any subject, get explanations, or request help with homework.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">Try asking:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 text-sm"
                        onClick={(e) => handleSubmit(e, question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              allMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-accent text-white ml-auto shadow-lg'
                          : 'bg-surface/80 backdrop-blur-sm border border-border shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground">
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
                                    className="rounded-lg"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={`${className} bg-muted px-1 py-0.5 rounded text-sm`} {...props}>
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
                        <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'assistant' && !((msg as StreamingMessage).isStreaming) && (
                      <div className="flex justify-start mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="h-8 px-2 text-xs opacity-70 hover:opacity-100"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && !streamingMessage && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                disabled={isLoading}
                className="flex-1 bg-background border-border focus:border-primary"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="premium-button px-4"
                loading={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}