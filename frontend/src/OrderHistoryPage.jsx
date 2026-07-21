import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

const API_URL = api.defaults.baseURL;

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

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
          error.response?.data?.detail ||
            "Không thể tải lịch sử đơn hàng."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("vi-VN")} đ`;
  };

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

    if (!image) {
      return FALLBACK_IMAGE;
    }

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

  const getProductName = (item) => {
    return item.product_name || item.name || "Sản phẩm";
  };

  const getCategoryName = (item) => {
    return item.product_category || item.category || "Khác";
  };

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

  const getPaymentStatusStyle = (paymentStatus) => {
    const normalizedStatus = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (normalizedStatus === "PAID") {
      return styles.paymentPaid;
    }

    if (
      normalizedStatus === "FAILED" ||
      normalizedStatus === "CANCELLED" ||
      normalizedStatus === "CANCELED"
    ) {
      return styles.paymentFailed;
    }

    return styles.paymentPending;
  };

  const getOrderStatusStyle = (orderStatus) => {
    const status = String(orderStatus || "Đang xử lý").toLowerCase();

    if (status.includes("hoàn thành")) {
      return styles.statusCompleted;
    }

    if (status.includes("đã hủy")) {
      return styles.statusCancelled;
    }

    if (status.includes("đang giao")) {
      return styles.statusShipping;
    }

    return styles.statusPending;
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

          <Link style={styles.navLink} to="/products">
            Sản phẩm
          </Link>

          <Link style={styles.navLink} to="/cart">
            Giỏ hàng 🛒
          </Link>

          <Link style={styles.activeLink} to="/orders">
            Đơn hàng 🧾
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Lịch sử đơn hàng</h1>

        <p style={styles.subtitle}>
          Theo dõi các đơn hàng đã đặt trên ShopHub.
        </p>
      </section>

      {loading ? (
        <div style={styles.emptyBox}>
          <h2>Đang tải đơn hàng...</h2>
        </div>
      ) : errorMessage ? (
        <div style={styles.errorBox}>
          <h2>Không thể tải đơn hàng</h2>

          <p>{errorMessage}</p>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={fetchOrders}
              style={styles.refreshButton}
            >
              Thử lại
            </button>

            {errorMessage.includes("đăng nhập") && (
              <Link to="/login">
                <button
                  type="button"
                  style={styles.primaryButton}
                >
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>Chưa có đơn hàng nào</h2>

          <p>
            Bạn hãy mua sản phẩm và thanh toán để tạo đơn hàng.
          </p>

          <Link to="/products">
            <button
              type="button"
              style={styles.primaryButton}
            >
              Mua sắm ngay
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.actionRow}>
            <p>
              Tổng số đơn hàng: <b>{orders.length}</b>
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              style={styles.refreshButton}
            >
              Làm mới
            </button>
          </div>

          <div style={styles.orderList}>
            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <h2 style={styles.orderId}>
                      Mã đơn: DH{order.id}
                    </h2>

                    <p style={styles.orderDate}>
                      Ngày đặt: {formatDate(order)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      ...getOrderStatusStyle(order.status),
                    }}
                  >
                    {order.status || "Đang xử lý"}
                  </span>
                </div>

                <div style={styles.customerBox}>
                  <h3 style={styles.sectionTitle}>
                    Thông tin khách hàng
                  </h3>

                  <p>
                    <b>Họ tên:</b>{" "}
                    {order.shipping_name ||
                      order.customer_name ||
                      order.customer?.fullName ||
                      "Chưa có"}
                  </p>

                  <p>
                    <b>Email:</b>{" "}
                    {order.user_email || "Chưa có"}
                  </p>

                  <p>
                    <b>Số điện thoại:</b>{" "}
                    {order.shipping_phone ||
                      order.customer?.phone ||
                      "Chưa có"}
                  </p>

                  <p>
                    <b>Địa chỉ:</b>{" "}
                    {order.shipping_address ||
                      order.customer?.address ||
                      "Chưa có"}
                  </p>

                  <p>
                    <b>Thanh toán:</b>{" "}
                    {order.payment_method ||
                      order.customer?.paymentMethod ||
                      "Thanh toán khi nhận hàng"}
                  </p>

                  <p>
                    <b>Trạng thái thanh toán:</b>{" "}
                    <span
                      style={{
                        ...styles.paymentStatus,
                        ...getPaymentStatusStyle(
                          order.payment_status
                        ),
                      }}
                    >
                      {getPaymentStatusText(
                        order.payment_status
                      )}
                    </span>
                  </p>

                  {order.vnp_transaction_no && (
                    <p>
                      <b>Mã giao dịch VNPAY:</b>{" "}
                      {order.vnp_transaction_no}
                    </p>
                  )}

                  {(order.note || order.customer?.note) && (
                    <p>
                      <b>Ghi chú:</b>{" "}
                      {order.note || order.customer?.note}
                    </p>
                  )}
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>Sản phẩm</h3>

                  {Array.isArray(order.items) &&
                  order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        key={
                          item.id ||
                          `${order.id}-${item.product_id}-${index}`
                        }
                        style={styles.productRow}
                      >
                        <div style={styles.icon}>
                          <img
                            src={getOrderImage(item)}
                            alt={getProductName(item)}
                            style={styles.productImg}
                            onError={handleImageError}
                          />
                        </div>

                        <div style={styles.productContent}>
                          <h4 style={styles.productName}>
                            {getProductName(item)}
                          </h4>

                          <p style={styles.productInfo}>
                            {getCategoryName(item)} - SL:{" "}
                            {item.quantity || 0}
                          </p>

                          <p style={styles.productInfo}>
                            Đơn giá: {formatPrice(item.price)}
                          </p>
                        </div>

                        <strong>
                          {formatPrice(
                            item.subtotal ??
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                          )}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p>Không có thông tin sản phẩm.</p>
                  )}
                </div>

                <div style={styles.totalBox}>
                  <h2 style={styles.totalLabel}>
                    Tổng tiền:
                  </h2>

                  <h2 style={styles.totalPrice}>
                    {formatPrice(
                      order.total_price ?? order.total
                    )}
                  </h2>
                </div>
              </div>
            ))}
          </div>
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
    color: "#111827",
  },

  logoBox: {
    width: "42px",
    height: "42px",
    backgroundColor: "#1769ff",
    color: "#ffffff",
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
    color: "#111827",
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

  emptyBox: {
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },

  errorBox: {
    textAlign: "center",
    padding: "60px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    backgroundColor: "#fff7f7",
  },

  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  },

  primaryButton: {
    padding: "12px 22px",
    backgroundColor: "#1769ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  refreshButton: {
    padding: "11px 20px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  orderList: {
    display: "grid",
    gap: "22px",
  },

  orderCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "15px",
    marginBottom: "15px",
  },

  orderId: {
    margin: "0 0 6px",
    fontSize: "22px",
  },

  orderDate: {
    margin: 0,
    color: "#6b7280",
  },

  status: {
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  statusPending: {
    backgroundColor: "#dbeafe",
    color: "#1769ff",
  },

  statusShipping: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },

  statusCompleted: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },

  customerBox: {
    backgroundColor: "#f9fafb",
    padding: "15px 18px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  sectionTitle: {
    marginTop: 0,
  },

  paymentStatus: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "700",
  },

  paymentPaid: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  paymentPending: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },

  paymentFailed: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },

  productRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 0",
  },

  icon: {
    width: "70px",
    height: "70px",
    backgroundColor: "#f3f8ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "5px",
  },

  productContent: {
    flex: 1,
  },

  productName: {
    margin: "0 0 5px",
  },

  productInfo: {
    margin: "3px 0",
    color: "#6b7280",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },

  totalLabel: {
    margin: 0,
  },

  totalPrice: {
    margin: 0,
    color: "#1769ff",
  },
};

export default OrderHistoryPage;