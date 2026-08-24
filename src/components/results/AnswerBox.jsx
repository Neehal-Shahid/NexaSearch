import CurrencyConverterBox from './CurrencyConverterBox';
import TranslationBox from './TranslationBox';
import WeatherBox from './WeatherBox';

export default function AnswerBox({ data }) {
  if (!data) return null;

  if (data.type === 'weather_result') {
    return <WeatherBox data={data} />;
  }

  if (data.type === 'currency_converter' && data.currency_converter) {
    return <CurrencyConverterBox data={data} />;
  }

  if (data.type === 'translation_result' || (data.source && data.target)) {
    return <TranslationBox data={data} />;
  }

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 mb-6">
      {data.type && (
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          {data.type.replace(/_/g, ' ')}
        </div>
      )}
      
      {data.snippet && (
        <p className="text-lg text-text-primary leading-relaxed mb-4">
          {data.snippet}
        </p>
      )}

      {data.list && data.list.length > 0 && (
        <ul className="list-disc list-inside space-y-2 mb-4 text-text-primary">
          {data.list.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border-subtle">
        <span className="text-sm text-text-secondary">Source:</span>
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          {data.title || data.displayed_link || data.link}
        </a>
      </div>
    </div>
  );
}
