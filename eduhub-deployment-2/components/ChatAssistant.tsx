import React, { useState, useRef, useEffect } from 'react';
import { getEduAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, X, Sparkles } from 'lucide-react';

interface ChatAssistantProps {
  onClose: () => void;
  academicContext?: any; // To pass marks data
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose, academicContext }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Dumela! I am the EduHub Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format context from academic marks if available
      let contextStr = '';
      if (academicContext && academicContext.subjects && Array.isArray(academicContext.subjects)) {
         const subjectList = academicContext.subjects.map((s: any) => `${s.name}: ${s.percentage}%`).join(', ');
         contextStr = `Student Marks: ${subjectList}.`;
      }

      const responseText = await getEduAdvice(userMsg.text, contextStr);
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm having trouble connecting. Please check your internet.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const requestCourseSuggestions = () => {
    if (academicContext) {
        handleSend("Based on my marks, which courses would you recommend I apply for?");
    } else {
        handleSend("I haven't entered my marks yet. Which courses are generally good for a student with strong Math skills?");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
         <button 
            onClick={requestCourseSuggestions}
            className="flex items-center whitespace-nowrap bg-white border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full hover:bg-amber-50 transition shadow-sm"
         >
            <Sparkles size={12} className="mr-1" /> Suggest Courses
         </button>
          <button 
            onClick={() => handleSend("How does APS work?")}
            className="whitespace-nowrap bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full hover:bg-slate-50 transition shadow-sm"
         >
            Explain APS
         </button>
      </div>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about marks, courses..."
            className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};