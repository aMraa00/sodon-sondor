require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets');

// Routes
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const patientRoutes      = require('./routes/patientRoutes');
const doctorRoutes       = require('./routes/doctorRoutes');
const appointmentRoutes  = require('./routes/appointmentRoutes');
const diagnosisRoutes    = require('./routes/diagnosisRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const serviceRoutes      = require('./routes/serviceRoutes');
const dentalChartRoutes  = require('./routes/dentalChartRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes       = require('./routes/reportRoutes');
const uploadRoutes       = require('./routes/uploadRoutes');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

app.set('io', io);
setupSocket(io);

// Upload хавтасыг үүсгэх
['uploads/avatars', 'uploads/xrays'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Содон Сондор API ажиллаж байна 🦷', env: process.env.NODE_ENV }));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/diagnoses',     diagnosisRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/dental-charts', dentalChartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/upload',        uploadRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Сервер ажиллаж байна: http://localhost:${PORT}`);
  console.log(`📡 Socket.io бэлэн байна`);
  console.log(`🌍 Горим: ${process.env.NODE_ENV}\n`);
});
