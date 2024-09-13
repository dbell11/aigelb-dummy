import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  TypeIcon,
  SunIcon,
  BookOpenIcon,
  LogOutIcon,
  Loader2,
} from "lucide-react";
import { Conversation } from "@/types";
import { getAuthToken } from "@/utils";

interface SidebarProps {
  onConversationSelect: (conversation: Conversation) => void;
  onNewChat: () => void;
  isConversationActive: boolean;
}

export default function Sidebar({
  onConversationSelect,
  onNewChat,
  isConversationActive,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
      loadConversations();
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        "https://api.afnb.ai-gelb.de/v1/conversation?skip=0&limit=100",
        {
          headers: {
            accept: "application/json",
            authorization: "Bearer " + token,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false); // Beenden Sie die Ladeanimation
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    onConversationSelect(conversation);
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = () => {
    setIsOpen(!isOpen);
    onNewChat();
  };

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "48px" },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      className="fixed left-4 top-4 bottom-4 bg-purple-800 rounded-lg shadow-lg overflow-hidden z-50"
      initial="collapsed"
      animate={isOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white z-10"
      >
        {isOpen ? "X" : "☰"}
      </button>

      <AnimatePresence>
        {showContent && (
          <motion.div
            className="p-4 mt-12"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <img
                src="/ai-gelb-logo.png"
                alt="ai-gelb logo"
                className="w-8 h-8 mr-2"
              />
              <h1 className="text-xl font-bold text-white">ai-gelb</h1>
            </div>

            <button
              className={`w-full bg-purple-700 text-white py-2 px-4 rounded-lg mb-6 ${
                !isConversationActive ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={isConversationActive ? handleNewChat : undefined}
              disabled={!isConversationActive}
            >
              Neuen Chat starten +
            </button>

            <h2 className="text-lg font-semibold text-white mb-2">Historie:</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            ) : (
              <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {conversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className="text-white cursor-pointer hover:bg-purple-700 rounded p-1"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    {conversation.title || `Konversation ${conversation.id}`}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`absolute bottom-4 left-0 right-0 ${
          isOpen ? "px-4" : "flex flex-col items-center"
        }`}
      >
        <SidebarButton
          icon={<EyeIcon size={20} />}
          text="Farbe"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<TypeIcon size={20} />}
          text="Schriftgröße"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<SunIcon size={20} />}
          text="Kontrast"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarToggle
          icon={<BookOpenIcon size={20} />}
          text="Leichte Sprache"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<LogOutIcon size={20} />}
          text="Abmelden"
          isExpanded={isOpen}
          showContent={showContent}
        />
      </div>
    </motion.div>
  );
}

function SidebarButton({ icon, text, isExpanded, showContent }) {
  return (
    <button className="text-white mb-2 flex items-center justify-center w-full h-8 relative overflow-hidden">
      <span
        className={`transition-all duration-300 ${
          isExpanded ? "absolute left-0" : ""
        }`}
      >
        {icon}
      </span>
      <AnimatePresence>
        {isExpanded && showContent && (
          <motion.span
            className="absolute left-8 right-0 text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function SidebarToggle({ icon, text, isExpanded, showContent }) {
  return (
    <div className="text-white mb-2 flex items-center justify-center w-full h-8 relative overflow-hidden">
      <span
        className={`transition-all duration-300 ${
          isExpanded ? "absolute left-0" : ""
        }`}
      >
        {icon}
      </span>
      <AnimatePresence>
        {isExpanded && showContent && (
          <motion.span
            className="absolute left-8 right-8 text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isExpanded && showContent && (
          <motion.input
            type="checkbox"
            className="absolute right-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
