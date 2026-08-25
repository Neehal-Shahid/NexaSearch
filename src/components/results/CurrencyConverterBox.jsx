import { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';

const POPULAR_CURRENCIES = [
  "United States Dollar", "Pakistani Rupee", "Euro", "British Pound", "Indian Rupee", 
  "Emirati Dirham", "Canadian Dollar", "Australian Dollar", "Saudi Riyal", "Japanese Yen", 
  "Chinese Yuan", "Swiss Franc", "Singapore Dollar", "Hong Kong Dollar", "New Zealand Dollar",
  "Swedish Krona", "South Korean Won", "Turkish Lira", "Russian Ruble", "South African Rand",
  "Brazilian Real", "Mexican Peso", "Indonesian Rupiah", "Malaysian Ringgit", "Philippine Peso",
  "Thai Baht", "Vietnamese Dong", "Egyptian Pound", "Qatari Riyal", "Kuwaiti Dinar"
];

export default function CurrencyConverterBox({ data }) {
  const fromData = data.currency_converter.from;
  const toData = data.currency_converter.to;
  
  const initialRate = toData.price / fromData.price;

  const [fromCurrency, setFromCurrency] = useState(fromData.currency);
  const [toCurrency, setToCurrency] = useState(toData.currency);
  const [rate, setRate] = useState(initialRate);

  const [fromAmount, setFromAmount] = useState(fromData.price.toString());
  const [toAmount, setToAmount] = useState(toData.price.toString());
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const newRate = data.currency_converter.to.price / data.currency_converter.from.price;
    setFromCurrency(data.currency_converter.from.currency);
    setToCurrency(data.currency_converter.to.currency);
    setRate(newRate);
    setFromAmount(data.currency_converter.from.price.toString());
    setToAmount(data.currency_converter.to.price.toString());
  }, [data]);

  const fetchNewRate = async (from, to, currentFromAmount) => {
    if (from === to) {
      setRate(1);
      setToAmount(currentFromAmount);
      return;
    }
    
    setIsFetching(true);
    try {
      const requestBody = JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `1 ${from} to ${to}` }] }],
        systemInstruction: {
          parts: [{ text: `You are a currency exchange rate calculator. Return ONLY the numerical conversion rate (e.g. 30.5) from the first currency to the second currency. No currency symbols, no text, no commas.` }]
        },
        generationConfig: { temperature: 0.1 }
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
            if (modelText) {
              const parsedRate = parseFloat(modelText.trim());
              if (!isNaN(parsedRate)) {
                setRate(parsedRate);
                const parsedFrom = parseFloat(currentFromAmount);
                if (!isNaN(parsedFrom)) {
                  setToAmount((parsedFrom * parsedRate).toFixed(2));
                }
                break;
              }
            }
          }
        } catch (err) {
          // silent fallback
        }
      }
    } catch (err) {
      console.error('Failed to fetch rate:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFromChange = (e) => {
    const val = e.target.value;
    setFromAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setToAmount((parsed * rate).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setToAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setFromAmount((parsed / rate).toFixed(2));
    } else {
      setFromAmount('');
    }
  };

  const handleSwap = () => {
    const newFromCurrency = toCurrency;
    const newToCurrency = fromCurrency;
    // The "from" box should carry over what the "to" box was just showing —
    // not keep its own stale value under a new currency label. Previously
    // fromAmount was left untouched here, so swapping "100 USD = 27850 PKR"
    // produced "100 PKR = <bogus recompute>" instead of "27850 PKR = 100 USD".
    const newFromAmount = toAmount;

    setFromCurrency(newFromCurrency);
    setToCurrency(newToCurrency);
    setFromAmount(newFromAmount);

    // update rate locally for instant visual feedback
    const newRate = rate > 0 ? 1 / rate : 0;
    setRate(newRate);

    const parsed = parseFloat(newFromAmount);
    if (!isNaN(parsed)) {
      setToAmount((parsed * newRate).toFixed(2));
    } else {
      setToAmount('');
    }

    // fetch true rate via Gemini
    fetchNewRate(newFromCurrency, newToCurrency, newFromAmount);
  };

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs font-semibold text-accent uppercase tracking-wider">
          Currency Converter
        </div>
        {isFetching && (
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* From Box */}
        <div className={`flex-1 w-full bg-background border rounded-xl p-4 flex flex-col transition-all ${isFetching ? 'opacity-70 pointer-events-none border-border-subtle' : 'border-border-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent'}`}>
          <CustomSelect
            value={fromCurrency}
            options={POPULAR_CURRENCIES.includes(fromCurrency) ? POPULAR_CURRENCIES : [fromCurrency, ...POPULAR_CURRENCIES]}
            onChange={(newVal) => {
              setFromCurrency(newVal);
              fetchNewRate(newVal, toCurrency, fromAmount);
            }}
            className="text-xs font-semibold text-accent uppercase mb-1"
            ariaLabel="Select source currency"
          />
          <input
            type="number"
            value={fromAmount}
            onChange={handleFromChange}
            className="w-full bg-transparent border-none p-0 text-3xl font-light text-text-primary focus:ring-0"
            min="0"
          />
        </div>

        <button 
          type="button"
          onClick={handleSwap}
          className="text-text-muted hover:text-accent transition-colors shrink-0 hidden md:flex items-center justify-center p-2 rounded-full hover:bg-surface-secondary"
          title="Swap currencies"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* To Box */}
        <div className={`flex-1 w-full bg-background border rounded-xl p-4 flex flex-col transition-all ${isFetching ? 'opacity-70 pointer-events-none border-border-subtle' : 'border-border-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent'}`}>
          <CustomSelect
            value={toCurrency}
            options={POPULAR_CURRENCIES.includes(toCurrency) ? POPULAR_CURRENCIES : [toCurrency, ...POPULAR_CURRENCIES]}
            onChange={(newVal) => {
              setToCurrency(newVal);
              fetchNewRate(fromCurrency, newVal, fromAmount);
            }}
            className="text-xs font-semibold text-accent uppercase mb-1"
            ariaLabel="Select target currency"
          />
          <input
            type="number"
            value={toAmount}
            onChange={handleToChange}
            className="w-full bg-transparent border-none p-0 text-3xl font-light text-text-primary focus:ring-0"
            min="0"
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          1 {fromCurrency} = {rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
        </span>
        {data.date && <span className="text-xs text-text-muted">{data.date}</span>}
      </div>
    </div>
  );
}
