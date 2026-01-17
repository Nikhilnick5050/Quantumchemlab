import express from "express";

const router = express.Router();

router.post("/start", (req, res) => {
  console.log("ChatKit start called");
  console.log(req.body);

  res.json({
    success: true,
    message: "ChatKit route is working"
  });
});

export default router;
