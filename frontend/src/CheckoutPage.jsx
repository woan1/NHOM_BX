import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "./CartContext";

const API_URL = "http://127.0.0.1:8000";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "Thanh toán khi nhận hàng",
  });

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  const getCartImage = (item) => {
    const image = item.image_url || item.image;

    if (!image) return FALLBACK_IMAGE;

    if (image.startsWith("http")) return image;

    if (image.startsWith("/uploads")) {
      return `${API_URL}${image}`;
    }

    if (image.startsWith("uploads")) {
      return `${API_URL}/${image}`;
    }

    if (image.startsWith("/images")) {
      return image;
    }

    return image;
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOrder = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }

    const newOrder = {
      id: "DH" + Date.now(),
      date: new Date().toLocaleString("vi-VN"),
      userEmail: currentUser?.email || "",
      customer: {
        ...formData,
        email: currentUser?.email || "",
      },
      items: cartItems,
      total: cartTotal,
      status: "Đang xử lý",
    };

    const oldOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const updatedOrders = [newOrder, ...oldOrders];

    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    clearCart();

    alert("Đặt hàng thành công!");
    navigate("/orders");
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.page}>
        <Header />

        <div style={styles.emptyBox}>
          <h1>Không có sản phẩm để thanh toán</h1>
          <p>Giỏ hàng của bạn đang trống.</p>

          <Link to="/products">
            <button style={styles.primaryButton}>Tiếp tục mua sắm</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header />

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Thanh toán</h1>
        <p style={styles.subtitle}>
          Nhập thông tin giao hàng và xác nhận đơn hàng của bạn.
        </p>
      </section>

      <div style={styles.checkoutGrid}>
        <form onSubmit={handleOrder} style={styles.formBox}>
          <h2>Thông tin khách hàng</h2>

          <label style={styles.label}>Họ và tên</label>
          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
          />

          <label style={styles.label}>Số điện thoại</label>
          <input
            style={styles.input}
            type="text"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
          />

          <label style={styles.label}>Địa chỉ giao hàng</label>
          <input
            style={styles.input}
            type="text"
            name="address"
            placeholder="Nhập địa chỉ nhận hàng"
            value={formData.address}
            onChange={handleChange}
          />

          <label style={styles.label}>Ghi chú</label>
          <textarea
            style={styles.textarea}
            name="note"
            placeholder="Ghi chú thêm nếu có"
            value={formData.note}
            onChange={handleChange}
          />

          <label style={styles.label}>Phương thức thanh toán</label>
          <select
            style={styles.input}
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option>Thanh toán khi nhận hàng</option>
            <option>Chuyển khoản ngân hàng</option>
            <option>Ví điện tử</option>
          </select>

          <button type="submit" style={styles.orderButton}>
            Xác nhận đặt hàng
          </button>
        </form>

        <div style={styles.summaryBox}>
          <h2>Đơn hàng của bạn</h2>

          {cartItems.map((item) => (
            <div key={item.id} style={styles.orderItem}>
              <div style={styles.icon}>
                <img
                  src={getCartImage(item)}
                  alt={item.name}
                  style={styles.productImg}
                  onError={handleImageError}
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={styles.productName}>{item.name}</h3>
                <p style={styles.productInfo}>
                  Số lượng: {item.quantity} x {formatPrice(item.price)}
                </p>
              </div>

              <strong>
                {formatPrice(Number(item.price) * Number(item.quantity))}
              </strong>
            </div>
          ))}

          <div style={styles.totalBox}>
            <h2>Tổng cộng:</h2>
            <h2 style={{ color: "#1769ff" }}>{formatPrice(cartTotal)}</h2>
          </div>
        </div>
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
          Giỏ hàng 🛒
        </Link>

        <Link style={styles.activeLink} to="/checkout">
          Thanh toán
        </Link>

        <Link style={styles.navLink} to="/orders">
          Đơn hàng 🧾
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

  activeLink: {
    color: "#1769ff",
    textDecoration: "none",
    fontWeight: "700",
    borderBottom: "3px solid #1769ff",
    paddingBottom: "24px",
  },

  titleBox: {
    background: "linear-gradient(120deg, #eef6ff, #ffffff)",
    borderRadius: "12px",
    padding: "35px 40px",
    marginTop: "15px",
    marginBottom: "20px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "34px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
  },

  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  formBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  label: {
    display: "block",
    marginTop: "15px",
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

  textarea: {
    width: "100%",
    height: "90px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    resize: "none",
  },

  orderButton: {
    marginTop: "20px",
    width: "100%",
    height: "48px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  summaryBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  orderItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #e5e7eb",
    padding: "15px 0",
  },

  icon: {
    width: "70px",
    height: "70px",
    backgroundColor: "#f3f8ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "6px",
  },

  productName: {
    margin: "0 0 6px",
    fontSize: "16px",
  },

  productInfo: {
    margin: 0,
    color: "#6b7280",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "12px 22px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  emptyBox: {
    marginTop: "80px",
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },
};

export default CheckoutPage;