"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKER_JWT_SECRET = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const __1 = require("..");
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const types_1 = require("../types");
exports.WORKER_JWT_SECRET = __1.JWT_SECRET + "worker";
const TOTAL_SUBMISSIONS = 100;
const prismaClient = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/balance", middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: Number(userId)
        }
    });
    res.json({
        pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
        lockedAmount: worker === null || worker === void 0 ? void 0 : worker.locked_amount
    });
}));
router.post("/submission", middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = types_1.createSubmissionInput.safeParse(body);
    if (parsedBody.success) {
        const task = yield (0, db_1.getNextTask)(Number(userId));
        if (!task || (task === null || task === void 0 ? void 0 : task.id) !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id"
            });
        }
        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
        const submisison = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const submission = yield tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedBody.data.taskId),
                    amount
                }
            });
            yield tx.worker.update({
                where: {
                    id: userId,
                },
                data: {
                    pending_amount: {
                        increment: Number(amount)
                    }
                }
            });
            return submission;
        }));
        const nextTask = yield (0, db_1.getNextTask)(Number(userId));
        res.json({
            nextTask,
            amount
        });
    }
    else {
        res.status(411).json({
            message: "Incorrect inputs"
        });
    }
}));
router.get("/nexttask", middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const task = yield (0, db_1.getNextTask)(Number(userId));
    if (!task) {
        res.status(411).json({
            message: "No more tasks left for you to review"
        });
    }
    else {
        res.status(411).json({
            task
        });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Todo: add sign verificartion logic here
    const hardcodedWalletAddress = "3hwCCfEKk3Buj36NKzzgDEiraeM175h8REKnSfjQKbBa";
    const existingUser = yield prismaClient.worker.findFirst({
        where: {
            address: hardcodedWalletAddress
        }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
        }, exports.WORKER_JWT_SECRET);
        res.json({
            token
        });
    }
    else {
        const user = yield prismaClient.worker.create({
            data: {
                address: hardcodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id
        }, exports.WORKER_JWT_SECRET);
        res.json({
            token
        });
    }
}));
exports.default = router;
