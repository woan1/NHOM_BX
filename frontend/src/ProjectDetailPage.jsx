import { Link, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import { getProducts } from "./productData";

function ProjectDetailPage() {
  const { id } = useParams();
  const { addToCart, cartCount } = useCart();

  const products = getProducts();
  const product = products.find((item) => item.id === Number(id));

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  if (!product) {
    return (
      <div style={styles.page}>
        <Header cartCount={cartCount} />

        <div style={styles.emptyBox}>
          <h1>Không tìm thấy sản phẩm</h1>
          <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>

          <Link to="/products">
            <button style={styles.primaryButton}>Quay lại sản phẩm</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header cartCount={cartCount} />

      <section style={styles.breadcrumb}>
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <b>{product.name}</b>
      </section>

      <section style={styles.detailBox}>
        <div style={styles.imageBox}>
          <img src={product.image} alt={product.name} style={styles.detailImage} />
        </div>

        <div style={styles.infoBox}>
          <span style={styles.category}>{product.category}</span>

          <h1 style={styles.productName}>{product.name}</h1>

          <p style={styles.shortDescription}>{product.description}</p>

          <h2 style={styles.price}>{formatPrice(product.price)}</h2>

          <div style={styles.infoGrid}>
            <div>
              <b>Thương hiệu:</b>
              <p>{product.brand}</p>
            </div>

            <div>
              <b>Tình trạng:</b>
              <p>{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</p>
            </div>

            <div>
              <b>Số lượng kho:</b>
              <p>{product.stock} sản phẩm</p>
            </div>

            <div>
              <b>Bảo hành:</b>
              <p>12 tháng</p>
            </div>
          </div>

          <div style={styles.actions}>
            <button onClick={handleAddToCart} style={styles.cartButton}>
              Thêm vào giỏ hàng
            </button>

            <Link to="/cart">
              <button style={styles.buyButton}>Đến giỏ hàng</button>
            </Link>
          </div>

          <Link to="/products" style={styles.backLink}>
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </section>

      <section style={styles.descriptionBox}>
        <h2>Mô tả chi tiết</h2>
        <p>{product.detail}</p>
      </section>
    </div>
  );
}

function Header({ cartCount }) {
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

        <Link style={styles.activeLink} to="/products">
          Sản phẩm
        </Link>

        <Link style={styles.navLink} to="/cart">
          Giỏ hàng 🛒 ({cartCount})
        </Link>

        <Link style={styles.navLink} to="/orders">
          Đơn hàng 🧾
        </Link>

        <Link style={styles.navLink} to="/admin/products">
          Admin
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

  breadcrumb: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "20px",
    marginBottom: "20px",
    color: "#6b7280",
  },

  detailBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "35px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "35px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  imageBox: {
    backgroundColor: "#f3f8ff",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "420px",
  },

  detailImage: {
    width: "85%",
    height: "85%",
    objectFit: "contain",
  },

  infoBox: {
    display: "flex",
    flexDirection: "column",
  },

  category: {
    width: "fit-content",
    backgroundColor: "#dbeafe",
    color: "#1769ff",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "800",
    marginBottom: "15px",
  },

  productName: {
    margin: "0 0 12px",
    fontSize: "36px",
  },

  shortDescription: {
    color: "#6b7280",
    fontSize: "17px",
    marginBottom: "15px",
  },

  price: {
    color: "#1769ff",
    fontSize: "32px",
    margin: "0 0 20px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },

  actions: {
    display: "flex",
    gap: "15px",
    marginBottom: "18px",
  },

  cartButton: {
    padding: "14px 28px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  buyButton: {
    padding: "14px 28px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  backLink: {
    color: "#1769ff",
    fontWeight: "700",
    textDecoration: "none",
  },

  descriptionBox: {
    marginTop: "25px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  emptyBox: {
    marginTop: "80px",
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
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
};

export default ProjectDetailPage;