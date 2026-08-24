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

  // Calculate generic content
  const content = data.snippet || data.answer || data.result || data.formula;
  const hasList = data.list && data.list.length > 0;

  // Do not render an empty box if SerpApi returns an unsupported widget with no text
  if (!content && !hasList) return null;

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 mb-6">
      {data.type && (
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          {data.type.replace(/_/g, ' ')}
        </div>
      )}
      
      {content && (
        <p className="text-lg font-medium text-text-primary leading-relaxed mb-2">
          {content}
        </p>
      )}

      {data.description && (
        <p className="text-sm text-text-secondary mb-2">{data.description}</p>
      )}
      
      {data.date && (
        <p className="text-sm text-text-secondary mb-4">{data.date}</p>
      )}

      {hasList && (
        <ul className="list-disc list-inside space-y-2 mb-4 text-text-primary">
          {data.list.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )}

      {(data.link || data.source) && (
        <div className="flex items-center gap-2 pt-4 border-t border-border-subtle mt-4">
          <span className="text-sm text-text-secondary">Source:</span>
          <a
            href={data.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {data.title || data.displayed_link || data.source?.name || data.link || 'Web Search'}
          </a>
        </div>
      )}
    </div>
  );
}
