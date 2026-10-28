const BASE = 'http://localhost:4000';

export async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('request failed');
  return res.json();
}