import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import "./OrderHistoryPage.css";

const API_URL = api.defaults.baseURL;

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x450/eaf2ff/1769ff&text=ShopHub";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/orders/my-orders");

      const orderData = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(orderData);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
      setOrders([]);

      if (error.response?.status === 401) {
        setErrorMessage(
          "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (error.response?.status === 403) {
        setErrorMessage("Bạn không có quyền xem danh sách đơn hàng.");
      } else {
        setErrorMessage(
          error.response?.data?.detail || "Không thể tải lịch sử đơn hàng."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("vi-VN")} đ`;

  const formatDate = (order) => {
    if (order.date) {
      return order.date;
    }

    if (order.created_at) {
      const date = new Date(order.created_at);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("vi-VN");
      }
    }

    return "Chưa có ngày";
  };

  const getOrderImage = (item) => {
    const image =
      item.image_url ||
      item.product_image ||
      item.image ||
      item.productImage;

    if (!image) return FALLBACK_IMAGE;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/images")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  const getProductName = (item) =>
    item.product_name || item.name || "Sản phẩm";

  const getCategoryName = (item) =>
    item.product_category || item.category || "Khác";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const getPaymentStatusText = (paymentStatus) => {
    const normalizedStatus = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (normalizedStatus === "PAID") {
      return "Đã thanh toán";
    }

    if (normalizedStatus === "FAILED") {
      return "Thanh toán thất bại";
    }

    if (
      normalizedStatus === "CANCELLED" ||
      normalizedStatus === "CANCELED"
    ) {
      return "Đã hủy thanh toán";
    }

    return "Chưa thanh toán";
  };

  const getPaymentStatusClass = (paymentStatus) => {
    const normalizedStatus = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (normalizedStatus === "PAID") {
      return "payment-paid";
    }

    if (
      normalizedStatus === "FAILED" ||
      normalizedStatus === "CANCELLED" ||
      normalizedStatus === "CANCELED"
    ) {
      return "payment-failed";
    }

    return "payment-pending";
  };

  const getOrderStatusClass = (orderStatus) => {
    const status = String(orderStatus || "Đang xử lý").toLowerCase();

    if (status.includes("hoàn thành")) {
      return "status-completed";
    }

    if (status.includes("đã hủy")) {
      return "status-cancelled";
    }

    if (status.includes("đang giao")) {
      return "status-shipping";
    }

    return "status-pending";
  };

  const getOrderTotal = (order) =>
    order.total_price ?? order.total ?? order.total_amount ?? 0;

  const getCustomerName = (order) =>
    order.shipping_name ||
    order.customer_name ||
    order.customer?.fullName ||
    order.customer?.name ||
    "Chưa có";

  const getCustomerPhone = (order) =>
    order.shipping_phone || order.customer?.phone || "Chưa có";

  const getCustomerAddress = (order) =>
    order.shipping_address || order.customer?.address || "Chưa có";

  const getPaymentMethod = (order) =>
    order.payment_method ||
    order.customer?.paymentMethod ||
    "Thanh toán khi nhận hàng";

  const totalSpent = orders.reduce(
    (total, order) => total + Number(getOrderTotal(order) || 0),
    0
  );

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="orders-container orders-header-inner">
          <Link to="/" className="orders-logo" aria-label="ShopHub">
            <div className="orders-logo-box">S</div>
            <h1>
              Shop<span>Hub</span>
            </h1>
          </Link>

          <nav className="orders-nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/products">Sản phẩm</Link>
            <Link to="/cart">Giỏ hàng</Link>
            <Link className="active" to="/orders">
              Đơn hàng
            </Link>
          </nav>
        </div>
      </header>

      <main className="orders-container orders-main">
        <section className="orders-hero">
          <div>
            <span className="orders-kicker">Tài khoản của bạn</span>
            <h2>Lịch sử đơn hàng</h2>
            <p>Theo dõi trạng thái và thông tin các đơn hàng đã đặt tại ShopHub.</p>
          </div>

          <div className="orders-hero-stats">
            <div>
              <strong>{orders.length}</strong>
              <span>Tổng đơn hàng</span>
            </div>

            <div>
              <strong>{formatPrice(totalSpent)}</strong>
              <span>Tổng giá trị</span>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="orders-state-card">
            <div className="orders-spinner" />
            <h3>Đang tải đơn hàng...</h3>
          </section>
        ) : errorMessage ? (
          <section className="orders-state-card error">
            <div className="orders-state-icon">!</div>
            <h3>Không thể tải đơn hàng</h3>
            <p>{errorMessage}</p>

            <div className="orders-state-actions">
              <button type="button" onClick={fetchOrders}>
                Thử lại
              </button>

              {errorMessage.includes("đăng nhập") && (
                <Link to="/login">Đăng nhập</Link>
              )}
            </div>
          </section>
        ) : orders.length === 0 ? (
          <section className="orders-state-card">
            <div className="orders-state-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn hãy chọn sản phẩm và tiến hành thanh toán để tạo đơn hàng.</p>
            <Link to="/products" className="orders-primary-link">
              Mua sắm ngay
            </Link>
          </section>
        ) : (
          <>
            <div className="orders-toolbar">
              <p>
                Hiển thị <strong>{orders.length}</strong> đơn hàng
              </p>

              <button type="button" onClick={fetchOrders}>
                Làm mới
              </button>
            </div>

            <section className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-card-kicker">Đơn hàng ShopHub</span>
                      <h3>Mã đơn: DH{order.id}</h3>
                      <p>Ngày đặt: {formatDate(order)}</p>
                    </div>

                    <span
                      className={`order-status ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status || "Đang xử lý"}
                    </span>
                  </div>

                  <div className="order-overview-grid">
                    <section className="order-info-panel">
                      <div className="order-section-heading">
                        <span>👤</span>
                        <h4>Thông tin khách hàng</h4>
                      </div>

                      <div className="order-info-list">
                        <div>
                          <span>Họ tên</span>
                          <strong>{getCustomerName(order)}</strong>
                        </div>

                        <div>
                          <span>Email</span>
                          <strong>{order.user_email || "Chưa có"}</strong>
                        </div>

                        <div>
                          <span>Số điện thoại</span>
                          <strong>{getCustomerPhone(order)}</strong>
                        </div>

                        <div>
                          <span>Địa chỉ</span>
                          <strong>{getCustomerAddress(order)}</strong>
                        </div>
                      </div>
                    </section>

                    <section className="order-info-panel">
                      <div className="order-section-heading">
                        <span>💳</span>
                        <h4>Thông tin thanh toán</h4>
                      </div>

                      <div className="order-info-list">
                        <div>
                          <span>Phương thức</span>
                          <strong>{getPaymentMethod(order)}</strong>
                        </div>

                        <div>
                          <span>Trạng thái</span>
                          <strong>
                            <span
                              className={`payment-status ${getPaymentStatusClass(
                                order.payment_status
                              )}`}
                            >
                              {getPaymentStatusText(order.payment_status)}
                            </span>
                          </strong>
                        </div>

                        {order.vnp_transaction_no && (
                          <div>
                            <span>Mã giao dịch VNPAY</span>
                            <strong>{order.vnp_transaction_no}</strong>
                          </div>
                        )}

                        {(order.note || order.customer?.note) && (
                          <div>
                            <span>Ghi chú</span>
                            <strong>{order.note || order.customer?.note}</strong>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <section className="order-products-section">
                    <div className="order-products-heading">
                      <div>
                        <span>Sản phẩm trong đơn</span>
                        <h4>
                          {Array.isArray(order.items) ? order.items.length : 0}{" "}
                          sản phẩm
                        </h4>
                      </div>
                    </div>

                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      <div className="order-products-list">
                        {order.items.map((item, index) => (
                          <div
                            className="order-product-row"
                            key={
                              item.id ||
                              `${order.id}-${item.product_id}-${index}`
                            }
                          >
                            <div className="order-product-image">
                              <img
                                src={getOrderImage(item)}
                                alt={getProductName(item)}
                                onError={handleImageError}
                              />
                            </div>

                            <div className="order-product-content">
                              <h5>{getProductName(item)}</h5>
                              <p>
                                {getCategoryName(item)} · Số lượng:{" "}
                                {item.quantity || 0}
                              </p>
                              <span>Đơn giá: {formatPrice(item.price)}</span>
                            </div>

                            <strong className="order-product-total">
                              {formatPrice(
                                item.subtotal ??
                                  Number(item.price || 0) *
                                    Number(item.quantity || 0)
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-order-products">
                        Không có thông tin sản phẩm.
                      </p>
                    )}
                  </section>

                  <div className="order-card-footer">
                    <div>
                      <span>Tổng thanh toán</span>
                      <strong>{formatPrice(getOrderTotal(order))}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default OrderHistoryPage;