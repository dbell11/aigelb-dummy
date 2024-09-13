import { motion } from "framer-motion";
import Image from "next/image";
import { PiQuestionFill } from "react-icons/pi";

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
      <h1 className="text-4xl font-bold mb-4 xl:text-6xl">
        Erleben Sie <span className="text-gradient-yellow">ai-gelb</span>
      </h1>
      <p className="text-xl mb-2 text-center xl:text-2xl font-extralight">
        Ich bin ai-gelb, Ihr KI-Assistent für einfache und effektive digitale
        Kommunikation.
      </p>
      <h2 className="text-2xl font-normal mb-8">
        Wie kann ich Ihnen heute helfen?
      </h2>
      <div className="grid md:grid-cols-2 gap-4 px-4 md:max-w-5xl md:mx-auto">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="bg-white/90 rounded text-left text-black p-4 shadow-[0px_2px_15px_rgba(0,0,0,0.25)] border-transparent border-[5px] flex items-center md:items-start space-x-2 md:space-x-3 xl:transition-all xl:duration-300  xl:hover:border-yellow-600"
          >
            <PiQuestionFill
              size={32}
              className="text-purple-400 flex-shrink-0"
            />
            <span className="line-clamp-1 md:line-clamp-none xl:text-xl xl:leading-[160%]">
              {prompt}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
