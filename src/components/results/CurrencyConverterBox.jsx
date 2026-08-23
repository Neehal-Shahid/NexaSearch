import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const fromData = data.currency_converter.from;
  const toData = data.currency_converter.to;
  
  // Calculate exchange rate: 1 unit of "from" = X units of "to"
  const rate = toData.price / fromData.price;

  const [fromAmount, setFromAmount] = useState(fromData.price.toString());
  const [toAmount, setToAmount] = useState(toData.price.toString());

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

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-5">
        Currency Converter
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* From Box */}
        <div className="flex-1 w-full bg-background border border-border-subtle rounded-xl p-4 flex flex-col focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <CustomSelect
            value={fromData.currency}
            options={POPULAR_CURRENCIES.includes(fromData.currency) ? POPULAR_CURRENCIES : [fromData.currency, ...POPULAR_CURRENCIES]}
            onChange={(newVal) => navigate(`/search?q=1 ${newVal} to ${toData.currency}&type=web&page=1`)}
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

        <div className="text-text-muted shrink-0 hidden md:block">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        {/* To Box */}
        <div className="flex-1 w-full bg-background border border-border-subtle rounded-xl p-4 flex flex-col focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <CustomSelect
            value={toData.currency}
            options={POPULAR_CURRENCIES.includes(toData.currency) ? POPULAR_CURRENCIES : [toData.currency, ...POPULAR_CURRENCIES]}
            onChange={(newVal) => navigate(`/search?q=1 ${fromData.currency} to ${newVal}&type=web&page=1`)}
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
          1 {fromData.currency} = {rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toData.currency}
        </span>
        {data.date && <span className="text-xs text-text-muted">{data.date}</span>}
      </div>
    </div>
  );
}
