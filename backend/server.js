const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// In-memory task store
let tasks = [];
let nextId = 1;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send all existing tasks to the newly connected client
  socket.emit("sync:tasks", tasks);

  // CREATE
  socket.on("task:create", (data) => {
    const task = {
      id: nextId++,
      title: data.title || "Untitled",
      description: data.description || "",
      priority: data.priority || "Medium",
      category: data.category || "Feature",
      column: data.column || "todo",
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    io.emit("task:created", task);       // broadcast to ALL clients
  });

  // UPDATE
  socket.on("task:update", (updated) => {
    const idx = tasks.findIndex((t) => t.id === updated.id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updated };
      io.emit("task:updated", tasks[idx]);
    }
  });

  // MOVE between columns
  socket.on("task:move", ({ id, column }) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks[idx].column = column;
      io.emit("task:moved", { id, column });
    }
  });

  // DELETE
  socket.on("task:delete", (id) => {
    tasks = tasks.filter((t) => t.id !== id);
    io.emit("task:deleted", id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));