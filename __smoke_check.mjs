import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3001/";
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
const shotPath = process.argv[5];

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
await page.setViewport({ width, height });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: process.env.SCHEME || "light" }]);
await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
await new Promise((r) => setTimeout(r, 2000));
console.log("URL:", url, `${width}x${height}`);
console.log("ERRORS:", JSON.stringify(errors, null, 2));
if (shotPath) {
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log("Screenshot:", shotPath);
}
await browser.close();
