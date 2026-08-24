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

            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <h2 className="text-lg font-bold text-text-primary mb-4">Connected API Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.accounts.map((acc, i) => (
                  <div key={i} className={`bg-surface border border-border-subtle rounded-xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md ${acc.type === 'gemini' ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-emerald-500'}`}>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          {acc.type === 'gemini' ? (
                            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                          )}
                          <p className="text-sm font-bold text-text-primary">{acc.keyName}</p>
                        </div>
                        <p className="text-xs font-medium text-text-muted mt-1 ml-6">{acc.account_email}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide ${acc.account_status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {acc.account_status || 'Active'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mt-6 pt-5 border-t border-border-subtle relative z-10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">Service Plan</span>
                        <span className="font-semibold text-text-primary bg-surface-secondary px-2 py-0.5 rounded">{acc.plan_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">Usage</span>
                        <span className="font-semibold text-text-primary">
                          {acc.this_month_usage} {acc.searches_per_month && acc.searches_per_month !== 'Tracked in GCP' ? `/ ${acc.searches_per_month}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary font-medium">Rate Limit</span>
                        <span className="font-semibold text-text-primary">
                          {acc.account_rate_limit_per_hour}{acc.account_rate_limit_per_hour !== '15 RPM' ? '/hr' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
