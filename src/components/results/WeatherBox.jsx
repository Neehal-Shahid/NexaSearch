export default function WeatherBox({ data }) {
  if (!data || data.type !== 'weather_result') return null;

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 mb-6 shadow-sm overflow-hidden relative">
      {/* Subtle decorative background element to keep it visually interesting but on-brand */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{data.location}</h2>
          <p className="text-text-secondary mt-1 font-medium">{data.date} • <span className="text-accent">{data.weather}</span></p>
        </div>
        <div className="flex items-start gap-3">
          <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
          <div className="text-5xl font-light tracking-tighter text-text-primary">
            {data.temperature}°<span className="text-2xl text-text-muted">{data.unit === 'Fahrenheit' ? 'F' : 'C'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-5 border-t border-border-subtle relative z-10">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-bold">Precipitation</p>
          <p className="font-semibold text-sm text-text-primary">{data.precipitation || '0%'}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-bold">Humidity</p>
          <p className="font-semibold text-sm text-text-primary">{data.humidity || '--'}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-bold">Wind</p>
          <p className="font-semibold text-sm text-text-primary">{data.wind || '--'}</p>
        </div>
      </div>
    </div>
  );
}
