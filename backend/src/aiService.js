const Anthropic = require("@anthropic-ai/sdk");
const { allItems } = require("./menu");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools = [
  {
    name: "add_to_cart",
    description:
      "Add one or more items to the customer's cart. Use this when the user wants to order something.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item_id: { type: "string", description: "The menu item ID" },
              quantity: { type: "number", description: "Number of items to add" },
            },
            required: ["item_id", "quantity"],
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Remove an item completely from the cart.",
    input_schema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "The menu item ID to remove" },
      },
      required: ["item_id"],
    },
  },
  {
    name: "update_quantity",
    description: "Update the quantity of an item already in the cart.",
    input_schema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "The menu item ID" },
        quantity: { type: "number", description: "New quantity (0 to remove)" },
      },
      required: ["item_id", "quantity"],
    },
  },
  {
    name: "clear_cart",
    description: "Remove all items from the cart.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "show_menu",
    description: "Display menu items to the user, optionally filtered by category or search term.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter: starters, mains, sides, drinks, desserts",
        },
        search: { type: "string", description: "Optional search term to filter items" },
      },
    },
  },
];

function buildMenuContext() {
  return allItems
    .map(
      (item) =>
        `ID:${item.id} | ${item.name} | $${item.price} | ${item.category} | Tags: ${item.tags.join(", ")}`
    )
    .join("\n");
}

async function processMessage(userMessage, cartItems, conversationHistory) {
  const menuContext = buildMenuContext();

  const systemPrompt = `You are Bistro AI, a friendly and knowledgeable assistant for The Intelligent Bistro restaurant. You help customers browse the menu, get recommendations, and manage their orders through natural conversation.

MENU ITEMS (ID | Name | Price | Category | Tags):
${menuContext}

CURRENT CART:
${
  cartItems.length === 0
    ? "Empty"
    : cartItems
        .map((ci) => `- ${ci.quantity}x ${ci.name} ($${ci.price} each)`)
        .join("\n")
}

GUIDELINES:
- Be warm, enthusiastic, and helpful
- When users mention food items, map them to menu IDs and use the tools
- Handle natural language like "two spicy chicken sandwiches" → add_to_cart with item m3, quantity 2
- Handle vague references: "the steak" → m2, "a beer" → d4, "water" → d2
- Suggest complementary items when appropriate
- If something isn't on the menu, politely say so and offer alternatives
- Confirm actions after executing them
- Keep responses concise and conversational
- Use dollar amounts when discussing prices`;

  const messages = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  });

  const actions = [];
  let textResponse = "";

  for (const block of response.content) {
    if (block.type === "text") {
      textResponse += block.text;
    } else if (block.type === "tool_use") {
      actions.push({ name: block.name, input: block.input });
    }
  }

  return {
    message: textResponse,
    actions,
    stop_reason: response.stop_reason,
  };
}

module.exports = { processMessage };
