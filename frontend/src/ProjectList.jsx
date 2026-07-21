import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import { useCart } from "./CartContext";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function ProjectList() {
  const [searchParams] = useSearchParams();
  const { addToCart, cartCount } = useCart();

  let currentUser = null;

  try {
    const savedUser = localStorage.getItem("currentUser");
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Lỗi đọc thông tin người dùng:", error);
    localStorage.removeItem("currentUser");
  }

  const searchFromHome = searchParams.get("search") || "";
  const categoryFromHome =
    searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchFromHome);
  const [category, setCategory] =
    useState(categoryFromHome);
  const [sortPrice, setSortPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(searchFromHome);
    setCategory(categoryFromHome);
  }, [searchFromHome, categoryFromHome]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await api.get("/products");

        const productData = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        setProducts(productData);
      } catch (error) {
        console.error(
          "Lỗi lấy sản phẩm từ database:",
          error.response?.data || error.message
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getCategoryName = (product) => {
    if (
      typeof product?.category === "object" &&
      product?.category !== null
    ) {
      return product.category.name || "Khác";
    }

    return (
      product?.category_name ||
      product?.category ||
      "Khác"
    );
  };

  const getImageUrl = (product) => {
    const image =
      product?.image_url ||
      product?.image;

    if (!image) {
      return FALLBACK_IMAGE;
    }

    if (image.startsWith("http")) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return `${api.defaults.baseURL}${image}`;
    }

    if (image.startsWith("/images")) {
      return image;
    }

    return image;
  };

  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => getCategoryName(product))
      .filter(Boolean);

    return [
      "All",
      ...new Set(categoryNames),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) =>
        String(product?.name || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (category !== "All") {
      result = result.filter(
        (product) =>
          getCategoryName(product) === category
      );
    }

    if (sortPrice === "asc") {
      result.sort(
        (firstProduct, secondProduct) =>
          Number(firstProduct.price || 0) -
          Number(secondProduct.price || 0)
      );
    }

    if (sortPrice === "desc") {
      result.sort(
        (firstProduct, secondProduct) =>
          Number(secondProduct.price || 0) -
          Number(firstProduct.price || 0)
      );
    }

    return result;
  }, [products, search, category, sortPrice]);

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString(
      "vi-VN"
    )} đ`;
  };

  const resetFilter = () => {
    setSearch("");
    setCategory("All");
    setSortPrice("");
  };

  const handleAddToCart = (product) => {
    if (Number(product?.stock || 0) <= 0) {
      alert("Sản phẩm đã hết hàng.");
      return;
    }

    addToCart(product);

    alert(
      `Đã thêm "${product.name}" vào giỏ hàng`
    );
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "ADMIN";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoBox}>S</div>

          <h1 style={styles.logoText}>
            Shop
            <span style={{ color: "#1769ff" }}>
              Hub
            </span>
          </h1>
        </Link>

        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/">
            Trang chủ
          </Link>

          <Link
            style={styles.activeLink}
            to="/products"
          >
            Sản phẩm
          </Link>

          <Link style={styles.navLink} to="/cart">
            Giỏ hàng 🛒 ({cartCount})
          </Link>

          <Link style={styles.navLink} to="/orders">
            Đơn hàng 🧾
          </Link>

          {isAdmin && (
            <Link
              style={styles.navLink}
              to="/admin/products"
            >
              Admin
            </Link>
          )}
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h2 style={styles.title}>
          Danh sách sản phẩm
        </h2>

        <p style={styles.subtitle}>
          Tìm kiếm, lọc danh mục và sắp xếp sản
          phẩm trong ShopHub.
        </p>
      </section>

      <section style={styles.filterBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          style={styles.select}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All"
                ? "Tất cả danh mục"
                : item}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={sortPrice}
          onChange={(event) =>
            setSortPrice(event.target.value)
          }
        >
          <option value="">Sắp xếp giá</option>
          <option value="asc">
            Giá thấp đến cao
          </option>
          <option value="desc">
            Giá cao đến thấp
          </option>
        </select>

        <button
          type="button"
          style={styles.resetBtn}
          onClick={resetFilter}
        >
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
            Tìm thấy{" "}
            <b>{filteredProducts.length}</b>{" "}
            sản phẩm
          </div>

          {filteredProducts.length > 0 ? (
            <section style={styles.grid}>
              {filteredProducts.map((product) => {
                const outOfStock =
                  Number(product?.stock || 0) <= 0;

                return (
                  <div
                    style={styles.card}
                    key={product.id}
                  >
                    <div style={styles.productImage}>
                      <img
                        src={getImageUrl(product)}
                        alt={
                          product.name ||
                          "Sản phẩm ShopHub"
                        }
                        style={styles.productImg}
                        onError={handleImageError}
                      />
                    </div>

                    <div style={styles.cardBody}>
                      <span style={styles.category}>
                        {getCategoryName(product)}
                      </span>

                      <h3 style={styles.productName}>
                        {product.name}
                      </h3>

                      <p style={styles.description}>
                        {product.description ||
                          "Chưa có mô tả sản phẩm."}
                      </p>

                      <p style={styles.price}>
                        {formatPrice(product.price)}
                      </p>

                      <p style={styles.stock}>
                        Kho: {product.stock ?? 0} sản phẩm
                      </p>

                      <div style={styles.actions}>
                        <Link
                          to={`/products/${product.id}`}
                          style={styles.detailBtn}
                        >
                          Xem chi tiết
                        </Link>

                        <button
                          type="button"
                          style={{
                            ...styles.cartBtn,
                            opacity: outOfStock
                              ? 0.6
                              : 1,
                            cursor: outOfStock
                              ? "not-allowed"
                              : "pointer",
                          }}
                          disabled={outOfStock}
                          onClick={() =>
                            handleAddToCart(product)
                          }
                        >
                          {outOfStock
                            ? "Hết hàng"
                            : "Thêm vào giỏ"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            <div style={styles.emptyBox}>
              <h3>Không tìm thấy sản phẩm</h3>

              <p>
                Hãy thử thay đổi từ khóa tìm kiếm
                hoặc chọn danh mục khác.
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
    background:
      "linear-gradient(120deg, #eef6ff, #ffffff)",
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
    gridTemplateColumns:
      "1.5fr 1fr 1fr auto",
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
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "22px",
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.04)",
    backgroundColor: "white",
  },

  productImage: {
    height: "180px",
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
    lineHeight: "1.5",
  },

  price: {
    color: "#1769ff",
    fontSize: "20px",
    fontWeight: "800",
    margin: "0 0 8px",
  },

  stock: {
    color: "#6b7280",
    fontSize: "14px",
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