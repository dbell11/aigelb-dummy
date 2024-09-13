import ChatBot from "@/components/ChatBot";
import afnbConfig from "@/config/afnb/config";

export default function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const conversationId = params.conversationId;

  return (
    <main className="h-screen">
      <ChatBot config={afnbConfig} initialConversationId={conversationId} />
    </main>
  );
}
