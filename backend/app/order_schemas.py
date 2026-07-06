from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Dữ liệu từng sản phẩm gửi lên khi đặt hàng
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    quantity: int

    # Lưu thêm thông tin sản phẩm tại thời điểm đặt hàng
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    product_category: Optional[str] = None
    price: Optional[int] = None


# Dữ liệu gửi lên khi tạo đơn hàng
class OrderCreate(BaseModel):
    user_id: Optional[int] = None
    user_email: Optional[str] = None

    shipping_name: str
    shipping_phone: str
    shipping_address: str

    payment_method: str = "Thanh toán khi nhận hàng"
    note: Optional[str] = None

    total_price: Optional[int] = None
    items: List[OrderItemCreate]


# Dữ liệu trả về của từng sản phẩm trong đơn hàng
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


# Dữ liệu trả về của đơn hàng
class OrderResponse(BaseModel):
    id: int

    user_id: Optional[int] = None
    user_email: Optional[str] = None

    total_price: int
    status: str

    shipping_name: str
    shipping_phone: str
    shipping_address: str

    payment_method: str
    note: Optional[str] = None

    created_at: datetime

    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True