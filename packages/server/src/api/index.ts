import { Router } from "express";

import authRoute from "./auth.routes";
import bookRouter from "./book.routes";
import genreRouter from "./genre.routes";
import transactionRouter from "./transaction.routes";

const router: Router = Router();

router.use("/auth", authRoute);
router.use("/books", bookRouter);
router.use("/genre", genreRouter);
router.use("/transactions", transactionRouter);

export default router;
