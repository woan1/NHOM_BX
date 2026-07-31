import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import "./AdminOrderPage.css";

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


  return (
    <div className="admin-order-page">
      <header className="admin-order-header">
        <Link to="/" className="admin-order-logo">
          <div className="admin-order-logo-box">S</div>

          <h1 className="admin-order-logo-text">
            Shop<span className="admin-order-logo-highlight">Hub</span>
          </h1>
        </Link>

        <nav className="admin-order-nav">
          <Link to="/" className="admin-order-nav-link">
            Trang chủ
          </Link>

          <Link to="/admin/dashboard" className="admin-order-nav-link">
            Dashboard
          </Link>

          <Link to="/admin/products" className="admin-order-nav-link">
            Quản lý sản phẩm
          </Link>

          <Link to="/admin/orders" className="admin-order-nav-link active">
            Quản lý đơn hàng
          </Link>
        </nav>
      </header>

      <section className="admin-order-hero">
        <h1 className="admin-order-title">Quản lý đơn hàng</h1>

        <p className="admin-order-subtitle">
          Theo dõi thanh toán và cập nhật trạng thái giao hàng.
        </p>
      </section>

      <div className="admin-order-toolbar">
        <p>
          Tổng số đơn hàng: <b>{orders.length}</b>
        </p>

        <button
          type="button"
          className="admin-order-refresh-button"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {loading ? (
        <div className="admin-order-message">
          Đang tải đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-order-message">
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-card-header">
                <div>
                  <h2 className="admin-order-id">
                    Đơn hàng DH{order.id}
                  </h2>

                  <p className="admin-order-date">
                    Ngày đặt: {formatDate(order)}
                  </p>
                </div>

                <div className="admin-order-header-meta">
                  <span
                    className={`admin-order-status-badge ${
                      String(order.status || "Đang xử lý")
                        .toLowerCase()
                        .includes("hoàn thành")
                        ? "completed"
                        : String(order.status || "")
                            .toLowerCase()
                            .includes("đã hủy")
                        ? "cancelled"
                        : String(order.status || "")
                            .toLowerCase()
                            .includes("đang giao")
                        ? "shipping"
                        : "pending"
                    }`}
                  >
                    {order.status || "Đang xử lý"}
                  </span>

                  <strong className="admin-order-total-price">
                    {formatPrice(
                      order.total_price ?? order.total
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-order-info-grid">
                <section className="admin-order-info-panel">
                  <div className="admin-order-section-heading">
                    <span>👤</span>
                    <h3>Thông tin khách hàng</h3>
                  </div>

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
                </section>

                <section className="admin-order-info-panel">
                  <div className="admin-order-section-heading">
                    <span>💳</span>
                    <h3>Thông tin thanh toán</h3>
                  </div>

                  <p>
                    <b>Phương thức:</b>{" "}
                    {order.payment_method ||
                      order.customer?.paymentMethod ||
                      "COD"}
                  </p>

                  <p>
                    <b>Thanh toán:</b>{" "}
                    <span
                      className={`admin-order-payment-badge ${
                        String(order.payment_status || "PENDING").toUpperCase() === "PAID"
                          ? "paid"
                          : ["FAILED", "CANCELLED"].includes(
                              String(order.payment_status || "").toUpperCase()
                            )
                          ? "failed"
                          : "pending"
                      }`}
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
                </section>
              </div>

              {Array.isArray(order.items) &&
                order.items.length > 0 && (
                  <div className="admin-order-items-box">
                    <h3 className="admin-order-items-title">
                      Sản phẩm
                    </h3>

                    {order.items.map((item) => (
                      <div
                        key={
                          item.id ||
                          `${order.id}-${item.product_id}`
                        }
                        className="admin-order-item-row"
                      >
                        <div>
                          <strong>
                            {item.product_name ||
                              item.name ||
                              "Sản phẩm"}
                          </strong>

                          <p className="admin-order-item-info">
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

              <div className="admin-order-status-row">
                <label className="admin-order-status-label">
                  Trạng thái đơn hàng:
                </label>

                <select
                  className="admin-order-select"
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


export default AdminOrderPage;