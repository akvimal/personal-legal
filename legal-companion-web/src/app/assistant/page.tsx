'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockChatMessages } from '@/lib/mock-data';
import { ChatMessage } from '@/types';
import {
  Send,
  Mic,
  Paperclip,
  Bot,
  User,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

const quickQuestions = [
  'When is my rent due?',
  'Contract expiry dates',
  'Leave balance',
  'Non-compete details',
  'Insurance coverage',
  'Salary components',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${inputValue}". Let me search through your documents to provide you with accurate information.

Based on my analysis of your documents, I'll need to review your agreements to give you a precise answer. Would you like me to look into specific documents?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Q&A</h1>
            <p className="text-sm text-gray-600 mt-1">
              Ask questions about your uploaded documents and get instant answers with citations
            </p>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-secondary'
                      : 'bg-primary'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-3xl ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  } flex flex-col`}
                >
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          📄 Sources:
                        </p>
                        {message.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-600 flex items-start gap-2"
                          >
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{source.documentTitle}</p>
                              {source.section && (
                                <p className="text-gray-500">
                                  {source.section}
                                  {source.page && `, Page ${source.page}`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {message.role === 'assistant' && message.sources && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <FileText className="h-3 w-3" />
                          View Document
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Find Lawyer
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {format(message.timestamp, 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 3 && (
            <div className="px-4 lg:px-8 pb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  💡 Quick Questions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickQuestion(question)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your question..."
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                      <Mic className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                ⚠️ This is general information based on your documents, not professional
                legal advice. Consult a qualified lawyer for specific advice.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
