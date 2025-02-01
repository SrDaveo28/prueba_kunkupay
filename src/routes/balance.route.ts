import { Router } from "express";
import { BalanceController } from "../controllers/balance.controller";

const router = Router();
const balanceController = new BalanceController();

// Ruta para calcular el balance
router.get("/:customerId", balanceController.calculateBalance.bind(balanceController));

// Ruta para obtener el historial de movimientos
router.get("/history/:customerId", balanceController.getTransactionHistory.bind(balanceController));

export default router;
