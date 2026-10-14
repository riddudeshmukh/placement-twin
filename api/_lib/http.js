export function handler(fn) {
  return async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const out = await fn(req.body || {}, req);
      return res.status(200).json(out);
    } catch (err) {
      const status = err.status || 500;
      if (status === 500) console.error(err);
      return res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : err.message });
    }
  };
}
export const fail = (status, message) => { const e = new Error(message); e.status = status; return e; };
