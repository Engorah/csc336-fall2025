import Tag from "./Tag";
import "./App.css";

function ListItem({ text, important }) {
  return (
    <div className={`list-item ${important ? "important" : ""}`}>
      <span>{text}</span>
      <Tag 
        label={important ? "Important" : "Optional"}
        type={important ? "important" : "normal"}
      />
    </div>
  );
}

export default ListItem;