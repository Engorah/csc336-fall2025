import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Explore from "./Explore";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <nav>
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Home
          </NavLink>

          <NavLink 
            to="/about" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            About
          </NavLink>

          <NavLink 
            to="/explore" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Explore
          </NavLink>
        </nav>

        <div className="route-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;