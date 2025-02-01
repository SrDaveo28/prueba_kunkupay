import { BaseService } from "./base.service";
import AdjustmentModel, { IAdjustment } from "../models/adjustments.model";

export class AdjustmentService extends BaseService {
  private AdjustmentRepo = AdjustmentModel;

  /**
   * Crea un nuevo ajuste dentro de una transacción.
   * @param adjustmentData - Datos del ajuste.
   * @returns Mensaje de confirmación.
   */
  async createAdjustment(adjustmentData: IAdjustment): Promise<string> {
    await this.startTransaction();
    try {
      const newAdjustment = new this.AdjustmentRepo(adjustmentData);
      await newAdjustment.save();
      await this.commit();
      return "Adjustment created successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Obtiene un ajuste por su ID.
   * @param adjustmentId - ID del ajuste.
   * @returns El ajuste encontrado o error si no existe.
   */
  async getAdjustmentById(adjustmentId: string): Promise<IAdjustment> {
    const adjustment = await this.AdjustmentRepo.findById(adjustmentId).exec();
    if (!adjustment) {
      throw new Error("Adjustment not found");
    }
    return adjustment;
  }

  /**
   * Obtiene todos los ajustes.
   * @returns Lista de ajustes.
   */
  async getAllAdjustments(): Promise<IAdjustment[]> {
    return this.AdjustmentRepo.find().exec();
  }
  /**
   * Actualiza un ajuste por su ID dentro de una transacción.
   * @param adjustmentId - ID del ajuste.
   * @param updateData - Datos a actualizar.
   * @returns El ajuste actualizado o error si no existe.
   */
  async updateAdjustment(
    adjustmentId: string,
    updateData: Partial<IAdjustment>
  ): Promise<IAdjustment> {
    await this.startTransaction();
    try {
      const updatedAdjustment = await this.AdjustmentRepo.findByIdAndUpdate(
        adjustmentId,
        updateData,
        { new: true }
      ).exec();
      if (!updatedAdjustment) {
        throw new Error("Adjustment not found");
      }
      await this.commit();
      return updatedAdjustment;
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Elimina un ajuste por su ID dentro de una transacción.
   * @param adjustmentId - ID del ajuste.
   * @returns El ajuste eliminado o error si no existe.
   */
  async deleteAdjustment(adjustmentId: string): Promise<string> {
    await this.startTransaction();
    try {
      const deletedAdjustment = await this.AdjustmentRepo.findByIdAndDelete(
        adjustmentId
      ).exec();
      if (!deletedAdjustment) {
        throw new Error("Adjustment not found");
      }
      await this.commit();
      return "Delete adjustment successfully";
    } catch (error) {
      await this.rollback();
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}
