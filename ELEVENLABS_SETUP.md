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

#### System Prompt / Instructions
Paste the following quiz conversation flow into the agent's **System Prompt** or **Instructions** field:

```
You are a quiz assistant for KissFlow onboarding videos.

QUIZ CONVERSATION FLOW:

1. After user watches video, greet and explain you'll test their understanding
2. Generate 2-3 questions based on key concepts from the video content in your knowledge base
3. For each question:
   - Assign a unique ID (q1, q2, q3, etc.)
   - Ask the question
   - Wait for answer
   - Validate answer against your knowledge base
   - If incorrect: provide feedback, explain correct answer, ask again
   - If correct: acknowledge and move to next question
4. Track all questions asked and answers given
5. Only complete when ALL questions answered correctly
6. When completing, ensure webhook includes all answers and validation status

QUESTION GENERATION GUIDELINES:
- Ask about main concepts from the video
- Test practical understanding, not just memorization
- Cover different aspects of the video content
- Make questions clear and specific
- Minimum 2 questions, maximum 3-4 questions

WEBHOOK REQUIREMENTS:
When conversation completes, you must send webhook with:
- answers: Object with all question IDs and user answers (e.g., {"q1": "answer", "q2": "answer"})
- metadata.validation_passed: true if all answers correct, false otherwise
- metadata.questions_asked: total number of questions asked (must be at least 2)
- metadata.min_questions: set to 2
- metadata.duration: conversation duration in seconds
```

**Note**: The agent will generate questions dynamically based on the video content in the knowledge base. No hardcoded questions are required.

## Step 2: Configure Webhook

1. In the agent settings, find **Webhooks** section
2. Add webhook URL: `https://your-backend-domain.com/api/elevenlabs/webhook`
   - For local development, use a service like [ngrok](https://ngrok.com/) to expose your local server
   - Example: `https://abc123.ngrok.io/api/elevenlabs/webhook`
3. Select events to send:
   - `conversation.started`
   - `conversation.completed`
4. Configure webhook payload to include:
   - `conversation_id` (auto-populated by ElevenLabs)
   - `video_id` (set per agent: "1" for Introduction, "2" for Conditional Visibility, "3" for Accessing Process, "4" for Managing Items - Initiator, "5" for Managing Items - Assignee)
   - `user_id` (optional)
   - `answers` (required) - Object mapping question IDs to answers: `{"q1": "answer1", "q2": "answer2"}`
   - `metadata` (required) - Object with:
     - `min_questions`: 2 (minimum questions required)
     - `questions_asked`: number of questions asked
     - `validation_passed`: true/false (agent's validation result)
     - `duration`: conversation duration in seconds

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
# Original agent IDs from your configuration:
ELEVENLABS_AGENT_ID_1=agent_1101kabxsh0jfa0rdzpgs8a5yqck
ELEVENLABS_AGENT_ID_2=agent_5401kaby4dp4fknr01q4g3r9vn0k
ELEVENLABS_AGENT_ID_3=agent_7601kaby40sjeega24jttya1xjff
ELEVENLABS_AGENT_ID_4=agent_2701kaby39ywfq9ansma8qed1bey
ELEVENLABS_AGENT_ID_5=agent_8101kaby4svmfbc8j524nv79cqv6
```

**Note**: Each video will use its corresponding agent ID. This makes it easy to track which video/module is being completed.

## Validation Approach

The backend now supports **hybrid validation** that doesn't require hardcoded questions:

### How It Works:
1. **Agent generates questions** dynamically based on video content
2. **Agent validates answers** against its knowledge base
3. **Backend validates** using metadata thresholds:
   - Minimum number of questions answered
   - Agent's validation status (`validation_passed`)
   - Answer quality (minimum length)

### Webhook Payload Requirements:
The agent must send these fields in the webhook:

```json
{
  "event": "conversation.completed",
  "conversation_id": "conv_123",
  "video_id": "4",
  "answers": {
    "q1": "user's answer",
    "q2": "user's answer"
  },
  "metadata": {
    "min_questions": 2,
    "questions_asked": 2,
    "validation_passed": true,
    "duration": 120
  }
}
```

### Fallback to Hardcoded Validation (Optional):
If you want to also validate against hardcoded questions for additional security, set this environment variable:
```env
USE_HARDCODED_VALIDATION=true
```

This will run both hybrid validation (primary) and hardcoded question validation (secondary).

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

