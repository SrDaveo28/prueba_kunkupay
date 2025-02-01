import { BaseService } from "./base.service";
import CustomerModel, { ICustomer } from "../models/customer.model";

export class CustomerService extends BaseService {
  private CustomerRepo = CustomerModel;

  /**
   * Crea un nuevo cliente dentro de una transacción.
   * @param customerData - Datos del cliente.
   * @returns Mensaje de confirmación.
   */
  async createCustomer(customerData: ICustomer): Promise<string> {
    await this.startTransaction();

    try {
      const newCustomer = new this.CustomerRepo(customerData);
      await newCustomer.save();

      await this.commit();
      return "Customer created successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Obtiene un cliente por su ID.
   * @param customerId - ID del cliente.
   * @returns El cliente encontrado o error si no existe.
   */
  async getCustomerById(customerId: string): Promise<ICustomer> {
    const customer = await this.CustomerRepo.findById(customerId).exec();
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  /**
   * Obtiene todos los clientes.
   * @returns Lista de clientes.
   */
  async getAllCustomers(): Promise<ICustomer[]> {
    return this.CustomerRepo.find().exec();
  }

  /**
   * Actualiza un cliente por su ID dentro de una transacción.
   * @param customerId - ID del cliente.
   * @param updateData - Datos a actualizar.
   * @returns El cliente actualizado o error si no existe.
   */
  async updateCustomer(customerId: string, updateData: Partial<ICustomer>): Promise<ICustomer> {
    await this.startTransaction();

    try {
      const updatedCustomer = await this.CustomerRepo.findByIdAndUpdate(
        customerId,
        updateData,
        { new: true }
      ).exec();

      if (!updatedCustomer) {
        throw new Error("Customer not found");
      }

      await this.commit();
      return updatedCustomer;
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Elimina un cliente por su ID dentro de una transacción.
   * @param customerId - ID del cliente.
   * @returns El cliente eliminado o error si no existe.
   */
  async deleteCustomer(customerId: string): Promise<string> {
    await this.startTransaction();

    try {
      const deletedCustomer = await this.CustomerRepo.findByIdAndDelete(customerId).exec();
      if (!deletedCustomer) {
        throw new Error("Customer not found");
      }

      await this.commit();
      return 'Deleted customer successfully';
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}
