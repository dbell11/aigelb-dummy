import { motion } from "framer-motion";
import Image from "next/image";

import { Question } from "@phosphor-icons/react";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const logoVariants = {
    hidden: {
      opacity: 0,
      rotateY: 180,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        opacity: { duration: 2, delay: 0.5 },
        rotateY: {
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 2,
          delay: 0.5,
        },
        scale: { duration: 2, delay: 0.5 },
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={logoVariants} style={{ perspective: 1000 }}>
        <Image
          src="/images/logos/welcome-logo.svg"
          alt="ai-gelb logo"
          width={96}
          height={96}
          className="mb-4"
        />
      </motion.div>
      <motion.h1
        className="text-4xl font-bold mb-4 xl:text-6xl"
        variants={itemVariants}
      >
        Erleben Sie <span className="text-gradient-yellow">ai-gelb</span>
      </motion.h1>
      <motion.p
        className="text-xl mb-2 text-center xl:text-2xl font-extralight"
        variants={itemVariants}
      >
        Ich bin ai-gelb, Ihr KI-Assistent für einfache und effektive digitale
        Kommunikation.
      </motion.p>
      <motion.h2 className="text-2xl font-normal mb-8" variants={itemVariants}>
        Wie kann ich Ihnen heute helfen?
      </motion.h2>
      <motion.div
        className="grid md:grid-cols-2 gap-4 px-4 md:max-w-5xl md:mx-auto"
        variants={itemVariants}
      >
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="bg-white/90 rounded text-left text-black p-4 shadow-[0px_2px_15px_rgba(0,0,0,0.25)] border-transparent border-[5px] flex items-center md:items-start space-x-2 md:space-x-3 xl:transition-all xl:duration-500 xl:hover:border-yellow-500"
          >
            <Question
              size={32}
              weight="fill"
              className="text-purple-400 flex-shrink-0"
            />
            <span className="line-clamp-1 md:line-clamp-none xl:text-xl xl:leading-[160%]">
              {prompt}
            </span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
