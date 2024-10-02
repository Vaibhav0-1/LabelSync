import  express from "express";
import userRouter from "./routers/user"
import workerRouter from "./routers/worker"
const app = express();
 
export const JWT_SECRET: string = process.env.JWT_SECRET as string;

app.use(express.json());


app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });