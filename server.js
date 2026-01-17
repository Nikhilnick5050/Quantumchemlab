import express from "express";
import cors from "cors";
import chatkitRoutes from "./server/routes/chatkit.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HELLO FROM SERVER");
});

/**
 * 🔥 THIS LINE WAS MISSING 🔥
 */
app.use("/api/chatkit", chatkitRoutes);

app.listen(3000, () => {
  console.log("SERVER STARTED ON PORT 3000");
});
