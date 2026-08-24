export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKeys = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean);
  
  if (apiKeys.length === 0) {
    return res.status(500).json({ error: 'No API keys configured' });
  }

  const accounts = [];
  
  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const response = await fetch(`https://serpapi.com/account?api_key=${apiKeys[i]}`);
      if (response.ok) {
        const data = await response.json();
        // Remove the API key from the response for security
        delete data.api_key;
        accounts.push({
          keyName: i === 0 ? 'Primary Key (SERPAPI_KEY)' : 'Backup Key (SERPAPI_KEY_2)',
          ...data
        });
      }
    } catch (e) {
      console.error('Failed to fetch account info', e);
    }
  }

  // Calculate totals across all rotated keys
  const totalLimit = accounts.reduce((sum, acc) => sum + (acc.searches_per_month || 0), 0);
  const totalUsage = accounts.reduce((sum, acc) => sum + (acc.this_month_usage || 0), 0);
  const searchesLeft = accounts.reduce((sum, acc) => sum + (acc.total_searches_left || 0), 0);

  // Return real API limits and some simulated portfolio analytics
  return res.status(200).json({
    metrics: {
      totalLimit,
      totalUsage,
      searchesLeft,
      usagePercent: totalLimit > 0 ? ((totalUsage / totalLimit) * 100).toFixed(1) : 0,
      activeKeys: accounts.length
    },
    accounts,
    recentActivity: [
      { id: 1, query: "coffee shops near me", type: "local", time: "Just now", status: "success", ms: 843 },
      { id: 2, query: "hospitals near me", type: "local", time: "5 mins ago", status: "success", ms: 912 },
      { id: 3, query: "translate to urdu", type: "web", time: "12 mins ago", status: "success", ms: 1204 },
      { id: 4, query: "best laptops 2026", type: "shopping", time: "1 hour ago", status: "success", ms: 645 },
      { id: 5, query: "how to learn react", type: "videos", time: "3 hours ago", status: "success", ms: 1102 }
    ],
    topQueries: [
      { query: "weather", count: 124, trend: "+12%" },
      { query: "news", count: 89, trend: "+5%" },
      { query: "translation", count: 56, trend: "+18%" },
      { query: "local restaurants", count: 42, trend: "-2%" },
    ]
  });
}
