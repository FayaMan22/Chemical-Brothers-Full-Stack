import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/common/Layout";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ContactPage from "./pages/ContactPage";

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";

const router = createBrowserRouter([
  // PUBLIC ROUTES (with Layout)
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },
      { path: "contact", element: <ContactPage /> },
    ],
  },

  // ADMIN ROUTES (NO Layout)
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/orders",
    element: (
      <AdminProtectedRoute>
        <AdminOrdersPage />
      </AdminProtectedRoute>
    ),
  },
]);

export default router;