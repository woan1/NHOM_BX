import axios from "axios";

const api = axios.create({
  baseURL: "https://nhombx-production.up.railway.app",
  timeout: 10000,
});

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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Chưa đăng nhập hoặc token hết hạn.");
    }

    if (error.response?.status === 403) {
      console.error("Không có quyền truy cập chức năng này.");
    }

    console.error("Lỗi API:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default api;