const { GoogleGenerativeAI } = require("@google/generative-ai");
const { allItems } = require("./menu");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildMenuContext() {
  return allItems
    .map(
      (item) =>
        `ID:${item.id} | ${item.name} | $${item.price} | ${item.category} | Tags: ${item.tags.join(", ")}`
    )
    .join("\n");
}

// Strip all markdown wrapper variants before JSON.parse.
function stripJsonBlocks(text) {
  let s = text.trim();
  // Fenced block: ```json ... ``` or ``` ... ```
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Single-backtick wrapping the entire response
  if (s.startsWith("`") && s.endsWith("`")) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function parseGeminiResponse(rawText) {
  const stripped = stripJsonBlocks(rawText);
  const parsed = JSON.parse(stripped); // throws on invalid JSON
  return {
    message: parsed.message || "",
    intent: parsed.intent || "other",
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
  };
}

function buildSystemInstruction(menuContext, cartSummary) {
  return `You are Bistro AI, a friendly assistant for The Intelligent Bistro restaurant. Help customers browse the menu, get recommendations, and manage their cart.

MENU ITEMS (ID | Name | Price | Category | Tags):
${menuContext}

CURRENT CART:
${cartSummary}

RESPONSE FORMAT — reply with a raw JSON object only. No markdown, no code blocks, no backticks, no extra text before or after the JSON:
{
  "message": "<warm conversational reply to show the customer>",
  "intent": "<one of: add_item | remove_item | update_quantity | clear_cart | browse_menu | recommend | question | other>",
  "actions": [
    // Include only the actions that apply. Omit the array or leave it empty if no cart changes.
    // add_to_cart:
    { "name": "add_to_cart", "input": { "items": [{ "item_id": "<id>", "quantity": <n> }] } },
    // remove_from_cart (omit quantity to remove the whole item; include quantity to subtract that amount):
    { "name": "remove_from_cart", "input": { "item_id": "<id>", "quantity": <n_optional> } },
    // update_quantity:
    { "name": "update_quantity", "input": { "item_id": "<id>", "quantity": <n> } },
    // clear_cart (no input needed):
    { "name": "clear_cart", "input": {} },
    // show_menu (optional filter):
    { "name": "show_menu", "input": { "category": "<optional>", "search": "<optional>" } }
  ]
}

GUIDELINES:
- Map natural language to menu IDs: "spicy chicken sandwich" → m3, "steak" → m2, "beer" → d4, "water" → d2
- "two spicy chicken sandwiches and a beer" → add_to_cart with [{item_id:"m3",quantity:2},{item_id:"d4",quantity:1}]
- DEFAULT QUANTITY: If no quantity is mentioned for an item, always default to quantity: 1. Never infer quantity from context. Only use quantity > 1 when the user explicitly states a number like "two", "2", "a couple", "a few", "three", etc.
- PARTIAL REMOVAL: When the user specifies a quantity to remove (e.g. "remove 1 bruschetta", "take off 2 fries"), use remove_from_cart with { "item_id": "<id>", "quantity": <n> } — the frontend subtracts that exact amount from the current cart quantity. Only omit the quantity field (remove the whole item) when the user says "remove all", "remove both", "remove it", or gives no quantity at all.
- "empty cart", "clear cart", "clear my cart", "remove everything", "start over", "wipe my order" → ALWAYS emit { "name": "clear_cart", "input": {} } and set intent to "clear_cart"
- If an item isn't on the menu, say so and suggest alternatives
- Be warm and concise; confirm actions in the message field
- Use prices when relevant`;
}

async function processMessage(userMessage, cartItems, conversationHistory) {
  const menuContext = buildMenuContext();

  const cartSummary =
    cartItems.length === 0
      ? "Empty"
      : cartItems.map((ci) => `- ${ci.quantity}x ${ci.name} ($${ci.price} each)`).join("\n");

  const systemInstruction = buildSystemInstruction(menuContext, cartSummary);

  const history = conversationHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });

  // First attempt
  const chat = model.startChat({ history });
  const rawText = await chat.sendMessage(userMessage).then((r) => r.response.text());
  console.log("[Gemini raw]", rawText);

  try {
    return parseGeminiResponse(rawText);
  } catch (firstErr) {
    console.warn("[Gemini parse failed, retrying]", firstErr.message);

    // Retry with an explicit instruction — fresh chat so the malformed reply isn't in history
    const retryChat = model.startChat({ history });
    const retryPrompt = `${userMessage}\n\nCRITICAL: Respond with ONLY a raw JSON object. No markdown, no backticks, no code fences, no explanatory text — just the JSON.`;
    const retryRaw = await retryChat.sendMessage(retryPrompt).then((r) => r.response.text());
    console.log("[Gemini retry raw]", retryRaw);

    try {
      return parseGeminiResponse(retryRaw);
    } catch (secondErr) {
      console.error("[Gemini retry also failed]", secondErr.message, "\nRaw:", retryRaw);
      return {
        message: "Sorry, I had a little hiccup there. Could you try saying that again?",
        intent: "other",
        actions: [],
      };
    }
  }
}

module.exports = { processMessage };
