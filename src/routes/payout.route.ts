import { Router } from "express";
import { PayoutController } from "../controllers/payout.controller";

const router = Router();
const payoutController = new PayoutController();

// Rutas para pagos
router.post("/", payoutController.createPayout.bind(payoutController));
router.get("/:id", payoutController.getPayoutById.bind(payoutController));
router.put("/:id", payoutController.updatePayout.bind(payoutController));
router.post("/process/:id", payoutController.processPayout.bind(payoutController));
router.delete("/:id", payoutController.deletePayout.bind(payoutController));

export default router;
