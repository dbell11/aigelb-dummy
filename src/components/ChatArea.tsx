import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Message } from "@/types";
import { ArrowSquareOut } from "@phosphor-icons/react";

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

  const renderMarkdown = (content: string) => {
    const cleanContent = content.replace(/\\n/g, "\n");

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-2 text-white font-semibold text-xl" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-2 text-white font-semibold text-lg" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mb-2 text-white font-semibold text-lg" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-white/70" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 text-white last:mb-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-4 mb-2 text-white" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-4 mb-2 text-white" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, href, children, ...props }) => (
            <a
              className="text inline-flex items-center font-semibold xl:transition-opacity xl:hover:opacity-90"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              <ArrowSquareOut
                size={20}
                weight="bold"
                className="mr-1 self-start flex-shrink-0 pt-[3px]"
              />
              {children}
            </a>
          ),
          code: ({ node, inline, className, children, ...props }) =>
            inline ? (
              <code className="bg-gray-700 rounded px-1" {...props}>
                {children}
              </code>
            ) : (
              <code
                className="block bg-gray-700 rounded p-2 my-2 whitespace-pre-wrap"
                {...props}
              >
                {children}
              </code>
            ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-md shadow-xl mb-5 border border-gray-950/10">
              <table
                className="min-w-full bg-white/10 text-white text-sm "
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-black text-white" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-950/20" {...props} />
          ),
          tr: ({ node, ...props }) => <tr className="" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left font-semibold align-top"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 align-top" {...props} />
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    );
  };

  return (
    <div className="min-h-full p-4 py-10 flex flex-col justify-start max-w-5xl mx-auto">
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
                  ? "bg-white/90 text-black text-lg max-w-[600px]"
                  : "bg-purple-600"
              }`}
            >
              {message.role === "user"
                ? message.content
                : renderMarkdown(message.content)}
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
              {renderMarkdown(streamingMessage.content)}
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
