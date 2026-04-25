require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Diagnosis = require('../models/Diagnosis');
const Prescription = require('../models/Prescription');
const Payment = require('../models/Payment');
const DentalChart = require('../models/DentalChart');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

// ─── Үйлчилгээ ───────────────────────────────────────────────────────────────
const SERVICES = [
  { name: 'Оношлогоо & Зөвлөгөө',   category: 'diagnosis',    price: 30000,   duration: 30,  isActive: true },
  { name: 'Шүд цэвэрлэгээ',         category: 'cleaning',     price: 50000,   duration: 45,  isActive: true },
  { name: 'Шүд цайруулалт',         category: 'whitening',    price: 150000,  duration: 60,  isActive: true },
  { name: 'Шүдний нөхдөс (Нүүр)',   category: 'filling',      price: 60000,   duration: 40,  isActive: true },
  { name: 'Шүдний нөхдөс (Гүн)',    category: 'filling',      price: 90000,   duration: 60,  isActive: true },
  { name: 'Шүд авалт (Энгийн)',     category: 'extraction',   price: 50000,   duration: 30,  isActive: true },
  { name: 'Шүд авалт (Мэргэн)',     category: 'extraction',   price: 80000,   duration: 45,  isActive: true },
  { name: 'Суваг эмчилгээ',         category: 'surgery',      price: 200000,  duration: 90,  isActive: true },
  { name: 'Брекет тавих',           category: 'orthodontics', price: 900000,  duration: 90,  isActive: true },
  { name: 'Брекет хяналт',          category: 'orthodontics', price: 50000,   duration: 30,  isActive: true },
  { name: 'Имплант',                category: 'surgery',      price: 1200000, duration: 120, isActive: true },
  { name: 'Шүдний бүрхүүл (Титэм)', category: 'surgery',      price: 350000,  duration: 60,  isActive: true },
  { name: 'Гэрэл шүд (Виниер)',     category: 'whitening',    price: 280000,  duration: 60,  isActive: true },
  { name: 'Хүүхдийн шүд авалт',    category: 'extraction',   price: 40000,   duration: 25,  isActive: true },
  { name: 'Фторжуулалт',            category: 'cleaning',     price: 25000,   duration: 20,  isActive: true },
];

// ─── Эмч нар ─────────────────────────────────────────────────────────────────
const DOCTORS = [
  { firstName: 'Энхтуяа',    lastName: 'Батсайхан', email: 'doctor@sodon.mn',   phone: '70000003', specialization: 'Ерөнхий шүдний эмч',     experience: 10, fee: 30000, bio: 'Шүдний эмчилгээний 10 гаруй жилийн туршлагатай. Монгол Улсын Эрүүл мэндийн их сургуулийг онц дүнтэй төгссөн.' },
  { firstName: 'Мөнхжаргал', lastName: 'Дорж',      email: 'doctor2@sodon.mn',  phone: '70000004', specialization: 'Хүүхдийн шүдний эмч',    experience: 6,  fee: 30000, bio: 'Хүүхдийн шүдний эрүүл мэндийг хамгаалахад мэргэшсэн. Уян хатан, ойлголцох арга барилаараа алдартай.' },
  { firstName: 'Ганбаатар',  lastName: 'Нямдорж',   email: 'doctor3@sodon.mn',  phone: '70000005', specialization: 'Шүдний мэс засалч',      experience: 14, fee: 50000, bio: 'Имплант, суваг эмчилгээний мэргэжилтэн. Олон улсын сургалтанд хамрагдсан туршлагатай хирург.' },
  { firstName: 'Уянга',      lastName: 'Цэрэнпунцаг',email: 'doctor4@sodon.mn', phone: '70000006', specialization: 'Гажуудал засалч (Ортодонт)', experience: 8, fee: 40000, bio: 'Брекет, Invisalign эмчилгээгээр мэргэшсэн. Тогтмол Солонгос, Японд мэргэшлийн сургалтанд хамрагддаг.' },
  { firstName: 'Батзаяа',    lastName: 'Лхагвасүрэн',email: 'doctor5@sodon.mn', phone: '70000007', specialization: 'Шүдний эстетик эмч',      experience: 5,  fee: 35000, bio: 'Виниер, цайруулалт, гоо зүйн шүдний эмчилгээний мэргэжилтэн.' },
];

// ─── Өвчтөн нар ──────────────────────────────────────────────────────────────
const PATIENTS = [
  { firstName: 'Батболд',    lastName: 'Гантулга',   email: 'patient@sodon.mn',   phone: '99001122', gender: 'male',   dob: new Date(1988, 3, 15), blood: 'A+',  address: 'СХД, 10-р хороо' },
  { firstName: 'Оюунцэцэг', lastName: 'Болд',        email: 'patient2@sodon.mn',  phone: '99112233', gender: 'female', dob: new Date(1995, 6, 22), blood: 'B+',  address: 'БГД, 4-р хороо' },
  { firstName: 'Төмөрбаатар',lastName: 'Сүхэ',       email: 'patient3@sodon.mn',  phone: '99223344', gender: 'male',   dob: new Date(1980, 1, 8),  blood: 'O+',  address: 'ХУД, 2-р хороо' },
  { firstName: 'Нарантуяа',  lastName: 'Цэрэн',      email: 'patient4@sodon.mn',  phone: '99334455', gender: 'female', dob: new Date(1992, 9, 30), blood: 'AB+', address: 'ЧД, 1-р хороо' },
  { firstName: 'Баярмаа',    lastName: 'Ганзориг',   email: 'patient5@sodon.mn',  phone: '99445566', gender: 'female', dob: new Date(1998, 0, 12), blood: 'A-',  address: 'СБД, 8-р хороо' },
  { firstName: 'Энхбаяр',    lastName: 'Пүрэв',      email: 'patient6@sodon.mn',  phone: '99556677', gender: 'male',   dob: new Date(1975, 11, 5), blood: 'B-',  address: 'БЗД, 6-р хороо' },
  { firstName: 'Тунгалаг',   lastName: 'Батмөнх',    email: 'patient7@sodon.mn',  phone: '99667788', gender: 'female', dob: new Date(2000, 4, 19), blood: 'O-',  address: 'ХУД, 15-р хороо' },
  { firstName: 'Дашням',     lastName: 'Жамц',       email: 'patient8@sodon.mn',  phone: '99778899', gender: 'male',   dob: new Date(1983, 7, 27), blood: 'A+',  address: 'СХД, 3-р хороо' },
  { firstName: 'Солонго',    lastName: 'Энхтөр',     email: 'patient9@sodon.mn',  phone: '99889900', gender: 'female', dob: new Date(1991, 2, 14), blood: 'B+',  address: 'БГД, 11-р хороо' },
  { firstName: 'Мандах',     lastName: 'Цогзолмаа',  email: 'patient10@sodon.mn', phone: '99990011', gender: 'male',   dob: new Date(1969, 5, 3),  blood: 'AB-', address: 'ЧД, 5-р хороо' },
  { firstName: 'Амгалан',    lastName: 'Бат-Эрдэнэ', email: 'patient11@sodon.mn', phone: '88001122', gender: 'male',   dob: new Date(1994, 8, 9),  blood: 'O+',  address: 'СБД, 14-р хороо' },
  { firstName: 'Цэцэгмаа',   lastName: 'Лхамсүрэн',  email: 'patient12@sodon.mn', phone: '88112233', gender: 'female', dob: new Date(1987, 10, 25),blood: 'A+',  address: 'БЗД, 7-р хороо' },
];

const defaultSchedule = [1, 2, 3, 4, 5].map((d) => ({
  dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotDuration: 30, isWorking: true,
}));

const toothConditions = [
  [{ toothNumber: 16, status: 'caries' }, { toothNumber: 26, status: 'filling' }],
  [{ toothNumber: 36, status: 'missing' }, { toothNumber: 11, status: 'caries' }, { toothNumber: 21, status: 'caries' }],
  [{ toothNumber: 17, status: 'crown' }, { toothNumber: 47, status: 'filling' }, { toothNumber: 27, status: 'root-canal' }],
  [{ toothNumber: 46, status: 'missing' }, { toothNumber: 15, status: 'filling' }],
  [{ toothNumber: 14, status: 'caries' }, { toothNumber: 24, status: 'caries' }, { toothNumber: 34, status: 'caries' }],
  [{ toothNumber: 18, status: 'extraction-needed' }, { toothNumber: 48, status: 'extraction-needed' }],
  [{ toothNumber: 16, status: 'crown' }, { toothNumber: 26, status: 'crown' }, { toothNumber: 36, status: 'filling' }],
  [{ toothNumber: 11, status: 'filling' }, { toothNumber: 12, status: 'filling' }],
  [{ toothNumber: 45, status: 'root-canal' }, { toothNumber: 35, status: 'root-canal' }],
  [{ toothNumber: 31, status: 'missing' }, { toothNumber: 32, status: 'missing' }, { toothNumber: 41, status: 'missing' }],
  [{ toothNumber: 22, status: 'caries' }, { toothNumber: 23, status: 'filling' }],
  [{ toothNumber: 17, status: 'extraction-needed' }, { toothNumber: 28, status: 'missing' }],
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seed эхэллээ — бүх өгөгдөл устгагдана...\n');

  await Promise.all([
    User.deleteMany({}), Patient.deleteMany({}), Doctor.deleteMany({}),
    Service.deleteMany({}), Appointment.deleteMany({}), Diagnosis.deleteMany({}),
    Prescription.deleteMany({}), Payment.deleteMany({}),
    DentalChart.deleteMany({}), Notification.deleteMany({}),
  ]);

  // ── Үйлчилгээ ──
  const services = await Service.insertMany(SERVICES);
  console.log(`✅ ${services.length} үйлчилгээ`);

  // ── Систем хэрэглэгчид ──
  const adminUser = await User.create({
    firstName: 'Администратор', lastName: 'Систем',
    email: 'admin@sodon.mn', phone: '70000001',
    password: 'Admin@123', role: 'admin', gender: 'other',
  });
  const receptionUser = await User.create({
    firstName: 'Рецепционист', lastName: 'Содон',
    email: 'reception@sodon.mn', phone: '70000002',
    password: 'Reception@123', role: 'receptionist', gender: 'female',
  });
  console.log('✅ Admin, Receptionist');

  // ── Эмч нар ──
  const doctorDocs = [];
  for (const d of DOCTORS) {
    const u = await User.create({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, password: 'Doctor@123', role: 'doctor', gender: d.firstName === 'Ганбаатар' || d.firstName === 'Батзаяа' ? 'male' : 'female' });
    const doc = await Doctor.create({
      user: u._id,
      specialization: d.specialization,
      experience: d.experience,
      consultationFee: d.fee,
      bio: d.bio,
      schedule: defaultSchedule,
      isAvailable: true,
      rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
      ratingCount: 15 + Math.floor(Math.random() * 40),
    });
    doctorDocs.push({ user: u, doctor: doc });
  }
  console.log(`✅ ${doctorDocs.length} эмч`);

  // ── Өвчтөн нар ──
  const patientDocs = [];
  for (let i = 0; i < PATIENTS.length; i++) {
    const p = PATIENTS[i];
    const u = await User.create({
      firstName: p.firstName, lastName: p.lastName,
      email: p.email, phone: p.phone,
      password: 'Patient@123', role: 'patient',
      gender: p.gender, dateOfBirth: p.dob,
      address: p.address,
    });
    const pat = await Patient.create({
      user: u._id,
      registeredBy: receptionUser._id,
      bloodType: p.blood,
      allergies: i % 4 === 0 ? ['Пенициллин'] : i % 5 === 0 ? ['Ибупрофен', 'Аспирин'] : [],
      medicalHistory: i % 3 === 0 ? 'Чихрийн шижин (II хэлбэр)' : i % 4 === 0 ? 'Өндөр цусны даралт' : '',
    });
    await DentalChart.create({
      patient: u._id,
      teeth: toothConditions[i % toothConditions.length],
      examDoctor: doctorDocs[i % doctorDocs.length].user._id,
      lastExamDate: new Date(Date.now() - (i * 15 + 7) * 24 * 60 * 60 * 1000),
      notes: i % 3 === 0 ? 'Тогтмол шалгалт шаардлагатай' : '',
    });
    patientDocs.push({ user: u, patient: pat });
  }
  console.log(`✅ ${patientDocs.length} өвчтөн`);

  // ── Цаг захиалгууд (өнгөрсөн + ирэх) ──
  const now = new Date();
  const apptData = [];

  // Өнгөрсөн (completed/cancelled)
  for (let i = 0; i < 35; i++) {
    const daysAgo = 1 + Math.floor(i * 1.8);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) { date.setDate(date.getDate() - (dow === 0 ? 2 : 1)); }

    const hours = [9, 9, 10, 10, 11, 14, 14, 15, 15, 16];
    const mins = [0, 30, 0, 30, 0, 0, 30, 0, 30, 0];
    const tIdx = i % hours.length;
    const startTime = `${String(hours[tIdx]).padStart(2, '0')}:${String(mins[tIdx]).padStart(2, '0')}`;
    const svc = services[i % services.length];
    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sm + svc.duration;
    const endTime = `${String(sh + Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    const status = i % 7 === 0 ? 'cancelled' : i % 9 === 0 ? 'no-show' : 'completed';
    apptData.push({
      patient: patientDocs[i % patientDocs.length].user._id,
      doctor: doctorDocs[i % doctorDocs.length].user._id,
      service: svc._id,
      date, startTime, endTime, status,
      notes: status === 'cancelled' ? 'Өвчтөн цуцалсан' : '',
      completedAt: status === 'completed' ? date : undefined,
    });
  }

  // Ирэх 14 хоногт (confirmed/pending)
  for (let i = 0; i < 20; i++) {
    const daysAhead = 1 + Math.floor(i * 0.8);
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);
    date.setHours(0, 0, 0, 0);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) { date.setDate(date.getDate() + (dow === 0 ? 1 : 2)); }

    const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30'];
    const startTime = times[i % times.length];
    const svc = services[(i + 3) % services.length];
    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sm + svc.duration;
    const endTime = `${String(sh + Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    apptData.push({
      patient: patientDocs[(i + 2) % patientDocs.length].user._id,
      doctor: doctorDocs[i % doctorDocs.length].user._id,
      service: svc._id,
      date, startTime, endTime,
      status: i % 3 === 0 ? 'pending' : 'confirmed',
      notes: '',
    });
  }

  const appointments = await Appointment.insertMany(apptData);
  console.log(`✅ ${appointments.length} цаг захиалга`);

  // ── Оношлогоо ──
  const completedAppts = appointments.filter((a) => a.status === 'completed').slice(0, 20);
  const diagnosisNames = [
    'Кариес (K02.1)', 'Пульпит (K04.0)', 'Периодонтит (K05.2)',
    'Гингивит (K05.1)', 'Шүдний мэдрэмтгий байдал', 'Шүдний хагарал',
    'Ерөнхий оношлогоо — хэвийн', 'Шүд авалтын дараах хүндрэл',
  ];
  const diagRecs = completedAppts.map((appt, i) => ({
    patient: appt.patient,
    doctor: appt.doctor,
    appointment: appt._id,
    diagnosis: diagnosisNames[i % diagnosisNames.length],
    description: i % 2 === 0 ? 'Тогтмол шалгалт шаардлагатай. Өвчтөн мэдрэмтгий байдлыг мэдэгдсэн.' : 'Эмчилгээ амжилттай. Ахицтай байна.',
    treatment: ['Цэвэрлэгээ', 'Нөхдөс', 'Шүд авалт', 'Суваг эмчилгээ'][i % 4],
    followUpDate: new Date(appt.date.getTime() + 30 * 24 * 60 * 60 * 1000),
    date: appt.date,
  }));
  await Diagnosis.insertMany(diagRecs);
  console.log(`✅ ${diagRecs.length} оношлогоо`);

  // ── Эмийн жор ──
  const medications = [
    { name: 'Амоксициллин 500мг', dosage: '1 шахмал × 3', duration: '5 өдөр', instructions: 'Хоолны дараа ууна' },
    { name: 'Ибупрофен 400мг',    dosage: '1 шахмал × 2', duration: '3 өдөр', instructions: 'Өвдөлт үед хэрэглэнэ' },
    { name: 'Метронидазол 250мг', dosage: '1 шахмал × 3', duration: '7 өдөр', instructions: 'Хоолны дараа ууна' },
    { name: 'Хлоргексидин шүршилт', dosage: '2 удаа/өдөр', duration: '10 өдөр', instructions: 'Шүд угаасны дараа хэрэглэнэ' },
    { name: 'Парацетамол 500мг',  dosage: '1 шахмал × 3', duration: '3 өдөр', instructions: 'Өвдөлт болон халуун үед' },
  ];
  const prescriptionRecs = completedAppts.slice(0, 15).map((appt, i) => ({
    patient: appt.patient,
    doctor: appt.doctor,
    appointment: appt._id,
    medications: [medications[i % medications.length], ...(i % 2 === 0 ? [medications[(i + 1) % medications.length]] : [])],
    notes: 'Эм дуусахаас өмнө зогсоохгүй байна уу.',
    issuedAt: appt.date,
  }));
  await Prescription.insertMany(prescriptionRecs);
  console.log(`✅ ${prescriptionRecs.length} эмийн жор`);

  // ── Төлбөр ──
  const paymentMethods = ['cash', 'card', 'qr', 'insurance'];
  const paymentRecs = completedAppts.slice(0, 28).map((appt, i) => ({
    patient: appt.patient,
    appointment: appt._id,
    amount: services[i % services.length].price,
    method: paymentMethods[i % paymentMethods.length],
    status: 'paid',
    paidAt: appt.date,
    receivedBy: receptionUser._id,
    notes: '',
  }));
  await Payment.insertMany(paymentRecs);
  console.log(`✅ ${paymentRecs.length} төлбөр`);

  console.log('\n🎉 Seed амжилттай дууслаа!\n');
  console.log('Demo нэвтрэх мэдээлэл:');
  console.log('  Admin:      admin@sodon.mn       / Admin@123');
  console.log('  Эмч:        doctor@sodon.mn      / Doctor@123');
  console.log('  Эмч 2:      doctor2@sodon.mn     / Doctor@123');
  console.log('  Рецепц:     reception@sodon.mn   / Reception@123');
  console.log('  Өвчтөн:     patient@sodon.mn     / Patient@123\n');

  process.exit(0);
};

seed().catch((err) => { console.error('❌ Seed алдаа:', err); process.exit(1); });
