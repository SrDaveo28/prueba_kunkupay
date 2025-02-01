import { Request, Response } from "express";
import { PayoutsService } from "../services/payout.service";

export class PayoutController {
  private payoutsService: PayoutsService;

  constructor() {
    this.payoutsService = new PayoutsService();
  }

  async createPayout(req: Request, res: Response) {
    try {
      const payoutData = req.body;
      const message = await this.payoutsService.createPayout(payoutData);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async getPayoutById(req: Request, res: Response) {
    try {
      const payoutId = req.params.id;
      const payout = await this.payoutsService.getPayoutById(payoutId);
      res.status(200).json(payout);
    } catch (error) {
      res.status(404).json({ error: error });
    }
  }

  async updatePayout(req: Request, res: Response) {
    try {
      const payoutId = req.params.id;
      const updateData = req.body;
      const updatedPayout = await this.payoutsService.updatePayout(
        payoutId,
        updateData
      );
      res.status(200).json(updatedPayout);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async processPayout(req: Request, res: Response) {
    try {
      const payoutId = req.params.id;
      const message = await this.payoutsService.processPayout(payoutId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async deletePayout(req: Request, res: Response) {
    try {
      const payoutId = req.params.id;
      const message = await this.payoutsService.deletePayout(payoutId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
}
