import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import company from "../config/company";

export default function Layout() {
  return (
    <>
      <Navbar />

      <div className="page-container">
        <Outlet />
      </div>

      <Footer />

      <a
        href={`https://wa.me/${company.phone1.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        title="Chat with us on WhatsApp"
      >
        💬
      </a>
    </>
  );
}