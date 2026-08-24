export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKeys = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean);
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (apiKeys.length === 0 && !geminiKey) {
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
          type: 'serpapi',
          keyName: i === 0 ? 'SerpAPI Primary' : 'SerpAPI Backup',
          ...data
        });
      }
    } catch (e) {
      console.error('Failed to fetch account info', e);
    }
  }

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      if (response.ok) {
        accounts.push({
          type: 'gemini',
          keyName: 'Gemini AI',
          account_email: 'Google AI Studio',
          account_status: 'Active',
          plan_name: 'Generative Language API',
          this_month_usage: 'N/A',
          searches_per_month: 'Tracked in GCP',
          account_rate_limit_per_hour: '15 RPM'
        });
      } else {
         accounts.push({
          type: 'gemini',
          keyName: 'Gemini AI',
          account_email: 'Google AI Studio',
          account_status: 'Invalid API Key',
          plan_name: 'Generative Language API'
        });
      }
    } catch (e) {
      console.error('Failed to fetch Gemini status', e);
    }
  }

  // Calculate totals across all rotated keys (only SerpAPI)
  const serpAccounts = accounts.filter(a => a.type === 'serpapi');
  const totalLimit = serpAccounts.reduce((sum, acc) => sum + (acc.searches_per_month || 0), 0);
  const totalUsage = serpAccounts.reduce((sum, acc) => sum + (acc.this_month_usage || 0), 0);
  const searchesLeft = serpAccounts.reduce((sum, acc) => sum + (acc.total_searches_left || 0), 0);

  // Return real API limits only
  return res.status(200).json({
    metrics: {
      totalLimit,
      totalUsage,
      searchesLeft,
      usagePercent: totalLimit > 0 ? ((totalUsage / totalLimit) * 100).toFixed(1) : 0,
      activeKeys: serpAccounts.length
    },
    accounts
  });
}
