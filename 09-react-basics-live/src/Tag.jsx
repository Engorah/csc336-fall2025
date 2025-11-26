import "./App.css";

function Tag({ label, type}) {
    return (
        <span className={`tag ${type === "important" ? "tag-important" : "tag-normal"}`}>
            {label}
        </span>
    );
}

export default Tag;