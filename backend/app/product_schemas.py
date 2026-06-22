from typing import Optional

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str


class ProductCreate(BaseModel):
    name: str
    price: int
    image: str
    description: Optional[str] = None
    stock: int = 0
    category_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    image: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None