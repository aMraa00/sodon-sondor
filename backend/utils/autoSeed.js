const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const DentalChart = require('../models/DentalChart');

const SERVICES = [
  { name: 'Оношлогоо & Зөвлөгөө', category: 'diagnosis',    price: 30000,   duration: 30,  isActive: true },
  { name: 'Шүд цэвэрлэгээ',       category: 'cleaning',     price: 50000,   duration: 45,  isActive: true },
  { name: 'Шүд цайруулалт',       category: 'whitening',    price: 150000,  duration: 60,  isActive: true },
  { name: 'Шүдний нөхдөс',        category: 'filling',      price: 80000,   duration: 45,  isActive: true },
  { name: 'Шүд авалт',            category: 'extraction',   price: 60000,   duration: 30,  isActive: true },
  { name: 'Суваг эмчилгээ',       category: 'surgery',      price: 200000,  duration: 90,  isActive: true },
  { name: 'Брекет',               category: 'orthodontics', price: 800000,  duration: 60,  isActive: true },
  { name: 'Имплант',              category: 'surgery',      price: 1200000, duration: 120, isActive: true },
];

const defaultSchedule = [1, 2, 3, 4, 5].map((d) => ({
  dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotDuration: 30, isWorking: true,
}));

module.exports = async function autoSeedIfEmpty() {
  try {
    const count = await User.countDocuments();
    if (count > 0) return; // Өгөгдөл байгаа — seed хийхгүй

    console.log('🌱 DB хоосон байна. Авто seed эхэллээ...');

    await Service.insertMany(SERVICES);

    const admin = await User.create({
      firstName: 'Администратор', lastName: 'Систем',
      email: 'admin@sodon.mn', phone: '70000001',
      password: 'Admin@123', role: 'admin', gender: 'other',
    });

    const reception = await User.create({
      firstName: 'Рецепц', lastName: 'Систем',
      email: 'reception@sodon.mn', phone: '70000002',
      password: 'Reception@123', role: 'receptionist', gender: 'female',
    });

    const doctorUser = await User.create({
      firstName: 'Энхтуяа', lastName: 'Батсайхан',
      email: 'doctor@sodon.mn', phone: '70000003',
      password: 'Doctor@123', role: 'doctor', gender: 'female',
    });
    await Doctor.create({
      user: doctorUser._id,
      specialization: 'Ерөнхий шүдний эмч',
      experience: 8, consultationFee: 30000,
      schedule: defaultSchedule, isAvailable: true,
      rating: 4.5, ratingCount: 20,
    });

    const patientUser = await User.create({
      firstName: 'Батболд', lastName: 'Гантулга',
      email: 'patient@sodon.mn', phone: '99001122',
      password: 'Patient@123', role: 'patient',
      gender: 'male', dateOfBirth: new Date(1990, 0, 1),
    });
    await Patient.create({ user: patientUser._id, registeredBy: reception._id, bloodType: 'A+' });
    await DentalChart.create({
      patient: patientUser._id,
      teeth: [{ toothNumber: 16, status: 'caries' }],
      examDoctor: doctorUser._id,
      lastExamDate: new Date(),
    });

    console.log('✅ Авто seed дууслаа. Demo нэвтрэх мэдээлэл:');
    console.log('   Admin:   admin@sodon.mn / Admin@123');
    console.log('   Эмч:     doctor@sodon.mn / Doctor@123');
    console.log('   Рецепц:  reception@sodon.mn / Reception@123');
    console.log('   Өвчтөн:  patient@sodon.mn / Patient@123');
  } catch (err) {
    console.error('⚠️  Авто seed алдаа:', err.message);
  }
};
