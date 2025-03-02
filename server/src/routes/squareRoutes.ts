import { Router } from "express";
import { getSquareCatalog, syncProductToSquare } from "../controllers/squareController";

const router = Router();

router.get("/catalog", getSquareCatalog);
router.post("/sync", syncProductToSquare);

export default router;