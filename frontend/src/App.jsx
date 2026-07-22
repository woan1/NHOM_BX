import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./HomePage";
import ProjectList from "./ProjectList";
import ProjectDetailPage from "./ProjectDetailPage";
import LoginPage from "./LoginPage";
import CartPage from "./CartPage";
import AdminProductPage from "./AdminProductPage";
import AdminDashboardPage from "./AdminDashboardPage";
import RegisterPage from "./RegisterPage";
import CheckoutPage from "./CheckoutPage";
import OrderHistoryPage from "./OrderHistoryPage";
import PaymentResultPage from "./PaymentResultPage";
import AdminOrderPage from "./AdminOrderPage";
import PayPalReturnPage from "./PayPalReturnPage";

import {
  recordWebsiteVisit,
} from "./analytics";


function App() {
  useEffect(() => {
    recordWebsiteVisit();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/products"
          element={<ProjectList />}
        />

        <Route
          path="/products/:id"
          element={<ProjectDetailPage />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
        />

        <Route
          path="/checkout"
          element={<CheckoutPage />}
        />

        <Route
          path="/orders"
          element={<OrderHistoryPage />}
        />

        {/* Trang kết quả thanh toán VNPAY */}
        <Route
          path="/payment-result"
          element={<PaymentResultPage />}
        />

        {/* Trang PayPal trả về sau khi thanh toán */}
        <Route
          path="/paypal/return"
          element={<PayPalReturnPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/admin/products"
          element={<AdminProductPage />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrderPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;