import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Optional
from urllib.parse import quote_plus, urlencode

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .db import get_db
from .orm_models import Order


# =========================================================
# ĐỌC CẤU HÌNH TỪ backend/.env
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# override=True giúp ưu tiên dữ liệu trong backend/.env
# thay vì dùng biến môi trường cũ đang tồn tại trên Windows.
load_dotenv(
    dotenv_path=ENV_FILE,
    override=True,
)


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

VNP_TMN_CODE = os.getenv(
    "VNP_TMN_CODE",
    "",
).strip()

VNP_HASH_SECRET = os.getenv(
    "VNP_HASH_SECRET",
    "",
).strip()

VNP_URL = os.getenv(
    "VNP_URL",
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
).strip()

VNP_RETURN_URL = os.getenv(
    "VNP_RETURN_URL",
    "",
).strip()

VNP_IPN_URL = os.getenv(
    "VNP_IPN_URL",
    "",
).strip()

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
).strip()

VNP_DEBUG = os.getenv(
    "VNP_DEBUG",
    "false",
).strip().lower() == "true"


# Múi giờ Việt Nam
VN_TIMEZONE = timezone(
    timedelta(hours=7)
)


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
    missing_variables = []

    if not VNP_TMN_CODE:
        missing_variables.append("VNP_TMN_CODE")

    if not VNP_HASH_SECRET:
        missing_variables.append("VNP_HASH_SECRET")

    if not VNP_URL:
        missing_variables.append("VNP_URL")

    if not VNP_RETURN_URL:
        missing_variables.append("VNP_RETURN_URL")

    if missing_variables:
        raise HTTPException(
            status_code=500,
            detail=(
                "Thiếu cấu hình VNPAY trong backend/.env: "
                + ", ".join(missing_variables)
            ),
        )


# =========================================================
# LẤY TỔNG TIỀN ĐƠN HÀNG
# =========================================================

def get_order_total(order: Order) -> int:
    """
    Hỗ trợ cả hai tên trường:
    - total_price
    - total_amount
    """

    total = getattr(
        order,
        "total_price",
        None,
    )

    if total is None:
        total = getattr(
            order,
            "total_amount",
            None,
        )

    try:
        return int(total or 0)
    except (ValueError, TypeError):
        return 0


# =========================================================
# XỬ LÝ THAM SỐ VNPAY
# =========================================================

def clean_params(
    params: Dict[str, str],
) -> Dict[str, str]:
    """
    Loại bỏ:
    - Tham số rỗng
    - vnp_SecureHash
    - vnp_SecureHashType
    """

    cleaned_params = {}

    for key, value in params.items():
        if key in (
            "vnp_SecureHash",
            "vnp_SecureHashType",
        ):
            continue

        if value is None:
            continue

        string_value = str(value)

        if string_value == "":
            continue

        cleaned_params[key] = string_value

    return cleaned_params


def create_query_string(
    params: Dict[str, str],
) -> str:
    """
    Sắp xếp tham số theo tên và URL encode.

    Chuỗi này được dùng đồng thời cho:
    - Dữ liệu tạo chữ ký
    - Query string gửi sang VNPAY
    """

    cleaned_params = clean_params(params)

    sorted_items = sorted(
        cleaned_params.items(),
        key=lambda item: item[0],
    )

    encoded_items = []

    for key, value in sorted_items:
        encoded_key = quote_plus(
            str(key),
            safe="",
        )

        encoded_value = quote_plus(
            str(value),
            safe="",
        )

        encoded_items.append(
            f"{encoded_key}={encoded_value}"
        )

    return "&".join(encoded_items)


def create_secure_hash(
    params: Dict[str, str],
) -> str:
    """
    Tạo chữ ký HMAC-SHA512.
    """

    sign_data = create_query_string(params)

    secure_hash = hmac.new(
        VNP_HASH_SECRET.encode("utf-8"),
        sign_data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()

    if VNP_DEBUG:
        print("=" * 60)
        print("VNPAY TMN CODE:", repr(VNP_TMN_CODE))
        print(
            "VNPAY HASH SECRET LENGTH:",
            len(VNP_HASH_SECRET),
        )
        print("VNPAY SIGN DATA:", sign_data)
        print("VNPAY SECURE HASH:", secure_hash)
        print("=" * 60)

    return secure_hash


def verify_vnpay_signature(
    params: Dict[str, str],
) -> bool:
    """
    Xác thực chữ ký VNPAY gửi về Return URL hoặc IPN.
    """

    received_hash = str(
        params.get(
            "vnp_SecureHash",
            "",
        )
    ).strip()

    if not received_hash:
        return False

    expected_hash = create_secure_hash(
        params
    )

    return hmac.compare_digest(
        received_hash.lower(),
        expected_hash.lower(),
    )


def get_client_ip(
    request: Request,
) -> str:
    """
    Lấy địa chỉ IP của khách hàng.
    """

    forwarded_for = request.headers.get(
        "x-forwarded-for"
    )

    if forwarded_for:
        client_ip = (
            forwarded_for
            .split(",")[0]
            .strip()
        )
    elif request.client:
        client_ip = request.client.host
    else:
        client_ip = "127.0.0.1"

    # VNPAY có thể không chấp nhận IPv6 localhost.
    if client_ip in (
        "::1",
        "0:0:0:0:0:0:0:1",
    ):
        client_ip = "127.0.0.1"

    return client_ip


# =========================================================
# API KIỂM TRA CẤU HÌNH
# GET /payments/vnpay/config-check
# =========================================================

@router.get("/config-check")
def vnpay_config_check():
    """
    Kiểm tra backend đã đọc đúng cấu hình chưa.
    Không trả về Hash Secret.
    """

    return {
        "env_file": str(ENV_FILE),
        "env_file_exists": ENV_FILE.exists(),
        "tmn_code": VNP_TMN_CODE,
        "hash_secret_length": len(
            VNP_HASH_SECRET
        ),
        "vnp_url": VNP_URL,
        "return_url": VNP_RETURN_URL,
        "ipn_url": VNP_IPN_URL,
        "frontend_url": FRONTEND_URL,
    }


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
    Quy trình:

    1. Frontend tạo đơn hàng.
    2. Frontend gửi order_id vào API này.
    3. Backend tạo URL thanh toán.
    4. Frontend chuyển người dùng đến VNPAY.
    """

    check_vnpay_config()

    order = (
        db.query(Order)
        .filter(
            Order.id
            == payment_data.order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy đơn hàng.",
        )

    if (
        str(
            getattr(
                order,
                "payment_status",
                "",
            )
        ).upper()
        == "PAID"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Đơn hàng này đã được "
                "thanh toán."
            ),
        )

    order_total = get_order_total(
        order
    )

    if order_total <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Tổng tiền đơn hàng "
                "không hợp lệ."
            ),
        )

    current_time = datetime.now(
        VN_TIMEZONE
    )

    expire_time = (
        current_time
        + timedelta(minutes=15)
    )

    # Mã giao dịch duy nhất
    txn_ref = (
        f"SHOPHUB{order.id}"
        f"{current_time.strftime('%Y%m%d%H%M%S%f')}"
    )

    locale = (
        payment_data.locale
        if payment_data.locale
        in ("vn", "en")
        else "vn"
    )

    vnpay_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": VNP_TMN_CODE,

        # VNPAY yêu cầu số tiền nhân 100
        "vnp_Amount": str(
            order_total * 100
        ),

        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,

        "vnp_OrderInfo": (
            "Thanh toan don hang "
            f"ShopHub {order.id}"
        ),

        "vnp_OrderType": "other",
        "vnp_Locale": locale,

        "vnp_ReturnUrl": (
            VNP_RETURN_URL
        ),

        "vnp_IpAddr": get_client_ip(
            request
        ),

        "vnp_CreateDate": (
            current_time.strftime(
                "%Y%m%d%H%M%S"
            )
        ),

        "vnp_ExpireDate": (
            expire_time.strftime(
                "%Y%m%d%H%M%S"
            )
        ),
    }

    if payment_data.bank_code:
        vnpay_params["vnp_BankCode"] = (
            payment_data
            .bank_code
            .strip()
        )

    query_string = create_query_string(
        vnpay_params
    )

    secure_hash = create_secure_hash(
        vnpay_params
    )

    payment_url = (
        f"{VNP_URL}"
        f"?{query_string}"
        f"&vnp_SecureHash={secure_hash}"
    )

    try:
        order.payment_method = "VNPAY"
        order.payment_status = "PENDING"

        if hasattr(
            order,
            "vnp_txn_ref",
        ):
            order.vnp_txn_ref = txn_ref

        if hasattr(
            order,
            "vnp_transaction_no",
        ):
            order.vnp_transaction_no = None

        if hasattr(
            order,
            "vnp_response_code",
        ):
            order.vnp_response_code = None

        if hasattr(
            order,
            "paid_at",
        ):
            order.paid_at = None

        db.commit()
        db.refresh(order)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Không thể lưu thông tin "
                f"giao dịch: {str(error)}"
            ),
        ) from error

    return {
        "message": (
            "Tạo URL thanh toán "
            "VNPAY thành công."
        ),
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
    VNPAY chuyển trình duyệt khách hàng
    về endpoint này sau thanh toán.
    """

    check_vnpay_config()

    params = {
        key: value
        for key, value
        in request.query_params.items()
    }

    txn_ref = params.get(
        "vnp_TxnRef",
        "",
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

    signature_valid = (
        verify_vnpay_signature(
            params
        )
    )

    order = None
    result = "failed"

    if not signature_valid:
        result = "invalid_signature"

    else:
        order = (
            db.query(Order)
            .filter(
                Order.vnp_txn_ref
                == txn_ref
            )
            .first()
        )

        if not order:
            result = "order_not_found"

        else:
            try:
                vnp_amount = int(
                    params.get(
                        "vnp_Amount",
                        "0",
                    )
                )

                expected_amount = (
                    get_order_total(order)
                    * 100
                )

            except (
                ValueError,
                TypeError,
            ):
                vnp_amount = 0
                expected_amount = -1

            if (
                vnp_amount
                != expected_amount
            ):
                result = "invalid_amount"

            elif (
                response_code == "00"
                and transaction_status
                == "00"
            ):
                try:
                    if hasattr(
                        order,
                        "vnp_response_code",
                    ):
                        order.vnp_response_code = (
                            response_code
                        )

                    if hasattr(
                        order,
                        "vnp_transaction_no",
                    ):
                        order.vnp_transaction_no = (
                            transaction_no
                        )

                    if (
                        order.payment_status
                        != "PAID"
                    ):
                        order.payment_status = (
                            "PAID"
                        )

                        if hasattr(
                            order,
                            "paid_at",
                        ):
                            order.paid_at = (
                                datetime.now(
                                    VN_TIMEZONE
                                )
                                .replace(
                                    tzinfo=None
                                )
                            )

                    db.commit()
                    db.refresh(order)

                    result = "success"

                except Exception:
                    db.rollback()
                    result = "database_error"

            else:
                try:
                    if hasattr(
                        order,
                        "vnp_response_code",
                    ):
                        order.vnp_response_code = (
                            response_code
                        )

                    if hasattr(
                        order,
                        "vnp_transaction_no",
                    ):
                        order.vnp_transaction_no = (
                            transaction_no
                        )

                    db.commit()

                except Exception:
                    db.rollback()

                result = "failed"

    frontend_params = urlencode(
        {
            "result": result,
            "txn_ref": txn_ref,
            "response_code": (
                response_code
            ),
            "transaction_no": (
                transaction_no
            ),
            "order_id": (
                order.id
                if order
                else ""
            ),
        }
    )

    redirect_url = (
        f"{FRONTEND_URL.rstrip('/')}"
        f"/payment-result"
        f"?{frontend_params}"
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
    VNPAY gọi API này trực tiếp để
    xác nhận và cập nhật giao dịch.
    """

    try:
        check_vnpay_config()

        params = {
            key: value
            for key, value
            in request.query_params.items()
        }

        if not params:
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "99",
                    "Message": (
                        "Invalid request"
                    ),
                },
            )

        if not verify_vnpay_signature(
            params
        ):
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "97",
                    "Message": (
                        "Invalid signature"
                    ),
                },
            )

        txn_ref = params.get(
            "vnp_TxnRef",
            "",
        )

        order = (
            db.query(Order)
            .filter(
                Order.vnp_txn_ref
                == txn_ref
            )
            .first()
        )

        if not order:
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "01",
                    "Message": (
                        "Order not found"
                    ),
                },
            )

        try:
            vnp_amount = int(
                params.get(
                    "vnp_Amount",
                    "0",
                )
            )

        except (
            ValueError,
            TypeError,
        ):
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "99",
                    "Message": (
                        "Invalid amount"
                    ),
                },
            )

        expected_amount = (
            get_order_total(order)
            * 100
        )

        if (
            vnp_amount
            != expected_amount
        ):
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "04",
                    "Message": (
                        "Invalid amount"
                    ),
                },
            )

        response_code = params.get(
            "vnp_ResponseCode",
            "",
        )

        transaction_status = (
            params.get(
                "vnp_TransactionStatus",
                "",
            )
        )

        transaction_no = params.get(
            "vnp_TransactionNo",
            "",
        )

        if (
            order.payment_status
            == "PAID"
        ):
            return JSONResponse(
                status_code=200,
                content={
                    "RspCode": "02",
                    "Message": (
                        "Order already "
                        "confirmed"
                    ),
                },
            )

        if hasattr(
            order,
            "vnp_response_code",
        ):
            order.vnp_response_code = (
                response_code
            )

        if hasattr(
            order,
            "vnp_transaction_no",
        ):
            order.vnp_transaction_no = (
                transaction_no
            )

        if (
            response_code == "00"
            and transaction_status
            == "00"
        ):
            order.payment_status = "PAID"

            if hasattr(
                order,
                "paid_at",
            ):
                order.paid_at = (
                    datetime.now(
                        VN_TIMEZONE
                    )
                    .replace(
                        tzinfo=None
                    )
                )

        else:
            order.payment_status = (
                "FAILED"
            )

            if hasattr(
                order,
                "paid_at",
            ):
                order.paid_at = None

        db.commit()
        db.refresh(order)

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "00",
                "Message": (
                    "Confirm Success"
                ),
            },
        )

    except (
        ValueError,
        TypeError,
    ):
        db.rollback()

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "99",
                "Message": (
                    "Invalid data"
                ),
            },
        )

    except Exception as error:
        db.rollback()

        print(
            "VNPAY IPN ERROR:",
            repr(error),
        )

        return JSONResponse(
            status_code=200,
            content={
                "RspCode": "99",
                "Message": (
                    "Unknown error"
                ),
            },
        )