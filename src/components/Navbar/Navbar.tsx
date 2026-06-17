import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo1.png";
import user from "../../assets/user.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navbar">
      <img src={logo} style={{ height: "95%" }} alt="Logo" />
      <div className="buttons">
        <button
          className={`tab-button${location.pathname === "/" ? " active" : ""}`}
          onClick={() => navigate("/")}
        >
          Przeglądaj
        </button>
        <button
          className={`tab-button${location.pathname === "/moje-przepisy" ? " active" : ""}`}
          onClick={() => navigate("/moje-przepisy")}
        >
          Moje Przepisy
        </button>
        <button
          className={`tab-button${location.pathname === "/moje-produkty" ? " active" : ""}`}
          onClick={() => navigate("/moje-produkty")}
        >
          Moje Produkty
        </button>
        <button
          className={`tab-button${location.pathname === "/asystent-ai" ? " active" : ""}`}
          onClick={() => navigate("/asystent-ai")}
        >
          Asystent AI
        </button>
        <button
          className="tab-button-bold"
          onClick={() => navigate("/nowy-przepis")}
        >
          + Nowy Przepis
        </button>
      </div>
      <img
        src={user}
        style={{ height: "50%", cursor: "pointer" }}
        alt="User profile"
        onClick={() => navigate("/konto")}
      />
    </div>
  );
}
