import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();
router.use(authMiddleware);

/**
 * * Route to get a list of all transactions.
 * @author zelebwr
 */
router.get("/statistics", transactionController.getTransactionStatistics);
/**
 * * Route to get a list of all transactions.
 * @author zelebwrx
 */
router.get("/", transactionController.getAllTransactions);

/**
 * * Route to get details of a single transaction by ID.
 * @author zelebwr
 * @param transaction_id The UUID of the transaction to retrieve.
 */
router.get("/:transaction_id", transactionController.getTransactionById);

/**
 * * Route to create a new transaction (purchase).
 * @author zelebwr
 * Expects body: { userId: string, books: [{ bookId: string, quantity: number }] }
 */
router.post("/", transactionController.createTransaction);

export default router;
