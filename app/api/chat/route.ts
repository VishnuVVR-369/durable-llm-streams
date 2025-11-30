import { serve } from "@upstash/workflow/nextjs";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { nanoid } from "nanoid";
import { openRouter } from "@/lib/openrouter";
import { realtime } from "@/lib/realtime";
import { redis } from "@/lib/redis";

const SYSTEM_PROMPT = `You are a helpful AI assistant. Format your responses using markdown for better readability:
- Use headings (h1-h3) to organize content
- Use bullet points and numbered lists where appropriate
- Add occasional emojis to make responses more engaging
- Keep responses clear and well-structured`;

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response("Missing required parameter: id", { status: 400 });
  }

  const channel = realtime.channel(id);
  const stream = new ReadableStream({
    async start(controller) {
      await channel.history().on("ai.chunk", (chunk) => {
        controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.type === "finish") controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

const saveMessageToHistory = async (id: string, message: UIMessage) => {
  const score = Date.now();
  await redis.zadd(`history:${id}`, { nx: true }, { score, member: message });
};

const getConversationHistory = async (id: string) => {
  return redis.zrange<UIMessage[]>(`history:${id}`, 0, -1);
};

const saveMessagesToHistory = async (id: string, messages: UIMessage[]) => {
  for (const member of messages) {
    await redis.zadd(`history:${id}`, {
      score: Date.now(),
      member,
    });
  }
};

export const { POST } = serve(
  async (workflow) => {
    const { id, message } = workflow.requestPayload as {
      id: string;
      message: UIMessage;
    };

    await saveMessageToHistory(id, message);

    await workflow.run("ai-generation", async () => {
      const history = await getConversationHistory(id);
      const result = streamText({
        model: openRouter.chat("google/gemini-2.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages: convertToModelMessages([...history, message]),
      });

      const stream = result.toUIMessageStream({
        generateMessageId: () => nanoid(),
        onFinish: async ({ messages }) => {
          await saveMessagesToHistory(id, messages);
        },
      });

      const channel = realtime.channel(message.id);
      for await (const chunk of stream) {
        await channel.emit("ai.chunk", chunk);
      }
    });
  },
  {
    receiver: undefined,
  },
);
