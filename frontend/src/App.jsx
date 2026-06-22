import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProjectList from "./ProjectList";
import ProjectDetailPage from "./ProjectDetailPage";
import LoginPage from "./LoginPage";
import CartPage from "./CartPage";
import AdminProductPage from "./AdminProductPage";

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
            <Link style={{ color: "white", textDecoration: "none" }} to="/">
              Trang chủ
            </Link>

            <Link
              style={{ color: "white", textDecoration: "none" }}
              to="/products"
            >
              Sản phẩm
            </Link>

            <Link style={{ color: "white", textDecoration: "none" }} to="/cart">
              Giỏ hàng
            </Link>

            <Link
              style={{ color: "white", textDecoration: "none" }}
              to="/login"
            >
              Đăng nhập
            </Link>

            <Link
              style={{ color: "white", textDecoration: "none" }}
              to="/admin/products"
            >
              Admin
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProjectList />} />
          <Route path="/products/:id" element={<ProjectDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/products" element={<AdminProductPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;