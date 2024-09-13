import React, { useEffect, useRef } from "react";

import { Message } from "@/types";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: Message | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  streamingMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  return (
    <div className="min-h-full p-4 flex flex-col justify-start max-w-5xl mx-auto">
      <div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-purple-700 max-w-[600px]"
                  : "bg-purple-600"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isStreaming && !streamingMessage && (
          <div className="mb-4 text-left">
            <div className="inline-block p-2 rounded-lg bg-purple-600">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        {streamingMessage && (
          <div className="mb-4 text-left">
            <div className="inline-block p-2 rounded-lg bg-purple-600">
              {streamingMessage.content}
              <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatArea;
