import fs from 'fs';
import path from 'path';

async function testEndpoint(fileName: string, description: string) {
  console.log(`\n=== Testing: ${description} ===`);
  const filePath = path.join(__dirname, fileName);
  const formData = new FormData();
  
  const blob = new Blob([fs.readFileSync(filePath)], { type: 'application/json' });
  formData.append('file', blob, fileName);

  try {
    const response = await fetch('http://localhost:3000/api/admin/college/import-json', {
      method: 'POST',
      body: formData,
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function runTests() {
  await testEndpoint('valid_ai.json', '1. Valid AI JSON (All fields)');
  await testEndpoint('invalid_structure_ai.json', '2. Malformed JSON');
  await testEndpoint('missing_required_ai.json', '3. Missing Required Fields (no name)');
}

runTests();
