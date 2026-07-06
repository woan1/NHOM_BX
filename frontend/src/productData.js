const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Laptop Dell Inspiron 15 3530",
    category: "Laptop",
    price: 15990000,
    image: "/images/laptop-dell.jpg",
    description: "Laptop học tập, văn phòng, cấu hình ổn định.",
    detail:
      "Laptop Dell Inspiron 15 3530 phù hợp cho sinh viên, nhân viên văn phòng và người dùng cần một chiếc laptop ổn định để học tập, làm việc, giải trí cơ bản.",
    brand: "Dell",
    stock: 12,
  },
  {
    id: 2,
    name: "iPhone 15 128GB",
    category: "Phone",
    price: 22990000,
    image: "/images/iphone-15.jpg",
    description: "Điện thoại Apple, thiết kế hiện đại, hiệu năng mạnh.",
    detail:
      "iPhone 15 128GB sở hữu thiết kế sang trọng, camera chất lượng cao, hiệu năng mạnh mẽ và phù hợp cho người dùng yêu thích hệ sinh thái Apple.",
    brand: "Apple",
    stock: 8,
  },
  {
    id: 3,
    name: "Tai nghe Bluetooth Sony WH-CH520",
    category: "Accessory",
    price: 1290000,
    image: "/images/sony-headphone.jpg",
    description: "Tai nghe không dây, âm thanh tốt, pin lâu.",
    detail:
      "Tai nghe Bluetooth Sony WH-CH520 có thiết kế gọn nhẹ, thời lượng pin tốt, chất âm ổn định, phù hợp học online, nghe nhạc và làm việc.",
    brand: "Sony",
    stock: 20,
  },
  {
    id: 4,
    name: "Smart Watch Xiaomi Redmi Watch 3",
    category: "Accessory",
    price: 1690000,
    image: "/images/xiaomi-watch.jpg",
    description: "Đồng hồ thông minh theo dõi sức khỏe, thể thao.",
    detail:
      "Smart Watch Xiaomi Redmi Watch 3 hỗ trợ theo dõi sức khỏe, luyện tập thể thao, hiển thị thông báo và có thời lượng pin tốt.",
    brand: "Xiaomi",
    stock: 15,
  },
  {
    id: 5,
    name: "MacBook Air M1",
    category: "Laptop",
    price: 18990000,
    image: "/images/macbook-air-m1.jpg",
    description: "Laptop mỏng nhẹ, pin tốt, phù hợp sinh viên và văn phòng.",
    detail:
      "MacBook Air M1 nổi bật với thiết kế mỏng nhẹ, hiệu năng ổn định, pin lâu, phù hợp cho học tập, văn phòng, thiết kế cơ bản và lập trình.",
    brand: "Apple",
    stock: 6,
  },
  {
    id: 6,
    name: "Samsung Galaxy S24",
    category: "Phone",
    price: 19990000,
    image: "/images/samsung-s24.jpg",
    description: "Điện thoại Samsung cao cấp, màn hình đẹp, camera tốt.",
    detail:
      "Samsung Galaxy S24 có màn hình sắc nét, camera tốt, hiệu năng mạnh, phù hợp cho người dùng cần điện thoại Android cao cấp.",
    brand: "Samsung",
    stock: 10,
  },
];

export function getProducts() {
  const savedProducts = localStorage.getItem("products");

  if (!savedProducts) {
    localStorage.setItem("products", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  return JSON.parse(savedProducts);
}

export function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

export function resetProducts() {
  localStorage.setItem("products", JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}