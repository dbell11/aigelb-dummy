import React, { useState, useRef, useEffect } from "react";
import {
  Microphone,
  UploadSimple,
  PaperPlaneTilt,
  StopCircle,
  Trash,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  transcribeAudio,
  uploadFile,
  deleteFile,
  createConversation,
} from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { KnowledgeItem } from "@/types";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled: boolean;
  conversationId: number | null;
  onConversationCreated: (id: number) => void;
  knowledgeItems: KnowledgeItem[];
}

interface UploadedFile {
  id: number;
  fileName: string;
}

export default function InputArea({
  onSend,
  disabled,
  conversationId,
  onConversationCreated,
  knowledgeItems,
}: InputAreaProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [localConversationId, setLocalConversationId] = useState<number | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    if (conversationId) {
      setUploadedFiles(knowledgeItems);
    } else {
      setUploadedFiles([]);
    }
  }, [conversationId, knowledgeItems]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 4 * 24);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "audio/mp4";

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsTranscribing(true);
        setMessage("Transkribiere Audiodatei...");
        try {
          const transcription = await transcribeAudio(audioBlob, mimeType);
          setMessage(transcription);
        } catch (error) {
          console.error("Error transcribing audio:", error);
          setMessage(
            "Fehler bei der Transkription. Bitte versuchen Sie es erneut."
          );
        }
        setIsTranscribing(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const triggerFileUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("triggerFileUpload called");
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      toast.error("Nur PDF-Dateien sind erlaubt.");
      return false;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Die maximale Dateigröße beträgt 15MB.");
      return false;
    }
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setIsUploading(true);
        try {
          let currentConversationId = conversationId;
          if (!currentConversationId) {
            const newConversation = await createConversation();
            currentConversationId = newConversation.id;
            onConversationCreated(newConversation.id);
          }

          const result = await uploadFile(currentConversationId, file);
          setUploadedFiles((prev) => [...prev, result]);
          toast.success("Datei erfolgreich hochgeladen!");
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("Fehler beim Hochladen der Datei.");
        } finally {
          setIsUploading(false);
        }
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (conversationId) {
      setIsUploading(true);
      try {
        await deleteFile(conversationId, fileId);
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        toast.success("Datei erfolgreich gelöscht!");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Fehler beim Löschen der Datei.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-4 relative z-40">
      <div className="max-w-5xl mx-auto relative">
        <AnimatePresence>
          <div className="flex space-x-3 mb-4">
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-2 bg-white rounded-md flex items-center justify-between shadow-md"
                style={{ width: "200px" }}
              >
                <span
                  className="text-black truncate flex-grow mr-2"
                  title={file.fileName}
                  style={{ maxWidth: "150px" }}
                >
                  {file.fileName.length > 20
                    ? file.fileName.substring(0, 20) + "..."
                    : file.fileName}
                </span>
                <button
                  onClick={() => handleFileDelete(file.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 flex-shrink-0"
                  disabled={isUploading}
                >
                  <Trash size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        <div
          className={`flex items-center bg-white rounded-full p-2 transition-shadow duration-300 ${
            isFocused ? "shadow-[0_0_85px_rgba(254,235,86,0.15)]" : "shadow-lg"
          }`}
        >
          <button
            className={`p-3 rounded-full focus:outline-none mr-2 transition-all duration-300 ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : isTranscribing
                ? "bg-yellow-600 text-white animate-transcribe"
                : "bg-purple-600 text-yellow-400"
            }`}
            onClick={handleMicrophoneClick}
            disabled={isTranscribing}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <StopCircle size={24} weight="bold" />
            ) : (
              <Microphone size={24} weight="bold" />
            )}
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 p-2 bg-transparent focus:outline-none text-black resize-none overflow-hidden placeholder:text-black/90 text-lg"
            placeholder="Sende eine Nachricht..."
            disabled={disabled || isRecording || isTranscribing}
            rows={1}
            style={{ minHeight: "24px", maxHeight: "96px" }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />
          <button
            className={`p-3 rounded-full text-yellow-400 focus:outline-none bg-purple-600 ml-2 ${
              isUploading ? "animate-pulse" : ""
            }`}
            onClick={triggerFileUpload}
            disabled={isUploading}
            aria-label={isUploading ? "Uploading..." : "Upload file"}
          >
            {isUploading ? (
              <CircleNotch
                size={24}
                weight="bold"
                className="animate-spin cursor-not-allowed"
              />
            ) : (
              <UploadSimple size={24} weight="bold" />
            )}
          </button>
          <button
            onClick={handleSend}
            className={`p-3 rounded-full focus:outline-none transition-colors duration-200 ml-2 ${
              message.trim() && !disabled && !isRecording && !isTranscribing
                ? "bg-purple-600 text-yellow-400"
                : "bg-purple-600/50 text-yellow-400 cursor-not-allowed"
            }`}
            disabled={
              !message.trim() || disabled || isRecording || isTranscribing
            }
            aria-label="Send message"
          >
            <PaperPlaneTilt size={24} weight="bold" />
          </button>
        </div>
      </div>
      <div className="text-center mt-4 text-xs text-white/90">
        Achtung: auch ai-gelb kann mal einen Fehler machen!
      </div>
    </div>
  );
}
