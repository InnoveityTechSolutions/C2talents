async function testMetrics() {
  console.log("Testing GET http://localhost:3000/api/admin/dashboard/metrics ...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/dashboard/metrics");
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("METRICS DATA:", JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error("Fetch metrics error:", e.message);
  }
}
testMetrics();
