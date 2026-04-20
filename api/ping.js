export default function handler(req, res) {
  console.log('[ping] invocado', new Date().toISOString());
  res.status(200).json({ pong: true, method: req.method, ts: Date.now() });
}
