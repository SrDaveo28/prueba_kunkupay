import { BaseService } from "./base.service";
import PayoutsModel, { IPayouts } from "../models/payouts.model";
import SalesModel, { ISales } from "../models/sales.model";

export class PayoutsService extends BaseService {
  private PayoutsRepo = PayoutsModel;
  private SalesRepo = SalesModel;

  /**
   * Crea un nuevo pago y actualiza el estado de la venta si es necesario.
   * @param payoutData - Datos del pago.
   * @returns Mensaje de confirmación.
   */
  async createPayout(payoutData: IPayouts): Promise<string> {
    await this.startTransaction();

    try {
      const sale = await this.SalesRepo.findById(payoutData.saleId).exec();
      if (!sale) {
        throw new Error("Sale not found");
      }

      const newPayout = new this.PayoutsRepo(payoutData);
      await newPayout.save();

      // Actualizar el estado de la venta si el total de pagos completados alcanza el monto de la venta.
      const totalPayouts = await this.PayoutsRepo.aggregate([
        { $match: { saleId: payoutData.saleId, status: "completado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const completedAmount = totalPayouts[0]?.total || 0;

      if (completedAmount >= sale.amount) {
        await this.SalesRepo.findByIdAndUpdate(payoutData.saleId, {
          status: "completado",
        }).exec();
      }

      await this.commit();
      return "Payout created successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Obtiene un pago por su ID.
   * @param payoutId - ID del pago.
   * @returns El pago encontrado o error si no existe.
   */
  async getPayoutById(payoutId: string): Promise<IPayouts> {
    const payout = await this.PayoutsRepo.findById(payoutId).exec();
    if (!payout) {
      throw new Error("Payout not found");
    }
    return payout;
  }
  /**
   * Actualiza un pago por su ID dentro de una transacción.
   * @param payoutId - ID del pago.
   * @param updateData - Datos a actualizar.
   * @returns El pago actualizado o error si no existe.
   */
  async updatePayout(
    payoutId: string,
    updateData: Partial<IPayouts>
  ): Promise<IPayouts> {
    await this.startTransaction();

    try {
      // Verificar si se está intentando cambiar el estado a "completado"
      if (updateData.status === "completado") {
        throw new Error(
          "Cannot update status to 'completado' directly. Use processPayout instead."
        );
      }

      // Actualizar el pago
      const updatedPayout = await this.PayoutsRepo.findByIdAndUpdate(
        payoutId,
        updateData,
        { new: true }
      ).exec();
      if (!updatedPayout) {
        throw new Error("Payout not found");
      }

      await this.commit();
      return updatedPayout;
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Procesa un pago y actualiza el estado de la venta si es necesario.
   * @param payoutId - ID del pago a procesar.
   * @returns Mensaje de confirmación.
   */
  async processPayout(payoutId: string): Promise<string> {
    await this.startTransaction();

    try {
      // Obtener el pago por ID
      const payout = await this.PayoutsRepo.findById(payoutId).exec();
      if (!payout) {
        throw new Error("Payout not found");
      }

      // Cambiar el estado del pago a "completado"
      payout.status = "completado";
      await payout.save();

      // Verificar si se debe actualizar el estado de la venta
      const sale = await this.SalesRepo.findById(payout.saleId).exec();
      if (!sale) {
        throw new Error("Sale not found");
      }

      // Calcular el total de pagos completados para esta venta
      const totalPayouts = await this.PayoutsRepo.aggregate([
        { $match: { saleId: payout.saleId, status: "completado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const completedAmount = totalPayouts[0]?.total || 0;

      // Actualizar el estado de la venta si el total de pagos completados alcanza el monto de la venta
      if (completedAmount >= sale.amount) {
        await this.SalesRepo.findByIdAndUpdate(payout.saleId, {
          status: "completado",
        }).exec();
      }

      await this.commit();
      return "Payout processed successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Elimina un pago por su ID dentro de una transacción.
   * @param payoutId - ID del pago.
   * @returns Mensaje de confirmación.
   */
  async deletePayout(payoutId: string): Promise<string> {
    await this.startTransaction();

    try {
      const deletedPayout = await this.PayoutsRepo.findByIdAndDelete(
        payoutId
      ).exec();
      if (!deletedPayout) {
        throw new Error("Payout not found");
      }

      await this.commit();
      return "Payout deleted successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}
