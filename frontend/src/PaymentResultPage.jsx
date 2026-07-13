import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "./api";

function PaymentResultPage() {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const result = searchParams.get("result");
  const txnRef = searchParams.get("txn_ref");
  const responseCode = searchParams.get("response_code");
  const transactionNo = searchParams.get("transaction_no");

  const isSuccess = result === "success";

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await api.get("/orders");

        const matchedOrder = response.data.find(
          (item) => item.vnp_txn_ref === txnRef
        );

        setOrder(matchedOrder || null);
      } catch (error) {
        console.error("Không tải được thông tin đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [txnRef]);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "60px auto",
        padding: "30px",
        textAlign: "center",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          color: isSuccess ? "#16a34a" : "#dc2626",
        }}
      >
        {isSuccess
          ? "Thanh toán thành công"
          : "Thanh toán chưa thành công"}
      </h1>

      {isSuccess ? (
        <p>VNPAY đã tiếp nhận giao dịch của bạn.</p>
      ) : (
        <p>Giao dịch bị hủy, thất bại hoặc chữ ký không hợp lệ.</p>
      )}

      <div
        style={{
          marginTop: "25px",
          textAlign: "left",
          lineHeight: "1.8",
        }}
      >
        <p>
          <strong>Mã giao dịch ShopHub:</strong>{" "}
          {txnRef || "Không có"}
        </p>

        <p>
          <strong>Mã giao dịch VNPAY:</strong>{" "}
          {transactionNo || "Không có"}
        </p>

        <p>
          <strong>Mã phản hồi:</strong>{" "}
          {responseCode || "Không có"}
        </p>

        {loading && <p>Đang kiểm tra trạng thái đơn hàng...</p>}

        {!loading && order && (
          <>
            <p>
              <strong>Mã đơn hàng:</strong> #{order.id}
            </p>

            <p>
              <strong>Tổng tiền:</strong>{" "}
              {Number(order.total_price).toLocaleString("vi-VN")} VNĐ
            </p>

            <p>
              <strong>Trạng thái thanh toán:</strong>{" "}
              {order.payment_status}
            </p>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <Link
          to="/orders"
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Xem đơn hàng
        </Link>

        <Link
          to="/"
          style={{
            padding: "12px 20px",
            background: "#e5e7eb",
            color: "#111827",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default PaymentResultPage;