import { useEffect, useState } from "react";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setError("Could not load todos. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    try {
      const created = await addTodo(text);
      setTodos((prev) => [created, ...prev]);
      setTitle("");
      setError("");
    } catch {
      setError("Failed to add todo.");
    }
  };

  const handleToggle = async (todo) => {
    try {
      const updated = await updateTodo(todo._id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t._id === todo._id ? updated : t)));
    } catch {
      setError("Failed to update todo.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete todo.");
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.title);
  };

  const saveEdit = async (id) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const updated = await updateTodo(id, { title: text });
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
    } catch {
      setError("Failed to save changes.");
    }
  };

  const visible = todos.filter((t) =>
    filter === "active" ? !t.completed : filter === "done" ? t.completed : true
  );
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="container">
      <h1>My Todos</h1>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="filters">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="muted">Nothing here yet.</p>
      ) : (
        <ul className="todo-list">
          {visible.map((todo) => (
            <li key={todo._id} className={todo.completed ? "completed" : ""}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
              />

              {editingId === todo._id ? (
                <input
                  className="edit-input"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(todo._id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <span onDoubleClick={() => startEdit(todo)}>{todo.title}</span>
              )}

              <div className="actions">
                {editingId === todo._id ? (
                  <button onClick={() => saveEdit(todo._id)}>Save</button>
                ) : (
                  <button onClick={() => startEdit(todo)}>Edit</button>
                )}
                <button className="danger" onClick={() => handleDelete(todo._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="muted footer">{remaining} item(s) left</p>
    </div>
  );
}
