import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../ui/CustomSelect';

const LANGUAGES = [
  "English", "Urdu", "Spanish", "French", "German", "Arabic", "Hindi", "Chinese", 
  "Japanese", "Russian", "Portuguese", "Italian", "Korean", "Turkish", "Dutch", 
  "Polish", "Indonesian", "Vietnamese", "Thai", "Persian", "Bengali", "Punjabi", 
  "Marathi", "Telugu", "Tamil", "Gujarati", "Swahili", "Hausa", "Yoruba", "Zulu",
  "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Czech", "Hungarian", "Romanian"
].sort();

export default function TranslationBox({ data }) {
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState(data.source.text);
  const [sourceLang, setSourceLang] = useState(data.source.language || 'English');
  const [targetLang, setTargetLang] = useState(data.target.language || 'Urdu');
  
  // Update local state when data changes (from URL params)
  useEffect(() => {
    setSourceText(data.source.text);
    setSourceLang(data.source.language || 'English');
    setTargetLang(data.target.language || 'Urdu');
  }, [data]);

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    navigate(`/search?q=translate ${encodeURIComponent(sourceText)} from ${sourceLang} to ${targetLang}&type=web&page=1`);
  };

  const handleSwap = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    navigate(`/search?q=translate ${encodeURIComponent(data.target.text)} from ${targetLang} to ${sourceLang}&type=web&page=1`);
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
            onChange={(newVal) => {
              setSourceLang(newVal);
              navigate(`/search?q=translate ${encodeURIComponent(sourceText)} to ${newVal}&type=web&page=1`);
            }}
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
            onChange={(newVal) => {
              setTargetLang(newVal);
              navigate(`/search?q=translate ${encodeURIComponent(sourceText)} to ${newVal}&type=web&page=1`);
            }}
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
              className="bg-accent text-white p-2 rounded-full hover:bg-accent-hover transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 h-40 overflow-y-auto bg-surface-secondary rounded-br-xl">
          <p className="text-xl text-accent font-medium leading-relaxed">
            {data.target.text}
          </p>
        </div>
      </div>
    </div>
  );
}
