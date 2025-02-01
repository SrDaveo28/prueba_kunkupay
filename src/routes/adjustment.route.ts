import { Router } from "express";
import { AdjustmentController } from "../controllers/adjustment.controller";

const router = Router();
const adjustmentController = new AdjustmentController();

router.post("/", adjustmentController.createAdjustment.bind(adjustmentController));
router.get("/:adjustmentId", adjustmentController.getAdjustmentById.bind(adjustmentController));
router.get("/", adjustmentController.getAllAdjustments.bind(adjustmentController));
router.put("/:adjustmentId", adjustmentController.updateAdjustment.bind(adjustmentController));
router.delete("/:adjustmentId", adjustmentController.deleteAdjustment.bind(adjustmentController));

export default router;
