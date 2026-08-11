const text = "MBA &amp MBA Class of me and my career MBA would help me there MBA journey MBA course in MBA program was introduced in MBA from the Indian Institute of Science PGDM and MBA programmes PGDM - MBA - PhD programme MBA by AIU PGDM students B.Sc Computer Science B.A. in English M.Tech Data Science";
const degreeRegex = /\b(B\.?A\.?|B\.?Sc\.?|B\.?Com\.?|BCA|BBA|M\.?A\.?|M\.?Sc\.?|M\.?Com\.?|MCA|MBA|PGDM|Ph\.?D\.?|B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?|MBBS|L\.?L\.?B|B\.?Pharm|D\.?Pharm|B\.?Ed|M\.?Ed|Diploma)\b/g;

const matches = Array.from(text.matchAll(degreeRegex));
for (const m of matches) {
  const degree = m[1].replace(/\s+/g, "").toUpperCase();
  const after = text.slice(m.index + m[0].length).trim();
  
  const specMatch = after.match(/^(?:(?:in|of|\-)\s+)?([A-Z][a-zA-Z&]*(?:\s+[A-Z][a-zA-Z&]*){0,4})/);
  let spec = "";
  if (specMatch) {
    spec = specMatch[1];
  }
  const title = `${degree} ${spec}`.trim();
  console.log(`[${degree}] [${spec}] -> ${title}`);
}
