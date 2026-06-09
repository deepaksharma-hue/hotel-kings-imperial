const fetchPin = async () => {
  try {
    const res = await fetch('https://www.pinterest.com/pin/1120833426035809191/sent/?invite_code=78f468eadfa14390a063d837119d7757&sender=1120833563420662931&sfo=1');
    const html = await res.text();
    const imgs = [...html.matchAll(/"image_url":"([^"]+)"/g)].map(m => m[1]);
    const imgs2 = [...html.matchAll(/"url":"([^"]+)"/g)].map(m => m[1]);
    const meta = [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map(m => m[1]);
    console.log(imgs.slice(0, 3));
    console.log(imgs2.slice(0, 3));
    console.log(meta.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
};
fetchPin();
