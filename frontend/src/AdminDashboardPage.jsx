import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch (error) {
      console.error("Không thể đọc currentUser:", error);
      return null;
    }
  }, []);

  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
    total_product_views: 0,
  });

  const [revenueType, setRevenueType] = useState("month");
  const [revenueData, setRevenueData] = useState([]);
  const [trafficType, setTrafficType] = useState("day");
  const [trafficData, setTrafficData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) =>
    `${Number(price || 0).toLocaleString("vi-VN")} đ`;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("vi-VN");

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString("vi-VN");
  };

  const getActivityObject = (activity) => {
    if (activity?.product) {
      return {
        label: `SP${activity.product.id}`,
        name: activity.product.name || "Sản phẩm",
      };
    }

    if (activity?.order_id) {
      return {
        label: `DH${activity.order_id}`,
        name: "Đơn hàng",
      };
    }

    return { label: "—", name: "Không có" };
  };

  const isAdmin = ["ADMIN", "admin"].includes(currentUser?.role);

  const getTodayPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const trafficSummary = useMemo(() => {
    const totalWebsiteVisits = trafficData.reduce(
      (total, item) => total + Number(item.website_visits || 0),
      0
    );

    const totalOrderViews = trafficData.reduce(
      (total, item) => total + Number(item.order_views || 0),
      0
    );

    const todayItem =
      trafficType === "day"
        ? trafficData.find((item) => item.period === getTodayPeriod())
        : null;

    return {
      totalWebsiteVisits,
      totalOrderViews,
      visitsToday: Number(todayItem?.website_visits || 0),
    };
  }, [trafficData, trafficType]);

  const productViewStats = useMemo(() => {
    const grouped = new Map();

    recentActivities
      .filter(
        (activity) =>
          activity.event_type === "PRODUCT_VIEW" && activity.product_id
      )
      .forEach((activity) => {
        const productId = Number(activity.product_id);
        const productName =
          activity.product?.name ||
          activity.product_name ||
          `Sản phẩm ${productId}`;

        const current = grouped.get(productId) || {
          product_id: productId,
          product_name: productName,
          view_count: 0,
          latest_view_at: null,
          viewers: new Set(),
        };

        current.view_count += 1;

        if (activity.user_id) {
          current.viewers.add(`user:${activity.user_id}`);
        } else if (activity.session_id) {
          current.viewers.add(`session:${activity.session_id}`);
        }

        const activityTime = activity.created_at || activity.date || null;

        if (
          activityTime &&
          (!current.latest_view_at ||
            new Date(activityTime) > new Date(current.latest_view_at))
        ) {
          current.latest_view_at = activityTime;
        }

        grouped.set(productId, current);
      });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        unique_viewers: item.viewers.size,
      }))
      .sort((a, b) => b.view_count - a.view_count);
  }, [recentActivities]);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      alert("Bạn không có quyền truy cập trang Admin Dashboard.");
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [revenueType, trafficType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, revenueRes, trafficRes, activityRes] =
        await Promise.all([
          api.get("/dashboard/stats"),
          api.get(`/dashboard/revenue?group_by=${revenueType}`),
          api.get(`/dashboard/traffic?group_by=${trafficType}`),
          api.get("/dashboard/recent-activity?limit=200"),
        ]);

      setStats(statsRes.data || {});
      setRevenueData(
        Array.isArray(revenueRes.data) ? revenueRes.data : []
      );
      setTrafficData(
        Array.isArray(trafficRes.data)
          ? trafficRes.data
          : Array.isArray(trafficRes.data?.traffic)
          ? trafficRes.data.traffic
          : []
      );

      const activityList = Array.isArray(activityRes.data)
        ? activityRes.data
        : Array.isArray(activityRes.data?.activities)
        ? activityRes.data.activities
        : [];

      setRecentActivities(activityList);

      try {
        const ordersRes = await api.get("/orders");

        const orderList = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : [];

        setOrders(orderList.slice(0, 5));
      } catch (ordersError) {
        console.error("Lỗi tải đơn hàng mới:", ordersError);
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi tải Dashboard:", error);

      if (error.response?.status === 401) {
        alert(
          "Bạn chưa đăng nhập hoặc token đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (error.response?.status === 403) {
        alert("Tài khoản của bạn không có quyền ADMIN.");
      } else {
        alert(
          "Không tải được Dashboard. Hãy kiểm tra backend và token Admin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Tổng sản phẩm",
      value: formatNumber(stats.total_products),
      icon: "📦",
      tone: "blue",
    },
    {
      label: "Tổng đơn hàng",
      value: formatNumber(stats.total_orders),
      icon: "🧾",
      tone: "violet",
    },
    {
      label: "Tổng người dùng",
      value: formatNumber(stats.total_users),
      icon: "👤",
      tone: "orange",
    },
    {
      label: "Tổng doanh thu",
      value: formatPrice(stats.total_revenue),
      icon: "💰",
      tone: "green",
    },
    {
      label: "Tổng lượt truy cập",
      value: formatNumber(trafficSummary.totalWebsiteVisits),
      icon: "🌐",
      tone: "cyan",
    },
    {
      label: "Truy cập hôm nay",
      value:
        trafficType === "day"
          ? formatNumber(trafficSummary.visitsToday)
          : "Chọn Ngày",
      icon: "📅",
      tone: "pink",
    },
    {
      label: "Lượt xem đơn hàng",
      value: formatNumber(trafficSummary.totalOrderViews),
      icon: "👁️",
      tone: "slate",
    },
    {
      label: "Lượt xem sản phẩm",
      value: formatNumber(stats.total_product_views),
      icon: "🛍️",
      tone: "yellow",
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div className="admin-container admin-header-inner">
          <Link to="/" className="admin-logo">
            <div className="admin-logo-box">S</div>
            <h1>
              Shop<span>Hub</span>
            </h1>
          </Link>

          <nav className="admin-nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/products">Sản phẩm</Link>
            <Link className="active" to="/admin/dashboard">
              Dashboard
            </Link>
            <Link to="/admin/products">Quản lý sản phẩm</Link>
            <Link to="/admin/orders">Quản lý đơn hàng</Link>
          </nav>
        </div>
      </header>

      <main className="admin-container admin-main">
        <section className="admin-hero">
          <div>
            <span className="admin-kicker">Trung tâm quản trị</span>
            <h2>Admin Dashboard</h2>
            <p>
              Tổng quan sản phẩm, đơn hàng, người dùng, doanh thu và lượt truy cập.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchDashboardData}
          >
            Làm mới dữ liệu
          </button>
        </section>

        {loading ? (
          <section className="admin-loading">
            <div className="admin-spinner" />
            <h3>Đang tải dữ liệu Dashboard...</h3>
          </section>
        ) : (
          <>
            <section className="admin-stats-grid">
              {statCards.map((card) => (
                <article
                  className={`admin-stat-card ${card.tone}`}
                  key={card.label}
                >
                  <span className="admin-stat-icon">{card.icon}</span>
                  <div>
                    <p>{card.label}</p>
                    <h3>{card.value}</h3>
                  </div>
                </article>
              ))}
            </section>

            <section className="admin-two-column">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <span>Hiệu quả kinh doanh</span>
                    <h3>Doanh thu</h3>
                  </div>

                  <div className="admin-tabs">
                    {["day", "month", "year"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={revenueType === type ? "active" : ""}
                        onClick={() => setRevenueType(type)}
                      >
                        {type === "day"
                          ? "Ngày"
                          : type === "month"
                          ? "Tháng"
                          : "Năm"}
                      </button>
                    ))}
                  </div>
                </div>

                {revenueData.length === 0 ? (
                  <p className="admin-muted">Chưa có dữ liệu doanh thu.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            {revenueType === "day"
                              ? "Ngày"
                              : revenueType === "year"
                              ? "Năm"
                              : "Tháng"}
                          </th>
                          <th>Doanh thu sản phẩm</th>
                          <th>Phí vận chuyển</th>
                          <th>Tổng thu</th>
                        </tr>
                      </thead>

                      <tbody>
                        {revenueData.map((item) => (
                          <tr key={item.period}>
                            <td>{item.period}</td>
                            <td>{formatPrice(item.revenue)}</td>
                            <td>{formatPrice(item.shipping_fee)}</td>
                            <td>
                              <strong>
                                {formatPrice(
                                  item.total_collected ??
                                    Number(item.revenue || 0) +
                                      Number(item.shipping_fee || 0)
                                )}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <span>Hành vi người dùng</span>
                    <h3>Thống kê truy cập</h3>
                  </div>

                  <div className="admin-tabs">
                    {["day", "month", "year"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={trafficType === type ? "active" : ""}
                        onClick={() => setTrafficType(type)}
                      >
                        {type === "day"
                          ? "Ngày"
                          : type === "month"
                          ? "Tháng"
                          : "Năm"}
                      </button>
                    ))}
                  </div>
                </div>

                {trafficData.length === 0 ? (
                  <p className="admin-muted">
                    Chưa có dữ liệu lượt truy cập.
                  </p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            {trafficType === "day"
                              ? "Ngày"
                              : trafficType === "year"
                              ? "Năm"
                              : "Tháng"}
                          </th>
                          <th>Lượt truy cập</th>
                          <th>Lượt xem đơn hàng</th>
                        </tr>
                      </thead>

                      <tbody>
                        {trafficData.map((item) => (
                          <tr key={item.period}>
                            <td>{item.period}</td>
                            <td>{formatNumber(item.website_visits)}</td>
                            <td>{formatNumber(item.order_views)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="admin-panel admin-panel-wide">
              <div className="admin-panel-header">
                <div>
                  <span>Phân tích sản phẩm</span>
                  <h3>Thống kê lượt xem từng sản phẩm</h3>
                  <p>Tổng hợp số lượt xem và số người xem của từng sản phẩm.</p>
                </div>
              </div>

              {productViewStats.length === 0 ? (
                <p className="admin-muted">Chưa có lượt xem sản phẩm nào.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã sản phẩm</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượt xem</th>
                        <th>Số người xem</th>
                        <th>Lần xem gần nhất</th>
                      </tr>
                    </thead>

                    <tbody>
                      {productViewStats.map((item) => (
                        <tr key={item.product_id}>
                          <td>
                            <strong>SP{item.product_id}</strong>
                          </td>
                          <td>{item.product_name}</td>
                          <td>{formatNumber(item.view_count)}</td>
                          <td>{formatNumber(item.unique_viewers)}</td>
                          <td>{formatDateTime(item.latest_view_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel admin-panel-wide">
              <div className="admin-panel-header">
                <div>
                  <span>Nhật ký hệ thống</span>
                  <h3>Hoạt động gần đây</h3>
                  <p>
                    Hiển thị người xem, đối tượng và đường dẫn hoạt động gần nhất.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-small-button"
                  onClick={fetchDashboardData}
                >
                  Làm mới
                </button>
              </div>

              {recentActivities.length === 0 ? (
                <p className="admin-muted">Chưa có hoạt động nào.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-table-wide">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Hoạt động</th>
                        <th>ID người xem</th>
                        <th>Tên người xem</th>
                        <th>Email</th>
                        <th>Đối tượng</th>
                        <th>Tên sản phẩm/đơn hàng</th>
                        <th>Đường dẫn</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentActivities.map((activity) => {
                        const objectInfo = getActivityObject(activity);

                        return (
                          <tr key={activity.id}>
                            <td>
                              {formatDateTime(
                                activity.created_at || activity.date
                              )}
                            </td>
                            <td>
                              <span className="admin-activity-badge">
                                {activity.activity_name ||
                                  activity.event_type ||
                                  "Hoạt động"}
                              </span>
                            </td>
                            <td>
                              <strong>{activity.user_id ?? "Khách"}</strong>
                            </td>
                            <td>
                              {activity.customer_name ||
                                "Khách chưa đăng nhập"}
                            </td>
                            <td>{activity.customer_email || "Chưa có"}</td>
                            <td>{objectInfo.label}</td>
                            <td>{objectInfo.name}</td>
                            <td>{activity.page_path || "Chưa có"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel admin-panel-wide">
              <div className="admin-panel-header">
                <div>
                  <span>Đơn hàng mới nhất</span>
                  <h3>Đơn hàng mới</h3>
                </div>

                <Link to="/admin/orders" className="admin-view-all">
                  Xem tất cả
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="admin-muted">Chưa có đơn hàng nào.</p>
              ) : (
                <div className="admin-order-list">
                  {orders.map((order) => (
                    <article className="admin-order-item" key={order.id}>
                      <div>
                        <span>DH{order.id}</span>
                        <h4>{order.shipping_name || "Chưa có khách hàng"}</h4>
                        <p>{order.status || "Đang xử lý"}</p>
                      </div>

                      <strong>
                        {formatPrice(
                          order.total_amount ||
                            order.total_price ||
                            order.total
                        )}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;