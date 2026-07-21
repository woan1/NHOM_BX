import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const url = currentUser?.email
        ? `${API_URL}/orders?user_email=${currentUser.email}`
        : `${API_URL}/orders`;

      const res = await api.get(
  currentUser?.email
    ? `/orders?user_email=${currentUser.email}`
    : "/orders"
);
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  const formatDate = (order) => {
    if (order.date) return order.date;

    if (order.created_at) {
      return new Date(order.created_at).toLocaleString("vi-VN");
    }

    return "Chưa có ngày";
  };

  const getOrderImage = (item) => {
    const image =
      item.image_url || item.product_image || item.image || item.productImage;

    if (!image) return FALLBACK_IMAGE;

    if (image.startsWith("http")) return image;

    if (image.startsWith("/uploads")) {
      return `${API_URL}${image}`;
    }

    if (image.startsWith("uploads")) {
      return `${API_URL}/${image}`;
    }

    if (image.startsWith("/images")) {
      return image;
    }

    return image;
  };

  const getProductName = (item) => {
    return item.product_name || item.name || "Sản phẩm";
  };

  const getCategoryName = (item) => {
    return item.product_category || item.category || "Khác";
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
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

    return "Chưa thanh toán";
  };

  const getPaymentStatusStyle = (paymentStatus) => {
    const normalizedStatus = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (normalizedStatus === "PAID") {
      return styles.paymentPaid;
    }

    if (normalizedStatus === "FAILED") {
      return styles.paymentFailed;
    }

    return styles.paymentPending;
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
      ) : orders.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn hãy mua sản phẩm và thanh toán để tạo đơn hàng.</p>

          <Link to="/products">
            <button style={styles.primaryButton}>Mua sắm ngay</button>
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.actionRow}>
            <p>
              Tổng số đơn hàng: <b>{orders.length}</b>
            </p>

            <button onClick={fetchOrders} style={styles.refreshButton}>
              Làm mới
            </button>
          </div>

          <div style={styles.orderList}>
            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <h2 style={styles.orderId}>Mã đơn: DH{order.id}</h2>
                    <p style={styles.orderDate}>
                      Ngày đặt: {formatDate(order)}
                    </p>
                  </div>

                  <span style={styles.status}>
                    {order.status || "Đang xử lý"}
                  </span>
                </div>

                <div style={styles.customerBox}>
                  <h3>Thông tin khách hàng</h3>

                  <p>
                    <b>Họ tên:</b>{" "}
                    {order.shipping_name ||
                      order.customer?.fullName ||
                      "Chưa có"}
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
                        ...getPaymentStatusStyle(order.payment_status),
                      }}
                    >
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                  </p>

                  {(order.note || order.customer?.note) && (
                    <p>
                      <b>Ghi chú:</b> {order.note || order.customer?.note}
                    </p>
                  )}
                </div>

                <div>
                  <h3>Sản phẩm</h3>

                  {order.items?.map((item) => (
                    <div key={item.id} style={styles.productRow}>
                      <div style={styles.icon}>
                        <img
                          src={getOrderImage(item)}
                          alt={getProductName(item)}
                          style={styles.productImg}
                          onError={handleImageError}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={styles.productName}>
                          {getProductName(item)}
                        </h4>

                        <p style={styles.productInfo}>
                          {getCategoryName(item)} - SL: {item.quantity}
                        </p>
                      </div>

                      <strong>
                        {formatPrice(
                          item.subtotal ||
                            Number(item.price) * Number(item.quantity)
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={styles.totalBox}>
                  <h2>Tổng tiền:</h2>
                  <h2 style={{ color: "#1769ff" }}>
                    {formatPrice(order.total_price || order.total)}
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

  emptyBox: {
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

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  refreshButton: {
    padding: "11px 20px",
    backgroundColor: "#111827",
    color: "white",
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
    backgroundColor: "#dbeafe",
    color: "#1769ff",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "800",
  },

  customerBox: {
    backgroundColor: "#f9fafb",
    padding: "15px 18px",
    borderRadius: "10px",
    marginBottom: "15px",
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
    width: "60px",
    height: "60px",
    backgroundColor: "#f3f8ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "5px",
  },

  productName: {
    margin: "0 0 5px",
  },

  productInfo: {
    margin: 0,
    color: "#6b7280",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
};

export default OrderHistoryPage;