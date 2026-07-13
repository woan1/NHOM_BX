import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import { useCart } from "./CartContext";

const API_URL = "http://127.0.0.1:8000";

function PayPalReturnPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const hasCaptured = useRef(false);

  const [paymentState, setPaymentState] = useState({
    status: "processing",
    message: "Đang xác nhận thanh toán PayPal Sandbox...",
    orderId: null,
    captureId: null,
  });

  const paypalOrderId = searchParams.get("token");
  const shopOrderId = searchParams.get("shop_order_id");

  useEffect(() => {
    const capturePayment = async () => {
      // Ngăn React StrictMode gọi API capture hai lần
      if (hasCaptured.current) {
        return;
      }

      hasCaptured.current = true;

      if (!paypalOrderId) {
        setPaymentState({
          status: "error",
          message:
            "Không tìm thấy mã giao dịch PayPal trong đường dẫn trả về.",
          orderId: shopOrderId,
          captureId: null,
        });

        return;
      }

      if (!shopOrderId || Number.isNaN(Number(shopOrderId))) {
        setPaymentState({
          status: "error",
          message:
            "Không tìm thấy mã đơn hàng ShopHub trong đường dẫn trả về.",
          orderId: null,
          captureId: null,
        });

        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/payments/paypal/capture`,
          {
            order_id: Number(shopOrderId),
            paypal_order_id: paypalOrderId,
          }
        );

        const result = response.data;

        clearCart();

        setPaymentState({
          status: "success",
          message:
            result.message ||
            "Thanh toán PayPal Sandbox thành công.",
          orderId: result.shop_order_id || shopOrderId,
          captureId: result.paypal_capture_id || null,
        });
      } catch (error) {
        console.error(
          "Lỗi xác nhận thanh toán PayPal:",
          error
        );

        let errorMessage =
          "Không thể xác nhận thanh toán PayPal Sandbox.";

        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setPaymentState({
          status: "error",
          message: errorMessage,
          orderId: shopOrderId,
          captureId: null,
        });
      }
    };

    capturePayment();
  }, [
    paypalOrderId,
    shopOrderId,
    clearCart,
  ]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoBox}>S</div>

          <h1 style={styles.logoText}>
            Shop
            <span style={styles.logoHighlight}>
              Hub
            </span>
          </h1>
        </Link>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {paymentState.status === "processing" && (
            <>
              <div style={styles.loadingCircle}>
                <div style={styles.spinner}></div>
              </div>

              <h1 style={styles.title}>
                Đang xử lý thanh toán
              </h1>

              <p style={styles.description}>
                Vui lòng chờ trong giây lát. ShopHub đang
                xác nhận giao dịch với PayPal Sandbox.
              </p>

              <div style={styles.warningBox}>
                Không đóng trang hoặc tải lại trang trong
                lúc hệ thống đang xử lý.
              </div>
            </>
          )}

          {paymentState.status === "success" && (
            <>
              <div style={styles.successIcon}>
                ✓
              </div>

              <h1 style={styles.successTitle}>
                Thanh toán thành công!
              </h1>

              <p style={styles.description}>
                {paymentState.message}
              </p>

              <div style={styles.infoBox}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    Đơn hàng ShopHub:
                  </span>

                  <strong>
                    #{paymentState.orderId}
                  </strong>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    Phương thức:
                  </span>

                  <strong>
                    PayPal Sandbox
                  </strong>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    Trạng thái:
                  </span>

                  <strong style={styles.paidText}>
                    PAID
                  </strong>
                </div>

                {paymentState.captureId && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      Mã PayPal:
                    </span>

                    <strong style={styles.captureId}>
                      {paymentState.captureId}
                    </strong>
                  </div>
                )}
              </div>

              <div style={styles.buttonGroup}>
                <Link
                  to="/orders"
                  style={styles.linkButton}
                >
                  <button style={styles.primaryButton}>
                    Xem đơn hàng
                  </button>
                </Link>

                <Link
                  to="/products"
                  style={styles.linkButton}
                >
                  <button style={styles.secondaryButton}>
                    Tiếp tục mua sắm
                  </button>
                </Link>
              </div>

              <p style={styles.sandboxNote}>
                Đây là giao dịch PayPal Sandbox dùng tiền
                thử, không phát sinh tiền thật.
              </p>
            </>
          )}

          {paymentState.status === "error" && (
            <>
              <div style={styles.errorIcon}>
                !
              </div>

              <h1 style={styles.errorTitle}>
                Thanh toán chưa hoàn tất
              </h1>

              <p style={styles.description}>
                {paymentState.message}
              </p>

              {paymentState.orderId && (
                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      Mã đơn hàng:
                    </span>

                    <strong>
                      #{paymentState.orderId}
                    </strong>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>
                      Trạng thái:
                    </span>

                    <strong style={styles.failedText}>
                      Chưa thanh toán
                    </strong>
                  </div>
                </div>
              )}

              <div style={styles.buttonGroup}>
                <Link
                  to="/checkout"
                  style={styles.linkButton}
                >
                  <button style={styles.primaryButton}>
                    Quay lại thanh toán
                  </button>
                </Link>

                <Link
                  to="/orders"
                  style={styles.linkButton}
                >
                  <button style={styles.secondaryButton}>
                    Xem đơn hàng
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "0 115px 40px",
    background:
      "linear-gradient(135deg, #eef6ff, #ffffff)",
    color: "#111827",
  },

  header: {
    height: "78px",
    display: "flex",
    alignItems: "center",
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

  main: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "620px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "45px",
    textAlign: "center",
    boxShadow:
      "0 18px 50px rgba(15, 23, 42, 0.10)",
  },

  loadingCircle: {
    width: "86px",
    height: "86px",
    margin: "0 auto 22px",
    borderRadius: "50%",
    backgroundColor: "#eef6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "38px",
    height: "38px",
    border: "5px solid #dbeafe",
    borderTop: "5px solid #1769ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  successIcon: {
    width: "86px",
    height: "86px",
    margin: "0 auto 22px",
    borderRadius: "50%",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    fontSize: "48px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: "86px",
    height: "86px",
    margin: "0 auto 22px",
    borderRadius: "50%",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    fontSize: "48px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: "0 0 12px",
    fontSize: "30px",
  },

  successTitle: {
    margin: "0 0 12px",
    color: "#16a34a",
    fontSize: "30px",
  },

  errorTitle: {
    margin: "0 0 12px",
    color: "#dc2626",
    fontSize: "30px",
  },

  description: {
    margin: "0 auto 24px",
    maxWidth: "500px",
    color: "#6b7280",
    fontSize: "16px",
    lineHeight: "1.7",
  },

  warningBox: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    fontWeight: "600",
  },

  infoBox: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    textAlign: "left",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "9px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  infoLabel: {
    color: "#6b7280",
  },

  paidText: {
    color: "#16a34a",
  },

  failedText: {
    color: "#dc2626",
  },

  captureId: {
    maxWidth: "300px",
    overflowWrap: "anywhere",
    textAlign: "right",
  },

  buttonGroup: {
    marginTop: "28px",
    display: "flex",
    gap: "12px",
  },

  linkButton: {
    flex: 1,
    textDecoration: "none",
  },

  primaryButton: {
    width: "100%",
    minHeight: "48px",
    padding: "0 18px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#1769ff",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  secondaryButton: {
    width: "100%",
    minHeight: "48px",
    padding: "0 18px",
    border: "1px solid #1769ff",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#1769ff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  sandboxNote: {
    marginTop: "22px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "13px",
  },
};

export default PayPalReturnPage;