import ChatBot from "@/components/ChatBot";
import afnbConfig from "@/config/afnb/config";

export default function Home() {
  return (
    <main className="h-screen">
      <ChatBot config={afnbConfig} />
    </main>
  );
}
