export async function GET(request: Request) {
  const targetBaseUrl = "http://localhost:5000/predict";

  try {
    const url = new URL(request.url);
    const queryParams = url.search;

    const targetUrl = `${targetBaseUrl}${queryParams}`;

    const apiRes = await fetch(targetUrl, {
      method: "GET",
      headers: request.headers,
    });

    const body = await apiRes.arrayBuffer();

    return new Response(body, {
      status: apiRes.status,
      headers: apiRes.headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch data from /predict",
        stacktrace: error,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
