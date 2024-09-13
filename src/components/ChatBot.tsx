"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatArea from "@/components/ChatArea";
import InputArea from "@/components/InputArea";
import { createConversation, addUserMessage } from "@/api";
import { Message, Conversation } from "@/types";
import { getAuthToken } from "@/utils";

const Chatbot: React.FC = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isWelcomeScreenVisible, setIsWelcomeScreenVisible] =
    useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );

  const handleSubmit = async (input: string) => {
    setIsWelcomeScreenVisible(false);

    const newMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString(),
    };

    setConversation((prev) => ({
      ...(prev || {
        id: 0,
        title: "",
        user_id: 0,
        knowledge: [],
        messages: [],
      }),
      messages: [...(prev?.messages || []), newMessage],
    }));

    setIsStreaming(true);

    try {
      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await createConversation(input);
        setConversation((prev) => ({
          ...currentConversation,
          messages: [...(prev?.messages || [])],
        }));
      } else {
        await addUserMessage(currentConversation.id, newMessage);
      }

      if (currentConversation && currentConversation.id) {
        const assistantMessage = await completeConversation(
          currentConversation.id
        );
        setStreamingMessage(null);
        setConversation((prev) => {
          if (!prev) return currentConversation;
          return {
            ...prev,
            messages: [...prev.messages, assistantMessage],
          };
        });
      } else {
        console.error("No valid conversation ID available for AI response");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleConversationSelect = async (
    selectedConversation: Conversation
  ) => {
    setIsWelcomeScreenVisible(false);
    setConversation(selectedConversation);

    // Load the messages for the selected conversation
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `https://api.afnb.ai-gelb.de/v1/conversation/${selectedConversation.id}`,
        {
          headers: {
            accept: "application/json",
            authorization: "Bearer " + token,
          },
        }
      );

      if (!response.ok)
        throw new Error("Failed to fetch conversation messages");

      const data = await response.json();
      setConversation(data);
    } catch (error) {
      console.error("Error loading conversation messages:", error);
    }
  };

  const handleStreamingUpdate = (updatedMessage: Message) => {
    setStreamingMessage(updatedMessage);
  };

  const completeConversation = async (
    conversationId: number
  ): Promise<Message> => {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    console.log("Completing conversation with ID:", conversationId);

    const response = await fetch(
      `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/completion`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Unable to read response");

    const decoder = new TextDecoder();

    const streamId = Date.now().toString();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullContent += chunk;
      handleStreamingUpdate({
        role: "assistant",
        content: fullContent,
        id: streamId,
      });
    }

    console.log("AI response completed:", fullContent);
    return { role: "assistant", content: fullContent, id: streamId };
  };

  const handleNewChat = () => {
    setConversation(null);
    setIsWelcomeScreenVisible(true);
  };

  return (
    <div className="flex h-screen bg-purple-800 text-white">
      <Sidebar
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        isConversationActive={!isWelcomeScreenVisible}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <AnimatePresence>
            {isWelcomeScreenVisible && (
              <motion.div
                key="welcome"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <WelcomeScreen onPromptSelect={handleSubmit} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: isWelcomeScreenVisible ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <ChatArea
              messages={conversation?.messages || []}
              isStreaming={isStreaming}
              streamingMessage={streamingMessage}
            />
          </motion.div>
        </div>
        <InputArea onSend={handleSubmit} disabled={isStreaming} />
      </main>
    </div>
  );
};

export default Chatbot;
