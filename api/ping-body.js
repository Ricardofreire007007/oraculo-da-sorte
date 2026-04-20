export const config = {
  api: {
    bodyParser: false
  }
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  console.log('[ping-body] invocado', new Date().toISOString(), 'method:', req.method);
  try {
    const raw = await readRawBody(req);
    console.log('[ping-body] raw length:', raw.length);
    return res.status(200).json({
      pong: true,
      method: req.method,
      receivedBytes: raw.length,
      body: raw ? raw.substring(0, 200) : null
    });
  } catch (err) {
    console.error('[ping-body] erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
