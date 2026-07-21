import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import api from "./api";
import { useCart } from "./CartContext";

const FALLBACK_IMAGE =
  "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";

function CheckoutPage() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const paypalCancelHandled = useRef(false);

  let currentUser = null;

  try {
    const savedUser = localStorage.getItem("currentUser");
    currentUser = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error("Lỗi đọc currentUser:", error);
    localStorage.removeItem("currentUser");
    currentUser = null;
  }

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName:
      currentUser?.fullName ||
      currentUser?.name ||
      "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  /*
   * Khi khách hủy thanh toán PayPal,
   * PayPal đưa người dùng trở lại:
   *
   * /checkout?paypal=cancel&shop_order_id=...
   */
  useEffect(() => {
    const handlePayPalCancel = async () => {
      if (paypalCancelHandled.current) {
        return;
      }

      const searchParams = new URLSearchParams(
        window.location.search
      );

      const paypalStatus =
        searchParams.get("paypal");

      const shopOrderId =
        searchParams.get("shop_order_id");

      if (paypalStatus !== "cancel") {
        return;
      }

      paypalCancelHandled.current = true;

      try {
        if (
          shopOrderId &&
          !Number.isNaN(Number(shopOrderId))
        ) {
          await api.post(
            "/payments/paypal/cancel",
            {
              order_id: Number(shopOrderId),
            }
          );
        }

        alert(
          "Bạn đã hủy thanh toán PayPal Sandbox. " +
            "Đơn hàng chưa được thanh toán."
        );
      } catch (error) {
        console.error(
          "Lỗi xử lý hủy PayPal:",
          error.response?.data || error.message
        );

        alert(
          "Đã quay lại từ PayPal nhưng hệ thống " +
            "không thể cập nhật trạng thái đơn hàng."
        );
      } finally {
        navigate("/checkout", {
          replace: true,
        });
      }
    };

    handlePayPalCancel();
  }, [navigate]);

  const formatPrice = (price) => {
    return (
      Number(price || 0).toLocaleString("vi-VN") +
      " đ"
    );
  };

  const getCartImage = (item) => {
    const image =
      item?.image_url ||
      item?.image;

    if (!image) {
      return FALLBACK_IMAGE;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return `${api.defaults.baseURL}${image}`;
    }

    if (image.startsWith("uploads")) {
      return `${api.defaults.baseURL}/${image}`;
    }

    if (image.startsWith("/images")) {
      return image;
    }

    return image;
  };

  const getCategoryName = (item) => {
    if (
      typeof item?.category === "object" &&
      item?.category !== null
    ) {
      return item.category.name || "Khác";
    }

    return (
      item?.category ||
      item?.category_name ||
      "Khác"
    );
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const getBackendPaymentMethod = () => {
    if (formData.paymentMethod === "VNPAY") {
      return "VNPAY";
    }

    if (formData.paymentMethod === "PAYPAL") {
      return "PAYPAL";
    }

    return "Thanh toán khi nhận hàng";
  };

  const getButtonText = () => {
    if (isSubmitting) {
      if (formData.paymentMethod === "VNPAY") {
        return "Đang chuyển đến VNPAY...";
      }

      if (formData.paymentMethod === "PAYPAL") {
        return "Đang chuyển đến PayPal...";
      }

      return "Đang tạo đơn hàng...";
    }

    if (formData.paymentMethod === "VNPAY") {
      return "Thanh toán qua VNPAY";
    }

    if (formData.paymentMethod === "PAYPAL") {
      return "Thanh toán qua PayPal Sandbox";
    }

    return "Xác nhận đặt hàng";
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Vui lòng nhập họ và tên.");
      return false;
    }

    if (!formData.phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return false;
    }

    if (!formData.address.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng.");
      return false;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống.");
      return false;
    }

    return true;
  };

  const handleOrder = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        user_id:
          currentUser?.id ||
          null,

        user_email:
          currentUser?.email ||
          "",

        shipping_name:
          formData.fullName.trim(),

        shipping_phone:
          formData.phone.trim(),

        shipping_address:
          formData.address.trim(),

        payment_method:
          getBackendPaymentMethod(),

        note:
          formData.note.trim(),

        total_price:
          Number(cartTotal),

        items: cartItems.map((item) => ({
          product_id:
            item.id ||
            item.product_id ||
            null,

          quantity:
            Number(item.quantity || 1),

          product_name:
            item.name ||
            "",

          product_image:
            item.image_url ||
            item.image ||
            "",

          product_category:
            getCategoryName(item),

          price:
            Number(item.price || 0),
        })),
      };

      /*
       * Bước 1: Tạo đơn hàng.
       */
      const orderResponse = await api.post(
        "/orders",
        orderData
      );

      const newOrder = orderResponse.data;

      if (!newOrder?.id) {
        throw new Error(
          "Backend không trả về mã đơn hàng."
        );
      }

      /*
       * Bước 2A: Thanh toán VNPAY.
       */
      if (formData.paymentMethod === "VNPAY") {
        const paymentResponse = await api.post(
          "/payments/vnpay/create",
          {
            order_id: newOrder.id,
            locale: "vn",
          }
        );

        const paymentUrl =
          paymentResponse.data?.payment_url;

        if (!paymentUrl) {
          throw new Error(
            "Backend không trả về đường dẫn thanh toán VNPAY."
          );
        }

        clearCart();

        window.location.href = paymentUrl;
        return;
      }

      /*
       * Bước 2B: Thanh toán PayPal Sandbox.
       */
      if (formData.paymentMethod === "PAYPAL") {
        const paypalResponse = await api.post(
          "/payments/paypal/create",
          {
            order_id: newOrder.id,
          }
        );

        const paypalPaymentUrl =
          paypalResponse.data?.payment_url;

        if (!paypalPaymentUrl) {
          throw new Error(
            "Backend không trả về đường dẫn thanh toán PayPal."
          );
        }

        /*
         * Không xóa giỏ hàng ở đây.
         * Chỉ xóa sau khi PayPal thanh toán thành công.
         */
        window.location.href = paypalPaymentUrl;
        return;
      }

      /*
       * Bước 2C: Thanh toán khi nhận hàng.
       */
      clearCart();

      alert(
        "Đặt hàng thành công! " +
          "Bạn sẽ thanh toán khi nhận hàng."
      );

      navigate("/orders");
    } catch (error) {
      console.error(
        "Lỗi đặt hàng hoặc thanh toán:",
        error.response?.data || error.message
      );

      const detail =
        error.response?.data?.detail;

      if (typeof detail === "string") {
        alert(`Thao tác thất bại: ${detail}`);
      } else if (Array.isArray(detail)) {
        const validationMessages = detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join("\n");

        alert(
          validationMessages ||
            "Dữ liệu gửi lên không hợp lệ."
        );
      } else if (error.code === "ECONNABORTED") {
        alert(
          "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
        );
      } else if (error.message === "Network Error") {
        alert(
          "Không thể kết nối đến backend Railway. " +
            "Vui lòng kiểm tra backend đang hoạt động."
        );
      } else if (error.message) {
        alert(
          `Thao tác thất bại: ${error.message}`
        );
      } else {
        alert(
          "Thao tác thất bại. " +
            "Hãy kiểm tra backend và dữ liệu đơn hàng."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.page}>
        <Header />

        <div style={styles.emptyBox}>
          <h1>
            Không có sản phẩm để thanh toán
          </h1>

          <p>
            Giỏ hàng của bạn đang trống.
          </p>

          <Link to="/products">
            <button
              type="button"
              style={styles.primaryButton}
            >
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header />

      <section style={styles.titleBox}>
        <h1 style={styles.title}>
          Thanh toán
        </h1>

        <p style={styles.subtitle}>
          Nhập thông tin giao hàng và xác nhận
          đơn hàng của bạn.
        </p>
      </section>

      <div style={styles.checkoutGrid}>
        <form
          onSubmit={handleOrder}
          style={styles.formBox}
        >
          <h2>
            Thông tin khách hàng
          </h2>

          <label style={styles.label}>
            Họ và tên
          </label>

          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Số điện thoại
          </label>

          <input
            style={styles.input}
            type="text"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Địa chỉ giao hàng
          </label>

          <input
            style={styles.input}
            type="text"
            name="address"
            placeholder="Nhập địa chỉ nhận hàng"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Ghi chú
          </label>

          <textarea
            style={styles.textarea}
            name="note"
            placeholder="Ghi chú thêm nếu có"
            value={formData.note}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Phương thức thanh toán
          </label>

          <select
            style={styles.input}
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="COD">
              Thanh toán khi nhận hàng
            </option>

            <option value="VNPAY">
              Thanh toán qua VNPAY Sandbox
            </option>

            <option value="PAYPAL">
              PayPal Sandbox – Thanh toán quốc tế
            </option>
          </select>

          {formData.paymentMethod === "PAYPAL" && (
            <div style={styles.paypalNotice}>
              <strong>
                PayPal Sandbox
              </strong>

              <p style={styles.noticeText}>
                Đây là chế độ thanh toán thử bằng
                tiền ảo. Hệ thống không trừ hoặc
                nhận tiền thật.
              </p>

              <p style={styles.noticeText}>
                Tổng tiền sẽ được quy đổi từ VNĐ
                sang USD theo tỷ giá demo trong
                backend.
              </p>
            </div>
          )}

          {formData.paymentMethod === "VNPAY" && (
            <div style={styles.vnpayNotice}>
              <strong>
                VNPAY Sandbox
              </strong>

              <p style={styles.noticeText}>
                Đây là môi trường thử nghiệm,
                không phát sinh tiền thật.
              </p>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.orderButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting
                ? "not-allowed"
                : "pointer",
              backgroundColor:
                formData.paymentMethod === "PAYPAL"
                  ? "#0070ba"
                  : "#1769ff",
            }}
            disabled={isSubmitting}
          >
            {getButtonText()}
          </button>
        </form>

        <div style={styles.summaryBox}>
          <h2>
            Đơn hàng của bạn
          </h2>

          {cartItems.map((item) => (
            <div
              key={item.id || item.product_id}
              style={styles.orderItem}
            >
              <div style={styles.icon}>
                <img
                  src={getCartImage(item)}
                  alt={item.name || "Sản phẩm"}
                  style={styles.productImg}
                  onError={handleImageError}
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={styles.productName}>
                  {item.name}
                </h3>

                <p style={styles.productInfo}>
                  Số lượng: {item.quantity}
                  {" x "}
                  {formatPrice(item.price)}
                </p>
              </div>

              <strong>
                {formatPrice(
                  Number(item.price || 0) *
                    Number(item.quantity || 1)
                )}
              </strong>
            </div>
          ))}

          <div style={styles.totalBox}>
            <h2>
              Tổng cộng:
            </h2>

            <h2 style={styles.totalPrice}>
              {formatPrice(cartTotal)}
            </h2>
          </div>

          {formData.paymentMethod === "PAYPAL" && (
            <div style={styles.exchangeBox}>
              <span>
                Số tiền PayPal dự kiến:
              </span>

              <strong>
                ~ $
                {(
                  Number(cartTotal || 0) /
                  25000
                ).toFixed(2)} USD
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header}>
      <Link
        to="/"
        style={styles.logo}
      >
        <div style={styles.logoBox}>
          S
        </div>

        <h1 style={styles.logoText}>
          Shop
          <span style={styles.logoHighlight}>
            Hub
          </span>
        </h1>
      </Link>

      <nav style={styles.nav}>
        <Link
          style={styles.navLink}
          to="/"
        >
          Trang chủ
        </Link>

        <Link
          style={styles.navLink}
          to="/products"
        >
          Sản phẩm
        </Link>

        <Link
          style={styles.navLink}
          to="/cart"
        >
          Giỏ hàng 🛒
        </Link>

        <Link
          style={styles.activeLink}
          to="/checkout"
        >
          Thanh toán
        </Link>

        <Link
          style={styles.navLink}
          to="/orders"
        >
          Đơn hàng 🧾
        </Link>
      </nav>
    </header>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "0 115px 40px",
    backgroundColor: "#ffffff",
    color: "#111827",
    boxSizing: "border-box",
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

  logoHighlight: {
    color: "#1769ff",
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

  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  formBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.04)",
  },

  label: {
    display: "block",
    marginTop: "15px",
    marginBottom: "6px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    height: "46px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 14px",
    fontSize: "15px",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    height: "90px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    resize: "none",
    boxSizing: "border-box",
  },

  paypalNotice: {
    marginTop: "15px",
    padding: "14px",
    borderRadius: "9px",
    border: "1px solid #bfdbfe",
    backgroundColor: "#eff6ff",
    color: "#075985",
  },

  vnpayNotice: {
    marginTop: "15px",
    padding: "14px",
    borderRadius: "9px",
    border: "1px solid #fecaca",
    backgroundColor: "#fff1f2",
    color: "#be123c",
  },

  noticeText: {
    margin: "7px 0 0",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  orderButton: {
    marginTop: "20px",
    width: "100%",
    minHeight: "48px",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "15px",
  },

  summaryBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.04)",
  },

  orderItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #e5e7eb",
    padding: "15px 0",
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
    padding: "6px",
    boxSizing: "border-box",
  },

  productName: {
    margin: "0 0 6px",
    fontSize: "16px",
  },

  productInfo: {
    margin: 0,
    color: "#6b7280",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "25px",
  },

  totalPrice: {
    color: "#1769ff",
  },

  exchangeBox: {
    marginTop: "12px",
    padding: "14px",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#475569",
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

  emptyBox: {
    marginTop: "80px",
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },
};

export default CheckoutPage;