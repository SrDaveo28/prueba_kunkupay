import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();
const customerController = new CustomerController();

router.post("/", customerController.createCustomer.bind(customerController));
router.get("/:customerId", customerController.getCustomerById.bind(customerController));
router.get("/", customerController.getAllCustomers.bind(customerController));
router.put("/:customerId", customerController.updateCustomer.bind(customerController));
router.delete("/:customerId", customerController.deleteCustomer.bind(customerController));

export default router;
