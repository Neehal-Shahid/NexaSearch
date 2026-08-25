import { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Toast from '../components/ui/Toast';
import { clearSearchCache } from '../api/searchClient';
import { FEATURE_FLAGS } from '../constants';

const ADMIN_KEY_SESSION_STORAGE = 'nexa_admin_key';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gate: /api/admin exposes account emails and usage data, so it requires a
  // shared secret (ADMIN_SECRET env var) sent as the x-admin-key header.
  // The key is kept in sessionStorage only (cleared when the tab closes),
  // not localStorage, since it's closer to a credential than a preference.
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_SESSION_STORAGE) || '');
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState(null);

  // Feature flags — real state instead of reading localStorage inline in JSX
  // on every render (which previously needed a "force re-render" hack to
  // reflect changes at all).
  const [disableAi, setDisableAi] = useState(() => localStorage.getItem(FEATURE_FLAGS.DISABLE_AI) === 'true');
  const [disableMediaPacks, setDisableMediaPacks] = useState(() => localStorage.getItem(FEATURE_FLAGS.DISABLE_MEDIA_PACKS) === 'true');
  const [primaryKeyPref, setPrimaryKeyPref] = useState(() => localStorage.getItem(FEATURE_FLAGS.PRIMARY_KEY_PREF) || '1');

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    document.title = 'Admin Dashboard — Nexa Search';
    window.scrollTo(0, 0);
    if (adminKey) {
      fetchAdminData(adminKey);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminData = async (key) => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(null);
      const res = await fetch('/api/admin', { headers: { 'x-admin-key': key } });

      if (res.status === 401) {
        sessionStorage.removeItem(ADMIN_KEY_SESSION_STORAGE);
        setAdminKey('');
        setAuthed(false);
        setAuthError('Invalid admin key.');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }

      const json = await res.json();
      setAuthed(true);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem(ADMIN_KEY_SESSION_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
    fetchAdminData(keyInput.trim());
  };

  const toggleFlag = (flagKey, currentlyEnabled, setter) => {
    if (currentlyEnabled) {
      localStorage.removeItem(flagKey);
    } else {
      localStorage.setItem(flagKey, 'true');
    }
    setter(!currentlyEnabled);
  };

  const handlePrimaryKeyChange = (value) => {
    if (value === '1') {
      localStorage.removeItem(FEATURE_FLAGS.PRIMARY_KEY_PREF);
    } else {
      localStorage.setItem(FEATURE_FLAGS.PRIMARY_KEY_PREF, value);
    }
    setPrimaryKeyPref(value);
  };

  // Not authenticated yet — show the key gate instead of the dashboard.
  if (!authed) {
    return (
      <main className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <PageContainer className="py-8 max-w-sm">
          <form onSubmit={handleUnlock} className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h1 className="text-lg font-bold text-text-primary">Admin Access</h1>
              <p className="text-sm text-text-muted mt-1">Enter the admin key to view the dashboard.</p>
            </div>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              autoFocus
              className="w-full bg-background border border-border-subtle rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {(authError || (error && !loading)) && (
              <p className="text-sm text-red-500">{authError || error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !keyInput.trim()}
              className="w-full px-4 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Unlock'}
            </button>
          </form>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background min-h-screen">
      <PageContainer className="py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
            <p className="text-sm text-text-muted mt-1">Platform analytics & API limits</p>
          </div>
          <button
            onClick={() => fetchAdminData(adminKey)}
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
            <button onClick={() => fetchAdminData(adminKey)} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors">
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

            <div className="space-y-4 pt-8 border-t border-border-subtle mt-10">
              <h2 className="text-lg font-bold text-text-primary mb-4">Local Platform Controls</h2>
              <p className="text-xs text-text-muted -mt-3 mb-4">
                These toggles are stored in this browser only — they don't affect any other visitor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Feature Flags */}
                <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
                  <h3 className="text-md font-bold text-text-primary mb-4">Feature Flags</h3>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-surface-secondary cursor-pointer transition-colors">
                      <div>
                        <p className="font-semibold text-text-primary text-sm">Enable AI Mode</p>
                        <p className="text-xs text-text-muted mt-0.5">Show AI Overview and AI Chat features</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-accent rounded focus:ring-accent accent-accent"
                        checked={!disableAi}
                        onChange={() => toggleFlag(FEATURE_FLAGS.DISABLE_AI, disableAi, setDisableAi)}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-surface-secondary cursor-pointer transition-colors">
                      <div>
                        <p className="font-semibold text-text-primary text-sm">Enable Inline Media Packs</p>
                        <p className="text-xs text-text-muted mt-0.5">Show Images, News, and Videos inside Web results</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-accent rounded focus:ring-accent accent-accent"
                        checked={!disableMediaPacks}
                        onChange={() => toggleFlag(FEATURE_FLAGS.DISABLE_MEDIA_PACKS, disableMediaPacks, setDisableMediaPacks)}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-surface-secondary cursor-pointer transition-colors">
                      <div>
                        <p className="font-semibold text-text-primary text-sm">Primary SerpAPI Key</p>
                        <p className="text-xs text-text-muted mt-0.5">Force the search to use the backup key first</p>
                      </div>
                      <select
                        className="bg-surface-secondary border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block p-2"
                        value={primaryKeyPref}
                        onChange={(e) => handlePrimaryKeyChange(e.target.value)}
                      >
                        <option value="1">Key 1 (Default)</option>
                        <option value="2">Key 2 (Backup)</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Cache Management */}
                <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
                  <h3 className="text-md font-bold text-text-primary mb-4">Memory Cache</h3>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    Nexa uses an aggressive in-memory caching system to reduce API calls to SerpApi.
                    If you are experiencing stale results or want to force fresh fetches, you can purge the global cache here.
                  </p>

                  <button
                    onClick={() => {
                      clearSearchCache();
                      setToastMessage('Global search cache purged successfully!');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Purge Global Cache
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </PageContainer>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}
