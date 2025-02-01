import { BaseService } from "./base.service";
import PayoutsModel, { IPayouts } from "../models/payouts.model";
import SalesModel from "../models/sales.model";
import AdjustmentModel from "../models/adjustments.model";

export class PayoutsService extends BaseService {
  private PayoutsRepo = PayoutsModel;
  private SalesRepo = SalesModel;
  private AdjustmentRepo = AdjustmentModel;

  /**
   * Crea un nuevo pago y actualiza el estado de la venta si es necesario.
   * @param payoutData - Datos del pago.
   * @returns Mensaje de confirmación.
   */
  async createPayout(payoutData: Partial<IPayouts>): Promise<string> {
    await this.startTransaction();

    try {
      // Validar si la venta existe
      const sale = await this.SalesRepo.findById(payoutData.saleId).exec();
      if (!sale) {
        throw new Error("Sale not found");
      }

      // Si se proporciona adjustmentId, validar que exista
      if (payoutData.adjustmentId) {
        const adjustment = await this.AdjustmentRepo.findById(
          payoutData.adjustmentId
        ).exec();
        if (!adjustment) {
          throw new Error("Adjustment not found");
        }
      }

      // Crear el nuevo pago sin incluir adjustmentId si no está presente
      const newPayoutData: Partial<IPayouts> = {
        amount: payoutData.amount,
        saleId: payoutData.saleId,
        status: payoutData.status,
      };

      if (payoutData.adjustmentId) {
        newPayoutData.adjustmentId = payoutData.adjustmentId;
      }

      const newPayout = new this.PayoutsRepo(newPayoutData);

      await newPayout.save();

      // Calcular el total de pagos completados
      const totalPayouts = await this.PayoutsRepo.aggregate([
        { $match: { saleId: payoutData.saleId, status: "completado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const completedAmount = totalPayouts[0]?.total || 0;

      // Actualizar el estado de la venta si el total de pagos alcanzó el monto de la venta
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
      // Verificar si se intenta cambiar el estado a "completado"
      if (updateData.status === "completado") {
        throw new Error(
          "Cannot update status to 'completado' directly. Use processPayout instead."
        );
      }

      // Buscar el pago antes de actualizar
      const existingPayout = await this.PayoutsRepo.findById(payoutId).exec();
      if (!existingPayout) {
        throw new Error("Payout not found");
      }

      // Si se proporciona un nuevo adjustmentId, validarlo
      if (updateData.adjustmentId) {
        const adjustment = await this.AdjustmentRepo.findById(
          updateData.adjustmentId
        ).exec();
        if (!adjustment) {
          throw new Error("Adjustment not found");
        }
      }

      // Actualizar el pago
      const updatedPayout = await this.PayoutsRepo.findByIdAndUpdate(
        payoutId,
        updateData,
        { new: true }
      ).exec();
      if (!updatedPayout) {
        throw new Error("Failed to update payout");
      }

      // Recalcular el total de pagos completados para la venta
      const totalPayouts = await this.PayoutsRepo.aggregate([
        { $match: { saleId: existingPayout.saleId, status: "completado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const completedAmount = totalPayouts[0]?.total || 0;

      // Actualizar el estado de la venta si es necesario
      const sale = await this.SalesRepo.findById(existingPayout.saleId).exec();
      if (sale && completedAmount < sale.amount) {
        await this.SalesRepo.findByIdAndUpdate(existingPayout.saleId, {
          status: "pendiente",
        }).exec();
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
