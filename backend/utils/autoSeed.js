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

const DEMO_USERS = [
  { firstName: 'Администратор', lastName: 'Систем',   email: 'admin@sodon.mn',      phone: '70000001', password: 'Admin@123',      role: 'admin',        gender: 'other'  },
  { firstName: 'Рецепц',        lastName: 'Систем',   email: 'reception@sodon.mn',  phone: '70000002', password: 'Reception@123',  role: 'receptionist', gender: 'female' },
  { firstName: 'Энхтуяа',       lastName: 'Батсайхан',email: 'doctor@sodon.mn',     phone: '70000003', password: 'Doctor@123',     role: 'doctor',       gender: 'female' },
  { firstName: 'Батболд',       lastName: 'Гантулга', email: 'patient@sodon.mn',    phone: '99001122', password: 'Patient@123',    role: 'patient',      gender: 'male', dateOfBirth: new Date(1990, 0, 1) },
];

module.exports = async function autoSeedIfEmpty() {
  try {
    // Үйлчилгээ байхгүй бол нэмэх
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(SERVICES);
      console.log(`🌱 ${SERVICES.length} үйлчилгээ нэмэгдлээ`);
    }

    let seeded = 0;

    for (const data of DEMO_USERS) {
      const exists = await User.findOne({ email: data.email });
      if (exists) continue; // Аль хэдийн байгаа — алгасах

      const user = await User.create(data);
      seeded++;

      if (data.role === 'doctor') {
        await Doctor.create({
          user: user._id,
          specialization: 'Ерөнхий шүдний эмч',
          experience: 8, consultationFee: 30000,
          schedule: defaultSchedule, isAvailable: true,
          rating: 4.5, ratingCount: 20,
        });
      }

      if (data.role === 'patient') {
        const reception = await User.findOne({ email: 'reception@sodon.mn' });
        await Patient.create({ user: user._id, registeredBy: reception?._id, bloodType: 'A+' });
        const doctor = await User.findOne({ email: 'doctor@sodon.mn' });
        await DentalChart.create({
          patient: user._id,
          teeth: [{ toothNumber: 16, status: 'caries' }],
          examDoctor: doctor?._id,
          lastExamDate: new Date(),
        });
      }
    }

    if (seeded > 0) {
      console.log(`✅ Авто seed дууслаа — ${seeded} demo хэрэглэгч үүслээ`);
      console.log('   admin@sodon.mn / Admin@123');
      console.log('   doctor@sodon.mn / Doctor@123');
      console.log('   reception@sodon.mn / Reception@123');
      console.log('   patient@sodon.mn / Patient@123');
    }
  } catch (err) {
    console.error('⚠️  Авто seed алдаа:', err.message);
  }
};
