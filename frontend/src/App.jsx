import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProjectList from "./ProjectList";
import ProjectDetailPage from "./ProjectDetailPage";
import LoginPage from "./LoginPage";
import CartPage from "./CartPage";
import AdminProductPage from "./AdminProductPage";
import RegisterPage from "./RegisterPage";
import CheckoutPage from "./CheckoutPage";
import OrderHistoryPage from "./OrderHistoryPage";
import { useCart } from "./CartContext";

function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "70px" }}>
      <h1>Welcome to ShopHub</h1>
      <p>
        Website thương mại điện tử được xây dựng bằng ReactJS và Python FastAPI.
      </p>

      <Link to="/products">
        <button
          style={{
            padding: "12px 22px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Xem sản phẩm
        </button>
      </Link>
    </div>
  );
}

function App() {
  const { cartCount } = useCart();

  return (
    <BrowserRouter>
      <div>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 40px",
            backgroundColor: "#111",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0 }}>ShopHub</h2>

          <div style={{ display: "flex", gap: "20px" }}>
            <Link style={linkStyle} to="/">
              Trang chủ
            </Link>

            <Link style={linkStyle} to="/products">
              Sản phẩm
            </Link>

            <Link style={linkStyle} to="/cart">
              Giỏ hàng ({cartCount})
            </Link>

            <Link style={linkStyle} to="/orders">
              Đơn hàng
            </Link>

            <Link style={linkStyle} to="/login">
              Đăng nhập
            </Link>

            <Link style={linkStyle} to="/register">
              Đăng ký
            </Link>

            <Link style={linkStyle} to="/admin/products">
              Admin
            </Link>
          </div>
        </nav>

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
};

export default App;