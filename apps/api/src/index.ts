import express from "express";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});