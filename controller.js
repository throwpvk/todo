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
  const todo = req.body;
  const newTodo = db.add(todo);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Todo created", todo: newTodo }));
}

async function updateTodoFull(req, res, id) {
  const updatedTodo = req.body;
  const data = db.read();
  const index = data.findIndex((item) => item.id === parseInt(id));
  if (index !== -1) {
    const result = db.update(id, updatedTodo);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo updated", todo: result }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo not found" }));
  }
}

async function updateTodoPartial(req, res, id) {
  const updatedFields = req.body;
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
  try {
    // Decode URL nếu bị encode
    const decodedUrl = decodeURIComponent(targetUrl);

    const options = {
      method: req.method,
      headers: {},
    };

    // Đọc body nếu có (cho POST, PUT, PATCH)
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }
      if (body) {
        options.body = body;
        options.headers["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(decodedUrl, options);
    const contentType = response.headers.get("content-type");

    // Lấy data dựa trên content-type
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      res.writeHead(response.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } else if (contentType && contentType.includes("text/html")) {
      data = await response.text();
      res.writeHead(response.status, { "Content-Type": "text/html" });
      res.end(data);
    } else {
      data = await response.text();
      res.writeHead(response.status, {
        "Content-Type": contentType || "text/plain",
      });
      res.end(data);
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Error fetching target URL",
        error: error.message,
      })
    );
  }
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
