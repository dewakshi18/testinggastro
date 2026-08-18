export interface PrintPatient {
  name: string;
  age?: number | string;
  gender?: string;
  mrn?: string;
  phone?: string;
  fatherName?: string;
  allergies?: string | string[];
  pastHistory?: string;
  medicalHistory?: string;
  clinicalHistory?: string;
  history?: string;
  complaints?: string;
  attendingDoctor?: string;
  attendingDoctorId?: string;
}

export interface PrintMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  time?: string;
  startTime?: string;
  instructions?: string;
  route?: string;
  remarks?: string;
}

export interface PrintVitals {
  temp?: string | number;
  temperature?: string | number;
  bp?: string;
  blood_pressure?: string;
  bloodPressure?: string;
  bpSystolic?: string | number;
  bpDiastolic?: string | number;
  pulse?: string | number;
  pulse_rate?: string | number;
  pulseRate?: string | number;
  spo2?: string | number;
  weight?: string | number;
  height?: string | number;
  bmi?: string | number;
  rr?: string | number;
  respiration?: string | number;
  respRate?: string | number;
  cbs?: string;
  rs?: string;
  cns?: string;
  cvs?: string;
  pa?: string;
  perAbdomen?: string;
  per_abdomen?: string;
  localExam?: string;
  local_exam?: string;
  localExamination?: string;
  inputOutput?: string;
  input_output?: string;
  io?: string;
  pr?: string;
  rbs?: string;
  grbs?: string;
  sugar?: string;
  blood_sugar?: string;
  gcs?: string;
  gcsTotal?: string;
  painScale?: string;
  pallor?: string;
  icterus?: string;
  edema?: string;
  clubbing?: string;
  cyanosis?: string;
  lymphadenopathy?: string;
}

export interface PrintPrescription {
  date?: string;
  medicines: PrintMedicine[];
  advice?: string;
  diagnosis?: string;
  notes?: string;
  examinationFindings?: string;
  pastHistory?: string;
  allergies?: string | string[];
  complaints?: string;
  chiefComplaints?: string;
  drawing?: string;
  photos?: string[];
  attachmentUrl?: string;
  attachmentName?: string;
  vitals?: PrintVitals;
  findings?: string;
  suggestions?: string;
  investigationsAdvised?: string | string[];
  followUpDate?: string;
  planSurgeryNeeded?: boolean | string;
  plannedSurgeryName?: string;
  plannedSurgeryDate?: string;
  plannedSurgeryNotes?: string;
  admitNeeded?: string;
  admitReason?: string;
  admitWardType?: string;
  generalInstructions?: string;
}

export interface PrintDoctor {
  name?: string;
  degree?: string;
  qualification?: string;
  qualifications?: string;
  specialization?: string;
  speciality?: string;
  department?: string;
  id?: string;
  registrationNo?: string;
  regNo?: string;
  experience?: string;
  phone?: string;
  signatureUrl?: string;
}

export function getPrescriptionPrintHtml(
  patient: PrintPatient,
  prescription: PrintPrescription,
  doctor?: PrintDoctor,
  hospitalInfo?: { name?: string; address?: string; phone?: string; email?: string; website?: string; logo?: string | null; subTitle?: string; reviewUrl?: string },
  templateImage?: string | null
): string {
  const actualTemplateImage = templateImage !== undefined ? templateImage : (typeof window !== 'undefined' ? localStorage.getItem('hms_template_image') : null);

  // Parse whether there is a valid custom preprinted background letterhead image (to overlay on)
  const isValidTemplateImage = !!(
    actualTemplateImage &&
    typeof actualTemplateImage === 'string' &&
    actualTemplateImage.trim() !== '' &&
    actualTemplateImage !== 'null' &&
    actualTemplateImage !== 'undefined' &&
    (actualTemplateImage.startsWith('http') || actualTemplateImage.startsWith('data:image') || actualTemplateImage.startsWith('/'))
  );

  let storedHospInfo: any = {};
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('hms_hospital_info');
      if (raw) storedHospInfo = JSON.parse(raw);
    }
  } catch (_) {}

  // Hospital Info variables
  const hospName = hospitalInfo?.name || storedHospInfo?.name || 'NEO GASTRO HOSPITAL';
  const hospSubTitle = hospitalInfo?.subTitle || storedHospInfo?.subTitle || storedHospInfo?.tagline || 'SUPER SPECIALITY GASTRO & OT SURGICAL CENTER';
  const hospAddress = hospitalInfo?.address || storedHospInfo?.address || 'Infront of Aura Inn, Bansi Road near Badewan, Basti UP 272001';
  const hospPhone = hospitalInfo?.phone || storedHospInfo?.phone || '+91 86015 61055';
  const hospEmail = hospitalInfo?.email || storedHospInfo?.email || 'info@neogastroplus.com';
  const hospWebsite = hospitalInfo?.website || storedHospInfo?.website || 'www.neogastroplus.com';
  const hospLogo = hospitalInfo?.logo !== undefined ? hospitalInfo?.logo : storedHospInfo?.logo;
  const reviewUrl = hospitalInfo?.reviewUrl || storedHospInfo?.reviewUrl || 'https://g.page/r/neogastroplus/review';

  // Dynamic Doctor Lookup & Resolution
  let resolvedDoctor: any = doctor || {};
  if (typeof window !== 'undefined') {
    try {
      const storedUsersRaw = localStorage.getItem('hms_users') || localStorage.getItem('hms_staff');
      const usersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      if (Array.isArray(usersList) && usersList.length > 0) {
        const searchDocName = (doctor?.name || (prescription as any)?.doctorName || (prescription as any)?.doctor || patient?.attendingDoctor || (patient as any)?.attending_doctor || '').trim().toLowerCase();
        const searchDocId = (doctor?.id || (prescription as any)?.doctorId || (prescription as any)?.doctor_id || patient?.attendingDoctorId || (patient as any)?.attending_doctor_id || '').trim();
        
        const matched = usersList.find((u: any) => 
          (searchDocId && (String(u.id) === searchDocId || u.uuid === searchDocId)) ||
          (searchDocName && u.name && u.name.trim().toLowerCase() === searchDocName) ||
          (searchDocName && u.name && u.name.trim().toLowerCase().replace(/^dr\.\s*/i, '') === searchDocName.replace(/^dr\.\s*/i, ''))
        );
        if (matched) {
          resolvedDoctor = { ...matched, ...doctor };
        }
      }
    } catch (_) {}
  }

  // Dynamic Doctor Info
  const rawDocName = resolvedDoctor?.name || doctor?.name || (prescription as any)?.doctorName || (prescription as any)?.doctor || 'DR. ANIRUDH TIWARI';
  const docName = rawDocName.startsWith('Dr.') || rawDocName.startsWith('DR.') ? rawDocName : `DR. ${rawDocName.toUpperCase()}`;
  const docDegree = resolvedDoctor?.degree || resolvedDoctor?.qualification || doctor?.degree || doctor?.qualification || 'MS, FMAS';
  const docSpecialty = resolvedDoctor?.specialization || resolvedDoctor?.speciality || resolvedDoctor?.department || doctor?.specialization || doctor?.speciality || doctor?.department || 'Consultant GI & Laparoscopic Surgeon';
  const docRegNo = resolvedDoctor?.registrationNo || resolvedDoctor?.regNo || doctor?.registrationNo || doctor?.regNo || (resolvedDoctor?.id ? `MP-${resolvedDoctor.id}` : 'MP-15063');
  const docExp = resolvedDoctor?.experience || doctor?.experience || '10+ Years';
  const docSigUrl = resolvedDoctor?.signatureUrl || doctor?.signatureUrl || storedHospInfo?.doctorSignature || '';

  // Dynamic Patient Info
  const patName = patient?.name || 'Sheetal';
  const patAge = patient?.age ? String(patient.age) : '33';
  const patGender = patient?.gender || 'Female';
  const patAgeGender = `${patAge} Y / ${patGender}`;
  
  // Format Date cleanly e.g. "02 Aug 2026"
  let presDate = prescription?.date || new Date().toISOString().split('T')[0];
  let formattedPresDate = presDate;
  try {
    const d = new Date(presDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      formattedPresDate = `${day} ${month} ${year}`;
    }
  } catch (e) {}

  const patMRN = patient?.mrn || 'MRN36691';
  const patPhone = patient?.phone || (patient as any)?.mobile || '7217653952';

  // Fresh QR Code URL for patient prescription viewing
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://neogastroplus.com';
  const patientQrData = `Hospital: ${hospName}\nPatient: ${patName}\nMRN: ${patMRN}\nDate: ${formattedPresDate}\nDoctor: ${docName}\nVerify: ${siteUrl}/prescription?mrn=${encodeURIComponent(patMRN)}`;
  const patientQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(patientQrData)}`;
  const googleReviewQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(reviewUrl)}`;

  // Extract advice, examination, history, allergies, drawing, diagnosis, photos
  let advText = prescription.advice || prescription.suggestions || prescription.notes || '';
  let examFindings = prescription.examinationFindings || prescription.findings || '';
  let drawImg = prescription.drawing || '';
  let diag = prescription.diagnosis || '';
  let photoList: string[] = prescription.photos ? [...prescription.photos] : [];
  
  // Combine vitals from patient object and prescription
  let vts: any = {
    ...((patient as any)?.vitals || {}),
    ...(prescription?.vitals || {})
  };

  // Extract complaints, allergies, and clinical history from prescription or patient record
  let rawAllergies = prescription.allergies || patient?.allergies || (patient as any)?.known_allergies || (patient as any)?.allergy || (patient as any)?.allergies_list;
  let allergiesText = '';
  if (Array.isArray(rawAllergies)) {
    allergiesText = rawAllergies.filter(Boolean).join(', ');
  } else if (typeof rawAllergies === 'string') {
    allergiesText = rawAllergies.trim();
  }

  let pastHist = prescription.pastHistory || patient?.pastHistory || patient?.medicalHistory || patient?.clinicalHistory || patient?.history || (patient as any)?.medical_history || (patient as any)?.past_history || (patient as any)?.past_medical_history || '';

  let complaintsText = prescription.complaints || prescription.chiefComplaints || patient?.complaints || (patient as any)?.presentingComplaints || (patient as any)?.chief_complaints || (patient as any)?.symptoms || '';

  if (prescription.attachmentUrl && prescription.attachmentUrl.startsWith('data:image')) {
    if (!photoList.includes(prescription.attachmentUrl)) {
      photoList.push(prescription.attachmentUrl);
    }
  }

  let planSurgeryNeeded = prescription.planSurgeryNeeded || false;
  let plannedSurgeryName = prescription.plannedSurgeryName || '';
  let plannedSurgeryDate = prescription.plannedSurgeryDate || '';
  let plannedSurgeryNotes = prescription.plannedSurgeryNotes || '';

  let admitNeeded = prescription.admitNeeded || 'No';
  let admitReason = prescription.admitReason || '';
  let admitWardType = prescription.admitWardType || '';

  let genInstructions = prescription.generalInstructions || '';

  // Try deserializing advice if it's stored as JSON
  if (typeof advText === 'string' && advText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(advText);
      if (parsed && typeof parsed === 'object') {
        advText = parsed.advice || parsed.suggestions || '';
        if (parsed.generalInstructions && !genInstructions) genInstructions = parsed.generalInstructions;
        if (parsed.examinationFindings) examFindings = parsed.examinationFindings;
        if (parsed.findings && !examFindings) examFindings = parsed.findings;
        if (parsed.pastHistory && !pastHist) pastHist = parsed.pastHistory;
        if (parsed.allergies && !allergiesText) {
          allergiesText = typeof parsed.allergies === 'string' ? parsed.allergies : (Array.isArray(parsed.allergies) ? parsed.allergies.join(', ') : '');
        }
        if (parsed.complaints && !complaintsText) complaintsText = parsed.complaints;
        if (parsed.investigationsAdvised && (!prescription.investigationsAdvised || (Array.isArray(prescription.investigationsAdvised) && prescription.investigationsAdvised.length === 0))) {
          prescription.investigationsAdvised = parsed.investigationsAdvised;
        }
        if (parsed.investigations && (!prescription.investigationsAdvised || (Array.isArray(prescription.investigationsAdvised) && prescription.investigationsAdvised.length === 0))) {
          prescription.investigationsAdvised = parsed.investigations;
        }
        if (parsed.drawing) drawImg = parsed.drawing;
        if (parsed.diagnosis && !diag) diag = parsed.diagnosis;
        if (parsed.vitals) vts = { ...vts, ...parsed.vitals };
        if (parsed.planSurgeryNeeded !== undefined) planSurgeryNeeded = parsed.planSurgeryNeeded;
        if (parsed.plannedSurgeryName) plannedSurgeryName = parsed.plannedSurgeryName;
        if (parsed.plannedSurgeryDate) plannedSurgeryDate = parsed.plannedSurgeryDate;
        if (parsed.plannedSurgeryNotes) plannedSurgeryNotes = parsed.plannedSurgeryNotes;
        if (parsed.admitNeeded) admitNeeded = parsed.admitNeeded;
        if (parsed.admitReason) admitReason = parsed.admitReason;
        if (parsed.admitWardType) admitWardType = parsed.admitWardType;
        if (parsed.photos && Array.isArray(parsed.photos)) {
          parsed.photos.forEach((ph: string) => {
            if (ph && !photoList.includes(ph)) photoList.push(ph);
          });
        }
        if (parsed.attachmentUrl && parsed.attachmentUrl.startsWith('data:image')) {
          if (!photoList.includes(parsed.attachmentUrl)) photoList.push(parsed.attachmentUrl);
        }
      }
    } catch (e) {
      // Not JSON
    }
  }

  // Format Medicines content
  let medContent = '';
  if (prescription.medicines && prescription.medicines.length > 0) {
    medContent = prescription.medicines.map((m, idx) => {
      const nameStr = m.name || 'Medicine';
      const dosageStr = m.dosage || '-';
      const freqStr = m.frequency || '-';
      const durStr = m.duration || '-';
      const instStr = m.instructions || m.time || m.remarks || m.startTime || '';
      return `
        <tr style="border-bottom: 1px solid #cbd5e1; page-break-inside: avoid;">
          <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 12px; width: 5%; text-align: center;">
            ${idx + 1}.
          </td>
          <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 13px; width: 40%;">
            <div>${nameStr}</div>
            ${m.route ? `<span style="display: inline-block; background-color: #e2e8f0; color: #0f172a; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; margin-top: 3px;">${m.route}</span>` : ''}
          </td>
          <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px; width: 18%;">${dosageStr}</td>
          <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px; width: 22%;">
            <div>${freqStr}</div>
            ${instStr ? `<div style="font-size: 10.5px; color: #1e293b; font-weight: 700; margin-top: 2px;">(${instStr})</div>` : ''}
          </td>
          <td style="padding: 8px 10px; font-weight: 900; color: #000000; font-size: 12.5px; width: 15%;">${durStr}</td>
        </tr>
      `;
    }).join('');
  } else {
    // Default placeholder sample row if empty
    medContent = `
      <tr style="border-bottom: 1px solid #cbd5e1; page-break-inside: avoid;">
        <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 12px; text-align: center;">1.</td>
        <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 13px;">Cap. Racecadotril 100mg</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px;">1 capsule</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px;">Thrice daily<br/><span style="font-size: 10.5px; color: #1e293b; font-weight: 700;">(Before meals)</span></td>
        <td style="padding: 8px 10px; font-weight: 900; color: #000000; font-size: 12.5px;">3 Days</td>
      </tr>
      <tr style="border-bottom: 1px solid #cbd5e1; page-break-inside: avoid;">
        <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 12px; text-align: center;">2.</td>
        <td style="padding: 8px 10px; font-weight: 800; color: #000000; font-size: 13px;">Tab. Ofloxacin 200mg + Ornidazole 500mg</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px;">1 tablet</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a; font-size: 12.5px;">Twice daily<br/><span style="font-size: 10.5px; color: #1e293b; font-weight: 700;">(After breakfast & dinner)</span></td>
        <td style="padding: 8px 10px; font-weight: 900; color: #000000; font-size: 12.5px;">5 Days</td>
      </tr>
    `;
  }

  // Format Diagnosis, Examination Findings, Advice, Drawing, and Doctor Photos content
  let clinicalSummaryHtml = `
    <div style="margin-bottom: 12px; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; gap: 8px; page-break-inside: avoid;">
      <!-- CHIEF COMPLAINT BOX AT THE BEGINNING -->
      ${complaintsText ? `
        <div style="width: 100%; background: #f0fdfa; border: 1.5px solid #99f6e4; border-radius: 6px; padding: 8px 12px; border-left: 4px solid #0d9488; margin-bottom: 4px;">
          <div style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: #0f766e; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>💬 CHIEF COMPLAINTS / PRESENTING SYMPTOMS:</span>
          </div>
          <div style="font-size: 13px; color: #0f172a; font-weight: 700; margin-top: 3px; white-space: pre-wrap; line-height: 1.4;">${complaintsText}</div>
        </div>
      ` : `
        <div style="width: 100%; background: #fafafa; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 10px; border-left: 3px solid #94a3b8; margin-bottom: 4px;">
          <div style="font-weight: 800; font-size: 9.5px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">💬 CHIEF COMPLAINTS:</div>
          <div style="font-size: 12px; color: #64748b; font-style: italic; margin-top: 2px;">Routine Checkup / General Consultation</div>
        </div>
      `}

      <!-- Documented Allergies -->
      ${allergiesText ? `
        <div style="background: #fff5f5; border: 1.5px solid #fecaca; border-radius: 6px; padding: 7px 12px; border-left: 4px solid #dc2626;">
          <div style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: #b91c1c; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>⚠️ DOCUMENTED ALLERGIES & DRUG SENSITIVITIES:</span>
          </div>
          <div style="font-size: 12.5px; color: #7f1d1d; font-weight: 800; margin-top: 2px; white-space: pre-wrap;">${allergiesText}</div>
        </div>
      ` : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 5px 10px; border-left: 3px solid #16a34a; display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">🛡️ Documented Allergies:</span>
          <span style="font-size: 11.5px; color: #15803d; font-weight: 700;">No Known Drug Allergies (NKDA) Recorded</span>
        </div>
      `}

      <!-- Clinical History & Diagnosis -->
      ${(pastHist || diag) ? `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;">
          ${pastHist ? `
            <div style="flex: 1; min-width: 220px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 6px; padding: 7px 10px; border-left: 3.5px solid #4b5563;">
              <div style="font-weight: 800; font-size: 9.5px; text-transform: uppercase; color: #374151; letter-spacing: 0.05em;">📋 Clinical & Past Medical History:</div>
              <div style="font-size: 12px; color: #1f2937; font-weight: 600; margin-top: 2px; white-space: pre-wrap;">${pastHist}</div>
            </div>
          ` : ''}

          ${diag ? `
            <div style="width: 100%; background: #fef2f2; border: 1.5px solid #fee2e2; border-radius: 6px; padding: 7px 10px; border-left: 3.5px solid #dc2626;">
              <div style="font-weight: 800; font-size: 9.5px; text-transform: uppercase; color: #dc2626; letter-spacing: 0.05em;">🩺 Diagnosis / Clinical Impression:</div>
              <div style="font-size: 12.5px; color: #0f172a; font-weight: 800; margin-top: 2px;">${diag}</div>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;

  let additionalSections = '';

  if (examFindings) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #0284c7; letter-spacing: 0.06em; margin-bottom: 4px;">🔍 Examination Findings (O/E Findings):</div>
        <div style="font-size: 12.5px; color: #0c4a6e; font-weight: 600; line-height: 1.5; background: #f0f9ff; border: 1.5px solid #e0f2fe; border-radius: 6px; padding: 8px 12px; border-left: 4px solid #0284c7; white-space: pre-wrap;">${examFindings}</div>
      </div>
    `;
  }

  if (advText) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #059669; letter-spacing: 0.06em; margin-bottom: 4px;">💡 Clinical Remarks, Suggestions & Advice:</div>
        <div style="font-size: 12.5px; color: #064e3b; font-weight: 600; line-height: 1.5; background: #ecfdf5; border: 1.5px solid #d1fae5; border-radius: 6px; padding: 8px 12px; border-left: 4px solid #059669; white-space: pre-wrap;">${advText}</div>
      </div>
    `;
  }

  if (planSurgeryNeeded || plannedSurgeryName) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #c2410c; letter-spacing: 0.06em; margin-bottom: 4px;">🔪 Planned / Advised Surgery:</div>
        <div style="font-size: 12.5px; color: #7c2d12; font-weight: 700; line-height: 1.5; background: #fff7ed; border: 1.5px solid #ffedd5; border-radius: 6px; padding: 10px 14px; border-left: 4px solid #ea580c;">
          <div style="font-size: 13.5px; font-weight: 800; color: #9a3412; display: flex; align-items: center; justify-content: space-between;">
            <span>${plannedSurgeryName || 'Surgical Procedure Advised'}</span>
            ${plannedSurgeryDate ? `<span style="font-size: 11px; background: #ffedd5; color: #c2410c; padding: 2px 8px; border-radius: 4px; font-weight: 800;">Planned Date: ${plannedSurgeryDate}</span>` : ''}
          </div>
          ${plannedSurgeryNotes ? `<div style="font-size: 11.5px; font-weight: 600; color: #7c2d12; margin-top: 5px; white-space: pre-wrap; background: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #fed7aa;">${plannedSurgeryNotes}</div>` : ''}
        </div>
      </div>
    `;
  }

  if (admitNeeded && admitNeeded !== 'No' && admitNeeded !== 'Not Required') {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #b91c1c; letter-spacing: 0.06em; margin-bottom: 4px;">🏥 Hospitalisation / Admission Advice:</div>
        <div style="font-size: 12.5px; color: #7f1d1d; font-weight: 700; line-height: 1.5; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 6px; padding: 10px 14px; border-left: 4px solid #dc2626;">
          <div style="font-size: 13px; font-weight: 800; color: #991b1b; display: flex; align-items: center; justify-content: space-between;">
            <span>⚠️ ${admitNeeded === 'Yes' ? 'Hospital Admission Advised' : admitNeeded}</span>
            ${admitWardType ? `<span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: 800;">Ward/Room: ${admitWardType}</span>` : ''}
          </div>
          ${admitReason ? `<div style="font-size: 11.5px; font-weight: 600; color: #7f1d1d; margin-top: 5px; white-space: pre-wrap; background: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #fca5a5;">Clinical Reason / Notes: ${admitReason}</div>` : ''}
        </div>
      </div>
    `;
  }

  if (prescription.investigationsAdvised) {
    const invStr = Array.isArray(prescription.investigationsAdvised) 
      ? prescription.investigationsAdvised.join(', ') 
      : String(prescription.investigationsAdvised);
    if (invStr.trim()) {
      additionalSections += `
        <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
          <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #4338ca; letter-spacing: 0.06em; margin-bottom: 4px;">🧪 Investigations / Lab & Radiology Advised:</div>
          <div style="font-size: 12.5px; color: #312e81; font-weight: 700; line-height: 1.5; background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 6px; padding: 8px 12px; border-left: 4px solid #4338ca;">${invStr}</div>
        </div>
      `;
    }
  }

  if (prescription.followUpDate) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #047857; letter-spacing: 0.06em; margin-bottom: 4px;">📅 Follow-up / Next Visit Date:</div>
        <div style="font-size: 13px; color: #065f46; font-weight: 800; line-height: 1.5; background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 6px; padding: 8px 12px; border-left: 4px solid #047857; display: inline-block;">${prescription.followUpDate}</div>
      </div>
    `;
  }

  if (drawImg) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #7c3aed; letter-spacing: 0.06em; margin-bottom: 4px;">🎨 Clinical Diagram / Annotations:</div>
        <div style="background: #ffffff; border: 1.5px solid #e9d5ff; border-radius: 6px; padding: 8px; border-left: 4px solid #7c3aed; text-align: center; display: inline-block;">
          <img src="${drawImg}" style="max-height: 200px; display: block; margin: 0 auto; object-fit: contain;" />
        </div>
      </div>
    `;
  }

  if (photoList && photoList.length > 0) {
    additionalSections += `
      <div style="margin-top: 14px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #2563eb; letter-spacing: 0.06em; margin-bottom: 4px;">📷 Clinical Photos Attached:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 8px; border-left: 4px solid #2563eb;">
          ${photoList.map((ph, idx) => `
            <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #ffffff; text-align: center;">
              <img src="${ph}" style="max-height: 160px; max-width: 200px; display: block; object-fit: contain; margin: 0 auto; padding: 4px;" alt="Clinical Photo ${idx + 1}" />
              <div style="font-size: 9px; font-weight: 700; color: #475569; background: #f1f5f9; padding: 2px 4px; border-top: 1px solid #e2e8f0;">Photo ${idx + 1}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Clinical Summary Sections matching exact reference layout
  const complaintsVal = complaintsText || 'Routine Checkup / General Consultation';
  const allergiesVal = allergiesText || 'Not Known';
  const pastHistVal = pastHist || 'No chronic illness. No drug allergies. Asthma/COPD';
  const diagVal = diag || 'Acute Gastroenteritis with Mild Dehydration';
  const examFindingsVal = examFindings || 'Patient alert, mild dry tongue. Abdomen soft with diffuse mild colicky tenderness. No rigidity or guarding. Bowel sounds hyperactive.';
  
  // Format Advice as numbered list if present, or fallback
  let adviceItemsHtml = '';
  if (advText) {
    const lines = advText.split('\n').filter(l => l.trim().length > 0);
    adviceItemsHtml = lines.map((line, i) => {
      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '');
      return `<div style="margin-bottom: 3px; line-height: 1.4;"><b>${i + 1}.</b> ${cleanLine}</div>`;
    }).join('');
  } else {
    adviceItemsHtml = `
      <div style="margin-bottom: 3px; line-height: 1.4;"><b>1.</b> Maintain high fluid intake with ORS (Oral Rehydration Salts) – drink 200ml after each loose motion.</div>
      <div style="margin-bottom: 3px; line-height: 1.4;"><b>2.</b> Restrict diet to light, bland foods (Khichdi, Curd Rice, Banana, Apple Sauce, Toast).</div>
      <div style="margin-bottom: 3px; line-height: 1.4;"><b>3.</b> Avoid milk, dairy, spicy food, raw salads, and juices for 48 hours.</div>
      <div style="margin-bottom: 3px; line-height: 1.4;"><b>4.</b> Hand hygiene is critical: wash hands thoroughly before meals.</div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OPD Prescription - ${patName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Playfair+Display:ital,wght@0,700;1,700&family=Great+Vibes&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: #f1f5f9;
            position: relative;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(0, 61, 70, 0.035);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }

          .page-container {
            width: 210mm;
            min-height: 297mm;
            margin: 15px auto;
            background: #ffffff;
            padding: 8mm 10mm 8mm 10mm;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            position: relative;
            border-radius: 2px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .no-print {
            background: #0f172a;
            padding: 10px 20px;
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          @media print {
            * {
              color: #000000 !important;
              border-color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              font-weight: 600 !important;
            }
            p, div, span, td, th, label, strong, b, h1, h2, h3, h4, h5, h6 {
              color: #000000 !important;
              font-weight: 600 !important;
            }
            th, .font-bold, h1, h2, h3, h4, .section-title, .med-name {
              font-weight: 800 !important;
              color: #000000 !important;
            }
            .page-container {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              padding: 8mm 10mm 8mm 10mm !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .no-print { display: none !important; }
          }

          .clinical-card {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 6px;
            page-break-inside: avoid;
          }

          .clinical-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
          }

          .meds-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 10px;
          }

          .meds-table th {
            background-color: #003d46;
            color: #ffffff;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            padding: 7px 10px;
            text-align: left;
            border: 1px solid #003d46;
          }

          .meds-table td {
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            font-size: 11.5px;
            vertical-align: top;
            color: #000000;
          }

          .meds-table tr:nth-child(even) {
            background-color: #fafafa;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print()" style="background: #003d46; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print OPD Prescription / Save PDF
          </button>
          <button onclick="try{if(window.parent&&window.parent!==window){window.parent.postMessage({type:'close-rx-preview'},'*');}}catch(e){}try{window.close();}catch(e){}" style="background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 9px 18px; border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer;">
            Close
          </button>
        </div>

        <div class="page-container">
          <!-- Background Watermark -->
          <div class="watermark">GastroPlus</div>

          <div style="position: relative; z-index: 1;">
            <!-- TOP HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 4px;">
              <!-- Left Logo (No Background) -->
              <div style="width: 36%;">
                ${hospLogo && hospLogo !== 'null' && hospLogo !== 'undefined' && hospLogo.trim() !== '' ? `
                  <img src="${hospLogo}" style="max-width: 220px; max-height: 65px; object-fit: contain; display: block; background: transparent; mix-blend-mode: multiply;" alt="Hospital Logo" />
                ` : `
                  <div style="display: flex; align-items: center; gap: 8px; background: transparent;">
                    <div style="width: 46px; height: 46px; flex-shrink: 0; background: transparent;">
                      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; background: transparent;">
                        <path d="M68 12 A36 36 0 1 0 88 58 A28 28 0 1 1 68 12 Z" fill="#f59e0b" />
                        <path d="M46 30 H54 V42 H66 V50 H54 V62 H46 V50 H34 V42 H46 Z" fill="#003d46" />
                        <circle cx="50" cy="20" r="3" fill="#f59e0b" />
                      </svg>
                    </div>
                    <div>
                      <div style="font-family: 'Playfair Display', serif; font-weight: 700; font-size: 19px; color: #f59e0b; line-height: 1;">
                        Neo <span style="color: #003d46; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 900;">GastroPlus</span>
                      </div>
                      <div style="font-size: 9px; font-weight: 900; color: #003d46; letter-spacing: 2px; margin-top: 2px; text-transform: uppercase;">
                        — HOSPITAL —
                      </div>
                    </div>
                  </div>
                `}
                <div style="font-size: 8px; font-weight: 800; color: #475569; letter-spacing: 0.4px; margin-top: 3px; font-family: 'Plus Jakarta Sans', sans-serif;">
                  ${hospSubTitle}
                </div>
              </div>

              <!-- Right Header Title & Badges -->
              <div style="width: 64%; text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-bottom: 2px;">
                  <span style="font-size: 11px; font-style: italic; font-family: 'Playfair Display', Georgia, serif; color: #003d46; font-weight: 700;">
                    Excellence in Gastroenterology & Laparoscopic Surgery
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2L15 8L21 9 L16.5 14L18 20L12 16.5L6 20L7.5 14L3 9L9 8L12 2Z"/></svg>
                </div>

                <div style="font-size: 22px; font-weight: 900; color: #003d46; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.1;">
                  ${hospName}
                </div>

                <div style="font-size: 8.5px; font-weight: 800; color: #475569; letter-spacing: 0.6px; margin-top: 2px; text-transform: uppercase;">
                  — ADVANCED GASTRO & MINIMAL ACCESS SURGERY CENTRE —
                </div>

                <div style="display: inline-flex; align-items: center; gap: 6px; background-color: #e6f4f6; border: 1px solid #b2e0e6; padding: 2px 8px; border-radius: 12px; margin-top: 4px; font-size: 7.5px; font-weight: 900; color: #003d46;">
                  <span>GASTROENTEROLOGY</span>
                  <span style="color: #f59e0b;">|</span>
                  <span>GI SURGERY</span>
                  <span style="color: #f59e0b;">|</span>
                  <span>LAPAROSCOPIC SURGERY</span>
                  <span style="color: #f59e0b;">|</span>
                  <span>ENDOSCOPY</span>
                </div>
              </div>
            </div>

            <!-- DOCTOR BANNER (DARK TEAL BAR) -->
            <div style="background-color: #003d46; color: #ffffff; padding: 7px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Left Side: Doctor Info -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; background-color: rgba(255,255,255,0.18); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #81e6d9; letter-spacing: 0.8px;">CONSULTANT</div>
                  <div style="font-size: 15px; font-weight: 900; letter-spacing: 0.3px; line-height: 1.1; font-family: 'Plus Jakarta Sans', sans-serif;">${docName}</div>
                  <div style="font-size: 9.5px; font-weight: 800; color: #facc15; margin-top: 1px;">
                    ${docDegree} <span style="font-weight: 600; color: #e0f2fe; margin-left: 6px;">${docSpecialty}</span>
                  </div>
                </div>
              </div>

              <!-- Right Side: Reg No & Experience -->
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; border-left: 1px solid rgba(255,255,255,0.25); padding-left: 12px;">
                <div style="display: flex; align-items: center; gap: 5px; font-size: 9.5px; font-weight: 700; color: #ffffff;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/></svg>
                  <span>Reg. No.: ${docRegNo}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px; font-size: 9.5px; font-weight: 700; color: #ffffff;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>Experience: ${docExp}</span>
                </div>
              </div>
            </div>

            <!-- CONTACT INFO BAR -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 4px; margin-bottom: 8px; font-size: 8.5px; font-weight: 800; color: #003d46; border-bottom: 1px solid #cbd5e1;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-flex; width: 14px; height: 14px; background-color: #003d46; color: white; border-radius: 50%; justify-content: center; align-items: center; font-size: 7.5px;">📍</span>
                <span>${hospAddress}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-flex; width: 14px; height: 14px; background-color: #003d46; color: white; border-radius: 50%; justify-content: center; align-items: center; font-size: 7.5px;">📞</span>
                <span>${hospPhone}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-flex; width: 14px; height: 14px; background-color: #003d46; color: white; border-radius: 50%; justify-content: center; align-items: center; font-size: 7.5px;">✉️</span>
                <span>${hospEmail}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-flex; width: 14px; height: 14px; background-color: #003d46; color: white; border-radius: 50%; justify-content: center; align-items: center; font-size: 7.5px;">🌐</span>
                <span>${hospWebsite}</span>
              </div>
            </div>

            <!-- PATIENT DETAILS BOX -->
            <div style="border: 1.5px solid #003d46; border-radius: 8px; padding: 5px 8px; margin-bottom: 10px; background-color: #fcfdfd;">
              <table style="width: 100%; border-collapse: collapse; font-family: 'Plus Jakarta Sans', sans-serif;">
                <tr>
                  <!-- Patient Name -->
                  <td style="width: 35%; padding: 3px 6px; vertical-align: middle; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">PATIENT NAME</div>
                        <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${patName}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Age / Sex -->
                  <td style="width: 32%; padding: 3px 6px; vertical-align: middle; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">AGE / SEX</div>
                        <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${patAgeGender}</div>
                      </div>
                    </div>
                  </td>

                  <!-- MRN -->
                  <td style="width: 33%; padding: 3px 6px; vertical-align: middle; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">MRN</div>
                        <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${patMRN}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <!-- Consultant -->
                  <td style="padding: 3px 6px; vertical-align: middle; border-right: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">CONSULTANT</div>
                        <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${docName}</div>
                        <div style="font-size: 8.5px; font-weight: 600; color: #475569;">${docDegree}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Date -->
                  <td style="padding: 3px 6px; vertical-align: middle; border-right: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">DATE</div>
                        <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${formattedPresDate}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Mobile No. -->
                  <td style="padding: 3px 6px; vertical-align: middle;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #003d46; display: flex; align-items: center; justify-content: center; color: #003d46; flex-shrink: 0; background-color: #e6f4f6;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">MOBILE NO.</div>
                        <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.2;">${patPhone}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CLINICAL NOTES SECTIONS -->
            <!-- 1. CHIEF COMPLAINTS -->
            <div class="clinical-card">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003d46" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #003d46; text-transform: uppercase; letter-spacing: 0.5px;">CHIEF COMPLAINTS</div>
                <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${complaintsVal}</div>
              </div>
            </div>

            <!-- 2. DOCUMENTED ALLERGIES & DRUG SENSITIVITIES -->
            <div class="clinical-card">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">DOCUMENTED ALLERGIES & DRUG SENSITIVITIES</div>
                <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${allergiesVal}</div>
              </div>
            </div>

            <!-- 3. CLINICAL & PAST MEDICAL HISTORY -->
            <div class="clinical-card">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 11 12 14 22 4"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">CLINICAL & PAST MEDICAL HISTORY</div>
                <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${pastHistVal}</div>
              </div>
            </div>

            <!-- 4. DIAGNOSIS / CLINICAL IMPRESSION -->
            <div class="clinical-card">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">DIAGNOSIS / CLINICAL IMPRESSION</div>
                <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 1px;">${diagVal}</div>
              </div>
            </div>

            <!-- 5. EXAMINATION FINDINGS (O/E FINDINGS) -->
            <div class="clinical-card">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px;">EXAMINATION FINDINGS (O/E FINDINGS)</div>
                <div style="font-size: 10.5px; font-weight: 600; color: #0f172a; margin-top: 1px; line-height: 1.4;">${examFindingsVal}</div>
              </div>
            </div>

            <!-- 6. CLINICAL REMARKS, SUGGESTIONS & ADVICE -->
            <div class="clinical-card" style="margin-bottom: 6px;">
              <div class="clinical-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <div>
                <div style="font-size: 9px; font-weight: 900; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">CLINICAL REMARKS, SUGGESTIONS & ADVICE</div>
                <div style="font-size: 10.5px; font-weight: 600; color: #0f172a; margin-top: 2px;">
                  ${adviceItemsHtml}
                </div>
              </div>
            </div>

            ${additionalSections}

            <!-- MEDICINE PRESCRIPTION TABLE -->
            <div style="margin-top: 6px;">
              <div style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 2px;">
                <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 800; color: #003d46; line-height: 1;">Rx</span>
                <span style="font-size: 10.5px; font-style: italic; font-weight: 700; color: #003d46;">(Rx Medicine Prescription)</span>
              </div>

              <table class="meds-table">
                <thead>
                  <tr>
                    <th style="width: 5%; text-align: center;">#</th>
                    <th style="width: 40%;">MEDICINE & STRENGTH</th>
                    <th style="width: 18%;">DOSAGE</th>
                    <th style="width: 22%;">FREQUENCY</th>
                    <th style="width: 15%;">DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  ${medContent}
                </tbody>
              </table>
              ${genInstructions ? `
                <div style="margin-top: 8px; padding: 6px 10px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; page-break-inside: avoid;">
                  <div style="font-size: 9px; font-weight: 800; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                    ℹ GENERAL MEDICINE USE INSTRUCTIONS & PRECAUTIONS
                  </div>
                  <div style="font-size: 9.5px; color: #1e293b; white-space: pre-line; line-height: 1.35; font-weight: 600;">
                    ${genInstructions}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- FOOTER / DIGITAL HEALTH RECORD & SIGNATURE -->
          <div style="margin-top: auto; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 8px; page-break-inside: avoid;">
              <!-- Left: Digital Health Record -->
              <div style="width: 32%; padding-right: 10px; border-right: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #003d46; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style="font-size: 9px; font-weight: 900; color: #003d46; text-transform: uppercase; letter-spacing: 0.5px;">DIGITAL HEALTH RECORD</span>
                </div>
                <p style="font-size: 8px; color: #475569; margin: 0; line-height: 1.3; font-weight: 600;">
                  This document is an authorized clinical prescription registered under hospital safety guidelines.
                </p>
                <p style="font-size: 8px; color: #0f172a; margin-top: 3px; font-weight: 800;">
                  Valid for 7 days.
                </p>
              </div>

              <!-- Center: SCAN TO QR Code -->
              <div style="width: 36%; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-right: 1px solid #e2e8f0;">
                <div style="border: 1px solid #003d46; padding: 2px; border-radius: 4px; background: white; flex-shrink: 0;">
                  <img src="${patientQrCodeUrl}" style="width: 60px; height: 60px; display: block;" alt="Prescription Verification QR Code" />
                </div>
                <div>
                  <div style="font-size: 8.5px; font-weight: 900; color: #003d46; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">SCAN TO</div>
                  <div style="font-size: 8px; font-weight: 700; color: #0f172a; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 4px;"><span style="color: #003d46;">✔</span> Download Prescription</div>
                    <div style="display: flex; align-items: center; gap: 4px;"><span style="color: #003d46;">✔</span> View Reports</div>
                    <div style="display: flex; align-items: center; gap: 4px;"><span style="color: #003d46;">✔</span> Book Follow-up Appointment</div>
                  </div>
                </div>
              </div>

              <!-- Right: Doctor Signature -->
              <div style="width: 32%; text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                ${docSigUrl ? `
                  <img src="${docSigUrl}" style="max-height: 38px; margin-bottom: 2px; object-fit: contain;" alt="Doctor Signature" />
                ` : `
                  <div style="font-family: 'Great Vibes', cursive; font-size: 24px; color: #003d46; line-height: 1; margin-bottom: 2px;">
                    Jamii
                  </div>
                `}
                <div style="font-size: 10.5px; font-weight: 900; color: #003d46; text-transform: uppercase;">${docName}</div>
                <div style="font-size: 8px; font-weight: 800; color: #334155;">${docDegree}</div>
                <div style="font-size: 8px; font-weight: 700; color: #475569;">${docSpecialty}</div>
                <div style="font-size: 7.5px; font-weight: 700; color: #64748b;">Reg. No. ${docRegNo}</div>
                <div style="font-size: 7px; font-weight: 600; color: #94a3b8; font-style: italic;">(Digital Signature)</div>
              </div>
            </div>

            <!-- BOTTOM DARK TEAL FOOTER BANNER -->
            <div style="background-color: #003d46; color: white; border-radius: 6px; padding: 5px 10px; margin-top: 4px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <!-- Left: 24/7 Helpline -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid #facc15; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 900; color: #facc15; flex-shrink: 0;">
                    24/7
                  </div>
                  <div>
                    <div style="font-size: 7.5px; font-weight: 800; text-transform: uppercase; color: #81e6d9;">EMERGENCY</div>
                    <div style="font-size: 9px; font-weight: 900; letter-spacing: 0.3px;">SERVICES</div>
                  </div>
                </div>

                <!-- Phone & Location -->
                <div style="display: flex; align-items: center; gap: 10px; font-size: 8.5px; font-weight: 700;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: #facc15;">📞</span>
                    <span>${hospPhone}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: #facc15;">📍</span>
                    <span>${hospAddress}</span>
                  </div>
                </div>

                <!-- Google Review QR Code -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="text-align: right;">
                    <div style="font-size: 7.5px; font-weight: 800; color: #facc15;">⭐ We value your feedback!</div>
                    <div style="font-size: 7px; color: #e0f2fe;">Scan to leave a Google Review</div>
                  </div>
                  <div style="background: white; padding: 1px; border-radius: 3px;">
                    <img src="${googleReviewQrCodeUrl}" style="width: 28px; height: 28px; display: block;" alt="Google Review QR" />
                  </div>
                </div>
              </div>

              <!-- Tagline Line -->
              <div style="text-align: center; font-size: 7.5px; font-weight: 600; color: #81e6d9; border-top: 1px solid rgba(255,255,255,0.15); margin-top: 3px; padding-top: 2px; font-style: italic;">
                Compassionate Care. Advanced Technology. Healthier Tomorrow.
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;
}


