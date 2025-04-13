export async function GET() {
  const targetUrl = "http://localhost:5000/sensors";

  try {
    const apiRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType =
      apiRes.headers.get("content-type") || "application/json";
    const body = await apiRes.text();

    return new Response(body, {
      status: apiRes.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch sensor data",
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
