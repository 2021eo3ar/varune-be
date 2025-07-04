# Varune Brand Narrative AI Backend

This repository contains the backend for **Varune**, an AI-powered platform for generating robust, context-aware brand narratives with chat continuity (like ChatGPT), a credit-based system, and flexible prompt logic. Built with TypeScript, Express, Drizzle ORM, and PostgreSQL.

---

## 🚀 Features

- **Context-Aware Narrative Generation:**
  - Supports both short and long narratives with dynamic prompt building.
  - Maintains chat continuity (threaded conversations) for follow-up instructions.
- **Credit-Based System:**
  - Users have credits that are checked and decremented per narrative request.
- **Flexible Prompt Logic:**
  - Prompts are built using original task, chat history, and new user instructions.
- **Extensible & Modular:**
  - Clean code structure for easy feature addition and maintenance.

---

## 📁 Folder Structure

```
├── drizzle.config.ts         # Drizzle ORM config
├── package.json
├── tsconfig.json
├── Readme.md
├── drizzle/                  # Drizzle migration output
│   ├── 0000_marvelous_scourge.sql
│   └── meta/
│       ├── _journal.json
│       └── 0000_snapshot.json
├── src/
│   ├── app.ts                # Express app entry
│   ├── config/               # Configs (db, env, logger, etc)
│   ├── controllers/          # Route controllers
│   ├── db/                   # DB schema, table drop scripts
│   ├── enums/                # Enums
│   ├── middlewares/          # Auth, credit, etc
│   ├── routes/               # Express routes
│   ├── services/             # Business logic
│   └── utils/                # Prompt builder, types, helpers
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/2021eo3ar/varune-narrative-assignment.git
cd varune-narrative-assignment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

- Copy `.env.example` to `.env` and fill in your database and API keys.
```
PORT=8000
DB_URL=
JWT_SECRET=
EXPIREATION_MINUTE=43200
BASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback
CLIENT_REDIRECT_URL=
GROQ_API=
```

### 4. Run Database Migrations

```bash
npm run migration:generate
npm run migration:push
```

### 5. Start the Backend Server

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 8000).

---

## 🔄 Workflow Diagram

```
┌──────────────┐   Request   ┌──────────────┐   Validate   ┌──────────────┐
│   Client     │ ──────────▶ │   Express    │ ───────────▶ │  Middleware  │
└──────────────┘             └──────────────┘   (Auth,     └──────────────┘
        ▲                          │           Credit)           │
        │                          ▼                             ▼
        │                  ┌──────────────┐               ┌──────────────┐
        │                  │ Controller   │               │  Prompt      │
        │                  │ (narrative)  │               │  Builder     │
        │                  └──────────────┘               └──────────────┘
        │                          │                             │
        │                          ▼                             ▼
        │                  ┌──────────────┐               ┌──────────────┐
        │                  │  Drizzle ORM │               │  AI Model    │
        │                  └──────────────┘               └──────────────┘
        │                          │                             │
        │                          ▼                             ▼
        │                  ┌──────────────┐               ┌──────────────┐
        │                  │  PostgreSQL  │               │  Response    │
        │                  └──────────────┘               └──────────────┘
        │                          │                             │
        │                          ▼                             ▼
        └───────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

Test endpoints using Postman or any API client. For chat continuity, always pass the original task and chat history as described in the API docs.

---

## 📄 License

MIT License

---

## 🌐 Live Backend (Demo)

> https://varune-backend-demo.example.com

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

