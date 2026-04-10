import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
    createHabit, getHabits, toggleHabit, deleteHabit,
    logMood, getMoods,
    addSpending, getSpendings, deleteSpending,
    getDailyAdvice, getDashboardSummary
} from "../controllers/lifeOS.controller.js";

const lifeOSRouter = Router();

lifeOSRouter.use(authUser);

lifeOSRouter.get("/summary", getDashboardSummary);
lifeOSRouter.get("/advice", getDailyAdvice);

lifeOSRouter.post("/habits", createHabit);
lifeOSRouter.get("/habits", getHabits);
lifeOSRouter.patch("/habits/:habitId/toggle", toggleHabit);
lifeOSRouter.delete("/habits/:habitId", deleteHabit);

lifeOSRouter.post("/mood", logMood);
lifeOSRouter.get("/mood", getMoods);

lifeOSRouter.post("/spending", addSpending);
lifeOSRouter.get("/spending", getSpendings);
lifeOSRouter.delete("/spending/:id", deleteSpending);

export default lifeOSRouter;