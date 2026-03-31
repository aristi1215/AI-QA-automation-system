import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7ff1470c/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== OpenAI Integration ====================

// Generate AI response from prompt
app.post("/make-server-7ff1470c/generate", async (c) => {
  try {
    const { prompt, model = "gpt-3.5-turbo" } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`OpenAI API error during generate request: ${error}`);
      return c.json({ error: "Failed to generate AI response" }, response.status);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    return c.json({ response: aiResponse, model });
  } catch (error) {
    console.log(`Error in generate endpoint: ${error}`);
    return c.json({ error: "Internal server error during AI generation" }, 500);
  }
});

// ==================== Test Sessions ====================

// Create a new test session
app.post("/make-server-7ff1470c/sessions", async (c) => {
  try {
    const session = await c.req.json();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionData = {
      id: sessionId,
      ...session,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`session:${sessionId}`, sessionData);
    return c.json(sessionData, 201);
  } catch (error) {
    console.log(`Error creating session: ${error}`);
    return c.json({ error: "Failed to create session" }, 500);
  }
});

// Get all sessions
app.get("/make-server-7ff1470c/sessions", async (c) => {
  try {
    const sessions = await kv.getByPrefix("session:");
    return c.json(sessions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    console.log(`Error fetching sessions: ${error}`);
    return c.json({ error: "Failed to fetch sessions" }, 500);
  }
});

// Get a specific session
app.get("/make-server-7ff1470c/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const session = await kv.get(`session:${id}`);
    
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    return c.json(session);
  } catch (error) {
    console.log(`Error fetching session: ${error}`);
    return c.json({ error: "Failed to fetch session" }, 500);
  }
});

// Update a session
app.put("/make-server-7ff1470c/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`session:${id}`);
    
    if (!existing) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`session:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log(`Error updating session: ${error}`);
    return c.json({ error: "Failed to update session" }, 500);
  }
});

// Delete a session
app.delete("/make-server-7ff1470c/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`session:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting session: ${error}`);
    return c.json({ error: "Failed to delete session" }, 500);
  }
});

// ==================== Bug Reports ====================

// Create a bug report
app.post("/make-server-7ff1470c/bugs", async (c) => {
  try {
    const bug = await c.req.json();
    const bugId = `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bugData = {
      id: bugId,
      ...bug,
      status: bug.status || "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`bug:${bugId}`, bugData);
    return c.json(bugData, 201);
  } catch (error) {
    console.log(`Error creating bug report: ${error}`);
    return c.json({ error: "Failed to create bug report" }, 500);
  }
});

// Get all bugs
app.get("/make-server-7ff1470c/bugs", async (c) => {
  try {
    const bugs = await kv.getByPrefix("bug:");
    return c.json(bugs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    console.log(`Error fetching bugs: ${error}`);
    return c.json({ error: "Failed to fetch bugs" }, 500);
  }
});

// Get a specific bug
app.get("/make-server-7ff1470c/bugs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const bug = await kv.get(`bug:${id}`);
    
    if (!bug) {
      return c.json({ error: "Bug not found" }, 404);
    }
    
    return c.json(bug);
  } catch (error) {
    console.log(`Error fetching bug: ${error}`);
    return c.json({ error: "Failed to fetch bug" }, 500);
  }
});

// Update a bug
app.put("/make-server-7ff1470c/bugs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`bug:${id}`);
    
    if (!existing) {
      return c.json({ error: "Bug not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`bug:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log(`Error updating bug: ${error}`);
    return c.json({ error: "Failed to update bug" }, 500);
  }
});

// Delete a bug
app.delete("/make-server-7ff1470c/bugs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`bug:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting bug: ${error}`);
    return c.json({ error: "Failed to delete bug" }, 500);
  }
});

// ==================== Test Cases ====================

// Create a test case
app.post("/make-server-7ff1470c/testcases", async (c) => {
  try {
    const testCase = await c.req.json();
    const testCaseId = `testcase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testCaseData = {
      id: testCaseId,
      ...testCase,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`testcase:${testCaseId}`, testCaseData);
    return c.json(testCaseData, 201);
  } catch (error) {
    console.log(`Error creating test case: ${error}`);
    return c.json({ error: "Failed to create test case" }, 500);
  }
});

// Get all test cases
app.get("/make-server-7ff1470c/testcases", async (c) => {
  try {
    const testCases = await kv.getByPrefix("testcase:");
    return c.json(testCases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    console.log(`Error fetching test cases: ${error}`);
    return c.json({ error: "Failed to fetch test cases" }, 500);
  }
});

// Get a specific test case
app.get("/make-server-7ff1470c/testcases/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const testCase = await kv.get(`testcase:${id}`);
    
    if (!testCase) {
      return c.json({ error: "Test case not found" }, 404);
    }
    
    return c.json(testCase);
  } catch (error) {
    console.log(`Error fetching test case: ${error}`);
    return c.json({ error: "Failed to fetch test case" }, 500);
  }
});

// Update a test case
app.put("/make-server-7ff1470c/testcases/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`testcase:${id}`);
    
    if (!existing) {
      return c.json({ error: "Test case not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`testcase:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log(`Error updating test case: ${error}`);
    return c.json({ error: "Failed to update test case" }, 500);
  }
});

// Delete a test case
app.delete("/make-server-7ff1470c/testcases/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`testcase:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting test case: ${error}`);
    return c.json({ error: "Failed to delete test case" }, 500);
  }
});

// ==================== Analytics ====================

// Get analytics data
app.get("/make-server-7ff1470c/analytics", async (c) => {
  try {
    const sessions = await kv.getByPrefix("session:");
    const bugs = await kv.getByPrefix("bug:");
    
    // Calculate metrics
    const totalPrompts = sessions.length;
    const failedTests = sessions.filter(s => s.evaluation?.status === "failed").length;
    const failureRate = totalPrompts > 0 ? (failedTests / totalPrompts) * 100 : 0;
    
    // Average rating scores
    const ratingsSum = sessions.reduce((acc, s) => {
      if (s.evaluation?.ratings) {
        return {
          accuracy: acc.accuracy + (s.evaluation.ratings.accuracy || 0),
          coherence: acc.coherence + (s.evaluation.ratings.coherence || 0),
          relevance: acc.relevance + (s.evaluation.ratings.relevance || 0),
          creativity: acc.creativity + (s.evaluation.ratings.creativity || 0),
          safety: acc.safety + (s.evaluation.ratings.safety || 0),
        };
      }
      return acc;
    }, { accuracy: 0, coherence: 0, relevance: 0, creativity: 0, safety: 0 });
    
    const avgRatings = {
      accuracy: totalPrompts > 0 ? ratingsSum.accuracy / totalPrompts : 0,
      coherence: totalPrompts > 0 ? ratingsSum.coherence / totalPrompts : 0,
      relevance: totalPrompts > 0 ? ratingsSum.relevance / totalPrompts : 0,
      creativity: totalPrompts > 0 ? ratingsSum.creativity / totalPrompts : 0,
      safety: totalPrompts > 0 ? ratingsSum.safety / totalPrompts : 0,
    };
    
    // Issue type counts
    const issueTypes = bugs.reduce((acc, bug) => {
      const category = bug.category || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return c.json({
      totalPrompts,
      failureRate: Math.round(failureRate * 10) / 10,
      averageRatings: avgRatings,
      issueTypes,
      totalBugs: bugs.length,
      recentSessions: sessions.slice(0, 10),
    });
  } catch (error) {
    console.log(`Error fetching analytics: ${error}`);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

Deno.serve(app.fetch);