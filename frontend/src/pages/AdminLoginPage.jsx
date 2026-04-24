import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useState } from "react";

export default function AdminLoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Admin login submitted");
  };

  return (
    <>
      <div style={{ padding: "20px" }} className="page-container">
        <h1>Admin Login</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            required
            onChange={handleChange}
          />
          <br /><br />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <br /><br />

          <button className="btn" type="submit">
            Login
          </button>
        </form>
      </div>
    </>
  );
}