const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const DATA_FILE = process.env.DATA_FILE || "/data/urls.json";

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");

const readStore = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const writeStore = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const html = `<!DOCTYPE html>
<html>
<head><title>QuickLink</title></head>
<body style="font-family:sans-serif; max-width:500px; margin:50px auto; text-align:center;">
  <h1>QuickLink URL Shortener</h1>
  <input id="longUrl" type="url" placeholder="https://example.com" style="width:80%; padding:10px;" />
  <br />
  <button onclick="shorten()" style="padding:10px 20px; margin-top:10px;">Shorten</button>
  <p id="result" style="margin-top:20px; font-weight:bold;"></p>
  <script>
    async function shorten() {
      const longUrl = document.getElementById('longUrl').value;
      const res = await fetch('/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl })
      });
      const data = await res.json();
      document.getElementById('result').innerHTML =
        'Short URL: <a href="' + data.shortUrl + '" target="_blank">' + data.shortUrl + '</a>';
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const urlPath = req.url.slice(1);

  if (req.method === "GET" && !urlPath) {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(html);
  }

  if (req.method === "POST" && urlPath === "shorten") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { url } = JSON.parse(body);
        const code = Math.random().toString(36).substring(2, 8);
        const store = readStore();
        store[code] = url;
        writeStore(store);
        const shortUrl = `http://${req.headers.host}/${code}`;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortUrl }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  if (req.method === "GET" && urlPath) {
    const store = readStore();
    const target = store[urlPath];
    if (target) {
      res.writeHead(302, { Location: target });
      return res.end();
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => console.log(`QuickLink running on port ${PORT}`));
