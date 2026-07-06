import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find((user) => user.email === formData.email);

    if (existingUser) {
      alert("Email này đã được đăng ký.");
      return;
    }

    const newUser = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: "customer",
    };

    localStorage.setItem("users", JSON.stringify([...users, newUser]));

    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    navigate("/login");
  };

  return (
    <div style={styles.page}>
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
            Giỏ hàng 🛒
          </Link>

          <Link style={styles.navLink} to="/login">
            Đăng nhập
          </Link>

          <Link style={styles.activeLink} to="/register">
            Đăng ký
          </Link>
        </nav>
      </header>

      <div style={styles.authWrapper}>
        <form onSubmit={handleRegister} style={styles.formBox}>
          <h1 style={styles.title}>Đăng ký tài khoản</h1>

          <p style={styles.subtitle}>
            Tạo tài khoản ShopHub để mua hàng và theo dõi đơn hàng.
          </p>

          <label style={styles.label}>Họ và tên</label>
          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
          />

          <label style={styles.label}>Mật khẩu</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
          />

          <label style={styles.label}>Xác nhận mật khẩu</label>
          <input
            style={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" style={styles.submitButton}>
            Đăng ký
          </button>

          <p style={styles.bottomText}>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </form>
      </div>
    </div>
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

  activeLink: {
    color: "#1769ff",
    textDecoration: "none",
    fontWeight: "700",
    borderBottom: "3px solid #1769ff",
    paddingBottom: "24px",
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

  bottomText: {
    textAlign: "center",
    marginTop: "18px",
    color: "#6b7280",
  },
};

export default RegisterPage;