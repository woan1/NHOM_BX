import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import "./CartPage.css";

const API_URL = "http://127.0.0.1:8000";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x450/eaf2ff/1769ff&text=ShopHub";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();

  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("vi-VN")} đ`;

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
    if (image.startsWith("/uploads")) return `${API_URL}${image}`;
    if (image.startsWith("uploads")) return `${API_URL}/${image}`;
    if (image.startsWith("/images")) return image;

    return image;
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="cart-container cart-header-inner">
          <Link to="/" className="cart-logo" aria-label="ShopHub">
            <div className="cart-logo-box">S</div>
            <h1>
              Shop<span>Hub</span>
            </h1>
          </Link>

          <nav className="cart-nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/products">Sản phẩm</Link>
            <Link className="active" to="/cart">
              Giỏ hàng <span>({totalQuantity})</span>
            </Link>
            <Link to="/orders">Đơn hàng</Link>
          </nav>
        </div>
      </header>

      <main className="cart-container cart-main">
        <section className="cart-hero">
          <div>
            <span className="cart-kicker">Giỏ hàng ShopHub</span>
            <h2>Giỏ hàng của bạn</h2>
            <p>
              Kiểm tra sản phẩm, thay đổi số lượng và tiến hành thanh toán an toàn.
            </p>
          </div>

          <div className="cart-hero-stat">
            <strong>{totalQuantity}</strong>
            <span>Sản phẩm trong giỏ</span>
          </div>
        </section>

        {cartItems.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá các sản phẩm công nghệ nổi bật tại ShopHub.</p>
            <Link to="/products" className="cart-primary-link">
              Tiếp tục mua sắm
            </Link>
          </section>
        ) : (
          <section className="cart-layout">
            <div className="cart-items-panel">
              <div className="cart-items-heading">
                <div>
                  <span>Sản phẩm đã chọn</span>
                  <h3>{cartItems.length} mặt hàng</h3>
                </div>

                <button
                  type="button"
                  className="clear-cart-button"
                  onClick={clearCart}
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const itemTotal =
                    Number(item.price || 0) * Number(item.quantity || 0);
                  const maxStock = Number(item.stock || 0);

                  return (
                    <article className="cart-item-card" key={item.id}>
                      <Link
                        to={`/products/${item.id}`}
                        className="cart-item-image"
                      >
                        <img
                          src={getCartImage(item)}
                          alt={item.name}
                          onError={handleImageError}
                        />
                      </Link>

                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {getCategoryName(item)}
                        </span>

                        <Link
                          to={`/products/${item.id}`}
                          className="cart-item-name"
                        >
                          {item.name}
                        </Link>

                        <p className="cart-unit-price">
                          Đơn giá: <strong>{formatPrice(item.price)}</strong>
                        </p>

                        {maxStock > 0 && (
                          <small className="cart-stock">
                            Còn {maxStock} sản phẩm
                          </small>
                        )}
                      </div>

                      <div className="cart-item-controls">
                        <span className="control-label">Số lượng</span>

                        <div className="quantity-control">
                          <button
                            type="button"
                            aria-label={`Giảm số lượng ${item.name}`}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            aria-label={`Tăng số lượng ${item.name}`}
                            disabled={
                              maxStock > 0 &&
                              Number(item.quantity || 0) >= maxStock
                            }
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <span>Thành tiền</span>
                        <strong>{formatPrice(itemTotal)}</strong>
                      </div>

                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                      >
                        Xóa
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="cart-summary-card">
              <span className="summary-kicker">Tóm tắt đơn hàng</span>
              <h3>Thông tin thanh toán</h3>

              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <strong className="free-shipping">Miễn phí</strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <p className="summary-note">
                Giá đã bao gồm thuế. Phí vận chuyển sẽ được xác nhận tại bước
                thanh toán.
              </p>

              <Link to="/checkout" className="checkout-button">
                Tiến hành thanh toán
                <span>→</span>
              </Link>

              <Link to="/products" className="continue-shopping-link">
                ← Tiếp tục mua sắm
              </Link>

              <div className="cart-trust-box">
                <div>
                  <span>🔒</span>
                  <p>
                    <strong>Thanh toán an toàn</strong>
                    <small>Thông tin được bảo mật</small>
                  </p>
                </div>

                <div>
                  <span>↻</span>
                  <p>
                    <strong>Đổi trả dễ dàng</strong>
                    <small>Hỗ trợ trong 7 ngày</small>
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default CartPage;