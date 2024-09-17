import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SidebarSimple,
  SignOut,
  Eye,
  TextAa,
  CircleHalf,
  Translate,
  CircleNotch,
  ChatsCircle,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { Conversation } from "@/types";
import { deleteConversation } from "@/api";
import { getAuthToken } from "@/utils";
import toast from "react-hot-toast";
import Image from "next/image";
import sidebarLogo from "@/../public/images/logos/sidebar-logo.png";
interface SidebarProps {
  onConversationSelect: (conversation: Conversation) => void;
  onNewChat: () => void;
  isConversationActive: boolean;
}

interface SidebarButtonProps {
  icon: ReactNode;
  text: string;
  isExpanded: boolean;
  showContent: boolean;
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
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    toast(
      (t) => (
        <span>
          Sicher dass Sie diese Konversation löschen möchten?
          <button
            className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => {
              handleDeleteConversation(conversationId);
              toast.dismiss(t.id);
            }}
          >
            Löschen
          </button>
        </span>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  const handleDeleteConversation = async (conversationId: number) => {
    setDeletingId(conversationId);
    try {
      await deleteConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
      toast.success("Konversation erfolgreich gelöscht.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete the conversation. Please try again.");
    } finally {
      setDeletingId(null);
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

  const logoTitleVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: { duration: 0 },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.2 },
    },
  };

  const newChatBtnVariants = {
    hidden: {
      opacity: 0,
      y: -15,
      transition: { duration: 0 },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: 0.2 },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  const toggleButtonVariants = {
    hidden: { opacity: 0, transition: { duration: 0 } },
    visible: { opacity: 1, transition: { delay: 0.2, duration: 0.2 } },
  };

  return (
    <motion.div
      className="fixed left-4 top-4 bottom-4 bg-black/20 rounded-lg shadow-lg overflow-hidden z-50"
      initial="collapsed"
      animate={isOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex items-center"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={logoTitleVariants}
            >
              <Image
                src={sidebarLogo}
                alt="ai-gelb logo"
                width={24}
                height={24}
                className="mr-2"
              />
              <div className="sidebar-title text-xl font-bold text-white">
                ai-gelb
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.button
            key={isOpen ? "open" : "closed"}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={toggleButtonVariants}
            onClick={toggleSidebar}
            className="text-white z-10"
          >
            <SidebarSimple size={24} />
          </motion.button>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            className="p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={newChatBtnVariants}
          >
            <button
              className={`w-full bg-white/10 text-white py-2 px-4 rounded-lg mb-7 flex justify-between items-center xl:transition-colors xl:hover:bg-white/15 xl:duration-300 ${
                !isConversationActive ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={isConversationActive ? handleNewChat : undefined}
              disabled={!isConversationActive}
            >
              Neuen Chat starten{" "}
              <Plus className=" text-yellow-400" size={18} weight="bold" />
            </button>

            <h2 className="text-base font-semibold text-white mb-3">
              Historie:
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <CircleNotch
                  className="animate-spin text-white"
                  size={24}
                  weight="light"
                />
              </div>
            ) : (
              <ul className="space-y-4 max-h-[calc(100vh-460px)] overflow-y-auto">
                {conversations.map((conversation) => (
                  <motion.li
                    key={conversation.id}
                    variants={listItemVariants}
                    initial="visible"
                    exit="exit"
                    title={
                      conversation.title || `Konversation ${conversation.id}`
                    }
                    className="text-white cursor-pointer xl:transition-colors xl:duration-300 xl:hover:bg-white/10 rounded flex justify-between items-center p-1 group relative pr-5"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="flex space-x-3">
                      <div className="icon">
                        <ChatsCircle size={24} />
                      </div>
                      <div className="title line-clamp-1">
                        {conversation.title ||
                          `Konversation ${conversation.id}`}
                      </div>
                    </div>
                    {deletingId === conversation.id ? (
                      <CircleNotch
                        className="animate-spin text-white"
                        size={20}
                        weight="light"
                      />
                    ) : (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-0 top-0 flex flex-row h-full"
                        onClick={(e) => handleDeleteClick(conversation.id, e)}
                      >
                        <Trash
                          size={20}
                          weight="bold"
                          className="text-yellow-400 hover:text-yellow-500 self-center"
                        />
                      </button>
                    )}
                  </motion.li>
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
          icon={<Eye size={24} />}
          text="Farbe"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<TextAa size={24} />}
          text="Schriftgröße"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<CircleHalf weight="fill" size={24} />}
          text="Kontrast"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<Translate size={24} />}
          text="Leichte Sprache"
          isExpanded={isOpen}
          showContent={showContent}
        />
        <SidebarButton
          icon={<SignOut size={24} />}
          text="Abmelden"
          isExpanded={isOpen}
          showContent={showContent}
        />
      </div>
    </motion.div>
  );
}

function SidebarButton({
  icon,
  text,
  isExpanded,
  showContent,
}: SidebarButtonProps) {
  const sidebarBtnVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, delay: 0 },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.4 },
    },
  };

  return (
    <button className="text-white mb-2 flex items-center justify-center w-full h-8 relative overflow-hidden group">
      <span
        className={`transition-all duration-300 ${
          isExpanded ? "absolute left-0" : ""
        }`}
      >
        <span className="xl:group-hover:text-yellow-400 xl:duration-300 xl:transition-colors">
          {icon}
        </span>
      </span>
      <AnimatePresence>
        {isExpanded && showContent && (
          <motion.span
            className="absolute left-8 right-0 text-left"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarBtnVariants}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
