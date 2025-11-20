# KissFlow Onboarding Hub - Backend API

Backend API server for the KissFlow Onboarding Platform. Provides RESTful endpoints for video progress tracking, quiz validation, and ElevenLabs agent management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript 5.8+ (installed via npm)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your actual values:

```env
PORT=3001
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Agent ID (single video: Managing Items - Initiator, videoId "4")
ELEVENLABS_AGENT_ID_4=your-agent-id-for-managing-items-initiator

FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://username:password@localhost:5432/kissflow_onboarding
```

See `.env.example` for all available configuration options.

### Neon PostgreSQL Setup

If you're using Neon (serverless PostgreSQL), see [NEON_SETUP.md](./NEON_SETUP.md) for detailed instructions. The connection code automatically handles SSL for Neon connections.

### Running the Server

```bash
# Development mode (with auto-reload using tsx)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production mode (runs compiled JavaScript)
npm start
```

The server will run on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Agents
- `GET /api/agents/:videoId` - Get agent ID for a video
- `GET /api/agents` - Get all agent mappings

### Quiz
- `GET /api/quiz/:videoId/questions` - Get questions for a video
- `POST /api/quiz/validate` - Validate a single answer
- `POST /api/quiz/:videoId/validate-all` - Validate all answers

### Videos
- `POST /api/videos/:videoId/complete` - Mark video as complete (requires 100% correctness)
- `GET /api/videos/:videoId/progress` - Get progress for a video
- `GET /api/videos/progress` - Get all progress for a user

### ElevenLabs
- `POST /api/elevenlabs/webhook` - Receive webhook callbacks from ElevenLabs
- `POST /api/elevenlabs/start-conversation` - Initialize a conversation
- `GET /api/elevenlabs/conversation/:conversationId/status` - Check conversation status

## 🔧 Configuration

### ElevenLabs Setup

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/)
2. Create a Conversational AI agent
3. Configure the agent with:
   - Knowledge base about video topics
   - Conversation flow for quiz questions
   - Webhook URL pointing to your backend: `https://your-domain.com/api/elevenlabs/webhook`
4. Copy the agent ID and add it to your `.env` file

### CORS Configuration

The backend is configured to accept requests from the frontend URL specified in `FRONTEND_URL`. Update this in production to match your frontend domain.

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── agents.ts          # Agent ID configuration
│   └── questions.ts       # Quiz questions and answers
├── routes/
│   ├── agents.ts          # Agent endpoints
│   ├── quiz.ts            # Quiz validation endpoints
│   ├── videos.ts          # Video progress endpoints
│   └── elevenlabs.ts      # ElevenLabs webhook and conversation endpoints
├── services/
│   ├── database.ts        # Database service layer
│   └── validation.ts      # Answer validation logic
├── db/
│   └── connection.ts      # PostgreSQL connection pool
├── types/
│   └── index.ts           # TypeScript type definitions
├── scripts/
│   └── test-webhook.ts    # Webhook testing script
├── server.ts              # Main server file
├── tsconfig.json          # TypeScript configuration
├── package.json
└── README.md
```

## 🔐 Security Notes

- Quiz questions are returned without correct answers (security)
- All answers are validated server-side
- 100% correctness required before video completion
- API keys stored in environment variables

## 📝 Features

### Quiz Validation
- Keyword-based answer matching
- Flexible answer validation (accepts variations)
- 100% correctness requirement
- Server-side validation only

### Progress Tracking
- PostgreSQL database storage
- Tracks completion status per user/video
- Stores answers and timestamps
- Automatic schema initialization

### ElevenLabs Integration
- Webhook support for conversation events
- Conversation tracking
- Automatic progress updates on completion

## 🚧 TODO / Next Steps

1. ✅ **TypeScript Migration**: Backend converted to TypeScript for consistency
2. ✅ **Database Integration**: PostgreSQL integration complete
3. **User Authentication**: Add JWT-based authentication
4. **Error Handling**: Enhanced error handling and logging
5. **Testing**: Add unit and integration tests
6. **API Documentation**: Add Swagger/OpenAPI documentation
7. **Rate Limiting**: Add rate limiting middleware
8. **Logging**: Add structured logging (Winston/Pino)

## 🧪 Testing Webhook Integration

A test script is provided to test the webhook endpoint:

```bash
npm run test:webhook
```

Note: The test script now uses TypeScript (`tsx`) to run directly.

This will test:
- `conversation.started` event
- `conversation.completed` event (with correct answers)
- `conversation.completed` event (with incorrect answers)

See `ELEVENLABS_SETUP.md` for detailed setup instructions.

## 🔗 Frontend Integration

The frontend should be configured to make requests to this backend API. In development, the frontend can proxy requests through Vite, or make direct requests to `http://localhost:3001/api/*`.

## 📄 License

ISC

