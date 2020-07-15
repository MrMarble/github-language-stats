import { Router } from "express";
import { getUserLanguages, getRoot } from "../controllers";
const router = Router();

router.get("/:username", getUserLanguages);
router.get("/", getRoot);

export default router;
