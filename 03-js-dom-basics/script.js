// Grab Elements
const form = document.getElementById("form");
const input = document.getElementById("newTask");
const list = document.getElementById("tasklist");
const countEl = document.getElementById("count");
const filterAllBtn = document.getElementById("filterAll");
const filterActiveBtn = document.getElementById("filterActive");
const filterCompletedBtn = document.getElementById("filterCompleted");
const clearCompletedBtn = document.getElementById("clearCompleted");

// State
let todos = [];
let filter = "all";

// Add task
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(input.value);
});

function addTask(text) {
  if (!text.trim()) return;
  // Create a new todo object
  const todo = {
    id: Date.now(),
    text: text.trim(),
    done: false,
  };

  // Push to todos array
  todos.push(todo);

  // Clear the input box
  input.value = "";

  // Call render()
  render();

  input.focus();
}

// Toggle / Delete
function toggleTask(id) {
  // Flip done for todo with matching id
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.done = !todo.done;
  // Call render()
  render();
}

function deleteTask(id) {
  // Remove todo from array
  todos = todos.filter((t) => t.id !== id);

  // Call render()
  render();
}

// Filters
[filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach((btn) => {
  btn.addEventListener("click", () => {
    [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach((b) =>
      b.classList.remove("active")
    );
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

// Clear Completed
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);

  render();
});

// Helpers
function filteredTodos() {
  // Return todos based on current filter
  if (filter === "active") {
    return todos.filter((t) => !t.done);
  }
  if (filter === "completed") {
    return todos.filter((t) => t.done);
  }
  return todos;
}

// Render
function render() {
  list.innerHTML = "";
  filteredTodos().forEach((todo) => {
    const li = document.createElement("li");
    li.className = "task" + (todo.done ? " done" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = todo.done;
    cb.addEventListener("change", () => toggleTask(todo.id));

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = todo.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✖";
    del.addEventListener("click", () => deleteTask(todo.id));

    li.append(cb, label, del);
    list.appendChild(li);
  });

  // Update remaining count
  const remaining = todos.filter((t) => !t.done).length;
  countEl.textContent = remaining;

  // Enable/disable Clear Completed
  clearCompletedBtn.disabled = todos.every((t) => !t.done);
}

// Init
render();
