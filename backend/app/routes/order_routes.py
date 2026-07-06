from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..orm_models import Order, OrderItem, Product
from ..order_schemas import OrderCreate, OrderResponse


router = APIRouter(tags=["Orders"])


@router.post("/orders", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(status_code=400, detail="Đơn hàng chưa có sản phẩm")

    new_order = Order(
        user_id=order_data.user_id,
        user_email=order_data.user_email,
        shipping_name=order_data.shipping_name,
        shipping_phone=order_data.shipping_phone,
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method,
        note=order_data.note,
        total_price=0,
        status="Đang xử lý",
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    total_price = 0

    for item in order_data.items:
        product = None

        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()

        if product:
            product_id = product.id
            product_name = product.name
            product_image = product.image
            product_category = product.category.name if product.category else "Khác"
            price = product.price
        else:
            product_id = None
            product_name = item.product_name or "Sản phẩm"
            product_image = item.product_image
            product_category = item.product_category or "Khác"
            price = item.price or 0

        quantity = item.quantity
        total_price += price * quantity

        new_item = OrderItem(
            order_id=new_order.id,
            product_id=product_id,
            quantity=quantity,
            price=price,
            product_name=product_name,
            product_image=product_image,
            product_category=product_category,
        )

        db.add(new_item)

    new_order.total_price = total_price

    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/orders", response_model=List[OrderResponse])
def get_orders(user_email: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Order).order_by(Order.id.desc())

    if user_email:
        query = query.filter(Order.user_email == user_email)

    return query.all()


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    return order