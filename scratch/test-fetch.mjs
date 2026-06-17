async function run() {
  const res = await fetch('https://www.resumenpolicial.com.ar/');
  const html = await res.text();
  console.log("HTML length:", html.length);
  
  // Find favicon or site icons
  const iconRegex = /<link[^>]+rel="[^"]*icon[^"]*"[^>]+href="([^"]+)"/g;
  let match;
  console.log("--- Site Icons ---");
  while ((match = iconRegex.exec(html)) !== null) {
    console.log("Found icon href:", match[1]);
  }
  
  // Find logo or header images
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  console.log("\n--- Images ---");
  while ((match = imgRegex.exec(html)) !== null) {
    console.log("Found img src:", match[1]);
  }
}
run().catch(console.error);
