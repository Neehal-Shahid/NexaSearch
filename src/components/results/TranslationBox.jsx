import { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';

const LANGUAGES = [
  "English", "Urdu", "Spanish", "French", "German", "Arabic", "Hindi", "Chinese", 
  "Japanese", "Russian", "Portuguese", "Italian", "Korean", "Turkish", "Dutch", 
  "Polish", "Indonesian", "Vietnamese", "Thai", "Persian", "Bengali", "Punjabi", 
  "Marathi", "Telugu", "Tamil", "Gujarati", "Swahili", "Hausa", "Yoruba", "Zulu",
  "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Czech", "Hungarian", "Romanian"
].sort();

export default function TranslationBox({ data }) {
  const [sourceText, setSourceText] = useState(data.source.text);
  const [sourceLang, setSourceLang] = useState(data.source.language || 'English');
  const [targetLang, setTargetLang] = useState(data.target.language || 'Urdu');
  const [translatedText, setTranslatedText] = useState(data.target.text);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Update local state when data changes (from URL params)
  useEffect(() => {
    setSourceText(data.source.text);
    setSourceLang(data.source.language || 'English');
    setTargetLang(data.target.language || 'Urdu');
    setTranslatedText(data.target.text);
  }, [data]);

  const performTranslation = async (text, from, to) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }
    if (from === to) {
      setTranslatedText(text);
      return;
    }
    setIsTranslating(true);
    try {
      const requestBody = JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }],
        systemInstruction: {
          parts: [{ text: `You are a professional translator. Translate the given text from ${from} to ${to}. Respond ONLY with the translated text, nothing else. No quotes, no explanations.` }]
        },
        generationConfig: { temperature: 0.1 } // low temperature for accurate translation
      });

      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];
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
            if (modelText) {
              setTranslatedText(modelText.trim());
              break;
            }
          }
        } catch (err) {
          // silent fallback
        }
      }

      if (!modelText) {
        console.error('Translation failed: All models exhausted.');
      }
    } catch (err) {
      console.error('Translation process failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslate = () => {
    performTranslation(sourceText, sourceLang, targetLang);
  };

  const handleSwap = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    performTranslation(translatedText, targetLang, tempLang);
  };

  const handleSourceLangChange = (newVal) => {
    setSourceLang(newVal);
    performTranslation(sourceText, newVal, targetLang);
  };

  const handleTargetLangChange = (newVal) => {
    setTargetLang(newVal);
    performTranslation(sourceText, sourceLang, newVal);
  };

  return (
    <div className="bg-surface rounded-xl border border-border-subtle mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-background rounded-t-xl">
        <div className="text-xs font-semibold text-accent uppercase tracking-wider">
          Translation
        </div>
        <div className="flex items-center gap-4">
          <CustomSelect
            value={sourceLang}
            options={LANGUAGES.includes(sourceLang) ? LANGUAGES : [sourceLang, ...LANGUAGES]}
            onChange={handleSourceLangChange}
            className="text-sm font-semibold text-text-primary"
            ariaLabel="Select source language"
          />
          
          <button 
            onClick={handleSwap}
            className="p-1.5 rounded-full hover:bg-surface-secondary text-text-muted hover:text-accent transition-colors"
            title="Swap languages"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <CustomSelect
            value={targetLang}
            options={LANGUAGES.includes(targetLang) ? LANGUAGES : [targetLang, ...LANGUAGES]}
            onChange={handleTargetLangChange}
            className="text-sm font-semibold text-text-primary"
            ariaLabel="Select target language"
          />
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle bg-background rounded-b-xl">
        <div className="relative group focus-within:ring-1 focus-within:ring-accent transition-all rounded-bl-xl">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            placeholder="Enter text to translate..."
            className="w-full h-40 p-6 bg-transparent border-none resize-none focus:ring-0 text-xl text-text-primary placeholder:text-text-muted rounded-bl-xl"
            spellCheck="false"
          />
          <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <button 
              onClick={handleTranslate}
              disabled={isTranslating}
              className="bg-accent text-white p-2 rounded-full hover:bg-accent-hover transition-colors shadow-md disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isTranslating ? (
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                )}
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 h-40 overflow-y-auto bg-surface-secondary rounded-br-xl relative">
          {isTranslating ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-accent/40 animate-bounce"></div>
                 <div className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                 <div className="w-2 h-2 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
               </div>
             </div>
          ) : (
            <p className="text-xl text-accent font-medium leading-relaxed" dir={targetLang === 'Urdu' || targetLang === 'Arabic' || targetLang === 'Persian' ? 'rtl' : 'ltr'}>
              {translatedText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
