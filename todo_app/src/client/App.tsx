import { useEffect, useState } from "react";

const MAX_TODO_LENGTH = 140;

interface Todo {
  id: string;
  text: string;
}

export function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then(setTodos)
      .catch((err) => console.error("Failed to load todos", err));
  }, []);

  return (
    <main className="page">
      <h1 className="headline web-title">
        Todo <em>app</em>
      </h1>
      <img className="page-image" src="/api/image" alt="Random image" width={300} height={300} />
      <div className="todo-form">
        <input
          className="text-input"
          type="text"
          value={text}
          maxLength={MAX_TODO_LENGTH}
          placeholder={`Enter a new todo (max ${MAX_TODO_LENGTH} chars)`}
          aria-label="New todo"
          onChange={(e) => setText(e.target.value)}
        />
        {/* Placeholder, submitting is not implemented yet */}
        <button className="btn" type="button">Send</button>
      </div>
      <section className="todo-section">
        <h2 className="headline web-subtitle">Todos</h2>
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-card">{todo.text}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
