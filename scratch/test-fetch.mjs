async function run() {
  const res = await fetch('https://es.kiosko.net/es/np/abc.html');
  const html = await res.text();
  console.log("HTML length:", html.length);
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    console.log("Found img src:", match[1]);
  }
}
run().catch(console.error);
