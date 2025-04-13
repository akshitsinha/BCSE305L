export async function GET() {
  const targetUrl = "http://localhost:5000/video";

  try {
    const apiRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "multipart/x-mixed-replace",
      },
    });

    const contentType =
      apiRes.headers.get("content-type") || "multipart/x-mixed-replace";

    const readableStream = apiRes.body;

    if (!readableStream) {
      throw new Error("Failed to get readable stream from the response");
    }

    return new Response(readableStream, {
      status: apiRes.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to forward video stream",
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
