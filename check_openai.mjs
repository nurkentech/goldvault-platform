import "dotenv/config";

const apiKey = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-sol";

if (!apiKey) {
  console.error("OPENAI_API_KEY is not configured.");
  process.exit(1);
}

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    store: false,
    instructions: "Return the requested JSON only.",
    input: "Confirm that this synthetic read-only integration test succeeded.",
    max_output_tokens: 300,
    text: {
      format: {
        type: "json_schema",
        name: "goldvault_smoke_test",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["answer"],
          properties: { answer: { type: "string" } },
        },
      },
    },
  }),
  signal: AbortSignal.timeout(30_000),
});

const payload = await response.json();
let outputText = typeof payload.output_text === "string" ? payload.output_text : "";
for (const output of payload.output ?? []) {
  for (const content of output.content ?? []) {
    if (content.type === "output_text" && content.text) outputText = content.text;
  }
}

let structured = false;
try {
  structured = typeof JSON.parse(outputText).answer === "string";
} catch {
  structured = false;
}

console.log(JSON.stringify({
  ok: response.ok,
  status: response.status,
  model,
  responseId: Boolean(payload.id),
  requestId: Boolean(response.headers.get("x-request-id")),
  structured,
  errorType: typeof payload.error?.type === "string" ? payload.error.type : null,
  errorCode: typeof payload.error?.code === "string" ? payload.error.code : null,
}));

if (!response.ok || !structured) process.exit(1);
