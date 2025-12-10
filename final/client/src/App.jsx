import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./Home.jsx";
import List from "./List.jsx";
import AddToList from "./AddToList.jsx";
import RecordDetails from "./RecordDetails.jsx";
import EditRecord from "./EditRecord.jsx";
import "./App.css";

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">Vinyl Collection Manager</h1>

          <nav className="app-nav">
            <ul className="app-nav-list">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    "app-nav-link" +
                    (isActive ? " app-nav-link-active" : "")
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/collection"
                  className={({ isActive }) =>
                    "app-nav-link" +
                    (isActive ? " app-nav-link-active" : "")
                  }
                >
                  View Collection
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/add"
                  className={({ isActive }) =>
                    "app-nav-link" +
                    (isActive ? " app-nav-link-active" : "")
                  }
                >
                  Add New Record
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<List />} />
          <Route path="/add" element={<AddToList />} />
          <Route path="/record/:id" element={<RecordDetails />} />
          <Route path="/record/:id/edit" element={<EditRecord />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
