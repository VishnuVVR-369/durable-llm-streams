import type { UIMessage } from "ai";
import Chat from "@/components/chat";
import { redis } from "@/lib/redis";

type Params = Promise<{ chatId?: string }>;

export default async function Home({ searchParams }: { searchParams: Params }) {
  const { chatId } = await searchParams;

  const chatHistory = await redis.zrange<UIMessage[]>(
    `history:${chatId}`,
    0,
    -1,
  );

  return <Chat initialHistory={chatId ? { [chatId]: chatHistory } : {}} />;
}
