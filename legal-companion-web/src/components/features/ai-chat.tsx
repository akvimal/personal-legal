'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ChatMessage } from '@/lib/ai-service';
import { CitationCard } from './citation-card';

interface AIChatProps {
  documentId?: string;
  documentTitle?: string;
  initialMessages?: ChatMessage[];
  onMessageSent?: (message: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface Citation {
  documentId: string;
  documentTitle: string;
  excerpt?: string;
  page?: number;
  url?: string;
}

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Citation[];
}

export function AIChat({
  documentId,
  documentTitle,
  initialMessages = [],
  onMessageSent,
  onError,
  className = '',
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((msg, idx) => ({
      ...msg,
      id: `initial-${idx}`,
      timestamp: new Date(),
    }))
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Clear input and error
    setInput('');
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    onMessageSent?.(trimmedInput);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedInput,
          documentId,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Failed to get AI response'
        );
      }

      const data = await response.json();

      // Parse sources if available
      let sources: Citation[] | undefined;
      if (data.data.document) {
        sources = [
          {
            documentId: data.data.document.id,
            documentTitle: data.data.document.title,
            url: `/documents/${data.data.document.id}`,
          },
        ];
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
        sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              AI Legal Assistant
            </h2>
            {documentTitle && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Discussing: {documentTitle}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Ask questions about {documentTitle || 'legal matters'}, get
              document analysis, or request legal guidance.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p className="font-medium">Try asking:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>What are the key obligations in this document?</li>
                <li>When are the important deadlines?</li>
                <li>What are the potential risks I should be aware of?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    AI Assistant
                  </span>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap m-0">{message.content}</p>
              </div>
              {message.isStreaming && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              )}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <CitationCard citations={message.sources} />
              )}
            </div>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-lg px-4 py-3 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-[85%] rounded-lg px-4 py-3 bg-red-50 border border-red-200">
              <div className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                documentTitle
                  ? `Ask about ${documentTitle}...`
                  : 'Ask a legal question...'
              }
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-6 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <div className="mt-2 text-xs text-gray-500 text-center">
          AI can make mistakes. Always consult a licensed attorney for legal
          advice.
        </div>
      </div>
    </div>
  );
}
