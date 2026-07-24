// Test the OTP endpoint directly using correct tRPC format
const body = JSON.stringify({
  json: {
    identifier: "test@goldvaults.us",
    method: "email"
  }
});

try {
  const res = await fetch("http://localhost:3000/api/trpc/otp.send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text.slice(0, 800));
} catch (e) {
  console.error("Error:", e.message);
}
