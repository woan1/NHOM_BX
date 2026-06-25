from typing import List

from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    items: List[OrderItemCreate]