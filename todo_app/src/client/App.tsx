import { useEffect, useState, type FormEvent } from "react";

const MAX_TODO_LENGTH = 140;

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((health: { broken: boolean }) => setBroken(health.broken))
      .catch((err) => console.error("Failed to load health state", err));

    fetch("/todos")
      .then((res) => res.json())
      .then(setTodos)
      .catch((err) => console.error("Failed to load todos", err));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const todo: Todo = await res.json();
      setTodos((prev) => [...prev, todo]);
      setText("");
    } catch (err) {
      console.error("Failed to create todo", err);
    }
  }

  async function handleMarkDone(id: string) {
    try {
      const res = await fetch(`/todos/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((todo) => (todo.id === updated.id ? updated : todo)));
    } catch (err) {
      console.error("Failed to mark todo done", err);
    }
  }

  async function handleBreak() {
    try {
      const res = await fetch("/api/break", { method: "POST" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setBroken(true);
    } catch (err) {
      console.error("Failed to break the app", err);
    }
  }

  if (broken) {
    return (
      <main className="page">
        <div className="failure-box" role="alert">
          System failure, wait for recovery
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="headline web-title">
        Todo <em>app</em>
      </h1>
      <img className="page-image" src="/api/image" alt="Random image" width={300} height={300} />
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          className="text-input"
          type="text"
          value={text}
          maxLength={MAX_TODO_LENGTH}
          placeholder={`Enter a new todo (max ${MAX_TODO_LENGTH} chars)`}
          aria-label="New todo"
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit">Send</button>
      </form>
      <section className="todo-section">
        <h2 className="headline web-subtitle">Todos</h2>
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? "todo-card todo-card-done" : "todo-card"}>
              <span className="todo-text">{todo.text}</span>
              {todo.done ? (
                <span className="todo-done-label">Done</span>
              ) : (
                <button className="btn btn-small" type="button" onClick={() => handleMarkDone(todo.id)}>
                  Mark done
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <button className="btn btn-danger" type="button" onClick={handleBreak}>
        Break app
      </button>
    </main>
  );
}
