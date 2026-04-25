const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Та шүдний эмнэлгийн AI оношилгооны туслах юм. Эмч нарт шүдний өвчин оношлоход тусалдаг мэргэшсэн систем.
Зөвхөн шүдний болон амны хөндийн өвчнүүдийн талаар зөвлөгөө өгнө.
Хариултаа заавал цэвэр JSON формататаар өгнө. Монгол хэлээр тайлбар бичнэ.`;

exports.getPatientSymptomCheck = async ({ symptoms, age, gender }) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Та шүдний эмнэлгийн AI туслах юм. Өвчтөнд ойлгомжтой, энгийн үгээр хариулна уу.
Яаралтай байдлыг тодорхойлж, гэрт хийх арчилгааны зөвлөмж өгнө. Зөвхөн JSON форматаар хариулна.`,
      },
      {
        role: 'user',
        content: `Нас: ${age || 'тодорхойгүй'}, Хүйс: ${gender === 'male' ? 'Эрэгтэй' : gender === 'female' ? 'Эмэгтэй' : 'тодорхойгүй'}

Шинж тэмдэг: ${symptoms}

Дараах JSON-ээр хариулна уу:
{
  "summary": "Богино тайлбар (1 өгүүлбэр, энгийн үгээр)",
  "urgency": "urgent эсвэл soon эсвэл routine",
  "urgencyLabel": "Яаралтай очих / Удахгүй очих / Цаг захиалах",
  "urgencyReason": "Яагаад тийм яаралтай байдалтай байгаа тайлбар",
  "possibleCauses": ["Боломжит шалтгаан 1", "Боломжит шалтгаан 2"],
  "homeCare": ["Гэрийн арчилгаа 1", "Гэрийн арчилгаа 2"],
  "warningSigns": ["Энэ тэмдэг гарвал яаралтай очно уу"]
}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = completion.choices[0].message.content.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI хариулт JSON форматтай биш байна');
  return JSON.parse(jsonMatch[0]);
};

exports.getDentalDiagnosisSuggestion = async ({ symptoms, patientAge, patientGender, teethAffected }) => {
  const teethInfo = teethAffected?.length ? `Өртсөн шүд (FDI): ${teethAffected.join(', ')}` : '';

  const userPrompt = `Өвчтөний мэдээлэл:
- Нас: ${patientAge || 'тодорхойгүй'}
- Хүйс: ${patientGender === 'male' ? 'Эрэгтэй' : patientGender === 'female' ? 'Эмэгтэй' : 'тодорхойгүй'}
${teethInfo}

Шинж тэмдэг / Гомдол:
${symptoms}

Дараах JSON форматаар хариулна уу (зөвхөн JSON, өөр текст хэрэггүй):

{
  "title": "Оношилгооны нэр монголоор",
  "titleEn": "Diagnosis name in English",
  "icdCode": "ICD-10 код жишээ K02.1",
  "severity": "mild эсвэл moderate эсвэл severe",
  "description": "Нарийвчилсан тайлбар монгол хэлээр 2-3 өгүүлбэр",
  "recommendations": ["Зөвлөмж 1", "Зөвлөмж 2", "Зөвлөмж 3"],
  "differentialDiagnoses": ["Ялгах оношилгоо 1", "Ялгах оношилгоо 2"],
  "urgency": "routine эсвэл soon эсвэл urgent",
  "confidence": 75
}`;

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const text = completion.choices[0].message.content.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI хариулт JSON форматтай биш байна');

  return JSON.parse(jsonMatch[0]);
};
