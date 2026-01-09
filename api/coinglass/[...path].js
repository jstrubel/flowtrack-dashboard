export default async function handler(req, res) {
  // Get the path from the URL
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  // Build the CoinGlass URL
  const url = new URL(`https://open-api-v4.coinglass.com/api/${apiPath}`);
  
  // Add any query parameters
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      url.searchParams.append(key, req.query[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'CG-API-KEY': process.env.COINGLASS_API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ code: '-1', msg: error.message });
  }
}
