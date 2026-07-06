import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "./CartContext";

const API_URL = "http://127.0.0.1:8000";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function ProjectList() {
  const [searchParams] = useSearchParams();
  const { addToCart, cartCount } = useCart();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const searchFromHome = searchParams.get("search") || "";
  const categoryFromHome = searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchFromHome);
  const [category, setCategory] = useState(categoryFromHome);
  const [sortPrice, setSortPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        setProducts(data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm từ database:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getCategoryName = (product) => {
    if (typeof product.category === "object" && product.category !== null) {
      return product.category.name || "Khác";
    }

    return product.category_name || product.category || "Khác";
  };

  const getImageUrl = (product) => {
    const image = product.image_url || product.image;

    if (!image) return FALLBACK_IMAGE;

    if (image.startsWith("http")) return image;

    if (image.startsWith("/images")) return image;

    if (image.startsWith("/uploads")) return `${API_URL}${image}`;

    return image;
  };

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((item) => getCategoryName(item)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim() !== "") {
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      result = result.filter((item) => getCategoryName(item) === category);
    }

    if (sortPrice === "asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortPrice === "desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, search, category, sortPrice]);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  const resetFilter = () => {
    setSearch("");
    setCategory("All");
    setSortPrice("");
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
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

          <Link style={styles.activeLink} to="/products">
            Sản phẩm
          </Link>

          <Link style={styles.navLink} to="/cart">
            Giỏ hàng 🛒 ({cartCount})
          </Link>

          <Link style={styles.navLink} to="/orders">
            Đơn hàng 🧾
          </Link>

          {currentUser?.role === "admin" && (
  <Link style={styles.navLink} to="/admin/products">
    Admin
  </Link>
)}
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h2 style={styles.title}>Danh sách sản phẩm</h2>
        <p style={styles.subtitle}>
          Tìm kiếm, lọc danh mục và sắp xếp sản phẩm trong ShopHub.
        </p>
      </section>

      <section style={styles.filterBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "Tất cả danh mục" : item}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={sortPrice}
          onChange={(e) => setSortPrice(e.target.value)}
        >
          <option value="">Sắp xếp giá</option>
          <option value="asc">Giá thấp đến cao</option>
          <option value="desc">Giá cao đến thấp</option>
        </select>

        <button style={styles.resetBtn} onClick={resetFilter}>
          Làm mới
        </button>
      </section>

      {loading ? (
        <div style={styles.emptyBox}>
          <h3>Đang tải sản phẩm...</h3>
        </div>
      ) : (
        <>
          <div style={styles.resultText}>
            Tìm thấy <b>{filteredProducts.length}</b> sản phẩm
          </div>

          {filteredProducts.length > 0 ? (
            <section style={styles.grid}>
              {filteredProducts.map((product) => (
                <div style={styles.card} key={product.id}>
                  <div style={styles.productImage}>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      style={styles.productImg}
                      onError={handleImageError}
                    />
                  </div>

                  <div style={styles.cardBody}>
                    <span style={styles.category}>
                      {getCategoryName(product)}
                    </span>

                    <h3 style={styles.productName}>{product.name}</h3>

                    <p style={styles.description}>
                      {product.description || "Chưa có mô tả sản phẩm."}
                    </p>

                    <p style={styles.price}>{formatPrice(product.price)}</p>

                    <div style={styles.actions}>
                      <Link
                        to={`/products/${product.id}`}
                        style={styles.detailBtn}
                      >
                        Xem chi tiết
                      </Link>

                      <button
                        style={styles.cartBtn}
                        onClick={() => handleAddToCart(product)}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <div style={styles.emptyBox}>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>
                Nếu Admin đã xóa hết sản phẩm thì trang này sẽ không còn hiện
                sản phẩm nữa.
              </p>
            </div>
          )}
        </>
      )}
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

  filterBox: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr auto",
    gap: "15px",
    marginBottom: "18px",
  },

  input: {
    height: "48px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 15px",
    fontSize: "15px",
  },

  select: {
    height: "48px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "15px",
    backgroundColor: "white",
  },

  resetBtn: {
    height: "48px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 22px",
    fontWeight: "700",
    cursor: "pointer",
  },

  resultText: {
    marginBottom: "15px",
    fontSize: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "22px",
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    backgroundColor: "white",
  },

  productImage: {
    height: "160px",
    backgroundColor: "#f3f8ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "15px",
  },

  cardBody: {
    padding: "18px",
  },

  category: {
    display: "inline-block",
    backgroundColor: "#dbeafe",
    color: "#1769ff",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "10px",
  },

  productName: {
    margin: "0 0 8px",
    fontSize: "18px",
    minHeight: "44px",
  },

  description: {
    margin: "0 0 12px",
    color: "#6b7280",
    fontSize: "14px",
    minHeight: "40px",
  },

  price: {
    color: "#1769ff",
    fontSize: "20px",
    fontWeight: "800",
    margin: "0 0 15px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  detailBtn: {
    flex: 1,
    backgroundColor: "#111827",
    color: "white",
    textAlign: "center",
    padding: "10px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "700",
  },

  cartBtn: {
    flex: 1,
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    color: "#6b7280",
  },
};

export default ProjectList;