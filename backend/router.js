const controller = require("./controller");
function route(req, res) {
  const routes = [
    {
      method: "GET",
      pattern: /^\/todos$/,
      handler: controller.getTodoList,
    },
    {
      method: "GET",
      pattern: /^\/todos\/(\w+)$/,
      handler: (req, res, id) => controller.getTodoById(req, res, id),
    },
    {
      method: "POST",
      pattern: /^\/todos$/,
      handler: controller.createTodo,
    },
    {
      method: "PUT",
      pattern: /^\/todos\/(\w+)$/,
      handler: (req, res, id) => controller.updateTodoFull(req, res, id),
    },
    {
      method: "PATCH",
      pattern: /^\/todos\/(\w+)$/,
      handler: (req, res, id) => controller.updateTodoPartial(req, res, id),
    },
    {
      method: "DELETE",
      pattern: /^\/todos\/(\w+)$/,
      handler: (req, res, id) => controller.deleteTodo(req, res, id),
    },
    {
      method: "GET",
      pattern: /^\/bypass-cors\/(.+)$/,
      handler: (req, res, targetUrl) =>
        controller.byPassCors(req, res, targetUrl),
    },
  ];

  for (const route of routes) {
    if (req.method === route.method) {
      const match = req.url.match(route.pattern);
      if (match) {
        if (match[1]) {
          return route.handler(req, res, match[1]);
        }
        return route.handler(req, res);
      }
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
}

module.exports = route;
