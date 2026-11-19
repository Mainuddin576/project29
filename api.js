const BASE_URL = "http://localhost:5000/api/todos";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const getTodos = () => request(BASE_URL);

export const addTodo = (title) =>
  request(BASE_URL, { method: "POST", body: JSON.stringify({ title }) });

export const updateTodo = (id, data) =>
  request(`${BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteTodo = (id) =>
  request(`${BASE_URL}/${id}`, { method: "DELETE" });
