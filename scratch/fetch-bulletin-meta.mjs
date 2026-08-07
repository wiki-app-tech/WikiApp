import fetch from 'node-fetch';

const fileIds = [
  '1rrcGJBGyUFvlSZuVCZeTp1yn5gXq0kKW',
  '1prLIlcbaug-YtRqFLpNkDjK7lkzvK3qW',
  '19L2ifUkWE15TWthmMaPTEQj1qxW68ri6',
  '1xw6uD9oeYMm00LHVEdVdkVBw02JtH-H2'
];

for (const id of fileIds) {
  const url = `https://drive.google.com/file/d/${id}/view`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    console.log(`ID ${id}:`, match ? match[1] : 'No title');
  } catch (err) {
    console.error(`ID ${id} error:`, err.message);
  }
}
