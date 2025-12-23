const controller = require("./controller");
const middleware = require("./middleware");

async function route(req, res) {
  try {
    // Áp dụng middleware tuần tự
    await middleware.logRequest(req, res);
    const corsResult = await middleware.handleCors(req, res);

    // Nếu OPTIONS request đã được xử lý, dừng ở đây
    if (corsResult && corsResult.skipRouting) {
      return;
    }

    // Kiểm tra xem có phải route bypass-cors không
    const bypassCorsMatch = req.url.match(/^\/bypass-cors\/(.+)$/);
    if (bypassCorsMatch) {
      // Không parse JSON body cho bypass-cors
      return controller.byPassCors(req, res, bypassCorsMatch[1]);
    }

    await middleware.parseJsonBody(req, res);

    // Sau khi middleware, xử lý routes
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
  } catch (error) {
    // Middleware đã handle lỗi, không cần làm gì thêm
  }
}

module.exports = route;
