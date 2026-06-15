-- 1. Bang luu tru cac dich vu xay dung (Thiet ke, Thi cong, Giam sat...)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_range VARCHAR(100)
);

-- 2. Bang luu tru cac du an / cong trinh da thi cong
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    category VARCHAR(100), -- Biet thu, Nha pho, Van phong...
    image_url VARCHAR(500),
    description TEXT
);

-- 3. Bang luu tru tai khoan Admin de dang nhap he thong
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);

