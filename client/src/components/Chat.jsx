import axios from "axios";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { from: "user", text: input }]);

    try {
      const res = await axios.post("http://localhost:4000/api/chat", {
        message: input
      });

      setMessages(prev => [...prev, { from: "ai", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { from: "ai", text: "Server error" }]);
    }

    setInput("");
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid #ddd",
          padding: 10,
          height: 350,
          overflowY: "auto"
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.from === "user" ? "You" : "AI"}:</b> {m.text}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />

        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
