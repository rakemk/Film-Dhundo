import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moviesRouter from "./movies";
import watchlistRouter from "./watchlist";
import paymentRouter from "./payment";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(moviesRouter);
router.use(watchlistRouter);
router.use(paymentRouter);
router.use(adminRouter);

export default router;
