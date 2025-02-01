import { Request, Response } from "express";
import { AdjustmentService } from "../services/adjustment.service";

export class AdjustmentController {
  private adjustmentService: AdjustmentService;

  constructor() {
    this.adjustmentService = new AdjustmentService();
  }

  async createAdjustment(req: Request, res: Response): Promise<void> {
    const adjustmentData = req.body;

    try {
      const message = await this.adjustmentService.createAdjustment(adjustmentData);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async getAdjustmentById(req: Request, res: Response): Promise<void> {
    const adjustmentId = req.params.adjustmentId;

    try {
      const adjustment = await this.adjustmentService.getAdjustmentById(adjustmentId);
      res.status(200).json(adjustment);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async getAllAdjustments(_req: Request, res: Response): Promise<void> {
    try {
      const adjustments = await this.adjustmentService.getAllAdjustments();
      res.status(200).json(adjustments);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async updateAdjustment(req: Request, res: Response): Promise<void> {
    const adjustmentId = req.params.adjustmentId;
    const updateData = req.body;

    try {
      const updatedAdjustment = await this.adjustmentService.updateAdjustment(adjustmentId, updateData);
      res.status(200).json(updatedAdjustment);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async deleteAdjustment(req: Request, res: Response): Promise<void> {
    const adjustmentId = req.params.adjustmentId;

    try {
      const message = await this.adjustmentService.deleteAdjustment(adjustmentId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }
}
