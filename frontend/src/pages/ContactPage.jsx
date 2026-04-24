import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent!");
  };

  return (
    <>
      <div style={{ padding: "20px" }} className="page-container">
        <h1>Contact Us</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            onChange={handleChange}
          />
          <br /><br />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            onChange={handleChange}
          />
          <br /><br />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            onChange={handleChange}
          />
          <br /><br />

          <button className="btn" type="submit">
            Send Message
          </button>
        </form>

        <br />

        <p>WhatsApp: +27 000 000 0000</p>
      </div>
    </>
  );
}