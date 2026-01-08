// API Route: /api/coinglass/[...path].js
// Proxies all requests to CoinGlass API with server-side authentication

export default async function handler(req, res) {
  // Get the path segments after /api/coinglass/
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  // Build the CoinGlass API URL
  const coinglassUrl = `https://open-api-v4.coinglass.com/api/${apiPath}`;
  
  // Get query parameters (excluding 'path' which is used for routing)
  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      queryParams.append(key, value);
    }
  });
  
  const fullUrl = queryParams.toString() 
    ? `${coinglassUrl}?${queryParams.toString()}`
    : coinglassUrl;

  console.log(`[CoinGlass Proxy] ${req.method} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'CG-API-KEY': process.env.COINGLASS_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Forward body for POST requests
      ...(req.method === 'POST' && req.body ? { body: JSON.stringify(req.body) } : {}),
    });

    const data = await response.json();
    
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return the CoinGlass response
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('[CoinGlass Proxy] Error:', error.message);
    res.status(500).json({ 
      code: '-1', 
      msg: `Proxy error: ${error.message}`,
      data: null 
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export const config = {
  api: {
    bodyParser: true,
  },
};
