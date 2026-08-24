export default function WeatherBox({ data }) {
  if (!data || data.type !== 'weather_result') return null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">{data.location}</h2>
          <p className="text-blue-100 mt-1 font-medium">{data.date} • {data.weather}</p>
        </div>
        <div className="flex items-start gap-3">
          <svg className="w-12 h-12 text-yellow-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM2.25 12a.75.75 0 01.75-.75H5.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM5.106 6.166a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591z" />
          </svg>
          <div className="text-5xl font-light tracking-tighter">
            {data.temperature}°<span className="text-2xl text-blue-200">{data.unit === 'Fahrenheit' ? 'F' : 'C'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400/30">
        <div>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-1 font-bold">Precipitation</p>
          <p className="font-semibold text-sm">{data.precipitation || '0%'}</p>
        </div>
        <div>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-1 font-bold">Humidity</p>
          <p className="font-semibold text-sm">{data.humidity || '--'}</p>
        </div>
        <div>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-1 font-bold">Wind</p>
          <p className="font-semibold text-sm">{data.wind || '--'}</p>
        </div>
      </div>
    </div>
  );
}
