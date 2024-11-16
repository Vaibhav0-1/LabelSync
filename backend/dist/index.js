"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routers/user"));
const worker_1 = __importDefault(require("./routers/worker"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.JWT_SECRET = process.env.JWT_SECRET;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use("/v1/user", user_1.default);
app.use("/v1/worker", worker_1.default);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
