from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .auth_schemas import UserLogin, UserRegister
from .db import Base, SessionLocal, engine, get_db
from .orm_models import Category, Product, User
from .product_schemas import CategoryCreate, ProductCreate, ProductUpdate


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


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
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
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
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
):
    existing_product = db.query(Product).filter(Product.id == product_id).first()

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = product.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_product, key, value)

    db.commit()
    db.refresh(existing_product)

    return format_product(existing_product)


@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}