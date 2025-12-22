const db = require("./db");

async function getTodoList(req, res) {
  const data = db.read();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      data,
    })
  );
}

async function getTodoById(req, res, id) {
  const data = db.read();
  const todo = data.find((item) => item.id === parseInt(id));
  if (todo) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ todo }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo not found" }));
  }
}

async function createTodo(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const todo = JSON.parse(body);
    const newTodo = db.add(todo);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo created", todo: newTodo }));
  });
}

async function updateTodoFull(req, res, id) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const updatedTodo = JSON.parse(body);
      const data = db.read();
      const index = data.findIndex((item) => item.id === parseInt(id));
      if (index !== -1) {
        const updatedTodoWithId = { id: parseInt(id), ...updatedTodo };
        const result = db.update(id, updatedTodo);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Todo updated", todo: result }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Todo not found" }));
      }
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON format" }));
    }
  });
}

async function updateTodoPartial(req, res, id) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const updatedFields = JSON.parse(body);
      const data = db.read();
      const index = data.findIndex((item) => item.id === parseInt(id));
      if (index !== -1) {
        const mergedTodo = { ...data[index], ...updatedFields };
        const result = db.update(id, mergedTodo);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Todo updated", todo: result }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Todo not found" }));
      }
    } catch (error) {}
  });
}

async function deleteTodo(req, res, id) {
  const success = db.delete(id);
  if (success) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo deleted" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo not found" }));
  }
}

async function byPassCors(req, res, targetUrl) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {
      const options = {
        method: req.method,
        headers: { "Content-Type": "application/json" },
      };
      if (body) {
        options.body = body;
      }
      const response = await fetch(targetUrl, options);
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      res.writeHead(200, { "Content-Type": contentType || "text/plain" });
      res.end(typeof data === "string" ? data : JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error fetching target URL",
          error: error.message,
        })
      );
    }
  });
}

module.exports = {
  getTodoList,
  getTodoById,
  createTodo,
  updateTodoFull,
  updateTodoPartial,
  deleteTodo,
  byPassCors,
};
