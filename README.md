# 🛍️ Fashion E-Commerce

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?logo=stripe&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Ứng dụng thương mại điện tử thời trang đầy đủ tính năng với giao diện người dùng và trang quản trị (Admin Dashboard), hỗ trợ mua sắm, thanh toán thực tế qua Stripe và chat hỗ trợ khách hàng theo thời gian thực.

🌐 **Demo:** http://blue304.shop/

---

## 🔑 Tài khoản Admin (để test)

| Field    | Value              |
|----------|--------------------|
| Email    | admin@fashion.vn   |
| Password | Admin@123          |

> Truy cập trang quản trị tại: http://blue304.shop/admin

---

## ✨ Tính năng chính

### 👤 Người dùng
- Đăng ký / Đăng nhập, xác thực email, quên & đặt lại mật khẩu
- Duyệt & tìm kiếm sản phẩm, lọc theo danh mục
- Giỏ hàng, Wishlist, áp dụng mã giảm giá (Coupon)
- Thanh toán qua Stripe — xem hướng dẫn test bên dưới
- Theo dõi trạng thái & lịch sử đơn hàng
- Chat hỗ trợ trực tiếp với admin theo thời gian thực
- Đánh giá & nhận xét sản phẩm sau khi mua

### 🛠️ Admin Dashboard
- Thống kê doanh thu, đơn hàng, người dùng trực quan bằng Recharts
- Quản lý sản phẩm, danh mục, banner, outfit (Shop the Look)
- Quản lý đơn hàng & cập nhật trạng thái giao hàng
- Quản lý coupon & flash sale theo thời gian thực
- Quản lý hội thoại chat — AI tự động gợi ý phản hồi, admin có thể takeover bất kỳ lúc nào
- Quản lý đánh giá và tài khoản người dùng

### 💬 Luồng Chat hỗ trợ
```
User gửi tin nhắn
    └─► Nếu Admin đang online  →  Admin nhận & reply trực tiếp
    └─► Nếu Admin offline      →  AI tự động gợi ý / reply
                                   Admin online trở lại → takeover hội thoại
```

### 💳 Luồng Thanh toán
```
Giỏ hàng → Checkout (nhập địa chỉ, chọn coupon)
    └─► Stripe Payment Intent
    └─► Xác nhận thanh toán → Tạo đơn hàng → Gửi email xác nhận
    └─► Thất bại → Hiển thị lỗi, cho phép thử lại
```

---

## 💳 Test Thanh toán (Stripe Test Mode)

| Thẻ              | Số thẻ                | MM/YY  | CVC |
|------------------|-----------------------|--------|-----|
| Thành công       | `4242 4242 4242 4242` | Bất kỳ | Bất kỳ |
| Yêu cầu xác thực | `4000 0025 0000 3155` | Bất kỳ | Bất kỳ |
| Bị từ chối       | `4000 0000 0000 9995` | Bất kỳ | Bất kỳ |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   AWS EC2 Instance                   │
│                                                      │
│   ┌─────────────┐        ┌──────────────────────┐   │
│   │    Nginx    │──────► │  Frontend (Static)   │   │
│   │  (Reverse   │        │  React + Vite build  │   │
│   │   Proxy)    │──────► │  Backend (Node.js)   │   │
│   └─────────────┘        │  Express + Socket.IO │   │
│         │                └──────────┬───────────┘   │
└─────────┼────────────────────────────┼───────────────┘
          │                            │
    Port 80/443                        │
    (HTTP/HTTPS)              ┌────────▼────────┐
                              │   MongoDB Atlas  │
                              └─────────────────┘
                                        │
                    ┌───────────────────┼──────────────────┐
                    │                   │                  │
             ┌──────▼──────┐   ┌───────▼──────┐  ┌───────▼──────┐
             │  Cloudinary  │   │    Stripe    │  │   Nodemailer │
             │  (Storage)   │   │  (Payment)   │  │   (Email)    │
             └─────────────┘   └─────────────┘  └─────────────┘
```

---

## 🔧 Tech Stack

| Layer            | Technology                                          |
|------------------|-----------------------------------------------------|
| Frontend         | React 19, Vite 7, TailwindCSS 4, Ant Design         |
| State Management | Zustand                                             |
| Real-time        | Socket.IO Client                                    |
| Charts           | Recharts                                            |
| Payment          | Stripe.js                                           |
| Backend          | Node.js, Express 5                                  |
| Database         | MongoDB (Mongoose)                                  |
| Storage          | Cloudinary                                          |
| Infrastructure   | AWS EC2, Nginx, Docker                              |

---

## 🚀 Cài đặt và chạy local

### Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc Atlas)
- Tài khoản Stripe (lấy test keys tại dashboard.stripe.com)
- Tài khoản Cloudinary

### 1. Clone repo

```bash
git clone https://github.com/manhblue04/fashion-ecommerce.git
cd fashion-ecommerce
```

### 2. Cài đặt Backend

```bash
cd backend
cp .env.example .env   # điền các biến môi trường
npm install
npm run dev            # chạy tại http://localhost:5000
```

### 3. Cài đặt Frontend

```bash
cd frontend
cp .env.example .env   # điền VITE_API_URL, VITE_STRIPE_PUBLIC_KEY
npm install
npm run dev            # chạy tại http://localhost:5173
```

### 4. Seed dữ liệu mẫu

```bash
cd backend
npm run seed
```

---

## ⚙️ Biến môi trường

**Backend `.env`**
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=
```

---

## 🌐 Deployment

Ứng dụng được deploy trên **AWS EC2** với:
- **Nginx** làm reverse proxy và serve static files (React build)
- **Nginx** forward `/api` và `/socket.io` đến Node.js backend
- **MongoDB Atlas** làm database cloud
- **Cloudinary** lưu trữ hình ảnh sản phẩm

Cấu hình Nginx mẫu: xem file [`nginx.conf`](./nginx.conf)

---

## 📁 Cấu trúc thư mục

```
├── frontend/
│   └── src/
│       ├── components/     # UI components (home, product, cart, admin...)
│       ├── pages/          # Trang người dùng & admin
│       ├── store/          # Zustand stores (auth, cart, wishlist, chat)
│       ├── services/       # Axios API client & Socket service
│       ├── hooks/          # Custom hooks
│       └── utils/
├── backend/
│   └── src/
│       ├── controllers/    # Xử lý logic request
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API routes
│       ├── services/       # Business logic (AI, email, payment...)
│       ├── middlewares/    # Auth, validation, rate limit
│       ├── socket.js       # Socket.IO event handlers
│       └── server.js
└── nginx.conf
```

---

## 👨‍💻 Author

**Bùi Đức Mạnh**
- GitHub: [@manhblue04](https://github.com/manhblue04)
- Email: manhducnb204@gmail.com
