import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import "./HomePage.css";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x450/eaf2ff/1769ff&text=ShopHub";

const categories = [
  {
    name: "Laptop",
    label: "Laptop",
    description: "Máy tính xách tay",
    icon: "💻",
  },
  {
    name: "Phone",
    label: "Điện thoại",
    description: "Smartphone chính hãng",
    icon: "📱",
  },
  {
    name: "Tablet",
    label: "Máy tính bảng",
    description: "Học tập và giải trí",
    icon: "▣",
  },
  {
    name: "Accessory",
    label: "Phụ kiện",
    description: "Tai nghe, sạc, chuột",
    icon: "🎧",
  },
];

const brands = [
  { name: "Apple", image: "/images/brands/apple.png" },
  { name: "ASUS", image: "/images/brands/asus.png" },
  { name: "Dell", image: "/images/brands/dell.png" },
  { name: "HP", image: "/images/brands/hp.png" },
  { name: "Lenovo", image: "/images/brands/lenovo.png" },
  { name: "Samsung", image: "/images/brands/samsung.png" },
];


function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState({
    hours: 8,
    minutes: 24,
    seconds: 36,
  });
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Lỗi đọc thông tin người dùng:", error);
      localStorage.removeItem("currentUser");
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/products");
        const productData = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        setProducts(productData.slice(0, 5));
      } catch (error) {
        console.error(
          "Lỗi lấy sản phẩm từ API:",
          error.response?.data || error.message
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    const items = document.querySelectorAll(".reveal");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [products]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        let { hours, minutes, seconds } = current;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 8;
          minutes = 24;
          seconds = 36;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setToast("Vui lòng nhập tên sản phẩm cần tìm.");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(trimmedKeyword)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");

    setToast("Đăng xuất thành công.");
    setMenuOpen(false);

    window.setTimeout(() => {
      navigate("/login");
    }, 650);
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const getUserDisplayName = () =>
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.email ||
    "Tài khoản";

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "ADMIN";

  const handleHeroMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setHeroTilt({
      x: Number((x * 10).toFixed(2)),
      y: Number((y * -8).toFixed(2)),
    });
  };

  const resetHeroTilt = () => {
    setHeroTilt({ x: 0, y: 0 });
  };

  const formatCountdown = (value) => String(value).padStart(2, "0");

  const getProductsByCategory = (categoryName) => {
    const normalizedCategory = categoryName.toLowerCase();

    return products
      .filter((product) => {
        const categoryText = String(
          product.category?.name ||
            product.category_name ||
            product.category ||
            ""
        ).toLowerCase();

        return categoryText.includes(normalizedCategory);
      })
      .slice(0, 4);
  };

  const laptopProducts = getProductsByCategory("laptop");
  const phoneProducts = getProductsByCategory("phone");
  const accessoryProducts = getProductsByCategory("accessory");

  return (
    <div className="home">
      {toast && <div className="toast-message">{toast}</div>}

      <div className="top-bar">
        <div className="container top-bar-inner">
          <p>🚚 FREESHIP toàn quốc cho đơn hàng từ 1.000.000đ</p>

          <div>
            <span>Hỗ trợ 24/7</span>
            <Link to="/orders">Theo dõi đơn hàng</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <Link to="/" className="logo" aria-label="ShopHub">
            <div className="logo-box">S</div>
            <h1>
              Shop<span>Hub</span>
            </h1>
          </Link>

          <div className="header-search">
            <input
              type="text"
              placeholder="Bạn cần tìm sản phẩm gì?"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
            />

            <button type="button" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>

          <div className="header-actions">
            {currentUser ? (
              <div className="account-box">
                <span className="account-icon">●</span>
                <div>
                  <small>Xin chào</small>
                  <strong>{getUserDisplayName()}</strong>
                </div>
              </div>
            ) : (
              <Link to="/login" className="account-box">
                <span className="account-icon">●</span>
                <div>
                  <small>Tài khoản</small>
                  <strong>Đăng nhập</strong>
                </div>
              </Link>
            )}

            <Link to="/cart" className="cart-button" aria-label="Giỏ hàng">
              <span>🛒</span>
              <div>
                <small>Giỏ hàng</small>
                <strong>Xem giỏ</strong>
              </div>
            </Link>

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Mở menu"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="nav-wrap">
          <nav className={`container main-nav ${menuOpen ? "open" : ""}`}>
            <div className="category-menu-wrapper">
              <button
                type="button"
                className="category-menu"
                aria-label="Danh mục sản phẩm"
              >
                ☰ Danh mục sản phẩm
                <span className="category-menu-chevron">⌄</span>
              </button>

              <div className="category-dropdown">
                <Link
                  to="/products?category=Laptop"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="category-dropdown-icon">💻</span>
                  <div>
                    <strong>Laptop</strong>
                    <small>Máy tính xách tay</small>
                  </div>
                </Link>

                <Link
                  to="/products?category=Phone"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="category-dropdown-icon">📱</span>
                  <div>
                    <strong>Điện thoại</strong>
                    <small>Smartphone chính hãng</small>
                  </div>
                </Link>

                <Link
                  to="/products?category=Accessory"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="category-dropdown-icon">🎧</span>
                  <div>
                    <strong>Phụ kiện</strong>
                    <small>Tai nghe, sạc, chuột</small>
                  </div>
                </Link>

                <Link
                  to="/products"
                  className="category-dropdown-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="category-dropdown-icon">▦</span>
                  <div>
                    <strong>Xem tất cả sản phẩm</strong>
                    <small>Khám phá toàn bộ cửa hàng</small>
                  </div>
                </Link>
              </div>
            </div>

            <Link className="active" to="/" onClick={() => setMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>
              Sản phẩm
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Giỏ hàng
            </Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>
              Đơn hàng
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  onClick={() => setMenuOpen(false)}
                >
                  Quản lý
                </Link>
              </>
            )}

            <div className="nav-spacer" />

            {currentUser ? (
              <button type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            ) : (
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Đăng ký
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section
          className="container hero-section"
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={resetHeroTilt}
        >
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-grid-pattern" />
          <div className="hero-content">
            <span className="hero-badge">🔥 Ưu đãi công nghệ mỗi ngày</span>

            <h2>
              Nâng tầm trải nghiệm
              <br />
              <span>Công nghệ mỗi ngày</span>
            </h2>

            <p>
              Khám phá thiết bị công nghệ chính hãng, thiết kế hiện đại,
              hiệu năng mạnh mẽ và ưu đãi hấp dẫn tại ShopHub.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/products">
                Mua ngay <span>→</span>
              </Link>

              <Link className="secondary-button" to="/products">
                Xem tất cả sản phẩm
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>1.000+</strong>
                <span>Sản phẩm</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Hỗ trợ</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Chính hãng</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />

            <div
              className="hero-image-wrapper"
              style={{
                transform: `perspective(1200px) rotateY(${heroTilt.x}deg) rotateX(${heroTilt.y}deg)`,
              }}
            >
              <img
                className="hero-single-image"
                src="/images/banner-home.png"
                alt="Sản phẩm công nghệ ShopHub"
                onError={handleImageError}
              />

              <div className="image-shine" />
            </div>

            <div className="floating-card floating-card-one">
              <span>✓</span>
              <div>
                <strong>Chính hãng</strong>
                <small>Bảo hành uy tín</small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span>⚡</span>
              <div>
                <strong>Giao nhanh</strong>
                <small>Toàn quốc</small>
              </div>
            </div>
          </div>
        </section>

        <section className="container hero-highlight-strip">
          <div>
            <span>⚡</span>
            <strong>Hiệu năng mạnh mẽ</strong>
            <small>Thiết bị tối ưu cho học tập và công việc</small>
          </div>
          <div>
            <span>🎁</span>
            <strong>Ưu đãi mỗi tuần</strong>
            <small>Nhiều chương trình giảm giá hấp dẫn</small>
          </div>
          <div>
            <span>🛡️</span>
            <strong>Bảo hành minh bạch</strong>
            <small>Chính sách rõ ràng, hỗ trợ nhanh chóng</small>
          </div>
        </section>

        <section className="container category-section reveal">
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <span className="category-icon">{category.icon}</span>

                <div>
                  <strong>{category.label}</strong>
                  <small>{category.description}</small>
                </div>

                <span className="category-arrow">›</span>
              </Link>
            ))}

            <Link to="/products" className="category-card view-all-category">
              <span className="category-icon">▦</span>

              <div>
                <strong>Xem tất cả</strong>
                <small>Khám phá danh mục</small>
              </div>

              <span className="category-arrow">›</span>
            </Link>
          </div>
        </section>

        <section className="container featured-section reveal">
          <div className="section-heading">
            <div>
              <span>Sản phẩm được yêu thích</span>
              <h2>Sản phẩm nổi bật</h2>
            </div>

            <Link to="/products">Xem tất cả <span>→</span></Link>
          </div>

          <div className="product-grid">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div className="product-card skeleton-card" key={index}>
                    <div className="skeleton skeleton-image" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-button" />
                  </div>
                ))
              : products.map((product, index) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-badge">
                      {index === 0
                        ? "BÁN CHẠY"
                        : index === 1
                        ? "GIẢM GIÁ"
                        : index === 2
                        ? "MỚI"
                        : "NỔI BẬT"}
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="product-image"
                    >
                      <img
                        src={
                          product.image_url ||
                          product.image ||
                          FALLBACK_IMAGE
                        }
                        alt={product.name || "Sản phẩm ShopHub"}
                        onError={handleImageError}
                      />
                    </Link>

                    <div className="product-body">
                      <Link
                        to={`/products/${product.id}`}
                        className="product-name"
                      >
                        {product.name}
                      </Link>

                      <div className="rating">
                        <span>★★★★★</span>
                        <small>({35 + index * 17})</small>
                      </div>

                      <div className="product-bottom">
                        <div>
                          <p className="product-price">
                            {Number(product.price || 0).toLocaleString("vi-VN")}đ
                          </p>
                          <small className="old-price">
                            {(
                              Number(product.price || 0) * 1.12
                            ).toLocaleString("vi-VN", {
                              maximumFractionDigits: 0,
                            })}
                            đ
                          </small>
                        </div>

                        <Link
                          className="product-cart-button"
                          to={`/products/${product.id}`}
                          aria-label={`Xem ${product.name}`}
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}

            {!isLoading && products.length === 0 && (
              <div className="empty-product">
                <span>📦</span>
                <h3>Chưa có sản phẩm</h3>
                <p>Vui lòng kiểm tra lại kết nối API hoặc thêm sản phẩm mới.</p>
              </div>
            )}
          </div>
        </section>

        <section className="container flash-sale-section reveal">
          <div className="flash-sale-header">
            <div>
              <span className="section-kicker">⚡ Deal giới hạn</span>
              <h2>Flash Sale công nghệ</h2>
              <p>Giá tốt trong hôm nay, số lượng có hạn.</p>
            </div>

            <div className="countdown">
              <div>
                <strong>{formatCountdown(countdown.hours)}</strong>
                <small>Giờ</small>
              </div>
              <span>:</span>
              <div>
                <strong>{formatCountdown(countdown.minutes)}</strong>
                <small>Phút</small>
              </div>
              <span>:</span>
              <div>
                <strong>{formatCountdown(countdown.seconds)}</strong>
                <small>Giây</small>
              </div>
            </div>
          </div>

          <div className="flash-product-grid">
            {products.slice(0, 4).map((product, index) => (
              <article className="flash-product-card" key={`flash-${product.id}`}>
                <span className="flash-discount">-{10 + index * 5}%</span>

                <Link to={`/products/${product.id}`} className="flash-image">
                  <img
                    src={product.image_url || product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={handleImageError}
                  />
                </Link>

                <div className="flash-content">
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                  <strong>
                    {Number(product.price || 0).toLocaleString("vi-VN")}đ
                  </strong>
                  <small>
                    {(
                      Number(product.price || 0) * 1.18
                    ).toLocaleString("vi-VN", {
                      maximumFractionDigits: 0,
                    })}
                    đ
                  </small>

                  <div className="sold-progress">
                    <span style={{ width: `${55 + index * 10}%` }} />
                    <p>Đã bán {55 + index * 10}%</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container category-showcase reveal">
          <div className="showcase-heading">
            <div>
              <span className="section-kicker">Lựa chọn theo nhu cầu</span>
              <h2>Laptop nổi bật</h2>
            </div>
            <Link to="/products?category=Laptop">Xem tất cả →</Link>
          </div>

          <div className="showcase-layout">
            <article className="showcase-banner laptop-showcase">
              <img
                src="/images/banner-laptop.png"
                alt="Laptop cho học tập và công việc"
                className="showcase-banner-image"
                onError={handleImageError}
              />

              <div className="showcase-banner-overlay" />

              <div className="showcase-banner-content">
                <span>Hiệu năng vượt trội</span>
                <h3>Laptop cho học tập và công việc</h3>
                <p>Mỏng nhẹ, mạnh mẽ và bền bỉ trong từng tác vụ.</p>
                <Link to="/products?category=Laptop">Khám phá ngay →</Link>
              </div>
            </article>

            <div className="mini-product-grid">
              {(laptopProducts.length ? laptopProducts : products.slice(0, 4)).map(
                (product) => (
                  <article className="mini-product-card" key={`laptop-${product.id}`}>
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image_url || product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        onError={handleImageError}
                      />
                    </Link>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                    <strong>
                      {Number(product.price || 0).toLocaleString("vi-VN")}đ
                    </strong>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section className="container category-showcase reveal">
          <div className="showcase-heading">
            <div>
              <span className="section-kicker">Thiết bị di động</span>
              <h2>Điện thoại & phụ kiện</h2>
            </div>
            <Link to="/products?category=Phone">Xem tất cả →</Link>
          </div>

          <div className="showcase-layout reverse">
            <article className="showcase-banner phone-showcase">
              <img
                src="/images/banner-phone.png"
                alt="Điện thoại và phụ kiện công nghệ"
                className="showcase-banner-image"
                onError={handleImageError}
              />

              <div className="showcase-banner-overlay" />

              <div className="showcase-banner-content">
                <span>Kết nối thông minh</span>
                <h3>Công nghệ luôn trong tầm tay</h3>
                <p>Thiết kế hiện đại, camera sắc nét và pin bền bỉ.</p>
                <Link to="/products?category=Phone">Mua ngay →</Link>
              </div>
            </article>

            <div className="mini-product-grid">
              {[
                ...phoneProducts,
                ...accessoryProducts.filter(
                  (accessory) =>
                    !phoneProducts.some((phone) => phone.id === accessory.id)
                ),
                ...products.filter(
                  (product) =>
                    !phoneProducts.some((phone) => phone.id === product.id) &&
                    !accessoryProducts.some(
                      (accessory) => accessory.id === product.id
                    )
                ),
              ]
                .slice(0, 2)
                .map((product) => (
                  <article
                    className="mini-product-card"
                    key={`phone-${product.id}`}
                  >
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={
                          product.image_url ||
                          product.image ||
                          FALLBACK_IMAGE
                        }
                        alt={product.name}
                        onError={handleImageError}
                      />
                    </Link>

                    <Link to={`/products/${product.id}`}>
                      {product.name}
                    </Link>

                    <strong>
                      {Number(product.price || 0).toLocaleString("vi-VN")}đ
                    </strong>
                  </article>
                ))}
            </div>
          </div>
        </section>

        <section className="container gaming-banner reveal">
          <img
            src="/images/banner-gaming.png"
            alt="Gaming Week ShopHub"
            className="gaming-banner-image"
            onError={handleImageError}
          />

          <div className="gaming-banner-overlay" />

          <div className="gaming-banner-content">
            <span>🎮 GAMING WEEK</span>
            <h2>Chiến game cực đỉnh, ưu đãi cực chất</h2>
            <p>
              Laptop gaming, tai nghe và phụ kiện hiệu năng cao dành cho game thủ.
            </p>
            <Link to="/products">Khám phá bộ sưu tập →</Link>
          </div>

          <div className="gaming-visual">
            <div className="gaming-ring ring-one" />
            <div className="gaming-ring ring-two" />
            <span>RTX</span>
            <strong>144Hz</strong>
            <b>RGB</b>
          </div>
        </section>

        <section className="container brand-section reveal">
          <div className="showcase-heading">
            <div>
              <span className="section-kicker">Thương hiệu nổi bật</span>
              <h2>Đối tác công nghệ hàng đầu</h2>
            </div>
          </div>

          <div className="brand-grid">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={`/products?search=${encodeURIComponent(brand.name)}`}
                className="brand-card"
                aria-label={`Xem sản phẩm ${brand.name}`}
              >
                <img
                  src={brand.image}
                  alt={`Logo ${brand.name}`}
                  className="brand-logo"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling.style.display = "block";
                  }}
                />

                <span className="brand-fallback">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container testimonial-section reveal">
          <div className="showcase-heading centered-heading">
            <div>
              <span className="section-kicker">Khách hàng nói gì</span>
              <h2>Trải nghiệm mua sắm đáng tin cậy</h2>
            </div>
          </div>

          <div className="testimonial-grid">
            <article>
              <div className="testimonial-stars">★★★★★</div>
              <p>
                “Sản phẩm đúng mô tả, đóng gói cẩn thận và giao hàng rất nhanh.”
              </p>
              <strong>Minh Anh</strong>
              <small>Khách hàng tại TP. Hồ Chí Minh</small>
            </article>

            <article>
              <div className="testimonial-stars">★★★★★</div>
              <p>
                “Giao diện dễ sử dụng, thanh toán thuận tiện và hỗ trợ nhiệt tình.”
              </p>
              <strong>Quốc Huy</strong>
              <small>Khách hàng tại Hà Nội</small>
            </article>

            <article>
              <div className="testimonial-stars">★★★★★</div>
              <p>
                “Mức giá hợp lý, nhiều lựa chọn và chính sách bảo hành rõ ràng.”
              </p>
              <strong>Thanh Trúc</strong>
              <small>Khách hàng tại Đà Nẵng</small>
            </article>
          </div>
        </section>

        <section className="container promo-section reveal">
          <div>
            <span>🎁 Ưu đãi thành viên mới</span>
            <h2>Giảm ngay 10% cho đơn hàng đầu tiên</h2>
            <p>
              Nhập mã <strong>SH10</strong> khi thanh toán. Áp dụng cho đơn hàng
              từ 1.000.000đ.
            </p>
          </div>

          <Link to="/products">
            Mua sắm ngay <span>→</span>
          </Link>
        </section>

        <section className="container benefits-section reveal">
          <article>
            <span>🚚</span>
            <div>
              <h3>Freeship toàn quốc</h3>
              <p>Đơn hàng từ 1.000.000đ</p>
            </div>
          </article>

          <article>
            <span>🛡️</span>
            <div>
              <h3>Cam kết chính hãng</h3>
              <p>Sản phẩm rõ nguồn gốc</p>
            </div>
          </article>

          <article>
            <span>↻</span>
            <div>
              <h3>Đổi trả dễ dàng</h3>
              <p>Hỗ trợ đổi trả trong 7 ngày</p>
            </div>
          </article>

          <article>
            <span>🎧</span>
            <div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Hotline 1900 1234</p>
            </div>
          </article>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-box">S</div>
              <h2>
                Shop<span>Hub</span>
              </h2>
            </Link>

            <p>
              Nền tảng mua sắm trực tuyến đáng tin cậy, mang đến sản phẩm công
              nghệ chính hãng và trải nghiệm mua sắm hiện đại.
            </p>

            <div className="social-links">
              <a href="#facebook" aria-label="Facebook">f</a>
              <a href="#instagram" aria-label="Instagram">◎</a>
              <a href="#youtube" aria-label="YouTube">▶</a>
            </div>
          </div>

          <div>
            <h3>Về ShopHub</h3>
            <Link to="/">Giới thiệu</Link>
            <Link to="/products">Sản phẩm</Link>
            <a href="#privacy">Chính sách bảo mật</a>
            <a href="#terms">Điều khoản sử dụng</a>
          </div>

          <div>
            <h3>Hỗ trợ khách hàng</h3>
            <a href="#guide">Hướng dẫn mua hàng</a>
            <a href="#payment">Phương thức thanh toán</a>
            <a href="#shipping">Chính sách vận chuyển</a>
            <a href="#return">Chính sách đổi trả</a>
          </div>

          <div>
            <h3>Liên hệ</h3>
            <p>📞 1900 1234</p>
            <p>✉ support@shophub.vn</p>
            <p>📍 Quận 1, TP. Hồ Chí Minh</p>
          </div>
        </div>

        <div className="container copyright">
          <p>© 2026 ShopHub. All rights reserved.</p>
          <p>Thiết kế cho trải nghiệm mua sắm hiện đại.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;