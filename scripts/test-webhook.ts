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
  
  // Test 1: Conversation Started (Introduction to KissFlow, videoId "1")
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: `test-conv-${Date.now()}`,
    video_id: "1",
    user_id: "default",
  });

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Conversation Completed (with correct answers - hybrid validation)
  // Testing video 4 (Managing Items - Initiator)
  const conversationId = `test-conv-${Date.now()}`;
  
  // First start a conversation
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: conversationId,
    video_id: "4",
    user_id: "default",
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Then complete it with hybrid validation metadata
  await testWebhook("conversation.completed", {
    event: "conversation.completed",
    conversation_id: conversationId,
    video_id: "4",
    user_id: "default",
    answers: {
      "q1": "initiators can create and manage items in KissFlow",
      "q2": "they can create, submit, and track items"
    },
    metadata: {
      duration: 120,
      questions_asked: 2,
      min_questions: 2,
      validation_passed: true
    }
  });

  // Test 3: Conversation Completed (with agent validation failed)
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
      "q1": "wrong answer",
      "q2": "another wrong answer"
    },
    metadata: {
      duration: 180,
      questions_asked: 2,
      min_questions: 2,
      validation_passed: false  // Agent determined answers are incorrect
    }
  });

  // Test 4: Conversation Completed (insufficient questions)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const conversationId3 = `test-conv-${Date.now()}`;
  await testWebhook("conversation.started", {
    event: "conversation.started",
    conversation_id: conversationId3,
    video_id: "4",
    user_id: "default",
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  await testWebhook("conversation.completed", {
    event: "conversation.completed",
    conversation_id: conversationId3,
    video_id: "4",
    user_id: "default",
    answers: {
      "q1": "only one answer"
    },
    metadata: {
      duration: 90,
      questions_asked: 1,
      min_questions: 2,
      validation_passed: true
    }
  });

  console.log("\n✅ All tests completed!");
  console.log("\n📝 Test Summary:");
  console.log("   - Test 1: Conversation started");
  console.log("   - Test 2: Conversation completed with valid answers (validation_passed: true)");
  console.log("   - Test 3: Conversation completed with invalid answers (validation_passed: false)");
  console.log("   - Test 4: Conversation completed with insufficient questions");
  console.log("\n📝 Check your database to verify:");
  console.log("   - active_conversations table for started conversations");
  console.log("   - user_progress table for completed videos");
  console.log("\n💡 Note: Hybrid validation is now used by default (no hardcoded questions required)");
}

// Run tests
runTests().catch(console.error);

export { testWebhook, runTests };

