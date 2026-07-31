import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./api";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Không thể đọc currentUser:", error);
      localStorage.removeItem("currentUser");
      return null;
    }
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      alert("Vui lòng nhập email và mật khẩu.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem(
        "currentUser",
        JSON.stringify(response.data.user)
      );

      setCurrentUser(response.data.user);

      alert("Đăng nhập thành công!");

      if (response.data.user.role === "ADMIN") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert(
        error.response?.data?.detail ||
          "Email hoặc mật khẩu không đúng."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    setCurrentUser(null);

    alert("Đã đăng xuất.");
    navigate("/login");
  };

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <section className="login-showcase">
          <div className="login-showcase-content">
            <span className="login-kicker">Chào mừng trở lại</span>

            <h2>
              Mua sắm công nghệ
              <br />
              <span>nhanh hơn cùng ShopHub</span>
            </h2>

            <p>
              Đăng nhập để quản lý đơn hàng, theo dõi thanh toán và nhận các ưu
              đãi dành riêng cho thành viên.
            </p>

            <div className="login-benefits">
              <article>
                <span>🛡️</span>
                <div>
                  <strong>Bảo mật tài khoản</strong>
                  <small>Token đăng nhập được lưu an toàn</small>
                </div>
              </article>

              <article>
                <span>📦</span>
                <div>
                  <strong>Theo dõi đơn hàng</strong>
                  <small>Kiểm tra trạng thái đơn nhanh chóng</small>
                </div>
              </article>

              <article>
                <span>⚡</span>
                <div>
                  <strong>Trải nghiệm nhanh</strong>
                  <small>Tiếp tục mua sắm chỉ trong vài giây</small>
                </div>
              </article>
            </div>
          </div>

          <div className="login-decoration">
            <div className="login-orb orb-one" />
            <div className="login-orb orb-two" />
            <div className="login-device-card">
              <span>ShopHub</span>
              <strong>Công nghệ cho mọi ngày</strong>
              <small>Chính hãng · Giao nhanh · Bảo hành rõ ràng</small>
            </div>
          </div>
        </section>

        <section className="login-panel">
          {currentUser ? (
            <div className="login-card account-card">
              <div className="login-card-heading">
                <span>Tài khoản đang đăng nhập</span>
                <h1>Thông tin tài khoản</h1>
                <p>Bạn đang sử dụng tài khoản ShopHub bên dưới.</p>
              </div>

              <div className="account-avatar">
                {String(
                  currentUser.name ||
                    currentUser.fullName ||
                    currentUser.email ||
                    "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="account-info-list">
                <div>
                  <span>Họ tên</span>
                  <strong>
                    {currentUser.name ||
                      currentUser.fullName ||
                      "Chưa cập nhật"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{currentUser.email || "Chưa cập nhật"}</strong>
                </div>

                <div>
                  <span>Vai trò</span>
                  <strong>
                    {currentUser.role === "ADMIN"
                      ? "Quản trị viên"
                      : "Khách hàng"}
                  </strong>
                </div>
              </div>

              {currentUser.role === "ADMIN" && (
                <Link
                  to="/admin/products"
                  className="login-primary-button"
                >
                  Vào trang quản lý sản phẩm
                </Link>
              )}

              <button
                type="button"
                className="login-logout-button"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <form className="login-card" onSubmit={handleLogin}>
              <div className="login-card-heading">
                <span>Đăng nhập tài khoản</span>
                <h1>Đăng nhập</h1>
                <p>Nhập thông tin tài khoản để tiếp tục sử dụng ShopHub.</p>
              </div>

              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <span>✉</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="admin@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <label htmlFor="login-password">Mật khẩu</label>
              <div className="login-input-wrap password-wrap">
                <span>🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <div className="login-options">
                <label className="remember-box">
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <span className="forgot-password">Quên mật khẩu?</span>
              </div>

              <button
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <p className="login-bottom-text">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="login-header">
      <div className="login-header-inner">
        <Link to="/" className="login-logo">
          <div className="login-logo-box">S</div>
          <h1>
            Shop<span>Hub</span>
          </h1>
        </Link>

        <nav className="login-nav">
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/cart">Giỏ hàng</Link>
        </nav>
      </div>
    </header>
  );
}

export default LoginPage;