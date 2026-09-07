async function testRoot() {
  console.log("Testing GET http://localhost:3000 ...");
  try {
    const res = await fetch("http://localhost:3000/");
    const html = await res.text();
    console.log("STATUS:", res.status);
    console.log("HTML LENGTH:", html.length);
    console.log("Contains 'Hero':", html.includes("Find the Right") || html.includes("College"));
    console.log("Contains 'Explore':", html.includes("Explore Core Tools") || html.includes("Explore"));
    console.log("Contains 'Colleges':", html.includes("Featured Colleges") || html.includes("IIT"));
  } catch (e: any) {
    console.error("Fetch root error:", e.message);
  }
}
testRoot();
