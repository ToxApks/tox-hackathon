import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../components/ui/Card';
import { mentorChatService } from '../services/geminiService';
import { MessageSquare, Send, Sparkles, User, Bot, BookOpen, HelpCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';

export const AIMentor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your AI Mentor. I'm here to help you with your studies, answer questions about your topics, provide explanations, and guide you through your learning journey. What would you like to learn today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const modelResponse = await mentorChatService(input, messages.slice(-10), { userProgress: 0 });
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Error in mentor chat", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Explain this concept simply",
    "Give me a practice question",
    "What are the key points?",
    "How does this relate to real life?"
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Mentor</h2>
        </div>
        <p className="text-gray-500 text-lg">Your personal learning assistant, available 24/7</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat with Your Mentor
              </h3>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400 border border-gray-100'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your mentor anything..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Quick Questions
            </h4>
            <div className="space-y-2">
              {quickQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100 text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Learning Tips
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <p>💡 Ask specific questions about concepts you're struggling with</p>
              <p>📚 Request examples or analogies for complex topics</p>
              <p>🎯 Ask for practice questions to test your understanding</p>
              <p>🔗 Connect new concepts to things you already know</p>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-green-500" />
              Need Help?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              I'm here to help with:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Explaining difficult concepts</li>
              <li>• Answering questions</li>
              <li>• Providing study tips</li>
              <li>• Creating practice questions</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};