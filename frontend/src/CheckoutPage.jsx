import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import api from "./api";
import "./CheckoutPage.css";
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
      <div className="checkout-page">
        <Header />

        <div className="checkout-empty">
          <h1>
            Không có sản phẩm để thanh toán
          </h1>

          <p>
            Giỏ hàng của bạn đang trống.
          </p>

          <Link to="/products">
            <button
              type="button"
              className="checkout-primary-button"
            >
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />

      <section className="checkout-hero">
        <h1>
          Thanh toán
        </h1>

        <p>
          Nhập thông tin giao hàng và xác nhận
          đơn hàng của bạn.
        </p>
      </section>

      <div className="checkout-layout">
        <form
          onSubmit={handleOrder}
          className="checkout-form-card"
        >
          <h2>
            Thông tin khách hàng
          </h2>

          <label>
            Họ và tên
          </label>

          <input
            className="checkout-input"
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label>
            Số điện thoại
          </label>

          <input
            className="checkout-input"
            type="text"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label>
            Địa chỉ giao hàng
          </label>

          <input
            className="checkout-input"
            type="text"
            name="address"
            placeholder="Nhập địa chỉ nhận hàng"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label>
            Ghi chú
          </label>

          <textarea
            className="checkout-textarea"
            name="note"
            placeholder="Ghi chú thêm nếu có"
            value={formData.note}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label>
            Phương thức thanh toán
          </label>

          <select
            className="checkout-input"
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
            <div className="checkout-notice paypal">
              <strong>
                PayPal Sandbox
              </strong>

              <p>
                Đây là chế độ thanh toán thử bằng
                tiền ảo. Hệ thống không trừ hoặc
                nhận tiền thật.
              </p>

              <p>
                Tổng tiền sẽ được quy đổi từ VNĐ
                sang USD theo tỷ giá demo trong
                backend.
              </p>
            </div>
          )}

          {formData.paymentMethod === "VNPAY" && (
            <div className="checkout-notice vnpay">
              <strong>
                VNPAY Sandbox
              </strong>

              <p>
                Đây là môi trường thử nghiệm,
                không phát sinh tiền thật.
              </p>
            </div>
          )}

          <button
            type="submit"
            className={`checkout-order-button ${formData.paymentMethod.toLowerCase()}`}
            disabled={isSubmitting}
          >
            {getButtonText()}
          </button>
        </form>

        <aside className="checkout-summary-card">
          <h2>
            Đơn hàng của bạn
          </h2>

          {cartItems.map((item) => (
            <div
              key={item.id || item.product_id}
              className="checkout-order-item"
            >
              <div className="checkout-product-image">
                <img
                  src={getCartImage(item)}
                  alt={item.name || "Sản phẩm"}
                  className="checkout-product-img"
                  onError={handleImageError}
                />
              </div>

              <div className="checkout-product-info">
                <h3>
                  {item.name}
                </h3>

                <p>
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

          <div className="checkout-total-box">
            <h2>
              Tổng cộng:
            </h2>

            <h2>
              {formatPrice(cartTotal)}
            </h2>
          </div>

          {formData.paymentMethod === "PAYPAL" && (
            <div className="checkout-exchange-box">
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
        </aside>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="checkout-header">
      <Link
        to="/"
        className="checkout-logo"
      >
        <div className="checkout-logo-box">
          S
        </div>

        <h1>
          Shop
          <span>
            Hub
          </span>
        </h1>
      </Link>

      <nav className="checkout-nav">
        <Link
          
          to="/"
        >
          Trang chủ
        </Link>

        <Link
          
          to="/products"
        >
          Sản phẩm
        </Link>

        <Link
          
          to="/cart"
        >
          Giỏ hàng 🛒
        </Link>

        <Link
          className="active"
          to="/checkout"
        >
          Thanh toán
        </Link>

        <Link
          
          to="/orders"
        >
          Đơn hàng 🧾
        </Link>
      </nav>
    </header>
  );
}


export default CheckoutPage;