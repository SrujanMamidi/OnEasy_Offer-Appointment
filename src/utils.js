// Number to Indian words
export function numberToWords(n) {
  if (!n || isNaN(n)) return '';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function convert(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' ';
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred ' + convert(num % 100);
    if (num < 100000) return convert(Math.floor(num / 1000)) + 'Thousand ' + convert(num % 1000);
    if (num < 10000000) return convert(Math.floor(num / 100000)) + 'Lakh ' + convert(num % 100000);
    return convert(Math.floor(num / 10000000)) + 'Crore ' + convert(num % 10000000);
  }
  return convert(parseInt(n)).trim() + ' Rupees Only';
}

export function formatIndianNumber(n) {
  if (!n) return '';
  const num = parseInt(n.toString().replace(/,/g, ''));
  if (isNaN(num)) return n;
  return num.toLocaleString('en-IN');
}

export function generateSalaryBreakup(annualCTC) {
  const ctc = parseInt(annualCTC.toString().replace(/,/g, ''));
  if (isNaN(ctc) || ctc <= 0) return null;
  const monthly = Math.round(ctc / 12);
  const basic = Math.round(monthly * 0.40);
  const hra = Math.round(monthly * 0.20);
  const special = Math.round(monthly * 0.30);
  const pf = Math.round(monthly * 0.05);
  const insurance = monthly - basic - hra - special - pf;
  return { monthly, basic, hra, special, pf, insurance, annualCTC: ctc };
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ENTITY_TYPES = ['Company', 'Proprietorship', 'Partnership', 'LLP', 'Firm'];

export const QUESTIONS = [
  // Organization details
  { id: 'has_logo', label: 'Do you have a Logo?', type: 'select', options: ['Yes', 'No'], section: 'Organization', validate: v => v ? null : 'Please select' },
  { id: 'org_logo', label: 'Upload Organization Logo', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', section: 'Organization', conditional: d => d.has_logo === 'Yes', validate: () => null },
  { id: 'org_name_for_logo', label: 'Organization Name (for Logo)', placeholder: 'Enter the name of your Organization', section: 'Organization', conditional: d => d.has_logo === 'No', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'entity_type', label: 'Type of Entity', type: 'select', options: ['Company', 'Proprietorship', 'Partnership', 'LLP', 'Firm'], section: 'Organization', validate: v => v ? null : 'Please select' },
  { id: 'office_address', label: 'Office Address', placeholder: 'Address as per registered document of the business enterprise', multiline: true, section: 'Organization', validate: v => v && v.trim() ? null : 'Required' },

  // Letter details
  { id: 'letter_date', label: 'Date on Offer Letter', type: 'date', placeholder: 'DD/MM/YYYY', section: 'Letter Details', validate: v => v && v.trim() ? null : 'Required' },

  // Employee details
  { id: 'employee_title', label: 'Prefix', type: 'select', options: ['Mr.', 'Mrs.', 'Ms.'], section: 'Employee Details', validate: v => v ? null : 'Please select' },
  { id: 'employee_full_name', label: 'Full Name of Proposed Employee', placeholder: 'Name as per PAN', section: 'Employee Details', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'complete_address', label: 'Address of Proposed Employee', placeholder: 'Address as per Aadhaar', multiline: true, section: 'Employee Details', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'designation', label: 'Designation', placeholder: 'e.g. Senior Audit Manager', section: 'Employee Details', validate: v => v && v.trim() ? null : 'Required' },

  // Compensation
  { id: 'annual_ctc', label: 'Proposed Annual Salary (₹)', placeholder: 'e.g. 600000', type: 'salary', section: 'Compensation', validate: v => { const n = parseInt((v || '').toString().replace(/,/g, '')); return (!isNaN(n) && n > 0) ? null : 'Enter a valid number'; } },
  { id: 'ctc_words', label: 'Salary in Words', type: 'readonly', section: 'Compensation', validate: () => null },

  // Joining & Schedule
  { id: 'joining_date', label: 'Date of Joining', type: 'date', placeholder: 'DD/MM/YYYY', section: 'Joining & Schedule', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'work_day_from', label: 'Working Days - From', type: 'select', options: DAYS_OF_WEEK, section: 'Joining & Schedule', validate: v => v ? null : 'Please select' },
  { id: 'work_day_to', label: 'Working Days - To', type: 'select', options: DAYS_OF_WEEK, section: 'Joining & Schedule', validate: v => v ? null : 'Please select' },
  { id: 'work_time', label: 'Working Time', placeholder: 'e.g. 10:30 AM to 7:30 PM IST', section: 'Joining & Schedule', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'break_time', label: 'Break Time (including lunch)', placeholder: 'e.g. 1 hour', section: 'Joining & Schedule', validate: v => v && v.trim() ? null : 'Required' },

  // Policies
  { id: 'probation_months', label: 'Probation Period (Months)', placeholder: '6', section: 'Policies', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'leaves_per_month', label: 'Leaves per Calendar Month', placeholder: '1.5', section: 'Policies', note: '(1.5 days) Standard leave rules. Change if your company policy differs.', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'carry_forward_days', label: 'Unutilized Leave Carry Forward (Days)', placeholder: '4', section: 'Policies', note: '(4 days) Standard carry forward. Change if your company policy differs.', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'notice_period_days', label: 'Notice Period (Days)', placeholder: '45', section: 'Policies', note: '(45 days) Standard notice period. Change if your company policy differs.', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'absent_days_absconding', label: 'Consecutive Absent Days (Absconding)', placeholder: '3', section: 'Policies', note: '(3 consecutive days) Standard policy. Change if different.', validate: v => v && v.trim() ? null : 'Required' },

  // Validity
  { id: 'offer_validity_date', label: 'Offer Validity Date', type: 'date', placeholder: 'DD/MM/YYYY', section: 'Validity & Signatures', validate: v => v && v.trim() ? null : 'Required' },

  // Recruiter / Signing authority
  { id: 'recruiter_name', label: 'Appointing Person\'s Name', placeholder: 'Name as per PAN', section: 'Validity & Signatures', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'recruiter_designation', label: 'Recruiter\'s Designation in the Organization', placeholder: 'e.g. Director', section: 'Validity & Signatures', validate: v => v && v.trim() ? null : 'Required' },
  { id: 'recruiter_signature', label: 'Upload Recruiter\'s Signature', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', section: 'Validity & Signatures', validate: () => null },
  { id: 'employee_signature', label: 'Upload Employee\'s Signature', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', section: 'Validity & Signatures', validate: () => null },

  // Reporting Manager (keep for appointment letter)
  { id: 'reporting_manager', label: "Reporting Manager's Designation", placeholder: 'e.g. Senior Manager – Operations', section: 'Validity & Signatures', validate: v => v && v.trim() ? null : 'Required' },
];
