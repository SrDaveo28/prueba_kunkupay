import { BaseService } from "./base.service";
import SalesModel, { ISales } from "../models/sales.model";
import CustomerModel from "../models/customer.model";

export class SalesService extends BaseService {
  private SalesRepo = SalesModel;
  private CustomerRepo = CustomerModel;

  /**
   * Crea una nueva venta dentro de una transacción.
   * @param saleData - Datos de la venta.
   * @returns Mensaje de confirmación.
   */
  async createSale(saleData: ISales): Promise<string> {
    await this.startTransaction();

    try {
      const customer = await this.CustomerRepo.findById(saleData.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const newSale = new this.SalesRepo(saleData);
      await newSale.save();

      await this.commit();
      return "Sale created successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Obtiene una venta por su ID.
   * @param saleId - ID de la venta.
   * @returns La venta encontrada o error si no existe.
   */
  async getSaleById(saleId: string): Promise<ISales> {
    const sale = await this.SalesRepo.findById(saleId).exec();
    if (!sale) {
      throw new Error("Sale not found");
    }
    return sale;
  }

  /**
   * Actualiza una venta por su ID dentro de una transacción.
   * @param saleId - ID de la venta.
   * @param updateData - Datos a actualizar.
   * @returns La venta actualizada o error si no existe.
   */
  async updateSale(
    saleId: string,
    updateData: Partial<ISales>
  ): Promise<ISales> {
    await this.startTransaction();

    try {
      // Verificar si se está intentando cambiar el estado a "completado"
      if (updateData.status === "completado") {
        throw new Error(
          "Cannot update status to 'completado' directly. Use processPayout instead."
        );
      }

      const sale = await this.SalesRepo.findById(saleId).exec();
      if (!sale) {
        throw new Error("Sale not found");
      }

      const updatedSale = await this.SalesRepo.findByIdAndUpdate(
        saleId,
        updateData,
        { new: true }
      ).exec();

      if (!updatedSale) {
        throw new Error("Sale not found");
      }

      await this.commit();
      return updatedSale;
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Elimina una venta por su ID dentro de una transacción.
   * @param saleId - ID de la venta.
   * @returns La venta eliminada o error si no existe.
   */
  async deleteSale(saleId: string): Promise<string> {
    await this.startTransaction();

    try {
      const deletedSale = await this.SalesRepo.findByIdAndDelete(saleId).exec();
      if (!deletedSale) {
        throw new Error("Sale not found");
      }

      await this.commit();
      return "Delete sale successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}
