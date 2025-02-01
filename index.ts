import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/dbConnection/connection";
import customerRoutes from "./src/routes/customer.route";
import adjustmentRoutes from "./src/routes/adjustment.route";
import saleRoutes from "./src/routes/sale.route";
import payoutRoutes from "./src/routes/payout.route";
import balanceRoutes from "./src/routes/balance.route";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas
app.use("/customer", customerRoutes);
app.use("/adjustment", adjustmentRoutes);
app.use("/sale", saleRoutes);
app.use("/payout", payoutRoutes);
app.use("/balance", balanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
