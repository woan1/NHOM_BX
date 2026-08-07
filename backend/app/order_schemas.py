from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# =========================
# DỮ LIỆU SẢN PHẨM KHI TẠO ĐƠN
# =========================
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    quantity: int

    product_name: Optional[str] = None
    product_image: Optional[str] = None
    product_category: Optional[str] = None
    price: Optional[int] = None


# =========================
# DỮ LIỆU TẠO ĐƠN HÀNG
# =========================
class OrderCreate(BaseModel):
    user_id: Optional[int] = None
    user_email: Optional[str] = None

    shipping_name: str
    shipping_phone: str
    shipping_address: str

    # Thêm 3 dòng này
    shipping_province: Optional[str] = None
    shipping_district: Optional[str] = None
    shipping_ward: Optional[str] = None

    payment_method: str = "Thanh toán khi nhận hàng"
    note: Optional[str] = None

    total_price: Optional[int] = None

    items: List[OrderItemCreate]


# =========================
# DỮ LIỆU SẢN PHẨM TRẢ VỀ
# =========================
class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    quantity: int
    price: int

    product_name: str
    product_image: Optional[str] = None
    product_category: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# DỮ LIỆU ĐƠN HÀNG TRẢ VỀ
# =========================
class OrderResponse(BaseModel):
    id: int

    user_id: Optional[int] = None
    user_email: Optional[str] = None

    total_price: int
    status: str

    shipping_name: str
    shipping_phone: str
    shipping_address: str

    shipping_province: Optional[str] = None
    shipping_district: Optional[str] = None
    shipping_ward: Optional[str] = None

    payment_method: str
    note: Optional[str] = None

    created_at: datetime

    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True