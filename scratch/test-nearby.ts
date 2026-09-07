import { db } from "../src/lib/db";
import { GET } from "../src/app/api/colleges/[id]/nearby/route";

async function test(searchName: string) {
  const c = await db.collegeProfile.findFirst({
    where: { name: { contains: searchName } },
  });
  if (!c) {
    console.log("College not found for:", searchName);
    return;
  }
  const req = new Request("http://localhost/api/colleges/" + c.id + "/nearby");
  const res = await GET(req, { params: Promise.resolve({ id: c.id }) });
  const data = await res.json();
  console.log("\n==========================================");
  console.log("TARGET COLLEGE:", c.name, "(", c.location, ")");
  console.log("==========================================");
  if (Array.isArray(data)) {
    console.log("Nearby colleges count:", data.length);
    data.forEach((item: any, idx: number) => {
      console.log(`${idx + 1}. 📍 ${item.distanceText} - ${item.name} (${item.city})`);
    });
  } else {
    console.log("Response:", data);
  }
}

async function run() {
  await test("Anna University");
  await test("PSG");
  await test("VIT");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
