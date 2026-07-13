import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Optional
from urllib.parse import urlencode

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .db import get_db
from .orm_models import Order


# =========================================================
# ĐỌC CẤU HÌNH TỪ FILE backend/.env
# =========================================================
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")


# =========================================================
# ROUTER VNPAY
# =========================================================
router = APIRouter(
    prefix="/payments/vnpay",
    tags=["VNPAY Payment"],
)


# =========================================================
# CẤU HÌNH VNPAY
# =========================================================
VNP_TMN_CODE = os.getenv("VNP_TMN_CODE", "")
VNP_HASH_SECRET = os.getenv("VNP_HASH_SECRET", "")

VNP_URL = os.getenv(
    "VNP_URL",
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
)

VNP_RETURN_URL = os.getenv("VNP_RETURN_URL", "")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)


# Múi giờ Việt Nam
VN_TIMEZONE = timezone(timedelta(hours=7))


# =========================================================
# SCHEMA TẠO THANH TOÁN
# =========================================================
class VnpayPaymentCreate(BaseModel):
    order_id: int
    bank_code: Optional[str] = None
    locale: str = "vn"


# =========================================================
# KIỂM TRA CẤU HÌNH
# =========================================================
def check_vnpay_config() -> None:
    missing = []

    if not VNP_TMN_CODE:
        missing.append("VNP_TMN_CODE")

    if not VNP_HASH_SECRET:
        missing.append("VNP_HASH_SECRET")

    if not VNP_URL:
        missing.append("VNP_URL")

    if not VNP_RETURN_URL:
        missing.append("VNP_RETURN_URL")

    if missing:
        raise HTTPException(
            status_code=500,
            detail=(
                "Thiếu cấu hình VNPAY trong file .env: "
                + ", ".join(missing)
            ),
        )


# =========================================================
# XỬ LÝ THAM SỐ VNPAY
# =========================================================
def clean_params(params: Dict[str, str]) -> Dict[str, str]:
    """
    Loại bỏ tham số rỗng và tham số chữ ký.
    """

    return {
        key: str(value)
        for key, value in params.items()
        if value not in (None, "")
        and key not in (
            "vnp_SecureHash",
            "vnp_SecureHashType",
        )
    }


def create_query_string(params: Dict[str, str]) -> str:
    """
    Sắp xếp tham số theo tên và tạo query string.
    """

    cleaned_params = clean_params(params)
    sorted_params = sorted(cleaned_params.items())

    return urlencode(sorted_params)


def create_secure_hash(params: Dict[str, str]) -> str:
    """
    Tạo chữ ký HMAC-SHA512 gửi sang VNPAY.
    """

    query_string = create_query_string(params)

    return hmac.new(
        VNP_HASH_SECRET.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()


def verify_vnpay_signature(params: Dict[str, str]) -> bool:
    """
    Kiểm tra chữ ký VNPAY gửi về.
    """

    received_hash = params.get("vnp_SecureHash", "")

    if not received_hash:
        return False

    expected_hash = create_secure_hash(params)

    return hmac.compare_digest(
        received_hash.lower(),
        expected_hash.lower(),
    )


def get_client_ip(request: Request) -> str:
    """
    Lấy IP của khách hàng.
    """

    forwarded_for = request.headers.get("x-forwarded-for")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return "127.0.0.1"


# =========================================================
# API TẠO URL THANH TOÁN
# POST /payments/vnpay/create
# =========================================================
@router.post("/create")
def create_vnpay_payment(
    payment_data: VnpayPaymentCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Tạo URL thanh toán VNPAY Sandbox.

    Frontend phải tạo đơn hàng trước,
    sau đó gửi order_id vào API này.
    """

    check_vnpay_config()

    order = (
        db.query(Order)
        .filter(Order.id == payment_data.order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy đơn hàng",
        )

    if order.payment_status == "PAID":
        raise HTTPException(
            status_code=400,
            detail="Đơn hàng này đã được thanh toán",
        )

    if not order.total_price or order.total_price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Tổng tiền đơn hàng không hợp lệ",
        )

    current_time = datetime.now(VN_TIMEZONE)
    expire_time = current_time + timedelta(minutes=15)

    # Tạo mã giao dịch ShopHub duy nhất
    txn_ref = (
        f"SHOPHUB{order.id}"
        f"{current_time.strftime('%Y%m%d%H%M%S%f')}"
    )

    vnpay_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": VNP_TMN_CODE,

        # VNPAY yêu cầu số tiền phải nhân 100
        "vnp_Amount": str(int(order.total_price) * 100),

        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,

        "vnp_OrderInfo": (
            f"Thanh toan don hang ShopHub {order.id}"
        ),

        "vnp_OrderType": "other",

        "vnp_Locale": (
            payment_data.locale
            if payment_data.locale in ("vn", "en")
            else "vn"
        ),

        "vnp_ReturnUrl": VNP_RETURN_URL,
        "vnp_IpAddr": get_client_ip(request),

        "vnp_CreateDate": current_time.strftime(
            "%Y%m%d%H%M%S"
        ),

        "vnp_ExpireDate": expire_time.strftime(
            "%Y%m%d%H%M%S"
        ),
    }

    # Nếu không truyền bank_code,
    # VNPAY sẽ hiển thị trang chọn ngân hàng
    if payment_data.bank_code:
        vnpay_params["vnp_BankCode"] = (
            payment_data.bank_code
        )

    query_string = create_query_string(vnpay_params)
    secure_hash = create_secure_hash(vnpay_params)

    payment_url = (
        f"{VNP_URL}?"
        f"{query_string}"
        f"&vnp_SecureHash={secure_hash}"
    )

    # Lưu thông tin giao dịch vào đơn hàng
    order.payment_method = "VNPAY"
    order.payment_status = "PENDING"
    order.vnp_txn_ref = txn_ref
    order.vnp_transaction_no = None
    order.vnp_response_code = None
    order.paid_at = None

    db.commit()
    db.refresh(order)

    return {
        "message": "Tạo URL thanh toán VNPAY thành công",
        "order_id": order.id,
        "txn_ref": txn_ref,
        "payment_url": payment_url,
    }


# =========================================================
# API VNPAY RETURN
# GET /payments/vnpay/return
# =========================================================
@router.get("/return")
def vnpay_return(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    VNPAY chuyển trình duyệt khách hàng về endpoint này.

    Endpoint sẽ:
    1. Kiểm tra chữ ký.
    2. Kiểm tra đơn hàng.
    3. Kiểm tra số tiền.
    4. Cập nhật PAID nếu thanh toán thành công.
    5. Chuyển về trang kết quả frontend.
    """

    check_vnpay_config()

    params = dict(request.query_params)

    txn_ref = params.get("vnp_TxnRef", "")
    response_code = params.get("vnp_ResponseCode", "")

    transaction_status = params.get(
        "vnp_TransactionStatus",
        "",
    )

    transaction_no = params.get(
        "vnp_TransactionNo",
        "",
    )

    signature_valid = verify_vnpay_signature(params)

    order = None
    result = "failed"

    # Chữ ký không hợp lệ
    if not signature_valid:
        result = "invalid_signature"

    else:
        order = (
            db.query(Order)
            .filter(Order.vnp_txn_ref == txn_ref)
            .first()
        )

        # Không tìm thấy đơn hàng
        if not order:
            result = "order_not_found"

        else:
            try:
                vnp_amount = int(
                    params.get("vnp_Amount", "0")
                )

                expected_amount = (
                    int(order.total_price) * 100
                )

            except (ValueError, TypeError):
                vnp_amount = 0
                expected_amount = -1

            # Số tiền VNPAY trả về không đúng
            if vnp_amount != expected_amount:
                result = "invalid_amount"

            # Thanh toán thành công
            elif (
                response_code == "00"
                and transaction_status == "00"
            ):
                order.vnp_response_code = response_code
                order.vnp_transaction_no = transaction_no

                # Tránh cập nhật trùng nếu IPN đã cập nhật trước
                if order.payment_status != "PAID":
                    order.payment_status = "PAID"

                    order.paid_at = datetime.now(
                        VN_TIMEZONE
                    ).replace(tzinfo=None)

                db.commit()
                db.refresh(order)

                result = "success"

            # Thanh toán không thành công
            else:
                order.vnp_response_code = response_code
                order.vnp_transaction_no = transaction_no

                # Không đổi FAILED tại return để tránh xung đột
                # trong trường hợp IPN gửi kết quả đến sau
                db.commit()

                result = "failed"

    frontend_params = urlencode(
        {
            "result": result,
            "txn_ref": txn_ref,
            "response_code": response_code,
            "transaction_no": transaction_no,
            "order_id": order.id if order else "",
        }
    )

    redirect_url = (
        f"{FRONTEND_URL.rstrip('/')}"
        f"/payment-result?{frontend_params}"
    )

    return RedirectResponse(
        url=redirect_url,
        status_code=302,
    )


# =========================================================
# API VNPAY IPN
# GET /payments/vnpay/ipn
# =========================================================
@router.get("/ipn")
def vnpay_ipn(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Endpoint server-to-server.

    VNPAY gọi endpoint này để xác nhận giao dịch
    và cập nhật trạng thái thanh toán trong database.
    """

    try:
        check_vnpay_config()

        params = dict(request.query_params)

        if not params:
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "99",
                    "Message": "Invalid request",
                },
            )

        # Kiểm tra chữ ký
        if not verify_vnpay_signature(params):
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "97",
                    "Message": "Invalid signature",
                },
            )

        txn_ref = params.get("vnp_TxnRef", "")

        order = (
            db.query(Order)
            .filter(Order.vnp_txn_ref == txn_ref)
            .first()
        )

        if not order:
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "01",
                    "Message": "Order not found",
                },
            )

        # Kiểm tra số tiền
        vnp_amount = int(
            params.get("vnp_Amount", "0")
        )

        expected_amount = (
            int(order.total_price) * 100
        )

        if vnp_amount != expected_amount:
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "04",
                    "Message": "Invalid amount",
                },
            )

        response_code = params.get(
            "vnp_ResponseCode",
            "",
        )

        transaction_status = params.get(
            "vnp_TransactionStatus",
            "",
        )

        transaction_no = params.get(
            "vnp_TransactionNo",
            "",
        )

        # Nếu đã PAID thì trả về đã xác nhận
        if order.payment_status == "PAID":
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "02",
                    "Message": "Order already confirmed",
                },
            )

        order.vnp_response_code = response_code
        order.vnp_transaction_no = transaction_no

        # Thanh toán thành công
        if (
            response_code == "00"
            and transaction_status == "00"
        ):
            order.payment_status = "PAID"

            order.paid_at = datetime.now(
                VN_TIMEZONE
            ).replace(tzinfo=None)

        # Thanh toán thất bại
        else:
            order.payment_status = "FAILED"
            order.paid_at = None

        db.commit()
        db.refresh(order)

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "00",
                "Message": "Confirm Success",
            },
        )

    except (ValueError, TypeError):
        db.rollback()

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "99",
                "Message": "Invalid data",
            },
        )

    except Exception as error:
        db.rollback()

        print("VNPAY IPN ERROR:", error)

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "99",
                "Message": "Unknown error",
            },
        )