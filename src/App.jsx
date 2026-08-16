
import { useState } from "react";

function App() {
  const [task, setTask] = useState("ABCv ");
  const [tasks, setTasks] = useState([]);

  function handleAddTask() {
    if (task.trim() === "") return;

    setTasks([
      ...tasks,
      {
        text: task,
        completed: false,
      },
    ]);

    setTask("");
  }

  function toggleTask(index) {
    const updatedTasks = tasks.map((item, i) =>
      i === index
        ? { ...item, completed: !item.completed }
        : item
    );

    setTasks(updatedTasks);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((item, i) => i !== index);
    setTasks(updatedTasks);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>To-Do List</h1>

      <input
        type="text"
        placeholder="Enter task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />

      <button onClick={handleAddTask}>Add Task</button>

      <ul>
        {tasks.map((item, index) => (
          <li
            key={index}
            style={{
              textDecoration: item.completed ? "line-through" : "none",
              marginBottom: "10px",
            }}
          >
            {item.text}

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => toggleTask(index)}
            >
              {item.completed ? "Undo" : "Complete"}
            </button>

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => deleteTask(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;