import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/products");

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Lỗi lấy sản phẩm từ API:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    if (keyword.trim() === "") return;
    navigate(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    alert("Đã đăng xuất.");
    navigate("/login");
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
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

          {currentUser?.role === "admin" && (
            <Link to="/admin/products">⚙️ Admin</Link>
          )}

          {currentUser ? (
            <>
              <Link to="/login">👤 {currentUser.fullName}</Link>
              <button className="logout-btn" onClick={handleLogout}>
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
        <button className="arrow left">‹</button>

        <div className="hero-text">
          <span>Chào mừng đến với ShopHub</span>

          <h2>
            Mua sắm thông minh <br />
            cùng <b>ShopHub</b>
          </h2>

          <p>
            Đa dạng sản phẩm, giá tốt mỗi ngày và trải nghiệm mua sắm trực tuyến
            tiện lợi, an toàn.
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
            alt=""
            onError={handleImageError}
          />

          <img
            className="hero-phone"
            src="/images/iphone-15.jpg"
            alt=""
            onError={handleImageError}
          />

          <img
            className="hero-headphone"
            src="/images/sony-headphone.jpg"
            alt=""
            onError={handleImageError}
          />

          <img
            className="hero-watch"
            src="/images/xiaomi-watch.jpg"
            alt=""
            onError={handleImageError}
          />
        </div>

        <button className="arrow right">›</button>
      </section>

      <section className="search-area">
        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <button onClick={handleSearch}>Tìm kiếm</button>
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
            <p className="empty-product">Chưa có sản phẩm nào.</p>
          ) : (
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-img">
                  <img
                    src={product.image_url || product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={handleImageError}
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p>{Number(product.price).toLocaleString("vi-VN")} đ</p>

                  <Link to={`/products/${product.id}`}>Xem chi tiết</Link>
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
          CHO ĐƠN HÀNG TỪ 1.000.000đ <br />
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
              <p>Cam kết hàng chính hãng, nguồn gốc rõ ràng, bảo hành uy tín.</p>
            </div>
          </div>

          <div className="why-card">
            <span>🚚</span>
            <div>
              <h3>Giao hàng nhanh</h3>
              <p>Giao hàng toàn quốc, nhanh chóng, đúng hẹn.</p>
            </div>
          </div>

          <div className="why-card">
            <span>🎧</span>
            <div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ hỗ trợ tận tâm, sẵn sàng hỗ trợ mọi lúc.</p>
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
            ShopHub - Nền tảng mua sắm trực tuyến đáng tin cậy, mang đến trải
            nghiệm tốt nhất cho khách hàng.
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

      <div className="copyright">© 2024 ShopHub. All rights reserved.</div>
    </div>
  );
}

export default HomePage;