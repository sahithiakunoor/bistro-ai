# The Intelligent Bistro 🍽️

A high-fidelity mobile ordering experience powered by conversational AI. Browse the menu and manage your cart through natural language — just tell the AI what you want.

## Architecture

```
bistro-ai/
├── backend/       # Node.js + Express API
│   └── src/
│       ├── index.js       # Server entry point
│       ├── routes.js      # API routes (/menu, /chat)
│       ├── aiService.js   # Claude AI integration with tool use
│       └── menu.js        # Menu data & helpers
└── frontend/      # React Native (Expo) app
    └── src/
        ├── constants/     # Colors, API config
        ├── store/         # Zustand state (cart, menu, chat)
        ├── components/    # Reusable UI (MenuItemCard, ChatBubble, CartItem…)
        └── screens/       # MenuScreen, ChatScreen, CartScreen
```

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Mobile    | React Native (Expo SDK 54)              |
| Navigation| React Navigation v6 (bottom tabs + stack) |
| State     | Zustand                                 |
| Backend   | Node.js + Express                       |
| AI        | Anthropic Claude (claude-haiku-4-5) with tool use |

## Features

- **AI-Driven Ordering**: Natural language cart management ("Add two spicy chicken sandwiches and a beer")
- **Structured Actions**: Claude uses tool use to return structured JSON cart operations
- **Full Cart Control**: Add, remove, update quantities via UI or AI
- **Dark Mode UI**: Premium dark theme with gold accents
- **Category Browse**: Filter by Starters, Mains, Sides, Drinks, Desserts
- **Search**: Full-text search across menu items
- **Popular Items**: Curated section for top dishes

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
# Edit src/constants/api.js with your backend URL
npx expo start
```

Scan the QR code with Expo Go on your device, or press `w` for web.

## AI Chat Examples

- "Add 2 spicy chicken sandwiches"
- "What's vegetarian on the menu?"
- "I'd like a steak and a glass of red wine"
- "Remove the fries from my cart"
- "What do you recommend with the salmon?"
- "Clear my cart and start over"
