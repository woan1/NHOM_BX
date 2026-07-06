import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./api";

function LoginPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      const res = await api.post("/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));

      setCurrentUser(res.data.user);

      alert("Đăng nhập thành công!");

      if (res.data.user.role === "ADMIN") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Email hoặc mật khẩu không đúng.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    alert("Đã đăng xuất.");
    navigate("/login");
  };

  if (currentUser) {
    return (
      <div style={styles.page}>
        <Header />

        <div style={styles.authWrapper}>
          <div style={styles.formBox}>
            <h1 style={styles.title}>Thông tin tài khoản</h1>

            <p>
              <b>Họ tên:</b> {currentUser.name}
            </p>

            <p>
              <b>Email:</b> {currentUser.email}
            </p>

            <p>
              <b>Vai trò:</b>{" "}
              {currentUser.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
            </p>

            {currentUser.role === "ADMIN" && (
              <Link to="/admin/products">
                <button style={styles.submitButton}>
                  Vào trang quản lý sản phẩm
                </button>
              </Link>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header />

      <div style={styles.authWrapper}>
        <form onSubmit={handleLogin} style={styles.formBox}>
          <h1 style={styles.title}>Đăng nhập</h1>

          <p style={styles.subtitle}>
            Đăng nhập bằng tài khoản backend để lấy token.
          </p>

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="admin@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label style={styles.label}>Mật khẩu</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="123456"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" style={styles.submitButton}>
            Đăng nhập
          </button>

          <p style={styles.bottomText}>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoBox}>S</div>
        <h1 style={styles.logoText}>
          Shop<span style={{ color: "#1769ff" }}>Hub</span>
        </h1>
      </Link>

      <nav style={styles.nav}>
        <Link style={styles.navLink} to="/">
          Trang chủ
        </Link>

        <Link style={styles.navLink} to="/products">
          Sản phẩm
        </Link>

        <Link style={styles.navLink} to="/cart">
          Giỏ hàng
        </Link>
      </nav>
    </header>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "0 115px 40px",
    backgroundColor: "#ffffff",
    color: "#111827",
  },

  header: {
    height: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "black",
  },

  logoBox: {
    width: "42px",
    height: "42px",
    backgroundColor: "#1769ff",
    color: "white",
    borderRadius: "10px",
    fontSize: "26px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  navLink: {
    color: "black",
    textDecoration: "none",
    fontWeight: "600",
  },

  authWrapper: {
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formBox: {
    width: "430px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "32px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.05)",
  },

  title: {
    textAlign: "center",
    margin: "0 0 8px",
    fontSize: "30px",
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "22px",
  },

  label: {
    display: "block",
    marginTop: "14px",
    marginBottom: "6px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    height: "46px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 14px",
    fontSize: "15px",
  },

  submitButton: {
    width: "100%",
    height: "48px",
    marginTop: "22px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  logoutButton: {
    width: "100%",
    height: "48px",
    marginTop: "12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  bottomText: {
    textAlign: "center",
    marginTop: "18px",
    color: "#6b7280",
  },
};

export default LoginPage;