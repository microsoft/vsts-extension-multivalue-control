// Minimal static file server for the Playwright harness; serves the repo root on loopback only.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const port = Number(process.env.E2E_PORT || 8889);

const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
};

http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + pathname);

    // Reject anything that escapes the repo root.
    if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
    }

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404).end();
            return;
        }
        res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
        res.end(data);
    });
}).listen(port, "127.0.0.1");
