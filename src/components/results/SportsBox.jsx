export default function SportsBox({ data }) {
  if (!data || !data.game_spotlight) return null;
  const game = data.game_spotlight;
  
  if (!game.teams || game.teams.length !== 2) return null;

  return (
    <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-background/50 flex justify-between items-center">
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Sports Match
          </div>
          <div className="text-sm font-medium text-text-secondary">
            {game.stage || game.tournament} {game.stadium ? `· ${game.stadium}` : ''}
          </div>
        </div>
        {game.date && (
          <div className="text-xs font-bold px-3 py-1.5 bg-surface border border-border-subtle rounded-full text-text-primary">
            {game.date}
          </div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="p-6">
        <div className="flex flex-col gap-6">
          {game.teams.map((team, index) => (
            <div key={team.name || index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {team.thumbnail ? (
                  <img src={team.thumbnail} alt={team.name} className="w-10 h-10 object-contain rounded-md" />
                ) : (
                  <div className="w-10 h-10 bg-border-subtle rounded-md flex items-center justify-center">
                    <span className="text-xs text-text-muted">{team.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="text-2xl font-bold text-text-primary">{team.name}</span>
              </div>
              <div className="text-3xl font-light text-text-primary">
                {team.score || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Video Highlights */}
      {game.video_highlight_carousel && game.video_highlight_carousel.length > 0 && (
        <div className="px-6 py-4 border-t border-border-subtle bg-background/50">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Highlights</div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {game.video_highlight_carousel.map((video, idx) => (
              <a key={idx} href={video.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-48 group">
                <div className="relative h-28 rounded-lg overflow-hidden mb-2 bg-surface-secondary">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {video.duration}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors">{video.title}</h4>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Games */}
      {data.games && data.games.length > 0 && (
        <div className="px-6 py-4 border-t border-border-subtle bg-surface">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Upcoming Matches</div>
          <div className="space-y-3">
            {data.games.slice(0, 3).map((upcoming, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium text-text-primary w-24 truncate">{upcoming.teams?.[0]?.name}</span>
                  <span className="text-text-muted text-xs font-bold">VS</span>
                  <span className="font-medium text-text-primary w-24 truncate">{upcoming.teams?.[1]?.name}</span>
                </div>
                <div className="text-right flex-1">
                  <div className="font-medium text-text-secondary text-xs">{upcoming.date}</div>
                  <div className="text-text-muted text-[11px] truncate">{upcoming.status || upcoming.venue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
