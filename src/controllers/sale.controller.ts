import { Request, Response } from "express";
import { SalesService } from "../services/sale.service";

export class SaleController {
  private salesService: SalesService;

  constructor() {
    this.salesService = new SalesService();
  }

  async createSale(req: Request, res: Response): Promise<void> {
    const saleData = req.body;

    try {
      const message = await this.salesService.createSale(saleData);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async getSaleById(req: Request, res: Response): Promise<void> {
    const saleId = req.params.saleId;

    try {
      const sale = await this.salesService.getSaleById(saleId);
      res.status(200).json(sale);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async getAllSales(_req: Request, res: Response): Promise<void> {
    try {
      const adjustments = await this.salesService.getAllSales();
      res.status(200).json(adjustments);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async updateSale(req: Request, res: Response): Promise<void> {
    const saleId = req.params.saleId;
    const updateData = req.body;

    try {
      const updatedSale = await this.salesService.updateSale(saleId, updateData);
      res.status(200).json(updatedSale);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async deleteSale(req: Request, res: Response): Promise<void> {
    const saleId = req.params.saleId;

    try {
      const message = await this.salesService.deleteSale(saleId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }
}
