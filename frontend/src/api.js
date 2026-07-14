import axios from "axios";

const api = axios.create({
  baseURL:
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000",
  timeout: 10000,
});

// Tự động gắn token vào mỗi request nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi chung từ backend
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Chưa đăng nhập hoặc token hết hạn.");
    }

    if (error.response?.status === 403) {
      console.error("Không có quyền truy cập chức năng này.");
    }

    return Promise.reject(error);
  }
);

export default api;