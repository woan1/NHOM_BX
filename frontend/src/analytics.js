import api from "./api";

const SESSION_ID_KEY =
  "shophub_analytics_session_id";

const VISIT_RECORDED_KEY =
  "shophub_visit_recorded";

function createSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}`;
}

export function getAnalyticsSessionId() {
  let sessionId = sessionStorage.getItem(
    SESSION_ID_KEY
  );

  if (!sessionId) {
    sessionId = createSessionId();

    sessionStorage.setItem(
      SESSION_ID_KEY,
      sessionId
    );
  }

  return sessionId;
}

function getCurrentUserId() {
  try {
    const storedUser =
      localStorage.getItem("currentUser") ||
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);

    return user?.id || null;
  } catch (error) {
    console.error(
      "Không thể đọc thông tin người dùng:",
      error
    );

    return null;
  }
}

export async function recordWebsiteVisit() {
  const alreadyRecorded =
    sessionStorage.getItem(
      VISIT_RECORDED_KEY
    );

  if (alreadyRecorded) {
    return;
  }

  try {
    await api.post(
      "/analytics/visit",
      {
        session_id:
          getAnalyticsSessionId(),

        user_id:
          getCurrentUserId(),

        page_path:
          window.location.pathname,
      }
    );

    sessionStorage.setItem(
      VISIT_RECORDED_KEY,
      "true"
    );
  } catch (error) {
    console.error(
      "Không thể ghi nhận lượt truy cập:",
      error
    );
  }
}

export async function recordProductView(
  productId
) {
  if (!productId) {
    return;
  }

  try {
    await api.post(
      `/analytics/product-view/${productId}`,
      {
        session_id:
          getAnalyticsSessionId(),

        user_id:
          getCurrentUserId(),

        page_path:
          window.location.pathname,
      }
    );
  } catch (error) {
    console.error(
      "Không thể ghi nhận lượt xem sản phẩm:",
      error
    );
  }
}

export async function recordOrderView(
  orderId
) {
  if (!orderId) {
    return;
  }

  try {
    await api.post(
      `/analytics/order-view/${orderId}`,
      {
        session_id:
          getAnalyticsSessionId(),

        user_id:
          getCurrentUserId(),

        page_path:
          window.location.pathname,
      }
    );
  } catch (error) {
    console.error(
      "Không thể ghi nhận lượt xem đơn hàng:",
      error
    );
  }
}