/**
 * Test script for ElevenLabs webhook integration
 * 
 * Usage: npm run test:webhook
 * 
 * This script tests the webhook endpoint with sample payloads
 */

import http from "http";

const API_URL = process.env.API_URL || "http://localhost:3001";
const url = new URL(API_URL);
const API_HOST = url.hostname;
const API_PORT = url.port || (url.protocol === "https:" ? 443 : 80);
const basePath = url.pathname || "/";
const API_PATH = basePath + (basePath.endsWith("/") ? "" : "/") + "api/elevenlabs/webhook";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

async function testWebhook(event: string, payload: Record<string, any>): Promise<TestResult> {
  return new Promise((resolve) => {
    try {
      console.log(`\n🧪 Testing ${event} event...`);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: API_PATH,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = "";
        
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        
        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log("✅ Success:", jsonData);
              resolve({ success: true, data: jsonData });
            } else {
              console.error("❌ Error:", jsonData);
              resolve({ success: false, data: jsonData });
            }
          } catch (error) {
            console.error("❌ Parse error:", error instanceof Error ? error.message : "Unknown error");
            console.log("Response:", data);
            resolve({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
          }
        });
      });

      req.on("error", (error: Error) => {
        console.error("❌ Request failed:", error.message);
        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error");
      resolve({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
}

async function runTests(): Promise<void> {
  console.log("🚀 Starting webhook tests...");
  console.log("API URL:", API_URL);
  
  // Test 1: Conversation Started (Managing Items - Initiator, videoId "4")
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: `test-conv-${Date.now()}`,
    video_id: "4",
    user_id: "default",
  });

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Conversation Completed (with correct answers for videoId "4")
  const conversationId = `test-conv-${Date.now()}`;
  
  // First start a conversation
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: conversationId,
    video_id: "4",
    user_id: "default",
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Then complete it
  await testWebhook("conversation.completed", {
    event: "conversation.completed",
    conversation_id: conversationId,
    video_id: "4",
    user_id: "default",
    answers: {
      "q4-1": "create and manage",
      "q4-2": "create submit track"
    },
    metadata: {
      duration: 120,
      questions_asked: 2
    }
  });

  // Test 3: Conversation Completed (with incorrect answers for videoId "4")
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const conversationId2 = `test-conv-${Date.now()}`;
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: conversationId2,
    video_id: "4",
    user_id: "default",
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  await testWebhook("conversation.completed", {
    event: "conversation.completed",
    conversation_id: conversationId2,
    video_id: "4",
    user_id: "default",
    answers: {
      "q4-1": "wrong answer",
      "q4-2": "another wrong answer"
    }
  });

  console.log("\n✅ All tests completed!");
  console.log("\n📝 Check your database to verify:");
  console.log("   - active_conversations table for started conversations");
  console.log("   - user_progress table for completed videos");
}

// Run tests
runTests().catch(console.error);

export { testWebhook, runTests };

