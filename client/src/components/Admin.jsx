import axios from "axios";
import { useEffect, useState } from "react";

export default function Admin() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({
    key: "",
    title: "",
    content: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  // -----------------------
  // FIXED: Correct useEffect
  // -----------------------
  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    try {
      const res = await axios.get("http://localhost:4000/api/personal-info");
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load Error:", err);
    }
  }

  async function saveDoc() {
    if (!form.key || !form.content) {
      alert("key & content required");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:4000/api/personal-info", {
        key: form.key,
        title: form.title,
        content: form.content,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });

      setForm({
        key: "",
        title: "",
        content: "",
        tags: "",
      });

      await loadDocs();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Save failed!");
    }
    setLoading(false);
  }

  async function deleteDoc(key) {
    if (!window.confirm("Delete this document?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/personal-info/${key}`);
      await loadDocs();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div className="admin-grid">
        {/* LEFT — EXISTING DOCUMENTS */}
        <div>
          <h3>Saved Documents</h3>

          <div className="doc-list">
            {docs.length === 0 && (
              <div style={{ color: "var(--muted)" }}>
                No documents added yet.
              </div>
            )}

            {docs.map((d) => (
              <div className="doc" key={d.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{d.title || d.key}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                      {d.tags?.join(", ")}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() =>
                        setForm({
                          key: d.key,
                          title: d.title,
                          content: d.content,
                          tags: (d.tags || []).join(","),
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteDoc(d.key)}
                      style={{ background: "#fee2e2", border: "none" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p style={{ marginTop: 6, fontSize: 14 }}>{d.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — ADD/EDIT FORM */}
        <div>
          <h3>Add / Edit Document</h3>

          <div className="form">
            <input
              placeholder="unique key (e.g., bio, skills)"
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
              style={{ height: 160 }}
            />

            <input
              placeholder="tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveDoc} disabled={loading}>
                {loading ? "Saving..." : "Save / Update"}
              </button>

              <button
                onClick={() =>
                  setForm({ key: "", title: "", content: "", tags: "" })
                }
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
