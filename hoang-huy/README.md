# Hải sản Hoàng Huy

React + Vite → Node.js + Express → Supabase PostgreSQL (Data API).

Ứng dụng không dùng WordPress hoặc PHP. React hiển thị cửa hàng, tìm kiếm,
lọc sản phẩm, giỏ hàng và quản trị. Tất cả thao tác dữ liệu đi qua API Express
trong `server/app.js`; `src/api/client.js` tập trung kết nối và xử lý lỗi cho UI.
Giao diện dùng tông xanh biển, hỗ trợ màn hình điện thoại và desktop.

`VITE_API_BASE_URL` mặc định là `/api`. Khi phát triển, Vite proxy đường dẫn
này sang Node.js cổng 3001. Frontend React được phục vụ độc lập bởi Vite
khi phát triển và static hosting khi production. Reverse proxy chuyển
`/api` về Node.js và các URL giao diện về `dist/index.html`.

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
npm run preview:full
```

Xem bản build tại http://127.0.0.1:4173 bằng `npm run preview:full`.
`npm start` hoặc `npm run start:api` chỉ khởi động backend API tại cổng 3001.
Chạy riêng frontend bằng `npm run dev:ui`, backend bằng `npm run dev:api`.

Khi production, deploy `dist/` lên static hosting có SPA fallback về
`index.html`; định tuyến `/api` qua reverse proxy tới backend Node.js.
Vite preview chỉ dùng kiểm tra bản build trên máy. Đặt `HOST=0.0.0.0` khi
triển khai container backend; cấu hình `PORT` theo nhà cung cấp.

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

## Các trang giao diện

| URL | Trang | File |
| --- | --- | --- |
| `/` | Trang chủ | `src/pages/HomePage.jsx` |
| `/hai-san` | Danh sách, tìm kiếm và lọc sản phẩm | `src/pages/ProductsPage.jsx` |
| `/gioi-thieu` | Giới thiệu Hoàng Huy | `src/pages/AboutPage.jsx` |
| `/huong-dan` | Hướng dẫn đặt hàng | `src/pages/GuidePage.jsx` |
| `/gio-hang` | Giỏ hàng | `src/pages/CartPage.jsx` |
| `/thanh-toan` | Thông tin giao hàng | `src/pages/CheckoutPage.jsx` |
| `/admin` | Quản trị sản phẩm và đơn hàng | `src/admin/AdminApp.jsx` |

`src/App.jsx` ánh xạ URL đến trang; `src/router.jsx` xử lý History API,
Back/Forward và liên kết chuyển trang. `src/components/Layout.jsx` dùng chung
header, menu và footer. `src/context/ShopContext.jsx` giữ giỏ hàng xuyên suốt
các trang và lưu vào localStorage. Vite phục vụ SPA fallback khi dev/preview;
static hosting production cần cấu hình fallback về `index.html` để mở trực
tiếp hoặc tải lại URL giao diện.

## Mã nguồn Admin

Admin có module React riêng trong `src/admin/`, dùng chung Vite và backend
Node.js của dự án. Chạy `npm run dev` tại `hoang-huy` để mở cả cửa hàng và admin.

```text
src/admin/
  AdminApp.jsx               # Route và kiểm tra phiên đăng nhập
  style.css                  # Giao diện quản trị
  components/AdminLayout.jsx # Sidebar và layout
  context/AdminContext.jsx   # Phiên đăng nhập và dữ liệu quản trị
  api/                       # API sản phẩm và đơn hàng quản trị
  pages/
    LoginPage.jsx
    DashboardPage.jsx
    ProductsPage.jsx
    OrdersPage.jsx
```

- `/admin`: tổng quan sản phẩm, đơn hàng, đơn chờ và giá trị đơn hoàn tất.
- `/admin/products`: chỉnh sửa thông tin và giá sản phẩm.
- `/admin/orders`: quản lý trạng thái và ghi chú đơn hàng.

Chưa đăng nhập sẽ thấy form nhập `ADMIN_TOKEN` tại các URL admin. Token chỉ
nằm trong bộ nhớ React, được giữ khi chuyển giữa các trang admin và xóa khi
đăng xuất, tải lại trang hoặc rời khu vực admin. Backend vẫn xác thực từng
request; không có secret được đưa vào mã nguồn frontend.

## Cấu trúc API

```text
src/
  admin/                     # UI và logic quản trị
    api/products.js
    api/orders.js
    pages/
    components/
    context/
  api/
    client.js                # HTTP client và xử lý lỗi dùng chung
    products/index.js        # API sản phẩm cửa hàng
    orders/index.js          # API đặt hàng
server/
  app.js                     # Ghép middleware và API, không phục vụ page
  api/
    index.js                 # Ghép các nhóm API
    health/                  # controller.js + routes.js
    products/                # controller.js + routes.js
    orders/                  # controller.js + routes.js
    admin/
      routes.js              # Xác thực chung cho /api/admin
      products/              # controller.js + routes.js
      orders/                # controller.js + routes.js
  middleware/
    admin-auth.js            # Kiểm tra token quản trị
    async-handler.js         # Chuyển lỗi async về Express
```

Các module API nhận store qua tham số; `server/store.js` tiếp tục phụ trách
truy cập dữ liệu và kiểm tra thay đổi sản phẩm, trạng thái đơn hàng.

## Tách frontend và backend

Toàn bộ page là React component trong `src/pages` và `src/admin/pages`.
Express chỉ chạy trong `server/`; không render HTML hoặc phục vụ tài nguyên
frontend. `src/api/client.js` kết nối qua HTTP, không import mã backend.

- UI development: `npm run dev:ui` — cổng 5173.
- API development: `npm run dev:api` — cổng 3001.
- Chạy cả hai: `npm run dev`.
- Xem React build kèm API trên máy: `npm run build` rồi `npm run preview:full`.
