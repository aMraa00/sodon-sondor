require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const DentalChart = require('../models/DentalChart');

const connectDB = require('../config/db');

const SERVICES = [
  { name: 'Оношлогоо & Зөвлөгөө', nameEn: 'Consultation', category: 'diagnosis', price: 30000, duration: 30, icon: 'stethoscope', isActive: true },
  { name: 'Шүд цэвэрлэгээ', nameEn: 'Cleaning', category: 'cleaning', price: 50000, duration: 45, icon: 'sparkles', isActive: true },
  { name: 'Шүд цайруулалт', nameEn: 'Whitening', category: 'whitening', price: 150000, duration: 60, icon: 'sun', isActive: true },
  { name: 'Шүдний нөхдөс', nameEn: 'Filling', category: 'filling', price: 80000, duration: 45, icon: 'hammer', isActive: true },
  { name: 'Шүд авалт', nameEn: 'Extraction', category: 'extraction', price: 60000, duration: 30, icon: 'scissors', isActive: true },
  { name: 'Зубны эмчилгээ', nameEn: 'Root Canal', category: 'surgery', price: 200000, duration: 90, icon: 'activity', isActive: true },
  { name: 'Брекет', nameEn: 'Braces', category: 'orthodontics', price: 800000, duration: 60, icon: 'align-center', isActive: true },
  { name: 'Имплант', nameEn: 'Implant', category: 'surgery', price: 1200000, duration: 120, icon: 'anchor', isActive: true },
];

const DOCTORS_DATA = [
  { firstName: 'Энхтуяа', lastName: 'Батсайхан', email: 'doctor@sodon.mn', specialization: 'Ерөнхий шүдний эмч', experience: 8, consultationFee: 30000 },
  { firstName: 'Мөнхжаргал', lastName: 'Дорж', email: 'doctor2@sodon.mn', specialization: 'Хүүхдийн шүдний эмч', experience: 5, consultationFee: 30000 },
  { firstName: 'Ганбаатар', lastName: 'Нямдорж', email: 'doctor3@sodon.mn', specialization: 'Шүдний мэс засалч', experience: 12, consultationFee: 50000 },
];

const PATIENTS_DATA = [
  { firstName: 'Батболд', lastName: 'Гантулга', email: 'patient@sodon.mn', phone: '99001122', gender: 'male' },
  { firstName: 'Оюунцэцэг', lastName: 'Болд', email: 'patient2@sodon.mn', phone: '99112233', gender: 'female' },
  { firstName: 'Төмөрбаатар', lastName: 'Сүхэ', email: 'patient3@sodon.mn', phone: '99223344', gender: 'male' },
  { firstName: 'Нарантуяа', lastName: 'Цэрэн', email: 'patient4@sodon.mn', phone: '99334455', gender: 'female' },
  { firstName: 'Баярмаа', lastName: 'Ганзориг', email: 'patient5@sodon.mn', phone: '99445566', gender: 'female' },
  { firstName: 'Энхбаяр', lastName: 'Пүрэв', email: 'patient6@sodon.mn', phone: '99556677', gender: 'male' },
  { firstName: 'Тунгалаг', lastName: 'Батмөнх', email: 'patient7@sodon.mn', phone: '99667788', gender: 'female' },
  { firstName: 'Дашням', lastName: 'Жамц', email: 'patient8@sodon.mn', phone: '99778899', gender: 'male' },
  { firstName: 'Солонго', lastName: 'Энхтөр', email: 'patient9@sodon.mn', phone: '99889900', gender: 'female' },
  { firstName: 'Мандах', lastName: 'Цогзолмаа', email: 'patient10@sodon.mn', phone: '99990011', gender: 'male' },
];

const defaultSchedule = [1,2,3,4,5].map((d) => ({
  dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotDuration: 30, isWorking: true,
}));

const seed = async () => {
  await connectDB();
  console.log('🌱 Seed эхэллээ...');

  await Promise.all([
    User.deleteMany({}), Patient.deleteMany({}), Doctor.deleteMany({}),
    Service.deleteMany({}), Appointment.deleteMany({}), DentalChart.deleteMany({}),
  ]);

  const services = await Service.insertMany(SERVICES);
  console.log(`✅ ${services.length} үйлчилгээ нэмэгдлээ`);

  const adminUser = await User.create({ firstName: 'Администратор', lastName: 'Систем', email: 'admin@sodon.mn', phone: '70000001', password: 'Admin@123', role: 'admin', gender: 'other' });
  const receptionUser = await User.create({ firstName: 'Рецепц', lastName: 'Систем', email: 'reception@sodon.mn', phone: '70000002', password: 'Reception@123', role: 'receptionist', gender: 'female' });
  console.log('✅ Admin, Receptionist нэмэгдлээ');

  const doctorUsers = [];
  for (const d of DOCTORS_DATA) {
    const u = await User.create({ ...d, phone: '7000000' + (DOCTORS_DATA.indexOf(d) + 3), password: 'Doctor@123', role: 'doctor' });
    const doc = await Doctor.create({ user: u._id, specialization: d.specialization, experience: d.experience, consultationFee: d.consultationFee, schedule: defaultSchedule, isAvailable: true, rating: 4.5, ratingCount: 20 });
    doctorUsers.push({ user: u, doctor: doc });
  }
  console.log(`✅ ${doctorUsers.length} эмч нэмэгдлээ`);

  const patientUsers = [];
  for (const p of PATIENTS_DATA) {
    const u = await User.create({ ...p, password: 'Patient@123', role: 'patient', dateOfBirth: new Date(1990 + patientUsers.length, 0, 1) });
    const pat = await Patient.create({ user: u._id, registeredBy: receptionUser._id, bloodType: ['A+','B+','O+'][patientUsers.length % 3] });
    await DentalChart.create({ patient: u._id, teeth: [{ toothNumber: 16, status: 'caries' }, { toothNumber: 26, status: 'filling' }], examDoctor: doctorUsers[0].user._id, lastExamDate: new Date() });
    patientUsers.push({ user: u, patient: pat });
  }
  console.log(`✅ ${patientUsers.length} өвчтөн нэмэгдлээ`);

  const statuses = ['confirmed', 'completed', 'pending', 'cancelled'];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
  const appts = [];
  for (let i = 0; i < 20; i++) {
    const daysOffset = i - 10;
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(0, 0, 0, 0);
    const t = times[i % times.length];
    const [h, m] = t.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(h, m + 30, 0, 0);
    const endTime = `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`;
    appts.push({
      patient: patientUsers[i % patientUsers.length].user._id,
      doctor: doctorUsers[i % doctorUsers.length].user._id,
      service: services[i % services.length]._id,
      date,
      startTime: t,
      endTime,
      status: statuses[i % statuses.length],
      notes: 'Seed өгөгдөл',
    });
  }
  await Appointment.insertMany(appts);
  console.log(`✅ 20 цаг захиалга нэмэгдлээ`);

  console.log('\n🎉 Seed амжилттай дууслаа!\n');
  console.log('Demo хэрэглэгчид:');
  console.log('  Admin:     admin@sodon.mn / Admin@123');
  console.log('  Эмч:       doctor@sodon.mn / Doctor@123');
  console.log('  Рецепц:    reception@sodon.mn / Reception@123');
  console.log('  Өвчтөн:    patient@sodon.mn / Patient@123\n');

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
