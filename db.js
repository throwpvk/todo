const Database = require("better-sqlite3");
const db = new Database("todos.db");

// Tạo table nếu chưa có
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

const database = {
  read() {
    try {
      const stmt = db.prepare("SELECT * FROM todos");
      return stmt.all().map((row) => ({
        id: row.id,
        text: row.text,
        completed: !!row.completed,
      }));
    } catch (error) {
      console.error("Lỗi khi đọc database:", error);
      return [];
    }
  },

  write(data) {
    try {
      const deleteStmt = db.prepare("DELETE FROM todos");
      deleteStmt.run();

      const insertStmt = db.prepare(
        "INSERT INTO todos (text, completed) VALUES (?, ?)"
      );
      for (const item of data) {
        insertStmt.run(item.text, item.completed ? 1 : 0);
      }
      console.log("Đã cập nhật database thành công!");
    } catch (error) {
      console.error("Lỗi khi ghi database:", error);
    }
  },

  add(newItem) {
    try {
      const stmt = db.prepare(
        "INSERT INTO todos (text, completed) VALUES (?, ?)"
      );
      const result = stmt.run(newItem.text, newItem.completed ? 1 : 0);
      return { id: result.lastInsertRowid, ...newItem };
    } catch (error) {
      console.error("Lỗi khi thêm item:", error);
      return null;
    }
  },

  update(id, updatedItem) {
    try {
      const stmt = db.prepare(
        "UPDATE todos SET text = ?, completed = ? WHERE id = ?"
      );
      stmt.run(updatedItem.text, updatedItem.completed ? 1 : 0, id);
      console.log("Đã cập nhật item thành công!");
      return { id: parseInt(id), ...updatedItem };
    } catch (error) {
      console.error("Lỗi khi cập nhật item:", error);
      return null;
    }
  },

  delete(id) {
    try {
      const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
      stmt.run(id);
      console.log("Đã xóa item thành công!");
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa item:", error);
      return false;
    }
  },
};

module.exports = database;

const countStmt = db.prepare("SELECT COUNT(*) as count FROM todos");
const count = countStmt.get().count;
if (count === 0) {
  const insertStmt = db.prepare(
    "INSERT INTO todos (text, completed) VALUES (?, ?)"
  );
  insertStmt.run("Học Node.js", 0);
  insertStmt.run("Tạo todo app", 1);
  insertStmt.run("Deploy lên Render", 0);
  console.log("Đã thêm demo data!");
}
