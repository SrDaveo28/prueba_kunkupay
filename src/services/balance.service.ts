import { BaseService } from "./base.service";
import SalesModel from "../models/sales.model";
import PayoutsModel from "../models/payouts.model";
import AdjustmentsModel from "../models/adjustments.model";

export class BalanceService extends BaseService {
  private SalesRepo = SalesModel;
  private PayoutsRepo = PayoutsModel;
  private AdjustmentsRepo = AdjustmentsModel;

  /* Sobre los puntos hablados en la entrevista: 
  Este código implementa dos funciones clave para gestionar el balance financiero de un cliente 
  y su historial de transacciones. 
  calculateBalance obtiene todas las ventas de un cliente, sus pagos asociados
  y los ajustes generales, sumando los montos para calcular un balance dinámico 
  sin necesidad de persistencia adicional, lo que asegura que los datos reflejen 
  el estado actual en tiempo real. Este enfoque es eficiente porque 
  evita inconsistencias por registros desactualizados, 
  getTransactionHistory construye un historial de transacciones combinando ventas,
  pagos y ajustes en una sola lista ordenada por fecha, lo que permite una visión clara y estructurada de la 
  actividad del cliente. Para garantizar la integridad de los datos, la consulta se maneja 
  con promesas concurrentes (Promise.all), mejorando el rendimiento y reduciendo bloqueos en la base de datos.
  */

  /**
   * Calcula el balance final de un cliente.
   * @param customerId - ID del cliente.
   * @returns El balance final.
   */
  async calculateBalance(customerId: string): Promise<{
    totalSales: number;
    totalPayouts: number;
    totalAdjustments: number;
    balance: number;
  }> {
    try {
      // Obtener las ventas del cliente
      const salesPromise = this.SalesRepo.find({ customerId }).lean().exec();

      // Obtener los pagos relacionados con las ventas del cliente
      const payoutsPromise = salesPromise.then((sales) =>
        this.PayoutsRepo.find({
          saleId: { $in: sales.map((sale) => sale._id) },
        })
          .lean()
          .exec()
      );

      // Obtener los ajustes (pueden ser específicos o generales)
      const adjustmentsPromise = this.AdjustmentsRepo.find().lean().exec();

      const [sales, payouts, adjustments] = await Promise.all([
        salesPromise,
        payoutsPromise,
        adjustmentsPromise,
      ]);

      // Calcular la suma de ventas, pagos y ajustes
      const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);
      const totalPayouts = payouts.reduce(
        (acc, payout) => acc + payout.amount,
        0
      );
      const totalAdjustments = adjustments.reduce(
        (acc, adjustment) => acc + adjustment.amount,
        0
      );

      // Calcular el balance final
      const balance = totalSales - totalPayouts + totalAdjustments;
      return {
        totalSales,
        totalPayouts,
        totalAdjustments,
        balance,
      };
    } catch (error) {
      throw new Error(`Error calculating balance: ${error}`);
    }
  }

  /**
   * Obtiene el historial de movimientos del cliente.
   * @param customerId - ID del cliente.
   * @returns El historial de movimientos.
   */
  async getTransactionHistory(customerId: string): Promise<any[]> {
    try {
      // Obtener las ventas del cliente
      const salesPromise = this.SalesRepo.find({ customerId }).lean().exec();

      // Obtener los pagos relacionados con las ventas del cliente
      const payoutsPromise = salesPromise.then((sales) =>
        this.PayoutsRepo.find({
          saleId: { $in: sales.map((sale) => sale._id) },
        })
          .lean()
          .exec()
      );

      // Obtener los ajustes (pueden ser específicos o generales)
      const adjustmentsPromise = this.AdjustmentsRepo.find().lean().exec();

      const [sales, payouts, adjustments] = await Promise.all([
        salesPromise,
        payoutsPromise,
        adjustmentsPromise,
      ]);

      // Combinar los resultados en un solo historial
      const history = [
        ...sales.map((sale) => ({
          type: "Venta",
          amount: sale.amount,
          status: sale.status,
          createdAt: sale.createdAt,
        })),
        ...payouts.map((payout) => ({
          type: "Pago",
          amount: payout.amount,
          status: payout.status,
          createdAt: payout.createdAt,
        })),
        ...adjustments.map((adjustment) => ({
          type: "Ajuste",
          amount: adjustment.amount,
          createdAt: adjustment.createdAt,
        })),
      ];

      // Ordenar el historial por fecha
      history.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

      return history;
    } catch (error) {
      throw new Error(`Error retrieving transaction history: ${error}`);
    }
  }
}
