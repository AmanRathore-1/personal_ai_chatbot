import axios from "axios";
import { useEffect, useState } from "react";
import "./Admin.css";


export default function Admin() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({
    key: "",
    title: "",
    content: "",
    tags: "",
  });

  async function load() {
    try {
      const res = await axios.get((import.meta.env.VITE_BACKEND_URL || "http://localhost:4000") + "/api/personal-info");
      setDocs(res.data || []);
    } catch (err) {
      console.error("Load Error:", err);
    }
  }

  async function save() {
    if (!form.key || !form.content) {
      alert("Key & content required");
      return;
    }

    try {
      await axios.post((import.meta.env.VITE_BACKEND_URL || "http://localhost:4000") + "/api/personal-info", {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      });

      setForm({ key: "", title: "", content: "", tags: "" });
      load();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Save failed");
    }
  }

  async function del(key) {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete((import.meta.env.VITE_BACKEND_URL || "http://localhost:4000") + "/api/personal-info/" + key);
      load();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-heading">Add / Edit Memory</h2>

      <div className="admin-form">
        <input
          placeholder="unique key (bio, skills)"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
        />

        <input
          placeholder="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />

        <input
          placeholder="tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />

        <button className="admin-btn" onClick={save}>
          Save / Update
        </button>
      </div>

      <h3 className="admin-heading">Stored Memory</h3>

      <div className="admin-list">
        {docs.map((d) => (
          <div key={d.key} className="admin-card">
            <div>
              <b className="admin-title">{d.title || d.key}</b>
              <p className="admin-preview">{(d.content || "").slice(0, 120)}...</p>
              <small className="admin-tags">
                {(d.tags || []).join(", ")}
              </small>
            </div>

            <button className="delete-btn" onClick={() => del(d.key)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
