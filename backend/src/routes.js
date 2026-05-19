const express = require("express");
const router = express.Router();
const { menu, getItemById } = require("./menu");
const { processMessage } = require("./aiService");

router.get("/menu", (req, res) => {
  res.json({ success: true, data: menu });
});

router.post("/chat", async (req, res) => {
  const { message, cart = [], history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    const cartItems = cart.map((ci) => {
      const item = getItemById(ci.id);
      return item ? { ...item, quantity: ci.quantity } : null;
    }).filter(Boolean);

    const result = await processMessage(message.trim(), cartItems, history);

    console.log("[actions]", JSON.stringify(result.actions, null, 2));

    res.json({
      success: true,
      message: result.message,
      actions: result.actions,
      intent: result.intent,
    });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ success: false, error: "Failed to process message" });
  }
});

router.get("/item/:id", (req, res) => {
  const item = getItemById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: "Item not found" });
  res.json({ success: true, data: item });
});

module.exports = router;
