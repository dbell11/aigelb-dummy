"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatArea from "@/components/ChatArea";
import InputArea from "@/components/InputArea";
import {
  createConversation,
  addUserMessage,
  summarizeConversation,
} from "@/api";
import { Message, Conversation } from "@/types";
import { getAuthToken } from "@/utils";
import AnimatedBackgroundSVG from "./AnimatedBackground";
import { Toaster } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    setIsStreaming(true);

    const newMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString(),
    };

    try {
      let currentConversation: Conversation;

      if (!conversation) {
        // Create a new conversation
        currentConversation = await createConversation(input);
        setConversation(currentConversation);

        // Update the UI with the user's message immediately
        setConversation((prev) => ({
          ...prev!,
          messages: [newMessage],
        }));

        // Start summarization in the background (don't await)
        summarizeConversation(currentConversation.id);
      } else {
        // Add message to existing conversation
        await addUserMessage(conversation.id, newMessage);
        currentConversation = conversation;

        // Update the UI with the user's message immediately
        setConversation((prev) => ({
          ...prev!,
          messages: [...prev!.messages, newMessage],
        }));
      }

      // Start streaming the AI response
      const response = await fetch(
        `${API_URL}/conversation/${currentConversation.id}/completion`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: "text/event-stream",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Unable to read response");

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        role: "assistant",
        content: "",
        id: Date.now().toString(),
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage.content += chunk;

        // Update the UI with the streamed content
        setStreamingMessage({ ...assistantMessage });
      }

      // Final update to the conversation with the complete assistant message
      setConversation((prev) => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage],
      }));

      setStreamingMessage(null);
    } catch (error) {
      console.error("Error:", error);
      // Handle the error in the UI
      setConversation((prev) => ({
        ...prev!,
        messages: [
          ...prev!.messages,
          {
            role: "assistant",
            content: "Sorry, an error occurred while processing your request.",
            id: Date.now().toString(),
          },
        ],
      }));
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
        `${API_URL}/conversation/${selectedConversation.id}`,
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

  const handleNewChat = () => {
    setConversation(null);
    setIsWelcomeScreenVisible(true);
  };

  const handleConversationCreated = (id: number) => {
    setConversation((prev) => {
      if (prev === null) {
        // If there was no previous conversation, create a new one
        return {
          id,
          title: "",
          uuid: "", // You might want to generate a UUID here
          messages: [],
          knowledge: []
        };
      } else {
        // If there was a previous conversation, update its ID
        return {
          ...prev,
          id
        };
      }
    });
  };

  return (
    <div className="flex h-screen bg-purple-800 text-white">
      <Toaster position="top-right" />
      <motion.div
        className="background-svg w-full h-screen fixed top-0 left-0 z-10 flex flex-row justify-center pointer-events-none"
        animate={{ opacity: isWelcomeScreenVisible ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatedBackgroundSVG />
      </motion.div>
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
        <InputArea
          onSend={handleSubmit}
          disabled={isStreaming}
          conversationId={conversation ? conversation.id : null}
          onConversationCreated={handleConversationCreated}
          knowledgeItems={conversation?.knowledge || []}
        />
      </main>
    </div>
  );
};

export default Chatbot;
