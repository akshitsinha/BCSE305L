export async function GET() {
    const targetUrl = 'http://localhost:5000/sensors';
  
    try {
      const apiRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const contentType = apiRes.headers.get('content-type') || 'application/json';
      const body = await apiRes.text(); // handle JSON or plain text
  
      return new Response(body, {
        status: apiRes.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store', // Optional: avoid caching during dev
        },
      });
    } catch (error) {

        console.error('Error fetching sensor data:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch sensor data' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
  