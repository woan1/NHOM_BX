from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
import os

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .db import get_db
from .orm_models import Order


# Đọc file backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)


router = APIRouter(
    prefix="/payments/paypal",
    tags=["PayPal Sandbox"],
)


PAYPAL_BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com",
).rstrip("/")

PAYPAL_CLIENT_ID = os.getenv(
    "PAYPAL_CLIENT_ID",
    "",
).strip()

PAYPAL_CLIENT_SECRET = os.getenv(
    "PAYPAL_CLIENT_SECRET",
    "",
).strip()

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
).rstrip("/")


try:
    VND_PER_USD = Decimal(
        os.getenv("VND_PER_USD", "25000")
    )
except InvalidOperation:
    VND_PER_USD = Decimal("25000")


# =========================
# SCHEMAS
# =========================
class PayPalCreateRequest(BaseModel):
    order_id: int


class PayPalCaptureRequest(BaseModel):
    order_id: int
    paypal_order_id: str


class PayPalCancelRequest(BaseModel):
    order_id: int


# =========================
# HELPER FUNCTIONS
# =========================
def ensure_paypal_config():
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Chưa cấu hình PAYPAL_CLIENT_ID hoặc "
                "PAYPAL_CLIENT_SECRET trong backend/.env"
            ),
        )


def paypal_error_message(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return response.text or "Không có nội dung lỗi"

    name = data.get("name")
    message = data.get("message")
    debug_id = data.get("debug_id")

    parts = [
        part
        for part in [name, message]
        if part
    ]

    if debug_id:
        parts.append(f"debug_id={debug_id}")

    if parts:
        return " - ".join(parts)

    return str(data)


def get_access_token() -> str:
    ensure_paypal_config()

    try:
        response = httpx.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(
                PAYPAL_CLIENT_ID,
                PAYPAL_CLIENT_SECRET,
            ),
            data={
                "grant_type": "client_credentials",
            },
            headers={
                "Accept": "application/json",
                "Accept-Language": "en_US",
            },
            timeout=30.0,
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Không thể kết nối PayPal Sandbox: {error}",
        ) from error

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Không lấy được PayPal access token: "
                f"{paypal_error_message(response)}"
            ),
        )

    access_token = response.json().get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="PayPal không trả về access token.",
        )

    return access_token


def convert_vnd_to_usd(total_price: int) -> Decimal:
    if total_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tổng tiền đơn hàng phải lớn hơn 0.",
        )

    if VND_PER_USD <= 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VND_PER_USD trong .env không hợp lệ.",
        )

    amount = (
        Decimal(total_price) / VND_PER_USD
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    if amount < Decimal("0.01"):
        amount = Decimal("0.01")

    return amount


def get_order_or_404(
    order_id: int,
    db: Session,
) -> Order:
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn hàng.",
        )

    return order


# =========================
# TẠO PAYPAL ORDER
# =========================
@router.post("/create")
def create_paypal_order(
    payload: PayPalCreateRequest,
    db: Session = Depends(get_db),
):
    order = get_order_or_404(
        payload.order_id,
        db,
    )

    if order.payment_status == "PAID":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn hàng này đã được thanh toán.",
        )

    amount_usd = convert_vnd_to_usd(
        order.total_price
    )

    access_token = get_access_token()

    request_body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(order.id),
                "custom_id": str(order.id),
                "description": f"ShopHub order #{order.id}",
                "amount": {
                    "currency_code": "USD",
                    "value": format(
                        amount_usd,
                        ".2f",
                    ),
                },
            }
        ],
        "payment_source": {
            "paypal": {
                "payment_method_preference":
                    "IMMEDIATE_PAYMENT_REQUIRED",
                "experience_context": {
                    "brand_name": "ShopHub",
                    "locale": "en-US",
                    "landing_page": "LOGIN",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "PAY_NOW",

                    "return_url": (
                        f"{FRONTEND_URL}/paypal/return"
                        f"?shop_order_id={order.id}"
                    ),

                    "cancel_url": (
                        f"{FRONTEND_URL}/checkout"
                        f"?paypal=cancel"
                        f"&shop_order_id={order.id}"
                    ),
                },
            }
        },
    }

    try:
        response = httpx.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            json=request_body,
            headers={
                "Authorization":
                    f"Bearer {access_token}",
                "Content-Type":
                    "application/json",
                "Prefer":
                    "return=representation",
                "PayPal-Request-Id":
                    f"shophub-create-{order.id}",
            },
            timeout=30.0,
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Không thể tạo PayPal Order: {error}",
        ) from error

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "PayPal từ chối tạo giao dịch: "
                f"{paypal_error_message(response)}"
            ),
        )

    paypal_data = response.json()
    approval_url = None

    for link in paypal_data.get("links", []):
        if link.get("rel") in (
            "payer-action",
            "approve",
        ):
            approval_url = link.get("href")
            break

    if not approval_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "PayPal không trả về đường dẫn "
                "xác nhận thanh toán."
            ),
        )

    order.payment_method = "PAYPAL"
    order.payment_status = "PENDING"

    db.commit()

    return {
        "paypal_order_id": paypal_data.get("id"),
        "payment_url": approval_url,
        "amount_usd": format(
            amount_usd,
            ".2f",
        ),
        "currency": "USD",
        "shop_order_id": order.id,
    }


# =========================
# XÁC NHẬN THANH TOÁN
# =========================
@router.post("/capture")
def capture_paypal_order(
    payload: PayPalCaptureRequest,
    db: Session = Depends(get_db),
):
    order = get_order_or_404(
        payload.order_id,
        db,
    )

    # Tránh thanh toán hai lần nếu trang bị tải lại.
    if order.payment_status == "PAID":
        return {
            "success": True,
            "message":
                "Đơn hàng đã được thanh toán trước đó.",
            "shop_order_id": order.id,
            "payment_status": order.payment_status,
            "status": order.status,
        }

    access_token = get_access_token()

    try:
        response = httpx.post(
            (
                f"{PAYPAL_BASE_URL}"
                f"/v2/checkout/orders/"
                f"{payload.paypal_order_id}/capture"
            ),
            json={},
            headers={
                "Authorization":
                    f"Bearer {access_token}",
                "Content-Type":
                    "application/json",
                "Prefer":
                    "return=representation",
                "PayPal-Request-Id":
                    f"shophub-capture-{order.id}",
            },
            timeout=30.0,
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Không thể xác nhận thanh toán "
                f"PayPal: {error}"
            ),
        ) from error

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "PayPal từ chối capture giao dịch: "
                f"{paypal_error_message(response)}"
            ),
        )

    paypal_data = response.json()

    if paypal_data.get("status") != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Thanh toán PayPal chưa hoàn tất. "
                f"Trạng thái: "
                f"{paypal_data.get('status')}"
            ),
        )

    purchase_units = (
        paypal_data.get("purchase_units") or []
    )

    if not purchase_units:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="PayPal không trả về purchase_units.",
        )

    purchase_unit = purchase_units[0]

    custom_id = str(
        purchase_unit.get("custom_id") or ""
    )

    if custom_id and custom_id != str(order.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Mã đơn hàng PayPal không khớp "
                "với đơn ShopHub."
            ),
        )

    captures = (
        purchase_unit
        .get("payments", {})
        .get("captures", [])
    )

    if not captures:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "PayPal không trả về "
                "thông tin capture."
            ),
        )

    capture = captures[0]

    capture_amount = capture.get(
        "amount",
        {},
    )

    captured_currency = capture_amount.get(
        "currency_code"
    )

    captured_value = capture_amount.get(
        "value"
    )

    expected_amount = convert_vnd_to_usd(
        order.total_price
    )

    try:
        captured_decimal = Decimal(
            str(captured_value)
        )

    except InvalidOperation as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Số tiền PayPal trả về "
                "không hợp lệ."
            ),
        ) from error

    if (
        captured_currency != "USD"
        or captured_decimal != expected_amount
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Số tiền PayPal không khớp. "
                f"Dự kiến {expected_amount:.2f} USD, "
                f"nhận {captured_value} "
                f"{captured_currency}."
            ),
        )

    order.payment_method = "PAYPAL"
    order.payment_status = "PAID"
    order.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message":
            "Thanh toán PayPal Sandbox thành công.",
        "shop_order_id": order.id,
        "paypal_order_id": paypal_data.get("id"),
        "paypal_capture_id": capture.get("id"),
        "payment_status": order.payment_status,
        "status": order.status,
        "paid_at": order.paid_at,
    }


# =========================
# HỦY THANH TOÁN
# =========================
@router.post("/cancel")
def cancel_paypal_order(
    payload: PayPalCancelRequest,
    db: Session = Depends(get_db),
):
    order = get_order_or_404(
        payload.order_id,
        db,
    )

    if order.payment_status == "PAID":
        return {
            "success": True,
            "message": (
                "Đơn hàng đã thanh toán nên "
                "không thể hủy thanh toán."
            ),
            "shop_order_id": order.id,
        }

    # create_order đã trừ tồn kho.
    # Khi khách hủy PayPal thì cộng tồn kho lại.
    if order.status != "Đã hủy":
        for item in order.items:
            if (
                item.product
                and item.product.stock is not None
            ):
                item.product.stock += item.quantity

    order.payment_method = "PAYPAL"
    order.payment_status = "FAILED"
    order.status = "Đã hủy"

    db.commit()

    return {
        "success": True,
        "message": "Đã hủy thanh toán PayPal.",
        "shop_order_id": order.id,
        "payment_status": order.payment_status,
        "status": order.status,
    }