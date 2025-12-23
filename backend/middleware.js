function parseJsonBody(req, res) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        if (body) {
          req.body = JSON.parse(body);
        } else {
          req.body = {};
        }
        resolve();
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        reject(error);
      }
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
}

function logRequest(req, res) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  console.log(`[${timestamp}] ${method} ${url}`);
  return Promise.resolve();
}

function handleCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return Promise.resolve({ skipRouting: true }); // Dừng xử lý tiếp theo
  }

  return Promise.resolve();
}

module.exports = {
  parseJsonBody,
  logRequest,
  handleCors,
};
