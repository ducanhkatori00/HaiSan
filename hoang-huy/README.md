# Hải sản Hoàng Huy

React + Vite → Node.js + Express → Supabase PostgreSQL (Data API).

## Thiết lập

Yêu cầu Node.js 22 trở lên. Máy hiện tại có Node trong `.runtime/`; có thể chạy `sh run.sh dev`.

1. Tạo project Supabase, mở SQL Editor và chạy `supabase/schema.sql`. Script tạo bảng sản phẩm, đơn hàng, index, quyền truy cập và thêm 6 sản phẩm mẫu. Chạy lại không ghi đè sản phẩm đã sửa.
2. Sao chép `.env.example` thành `.env`.
3. Điền `SUPABASE_URL` và `SUPABASE_SECRET_KEY` từ project Supabase. Backend cũng hỗ trợ khóa legacy qua `SUPABASE_SERVICE_ROLE_KEY`.
4. Tạo `ADMIN_TOKEN` bằng `openssl rand -hex 32` rồi lưu vào `.env` (ít nhất 32 ký tự).
5. Chạy:

```sh
npm install
npm run dev
```

Giao diện: http://127.0.0.1:5173. API: http://127.0.0.1:3001.

Mở **Admin**, nhập `ADMIN_TOKEN` và nhấn đăng nhập để quản lý sản phẩm, đơn hàng. Mã chỉ giữ trong bộ nhớ trang, tải lại trang cần nhập lại. Đây là mã dùng chung cho quản trị; chưa có tài khoản và phân quyền từng nhân viên. Chỉ sử dụng qua HTTPS khi triển khai.

```sh
npm test
npm run build
npm start
```

Express phục vụ giao diện đã build cùng API. Đặt `HOST=0.0.0.0` khi triển khai container; cấu hình `PORT` theo nhà cung cấp.

## API

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/health` | Kiểm tra kết nối database |
| GET | `/api/products` | Danh sách sản phẩm |
| POST | `/api/orders` | Tạo đơn, tính giá theo sản phẩm hiện tại trong database |
| GET | `/api/admin/products` | Danh sách sản phẩm quản trị |
| PUT | `/api/admin/products/:id` | Sửa thông tin, giá sản phẩm |
| GET | `/api/admin/orders` | Danh sách đơn mới nhất trước |
| PATCH | `/api/admin/orders/:id` | Sửa trạng thái và ghi chú quản trị |

API `/api/admin/*` yêu cầu header `Authorization: Bearer <ADMIN_TOKEN>`.

Ví dụ body tạo đơn:

```json
{"name":"Nguyễn An","phone":"0912345678","address":"123 Nguyễn Huệ, TP.HCM","note":"Giao buổi chiều","items":[{"id":"tom-su","quantity":2}]}
```

Backend kiểm tra thông tin khách hàng, số lượng, sản phẩm trùng và bỏ qua giá phía client. Đơn lưu snapshot tên, giá và số lượng trong `items` JSONB để lịch sử đơn không đổi khi sửa sản phẩm. Toàn bộ đơn được insert một lần. Chưa có thanh toán, tồn kho, thông báo hoặc chống gửi đơn trùng.

## Dữ liệu và bảo mật

Secret key chỉ dùng trên server, không đặt vào biến `VITE_*`. RLS bật trên cả hai bảng; client không được truy cập trực tiếp. Không đưa `.env` vào Git. Chi tiết khóa: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Ứng dụng dùng Supabase cho mọi lần đọc/ghi, không tự chuyển về file khi database lỗi. Dữ liệu JSON cũ trong `data/` được giữ nguyên nhưng chưa nhập vào Supabase. `server/admin.js` là bộ lưu file cũ, không còn dùng bởi ứng dụng; test của bộ này sử dụng thư mục tạm.

Các kiểm thử database dùng mock Data API, không yêu cầu khóa thật. Để xác nhận project thật, cấu hình `.env`, chạy schema, khởi động server và gọi `/api/health`, sau đó thử đặt đơn và kiểm tra trong Admin.
