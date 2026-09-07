async function testApi(category: string) {
  const url = `http://localhost:3000/api/colleges?category=${encodeURIComponent(category)}`;
  console.log(`\n==========================================`);
  console.log(`FETCHING CATEGORY: [${category || "All Streams"}]`);
  console.log(`==========================================`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) {
      console.log(`Results count for [${category || "All Streams"}]: ${data.length}`);
      data.slice(0, 3).forEach((c: any, i: number) => {
        console.log(`  ${i + 1}. ${c.name} | Cat: ${c.category} | Loc: ${c.location}`);
      });
    } else {
      console.log("Response:", data);
    }
  } catch (err: any) {
    console.error("HTTP Fetch failed:", err.message);
  }
}

async function run() {
  await testApi("");
  await testApi("Engineering");
  await testApi("Arts & Science");
  await testApi("Medical");
  await testApi("Management");
  await testApi("Commerce");
  await testApi("Law");
  await testApi("Polytechnic");
  await testApi("Dental");
  await testApi("Pharmacy");
  await testApi("Nursing");
  await testApi("Education");
}

run();
