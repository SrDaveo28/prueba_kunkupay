import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    const customerData = req.body;

    try {
      const message = await this.customerService.createCustomer(customerData);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    try {
      const customer = await this.customerService.getCustomerById(customerId);
      res.status(200).json(customer);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async getAllCustomers(_req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.customerService.getAllCustomers();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const updateData = req.body;

    try {
      const updatedCustomer = await this.customerService.updateCustomer(
        customerId,
        updateData
      );
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    try {
      const message = await this.customerService.deleteCustomer(customerId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }
}
