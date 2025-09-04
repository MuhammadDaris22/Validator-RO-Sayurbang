import React, { useState, useRef, useEffect } from 'react';
import { getInvoiceInsights } from '../services/geminiService.ts';
import type { Invoice } from '../types.ts';

interface ChatInterfaceProps {
  invoices: Invoice[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiIcon = () => (
    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5z" />
            <path d="M9.043 10.213a.75.75 0 01.166.586v.5a1.5 1.5 0 003 0v-.5a.75.75 0 01.166-.586A3.5 3.5 0 0115.5 14H16a1 1 0 011 1v1.5a1.5 1.5 0 01-3 0V16a1 1 0 00-1-1h-.5a3.5 3.5 0 01-2.957-3.787zM6 10.5a1.5 1.5 0 013 0v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3H10a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V16a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H5a1 1 0 001-1v-.5z" />
        </svg>
    </div>
);

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ invoices }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await getInvoiceInsights(invoices, input);
    const aiMessage: Message = { sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const suggestions = [
    "Berapa total pendapatan akhir?",
    "Produk apa yang paling laris?",
    "Berapa total diskon yang diberikan?",
    "Siapa pelanggan dengan pembelian terbanyak?",
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Tanya AI Tentang Data Anda</h2>
      <div className="h-80 bg-slate-50 rounded-lg p-4 overflow-y-auto flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <AiIcon />}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
             {msg.sender === 'user' && <UserIcon />}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <AiIcon />
                <div className="max-w-md p-3 rounded-lg bg-slate-200 text-slate-800 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

       {messages.length === 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {suggestions.map(s => (
                <button key={s} onClick={() => handleSuggestionClick(s)} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-left">
                    {s}
                </button>
            ))}
          </div>
        )}

      <div className="mt-4 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pertanyaan Anda di sini..."
          className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400">
          Kirim
        </button>
      </div>
    </div>
  );
};
