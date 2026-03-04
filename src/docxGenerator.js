// DOCX Generator using docx library
// Generates a properly formatted Word document from collected data
import { supabase } from './supabaseClient.js';

export async function generateOfferLetterDocx(data) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
    HeadingLevel, UnderlineType } = await import('docx');

  const { saveAs } = await import('file-saver');

  const b = data.salary_breakup;
  const employeeName = data.employee_full_name || '';
  const firstName = employeeName.split(' ')[0];
  const entityType = data.entity_type || 'Company';
  const companyName = data.org_name_for_logo || 'OnEasy Consultants Private Limited';
  const officeAddress = data.office_address || 'First Floor, #28, Mothi Nagar, Nagarjuna Hills, Punjagutta, Hyderabad, Telangana 500082';
  const recruiterName = data.recruiter_name || 'CA Abhishek Boddu';
  const recruiterDesignation = data.recruiter_designation || 'Director';
  const workDayFrom = data.work_day_from || 'Monday';
  const workDayTo = data.work_day_to || 'Saturday';
  const workTime = data.work_time || '10:30 AM to 7:30 PM IST';
  const breakTime = data.break_time || '1 (one) hour';

  let serialNumber = data.serial_number; // Default to form data

  if (supabase) {
    try {
      // Safely fetch next sequence number
      const { data: seqData, error: seqError } = await supabase.rpc('get_next_offer_seq');
      if (!seqError && seqData) {
        serialNumber = `HR-${seqData}`;
      } else {
        console.error('Supabase sequence fetch error:', seqError);
      }
    } catch (err) {
      console.error('Failed to get sequence:', err);
    }
  }

  // Generate Reference Number
  const refNo = `OE/HR/OL/${serialNumber}/${data.year}`;

  // Helpers
  const bold = (text, size = 22) => new TextRun({ text, bold: true, size, font: 'Times New Roman' });
  const normal = (text, size = 22) => new TextRun({ text, size, font: 'Times New Roman' });
  const underlineBold = (text, size = 24) => new TextRun({ text, bold: true, underline: { type: UnderlineType.SINGLE }, size, font: 'Times New Roman' });

  const para = (children, opts = {}) => new Paragraph({
    children: Array.isArray(children) ? children : [normal(children)],
    spacing: { after: 120, line: 360 },
    ...opts,
  });

  const heading = (text) => new Paragraph({
    children: [underlineBold(text, 26)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240 },
  });

  const subHeading = (text) => new Paragraph({
    children: [bold(text)],
    spacing: { before: 200, after: 100 },
  });

  const clauseTitle = (num, title) => new Paragraph({
    children: [bold(`${num}. ${title}`)],
    spacing: { before: 160, after: 80 },
  });

  const clausePara = (children) => new Paragraph({
    children: Array.isArray(children) ? children : [normal(children)],
    indent: { left: 360 },
    alignment: AlignmentType.BOTH,
    spacing: { after: 100, line: 340 },
  });

  const blankLine = () => new Paragraph({ children: [normal('')], spacing: { after: 80 } });

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  // ── OFFER LETTER CONTENT ──────────────────────────────────────────────────

  const offerLetter = [
    heading('OFFER LETTER'),

    para([bold('Ref No.: '), normal(refNo)]),
    para([bold('Date: '), normal(data.letter_date)]),
    blankLine(),
    para('To,'),
    para([bold(employeeName)]),
    para(data.complete_address || ''),
    blankLine(),
    para([bold('Subject: '), normal('Offer of Employment as '), bold(data.designation || '')]),
    blankLine(),
    para([normal(`Dear ${data.employee_title} ${firstName},`)]),
    blankLine(),

    clauseTitle('1', 'Offer of Employment'),
    clausePara([
      normal('On behalf of '), bold(companyName),
      normal(` (hereinafter referred to as the "${entityType}"), we are pleased to offer you the position of `),
      bold(data.designation || ''), normal(' in our organization, based on your qualifications and the favorable impression during the selection process.'),
    ]),

    clauseTitle('2', 'Compensation'),
    clausePara([
      normal('Your annual compensation will be '), bold(`INR ${data.ctc_figures}`),
      normal(` (${data.ctc_words} only). The detailed breakdown is provided in `),
      bold('Annexure A'), normal('.'),
    ]),

    clauseTitle('3', 'Date of Joining'),
    clausePara([
      normal('Your proposed date of joining is '), bold(data.joining_date || ''),
      normal('. Please report to '), normal(officeAddress),
      normal(' by '), bold('10:30 AM'), normal(' on the said date.'),
    ]),

    clauseTitle('4', 'Working Hours'),
    clausePara([normal('Your working days will be '), bold(`${workDayFrom} to ${workDayTo}`), normal(' from '), bold(workTime), normal(', with a break of '), bold(breakTime), normal(' which includes the lunch break.')]),

    clauseTitle('5', 'Validity of Offer'),
    clausePara([normal('This offer is valid until '), bold(data.offer_validity_date || ''), normal('. If we do not receive your acceptance by this date, the offer shall stand automatically withdrawn.')]),

    clauseTitle('6', 'Conditions Precedent'),
    clausePara('This offer is contingent upon:'),
    clausePara('6.1 Satisfactory verification of your credentials, references, and background.'),
    clausePara('6.2 Submission of all required documents as listed in the joining formalities.'),
    clausePara('6.3 Your acceptance of the terms and conditions outlined in the Appointment Letter and its annexures.'),

    clauseTitle('7', 'Documents Required at Joining'),
    clausePara('Please bring the following documents on your date of joining:'),
    clausePara('7.1 Original and photocopies of all educational certificates and mark sheets.'),
    clausePara('7.2 Experience certificates and relieving letters from previous employers.'),
    clausePara('7.3 Copy of PAN Card and Aadhaar Card.'),
    clausePara('7.4 Two passport-size photographs.'),
    clausePara('7.5 Bank account details (cancelled cheque or bank statement).'),
    clausePara('7.6 Address proof (Aadhaar/Passport/Utility Bill).'),

    clauseTitle('8', 'Acceptance'),
    clausePara('Please sign and return the duplicate copy of this Offer Letter as a token of your acceptance. Upon joining, you will be issued a formal Appointment Letter containing detailed terms and conditions of your employment.'),

    blankLine(),
    para('We are confident that you will significantly contribute to our team\'s success and look forward to a mutually rewarding professional relationship.'),
    blankLine(),
    para('Yours sincerely,'),
    blankLine(), blankLine(),
    para([bold(`For ${companyName}`)]),
    para('________________________'),
    para([bold(recruiterName)]),
    para(recruiterDesignation),
    blankLine(),

    // Acceptance block
    para([underlineBold('ACCEPTANCE BY CANDIDATE')], { alignment: AlignmentType.CENTER }),
    blankLine(),
    para([
      normal('I, '), bold(employeeName), normal(`, hereby accept the offer of employment as `),
      bold(data.designation || ''), normal(` at ${companyName} on the terms and conditions mentioned above.`),
    ]),
    blankLine(),
  ];

  // ── BUILD OFFER LETTER DOCUMENT ────────────────────────────────────────────────────────

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: offerLetter,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  if (supabase) {
    try {
      const formattedName = employeeName.trim().replace(/\s+/g, '_');
      const fileName = `${formattedName}_Offer_Letter.docx`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob, {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: true // allow overwriting if same document is generated again
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
      } else {
        // Append ref_no to metadata specifically
        const metadataWithRef = { ...data, Reference_Number: refNo };

        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('documents').insert([{
          employee_name: employeeName,
          document_type: 'Offer Letter',
          file_url: publicUrlData.publicUrl,
          metadata: metadataWithRef,
        }]);
        if (dbError) console.error('Supabase DB insert error:', dbError);
      }
    } catch (err) {
      console.error('Unexpected Supabase error:', err);
    }
  }

  const formattedName = employeeName.trim().replace(/\s+/g, '_');
  saveAs(blob, `${formattedName}_Offer_Letter.docx`);
}

export async function generateAppointmentLetterDocx(data) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
    HeadingLevel, UnderlineType } = await import('docx');

  const { saveAs } = await import('file-saver');

  const b = data.salary_breakup;
  const employeeName = data.employee_full_name || '';
  const firstName = employeeName.split(' ')[0];
  const entityType = data.entity_type || 'Company';
  const companyName = data.org_name_for_logo || 'OnEasy Consultants Private Limited';
  const officeAddress = data.office_address || 'First Floor, #28, Mothi Nagar, Nagarjuna Hills, Punjagutta, Hyderabad, Telangana 500082';
  const recruiterName = data.recruiter_name || 'CA Abhishek Boddu';
  const recruiterDesignation = data.recruiter_designation || 'Director';
  const workDayFrom = data.work_day_from || 'Monday';
  const workDayTo = data.work_day_to || 'Saturday';
  const workTime = data.work_time || '10:30 AM to 7:30 PM IST';
  const breakTime = data.break_time || '1 (one) hour';
  const probationMonths = data.probation_months || '6';
  const leavesPerMonth = data.leaves_per_month || '1.5';
  const leavesPerYear = data.leaves_per_year || Math.round(parseFloat(leavesPerMonth) * 12);
  const carryForwardDays = data.carry_forward_days || '4';
  const noticePeriodDays = data.notice_period_days || '45';
  const absentDays = data.absent_days_absconding || '3';

  let serialNumber = data.serial_number; // Default to form data

  if (supabase) {
    try {
      // Safely fetch next sequence number
      const { data: seqData, error: seqError } = await supabase.rpc('get_next_appointment_seq');
      if (!seqError && seqData) {
        serialNumber = `AP-${seqData}`;
      } else {
        console.error('Supabase sequence fetch error:', seqError);
      }
    } catch (err) {
      console.error('Failed to get sequence:', err);
    }
  }

  // Generate Reference Number
  const refNo = `OE/HR/AL/${serialNumber}/${data.year}`;

  // Helpers
  const bold = (text, size = 22) => new TextRun({ text, bold: true, size, font: 'Times New Roman' });
  const normal = (text, size = 22) => new TextRun({ text, size, font: 'Times New Roman' });
  const underlineBold = (text, size = 24) => new TextRun({ text, bold: true, underline: { type: UnderlineType.SINGLE }, size, font: 'Times New Roman' });

  const para = (children, opts = {}) => new Paragraph({
    children: Array.isArray(children) ? children : [normal(children)],
    spacing: { after: 120, line: 360 },
    ...opts,
  });

  const heading = (text) => new Paragraph({
    children: [underlineBold(text, 26)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240 },
  });

  const subHeading = (text) => new Paragraph({
    children: [bold(text)],
    spacing: { before: 200, after: 100 },
  });

  const clauseTitle = (num, title) => new Paragraph({
    children: [bold(`${num}. ${title}`)],
    spacing: { before: 160, after: 80 },
  });

  const clausePara = (children) => new Paragraph({
    children: Array.isArray(children) ? children : [normal(children)],
    indent: { left: 360 },
    alignment: AlignmentType.BOTH,
    spacing: { after: 100, line: 340 },
  });

  const blankLine = () => new Paragraph({ children: [normal('')], spacing: { after: 80 } });

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  // ── APPOINTMENT LETTER CONTENT ────────────────────────────────────────────

  const appointmentLetter = [
    heading('APPOINTMENT LETTER'),

    para([bold('Ref No.: '), normal(refNo)]),
    para([bold('Date: '), normal(data.letter_date)]),
    blankLine(),
    para('To,'),
    para([bold(employeeName)]),
    para(data.complete_address || ''),
    blankLine(),
    para([bold('Subject: '), normal('Letter of Appointment')]),
    blankLine(),
    para([normal(`Dear ${data.employee_title} ${firstName},`)]),
    blankLine(),
    para([normal('With reference to your application and subsequent discussions, we are pleased to appoint you as '), bold(data.designation || ''), normal(' at '), bold(companyName), normal(' on the following terms and conditions:')]),
    blankLine(),

    clauseTitle('1', 'COMMENCEMENT OF EMPLOYMENT'),
    clausePara([normal('1.1 Your employment with the Company shall commence from '), bold(data.joining_date || ''), normal(' ("Date of Joining").')]),
    clausePara([normal(`1.2 Your place of work shall be at the ${entityType}'s office located at `), normal(officeAddress), normal(`, or such other location as may be assigned by the ${entityType} from time to time.`)]),
    clausePara('1.3 You represent that you possess the required skills, qualifications, and experience to perform the duties of the position and agree to be bound by all terms and conditions of this Appointment Letter.'),

    clauseTitle('2', 'DESIGNATION AND DUTIES'),
    clausePara([normal('2.1 You are appointed to the position of '), bold(data.designation || ''), normal(` or such other designation as may be assigned by the ${entityType}.`)]),
    clausePara(`2.2 You shall perform such duties and responsibilities as may be assigned to you by the ${entityType} or your reporting manager from time to time.`),
    clausePara([normal('2.3 You shall report to '), normal(data.reporting_manager || ''), normal(` or such other person as may be designated by the ${entityType}.`)]),
    clausePara(`2.4 The ${entityType} reserves the right to modify your designation, duties, responsibilities, and reporting relationships as deemed necessary in the interest of business operations.`),

    clauseTitle('3', 'PROBATION PERIOD'),
    clausePara([normal('3.1 You shall be on probation for a period of '), bold(`${probationMonths} months`), normal(' from the Date of Joining.')]),
    clausePara(`3.2 During the probation period, the ${entityType} shall evaluate your performance, conduct, and suitability for continued employment.`),
    clausePara(`3.3 The ${entityType} may, at its sole discretion, extend the probation period or terminate your employment during the probation period without assigning any reason and without notice or compensation in lieu thereof.`),
    clausePara(`3.4 Upon successful completion of probation, you shall be confirmed in writing by the ${entityType}.`),

    clauseTitle('4', 'COMPENSATION AND BENEFITS'),
    clausePara([normal('4.1 Your annual Cost to Company (CTC) shall be '), bold(`INR ${data.ctc_figures}`), normal(` (${data.ctc_words} only).`)]),
    clausePara([normal('4.2 The detailed compensation structure including all components is provided in '), bold('Annexure A'), normal('.')]),
    clausePara('4.3 Your salary shall be paid on or before the 7th of each succeeding month, subject to applicable statutory deductions.'),
    clausePara(`4.4 Annual salary revisions, if any, shall be at the sole discretion of the ${entityType} based on your performance, ${entityType} policy, and business conditions.`),

    clauseTitle('5', 'WORKING HOURS AND ATTENDANCE'),
    clausePara([normal('5.1 Your working days shall be '), bold(`${workDayFrom} to ${workDayTo}`), normal('.')]),
    clausePara([normal('5.2 Working hours shall be from '), bold(workTime), normal(', with a break of '), bold(breakTime), normal(' which includes the lunch break.')]),
    clausePara([normal('5.3 Detailed attendance policies and rules are provided in '), bold('Annexure B'), normal('.')]),
    clausePara('5.4 You may be required to work beyond normal working hours or on holidays as per business requirements, for which no additional compensation shall be payable unless specifically approved by the management.'),

    clauseTitle('6', 'LEAVE ENTITLEMENT'),
    clausePara([normal('6.1 You shall be entitled to '), bold(`${leavesPerMonth} days`), normal(' of leave per calendar month, totaling '), bold(`${leavesPerYear} days per financial year`), normal(' (April to March).')]),
    clausePara([normal('6.2 A maximum of '), bold(`${carryForwardDays} days`), normal(` of unutilized leave may be carried forward to the next financial year. Any leave balance exceeding ${carryForwardDays} days shall lapse on March 31st of each year.`)]),
    clausePara([bold('6.3 There shall be no encashment or compensation for unutilized or lapsed leaves.')]),
    clausePara('6.4 The list of public holidays shall be communicated separately by the office of the CEO via email or official communication channels at the beginning of each calendar year.'),
    clausePara([normal('6.5 Detailed leave policy is provided in '), bold('Annexure B'), normal('.')]),

    clauseTitle('7', 'NOTICE PERIOD AND TERMINATION'),
    clausePara([bold('7.1 Employee Resignation - Notice Requirement: '), normal('In the event the Employee wishes to resign from employment, the Employee shall be required to submit a written resignation and serve a mandatory notice period of '), bold(`${noticePeriodDays} days`), normal(`. This notice period is non-negotiable and cannot be reduced, waived, or bought out by payment in lieu of notice, unless expressly approved in writing by the Director of the ${entityType}.`)]),
    clausePara([bold(`7.2 ${entityType}'s Right to Terminate: `), normal(`The ${entityType} reserves the absolute and unconditional right to terminate the Employee's services at any time, on any day, with a notice period of `), bold('1 (one) day or less'), normal(`, at the sole discretion of the ${entityType}, without assigning any reason whatsoever. This right shall be exercised by the ${entityType} under any circumstances including but not limited to business restructuring, redundancy, performance issues, misconduct, or any other reason deemed appropriate by the ${entityType}.`)]),
    clausePara([bold('7.3 Immediate Termination Without Notice: '), normal('Notwithstanding the above, the Company may terminate the Employee\'s services immediately without any notice or compensation in the following circumstances:')]),
    clausePara('(a) Gross misconduct, insubordination, or breach of trust.'),
    clausePara('(b) Breach of confidentiality or disclosure of trade secrets.'),
    clausePara('(c) Fraud, theft, misappropriation, or dishonesty.'),
    clausePara('(d) Violation of Company policies or code of conduct.'),
    clausePara('(e) Any act prejudicial to the Company\'s interests or reputation.'),
    clausePara('(f) During the probation period, for any reason whatsoever.'),
    clausePara([bold(`7.4 CONSEQUENCES OF NON-SERVING OR INCOMPLETE SERVING OF NOTICE PERIOD: In the event the Employee fails to serve the complete ${noticePeriodDays}-day notice period, or abscond, or leaves employment without proper notice and handover, the following consequences shall apply:`)]),
    clausePara([bold('(a) No Relieving Letter: '), normal('The Company shall NOT issue any Relieving Letter or Service Certificate to the Employee.')]),
    clausePara([bold('(b) No Experience Certificate: '), normal('The Company shall NOT issue any Experience Certificate or Employment Verification Letter.')]),
    clausePara([bold('(c) No Payslips: '), normal('The Company shall NOT provide copies of payslips, Form 16, or any other salary-related documents for the employment period.')]),
    clausePara([bold('(d) No Recommendation Letters: '), normal('The Company shall NOT provide any recommendation letters, reference letters, or positive endorsements to any future employer, institution, or third party, at any point in the future.')]),
    clausePara([bold('(e) Negative Background Verification: '), normal('In case of any background verification inquiry from future employers, the Company reserves the right to disclose the fact that the Employee left without serving proper notice period and did not complete the exit formalities.')]),
    clausePara([bold('(f) Full & Final Settlement Withheld: '), normal('The Full and Final Settlement amount shall be withheld entirely, and the Company reserves the right to recover salary equivalent to the unserved notice period from any dues payable to the Employee.')]),
    clausePara([bold('(g) No Clearance Certificate: '), normal('The Company shall NOT issue any No Dues Certificate or Clearance Certificate.')]),
    clausePara([bold('(h) Legal Action: '), normal('The Company reserves the right to initiate appropriate legal proceedings against the Employee for breach of contract and recovery of any losses or damage suffered by the Company due to such premature departure.')]),
    clausePara([bold('7.5 Absconding: '), normal('If the Employee remains absent from duty without prior approval or intimation for more than '), bold(`${absentDays} consecutive working days`), normal(`, the Employee shall be deemed to have absconded and abandoned employment. In such cases, the employment shall stand automatically terminated, and all consequences mentioned in Clause 7.4 above shall apply. Additionally, the ${entityType} may report such absconding to relevant authorities and professional bodies.`)]),
    clausePara([bold('7.6 Mandatory Knowledge Transfer: '), normal('During the notice period, the Employee shall mandatorily provide complete Knowledge Transfer (KT) to the designated successor or any person assigned by the Company. The Knowledge Transfer must be certified as satisfactory by the reporting manager or the Company. '), bold('Failure to provide satisfactory Knowledge Transfer shall be treated as non-serving of notice period, and all consequences under Clause 7.4 shall apply.')]),
    clausePara([bold('7.7 Return of Company Property: '), normal('Upon resignation or termination, the Employee shall immediately return all Company property including but not limited to laptops, mobile phones, ID cards, access cards, keys, documents, files, data, client information, and any other Company assets. Failure to return Company property shall result in deduction of the value of such property from the Full and Final Settlement and may attract legal action.')]),
    clausePara([bold('7.8 Exit Formalities: '), normal('The Employee must complete all exit formalities as prescribed by the Company, including but not limited to exit interview, handover documentation, clearance from all departments, and signing of all necessary documents. Issuance of any certificates or settlement of dues is contingent upon successful completion of all exit formalities.')]),
    clausePara([bold('7.9 No Waiver: '), normal('Any relaxation or waiver granted by the Company in any particular instance shall not be construed as a precedent or waiver for any future instances. The Company\'s decision to not enforce any consequence in a particular case shall not affect the Company\'s right to enforce the same in other cases.')]),
    clausePara([bold('7.10 Garden Leave: '), normal('The Company may, at its sole discretion, place the Employee on Garden Leave during the notice period, during which the Employee shall remain employed but shall not be required to attend office or perform duties. During Garden Leave, the Employee shall continue to be bound by all obligations under this agreement including confidentiality and shall remain available for any handover or queries.')]),

    clauseTitle('8', 'CONFIDENTIALITY AND NON-DISCLOSURE'),
    clausePara('8.1 You shall maintain strict confidentiality of all proprietary information, trade secrets, business strategies, client information, and any other confidential information of the Company.'),
    clausePara([bold('8.2 Lifetime Obligation: This confidentiality obligation shall remain in force throughout the lifetime of the Employee and shall survive the termination of employment for any reason whatsoever. The Employee acknowledges that the information constitutes trade secrets of the Company and there shall be no circumstance under which such trade secrets may be disclosed, shared, or divulged to any third party at any point during the Employee\'s lifetime.')]),
    clausePara([bold('8.3 Legal Consequences: Any breach of this confidentiality clause shall attract civil and criminal liability, including but not limited to prosecution under the Indian Penal Code, Information Technology Act, and other applicable laws, which may result in imprisonment and monetary penalties.')]),
    clausePara([normal('8.4 Detailed confidentiality, non-solicitation, and non-compete provisions are set out in '), bold('Annexure B'), normal('.')]),

    clauseTitle('9', 'INTELLECTUAL PROPERTY'),
    clausePara('9.1 All work products, inventions, designs, processes, and materials created by you during your employment, whether during or outside working hours, shall be the exclusive property of the Company.'),
    clausePara('9.2 You hereby assign and transfer all rights, title, and interest in such intellectual property to the Company.'),

    clauseTitle('10', 'CODE OF CONDUCT AND POLICIES'),
    clausePara([normal('10.1 You shall comply with all rules, regulations, policies, and code of conduct of the Company as set out in '), bold('Annexure B'), normal(' and as amended from time to time.')]),
    clausePara('10.2 The Company reserves the right to modify its policies and procedures at any time, and you agree to be bound by such modifications upon notification.'),

    clauseTitle('11', 'GENERAL PROVISIONS'),
    clausePara([bold('11.1 Exclusive Employment: '), normal('You shall devote your full time and attention to the duties of your position and shall not engage in any other employment or business without prior written consent of the Company.')]),
    clausePara([bold('11.2 Background Verification: '), normal('Your employment is subject to satisfactory background verification. Any discrepancy found may result in immediate termination.')]),
    clausePara([bold('11.3 Salary Confidentiality: '), normal('Your salary and other terms of this appointment are strictly confidential. Disclosure of the same to any person, including other employees, may result in disciplinary action.')]),
    clausePara([bold('11.4 Governing Law: '), normal('This Appointment Letter shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.')]),
    clausePara([bold('11.5 Entire Agreement: '), normal('This Appointment Letter, along with its annexures, constitutes the entire agreement between you and the Company and supersedes all prior discussions, negotiations, and agreements.')]),

    blankLine(),
    para('We welcome you to the team and wish you a successful and rewarding career with us.'),
    blankLine(),
    para('Yours sincerely,'),
    blankLine(), blankLine(),
    para([bold(`For ${companyName}`)]),
    para('________________________'),
    para([bold(recruiterName)]),
    para(recruiterDesignation),
    blankLine(),

    para([underlineBold('ACCEPTANCE BY EMPLOYEE')], { alignment: AlignmentType.CENTER }),
    blankLine(),
    para([normal('I, '), bold(employeeName), normal(`, have read, understood, and accept all the terms and conditions of this Appointment Letter and its Annexures (A and B) at ${companyName}.`)]),
    blankLine(),
  ];

  // ── ANNEXURE A – SALARY ───────────────────────────────────────────────────

  const annexureA = [];
  annexureA.push(heading('ANNEXURE A'));
  annexureA.push(new Paragraph({
    children: [underlineBold('COMPENSATION STRUCTURE', 22)],
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
  }));

  annexureA.push(para([bold('Employee: '), normal(employeeName), bold('   Designation: '), normal(data.designation || ''), bold('   Effective: '), normal(data.joining_date || '')]));
  annexureA.push(blankLine());

  if (b) {
    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [bold('Component', 20)], alignment: AlignmentType.LEFT })], width: { size: 4000, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [bold('Monthly (₹)', 20)], alignment: AlignmentType.RIGHT })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [bold('Annual (₹)', 20)], alignment: AlignmentType.RIGHT })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
      ],
    });

    const salaryRows = [
      ['Basic Salary (40%)', b.basic],
      ['House Rent Allowance – HRA (20%)', b.hra],
      ['Special Allowance (30%)', b.special],
      ['Provident Fund – Employer Contribution (5%)', b.pf],
      ['Medical Insurance (5%)', b.insurance],
    ].map(([label, amt], i) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [normal(label, 20)], spacing: { after: 60 } })], width: { size: 4000, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F9F9F9', type: ShadingType.CLEAR }, borders, margins: { top: 70, bottom: 70, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [normal(amt.toLocaleString('en-IN'), 20)], alignment: AlignmentType.RIGHT, spacing: { after: 60 } })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F9F9F9', type: ShadingType.CLEAR }, borders, margins: { top: 70, bottom: 70, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [normal((amt * 12).toLocaleString('en-IN'), 20)], alignment: AlignmentType.RIGHT, spacing: { after: 60 } })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F9F9F9', type: ShadingType.CLEAR }, borders, margins: { top: 70, bottom: 70, left: 120, right: 120 } }),
      ],
    }));

    const totalRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [bold('TOTAL CTC', 20)], spacing: { after: 60 } })], width: { size: 4000, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [bold(b.monthly.toLocaleString('en-IN'), 20)], alignment: AlignmentType.RIGHT, spacing: { after: 60 } })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
        new TableCell({ children: [new Paragraph({ children: [bold(b.annualCTC.toLocaleString('en-IN'), 20)], alignment: AlignmentType.RIGHT, spacing: { after: 60 } })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: '0d1b2a', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 } }),
      ],
    });

    annexureA.push(new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [4000, 2500, 2500],
      rows: [headerRow, ...salaryRows, totalRow],
    }));

    annexureA.push(blankLine());
    annexureA.push(para([bold('Salary in words: '), normal(data.ctc_words || '')]));
  }

  // ── ANNEXURE B ────────────────────────────────────────────────────────────

  const annexureB = [
    heading('ANNEXURE B'),
    new Paragraph({ children: [underlineBold('CODE OF CONDUCT, POLICIES AND PROCEDURES', 22)], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    para(`This Annexure sets out the policies, procedures, and code of conduct applicable to all employees of ${companyName}. All employees are required to read, understand, and comply with these provisions.`),
    blankLine(),

    subHeading('1. ATTENDANCE AND WORKING HOURS'),
    clausePara([bold('1.1 Working Hours: '), normal('The standard working hours are from '), bold(workTime), normal(`, ${workDayFrom} to ${workDayTo}.`)]),
    clausePara([bold('1.2 Break Time: '), normal('Employees are entitled to '), bold(breakTime), normal(' break which includes lunch.')]),
    clausePara([bold('1.3 Attendance System: '), normal('The Company follows a biometric/digital attendance system. All employees must record their attendance upon arrival and departure.')]),
    clausePara([bold('1.4 Grace Period: '), normal('A grace period of '), bold('15 minutes'), normal(' is allowed from the start time. '), bold('However, this grace period can only be availed ONCE per week.'), normal(' If the grace period is exceeded more than once in a week, the subsequent late arrivals shall be treated as '), bold('half-day absent'), normal(' and salary shall be deducted accordingly.')]),
    clausePara([bold('1.5 Late Arrival: '), normal('Repeated late arrivals beyond the grace period may result in salary deductions and disciplinary action.')]),
    clausePara([bold('1.6 Permission for Leaving Office: '), normal('If an employee needs to leave the office premises for more than 30 minutes during working hours, prior approval must be obtained from the reporting manager.')]),

    subHeading('2. LEAVE POLICY'),
    clausePara([bold('2.1 Leave Entitlement: '), normal('Every employee is entitled to '), bold(`${leavesPerMonth} days`), normal(` of leave per calendar month, totaling ${leavesPerYear} days per financial year.`)]),
    clausePara([bold('2.2 Financial Year: '), normal('The financial year for leave calculation starts from '), bold('April 1st and ends on March 31st'), normal('.')]),
    clausePara([bold('2.3 Leave Carry Forward: '), normal('A maximum of '), bold(`${carryForwardDays} days`), normal(' of unutilized leave can be carried forward to the next financial year.')]),
    clausePara([bold('2.4 Lapse of Leave: '), normal(`Any leave balance exceeding ${carryForwardDays} days shall automatically lapse on March 31st of each year.`)]),
    clausePara([bold('2.5 No Leave Encashment: There is no provision for encashment or monetary compensation for unutilized or lapsed leaves.')]),
    clausePara([bold('2.6 Leave Application: '), normal('Leave must be applied for in advance through the designated channel. Emergency leave may be granted at the discretion of the reporting manager.')]),
    clausePara([bold('2.7 Leave Approval: '), normal('All leaves are subject to approval by the sanctioning authority and may be refused based on business exigencies.')]),
    clausePara([bold('2.8 Public Holidays: '), normal('The list of public holidays for each calendar year shall be communicated by the office of the CEO via email or WhatsApp at the beginning of each year.')]),

    subHeading('3. DRESS CODE'),
    clausePara('3.1 All employees are expected to maintain a clean, decent, and professional appearance at all times.'),
    clausePara([bold('3.2 Office Dress Code: '), normal('The dress code at the Company office is '), bold('Formals or Business Casuals'), normal('.')]),
    clausePara([bold('3.3 Client Location Dress Code: '), normal('At client premises or during client meetings, the dress code shall be '), bold('STRICTLY BUSINESS FORMALS'), normal(' on any given day of the year, without exception. This is mandatory and non-negotiable.')]),
    clausePara('3.4 Clothing must be tailored, neat, and clean. Good personal grooming and hygiene are essential.'),
    clausePara('3.5 Non-compliance with the dress code may result in being asked to leave the premises and return in appropriate attire. Repeated violations may lead to disciplinary action.'),

    subHeading('4. EQUAL EMPLOYMENT OPPORTUNITY'),
    clausePara('4.1 The Company provides equal employment opportunity to all employees and applicants and does not discriminate on any basis prohibited by law, including race, color, sex, religion, national origin, disability, marital status, or any other protected status.'),
    clausePara('4.2 Any violation of this policy should be reported immediately to the reporting manager or the Director.'),

    subHeading('5. PROFESSIONAL CODE OF CONDUCT'),
    clausePara('All employees are expected to observe the highest standards of ethical conduct, which includes:'),
    clausePara('5.1 Acting with integrity and professionalism in all dealings.'),
    clausePara('5.2 Treating colleagues, clients, and stakeholders with dignity and respect.'),
    clausePara('5.3 Avoiding real or apparent conflicts of interest.'),
    clausePara('5.4 Performing duties with skill, honesty, care, and diligence.'),
    clausePara('5.5 Maintaining confidentiality of Company information.'),
    clausePara('5.6 Complying with all Company policies and applicable laws.'),

    subHeading('6. GIFTS, FAVOURS AND CONFLICT OF INTEREST'),
    clausePara('6.1 Employees must avoid any personal, financial, or other conflict of interest that may be directly associated with their duties.'),
    clausePara('6.2 Any interest that may constitute a conflict must be promptly disclosed to the management.'),
    clausePara('6.3 External appointments or conducting outside business is not permitted without prior written permission of the management.'),
    clausePara('6.4 Employees should never offer or accept gifts or favors that may influence or appear to influence business transactions.'),

    subHeading('7. ASSET MANAGEMENT'),
    clausePara('7.1 Employees are responsible for protecting all Company assets provided to them, including laptops, computers, peripherals, and other equipment.'),
    clausePara('7.2 Any damage, theft, or misuse of Company property shall be the responsibility of the employee, and the cost may be deducted from salary or payable by the employee.'),
    clausePara('7.3 All Company assets must be returned in good condition upon termination or resignation.'),

    subHeading('8. USE OF ELECTRONIC AND NETWORK RESOURCES'),
    clausePara('8.1 Company computers, email, internet, and other electronic resources are provided for business purposes.'),
    clausePara('8.2 These resources are Company property and may be monitored without prior notice.'),
    clausePara('8.3 Inappropriate use, including personal social media browsing, downloading unauthorized content, or accessing inappropriate websites, may result in disciplinary action.'),
    clausePara('8.4 Employees must not copy, extract, or forward confidential information through unauthorized means.'),

    subHeading('9. CONFIDENTIALITY, NON-SOLICITATION AND NON-COMPETE'),
    clausePara('9.1 Confidential Information includes all proprietary data, trade secrets, business plans, client information, processes, and any other information of special value to the Company.'),
    clausePara([bold('9.2 LIFETIME CONFIDENTIALITY OBLIGATION: The Employee acknowledges that all confidential information constitutes trade secrets of the Company. This confidentiality obligation shall remain binding throughout the ENTIRE LIFETIME of the Employee and shall survive the termination of employment for any reason whatsoever. Under no circumstances shall such trade secrets be disclosed, shared, divulged, or made available to any third party, directly or indirectly, at any point during the Employee\'s lifetime.')]),
    clausePara('9.3 Upon termination, employees must return all confidential information in any form and obtain a No Objection Certificate.'),
    clausePara('9.4 For 3 (three) years following termination, employees shall not hire or solicit Company employees, or solicit Company clients.'),
    clausePara('9.5 Employees shall not engage in any competing business without prior written consent of the Company.'),
    clausePara([bold('9.6 LEGAL CONSEQUENCES: Any breach of this confidentiality clause shall attract civil and criminal liability under the Indian Penal Code, Information Technology Act, 2000, and other applicable laws, which may result in imprisonment and substantial monetary penalties. The Company reserves the right to initiate criminal prosecution in addition to civil remedies.')]),

    subHeading('10. INTELLECTUAL PROPERTY RIGHTS'),
    clausePara('10.1 All work created by an employee during the course of employment shall be the property of the Company.'),
    clausePara('10.2 Employees shall not use, misuse, or copy any Company trademarks, copyrights, designs, or patented products/services.'),
    clausePara('10.3 All intellectual property must be delivered to the Company upon termination along with any copies.'),

    subHeading('11. WORKPLACE CONDUCT'),
    clausePara('The following are strictly prohibited:'),
    clausePara('11.1 Smoking, consuming alcohol, or using recreational drugs or intoxicants on Company premises or during working hours.'),
    clausePara('11.2 Using mobile phones for personal calls during work hours except in designated areas or during breaks.'),
    clausePara('11.3 Using Company landlines for personal calls.'),
    clausePara('11.4 Taking photographs of office premises, equipment, or personnel using mobile phones.'),
    clausePara('11.5 Violation of these rules may result in immediate disciplinary action including termination.'),

    subHeading('12. POLICY ON HARASSMENT (INCLUDING SEXUAL HARASSMENT)'),
    clausePara('12.1 The Company is committed to providing a harassment-free workplace where every employee is treated with dignity and respect.'),
    clausePara('12.2 Harassment of any kind based on race, color, sex, religion, national origin, disability, marital status, or any other protected status is strictly prohibited.'),
    clausePara('12.3 Sexual harassment includes unwelcome physical contact, demands for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome conduct of a sexual nature.'),
    clausePara([normal('12.4 Complaints should be made in writing to the '), bold('HR Department or the Director of the Company'), normal(' within 3 months of the incident, with supporting details and witness information.')]),
    clausePara('12.5 All complaints will be investigated promptly and handled with due regard for confidentiality and privacy.'),
    clausePara('12.6 False or malicious complaints may result in disciplinary action against the complainant.'),

    subHeading('13. DISCIPLINARY ACTION'),
    clausePara('Disciplinary action may be taken for, including but not limited to:'),
    clausePara('13.1 Insubordination or refusal to follow lawful instructions.'),
    clausePara('13.2 Theft, misappropriation, or unauthorized possession of Company property.'),
    clausePara('13.3 Falsifying or altering Company records.'),
    clausePara('13.4 Violation of harassment or equal opportunity policies.'),
    clausePara('13.5 Poor job performance.'),
    clausePara('13.6 Unauthorized use or wasting of Company resources.'),
    clausePara('13.7 Using profanity or language to taunt or provoke co-workers.'),
    clausePara('13.8 Conduct that reflects poorly on the Company.'),
    clausePara([bold('13.9 BREACH OF CONFIDENTIALITY: Any breach of the confidentiality clause, including but not limited to disclosure, sharing, or misuse of trade secrets, proprietary information, client data, or any confidential information of the Company.')]),
    clausePara('Disciplinary actions may include:'),
    clausePara('• Verbal warning'),
    clausePara('• Written warning'),
    clausePara('• Suspension with or without pay'),
    clausePara('• Stoppage of increment'),
    clausePara('• Demotion'),
    clausePara('• Immediate termination'),
    clausePara([bold('• Criminal prosecution and imprisonment (in cases of confidentiality breach)')]),
    clausePara([bold('IMPORTANT WARNING - CONFIDENTIALITY BREACH: Breach of confidentiality is a serious offence. In addition to immediate termination, the Company shall initiate criminal proceedings against the defaulting employee under the Indian Penal Code (Sections 403, 405, 406, 408, 420), Information Technology Act, 2000 (Sections 43, 66, 72), and any other applicable laws. Such breach may result in IMPRISONMENT up to 3 years and/or substantial monetary fines. '), normal('The Company also reserves the right to claim damages for any losses incurred due to such breach.')]),

    subHeading('14. SAFETY AND HEALTH'),
    clausePara('14.1 The Company strives to provide a clean, hazard-free, and safe work environment.'),
    clausePara('14.2 All employees are expected to observe safety rules and report any unsafe conditions immediately.'),
    clausePara('14.3 A first-aid kit is available at the HR Room for employee convenience.'),
    clausePara('14.4 The Company accepts no liability arising from self-administered use of the first-aid kit.'),

    subHeading('15. OPEN DOOR POLICY'),
    clausePara('15.1 The Company encourages open communication. Employees may freely discuss job-related concerns with their reporting manager or HR.'),
    clausePara('15.2 HR is committed to resolving employee concerns in a timely and appropriate manner.'),

    subHeading('16. AMENDMENTS'),
    clausePara('16.1 The Company reserves the right to amend, modify, or withdraw any of these policies at any time.'),
    clausePara('16.2 Employees will be notified of significant changes through official communication channels.'),

    blankLine(),
    para([underlineBold('ACKNOWLEDGEMENT'), normal(' — ANNEXURE B')], { alignment: AlignmentType.CENTER }),
    blankLine(),
    para([normal('I, '), bold(employeeName), normal(`, acknowledge that I have received, read, and understood the Code of Conduct, Policies, and Procedures of ${companyName} contained in this Annexure B.`)]),
    blankLine(), blankLine(),
    para([bold('Employee ID: '), normal(data.employee_id || '')]),
    para([bold('Employee Name: '), normal(employeeName)]),
    para([bold('Designation: '), normal(data.designation || '')]),
    blankLine(),
    para('Employee Signature: ________________________'),
    para('Date: __________    Place: __________'),
  ];

  // ── BUILD APPOINTMENT LETTER DOCUMENT ────────────────────────────────────────────────────────

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: [
          ...appointmentLetter,
          new Paragraph({ pageBreakBefore: true, children: [] }),
          ...annexureA,
          new Paragraph({ pageBreakBefore: true, children: [] }),
          ...annexureB,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  if (supabase) {
    try {
      const formattedName = employeeName.trim().replace(/\s+/g, '_');
      const fileName = `${formattedName}_Appointment_Letter.docx`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob, {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: true // allow overwriting if same document is generated again
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
      } else {
        // Append ref_no to metadata specifically
        const metadataWithRef = { ...data, Reference_Number: refNo };

        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('documents').insert([{
          employee_name: employeeName,
          document_type: 'Appointment Letter',
          file_url: publicUrlData.publicUrl,
          metadata: metadataWithRef,
        }]);
      }
    } catch (err) {
      console.error('Unexpected Supabase error:', err);
    }
  }

  const formattedName = employeeName.trim().replace(/\s+/g, '_');
  saveAs(blob, `${formattedName}_Appointment_Letter.docx`);
}
