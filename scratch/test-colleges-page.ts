async function testCollegesPage() {
  console.log("Testing GET http://localhost:3000/colleges?category=Engineering ...");
  try {
    const res = await fetch("http://localhost:3000/colleges?category=Engineering");
    const html = await res.text();
    console.log("STATUS:", res.status);
    console.log("HTML LENGTH:", html.length);
    console.log("Contains 'Engineering Colleges in India':", html.includes("Engineering Colleges") || html.includes("Engineering"));
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}
testCollegesPage();
