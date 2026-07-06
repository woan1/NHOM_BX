import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/products" element={<ProjectList />} />
        <Route path="/products/:id" element={<ProjectDetailPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/admin/products" element={<AdminProductPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;