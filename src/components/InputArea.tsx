import React, { useState, useRef, useEffect } from "react";
import {
  Microphone,
  UploadSimple,
  PaperPlaneTilt,
  StopCircle,
} from "@phosphor-icons/react";
import { transcribeAudio } from "@/api";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputArea({ onSend, disabled }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  return (
    <div className="p-4 relative z-40">
      <div className="max-w-5xl mx-auto relative">
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
          <button
            className="p-3 rounded-full text-yellow-400 focus:outline-none bg-purple-600 ml-2"
            aria-label="Upload file"
          >
            <UploadSimple size={24} weight="bold" />
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
