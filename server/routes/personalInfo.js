import express from "express";
import {
  createOrUpdatePersonalInfo,
  deletePersonalInfo,
  getAllPersonalInfo
} from "../controller/personalInfoController.js";

const router = express.Router();

router.get("/", getAllPersonalInfo);
router.post("/", createOrUpdatePersonalInfo);
router.delete("/:key", deletePersonalInfo);

export default router;

