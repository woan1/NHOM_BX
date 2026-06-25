from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .auth_schemas import UserLogin, UserRegister
from .db import Base, SessionLocal, engine, get_db
from .orm_models import Category, Product, User, Order, OrderItem
from .product_schemas import CategoryCreate, ProductCreate, ProductUpdate
from .order_schemas import OrderCreate


Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopHub API", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = "shophub_secret_key_demo_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

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
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


def format_product(product: Product):
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "description": product.description,
        "stock": product.stock,
        "category_id": product.category_id,
        "category": product.category.name if product.category else None,
    }

def format_order(order: Order):
    return {
        "id": order.id,
        "user_id": order.user_id,
        "customer_name": order.user.name if order.user else None,
        "total_price": order.total_price,
        "status": order.status,
        "shipping_name": order.shipping_name,
        "shipping_phone": order.shipping_phone,
        "shipping_address": order.shipping_address,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "image": item.product.image if item.product else None,
                "quantity": item.quantity,
                "price": item.price,
                "subtotal": item.price * item.quantity,
            }
            for item in order.items
        ],
    }

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

        if db.query(Product).count() == 0:
            laptop_category = db.query(Category).filter(Category.name == "Laptop").first()
            phone_category = db.query(Category).filter(Category.name == "Phone").first()
            accessory_category = db.query(Category).filter(Category.name == "Accessory").first()

            products = [
                Product(
                    name="Laptop Dell",
                    price=15000000,
                    image="https://dummyimage.com/300x200/eeeeee/000000&text=Laptop+Dell",
                    description="Laptop Dell phù hợp học tập và làm việc.",
                    stock=10,
                    category_id=laptop_category.id,
                ),
                Product(
                    name="iPhone 15",
                    price=22000000,
                    image="https://dummyimage.com/300x200/eeeeee/000000&text=iPhone+15",
                    description="Điện thoại iPhone 15 chính hãng.",
                    stock=8,
                    category_id=phone_category.id,
                ),
                Product(
                    name="Tai nghe Bluetooth",
                    price=800000,
                    image="https://dummyimage.com/300x200/eeeeee/000000&text=Tai+nghe",
                    description="Tai nghe Bluetooth nhỏ gọn, tiện lợi.",
                    stock=20,
                    category_id=accessory_category.id,
                ),
            ]

            db.add_all(products)
            db.commit()

    finally:
        db.close()


seed_data()


@app.get("/")
def home():
    return {"message": "ShopHub API is running with PostgreSQL"}


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="CUSTOMER",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
    }


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(user.password, existing_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
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
            "email": existing_user.email,
            "role": existing_user.role,
        },
    }


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    new_category = Category(name=category.name)

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [format_product(product) for product in products]


@app.get("/products/{product_id}")
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return format_product(product)


@app.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    category = db.query(Category).filter(Category.id == product.category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
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
    current_user: User = Depends(require_admin),
):
    existing_product = db.query(Product).filter(Product.id == product_id).first()

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = product.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        category = db.query(Category).filter(Category.id == update_data["category_id"]).first()

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    for key, value in update_data.items():
        setattr(existing_product, key, value)

    db.commit()
    db.refresh(existing_product)

    return format_product(existing_product)


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}

@app.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(order_data.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    total_price = 0
    order_items_data = []

    for item in order_data.items:
        if item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than 0",
            )

        product = db.query(Product).filter(Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.name}",
            )

        total_price += product.price * item.quantity
        order_items_data.append((product, item.quantity))

    new_order = Order(
        user_id=current_user.id,
        total_price=total_price,
        status="PENDING",
        shipping_name=order_data.shipping_name,
        shipping_phone=order_data.shipping_phone,
        shipping_address=order_data.shipping_address,
    )

    db.add(new_order)
    db.flush()

    for product, quantity in order_items_data:
        product.stock -= quantity

        new_order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=quantity,
            price=product.price,
        )

        db.add(new_order_item)

    db.commit()
    db.refresh(new_order)

    return format_order(new_order)


@app.get("/orders/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [format_order(order) for order in orders]


@app.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [format_order(order) for order in orders]