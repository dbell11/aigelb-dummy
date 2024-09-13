import { useState } from "react";

export default function InputArea({ onSend, disabled }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 relative z-40">
      <div className="flex max-w-5xl mx-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded-l-lg text-black"
          placeholder="Sende eine Nachricht..."
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          className={`bg-yellow-500 text-black p-2 rounded-r-lg ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        >
          Senden
        </button>
      </div>
    </div>
  );
}
