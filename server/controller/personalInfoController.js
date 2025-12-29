// controllers/personalInfoController.js
import PersonalInfo from "../models/PersonalInfo.js";

// GET all docs
export const getAllPersonalInfo = async (req, res) => {
  try {
    const docs = await PersonalInfo.find();
    res.json(docs);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE / UPDATE doc
export const createOrUpdatePersonalInfo = async (req, res) => {
  try {
    const { key, title, content, tags } = req.body;

    if (!key || !content) {
      return res.status(400).json({ error: "Key & content required" });
    }

    const doc = await PersonalInfo.findOneAndUpdate(
      { key },
      { title, content, tags },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(doc);
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE doc
export const deletePersonalInfo = async (req, res) => {
  try {
    await PersonalInfo.findOneAndDelete({ key: req.params.key });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
