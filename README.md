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

### 🔹 Session 10 (Ngày 6/07/2026)
* **Nội dung:**
Trong session này, hệ thống được bổ sung chức năng phân quyền người dùng dựa trên vai trò. Cơ chế được áp dụng là RBAC – Role-Based Access Control, cho phép hệ thống kiểm soát quyền truy cập theo từng loại tài khoản.
Hệ thống có hai vai trò chính là ADMIN và CUSTOMER. Tài khoản ADMIN có quyền truy cập trang quản trị và thực hiện các chức năng quản lý sản phẩm như thêm, sửa, xóa sản phẩm. Trong khi đó, tài khoản CUSTOMER chỉ được sử dụng các chức năng dành cho người mua hàng như xem sản phẩm, thêm sản phẩm vào giỏ hàng và đặt hàng.
Các chức năng quan trọng như thêm sản phẩm, xóa sản phẩm và truy cập trang quản lý sản phẩm được bảo vệ. Nếu người dùng không có quyền quản trị truy cập vào các chức năng này, hệ thống sẽ từ chối quyền truy cập hoặc không cho phép thực hiện thao tác.
* **Kết quả đạt được:**
Sau khi hoàn thành session này, hệ thống đã xây dựng được chức năng phân quyền theo vai trò người dùng. Chỉ tài khoản có quyền ADMIN mới được phép thực hiện các chức năng quản lý sản phẩm. Tài khoản CUSTOMER không thể truy cập hoặc thao tác vào các chức năng dành riêng cho quản trị viên.
Chức năng Authorization giúp hệ thống tăng tính bảo mật, hạn chế việc người dùng thông thường can thiệp vào dữ liệu sản phẩm và đảm bảo các chức năng quản trị chỉ được sử dụng bởi người có quyền phù hợp.

### 🔹 Session 11 (Ngày 12/07/2026)
* **Nội dung:**
Trong Session 11, hệ thống được xây dựng chức năng giỏ hàng bằng React Context API để quản lý dữ liệu dùng chung trong toàn bộ ứng dụng. Người dùng có thể thêm sản phẩm từ trang danh sách hoặc trang chi tiết sản phẩm vào giỏ hàng. Nếu sản phẩm đã tồn tại trong giỏ hàng, hệ thống sẽ tự động tăng số lượng thay vì tạo thêm một sản phẩm trùng lặp.
Trang giỏ hàng hiển thị đầy đủ thông tin của từng sản phẩm như hình ảnh, tên sản phẩm, đơn giá, số lượng và thành tiền. Người dùng có thể tăng, giảm hoặc thay đổi số lượng sản phẩm, đồng thời có thể xóa từng sản phẩm khỏi giỏ hàng. Tổng giá trị đơn hàng được hệ thống tính toán và cập nhật tự động mỗi khi số lượng sản phẩm thay đổi.
Dữ liệu giỏ hàng được lưu trong localStorage, giúp thông tin sản phẩm không bị mất khi người dùng tải lại trang hoặc đóng và mở lại trình duyệt. Ngoài ra, hệ thống còn hỗ trợ xóa toàn bộ giỏ hàng và chuyển người dùng đến trang thanh toán khi đã chọn xong sản phẩm.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 11, hệ thống đã có chức năng giỏ hàng hoạt động đầy đủ. Người dùng có thể thêm sản phẩm, cập nhật số lượng, xóa sản phẩm và xem tổng tiền của đơn hàng. Dữ liệu giỏ hàng được quản lý tập trung bằng Context API và được lưu lại trên trình duyệt bằng localStorage. Chức năng này tạo nền tảng để tiếp tục xây dựng quy trình Checkout và Orders trong các session tiếp theo.

### 🔹 Session 12 (Ngày 12/07/2026)
* **Nội dung:**
Trong Session 12, hệ thống ShopHub được xây dựng chức năng thanh toán và quản lý đơn hàng. Sau khi lựa chọn sản phẩm trong giỏ hàng, người dùng có thể chuyển đến trang Checkout để nhập các thông tin giao hàng như họ tên, số điện thoại, địa chỉ nhận hàng, ghi chú và lựa chọn phương thức thanh toán.
Ở phía backend, hệ thống xây dựng hai bảng dữ liệu chính là orders và order_items. Bảng orders được sử dụng để lưu thông tin chung của đơn hàng như người đặt hàng, tổng tiền, trạng thái đơn hàng, phương thức thanh toán, trạng thái thanh toán, thông tin giao hàng và thời gian tạo đơn. Bảng order_items lưu chi tiết từng sản phẩm thuộc đơn hàng, bao gồm mã sản phẩm, số lượng và giá tại thời điểm đặt hàng.
Khi người dùng xác nhận đặt hàng, frontend gửi thông tin giỏ hàng và thông tin giao hàng đến API backend. Backend thực hiện kiểm tra sản phẩm, số lượng tồn kho, tính tổng giá trị đơn hàng, tạo bản ghi trong bảng orders và lưu từng sản phẩm vào bảng order_items. Sau khi đơn hàng được tạo thành công, giỏ hàng được xóa và người dùng được chuyển đến trang lịch sử đơn hàng.
Hệ thống cũng xây dựng trang Order History để người dùng xem lại các đơn hàng đã đặt. Mỗi đơn hàng hiển thị mã đơn, ngày đặt hàng, danh sách sản phẩm, tổng tiền, phương thức thanh toán, trạng thái thanh toán và trạng thái xử lý đơn hàng.
Bên cạnh đó, hệ thống áp dụng khái niệm Transaction để đảm bảo quá trình tạo đơn hàng diễn ra đồng bộ. Nếu xảy ra lỗi trong quá trình lưu đơn hàng hoặc chi tiết sản phẩm, toàn bộ dữ liệu sẽ được hoàn tác, tránh trường hợp đơn hàng được tạo nhưng thiếu sản phẩm hoặc dữ liệu không đầy đủ.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 12, hệ thống đã cho phép khách hàng thực hiện đầy đủ quy trình từ giỏ hàng đến đặt hàng. Người dùng có thể nhập thông tin giao hàng, lựa chọn phương thức thanh toán, xác nhận đơn hàng và xem lại lịch sử các đơn đã đặt.
Dữ liệu đơn hàng và sản phẩm trong đơn được lưu chính xác trong cơ sở dữ liệu thông qua hai bảng orders và order_items. Hệ thống tự động tính tổng tiền, lưu trạng thái đơn hàng, trạng thái thanh toán và thông tin người nhận.
Chức năng Checkout và Order History đã hoạt động ổn định, giúp khách hàng có thể tạo, theo dõi và kiểm tra lại đơn hàng của mình. Đây cũng là nền tảng để tiếp tục xây dựng chức năng quản lý đơn hàng trong Admin Dashboard và tích hợp các phương thức thanh toán trực tuyến.

### 🔹 Session 13 (Ngày 17/07/2026)
* **Nội dung:**
Trong Session 13, hệ thống ShopHub được mở rộng với chức năng thanh toán trực tuyến, giúp khách hàng có thể hoàn tất đơn hàng thông qua các cổng thanh toán thay vì chỉ sử dụng hình thức thanh toán khi nhận hàng (COD). Backend được cấu hình để kết nối với VNPAY Sandbox và PayPal Sandbox, đồng thời sử dụng các biến môi trường trong file .env để lưu trữ các thông tin bảo mật như TMN Code, Hash Secret, Client ID và Client Secret.
Khi người dùng tiến hành đặt hàng, hệ thống sẽ tạo một đơn hàng mới trong cơ sở dữ liệu PostgreSQL với trạng thái thanh toán ban đầu là PENDING. Nếu người dùng chọn thanh toán bằng VNPAY hoặc PayPal, backend sẽ tạo đường dẫn thanh toán thông qua API của cổng thanh toán và chuyển hướng người dùng đến giao diện thanh toán tương ứng. Sau khi người dùng hoàn tất giao dịch, VNPAY hoặc PayPal sẽ gửi kết quả về hệ thống thông qua Return URL và IPN (Instant Payment Notification) để xác thực giao dịch.
Trong quá trình xử lý, backend sẽ kiểm tra chữ ký điện tử (HMAC SHA512 đối với VNPAY) nhằm đảm bảo tính toàn vẹn và bảo mật của dữ liệu trả về. Nếu giao dịch hợp lệ và thanh toán thành công, hệ thống sẽ tự động cập nhật trạng thái thanh toán của đơn hàng từ PENDING sang PAID, đồng thời lưu lại các thông tin giao dịch như mã giao dịch, thời gian thanh toán và mã phản hồi từ cổng thanh toán vào cơ sở dữ liệu. Nếu giao dịch thất bại hoặc bị hủy, trạng thái đơn hàng sẽ được cập nhật phù hợp để người dùng có thể tiếp tục thanh toán hoặc thực hiện lại đơn hàng.
Sau khi hoàn tất tích hợp, chức năng thanh toán hoạt động đồng bộ với các module đã xây dựng ở các session trước như Checkout, Order History và Admin Dashboard. Người dùng có thể theo dõi kết quả thanh toán ngay trên giao diện, trong khi quản trị viên có thể kiểm tra trạng thái thanh toán của từng đơn hàng và thống kê doanh thu dựa trên các đơn hàng đã thanh toán thành công. Việc tích hợp cổng thanh toán giúp quy trình mua hàng trở nên hoàn chỉnh, đồng thời mô phỏng gần giống với quy trình thanh toán thực tế của một hệ thống thương mại điện tử.
* **Kết quả đạt được:**
Sau khi hoàn thành Session 13, hệ thống ShopHub đã tích hợp thành công các phương thức thanh toán COD, VNPAY Sandbox và PayPal Sandbox.
Khách hàng có thể lựa chọn phương thức thanh toán tại trang Checkout. Đối với VNPAY và PayPal, hệ thống có thể tạo yêu cầu thanh toán, chuyển khách hàng đến cổng thanh toán, tiếp nhận kết quả giao dịch và cập nhật trạng thái đơn hàng.
Backend đã xây dựng các API tạo thanh toán, xử lý Return URL, tiếp nhận IPN và kiểm tra tính hợp lệ của giao dịch. Thông tin phương thức thanh toán, mã giao dịch, trạng thái thanh toán và thời gian thanh toán được lưu trong cơ sở dữ liệu.
Sau khi thanh toán thành công, đơn hàng được cập nhật từ PENDING sang PAID và hiển thị chính xác trên trang lịch sử đơn hàng. Các giao dịch đều được thực hiện trong môi trường Sandbox nên không sử dụng tiền thật.

