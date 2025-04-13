export async function GET() {
  const targetUrl = "http://localhost:5000/image";

  try {
    const apiRes = await fetch(targetUrl, {
      method: "GET",
    });

    const contentType = "image/jpeg";
    const body = await apiRes.arrayBuffer();

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
        error: "Failed to fetch image",
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
