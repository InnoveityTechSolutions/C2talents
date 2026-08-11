async function testAuthAPIs() {
  console.log("=== 1. TESTING INVALID EMAIL ===");
  const r1 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nonexistent@c2talents.com", password: "Admin@123" }),
  });
  console.log("Status:", r1.status, await r1.json());

  console.log("\n=== 2. TESTING INCORRECT PASSWORD ===");
  const r2 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "superadmin@c2talents.com", password: "WrongPassword999" }),
  });
  console.log("Status:", r2.status, await r2.json());

  console.log("\n=== 3. TESTING VALID SUPERADMIN CREDENTIALS ===");
  const r3 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "superadmin@c2talents.com", password: "Admin@123" }),
  });
  const cookies = r3.headers.getSetCookie ? r3.headers.getSetCookie().join("; ") : r3.headers.get("set-cookie") || "";
  console.log("Status:", r3.status, await r3.json());
  console.log("Set-Cookie returned:", cookies);

  console.log("\n=== 4. TESTING /api/admin/auth/me WITH COOKIE ===");
  const r4 = await fetch("http://localhost:3000/api/admin/auth/me", {
    headers: { cookie: cookies },
  });
  const text = await r4.text();
  console.log("Status:", r4.status, text);
}

testAuthAPIs().catch(console.error);


