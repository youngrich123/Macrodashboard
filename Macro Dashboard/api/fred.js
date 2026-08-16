const MAX_IDS = 30;
const ID_RE = /^[A-Z0-9._-]{1,64}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.FRED_API_KEY;
  if (!key) return res.status(500).json({ error: 'FRED_API_KEY is not configured on the server' });

  const rawIds = String(req.query.ids || '').toUpperCase();
  const ids = [...new Set(rawIds.split(',').map(s => s.trim()).filter(Boolean))];
  if (!ids.length || ids.length > MAX_IDS || ids.some(id => !ID_RE.test(id))) {
    return res.status(400).json({ error: `Provide 1-${MAX_IDS} valid FRED series ids` });
  }

  const start = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.start || ''))
    ? String(req.query.start)
    : '2017-01-01';

  const data = {};
  const errors = {};

  await Promise.all(ids.map(async (id) => {
    const u = new URL('https://api.stlouisfed.org/fred/series/observations');
    u.searchParams.set('series_id', id);
    u.searchParams.set('api_key', key);
    u.searchParams.set('file_type', 'json');
    u.searchParams.set('observation_start', start);
    u.searchParams.set('sort_order', 'asc');

    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'macro-dashboard/3.0' } });
      if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
      const j = await r.json();
      const obs = Array.isArray(j.observations) ? j.observations
        .filter(o => o && o.value !== '.' && Number.isFinite(Number(o.value)))
        .map(o => ({ date: o.date, value: Number(o.value) })) : [];
      if (obs.length) data[id] = obs;
      else errors[id] = 'No observations';
    } catch (e) {
      errors[id] = e && e.message ? e.message : 'Fetch failed';
    }
  }));

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
  return res.status(200).json({ data, errors, fetchedAt: new Date().toISOString() });
};
