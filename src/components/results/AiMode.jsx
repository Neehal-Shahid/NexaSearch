import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parseMarkdown } from '../../utils/markdown';

export default function AiMode({ data, query }) {
  const location = useLocation();
  const initialHistory = location.state?.chatHistory || [];
  
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll logic. Use a slight timeout to ensure DOM paints first
  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [chatHistory, isTyping]);

  const fetchAttemptedRef = useRef(false);

  // Auto-trigger response if we arrived with an empty chat or a pending user question
  useEffect(() => {
    if (chatHistory.length === 0 && data && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      // We don't have a user question yet, so we act as if the user asked their search query
      const initialHistory = [{ role: 'user', content: `Please provide a comprehensive AI overview for my search query: "${query}"` }];
      setChatHistory(initialHistory);
      fetchResponse(initialHistory);
    } else if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      fetchResponse(chatHistory);
    }
  }, [data, query]);

  const fetchResponse = async (historyToSend) => {
    setIsTyping(true);
    try {
      const searchContext = data?.organic_results?.slice(0, 5).map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n') || '';
      
      const formattedContents = historyToSend.map((msg, index) => {
        let text = msg.content;
        if (index === 0) {
          text = `Context from web search for query "${query}":\n${searchContext}\n\nUser Question/Context: ${text}`;
        }
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text }]
        };
      });

      const requestBody = JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: "You are Nexa AI, an intelligent search assistant. Use the provided search context to answer the user's questions if relevant. If the context does not contain the answer, or if the user asks a general question, use your own knowledge to help them. Keep answers readable, concise, and use markdown (like **bold** and * lists)." }]
        },
        generationConfig: { temperature: 0.7 }
      });

      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
      let modelText = null;

      for (const model of modelsToTry) {
        try {
          const response = await fetch(`/api/chat?model=${model}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          });
          if (response.ok) {
            const result = await response.json();
            modelText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (modelText) break;
          } else {
            const errText = await response.text();
            console.error(`Model ${model} failed with status ${response.status}:`, errText);
            throw new Error(`API Error: ${response.status} - ${errText.substring(0, 50)}...`);
          }
        } catch (err) {
          console.error('Fetch error for model', model, err);
          if (err.message.includes('API Error')) throw err; // rethrow API errors
        }
      }

      if (!modelText) throw new Error("Failed to connect or received empty response from AI");
      
      setChatHistory(prev => [...prev, { role: 'model', content: modelText }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', content: `I encountered an error connecting to the AI. Details: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    
    fetchResponse(newHistory);
  };

  const handleChatClick = (e) => {
    const copyBtn = e.target.closest('.copy-code-btn');
    if (copyBtn) {
      const code = decodeURIComponent(copyBtn.getAttribute('data-code') || '');
      navigator.clipboard.writeText(code).then(() => {
        const span = copyBtn.querySelector('span');
        const originalText = span.innerText;
        span.innerText = 'Copied!';
        copyBtn.classList.add('text-green-500');
        
        setTimeout(() => {
          span.innerText = originalText;
          copyBtn.classList.remove('text-green-500');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto w-full bg-background">
      {/* Chat History Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent"
        onClick={handleChatClick}
      >
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start w-full'}`}>
            <div className={`rounded-2xl px-6 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'max-w-[85%] bg-surface-secondary text-text-primary rounded-tr-sm border border-border-subtle' 
                : 'w-full bg-white border border-border-subtle text-text-primary'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-3 text-accent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-[0.15em]">Nexa AI</span>
                </div>
              )}
              {msg.role === 'user' ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div 
                  className="text-[15px] leading-relaxed text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                />
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-border-subtle rounded-2xl px-6 py-5 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/40 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 shrink-0 bg-background/80 backdrop-blur-sm border-t border-border-subtle z-10">
        <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Follow up with Nexa AI..."
            className="w-full bg-white border border-border-subtle rounded-full py-4 pl-6 pr-16 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent shadow-[0_2px_15px_rgb(0,0,0,0.04)] text-text-primary placeholder:text-text-muted transition-all"
            disabled={isTyping}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2.5 rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4 translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
