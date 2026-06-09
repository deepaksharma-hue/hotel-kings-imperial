import https from 'https';

https.get('https://pin.it/7LVpj594w', (res) => {
  const finalUrl = res.headers.location;
  if (finalUrl) {
    console.log("Redirect URL:", finalUrl);
    https.get(finalUrl, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
         const match = data.match(/<meta property="og:image" content="(.*?)"/);
         if (match) console.log("Image URL:", match[1]);
         else console.log("No image found");
      });
    });
  } else {
    console.log("No redirect");
  }
});
