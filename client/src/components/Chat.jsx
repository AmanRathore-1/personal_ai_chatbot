// client/src/components/Chat.jsx
import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const bottomRef = useRef(null);

  const typingIndex = useRef(0);
  const typingInterval = useRef(null);

  // auto scroll whenever messages or typing change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

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
    }, 18);
  };

  // Send message
  async function send() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const res = await axios.post(`${backendURL}/api/chat`, {
        message: userMessage,
      });

      const reply = res?.data?.reply || "I couldn't generate a response.";
      startTyping(reply);
    } catch (err) {
      console.error("CHAT ERROR:", err);
      startTyping("⚠ Server error. Please check backend or network.");
    }
  }

  return (
    <div className="chat-wrapper" style={{ padding: 0 }}>
      <div className="chat-box" style={{ height: "100%", boxShadow: "none", borderRadius: 12 }}>
        <div className="messages-area" style={{ background: "transparent", padding: 18 }}>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>
              {m.text}
            </div>
          ))}

          {typingText && (
            <div className="bubble ai typing">
              {typingText}
              <span className="blink">▌</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="input-bar" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} className="send-btn">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
