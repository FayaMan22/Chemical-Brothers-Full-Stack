import company from "../config/company";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-left">
          <h3>{company.name}</h3>
          <p>{company.addressLine1}</p>
          <p>{company.addressLine2}</p>
        </div>

        {/* MIDDLE */}
        <div className="footer-middle">
          <p className="footer-phone">
            <strong>Tel:</strong> {company.phone1} </p>
            <p>{company.phone2} / {company.phone3}</p>
          <p><strong>Email:</strong> {company.email}</p>
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          <p>
            <a
              href={`https://${company.website}`}
              target="_blank"
              rel="noreferrer"
            >
              {company.website}
            </a>
          </p>
          <Link to="/admin/login" className="admin-link">
              Admin
           </Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;