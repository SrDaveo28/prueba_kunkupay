import mongoose, { ClientSession, Model, Document } from "mongoose";

/**
 * BaseService para manejar transacciones en Mongoose
 */
export class BaseService {
  private session: ClientSession | null = null;

  /**
   * Inicia una transacción
   */
  async startTransaction() {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
  }

  /**
   * Obtiene un repositorio (modelo) dentro de la transacción
   * @param model - Modelo de Mongoose
   * @returns - Modelo que usa la sesión activa
   */
  getRepository<T extends Document>(model: Model<T>): Model<T> {
    if (!this.session) {
      throw new Error("No active transaction. Call startTransaction() first.");
    }
    return model;
  }

  /**
   * Guarda cambios y confirma la transacción
   */
  async commit() {
    if (!this.session) {
      throw new Error("No active transaction to commit");
    }
    await this.session.commitTransaction();
    this.session.endSession();
    this.session = null;
  }

  /**
   * Revierte la transacción en caso de error
   */
  async rollback() {
    if (!this.session) {
      throw new Error("No active transaction to rollback.");
    }
    await this.session.abortTransaction();
    this.session.endSession();
    this.session = null;
  }
}
