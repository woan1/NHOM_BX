import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import "./HomePage.css";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  let currentUser = null;

  try {
    const savedUser = localStorage.getItem("currentUser");
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Lỗi đọc thông tin người dùng:", error);
    localStorage.removeItem("currentUser");
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        const productData = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        setProducts(productData.slice(0, 4));
      } catch (error) {
        console.error(
          "Lỗi lấy sản phẩm từ API:",
          error.response?.data || error.message
        );

        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(trimmedKeyword)}`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");

    alert("Đã đăng xuất.");
    navigate("/login");
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const getUserDisplayName = () => {
    return (
      currentUser?.fullName ||
      currentUser?.name ||
      currentUser?.email ||
      "Tài khoản"
    );
  };

  return (
    <div className="home">
      <header className="header">
        <Link to="/" className="logo">
          <div className="logo-box">S</div>

          <h1>
            Shop<span>Hub</span>
          </h1>
        </Link>

        <nav className="menu">
          <Link className="active" to="/">
            Trang chủ
          </Link>

          <Link to="/products">Sản phẩm</Link>
          <Link to="/cart">Giỏ hàng 🛒</Link>
          <Link to="/orders">Đơn hàng 🧾</Link>

          {(currentUser?.role === "admin" ||
            currentUser?.role === "ADMIN") && (
            <Link to="/admin/products">⚙️ Admin</Link>
          )}

          {currentUser ? (
            <>
              <span className="user-name">
                👤 {getUserDisplayName()}
              </span>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">👤 Đăng nhập</Link>

              <Link className="register-btn" to="/register">
                👤 Đăng ký
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <button type="button" className="arrow left">
          ‹
        </button>

        <div className="hero-text">
          <span>Chào mừng đến với ShopHub</span>

          <h2>
            Mua sắm thông minh
            <br />
            cùng <b>ShopHub</b>
          </h2>

          <p>
            Đa dạng sản phẩm, giá tốt mỗi ngày và trải nghiệm mua
            sắm trực tuyến tiện lợi, an toàn.
          </p>

          <div className="hero-actions">
            <Link to="/products">Xem sản phẩm ›</Link>

            <Link className="buy-btn" to="/products">
              Mua ngay 🛍
            </Link>
          </div>
        </div>

        <div className="hero-img">
          <img
            className="hero-laptop"
            src="/images/laptop-dell.jpg"
            alt="Laptop Dell"
            onError={handleImageError}
          />

          <img
            className="hero-phone"
            src="/images/iphone-15.jpg"
            alt="iPhone 15"
            onError={handleImageError}
          />

          <img
            className="hero-headphone"
            src="/images/sony-headphone.jpg"
            alt="Tai nghe Sony"
            onError={handleImageError}
          />

          <img
            className="hero-watch"
            src="/images/xiaomi-watch.jpg"
            alt="Đồng hồ Xiaomi"
            onError={handleImageError}
          />
        </div>

        <button type="button" className="arrow right">
          ›
        </button>
      </section>

      <section className="search-area">
        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button type="button" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>

        <div className="category-list">
          <Link to="/products?category=Laptop">
            💻 <b>Laptop</b>
            <small>Máy tính xách tay</small>
          </Link>

          <Link to="/products?category=Phone">
            📱 <b>Phone</b>
            <small>Điện thoại</small>
          </Link>

          <Link to="/products?category=Accessory">
            🎧 <b>Accessory</b>
            <small>Phụ kiện</small>
          </Link>
        </div>
      </section>

      <section className="featured">
        <div className="title-row">
          <h2>Sản phẩm nổi bật</h2>
          <Link to="/products">Xem tất cả ›</Link>
        </div>

        <div className="product-grid">
          {products.length === 0 ? (
            <p className="empty-product">
              Chưa có sản phẩm nào.
            </p>
          ) : (
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-img">
                  <img
                    src={
                      product.image_url ||
                      product.image ||
                      FALLBACK_IMAGE
                    }
                    alt={product.name || "Sản phẩm ShopHub"}
                    onError={handleImageError}
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p>
                    {Number(product.price || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </p>

                  <Link to={`/products/${product.id}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="sale">
        <div>🚚 FREESHIP TOÀN QUỐC</div>

        <div className="discount">
          GIẢM NGAY <b>10%</b>
        </div>

        <div>
          CHO ĐƠN HÀNG TỪ 1.000.000đ
          <br />
          Nhập mã: <mark>SH10</mark>
        </div>

        <Link to="/products">Mua sắm ngay ›</Link>
      </section>

      <section className="why">
        <h2>Vì sao chọn ShopHub?</h2>

        <div className="why-grid">
          <div className="why-card">
            <span>🏅</span>

            <div>
              <h3>Sản phẩm chất lượng</h3>

              <p>
                Cam kết hàng chính hãng, nguồn gốc rõ ràng, bảo
                hành uy tín.
              </p>
            </div>
          </div>

          <div className="why-card">
            <span>🚚</span>

            <div>
              <h3>Giao hàng nhanh</h3>

              <p>
                Giao hàng toàn quốc, nhanh chóng, đúng hẹn.
              </p>
            </div>
          </div>

          <div className="why-card">
            <span>🎧</span>

            <div>
              <h3>Hỗ trợ 24/7</h3>

              <p>
                Đội ngũ hỗ trợ tận tâm, sẵn sàng hỗ trợ mọi lúc.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <div className="footer-logo">
            <div className="logo-box">S</div>

            <h2>
              Shop<span>Hub</span>
            </h2>
          </div>

          <p>
            ShopHub - Nền tảng mua sắm trực tuyến đáng tin cậy,
            mang đến trải nghiệm tốt nhất cho khách hàng.
          </p>
        </div>

        <div>
          <h3>Liên hệ</h3>
          <p>📞 1900 1234</p>
          <p>✉️ support@shophub.vn</p>
          <p>📍 123 Đường ABC, Quận 1, TP. HCM</p>
        </div>

        <div>
          <h3>Về ShopHub</h3>
          <p>Giới thiệu</p>
          <p>Chính sách bảo mật</p>
          <p>Điều khoản sử dụng</p>
          <p>Chính sách đổi trả</p>
        </div>

        <div>
          <h3>Hỗ trợ khách hàng</h3>
          <p>Hướng dẫn mua hàng</p>
          <p>Phương thức thanh toán</p>
          <p>Chính sách vận chuyển</p>
          <p>Câu hỏi thường gặp</p>
        </div>
      </footer>

      <div className="copyright">
        © 2026 ShopHub. All rights reserved.
      </div>
    </div>
  );
}

export default HomePage;