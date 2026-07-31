import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import api from "./api";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    const password = formData.password;

    if (!password) {
      return {
        label: "Chưa nhập mật khẩu",
        level: 0,
        className: "empty",
      };
    }

    let score = 0;

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return {
        label: "Mật khẩu yếu",
        level: 1,
        className: "weak",
      };
    }

    if (score <= 3) {
      return {
        label: "Mật khẩu trung bình",
        level: 2,
        className: "medium",
      };
    }

    return {
      label: "Mật khẩu mạnh",
      level: 3,
      className: "strong",
    };
  }, [formData.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName || !email || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        name: fullName,
        email,
        password,
      });

      console.log("Đăng ký thành công:", response.data);

      alert("Đăng ký thành công! Vui lòng đăng nhập.");

      navigate("/login", {
        state: {
          registeredEmail: email,
        },
      });
    } catch (error) {
      console.error(
        "Lỗi đăng ký:",
        error.response?.data || error.message
      );

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        alert(detail);
      } else if (Array.isArray(detail)) {
        const message = detail
          .map((item) => item.msg || "Dữ liệu không hợp lệ.")
          .join("\n");

        alert(message);
      } else if (!error.response) {
        alert(
          "Không kết nối được backend. Hãy kiểm tra backend đang chạy ở cổng 8000."
        );
      } else {
        alert("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />

      <main className="register-main">
        <section className="register-showcase">
          <div className="register-showcase-content">
            <span className="register-kicker">Tham gia ShopHub</span>

            <h2>
              Tạo tài khoản
              <br />
              <span>mua sắm thông minh hơn</span>
            </h2>

            <p>
              Đăng ký để lưu thông tin, quản lý đơn hàng và nhận các ưu đãi dành
              riêng cho thành viên ShopHub.
            </p>

            <div className="register-benefits">
              <article>
                <span>🎁</span>
                <div>
                  <strong>Ưu đãi thành viên</strong>
                  <small>Nhận mã giảm giá và chương trình riêng</small>
                </div>
              </article>

              <article>
                <span>📦</span>
                <div>
                  <strong>Quản lý đơn hàng</strong>
                  <small>Theo dõi trạng thái đơn dễ dàng</small>
                </div>
              </article>

              <article>
                <span>⚡</span>
                <div>
                  <strong>Thanh toán nhanh</strong>
                  <small>Lưu thông tin để mua sắm thuận tiện</small>
                </div>
              </article>
            </div>
          </div>

          <div className="register-decoration">
            <div className="register-orb orb-one" />
            <div className="register-orb orb-two" />

            <div className="register-device-card">
              <span>ShopHub Member</span>
              <strong>Bắt đầu hành trình công nghệ</strong>
              <small>Chính hãng · Giao nhanh · Hỗ trợ tận tâm</small>
            </div>
          </div>
        </section>

        <section className="register-panel">
          <form className="register-card" onSubmit={handleRegister}>
            <div className="register-card-heading">
              <span>Tạo tài khoản mới</span>
              <h1>Đăng ký tài khoản</h1>
              <p>Tạo tài khoản ShopHub để mua hàng và theo dõi đơn hàng.</p>
            </div>

            <label htmlFor="register-name">Họ và tên</label>
            <div className="register-input-wrap">
              <span>👤</span>
              <input
                id="register-name"
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <label htmlFor="register-email">Email</label>
            <div className="register-input-wrap">
              <span>✉</span>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <label htmlFor="register-password">Mật khẩu</label>
            <div className="register-input-wrap password-wrap">
              <span>🔒</span>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            <div className={`password-strength ${passwordStrength.className}`}>
              <div className="strength-bars">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={passwordStrength.level >= level ? "active" : ""}
                  />
                ))}
              </div>
              <small>{passwordStrength.label}</small>
            </div>

            <label htmlFor="register-confirm-password">
              Xác nhận mật khẩu
            </label>
            <div className="register-input-wrap password-wrap">
              <span>🔐</span>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {formData.confirmPassword && (
              <p
                className={`password-match ${
                  formData.password === formData.confirmPassword
                    ? "matched"
                    : "not-matched"
                }`}
              >
                {formData.password === formData.confirmPassword
                  ? "✓ Mật khẩu đã khớp"
                  : "✕ Mật khẩu chưa khớp"}
              </p>
            )}

            <label className="register-policy">
              <input type="checkbox" defaultChecked />
              <span>
                Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của
                ShopHub.
              </span>
            </label>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="register-bottom-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="register-header">
      <div className="register-header-inner">
        <Link to="/" className="register-logo">
          <div className="register-logo-box">S</div>
          <h1>
            Shop<span>Hub</span>
          </h1>
        </Link>

        <nav className="register-nav">
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/login">Đăng nhập</Link>
          <Link className="active" to="/register">
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default RegisterPage;