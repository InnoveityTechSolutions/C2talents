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
  console.log("Status:", r3.status, await r3.json());
}

testAuthAPIs().catch(console.error);
