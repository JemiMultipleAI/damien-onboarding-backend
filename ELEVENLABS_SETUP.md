# ElevenLabs Agent Setup Guide

This guide will help you set up ElevenLabs Conversational AI agents for the KissFlow Onboarding Platform.

## Prerequisites

1. ElevenLabs account with API access
2. Backend server running and accessible (for webhook)
3. PostgreSQL database configured

## Step 1: Create Agents in ElevenLabs Dashboard

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/)
2. Navigate to **Conversational AI** > **Agents**
3. Create **5 separate main agents** (one for each video module)
   - **Important**: Create them as separate main agents, not subagents
   - This approach works with any ElevenLabs plan and is simpler to manage

### Agent Configuration

For each video, configure the agent with:

#### Agent Settings
- **Name**: `KissFlow Video [Video Number]` (e.g., "KissFlow Video 1 - Introduction")
- **Voice**: Choose an appropriate voice
- **Language**: English

#### Knowledge Base
Add knowledge about the video topic. For example, for Video 1 (Introduction):

```
KissFlow is a workflow automation platform that helps businesses automate their processes.

Key features:
- Process management
- Workflow automation
- Form builder
- Approval workflows
- Task management

The main purpose of KissFlow is to help organizations automate their business processes and workflows.
```

#### Conversation Flow
Configure the agent to:
1. Greet the user
2. Ask quiz questions about the video content
3. Validate answers
4. Provide feedback
5. Mark conversation as complete when all questions are answered correctly

#### Quiz Questions
Configure the agent to ask these questions (based on `backend/config/questions.js`):

**Video 1 - Introduction:**
- "What is the main purpose of KissFlow?"
- "Can you name one key feature of KissFlow?"

**Video 2 - Conditional Visibility:**
- "What is conditional visibility used for?"
- "When would you use conditional visibility in a form?"

**Video 3 - Accessing Process:**
- "How do you access a process in KissFlow?"
- "What information can you see when accessing a process?"

**Video 4 - Managing Items (Initiator):**
- "What can an initiator do with items in KissFlow?"
- "What actions are available to an initiator?"

**Video 5 - Managing Items (Assignee):**
- "What is the role of an assignee in KissFlow?"
- "How does an assignee know they have tasks?"

## Step 2: Configure Webhook

1. In the agent settings, find **Webhooks** section
2. Add webhook URL: `https://your-backend-domain.com/api/elevenlabs/webhook`
   - For local development, use a service like [ngrok](https://ngrok.com/) to expose your local server
   - Example: `https://abc123.ngrok.io/api/elevenlabs/webhook`
3. Select events to send:
   - `conversation.started`
   - `conversation.completed`
4. Configure webhook payload to include:
   - `conversation_id`
   - `video_id` (custom field - pass via agent configuration)
   - `user_id` (optional)
   - `answers` (if available from conversation)

### Using ngrok for Local Development

```bash
# Install ngrok
# Then expose your backend
ngrok http 3001

# Use the https URL provided by ngrok in your webhook configuration
```

## Step 3: Get Agent IDs

1. After creating all 5 agents, copy each **Agent ID** from the agent settings
2. Add them to your `.env` file:

```env
# ElevenLabs Agent IDs (one per video)
ELEVENLABS_AGENT_ID_1=your-agent-id-for-video-1
ELEVENLABS_AGENT_ID_2=your-agent-id-for-video-2
ELEVENLABS_AGENT_ID_3=your-agent-id-for-video-3
ELEVENLABS_AGENT_ID_4=your-agent-id-for-video-4
ELEVENLABS_AGENT_ID_5=your-agent-id-for-video-5
```

**Note**: Each video will use its corresponding agent ID. This makes it easy to track which video/module is being completed.

## Step 4: Test the Integration

### Test Webhook Endpoint

You can test the webhook endpoint manually:

```bash
# Test conversation.started event
curl -X POST http://localhost:3001/api/elevenlabs/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "conversation.started",
    "conversation_id": "test-conv-123",
    "video_id": "1",
    "user_id": "default"
  }'

# Test conversation.completed event
curl -X POST http://localhost:3001/api/elevenlabs/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "conversation.completed",
    "conversation_id": "test-conv-123",
    "video_id": "1",
    "user_id": "default",
    "answers": {
      "q1-1": "workflow automation",
      "q1-2": "process management"
    }
  }'
```

### Test in Frontend

1. Start both backend and frontend servers
2. Open the frontend in a browser
3. Click on a video to start watching
4. After video ends, the chatbot should appear
5. Complete the conversation with the AI
6. Verify that progress is saved in the database

## Troubleshooting

### Webhook Not Receiving Events

1. Check that webhook URL is correct and accessible
2. Verify backend server is running
3. Check backend logs for incoming requests
4. Ensure CORS is configured correctly

### Agent Not Responding

1. Verify `ELEVENLABS_AGENT_ID` is set correctly in `.env`
2. Check ElevenLabs API key is valid
3. Verify agent is active in ElevenLabs dashboard

### Progress Not Saving

1. Check database connection
2. Verify webhook payload format matches expected structure
3. Check backend logs for errors
4. Verify answers are being validated correctly

## Next Steps

After setup:
1. Test each video's agent
2. Verify all quiz questions work correctly
3. Test the complete flow: video → chatbot → progress saved
4. Test on mobile devices

## Support

For issues:
- Check backend logs: `console.log` statements in webhook handler
- Check ElevenLabs dashboard for agent logs
- Verify database entries in `user_progress` table

