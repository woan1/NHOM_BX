import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

const API_URL = "http://127.0.0.1:8000";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  const getCategoryName = (item) => {
    if (typeof item.category === "object" && item.category !== null) {
      return item.category.name || "Khác";
    }

    return item.category_name || item.category || "Khác";
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

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyPage}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoBox}>S</div>
          <h1 style={styles.logoText}>
            Shop<span style={{ color: "#1769ff" }}>Hub</span>
          </h1>
        </Link>

        <div style={styles.emptyBox}>
          <h1>Giỏ hàng</h1>
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

          <Link style={styles.activeLink} to="/cart">
            Giỏ hàng 🛒
          </Link>

          <Link style={styles.navLink} to="/orders">
            Đơn hàng 🧾
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Giỏ hàng của bạn</h1>
        <p style={styles.subtitle}>
          Kiểm tra sản phẩm, thay đổi số lượng và tiến hành thanh toán.
        </p>
      </section>

      <div style={styles.cartBox}>
        {cartItems.map((item) => (
          <div key={item.id} style={styles.cartItem}>
            <div style={styles.productIcon}>
              <img
                src={getCartImage(item)}
                alt={item.name}
                style={styles.productImg}
                onError={handleImageError}
              />
            </div>

            <div>
              <h3 style={styles.productName}>{item.name}</h3>
              <p style={styles.category}>{getCategoryName(item)}</p>
              <p style={styles.price}>{formatPrice(item.price)}</p>
            </div>

            <div style={styles.quantityBox}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={styles.smallButton}
              >
                -
              </button>

              <span style={styles.quantity}>{item.quantity}</span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={styles.smallButton}
              >
                +
              </button>
            </div>

            <strong style={styles.totalItem}>
              {formatPrice(Number(item.price) * Number(item.quantity))}
            </strong>

            <button
              onClick={() => removeFromCart(item.id)}
              style={styles.deleteButton}
            >
              Xóa
            </button>
          </div>
        ))}

        <div style={styles.summary}>
          <h2>Tổng tiền: {formatPrice(cartTotal)}</h2>

          <div>
            <button onClick={clearCart} style={styles.secondaryButton}>
              Xóa giỏ hàng
            </button>

            <Link to="/checkout">
              <button style={styles.primaryButton}>Thanh toán</button>
            </Link>
          </div>
        </div>
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

  emptyPage: {
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
    height: "78px",
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

  cartBox: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  cartItem: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 180px 180px 100px",
    gap: "20px",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 0",
  },

  productIcon: {
    width: "90px",
    height: "90px",
    backgroundColor: "#f3f8ff",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "8px",
  },

  productName: {
    margin: "0 0 8px",
    fontSize: "18px",
  },

  category: {
    margin: "0 0 8px",
    color: "#6b7280",
  },

  price: {
    margin: 0,
    color: "#1769ff",
    fontWeight: "800",
  },

  quantityBox: {
    display: "flex",
    alignItems: "center",
  },

  quantity: {
    margin: "0 14px",
    fontWeight: "800",
    fontSize: "18px",
  },

  smallButton: {
    width: "34px",
    height: "34px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "800",
  },

  totalItem: {
    color: "#111827",
    fontSize: "17px",
  },

  deleteButton: {
    padding: "9px 14px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
  },

  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "12px 22px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    marginLeft: "10px",
    fontWeight: "700",
  },

  secondaryButton: {
    padding: "12px 22px",
    backgroundColor: "#111827",
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

export default CartPage;