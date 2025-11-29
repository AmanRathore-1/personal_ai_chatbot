import axios from "axios";
import { useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const typingIndex = useRef(0);
  const typingInterval = useRef(null);

  // Typing effect
  const startTyping = (text) => {
    setTypingText("");
    typingIndex.current = 0;

    clearInterval(typingInterval.current);

    typingInterval.current = setInterval(() => {
      typingIndex.current += 1;
      setTypingText(text.slice(0, typingIndex.current));

      if (typingIndex.current >= text.length) {
        clearInterval(typingInterval.current);

        setMessages((prev) => [...prev, { from: "ai", text }]);
        setTypingText("");
      }
    }, 20);
  };

  // ---------- SEND MESSAGE ----------
  async function send() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);

    const userMessage = input;
    setInput("");

    try {
      // ⭐ IMPORTANT: Use Vite env variable for backend URL
      const backendURL = import.meta.env.VITE_BACKEND_URL;

      const res = await axios.post(`${backendURL}/api/chat`, {
        message: userMessage,
      });

      const reply = res.data.reply || "I couldn't generate a response.";

      startTyping(reply);
    } catch (err) {
      console.error(err);
      startTyping("Server error. Please check backend.");
    }
  }

  return (
    <div className="chat-area">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}

        {typingText && (
          <div className="msg ai typing">
            {typingText}
            <span className="cursor">|</span>
          </div>
        )}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
