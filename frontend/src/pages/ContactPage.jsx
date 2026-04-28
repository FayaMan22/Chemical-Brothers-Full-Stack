import { useState } from "react";
import company from "../components/config/company";

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
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page page-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with Chemical Brothers for orders, enquiries, and support.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-card">
          <h2>Reach Us</h2>

          <p>📍 {company.addressLine1}</p>
          <p>📍 {company.addressLine2}</p>
          
          <h3>📞 Phone Numbers</h3>
            {[company.phone1, company.phone2, company.phone3].map((phone, index) => {
              const cleanNumber = phone.replace(/\D/g, "");

              return (
                <p key={index} className="phone-item">
                  <a href={`tel:${cleanNumber}`} className="phone-link" title="Click to call">
                    <span className="phone-icon">📱</span>
                    {phone}
                  </a>
                </p>
              );
            })}
            <a
            href={`https://wa.me/${company.phone1.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="contact-btn whatsapp"
          >
            WhatsApp Us
          </a>
          <a
            href={`https://wa.me/${company.phone1.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="floating-whatsapp"
            title="Chat with us on WhatsApp"
          >
            💬
          </a>
          <p>✉️ {company.email}</p>
          <p>🌐 {company.website}</p>
          <p>🕒 Hours: Mon - Sat, 8:00 AM - 5:00 PM</p>

        </div>

        <form className="contact-form-card" onSubmit={handleSubmit}>
          <h2>Send a Message</h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            value={form.message}
            onChange={handleChange}
          />

          <button className="btn" type="submit">
            Send Message
          </button>
          <p style={{ fontSize: "0.85rem", color: "#777" }}>
            *This contact form is for demonstration. Messages are not yet active.
          </p>
        </form>
      </div>
    </div>
  );
}