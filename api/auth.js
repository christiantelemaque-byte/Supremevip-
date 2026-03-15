export default async function handler(req, res) {
  // Allow your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://supremevip.mooo.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, fullName } = req.body;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  try {
    let endpoint = '';
    let body = {};

    if (action === 'signup') {
      endpoint = `${supabaseUrl}/auth/v1/signup`;
      body = {
        email,
        password,
        data: { full_name: fullName }
      };
    } else if (action === 'login') {
      endpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
      body = {
        email,
        password
      };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
