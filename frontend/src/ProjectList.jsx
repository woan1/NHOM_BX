import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import { useCart } from "./CartContext";
import "./ProjectList.css";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x450/eaf2ff/1769ff&text=ShopHub";

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
  const categoryFromHome = searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchFromHome);
  const [category, setCategory] = useState(categoryFromHome);
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

    return product?.category_name || product?.category || "Khác";
  };

  const getImageUrl = (product) => {
    const image = product?.image_url || product?.image;

    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads")) {
      return `${api.defaults.baseURL}${image}`;
    }
    if (image.startsWith("/images")) return image;

    return image;
  };

  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => getCategoryName(product))
      .filter(Boolean);

    return ["All", ...new Set(categoryNames)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) =>
        String(product?.name || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (category !== "All") {
      result = result.filter(
        (product) => getCategoryName(product) === category
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

  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("vi-VN")} đ`;

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
    alert(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "ADMIN";

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="products-container products-header-inner">
          <Link to="/" className="products-logo" aria-label="ShopHub">
            <div className="products-logo-box">S</div>
            <h1>
              Shop<span>Hub</span>
            </h1>
          </Link>

          <nav className="products-nav">
            <Link to="/">Trang chủ</Link>
            <Link className="active" to="/products">
              Sản phẩm
            </Link>
            <Link to="/cart">
              Giỏ hàng <span className="cart-count">({cartCount})</span>
            </Link>
            <Link to="/orders">Đơn hàng</Link>
            {isAdmin && <Link to="/admin/products">Admin</Link>}
          </nav>
        </div>
      </header>

      <main className="products-container products-main">
        <section className="products-hero">
          <div>
            <span className="products-kicker">Khám phá công nghệ</span>
            <h2>Danh sách sản phẩm</h2>
            <p>
              Tìm kiếm, lọc danh mục và sắp xếp sản phẩm phù hợp với nhu cầu của bạn.
            </p>
          </div>

          <div className="products-hero-stat">
            <strong>{products.length}</strong>
            <span>Sản phẩm đang có</span>
          </div>
        </section>

        <section className="products-filter-panel">
          <div className="filter-field search-field">
            <label htmlFor="product-search">Tìm kiếm</label>
            <div className="search-input-wrap">
              <span>⌕</span>
              <input
                id="product-search"
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="category-filter">Danh mục</label>
            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "Tất cả danh mục" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="sort-filter">Sắp xếp</label>
            <select
              id="sort-filter"
              value={sortPrice}
              onChange={(event) => setSortPrice(event.target.value)}
            >
              <option value="">Sắp xếp giá</option>
              <option value="asc">Giá thấp đến cao</option>
              <option value="desc">Giá cao đến thấp</option>
            </select>
          </div>

          <button
            type="button"
            className="reset-filter-button"
            onClick={resetFilter}
          >
            Làm mới
          </button>
        </section>

        {loading ? (
          <section className="products-loading">
            <div className="loading-spinner" />
            <h3>Đang tải sản phẩm...</h3>
          </section>
        ) : (
          <>
            <div className="products-result-row">
              <p>
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <section className="products-grid">
                {filteredProducts.map((product, index) => {
                  const outOfStock = Number(product?.stock || 0) <= 0;

                  return (
                    <article className="catalog-card" key={product.id}>
                      <div className="catalog-card-top">
                        <span className="catalog-badge">
                          {outOfStock
                            ? "HẾT HÀNG"
                            : index % 3 === 0
                            ? "BÁN CHẠY"
                            : index % 3 === 1
                            ? "MỚI"
                            : "NỔI BẬT"}
                        </span>

                        <Link
                          to={`/products/${product.id}`}
                          className="catalog-image"
                        >
                          <img
                            src={getImageUrl(product)}
                            alt={product.name || "Sản phẩm ShopHub"}
                            onError={handleImageError}
                          />
                        </Link>
                      </div>

                      <div className="catalog-body">
                        <span className="catalog-category">
                          {getCategoryName(product)}
                        </span>

                        <Link
                          to={`/products/${product.id}`}
                          className="catalog-name"
                        >
                          {product.name}
                        </Link>

                        <p className="catalog-description">
                          {product.description || "Chưa có mô tả sản phẩm."}
                        </p>

                        <div className="catalog-rating">
                          <span>★★★★★</span>
                          <small>({24 + index * 7})</small>
                        </div>

                        <div className="catalog-price-row">
                          <div>
                            <strong>{formatPrice(product.price)}</strong>
                            <small>
                              {formatPrice(Number(product.price || 0) * 1.12)}
                            </small>
                          </div>

                          <span
                            className={
                              outOfStock
                                ? "catalog-stock out"
                                : "catalog-stock"
                            }
                          >
                            {outOfStock
                              ? "Hết hàng"
                              : `Còn ${product.stock ?? 0}`}
                          </span>
                        </div>

                        <div className="catalog-actions">
                          <Link
                            to={`/products/${product.id}`}
                            className="detail-button"
                          >
                            Xem chi tiết
                          </Link>

                          <button
                            type="button"
                            className="add-cart-button"
                            disabled={outOfStock}
                            onClick={() => handleAddToCart(product)}
                          >
                            {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="products-empty">
                <span>📦</span>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Hãy thử thay đổi từ khóa hoặc chọn danh mục khác.</p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ProjectList;