export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY no configurada' });
  }

  const { system, messages } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 800,
        system,
        messages,
      }),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { return res.status(502).json({ error: 'Respuesta inválida de Anthropic' }); }

    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Error Anthropic' });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
