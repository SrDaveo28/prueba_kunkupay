import { Router } from "express";
import { SaleController } from "../controllers/sale.controller";

const router = Router();
const saleController = new SaleController();

router.post("/", saleController.createSale.bind(saleController));
router.get("/:saleId", saleController.getSaleById.bind(saleController));
router.get("/", saleController.getAllSales.bind(saleController));
router.put("/:saleId", saleController.updateSale.bind(saleController));
router.delete("/:saleId", saleController.deleteSale.bind(saleController));

export default router;
