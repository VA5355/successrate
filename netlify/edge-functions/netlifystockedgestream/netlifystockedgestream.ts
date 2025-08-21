export default async function sse(request: Request) {

 const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const roomId = searchParams.get("roomId");


  let timerId: any | undefined;
  const body = new ReadableStream({
    start(controller) {
      timerId = setInterval(() => {
        const msg = new TextEncoder().encode(
          `data: hello ${userId} in room ${roomId} at ${new Date().toUTCString()}\r\n\r\n`,
        );
        controller.enqueue(msg);
      }, 1000);
    },
    cancel() {
      if (typeof timerId === "number") {
        clearInterval(timerId);
      }
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}