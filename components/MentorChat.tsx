import React, { useState, useRef, useEffect } from 'react';
import { getMentorResponse } from '../services/geminiService';
import { ChatMessage, GameStage } from '../types';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface MentorChatProps {
  currentCode: string;
  stage: GameStage;
}

const MentorChat: React.FC<MentorChatProps> = ({ currentCode, stage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: '你好，学员！我是你的 AI 导师 Oracle。在编写代码遇到困难时，随时问我！' }
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
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const reply = await getMentorResponse([...messages, userMsg], currentCode, stage);
    
    setMessages(prev => [...prev, { role: 'model', content: reply }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center gap-2">
        <Bot className="w-5 h-5 text-accent-cyan" />
        <span className="font-bold text-sm text-gray-200">AI 导师通讯链路</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-purple-600' : 'bg-accent-cyan text-black'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-purple-900 text-gray-100' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-accent-cyan text-black flex items-center justify-center flex-shrink-0 animate-pulse">
               <Bot size={16} />
             </div>
             <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="询问 HTML 标签、CSS 属性..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-accent-cyan hover:bg-cyan-400 text-black px-3 py-2 rounded transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;