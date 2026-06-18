import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://toodledo.onrender.com/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [todos, setTodos] = useState([]);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [updatedTodoId, setUpdatedTodoId] = useState(null);
  const [titleError, setTitleError] = useState("");

  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
  });

  const [todoForm, setTodoForm] = useState({
    title: "",
    description: "",
    category: "Work",
    priority: "1",
  });

  const [editId, setEditId] = useState(null);

  const isLoggedIn = Boolean(token);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  async function apiRequest(url, method = "GET", body = null, auth = true) {
    const options = {
      method,
      headers: auth
        ? authHeaders()
        : { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${url}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  useEffect(() => {
    if (token) {
      getTodos();
    }
  }, [token]);
  useEffect(() => {
    if (updatedTodoId) {
      const element = document.getElementById(`todo-${updatedTodoId}`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      setUpdatedTodoId(null);
    }
  }, [todos]);

  function handleAuthChange(e) {
    const { name, value } = e.target;

    setAuthForm({
      ...authForm,
      [name]: value,
    });

    if (name === "password") {
      const errors = [];

      if (!/[A-Z]/.test(value)) {
        errors.push("uppercase");
      }

      if (!/[a-z]/.test(value)) {
        errors.push("lowercase");
      }

      if (!/\d/.test(value)) {
        errors.push("number");
      }

      if (!/[@$!%*?&^#]/.test(value)) {
        errors.push("special character");
      }

      if (value.length < 8) {
        errors.push("8 characters");
      }

      if (value.length === 0) {
        setPasswordError("");
      } else if (errors.length === 0) {
        setPasswordError("✓ Strong password");
      } else {
        setPasswordError(`${errors.join(", ")} required`);
      }
    }
  }
  function handleTodoChange(e) {
    setTodoForm({
      ...todoForm,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "title") {
      setTitleError("");
    }
  }

  function resetForm() {
    setTodoForm({
      title: "",
      description: "",
      category: "Work",
      priority: "1",
    });

    setEditId(null);
  }

  async function register() {
    try {
      const data = await apiRequest("/auth/register", "POST", authForm, false);
      setMessage("🎀 Registration successful! Please login.");
    } catch (error) {
      setMessage(error.message);

    }
  }

  async function login() {
    try {
      const data = await apiRequest("/auth/login", "POST", authForm, false);
      setMessage("");
      setToken(data.token);
      localStorage.setItem("token", data.token);


    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setTodos([]);
  }

  async function addTodo() {
    try {
      if (!todoForm.title.trim()) {
        setTitleError("Title is required");
        return;
      }
      const data = await apiRequest("/todos", "POST", {
        ...todoForm,
        priority: Number(todoForm.priority),
      });

      if (!data._id) {
        return alert(data.message || "Todo not added");
      }

      resetForm();
      getTodos();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function getTodos() {
    try {
      const data = await apiRequest("/todos");

      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        setTodos([]);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function toggleTodo(id, completed) {
    try {
      await apiRequest(`/todos/${id}`, "PUT", {
        completed: !completed,
      });

      getTodos();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editTodo(todo) {
    setEditId(todo._id);

    setTodoForm({
      title: todo.title,
      description: todo.description || "",
      category: todo.category,
      priority: String(todo.priority),
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateTodo() {
    try {
      await apiRequest(`/todos/${editId}`, "PUT", {
        ...todoForm,
        priority: Number(todoForm.priority),
      });

      resetForm();
      getTodos();
      setUpdatedTodoId(editId);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteTodo(id) {
    try {
      await apiRequest(`/todos/${id}`, "DELETE");
      getTodos();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      {!isLoggedIn ? (
        <div className="container" id="loginPage">
          <h1>Login</h1>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={authForm.username}
            onChange={handleAuthChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={authForm.password}
            onChange={handleAuthChange}
          />
          {passwordError && (
            <p
              className={
                passwordError.includes("✓")
                  ? "success-message"
                  : "error-message"
              }
            >
              {passwordError}
            </p>
          )}
          {message && (
            <p className="message">
              {message}
            </p>
          )}
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>

        </div>
      ) : (
        <div className="container" id="todoPage">
          <div className="top-bar">
            <h1>Todo Dashboard</h1>
            <button onClick={logout}>Logout</button>
          </div>

          <input
            type="text"
            name="title"
            placeholder="Enter Task"
            value={todoForm.title}
            onChange={handleTodoChange}
          />
          {titleError && (
            <p className="error-message">{titleError}</p>
          )}
          <textarea
            name="description"
            placeholder="Description"
            value={todoForm.description}
            onChange={handleTodoChange}
          ></textarea>

          <select
            name="category"
            value={todoForm.category}
            onChange={handleTodoChange}
          >
            <option value="Work">Work</option>
            <option value="home">home</option>
            <option value="Personal">Personal</option>
            <option value="college">college</option>
            <option value="fun">fun</option>
            <option value="others">others</option>
          </select>

          <select
            name="priority"
            value={todoForm.priority}
            onChange={handleTodoChange}
          >
            <option value="1">Priority 1</option>
            <option value="2">Priority 2</option>
            <option value="3">Priority 3</option>
          </select>

          <button onClick={editId ? updateTodo : addTodo}>
            {editId ? "Update Todo" : "Add Todo"}
          </button>

          <h2>Your Todos</h2>

          <div id="todoList">
            {todos.map((todo) => (
              <div
                className="todo-item"
                key={todo._id}
                id={`todo-${todo._id}`}
              >
                <h3>{todo.title}</h3>

                <p>
                  <strong>Description:</strong>
                </p>

                <ul>
                  {todo.description ? (
                    todo.description
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, index) => <li key={index}>{line}</li>)
                  ) : (
                    <li>No description</li>
                  )}
                </ul>

                <p>
                  <strong>Category:</strong> {todo.category}
                </p>

                <p>
                  <strong>Priority:</strong> {todo.priority}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {todo.completed ? "Completed" : "Pending"}
                </p>

                <button onClick={() => toggleTodo(todo._id, todo.completed)}>
                  Complete
                </button>

                <button onClick={() => editTodo(todo)}>Edit</button>

                <button onClick={() => deleteTodo(todo._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;