import { motion } from "framer-motion";
import Image from "next/image";

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

export default function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  const prompts = [
    "Wie kann ai-gelb unseren Kundenservice entlasten?",
    "Welche Anpassungsmöglichkeiten gibt es für ai-gelb?",
    "Welche Vorteile hat ai-gelb gegenüber gewöhnlichen Chatbots?",
    "Welche Vorteile bietet ai-gelb im Bezug auf DSGVO & Barrierefreiheit?",
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src="/images/logos/welcome-logo.svg"
        alt="ai-gelb logo"
        width={96}
        height={96}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold mb-4">
        Erleben Sie <span className="text-yellow-400">ai-gelb</span>
      </h1>
      <p className="text-xl mb-8">
        Ich bin ai-gelb, Ihr KI-Assistent für einfache und effektive digitale
        Kommunikation.
      </p>
      <h2 className="text-2xl font-semibold mb-4">
        Wie kann ich Ihnen heute helfen?
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="bg-purple-700 hover:bg-purple-600 p-4 rounded-lg text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
