# 🦷 Содон Сондор — Шүдний Эмнэлгийн Удирдлагын Систем

**Sodon Sondor Dental Clinic Management System**  
Bachelor Thesis Project — MERN Stack

---

## 🚀 Tech Stack

| Давхарга | Технологи |
|----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Redux Toolkit, Framer Motion |
| Backend  | Node.js, Express.js, Socket.io |
| Database | MongoDB, Mongoose |
| Auth     | JWT + Refresh Token (httpOnly cookie) |
| Realtime | Socket.io |

---

## 📦 Суулгах заавар

### Шаардлага
- Node.js 20+
- MongoDB 7+ (локал эсвэл Atlas)
- npm 10+

### Backend

```bash
cd backend
cp .env.example .env
# .env файлд өөрийн тохируулгуудыг оруул
npm install
npm run seed      # Жишиг өгөгдөл үүсгэх
npm run dev       # Хөгжүүлэлтийн горим
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

### Docker-оор

```bash
docker-compose up -d
```

---

## 👤 Demo хэрэглэгчид

| Үүрэг | Имэйл | Нууц үг |
|-------|-------|---------|
| Admin | admin@sodon.mn | Admin@123 |
| Эмч | doctor@sodon.mn | Doctor@123 |
| Рецепц | reception@sodon.mn | Reception@123 |
| Өвчтөн | patient@sodon.mn | Patient@123 |

---

## 📂 Төслийн бүтэц

```
sodon-sondor/
├── backend/          # Express REST API + Socket.io
├── frontend/         # React 18 SPA
├── docs/             # API болон DB баримт бичиг
└── docker-compose.yml
```

---

## 🌟 Үндсэн боломжууд

- **Онлайн цаг захиалга** — 4 алхмат wizard, бодит цагийн давхцал шалгалт
- **Шүдний зураглал** — интерактив SVG dental chart (32 шүд, FDI notation)
- **Дүрүүдийн хяналт** — Admin / Doctor / Receptionist / Patient
- **Бодит цагийн мэдэгдэл** — Socket.io
- **Тайлан & Статистик** — Recharts
- **Mobile-first дизайн** — Bottom navigation, glassmorphism
- **Харанхуй горим** — Persistent dark mode

---

## 📡 API баримт

[docs/API.md](docs/API.md) харна уу.

---

## 🎓 Зохиогч

Bachelor Thesis — Соён Сондор Шүдний Эмнэлэг  
2026 он
