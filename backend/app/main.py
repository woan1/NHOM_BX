from datetime import datetime, timedelta, timezone
from pathlib import Path
import shutil
import uuid
from typing import Literal

from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    UploadFile,
    Query,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from .auth_schemas import UserLogin, UserRegister
from .db import Base, SessionLocal, engine, get_db
from .order_schemas import OrderCreate
from .orm_models import Category, Order, OrderItem, Product, User, VisitLog
from .paypal import router as paypal_router
from .product_schemas import (
    CategoryCreate,
    ProductCreate,
    ProductUpdate,
)
from .vnpay import router as vnpay_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopHub API",
    version="0.1.0",
)


# =========================
# UPLOAD IMAGE CONFIG
# =========================
UPLOAD_DIR = (
    Path(__file__).resolve().parent.parent
    / "uploads"
)

UPLOAD_DIR.mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://nhom-bx.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# PAYMENT ROUTERS
# =========================
app.include_router(vnpay_router)
app.include_router(paypal_router)


# =========================
# AUTH CONFIG
# =========================
SECRET_KEY = "shophub_secret_key_demo_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login-form"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
):
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({
        "exp": expire,
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
                detail=(
                    "Invalid authentication token"
                ),
            )

    except JWTError:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid authentication token"
            ),
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="User not found",
        )

    return user


def require_admin(
    current_user: User = Depends(
        get_current_user
    ),
):
    if current_user.role not in [
        "ADMIN",
        "admin",
    ]:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Admin access required",
        )

    return current_user


# =========================
# FORMAT RESPONSE
# =========================
def format_product(product: Product):
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "image_url": product.image,
        "description": product.description,
        "stock": product.stock,
        "category_id": product.category_id,
        "category": (
            product.category.name
            if product.category
            else None
        ),
    }


def format_order(order: Order):
    return {
        "id": order.id,
        "user_id": order.user_id,
        "user_email": getattr(
            order,
            "user_email",
            None,
        ),
        "customer_name": (
            order.user.name
            if order.user
            else None
        ),

        # product_total: doanh thu sản phẩm
        # shipping_fee: tiền vận chuyển
        # total_price/total: tổng số tiền khách thanh toán
        "product_total": int(getattr(order, "product_total", 0) or 0),
        "shipping_fee": int(getattr(order, "shipping_fee", 0) or 0),
        "total_price": int(order.total_price or 0),
        "total": int(order.total_price or 0),
        "status": order.status,

        "shipping_name": order.shipping_name,
        "shipping_phone": (
            order.shipping_phone
        ),
        "shipping_address": (
            order.shipping_address
        ),
        "shipping_province": getattr(
            order,
            "shipping_province",
            None,
        ),
        "shipping_district": getattr(
            order,
            "shipping_district",
            None,
        ),
        "shipping_ward": getattr(
            order,
            "shipping_ward",
            None,
        ),

        "payment_method": getattr(
            order,
            "payment_method",
            "Thanh toán khi nhận hàng",
        ),

        "payment_status": getattr(
            order,
            "payment_status",
            "PENDING",
        ),

        "vnp_txn_ref": getattr(
            order,
            "vnp_txn_ref",
            None,
        ),

        "vnp_transaction_no": getattr(
            order,
            "vnp_transaction_no",
            None,
        ),

        "vnp_response_code": getattr(
            order,
            "vnp_response_code",
            None,
        ),

        "paid_at": getattr(
            order,
            "paid_at",
            None,
        ),

        "note": getattr(
            order,
            "note",
            None,
        ),

        "created_at": order.created_at,

        "date": (
            order.created_at.strftime(
                "%d/%m/%Y %H:%M:%S"
            )
            if order.created_at
            else None
        ),

        "customer": {
            "fullName": order.shipping_name,
            "phone": order.shipping_phone,
            "address": (
                order.shipping_address
            ),
            "province": getattr(
                order,
                "shipping_province",
                None,
            ),
            "district": getattr(
                order,
                "shipping_district",
                None,
            ),
            "ward": getattr(
                order,
                "shipping_ward",
                None,
            ),

            "paymentMethod": getattr(
                order,
                "payment_method",
                "Thanh toán khi nhận hàng",
            ),

            "note": getattr(
                order,
                "note",
                None,
            ),
        },

        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,

                "product_name": (
                    item.product_name
                    if getattr(
                        item,
                        "product_name",
                        None,
                    )
                    else item.product.name
                    if item.product
                    else "Sản phẩm"
                ),

                "name": (
                    item.product_name
                    if getattr(
                        item,
                        "product_name",
                        None,
                    )
                    else item.product.name
                    if item.product
                    else "Sản phẩm"
                ),

                "product_image": (
                    item.product_image
                    if getattr(
                        item,
                        "product_image",
                        None,
                    )
                    else item.product.image
                    if item.product
                    else None
                ),

                "image": (
                    item.product_image
                    if getattr(
                        item,
                        "product_image",
                        None,
                    )
                    else item.product.image
                    if item.product
                    else None
                ),

                "image_url": (
                    item.product_image
                    if getattr(
                        item,
                        "product_image",
                        None,
                    )
                    else item.product.image
                    if item.product
                    else None
                ),

                "product_category": (
                    item.product_category
                    if getattr(
                        item,
                        "product_category",
                        None,
                    )
                    else (
                        item.product.category.name
                        if (
                            item.product
                            and item.product.category
                        )
                        else "Khác"
                    )
                ),

                "category": (
                    item.product_category
                    if getattr(
                        item,
                        "product_category",
                        None,
                    )
                    else (
                        item.product.category.name
                        if (
                            item.product
                            and item.product.category
                        )
                        else "Khác"
                    )
                ),

                "quantity": item.quantity,
                "price": item.price,
                "subtotal": (
                    item.price
                    * item.quantity
                ),
            }
            for item in order.items
        ],
    }


# =========================
# SEED DATA
# =========================
def seed_data():
    db = SessionLocal()

    try:
        if db.query(Category).count() == 0:
            categories = [
                Category(name="Laptop"),
                Category(name="Phone"),
                Category(name="Accessory"),
            ]

            db.add_all(categories)
            db.commit()

        # Không tự tạo sản phẩm mẫu.
        # Admin xóa hết thì database thật sự còn 0.

    finally:
        db.close()


seed_data()


# =========================
# HOME
# =========================
@app.get("/")
def home():
    return {
        "message": (
            "ShopHub API is running "
            "with PostgreSQL"
        )
    }


# =========================
# AUTH API
# =========================
@app.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail="Email already registered",
        )

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(
            user.password
        ),
        role="CUSTOMER",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "fullName": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
    }


@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    if not verify_password(
        user.password,
        existing_user.hashed_password,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",

        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "fullName": existing_user.name,
            "email": existing_user.email,
            "role": existing_user.role,
        },
    }


@app.post("/login-form")
def login_form(
    form_data: OAuth2PasswordRequestForm = (
        Depends()
    ),
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(
            User.email
            == form_data.username
        )
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    if not verify_password(
        form_data.password,
        existing_user.hashed_password,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@app.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "fullName": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


# =========================
# CATEGORY API
# =========================
@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
):
    return db.query(Category).all()


@app.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    new_category = Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


# =========================
# PRODUCT API
# =========================
@app.get("/products")
def get_products(
    db: Session = Depends(get_db),
):
    products = db.query(Product).all()

    return [
        format_product(product)
        for product in products
    ]


@app.get("/products/{product_id}")
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Product not found",
        )

    return format_product(product)


@app.post(
    "/products",
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    category = (
        db.query(Category)
        .filter(
            Category.id
            == product.category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Category not found",
        )

    new_product = Product(
        name=product.name,
        price=product.price,
        image=product.image,
        description=product.description,
        stock=product.stock,
        category_id=product.category_id,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return format_product(new_product)


@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    existing_product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not existing_product:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Product not found",
        )

    update_data = product.model_dump(
        exclude_unset=True
    )

    if "category_id" in update_data:
        category = (
            db.query(Category)
            .filter(
                Category.id
                == update_data["category_id"]
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail="Category not found",
            )

    for key, value in update_data.items():
        setattr(
            existing_product,
            key,
            value,
        )

    db.commit()
    db.refresh(existing_product)

    return format_product(
        existing_product
    )


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {
        "message": (
            "Product deleted successfully"
        )
    }


# =========================
# UPLOAD IMAGE API
# =========================
@app.post("/upload-image")
def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(
        require_admin
    ),
):
    if (
        not file.content_type
        or not file.content_type.startswith(
            "image/"
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail="File phải là hình ảnh",
        )

    original_filename = file.filename or ""

    file_extension = (
        Path(original_filename)
        .suffix
        .lower()
    )

    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Chỉ hỗ trợ ảnh "
                "jpg, jpeg, png, webp"
            ),
        )

    new_filename = (
        f"{uuid.uuid4()}"
        f"{file_extension}"
    )

    file_path = (
        UPLOAD_DIR
        / new_filename
    )

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as error:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Không thể lưu hình ảnh: "
                f"{str(error)}"
            ),
        ) from error

    finally:
        file.file.close()

    base_url = (
        str(request.base_url)
        .rstrip("/")
    )

    image_url = (
        f"{base_url}"
        f"/uploads/{new_filename}"
    )

    return {
        "filename": new_filename,
        "image": image_url,
        "image_url": image_url,
    }


# =========================
# SHIPPING FEE
# =========================
def normalize_location(value: str | None) -> str:
    return (value or "").strip().lower()


def calculate_shipping_fee(
    province: str | None,
    district: str | None,
) -> int:
    """
    Tính phí giao hàng cho shipper nội bộ của shop.

    - Nội thành TP.HCM: 50.000đ
    - Ngoại thành TP.HCM: 70.000đ
    - Tỉnh lân cận: 100.000đ
    - Miền Nam: 120.000đ
    - Miền Trung: 150.000đ
    - Khu vực còn lại: 180.000đ
    """
    normalized_province = normalize_location(
        province
    )
    normalized_district = normalize_location(
        district
    )

    ho_chi_minh_names = {
        "tp. hồ chí minh",
        "tp hồ chí minh",
        "thành phố hồ chí minh",
        "hồ chí minh",
        "tphcm",
    }

    inner_city_districts = {
        "quận 1",
        "quận 3",
        "quận 4",
        "quận 5",
        "quận 6",
        "quận 7",
        "quận 8",
        "quận 10",
        "quận 11",
        "quận 12",
        "quận bình thạnh",
        "quận gò vấp",
        "quận phú nhuận",
        "quận tân bình",
        "quận tân phú",
        "quận bình tân",
        "thành phố thủ đức",
        "tp thủ đức",
    }

    if normalized_province in ho_chi_minh_names:
        if normalized_district in inner_city_districts:
            return 50000
        return 70000

    nearby_provinces = {
        "bình dương",
        "đồng nai",
        "long an",
        "tây ninh",
        "bà rịa - vũng tàu",
        "bà rịa vũng tàu",
    }

    if normalized_province in nearby_provinces:
        return 100000

    southern_provinces = {
        "tiền giang",
        "bến tre",
        "vĩnh long",
        "cần thơ",
        "đồng tháp",
        "an giang",
        "kiên giang",
        "sóc trăng",
        "bạc liêu",
        "cà mau",
        "trà vinh",
        "hậu giang",
        "bình phước",
    }

    if normalized_province in southern_provinces:
        return 120000

    central_provinces = {
        "đà nẵng",
        "huế",
        "thừa thiên huế",
        "quảng trị",
        "quảng bình",
        "quảng nam",
        "quảng ngãi",
        "bình định",
        "phú yên",
        "khánh hòa",
        "ninh thuận",
        "bình thuận",
        "nghệ an",
        "hà tĩnh",
        "thanh hóa",
    }

    if normalized_province in central_provinces:
        return 150000

    return 180000


@app.get("/shipping-fee")
def preview_shipping_fee(
    province: str = Query(...),
    district: str = Query(...),
):
    shipping_fee = calculate_shipping_fee(
        province,
        district,
    )

    return {
        "province": province,
        "district": district,
        "shipping_fee": shipping_fee,
    }


# =========================
# ORDER API
# =========================
@app.post(
    "/orders",
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    if (
        not order_data.items
        or len(order_data.items) == 0
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail="Cart is empty",
        )

    user = None

    if order_data.user_id:
        user = (
            db.query(User)
            .filter(
                User.id
                == order_data.user_id
            )
            .first()
        )

    if (
        not user
        and order_data.user_email
    ):
        user = (
            db.query(User)
            .filter(
                User.email
                == order_data.user_email
            )
            .first()
        )

    new_order = Order(
        user_id=(
            user.id
            if user
            else order_data.user_id
        ),

        user_email=(
            order_data.user_email
            if order_data.user_email
            else user.email
            if user
            else None
        ),

        product_total=0,
        shipping_fee=0,
        total_price=0,
        status="Đang xử lý",

        shipping_name=(
            order_data.shipping_name
        ),

        shipping_phone=(
            order_data.shipping_phone
        ),

        shipping_address=(
            order_data.shipping_address
        ),

        shipping_province=(
            order_data.shipping_province
        ),

        shipping_district=(
            order_data.shipping_district
        ),

        shipping_ward=(
            order_data.shipping_ward
        ),

        payment_method=(
            order_data.payment_method
        ),

        payment_status="PENDING",

        note=order_data.note,
    )

    try:
        db.add(new_order)
        db.flush()

        product_total = 0

        for item in order_data.items:
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                    detail=(
                        "Quantity must be "
                        "greater than 0"
                    ),
                )

            product = None

            if item.product_id:
                product = (
                    db.query(Product)
                    .filter(
                        Product.id
                        == item.product_id
                    )
                    .first()
                )

            if product:
                product_id = product.id
                product_name = product.name
                product_image = product.image

                product_category = (
                    product.category.name
                    if product.category
                    else "Khác"
                )

                price = product.price

                if product.stock is not None:
                    if (
                        product.stock
                        < item.quantity
                    ):
                        raise HTTPException(
                            status_code=(
                                status
                                .HTTP_400_BAD_REQUEST
                            ),
                            detail=(
                                "Not enough stock "
                                f"for {product.name}"
                            ),
                        )

                    product.stock -= (
                        item.quantity
                    )

            else:
                product_id = None

                product_name = (
                    item.product_name
                    or "Sản phẩm"
                )

                product_image = (
                    item.product_image
                )

                product_category = (
                    item.product_category
                    or "Khác"
                )

                price = item.price or 0

            product_total += (
                price
                * item.quantity
            )

            new_order_item = OrderItem(
                order_id=new_order.id,
                product_id=product_id,
                quantity=item.quantity,
                price=price,
                product_name=product_name,
                product_image=product_image,
                product_category=(
                    product_category
                ),
            )

            db.add(new_order_item)

        shipping_fee = calculate_shipping_fee(
            order_data.shipping_province,
            order_data.shipping_district,
        )

        new_order.product_total = (
            product_total
        )
        new_order.shipping_fee = (
            shipping_fee
        )
        new_order.total_price = (
            product_total + shipping_fee
        )

        db.commit()
        db.refresh(new_order)

        return format_order(new_order)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Không thể tạo đơn hàng: "
                f"{str(error)}"
            ),
        ) from error


@app.get("/orders")
def get_orders(
    user_email: str | None = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Order)
        .order_by(
            Order.created_at.desc()
        )
    )

    if user_email:
        query = query.filter(
            Order.user_email
            == user_email
        )

    orders = query.all()

    return [
        format_order(order)
        for order in orders
    ]


@app.get("/orders/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    orders = (
        db.query(Order)
        .filter(
            Order.user_id
            == current_user.id
        )
        .order_by(
            Order.created_at.desc()
        )
        .all()
    )

    return [
        format_order(order)
        for order in orders
    ]


@app.get("/orders/{order_id}")
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Order not found",
        )

    return format_order(order)


# =========================
# UPDATE ORDER STATUS
# HỦY ĐƠN SẼ HOÀN TỒN KHO
# =========================
@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Order not found",
        )

    new_status = status_data.get(
        "status"
    )

    allowed_statuses = [
        "Đang xử lý",
        "Đang giao",
        "Hoàn thành",
        "Đã hủy",
    ]

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail="Invalid order status",
        )

    old_status = order.status

    # Không thay đổi gì nếu trạng thái giống nhau
    if old_status == new_status:
        return format_order(order)

    try:
        # =================================
        # CHUYỂN ĐƠN SANG "ĐÃ HỦY"
        # CỘNG LẠI SỐ LƯỢNG SẢN PHẨM
        # =================================
        if (
            new_status == "Đã hủy"
            and old_status != "Đã hủy"
        ):
            for item in order.items:
                product = item.product

                if (
                    product is not None
                    and product.stock is not None
                ):
                    product.stock += (
                        item.quantity
                    )

        # =================================
        # KHÔI PHỤC ĐƠN ĐÃ HỦY
        # TRỪ LẠI TỒN KHO
        # =================================
        elif (
            old_status == "Đã hủy"
            and new_status != "Đã hủy"
        ):
            # Kiểm tra tất cả sản phẩm trước
            for item in order.items:
                product = item.product

                if product is None:
                    continue

                if product.stock is None:
                    continue

                if (
                    product.stock
                    < item.quantity
                ):
                    raise HTTPException(
                        status_code=(
                            status
                            .HTTP_400_BAD_REQUEST
                        ),
                        detail=(
                            "Không đủ tồn kho để "
                            "khôi phục đơn hàng. "
                            f"Sản phẩm: "
                            f"{product.name}"
                        ),
                    )

            # Đủ hàng mới bắt đầu trừ
            for item in order.items:
                product = item.product

                if (
                    product is not None
                    and product.stock is not None
                ):
                    product.stock -= (
                        item.quantity
                    )

        order.status = new_status

        db.commit()
        db.refresh(order)

        return format_order(order)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Không thể cập nhật "
                f"trạng thái đơn hàng: {error}"
            ),
        ) from error



# =========================
# ANALYTICS / TRAFFIC API
# =========================
@app.post(
    "/analytics/visit",
    status_code=status.HTTP_201_CREATED,
)
def record_website_visit(
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
):
    session_id = str(payload.get("session_id") or "").strip()
    page_path = str(payload.get("page_path") or "/").strip()
    user_id = payload.get("user_id")

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id is required",
        )

    # Mỗi session chỉ được tính một WEBSITE_VISIT.
    existing_visit = (
        db.query(VisitLog)
        .filter(
            VisitLog.event_type == "WEBSITE_VISIT",
            VisitLog.session_id == session_id,
        )
        .first()
    )

    if existing_visit:
        return {
            "message": "Visit already recorded",
            "counted": False,
        }

    visit = VisitLog(
        event_type="WEBSITE_VISIT",
        user_id=user_id,
        session_id=session_id,
        page_path=page_path,
        ip_address=(
            request.client.host
            if request.client
            else None
        ),
        user_agent=request.headers.get("user-agent"),
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)

    return {
        "message": "Website visit recorded",
        "counted": True,
        "id": visit.id,
    }


@app.post(
    "/analytics/order-view/{order_id}",
    status_code=status.HTTP_201_CREATED,
)
def record_order_view(
    order_id: int,
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    session_id = str(payload.get("session_id") or "").strip() or None
    user_id = payload.get("user_id")
    page_path = str(
        payload.get("page_path")
        or f"/orders/{order_id}"
    ).strip()

    view = VisitLog(
        event_type="ORDER_VIEW",
        user_id=user_id,
        order_id=order_id,
        session_id=session_id,
        page_path=page_path,
        ip_address=(
            request.client.host
            if request.client
            else None
        ),
        user_agent=request.headers.get("user-agent"),
    )

    db.add(view)
    db.commit()
    db.refresh(view)

    return {
        "message": "Order view recorded",
        "counted": True,
        "id": view.id,
    }


@app.get("/dashboard/traffic")
def get_traffic_statistics(
    group_by: Literal[
        "day",
        "month",
        "year",
    ] = Query(default="day"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if group_by == "day":
        period_expression = func.to_char(
            VisitLog.created_at,
            "YYYY-MM-DD",
        )
    elif group_by == "year":
        period_expression = func.to_char(
            VisitLog.created_at,
            "YYYY",
        )
    else:
        period_expression = func.to_char(
            VisitLog.created_at,
            "YYYY-MM",
        )

    rows = (
        db.query(
            period_expression.label("period"),
            func.sum(
                case(
                    (VisitLog.event_type == "WEBSITE_VISIT", 1),
                    else_=0,
                )
            ).label("website_visits"),
            func.sum(
                case(
                    (VisitLog.event_type == "ORDER_VIEW", 1),
                    else_=0,
                )
            ).label("order_views"),
        )
        .group_by(period_expression)
        .order_by(period_expression.desc())
        .all()
    )

    return [
        {
            "period": row.period,
            "website_visits": int(row.website_visits or 0),
            "order_views": int(row.order_views or 0),
        }
        for row in rows
    ]

# =========================
# DASHBOARD API
# =========================
@app.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_users = db.query(User).count()
    total_website_visits = (
        db.query(VisitLog)
        .filter(VisitLog.event_type == "WEBSITE_VISIT")
        .count()
    )
    total_order_views = (
        db.query(VisitLog)
        .filter(VisitLog.event_type == "ORDER_VIEW")
        .count()
    )
    today_start = datetime.now(timezone.utc).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )
    visits_today = (
        db.query(VisitLog)
        .filter(
            VisitLog.event_type == "WEBSITE_VISIT",
            VisitLog.created_at >= today_start,
        )
        .count()
    )

    # Doanh thu chỉ tính tiền sản phẩm.
    product_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.product_total),
                0,
            )
        )
        .filter(
            Order.payment_status == "PAID",
            Order.status != "Đã hủy",
        )
        .scalar()
    )

    # Tiền vận chuyển được thống kê riêng.
    shipping_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.shipping_fee),
                0,
            )
        )
        .filter(
            Order.payment_status == "PAID",
            Order.status != "Đã hủy",
        )
        .scalar()
    )

    total_collected = (
        int(product_revenue or 0)
        + int(shipping_revenue or 0)
    )

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_website_visits": total_website_visits,
        "visits_today": visits_today,
        "total_order_views": total_order_views,
        "total_revenue": int(
            product_revenue or 0
        ),
        "product_revenue": int(
            product_revenue or 0
        ),
        "shipping_revenue": int(
            shipping_revenue or 0
        ),
        "total_collected": total_collected,
    }


@app.get("/dashboard/revenue")
def get_revenue(
    group_by: Literal[
        "day",
        "month",
        "year",
    ] = Query(default="month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    """
    group_by=day   -> doanh thu theo ngày
    group_by=month -> doanh thu theo tháng
    group_by=year  -> doanh thu theo năm
    """

    if group_by == "day":
        period_expression = func.to_char(
            Order.created_at,
            "YYYY-MM-DD",
        )
    elif group_by == "year":
        period_expression = func.to_char(
            Order.created_at,
            "YYYY",
        )
    else:
        period_expression = func.to_char(
            Order.created_at,
            "YYYY-MM",
        )

    results = (
        db.query(
            period_expression.label(
                "period"
            ),
            func.coalesce(
                func.sum(Order.product_total),
                0,
            ).label("revenue"),
            func.coalesce(
                func.sum(Order.shipping_fee),
                0,
            ).label("shipping_fee"),
        )
        .filter(
            Order.payment_status == "PAID",
            Order.status != "Đã hủy",
        )
        .group_by(period_expression)
        .order_by(period_expression.desc())
        .all()
    )

    return [
        {
            "period": row.period,
            "revenue": int(
                row.revenue or 0
            ),
            "shipping_fee": int(
                row.shipping_fee or 0
            ),
            "total_collected": (
                int(row.revenue or 0)
                + int(row.shipping_fee or 0)
            ),
        }
        for row in results
    ]


# Giữ lại API cũ để frontend cũ vẫn chạy được
@app.get("/dashboard/monthly-revenue")
def get_monthly_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):
    month_expression = func.to_char(
        Order.created_at,
        "YYYY-MM",
    )

    results = (
        db.query(
            month_expression.label(
                "month"
            ),
            func.coalesce(
                func.sum(Order.product_total),
                0,
            ).label("revenue"),
            func.coalesce(
                func.sum(Order.shipping_fee),
                0,
            ).label("shipping_fee"),
        )
        .filter(
            Order.payment_status == "PAID",
            Order.status != "Đã hủy",
        )
        .group_by(month_expression)
        .order_by(month_expression.desc())
        .all()
    )

    return [
        {
            "month": row.month,
            "revenue": int(
                row.revenue or 0
            ),
            "shipping_fee": int(
                row.shipping_fee or 0
            ),
            "total_collected": (
                int(row.revenue or 0)
                + int(row.shipping_fee or 0)
            ),
        }
        for row in results
    ]