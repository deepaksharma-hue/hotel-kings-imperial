import fs from "fs";

async function run() {
  const res = await fetch("https://pin.it/1vmgI03eS");
  const text = await res.text();
  const match = text.match(/<meta property="og:image" content="(.*?)"/i);
  console.log("IMAGE:", match?.[1] || "Not found");
}
run();
