const DEFAULT_VERCEL = 'https://sodon-sondor.vercel.app';
// Capacitor Android WebView uses these origins
const CAPACITOR_ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost'];

function parseOriginsList(raw) {
  return String(raw || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function getCorsOrigins() {
  const fromEnv = parseOriginsList(process.env.CLIENT_URL);
  if (process.env.NODE_ENV === 'production') {
    return [...new Set([DEFAULT_VERCEL, ...CAPACITOR_ORIGINS, ...fromEnv])];
  }
  if (fromEnv.length) return [...fromEnv, ...CAPACITOR_ORIGINS];
  return ['http://localhost:5173', ...CAPACITOR_ORIGINS];
}

function getPrimaryClientUrl() {
  const first = parseOriginsList(process.env.CLIENT_URL)[0];
  if (first) return first;
  return process.env.NODE_ENV === 'production' ? DEFAULT_VERCEL : 'http://localhost:5173';
}

function corsOriginCallback() {
  const allowed = getCorsOrigins();
  return (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);
    if (allowed.includes(requestOrigin)) return callback(null, true);
    if (
      process.env.NODE_ENV === 'production' &&
      requestOrigin &&
      /^https:\/\/.+\.vercel\.app$/i.test(requestOrigin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  };
}

module.exports = {
  getCorsOrigins,
  getPrimaryClientUrl,
  corsOriginCallback,
};
