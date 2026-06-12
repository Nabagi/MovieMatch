const TMDB_API_BASE = 'https://api.themoviedb.org/3';

const allowedPaths = [
  /^\/discover\/movie$/,
  /^\/movie\/(popular|top_rated|now_playing)$/,
  /^\/movie\/\d+\/images$/,
];

exports.handler = async (event) => {
  try {
    const token = process.env.TMDB_TOKEN;
    if (!token) {
      return response(500, { error: 'Missing TMDB_TOKEN environment variable.' });
    }

    const path = event.queryStringParameters?.path || '';
    if (!path.startsWith('/')) {
      return response(400, { error: 'Missing or invalid TMDB path.' });
    }

    const tmdbUrl = new URL(`${TMDB_API_BASE}${path}`);

    const isAllowed = allowedPaths.some((rx) => rx.test(tmdbUrl.pathname));
    if (!isAllowed) {
      return response(403, { error: 'This TMDB endpoint is not allowed by the proxy.' });
    }

    const tmdbRes = await fetch(tmdbUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });

    const body = await tmdbRes.text();

    return {
      statusCode: tmdbRes.status,
      headers: {
        'content-type': tmdbRes.headers.get('content-type') || 'application/json',
        'cache-control': 'public, max-age=300',
      },
      body,
    };
  } catch (err) {
    return response(500, { error: 'TMDB proxy failed.', details: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
