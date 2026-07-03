# Dự Án Nhóm - NHOM_BX

## 👥 Thông Tin Thành Viên
* **Thành viên 1 (Trưởng nhóm):** Nguyễn Thanh Quan - MSSV: 2200007066 (Vai trò: Fullstack / Quản lý chung)
* **Thành viên 2:** Võ Tấn Phát - MSSV: 2200007239
* **Thành viên 3:** Đặng Nguyễn Hữu Trí - MSSV: 2200008152
* **Thành viên 4:** Nguyễn Lê Gia Bảo - MSSV: 2200006147
* **Thành viên 5:** Trần Tuấn Anh - MSSV:2200004293
---

## 📅 Nhật Ký Nội Dung Từng Buổi (Sessions Log)

### 🔹 Session 01 (Ngày 12/06/2026)
* **Nội dung:** 
Giới thiệu tổng quan về khóa học và đề tài hệ thống thương mại điện tử **ShopHub**. Xem demo các tính năng chính: Login, Product List, Product Detail, Shopping Cart, Checkout (Place Order), Admin Dashboard và định hướng Deployed Online.
Tìm hiểu về kiến trúc Full-Stack (Full-Stack Architecture) của dự án.
* **Kết quả đạt được:** 
Nắm rõ mục tiêu dự án: Phát triển từ một trang trắng thành một website thương mại điện tử ShopHub hoàn chỉnh.
Thống nhất mô hình kiến trúc hệ thống bao gồm:
Frontend:** Browser sử dụng framework **React**.
Backend:** Server sử dụng **FastAPI**, kết nối qua giao thức **HTTP**.
Database:** Hệ quản trị cơ sở dữ liệu **PostgreSQL**, tương tác bằng ngôn ngữ **SQL**.
      
### 🔹 Session 02 (Ngày 12/06/2026)
* **Nội dung:** ...
Tìm hiểu các kiến thức cơ bản của React và ES6.
Học cách sử dụng let, const, Arrow Functions và Destructuring.
Tìm hiểu JSX để xây dựng giao diện.
Tạo và sử dụng các React Components.
Truyền dữ liệu giữa các Component bằng Props.
Quản lý dữ liệu bằng State.
Thiết kế trang Home Page gồm:
Header
Banner
Footer
* **Kết quả đạt được:** 
Nắm được các kiến thức cơ bản của React và ES6.
Biết cách tạo và tổ chức giao diện theo mô hình Component.
Hiểu cách sử dụng Props và State trong React.
Xây dựng thành công một Landing Page đơn giản với giao diện hoàn chỉnh gồm Header, Banner và Footer.
Tạo được nền tảng để phát triển các trang web React phức tạp hơn trong các buổi học tiếp theo.

### 🔹 Session 03 (Ngày 15/06/2026)
* **Nội dung:**
Tìm hiểu về tư duy Component Reusability (tái sử dụng component) để tối ưu hóa mã nguồn.
Đi sâu vào kỹ thuật Array Mapping để xử lý hiển thị danh sách từ tập dữ liệu.
Sử dụng các React Hooks nâng cao bao gồm useState để quản lý trạng thái và useEffect để xử lý các side-effects (như gọi API hoặc tải dữ liệu ban đầu).
Thực hành tạo cấu trúc Product Catalog với hai thành phần chính:
ProductCard: Component hiển thị thông tin chi tiết của một sản phẩm đơn lẻ.
ProductList: Component quản lý tập hợp và render danh sách sản phẩm.
Kết nối và hiển thị dữ liệu thực tế từ hệ thống Backend (thông qua API) hoặc dữ liệu mẫu (products.json).
* **Kết quả đạt được:**
Hiểu rõ cách tách biệt và tái sử dụng các component nhỏ trong giao diện.
Nắm vững kỹ thuật map dữ liệu từ mảng sang giao diện một cách tự động và linh hoạt.
Biết cách vận hành luồng dữ liệu từ Backend về Frontend bằng useEffect và quản lý trạng thái động với useState.
Hoàn thiện Product Catalog chuyên nghiệp với các thẻ sản phẩm (Card) được hiển thị đồng nhất, sẵn sàng cho việc tích hợp tính năng giỏ hàng và đặt hàng.

### 🔹 Session 04 (Ngày 19/06/2026)
* **Nội dung:**
Trong Session 4, nhóm tiến hành xây dựng chức năng tìm kiếm, lọc và sắp xếp sản phẩm cho trang danh mục sản phẩm của hệ thống ShopHub. Nội dung chính bao gồm quản lý trạng thái trong React bằng useState, gọi dữ liệu sản phẩm từ API bằng Axios và xử lý danh sách sản phẩm trên giao diện.
Cụ thể, nhóm đã tạo giao diện hiển thị danh sách sản phẩm, bổ sung ô tìm kiếm để người dùng có thể tìm sản phẩm theo tên. Ngoài ra, hệ thống còn có chức năng lọc sản phẩm theo danh mục như Laptop, Điện thoại, Phụ kiện và chức năng sắp xếp sản phẩm theo giá tăng dần hoặc giảm dần.
Bên cạnh đó, nhóm sử dụng CSS để thiết kế bố cục giao diện sản phẩm, giúp các sản phẩm được hiển thị rõ ràng theo dạng lưới. Các chức năng tìm kiếm, lọc và sắp xếp được xử lý trực tiếp trên frontend, giúp người dùng thao tác dễ dàng và nhanh chóng hơn.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 4, hệ thống đã có trang danh mục sản phẩm tương tác. Người dùng có thể nhập từ khóa vào ô tìm kiếm để tìm sản phẩm mong muốn. Khi chọn danh mục, hệ thống chỉ hiển thị những sản phẩm thuộc danh mục đó. Ngoài ra, người dùng có thể sắp xếp sản phẩm theo giá từ thấp đến cao hoặc từ cao xuống thấp.
Giao diện catalog hoạt động ổn định, dữ liệu sản phẩm được lấy từ API và hiển thị đúng trên frontend. Các trạng thái như từ khóa tìm kiếm, danh mục được chọn và kiểu sắp xếp được quản lý bằng React Hooks. Điều này giúp ứng dụng trở nên linh hoạt hơn và tạo nền tảng để phát triển các chức năng nâng cao ở những session tiếp theo.

### 🔹 Session 05 (Ngày 22/06/2026)
* **Nội dung:**
Trong session này, nhóm tiến hành xây dựng ứng dụng web nhiều trang cho hệ thống ShopHub bằng React Router. Thay vì chỉ hiển thị một trang duy nhất, hệ thống được tổ chức thành nhiều trang khác nhau để người dùng có thể điều hướng dễ dàng hơn.
Nhóm đã cài đặt và cấu hình react-router-dom trong frontend. Sau đó, nhóm xây dựng các route chính cho hệ thống, bao gồm trang chủ, trang danh sách sản phẩm, trang chi tiết sản phẩm, trang giỏ hàng, trang đăng nhập và trang quản trị sản phẩm. Thanh điều hướng được bổ sung để người dùng có thể chuyển đổi giữa các trang một cách thuận tiện.
Ngoài ra, nhóm cũng tạo trang chi tiết sản phẩm sử dụng tham số động trên URL. Khi người dùng chọn một sản phẩm, hệ thống sẽ chuyển đến trang chi tiết tương ứng dựa trên mã sản phẩm. Điều này giúp giao diện web trở nên rõ ràng, có cấu trúc và gần giống với một website thương mại điện tử thực tế.
* **Kết quả đạt được:**
Sau khi hoàn thành session này, hệ thống ShopHub đã có cấu trúc nhiều trang cơ bản. Người dùng có thể truy cập trang chủ, xem danh sách sản phẩm, xem chi tiết từng sản phẩm, vào giỏ hàng, đăng nhập và truy cập trang quản trị.
Ứng dụng đã sử dụng React Router để quản lý đường dẫn và điều hướng giữa các trang mà không cần tải lại toàn bộ website. Trang chi tiết sản phẩm hoạt động với URL động, giúp mỗi sản phẩm có một trang riêng để hiển thị thông tin chi tiết.
Kết quả của session này là nền tảng quan trọng để phát triển các chức năng tiếp theo như quản lý sản phẩm, đăng nhập, phân quyền, giỏ hàng và thanh toán.

### 🔹 Session 06 (Ngày 26/06/2026)
* **Nội dung:**
Trong Session 6, nhóm tiến hành xây dựng API backend đầu tiên cho hệ thống ShopHub bằng FastAPI. Nội dung chính bao gồm tìm hiểu về FastAPI, RESTful API và các phương thức xử lý dữ liệu như GET, POST, PUT, DELETE.
Cụ thể, nhóm đã xây dựng các API quản lý sản phẩm gồm: lấy danh sách sản phẩm, xem chi tiết sản phẩm theo ID, thêm sản phẩm mới, cập nhật thông tin sản phẩm và xóa sản phẩm. Ngoài ra, nhóm sử dụng Swagger UI để kiểm tra và tài liệu hóa các API đã tạo.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 6, hệ thống đã có backend API cơ bản cho chức năng quản lý sản phẩm. Các API như GET /products, GET /products/{id}, POST /products, PUT /products/{id} và DELETE /products/{id} đã hoạt động đúng chức năng.
API được chạy thành công trên FastAPI và có thể kiểm tra trực tiếp thông qua Swagger tại đường dẫn /docs. Kết quả này giúp hệ thống ShopHub có nền tảng backend để kết nối với frontend React trong các session tiếp theo.

### 🔹 Session 07 (Ngày 29/06/2026)
* **Nội dung:**
Trong Session 7, nhóm tiến hành tích hợp frontend React với backend FastAPI để thay thế dữ liệu mẫu bằng dữ liệu thật từ API. Nội dung chính gồm tìm hiểu Axios, HTTP Request và cách xử lý dữ liệu bất đồng bộ bằng async/await.
Cụ thể, nhóm sử dụng Axios để gọi API GET /products nhằm lấy danh sách sản phẩm từ backend và hiển thị lên giao diện trang sản phẩm. Ngoài ra, nhóm cũng triển khai API GET /products/{id} để lấy thông tin chi tiết của từng sản phẩm theo ID. Việc tích hợp này giúp frontend không còn phụ thuộc vào dữ liệu mock mà có thể lấy dữ liệu trực tiếp từ server.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 7, frontend đã kết nối thành công với backend API. Danh sách sản phẩm được hiển thị từ dữ liệu thật thông qua API GET /products, đồng thời trang chi tiết sản phẩm cũng lấy đúng thông tin theo từng ID bằng API GET /products/{id}.
Kết quả này giúp hệ thống ShopHub hoàn thiện bước kết nối giữa giao diện người dùng và máy chủ. Đây là nền tảng quan trọng để phát triển các chức năng tiếp theo như quản lý sản phẩm, thêm sửa xóa dữ liệu, đăng nhập, phân quyền và xử lý giỏ hàng.

### 🔹 Session 08 (Ngày 1/07/2026)
* **Nội dung:**
Trong Session 8, hệ thống được kết nối với cơ sở dữ liệu PostgreSQL để lưu trữ dữ liệu sản phẩm và danh mục. Backend sử dụng SQLAlchemy ORM để thao tác với database và Pydantic để kiểm tra dữ liệu đầu vào.
Các bảng chính được tạo gồm categories và products. Ngoài ra, hệ thống xây dựng chức năng quản lý sản phẩm cho Admin, bao gồm thêm sản phẩm, chỉnh sửa sản phẩm và xóa sản phẩm. Các thao tác này được thực hiện thông qua API backend và dữ liệu được lưu trực tiếp vào PostgreSQL.
* **Kết quả đạt được:**
Ứng dụng đã kết nối thành công với PostgreSQL. Dữ liệu sản phẩm được lưu trữ trong database thay vì lưu bằng mock data hoặc localStorage. Admin có thể thực hiện các chức năng thêm, sửa và xóa sản phẩm, giúp hệ thống quản lý sản phẩm hoàn chỉnh hơn.

### 🔹 Session 09 (Ngày 3/07/2026)
* **Nội dung:**
Trong Session 9, hệ thống xây dựng chức năng đăng ký và đăng nhập người dùng. Backend sử dụng JWT Authentication để xác thực tài khoản và tạo token đăng nhập. Mật khẩu người dùng được mã hóa bằng Password Hashing trước khi lưu vào hệ thống nhằm tăng tính bảo mật.
Các API chính được xây dựng gồm POST /register để đăng ký tài khoản mới và POST /login để đăng nhập. Ở frontend, hệ thống thiết kế trang đăng ký và trang đăng nhập để người dùng có thể nhập thông tin tài khoản và gửi yêu cầu đến backend.
* **Kết quả đạt được:**
Người dùng có thể đăng ký tài khoản mới và đăng nhập thành công vào hệ thống. Sau khi đăng nhập, backend trả về token xác thực, giúp hệ thống nhận biết người dùng đã đăng nhập. Chức năng Authentication giúp ứng dụng có cơ chế bảo mật cơ bản và sẵn sàng phân quyền cho các chức năng như quản lý sản phẩm của Admin.
