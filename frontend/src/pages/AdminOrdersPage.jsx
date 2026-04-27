import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import company from "../components/config/company";
import formatCurrency from "../utils/formatCurrency";


export default function AdminOrdersPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    
    fetch("http://127.0.0.1:5000/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? data.order : order
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);

    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  function printSingleOrder(orderId) {
    const printContent = document.getElementById(`invoice-${orderId}`).innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  }

   const downloadInvoice = async (orderId) => {
    const input = document.getElementById(`invoice-${orderId}`);
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`ChemicalBrothers-Invoice-${orderId}.pdf`);
  };

  return (
    <div className="admin-orders-page">
      <h1>Admin Orders</h1>

      <button className="secondary-btn" onClick={handleLogout}>
        Logout
      </button>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders have been placed yet.</p>
      )}

      <div className="orders-header">
        <h2>All Orders</h2>
        <button onClick={() => window.print()}>
          Print Orders
        </button>
      </div>

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card" id={`invoice-${order.id}`}>
              <h3>Order #{order.id}</h3>

              <div className="invoice-header-row">

                {/* LEFT */}
                <div className="invoice-left">
                  <img src={logo} alt="Logo" className="invoice-logo" />

                  <p><strong>Order #:</strong> {order.id}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.created_at).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>

                {/* CENTER */}
                <div className="invoice-center">
                  <h1>INVOICE</h1>
                </div>

                {/* RIGHT */}
                <div className="invoice-right">
                  <p><strong>{company.name}</strong></p>
                  <p>{company.addressLine1}, {company.addressLine2}</p>

                  <p className="company-phone">
                    <strong>Tel:</strong> {company.phone1} / {company.phone2} / {company.phone3}
                  </p>

                  <p><strong>Email:</strong> {company.email}</p>

                  <p>
                    <strong>Web:</strong>{" "}
                    <a href={`https://${company.website}`} target="_blank" rel="noreferrer">
                      {company.website}
                    </a>
                  </p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <button
                  className="print-invoice-btn"
                  onClick={() => printSingleOrder(order.id)}
                >
                  Print Invoice
                </button>

                <button
                  className="print-invoice-btn"
                  onClick={() => downloadInvoice(order.id)}
                >
                  Download Invoice
                </button>
              </div>

              <div className="invoice-summary">
                
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div><strong>Name:</strong> {order.customer_name}</div>
                <div><strong>Email:</strong> {order.customer_email}</div>

                <div><strong>Phone:</strong> {order.phone}</div>
                <div><strong>Address:</strong> {order.address}</div>
              </div>

              <div className="status-actions">
                <button onClick={() => updateOrderStatus(order.id, "Pending")}>
                  Pending
                </button>

                <button onClick={() => updateOrderStatus(order.id, "Processing")}>
                  Processing
                </button>

                <button onClick={() => updateOrderStatus(order.id, "Delivered")}>
                  Delivered
                </button>
              </div>

              <div className="order-items">
                <h4>Items Ordered</h4>

                <div className="order-items-header">
                  <span>Order Item</span>
                  <span>Quantity</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                </div>

                

                {order.items?.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{formatCurrency(item.price)}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="invoice-totals">
                  <p>Subtotal: {formatCurrency(order.subtotal)}</p>
                  <h3>Total: {formatCurrency(order.total)}</h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    *Prices include delivery
                  </p>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}