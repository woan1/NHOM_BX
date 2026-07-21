import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      const orderData = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(orderData);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);

      alert(
        error.response?.data?.detail ||
          "Không thể tải danh sách đơn hàng."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await api.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? response.data : order
        )
      );

      alert("Cập nhật trạng thái đơn hàng thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);

      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        alert("Tài khoản của bạn không có quyền ADMIN.");
      } else {
        alert(
          error.response?.data?.detail ||
            "Không thể cập nhật trạng thái đơn hàng."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

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

    return "Chưa có";
  };

  const getPaymentText = (paymentStatus) => {
    const status = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (status === "PAID") {
      return "Đã thanh toán";
    }

    if (status === "FAILED") {
      return "Thanh toán thất bại";
    }

    if (status === "CANCELLED") {
      return "Đã hủy thanh toán";
    }

    return "Chưa thanh toán";
  };

  const getPaymentStyle = (paymentStatus) => {
    const status = String(
      paymentStatus || "PENDING"
    ).toUpperCase();

    if (status === "PAID") {
      return {
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    }

    if (status === "FAILED" || status === "CANCELLED") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#b45309",
    };
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
          <Link to="/" style={styles.navLink}>
            Trang chủ
          </Link>

          <Link to="/admin/dashboard" style={styles.navLink}>
            Dashboard
          </Link>

          <Link to="/admin/products" style={styles.navLink}>
            Quản lý sản phẩm
          </Link>

          <Link to="/admin/orders" style={styles.activeLink}>
            Quản lý đơn hàng
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Quản lý đơn hàng</h1>

        <p style={styles.subtitle}>
          Theo dõi thanh toán và cập nhật trạng thái giao hàng.
        </p>
      </section>

      <div style={styles.actionRow}>
        <p>
          Tổng số đơn hàng: <b>{orders.length}</b>
        </p>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {loading ? (
        <div style={styles.messageBox}>
          Đang tải đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.messageBox}>
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h2 style={styles.orderId}>
                    Đơn hàng DH{order.id}
                  </h2>

                  <p style={styles.date}>
                    Ngày đặt: {formatDate(order)}
                  </p>
                </div>

                <strong style={styles.totalPrice}>
                  {formatPrice(
                    order.total_price ?? order.total
                  )}
                </strong>
              </div>

              <div style={styles.infoGrid}>
                <div>
                  <p>
                    <b>Khách hàng:</b>{" "}
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
                </div>

                <div>
                  <p>
                    <b>Phương thức:</b>{" "}
                    {order.payment_method ||
                      order.customer?.paymentMethod ||
                      "COD"}
                  </p>

                  <p>
                    <b>Thanh toán:</b>{" "}
                    <span
                      style={{
                        ...styles.paymentBadge,
                        ...getPaymentStyle(
                          order.payment_status
                        ),
                      }}
                    >
                      {getPaymentText(
                        order.payment_status
                      )}
                    </span>
                  </p>

                  <p>
                    <b>Mã VNPAY:</b>{" "}
                    {order.vnp_transaction_no ||
                      order.vnp_txn_ref ||
                      "Chưa có"}
                  </p>

                  {order.note && (
                    <p>
                      <b>Ghi chú:</b> {order.note}
                    </p>
                  )}
                </div>
              </div>

              {Array.isArray(order.items) &&
                order.items.length > 0 && (
                  <div style={styles.itemsBox}>
                    <h3 style={styles.itemsTitle}>
                      Sản phẩm
                    </h3>

                    {order.items.map((item) => (
                      <div
                        key={
                          item.id ||
                          `${order.id}-${item.product_id}`
                        }
                        style={styles.itemRow}
                      >
                        <div>
                          <strong>
                            {item.product_name ||
                              item.name ||
                              "Sản phẩm"}
                          </strong>

                          <p style={styles.itemInfo}>
                            Số lượng: {item.quantity || 0}
                          </p>
                        </div>

                        <span>
                          {formatPrice(
                            item.subtotal ??
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              <div style={styles.statusRow}>
                <label style={styles.statusLabel}>
                  Trạng thái đơn hàng:
                </label>

                <select
                  style={styles.select}
                  value={order.status || "Đang xử lý"}
                  disabled={updatingId === order.id}
                  onChange={(event) =>
                    updateOrderStatus(
                      order.id,
                      event.target.value
                    )
                  }
                >
                  <option value="Đang xử lý">
                    Đang xử lý
                  </option>

                  <option value="Đang giao">
                    Đang giao
                  </option>

                  <option value="Hoàn thành">
                    Hoàn thành
                  </option>

                  <option value="Đã hủy">
                    Đã hủy
                  </option>
                </select>

                {updatingId === order.id && (
                  <span>Đang cập nhật...</span>
                )}
              </div>
            </div>
          ))}
        </div>
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
  },

  nav: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
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

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  refreshButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  messageBox: {
    padding: "50px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },

  orderList: {
    display: "grid",
    gap: "20px",
  },

  orderCard: {
    padding: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "15px",
  },

  orderId: {
    margin: "0 0 6px",
  },

  date: {
    margin: 0,
    color: "#6b7280",
  },

  totalPrice: {
    color: "#1769ff",
    fontSize: "20px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    backgroundColor: "#f9fafb",
    padding: "15px 18px",
    marginTop: "15px",
    borderRadius: "10px",
  },

  paymentBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "14px",
  },

  itemsBox: {
    marginTop: "18px",
    padding: "16px 18px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  itemsTitle: {
    margin: "0 0 10px",
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  itemInfo: {
    margin: "5px 0 0",
    color: "#6b7280",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },

  statusLabel: {
    fontWeight: "700",
  },

  select: {
    minWidth: "180px",
    height: "42px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0 12px",
  },
};

export default AdminOrderPage;