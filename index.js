// Import the HTTP module
const http = require("http");
const route = require("./router");

// Create a server object
const server = http.createServer((req, res) => {
  route(req, res);
});

const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
