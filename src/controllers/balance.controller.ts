import { Request, Response } from "express";
import { BalanceService } from "../services/balance.service";

export class BalanceController {
  private balanceService: BalanceService;

  constructor() {
    this.balanceService = new BalanceService();
  }

  async calculateBalance(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    try {
      const balanceData = await this.balanceService.calculateBalance(
        customerId
      );
      res.status(200).json(balanceData);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    try {
      const history = await this.balanceService.getTransactionHistory(
        customerId
      );
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
}
