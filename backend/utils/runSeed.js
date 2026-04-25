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

const DOCTORS = [
  { firstName: 'Энхтуяа',    lastName: 'Батсайхан',   email: 'doctor@sodon.mn',   phone: '70000003', gender: 'female', spec: 'Ерөнхий шүдний эмч',        exp: 10, fee: 30000 },
  { firstName: 'Мөнхжаргал', lastName: 'Дорж',        email: 'doctor2@sodon.mn',  phone: '70000004', gender: 'female', spec: 'Хүүхдийн шүдний эмч',       exp: 6,  fee: 30000 },
  { firstName: 'Ганбаатар',  lastName: 'Нямдорж',     email: 'doctor3@sodon.mn',  phone: '70000005', gender: 'male',   spec: 'Шүдний мэс засалч',          exp: 14, fee: 50000 },
  { firstName: 'Уянга',      lastName: 'Цэрэнпунцаг', email: 'doctor4@sodon.mn',  phone: '70000006', gender: 'female', spec: 'Гажуудал засалч (Ортодонт)', exp: 8,  fee: 40000 },
  { firstName: 'Батзаяа',    lastName: 'Лхагвасүрэн', email: 'doctor5@sodon.mn',  phone: '70000007', gender: 'male',   spec: 'Шүдний эстетик эмч',         exp: 5,  fee: 35000 },
];

const PATIENTS = [
  { firstName: 'Батболд',    lastName: 'Гантулга',    email: 'patient@sodon.mn',   phone: '99001122', gender: 'male',   dob: new Date(1988,3,15),  blood:'A+' },
  { firstName: 'Оюунцэцэг', lastName: 'Болд',        email: 'patient2@sodon.mn',  phone: '99112233', gender: 'female', dob: new Date(1995,6,22),  blood:'B+' },
  { firstName: 'Төмөрбаатар',lastName: 'Сүхэ',       email: 'patient3@sodon.mn',  phone: '99223344', gender: 'male',   dob: new Date(1980,1,8),   blood:'O+' },
  { firstName: 'Нарантуяа',  lastName: 'Цэрэн',      email: 'patient4@sodon.mn',  phone: '99334455', gender: 'female', dob: new Date(1992,9,30),  blood:'AB+'},
  { firstName: 'Баярмаа',    lastName: 'Ганзориг',   email: 'patient5@sodon.mn',  phone: '99445566', gender: 'female', dob: new Date(1998,0,12),  blood:'A-' },
  { firstName: 'Энхбаяр',    lastName: 'Пүрэв',      email: 'patient6@sodon.mn',  phone: '99556677', gender: 'male',   dob: new Date(1975,11,5),  blood:'B-' },
  { firstName: 'Тунгалаг',   lastName: 'Батмөнх',    email: 'patient7@sodon.mn',  phone: '99667788', gender: 'female', dob: new Date(2000,4,19),  blood:'O-' },
  { firstName: 'Дашням',     lastName: 'Жамц',       email: 'patient8@sodon.mn',  phone: '99778899', gender: 'male',   dob: new Date(1983,7,27),  blood:'A+' },
  { firstName: 'Солонго',    lastName: 'Энхтөр',     email: 'patient9@sodon.mn',  phone: '99889900', gender: 'female', dob: new Date(1991,2,14),  blood:'B+' },
  { firstName: 'Мандах',     lastName: 'Цогзолмаа',  email: 'patient10@sodon.mn', phone: '99990011', gender: 'male',   dob: new Date(1969,5,3),   blood:'AB-'},
  { firstName: 'Амгалан',    lastName: 'Бат-Эрдэнэ', email: 'patient11@sodon.mn', phone: '88001122', gender: 'male',   dob: new Date(1994,8,9),   blood:'O+' },
  { firstName: 'Цэцэгмаа',   lastName: 'Лхамсүрэн',  email: 'patient12@sodon.mn', phone: '88112233', gender: 'female', dob: new Date(1987,10,25), blood:'A+' },
];

const defaultSchedule = [1,2,3,4,5].map((d) => ({
  dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotDuration: 30, isWorking: true,
}));

module.exports = async function runSeed() {
  console.log('🌱 Бүрэн seed эхэллээ...');

  await Promise.all([
    User.deleteMany({}), Patient.deleteMany({}), Doctor.deleteMany({}),
    Service.deleteMany({}), Appointment.deleteMany({}), Diagnosis.deleteMany({}),
    Prescription.deleteMany({}), Payment.deleteMany({}),
    DentalChart.deleteMany({}), Notification.deleteMany({}),
  ]);

  const services = await Service.insertMany(SERVICES);
  console.log(`✅ ${services.length} үйлчилгээ`);

  const adminUser = await User.create({ firstName:'Администратор', lastName:'Систем', email:'admin@sodon.mn', phone:'70000001', password:'Admin@123', role:'admin', gender:'other' });
  const receptionUser = await User.create({ firstName:'Рецепционист', lastName:'Содон', email:'reception@sodon.mn', phone:'70000002', password:'Reception@123', role:'receptionist', gender:'female' });

  const doctorDocs = [];
  for (const d of DOCTORS) {
    const u = await User.create({ firstName:d.firstName, lastName:d.lastName, email:d.email, phone:d.phone, password:'Doctor@123', role:'doctor', gender:d.gender });
    const doc = await Doctor.create({
      user: u._id, specialization: d.spec, experience: d.exp, consultationFee: d.fee,
      schedule: defaultSchedule, isAvailable: true,
      rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
      ratingCount: 15 + Math.floor(Math.random() * 40),
    });
    doctorDocs.push({ user: u, doctor: doc });
  }
  console.log(`✅ ${doctorDocs.length} эмч`);

  const toothSets = [
    [{toothNumber:16,status:'caries'},{toothNumber:26,status:'filling'}],
    [{toothNumber:36,status:'missing'},{toothNumber:11,status:'caries'}],
    [{toothNumber:17,status:'crown'},{toothNumber:27,status:'root-canal'}],
    [{toothNumber:46,status:'missing'},{toothNumber:15,status:'filling'}],
    [{toothNumber:14,status:'caries'},{toothNumber:24,status:'caries'}],
    [{toothNumber:18,status:'extraction-needed'}],
    [{toothNumber:16,status:'crown'},{toothNumber:36,status:'filling'}],
    [{toothNumber:11,status:'filling'},{toothNumber:12,status:'filling'}],
    [{toothNumber:45,status:'root-canal'}],
    [{toothNumber:31,status:'missing'},{toothNumber:41,status:'missing'}],
    [{toothNumber:22,status:'caries'},{toothNumber:23,status:'filling'}],
    [{toothNumber:17,status:'extraction-needed'},{toothNumber:28,status:'missing'}],
  ];

  const patientDocs = [];
  for (let i = 0; i < PATIENTS.length; i++) {
    const p = PATIENTS[i];
    const u = await User.create({ firstName:p.firstName, lastName:p.lastName, email:p.email, phone:p.phone, password:'Patient@123', role:'patient', gender:p.gender, dateOfBirth:p.dob });
    const pat = await Patient.create({ user:u._id, registeredBy:receptionUser._id, bloodType:p.blood, allergies: i%4===0?['Пенициллин']:[], medicalHistory: i%3===0?'Чихрийн шижин (II хэлбэр)':'' });
    await DentalChart.create({ patient:u._id, teeth:toothSets[i%toothSets.length], examDoctor:doctorDocs[i%doctorDocs.length].user._id, lastExamDate:new Date(Date.now()-(i*15+7)*86400000) });
    patientDocs.push({ user:u, patient:pat });
  }
  console.log(`✅ ${patientDocs.length} өвчтөн`);

  const now = new Date();
  const apptData = [];
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30'];

  for (let i = 0; i < 35; i++) {
    const date = new Date(now); date.setDate(date.getDate() - (1 + Math.floor(i*1.8))); date.setHours(0,0,0,0);
    if (date.getDay()===0) date.setDate(date.getDate()-2); if (date.getDay()===6) date.setDate(date.getDate()-1);
    const svc = services[i%services.length];
    const startTime = times[i%times.length];
    const [sh,sm] = startTime.split(':').map(Number); const em = sm+svc.duration;
    const endTime = `${String(sh+Math.floor(em/60)).padStart(2,'0')}:${String(em%60).padStart(2,'0')}`;
    const status = i%7===0?'cancelled':i%9===0?'no-show':'completed';
    apptData.push({ patient:patientDocs[i%patientDocs.length].user._id, doctor:doctorDocs[i%doctorDocs.length].user._id, service:svc._id, date, startTime, endTime, status, completedAt:status==='completed'?date:undefined });
  }
  for (let i = 0; i < 20; i++) {
    const date = new Date(now); date.setDate(date.getDate() + (1+Math.floor(i*0.8))); date.setHours(0,0,0,0);
    if (date.getDay()===0) date.setDate(date.getDate()+1); if (date.getDay()===6) date.setDate(date.getDate()+2);
    const svc = services[(i+3)%services.length];
    const startTime = times[i%times.length];
    const [sh,sm] = startTime.split(':').map(Number); const em = sm+svc.duration;
    const endTime = `${String(sh+Math.floor(em/60)).padStart(2,'0')}:${String(em%60).padStart(2,'0')}`;
    apptData.push({ patient:patientDocs[(i+2)%patientDocs.length].user._id, doctor:doctorDocs[i%doctorDocs.length].user._id, service:svc._id, date, startTime, endTime, status:i%3===0?'pending':'confirmed' });
  }
  const appointments = await Appointment.insertMany(apptData);
  console.log(`✅ ${appointments.length} цаг захиалга`);

  const completedAppts = appointments.filter(a=>a.status==='completed').slice(0,20);
  const dxNames = ['Кариес (K02.1)','Пульпит (K04.0)','Периодонтит (K05.2)','Гингивит (K05.1)','Шүдний мэдрэмтгий байдал','Ерөнхий оношлогоо'];
  await Diagnosis.insertMany(completedAppts.map((a,i)=>({ patient:a.patient, doctor:a.doctor, appointment:a._id, diagnosis:dxNames[i%dxNames.length], description:'Эмчилгээ амжилттай.', treatment:['Цэвэрлэгээ','Нөхдөс','Шүд авалт'][i%3], date:a.date })));

  const meds = [
    {name:'Амоксициллин 500мг',dosage:'1×3',duration:'5 өдөр',instructions:'Хоолны дараа'},
    {name:'Ибупрофен 400мг',dosage:'1×2',duration:'3 өдөр',instructions:'Өвдөлт үед'},
    {name:'Метронидазол 250мг',dosage:'1×3',duration:'7 өдөр',instructions:'Хоолны дараа'},
    {name:'Парацетамол 500мг',dosage:'1×3',duration:'3 өдөр',instructions:'Өвдөлт үед'},
  ];
  await Prescription.insertMany(completedAppts.slice(0,15).map((a,i)=>({ patient:a.patient, doctor:a.doctor, appointment:a._id, medications:[meds[i%meds.length]], issuedAt:a.date })));

  const payMethods = ['cash','card','qr','insurance'];
  await Payment.insertMany(completedAppts.slice(0,28).map((a,i)=>({ patient:a.patient, appointment:a._id, amount:services[i%services.length].price, method:payMethods[i%payMethods.length], status:'paid', paidAt:a.date, receivedBy:receptionUser._id })));

  console.log('✅ Оношлогоо, жор, төлбөр нэмэгдлээ');
  console.log('🎉 Бүрэн seed дууслаа!');
};
