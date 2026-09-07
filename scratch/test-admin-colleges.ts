async function testAdminColleges() {
  console.log("Testing GET http://localhost:3000/api/admin/colleges ...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/colleges");
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("SUCCESS:", data.success);
    console.log("STATS:", data.stats);
    console.log("COLLEGES COUNT:", data.colleges?.length);
    if (data.colleges && data.colleges.length > 0) {
      console.log("Sample College 1:", data.colleges[0].name, "|", data.colleges[0].location, "|", data.colleges[0].status);
    }
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}
testAdminColleges();
