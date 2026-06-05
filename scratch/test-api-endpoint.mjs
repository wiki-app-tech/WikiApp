import fetch from 'node-fetch';

async function testEndpoint() {
  console.log("Waiting 2 seconds for Next.js to start up...");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Fetching http://localhost:3000/api/tapas ...");
  try {
    const res = await fetch('http://localhost:3000/api/tapas');
    console.log("Status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Keys returned:", Object.keys(data));
      console.log("Internacionales:", data.internacionales?.length, "items");
      console.log("Nacionales:", data.nacionales?.length, "items");
      console.log("Provinciales:", data.provinciales?.length, "items");
      console.log("\nSample Internacional:", data.internacionales?.[0]);
      console.log("\nSample Nacional:", data.nacionales?.[0]);
      console.log("\nSample Provincial:", data.provinciales?.[0]);
    } else {
      console.error("Error text:", await res.text());
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

testEndpoint();
