import os
import sys

import httpx
from dotenv import load_dotenv


load_dotenv()

CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com",
)


def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print("LỖI: Chưa có PAYPAL_CLIENT_ID hoặc PAYPAL_CLIENT_SECRET trong .env")
        sys.exit(1)

    try:
        response = httpx.post(
            f"{BASE_URL}/v1/oauth2/token",
            auth=(CLIENT_ID, CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
            headers={
                "Accept": "application/json",
                "Accept-Language": "en_US",
            },
            timeout=30.0,
        )

        if response.status_code == 200:
            data = response.json()

            print("KẾT NỐI PAYPAL SANDBOX THÀNH CÔNG")
            print("Token type:", data.get("token_type"))
            print("Expires in:", data.get("expires_in"), "giây")
            print("Access token đã được tạo, không hiển thị để bảo mật.")
        else:
            print("KẾT NỐI THẤT BẠI")
            print("Status code:", response.status_code)
            print("Response:", response.text)

    except httpx.RequestError as error:
        print("Không thể kết nối tới PayPal Sandbox:")
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()