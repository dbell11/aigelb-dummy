import React, { useEffect, useRef, useState, memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Message } from "@/types";
import { SpeakerHigh, Pause, Spinner } from "@phosphor-icons/react";
import Image from "next/image";
import { motion } from "framer-motion";
import MarkdownComponents from "@/components/MarkdownComponents";
import { getAuthToken } from "@/utils";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: Message | null;
}

const AILogo = memo(function AILogo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-shrink-0"
    >
      <Image
        src="/images/logos/welcome-logo.svg"
        alt="AI Logo"
        width={100}
        height={100}
        className="w-12 h-12 mr-2"
      />
    </motion.div>
  );
});

const renderMarkdown = (content: string) => {
  const cleanContent = content.replace(/\\n/g, "\n");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={MarkdownComponents}
    >
      {cleanContent}
    </ReactMarkdown>
  );
};

const MessageBubble = memo(function MessageBubble({
  message,
  isCompleted,
  onPlayAudio,
  audioState,
  isButtonLocked,
}: {
  message: Message;
  isCompleted: boolean;
  onPlayAudio: () => void;
  audioState: "idle" | "loading" | "playing";
  isButtonLocked: boolean;
}) {
  return (
    <div
      className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
    >
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "items-start"
        }`}
      >
        {message.role === "assistant" && <AILogo />}
        <div
          className={`inline-block p-2 rounded-lg ${
            message.role === "user"
              ? "bg-white/90 text-black text-lg max-w-[600px]"
              : "bg-purple-600"
          }`}
        >
          {message.role === "user"
            ? message.content
            : renderMarkdown(message.content)}

          {message.role === "assistant" && isCompleted && (
            <button
              onClick={onPlayAudio}
              disabled={isButtonLocked}
              className={`gradient-yellow text-purple-400 size-10 rounded-full flex items-center justify-center mt-4 ${
                audioState === "loading" ? "animate-pulse" : ""
              } ${isButtonLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {audioState === "loading" ? (
                <Spinner size={24} className="animate-spin" />
              ) : audioState === "playing" ? (
                <Pause size={24} />
              ) : (
                <SpeakerHigh size={24} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  streamingMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(
    new Set()
  );
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing">(
    "idle"
  );
  const [isButtonLocked, setIsButtonLocked] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (!isStreaming && streamingMessage) {
      setCompletedMessages((prev) => new Set(prev).add(streamingMessage.id));
    }
  }, [isStreaming, streamingMessage]);

  useEffect(() => {
    setCompletedMessages(new Set(messages.map((msg) => msg.id)));
  }, [messages]);

  const playAudio = async (messageId: string, content: string) => {
    if (isButtonLocked) return;
    setIsButtonLocked(true);
    const token = getAuthToken();

    if (playingMessageId === messageId && audioRef.current) {
      if (audioRef.current.paused) {
        setAudioState("playing");
        await audioRef.current.play();
      } else {
        setAudioState("idle");
        audioRef.current.pause();
        setPlayingMessageId(null);
      }
      setIsButtonLocked(false);
      return;
    }

    setAudioState("loading");
    setPlayingMessageId(messageId);

    try {
      const response = await fetch(
        "https://api.afnb.ai-gelb.de/v1/audio/synthesize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            input: content,
            voice: "alloy",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        setAudioState("playing");
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioState("idle");
      setPlayingMessageId(null);
    } finally {
      setIsButtonLocked(false);
    }
  };

  const memoizedMessages = useMemo(
    () =>
      messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCompleted={completedMessages.has(message.id)}
          onPlayAudio={() => playAudio(message.id, message.content)}
          audioState={playingMessageId === message.id ? audioState : "idle"}
          isButtonLocked={isButtonLocked}
        />
      )),
    [messages, completedMessages, playingMessageId, audioState, isButtonLocked]
  );

  return (
    <div className="min-h-full p-4 py-10 flex flex-col justify-start max-w-5xl mx-auto">
      <div>
        {memoizedMessages}
        {isStreaming && !streamingMessage && (
          <div className="mb-4 text-left">
            <div className="flex items-start">
              <AILogo />
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
          </div>
        )}
        {streamingMessage && (
          <MessageBubble
            message={streamingMessage}
            isCompleted={false}
            onPlayAudio={() => {}}
            audioState="idle"
            isButtonLocked={isButtonLocked}
          />
        )}
      </div>
      <div ref={bottomRef} />
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlayingMessageId(null);
          setAudioState("idle");
          setIsButtonLocked(false);
        }}
      />
    </div>
  );
};

ChatArea.displayName = "ChatArea";

export default ChatArea;
