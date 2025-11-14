import { useState } from "react";
import ListItem from "./ListItem";

function App() {
  const [items, setItems] = useState([
    { text: "Tokyo, Japan", important: true },
    { text: "Reykjavik, Iceland", important: false },
    { text: "Vancouver, Canada", important: true },
    { text: "Paris, France", important: true },
    { text: "New Orleans, USA", important: false },
    { text: "Madrid, Spain", important: true },
    { text: "Athens, Greece", important: true }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  function addItem() {
    if (inputValue.trim() === "") return;

    setItems([
      ...items,
      { text: inputValue, important: isImportant }
    ]);

    setInputValue("");
    setIsImportant(false);
  }

  return (
    <div className="app-container">
      <h1>Places to Visit</h1>

      <div className="input-row">
        <input
          type="text"
          placeholder="Add a new place..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
          />
          Important?
        </label>

        <button onClick={addItem}>Add</button>
      </div>

      <div className="list-wrapper">
        {items.map((item, index) => (
          <ListItem
            key={index}
            text={item.text}
            important={item.important}
          />
        ))}
      </div>
    </div>
  );
}

export default App;