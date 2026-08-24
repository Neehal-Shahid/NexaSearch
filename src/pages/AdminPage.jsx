import { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Admin Dashboard — Nexa Search';
    window.scrollTo(0, 0);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background min-h-screen">
      <PageContainer className="py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
            <p className="text-sm text-text-muted mt-1">Platform analytics & API limits</p>
          </div>
          <button 
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 bg-surface rounded-lg border border-border-subtle hover:bg-surface-secondary transition-colors group disabled:opacity-50"
            title="Refresh Data"
          >
            <svg className={`w-5 h-5 text-text-secondary group-hover:text-accent ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-500 font-medium mb-4">Error loading dashboard: {error}</p>
            <button onClick={fetchAdminData} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors">
              Try Again
            </button>
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Total Limit</p>
                <p className="text-2xl font-bold text-text-primary">{data.metrics.totalLimit.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">Across {data.metrics.activeKeys} active keys</p>
              </div>
              <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Searches Used</p>
                <p className="text-2xl font-bold text-accent">{data.metrics.totalUsage.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">This month</p>
              </div>
              <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Searches Left</p>
                <p className="text-2xl font-bold text-emerald-500">{data.metrics.searchesLeft.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">Available capacity</p>
              </div>
              <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Usage</p>
                <p className="text-2xl font-bold text-text-primary">{data.metrics.usagePercent}%</p>
                <div className="w-full bg-background rounded-full h-1.5 mt-2 overflow-hidden border border-border-subtle">
                  <div className={`h-1.5 rounded-full ${data.metrics.usagePercent > 80 ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${data.metrics.usagePercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* API Keys Details */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-bold text-text-primary mb-4">API Accounts</h2>
                {data.accounts.map((acc, i) => (
                  <div key={i} className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{acc.keyName}</p>
                        <p className="text-xs text-text-muted">{acc.account_email}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase tracking-wide">
                        {acc.account_status || 'Active'}
                      </span>
                    </div>
                    <div className="space-y-2 mt-4 pt-4 border-t border-border-subtle">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Plan:</span>
                        <span className="font-medium text-text-primary">{acc.plan_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Usage:</span>
                        <span className="font-medium text-text-primary">{acc.this_month_usage} / {acc.searches_per_month}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Rate Limit:</span>
                        <span className="font-medium text-text-primary">{acc.account_rate_limit_per_hour}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity & Top Queries */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-text-primary">Live Search Feed</h2>
                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      LIVE
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.recentActivity.map((activity, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-surface-secondary transition-colors border border-transparent hover:border-border-subtle">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{activity.type.substring(0,3)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">"{activity.query}"</p>
                            <p className="text-xs text-text-muted mt-0.5">{activity.time} • {activity.type} search</p>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right pl-14 sm:pl-0">
                          <span className="px-2 py-1 bg-surface-secondary border border-border-subtle text-text-secondary text-[10px] font-bold rounded uppercase tracking-wide">
                            {activity.ms}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-text-primary mb-5">Top Queries (30 Days)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.topQueries.map((tq, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-background border border-border-subtle rounded-lg">
                        <span className="text-sm font-medium text-text-primary truncate pr-4">{tq.query}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-emerald-500">{tq.trend}</span>
                          <span className="text-sm font-bold text-text-secondary bg-surface-secondary border border-border-subtle px-2 py-0.5 rounded">{tq.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
