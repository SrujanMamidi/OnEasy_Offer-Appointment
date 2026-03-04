import { QUESTIONS } from '../utils.js';

export default function DocPreview({ data, allDone, onDownloadOffer, onDownloadAppointment }) {
  const v = (id) => data[id];
  const filled = (id) => data[id] !== undefined && data[id] !== '';

  function ph(id, label) {
    if (filled(id)) {
      return <mark className="ph-filled">{v(id)}</mark>;
    }
    return <mark className="ph-empty">[{label}]</mark>;
  }

  const b = data.salary_breakup;

  // Dynamic entity/company name
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

  const filledCount = QUESTIONS.filter(q => {
    if (q.conditional && !q.conditional(data)) return false;
    if (q.type === 'file' || q.type === 'readonly') return false;
    return data[q.id] && data[q.id] !== '';
  }).length;
  const totalCount = QUESTIONS.filter(q => {
    if (q.conditional && !q.conditional(data)) return false;
    if (q.type === 'file' || q.type === 'readonly') return false;
    return true;
  }).length;

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div className="toolbar-left">
          <span className="preview-label">📄 Live Document Preview</span>
          <span className="fill-status">
            {allDone
              ? <span className="status-done">✓ All fields complete</span>
              : <span className="status-pending">{filledCount} / {totalCount} filled</span>
            }
          </span>
        </div>
        <div className="toolbar-right" style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`download-btn ${allDone ? 'active' : 'disabled'}`}
            onClick={allDone ? onDownloadOffer : undefined}
            disabled={!allDone}
          >
            ⬇ Download Offer Letter
          </button>
          <button
            className={`download-btn ${allDone ? 'active' : 'disabled'}`}
            onClick={allDone ? onDownloadAppointment : undefined}
            disabled={!allDone}
          >
            ⬇ Download Appointment Letter
          </button>
        </div>
      </div>

      <div className="preview-scroll">
        <div className="a4-page">

          {/* Organization Logo */}
          {data.org_logo && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img src={data.org_logo} alt="Organization Logo" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain' }} />
            </div>
          )}

          {/* ── OFFER LETTER ── */}
          <div className="doc-title">OFFER LETTER</div>

          <div className="ref-row">
            <span><strong>Ref No.:</strong> OE/HR/OL/{ph('serial_number', 'Serial No.')}/{ph('year', 'Year')}</span>
            <span><strong>Date:</strong> {ph('letter_date', 'DD/MM/YYYY')}</span>
          </div>

          <div className="address-block">
            <div>To,</div>
            <div><strong>{ph('employee_full_name', 'Employee Full Name')}</strong></div>
            <div>{ph('complete_address', 'Complete Address')}</div>
          </div>

          <div className="subject-line">
            <strong>Subject:</strong> Offer of Employment {filled('designation') ? <span>as <strong>{v('designation')}</strong></span> : <mark className="ph-empty">[as Designation]</mark>}
          </div>

          <p className="salutation">Dear {ph('employee_title', 'Mr./Ms.')} {filled('employee_full_name') ? data.employee_full_name.split(' ')[0] : <mark className="ph-empty">[First Name]</mark>},</p>

          <div className="clause">
            <div className="clause-title">1. Offer of Employment</div>
            <p>
              On behalf of <strong>{companyName}</strong> (hereinafter referred to as the "{entityType}"),
              we are pleased to offer you the position {filled('designation') ? <span>of <strong>{v('designation')}</strong></span> : <mark className="ph-empty">[of Designation]</mark>} in our organization.
              This offer is made based on your qualifications, experience, and the favorable impression you have made during the selection process.
            </p>
          </div>

          <div className="clause">
            <div className="clause-title">2. Compensation</div>
            <p>
              Your annual compensation will be INR <strong>{ph('ctc_figures', 'Amount in Figures')}</strong>
              (<strong>{ph('ctc_words', 'Amount in Words')}</strong> only).
              The detailed breakdown of your compensation structure is provided in Annexure A attached herewith.
            </p>
          </div>

          <div className="clause">
            <div className="clause-title">3. Date of Joining</div>
            <p>
              Your proposed date of joining is <strong>{ph('joining_date', 'DD/MM/YYYY')}</strong>.
              Please report to our office at <strong>{officeAddress}</strong>
              by <strong>10:30 AM</strong> on the said date.
            </p>
          </div>

          <div className="clause">
            <div className="clause-title">4. Working Hours</div>
            <p>
              Your working days will be <strong>{workDayFrom} to {workDayTo}</strong> from <strong>{workTime}</strong>, with a break of <strong>{breakTime}</strong>, which includes the lunch break.
            </p>
          </div>

          <div className="clause">
            <div className="clause-title">5. Validity of Offer</div>
            <p>This offer is valid until <strong>{ph('offer_validity_date', 'DD/MM/YYYY')}</strong>. If we do not receive your acceptance by this date, the offer shall stand automatically withdrawn.</p>
          </div>

          <div className="clause">
            <div className="clause-title">6. Conditions Precedent</div>
            <p>This offer is contingent upon:</p>
            <div style={{ marginLeft: '20px' }}>
              <p>6.1 Satisfactory verification of your credentials, references, and background.</p>
              <p>6.2 Submission of all required documents as listed in the joining formalities.</p>
              <p>6.3 Your acceptance of the terms and conditions outlined in the Appointment Letter and its annexures.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">7. Documents Required at Joining</div>
            <p>Please bring the following documents on your date of joining:</p>
            <div style={{ marginLeft: '20px' }}>
              <p>7.1 Original and photocopies of all educational certificates and mark sheets.</p>
              <p>7.2 Experience certificates and relieving letters from previous employers.</p>
              <p>7.3 Copy of PAN Card and Aadhaar Card.</p>
              <p>7.4 Two passport-size photographs.</p>
              <p>7.5 Bank account details (cancelled cheque or bank statement).</p>
              <p>7.6 Address proof (Aadhaar/Passport/Utility Bill).</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">8. Acceptance</div>
            <p>Please sign and return the duplicate copy of this Offer Letter as a token of your acceptance. Upon joining, you will be issued a formal Appointment Letter containing detailed terms and conditions of your employment.</p>
          </div>

          <p>We are confident that you will significantly contribute to our team's success and look forward to a mutually rewarding professional relationship.</p>

          <div className="signature-block">
            <p>Yours sincerely,</p>
            <p className="sig-company"><strong>For {companyName}</strong></p>
            {data.recruiter_signature ? (
              <img src={data.recruiter_signature} alt="Signature" style={{ maxHeight: '50px', maxWidth: '150px', objectFit: 'contain', margin: '8px 0' }} />
            ) : (
              <div className="sig-line">________________________</div>
            )}
            <p><strong>{recruiterName}</strong></p>
            <p>{recruiterDesignation}</p>
          </div>

          <div className="acceptance-box">
            <div className="acceptance-title">ACCEPTANCE BY CANDIDATE</div>
            <p>I, {ph('employee_full_name', 'Employee Full Name')}, hereby accept the offer of employment {filled('designation') ? <span>as {v('designation')}</span> : <mark className="ph-empty">[as Designation]</mark>} at {companyName}.</p>
            <table className="accept-table">
              <tbody>
                <tr>
                  <td>
                    Signature: {data.employee_signature ? (
                      <img src={data.employee_signature} alt="Employee Signature" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
                    ) : '________________________'}
                    <br /><br /><strong>Name:</strong> {ph('employee_full_name', 'Employee Name')}
                  </td>
                  <td>Date: __________<br /><br />Place: __________</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="page-break">— Page Break —</div>

          {/* ── APPOINTMENT LETTER ── */}
          <div className="doc-title">APPOINTMENT LETTER</div>

          <div className="ref-row">
            <span><strong>Ref No.:</strong> OE/HR/AL/{ph('serial_number', 'Serial No.')}/{ph('year', 'Year')}</span>
            <span><strong>Date:</strong> {ph('letter_date', 'DD/MM/YYYY')}</span>
          </div>

          <div className="address-block">
            <div>To,</div>
            <div><strong>{ph('employee_full_name', 'Employee Full Name')}</strong></div>
            <div>{ph('complete_address', 'Complete Address')}</div>
          </div>

          <div className="subject-line">
            <strong>Subject:</strong> Letter of Appointment
          </div>

          <p className="salutation">Dear {ph('employee_title', 'Mr./Ms.')} {filled('employee_full_name') ? data.employee_full_name.split(' ')[0] : <mark className="ph-empty">[First Name]</mark>},</p>

          <p style={{ marginBottom: 12 }}>With reference to your application and subsequent discussions, we are pleased to appoint you at <strong>{companyName}</strong> on the following terms:</p>

          <div className="clause">
            <div className="clause-title">1. COMMENCEMENT OF EMPLOYMENT</div>
            <div style={{ marginLeft: '20px' }}>
              <p>1.1 Your employment with the {entityType} shall commence from <strong>{ph('joining_date', 'DD/MM/YYYY')}</strong> ("Date of Joining").</p>
              <p>1.2 Your place of work shall be at the {entityType}'s office located at <strong>{officeAddress}</strong>, or such other location as may be assigned by the {entityType} from time to time.</p>
              <p>1.3 You represent that you possess the required skills, qualifications, and experience to perform the duties of the position and agree to be bound by all terms and conditions of this Appointment Letter.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">2. DESIGNATION AND DUTIES</div>
            <div style={{ marginLeft: '20px' }}>
              <p>2.1 You are appointed to the position {filled('designation') ? <span>of <strong>{v('designation')}</strong></span> : <mark className="ph-empty">[of Designation]</mark>} or such other designation as may be assigned by the {entityType}.</p>
              <p>2.2 You shall perform such duties and responsibilities as may be assigned to you by the {entityType} or your reporting manager from time to time.</p>
              <p>2.3 You shall report to <strong>{ph('reporting_manager', "Reporting Manager's Designation")}</strong> or such other person as may be designated by the {entityType}.</p>
              <p>2.4 The {entityType} reserves the right to modify your designation, duties, responsibilities, and reporting relationships as deemed necessary in the interest of business operations.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">3. PROBATION PERIOD</div>
            <div style={{ marginLeft: '20px' }}>
              <p>3.1 You shall be on probation for a period of <strong>{probationMonths} months</strong> from the Date of Joining.</p>
              <p>3.2 During the probation period, the {entityType} shall evaluate your performance, conduct, and suitability for continued employment.</p>
              <p>3.3 The {entityType} may, at its sole discretion, extend the probation period or terminate your employment during the probation period without assigning any reason and without notice or compensation in lieu thereof.</p>
              <p>3.4 Upon successful completion of probation, you shall be confirmed in writing by the {entityType}.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">4. COMPENSATION AND BENEFITS</div>
            <div style={{ marginLeft: '20px' }}>
              <p>4.1 Your annual Cost to Company (CTC) shall be <strong>INR {ph('ctc_figures', 'Amount in Figures')}</strong> (<strong>{ph('ctc_words', 'Amount in Words')}</strong> only).</p>
              <p>4.2 The detailed compensation structure including all components is provided in <strong>Annexure A</strong>.</p>
              <p>4.3 Your salary shall be paid on or before the 7th of each succeeding month, subject to applicable statutory deductions.</p>
              <p>4.4 Annual salary revisions, if any, shall be at the sole discretion of the {entityType} based on your performance, {entityType} policy, and business conditions.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">5. WORKING HOURS AND ATTENDANCE</div>
            <div style={{ marginLeft: '20px' }}>
              <p>5.1 Your working days shall be <strong>{workDayFrom} to {workDayTo}</strong>.</p>
              <p>5.2 Working hours shall be from <strong>{workTime}</strong>, with a break of <strong>{breakTime}</strong> which includes the lunch break.</p>
              <p>5.3 Detailed attendance policies and rules are provided in <strong>Annexure B</strong>.</p>
              <p>5.4 You may be required to work beyond normal working hours or on holidays as per business requirements, for which no additional compensation shall be payable unless specifically approved by the management.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">6. LEAVE ENTITLEMENT</div>
            <div style={{ marginLeft: '20px' }}>
              <p>6.1 You shall be entitled to <strong>{leavesPerMonth} days</strong> of leave per calendar month, totaling <strong>{leavesPerYear} days per financial year</strong> (April to March).</p>
              <p>6.2 A maximum of <strong>{carryForwardDays} days</strong> of unutilized leave may be carried forward to the next financial year. Any leave balance exceeding {carryForwardDays} days shall lapse on March 31st of each year.</p>
              <p><strong>6.3 There shall be no encashment or compensation for unutilized or lapsed leaves.</strong></p>
              <p>6.4 The list of public holidays shall be communicated separately by the office of the CEO via email or official communication channels at the beginning of each calendar year.</p>
              <p>6.5 Detailed leave policy is provided in <strong>Annexure B</strong>.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">7. NOTICE PERIOD AND TERMINATION</div>
            <div style={{ marginLeft: '20px' }}>
              <p><strong>7.1 Employee Resignation - Notice Requirement:</strong> In the event the Employee wishes to resign from employment, the Employee shall be required to submit a written resignation and serve a mandatory notice period of <strong>{noticePeriodDays} days</strong>. This notice period is non-negotiable and cannot be reduced, waived, or bought out by payment in lieu of notice, unless expressly approved in writing by the Director of the {entityType}.</p>
              <p><strong>7.2 {entityType}'s Right to Terminate:</strong> The {entityType} reserves the absolute and unconditional right to terminate the Employee's services at any time, on any day, with a notice period of <strong>1 (one) day or less</strong>, at the sole discretion of the {entityType}, without assigning any reason whatsoever.</p>
              <p><strong>7.3 Immediate Termination Without Notice:</strong> Notwithstanding the above, the {entityType} may terminate immediately without notice in circumstances such as gross misconduct, breach of confidentiality, fraud, violation of policies, or during the probation period.</p>
              <p><strong>7.4 CONSEQUENCES OF NON-SERVING OR INCOMPLETE SERVING OF NOTICE PERIOD:</strong> In the event the Employee fails to serve the complete {noticePeriodDays}-day notice period, or abscond, or leaves employment without proper notice and handover, the following consequences shall apply: No Relieving Letter, No Experience Certificate, No Payslips, No Recommendation Letters, Negative Background Verification, Full & Final Settlement Withheld, No Clearance Certificate, and Legal Action.</p>
              <p><strong>7.5 Absconding:</strong> Absence without intimation for more than <strong>{absentDays} consecutive working days</strong> shall be deemed absconding.</p>
              <p><strong>7.6 Mandatory Knowledge Transfer:</strong> Complete Knowledge Transfer is mandatory during the notice period.</p>
              <p><strong>7.7 Return of Company Property:</strong> All Company assets must be returned upon resignation.</p>
              <p><strong>7.8 Exit Formalities:</strong> Standard company exit procedures must be completed prior to issuance of any certificates.</p>
              <p><strong>7.9 No Waiver:</strong> Any relaxation or waiver granted shall not be construed as a precedent.</p>
              <p><strong>7.10 Garden Leave:</strong> The Company may place the Employee on Garden Leave during the notice period.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">8. CONFIDENTIALITY AND NON-DISCLOSURE</div>
            <div style={{ marginLeft: '20px' }}>
              <p>8.1 You shall maintain strict confidentiality of all proprietary information, trade secrets, business strategies, client information, and any other confidential information of the {entityType}.</p>
              <p><strong>8.2 Lifetime Obligation: This confidentiality obligation shall remain in force throughout the lifetime of the Employee and shall survive the termination of employment for any reason whatsoever. The Employee acknowledges that the information constitutes trade secrets of the {entityType} and there shall be no circumstance under which such trade secrets may be disclosed.</strong></p>
              <p><strong>8.3 Legal Consequences: Any breach of this confidentiality clause shall attract civil and criminal liability, including but not limited to prosecution under the Indian Penal Code, Information Technology Act, and other applicable laws, which may result in imprisonment and monetary penalties.</strong></p>
              <p>8.4 Detailed confidentiality, non-solicitation, and non-compete provisions are set out in <strong>Annexure B</strong>.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">9. INTELLECTUAL PROPERTY</div>
            <div style={{ marginLeft: '20px' }}>
              <p>9.1 All work products, inventions, designs, processes, and materials created by you during your employment, whether during or outside working hours, shall be the exclusive property of the {entityType}.</p>
              <p>9.2 You hereby assign and transfer all rights, title, and interest in such intellectual property to the {entityType}.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">10. CODE OF CONDUCT AND POLICIES</div>
            <div style={{ marginLeft: '20px' }}>
              <p>10.1 You shall comply with all rules, regulations, policies, and code of conduct of the {entityType} as set out in <strong>Annexure B</strong> and as amended from time to time.</p>
              <p>10.2 The {entityType} reserves the right to modify its policies and procedures at any time, and you agree to be bound by such modifications upon notification.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">11. GENERAL PROVISIONS</div>
            <div style={{ marginLeft: '20px' }}>
              <p><strong>11.1 Exclusive Employment:</strong> You shall devote your full time and attention to the duties of your position and shall not engage in any other employment or business without prior written consent of the {entityType}.</p>
              <p><strong>11.2 Background Verification:</strong> Your employment is subject to satisfactory background verification. Any discrepancy found may result in immediate termination.</p>
              <p><strong>11.3 Salary Confidentiality:</strong> Your salary and other terms of this appointment are strictly confidential. Disclosure of the same to any person, including other employees, may result in disciplinary action.</p>
              <p><strong>11.4 Governing Law:</strong> This Appointment Letter shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.</p>
              <p><strong>11.5 Entire Agreement:</strong> This Appointment Letter, along with its annexures, constitutes the entire agreement between you and the {entityType} and supersedes all prior discussions, negotiations, and agreements.</p>
            </div>
          </div>

          <div className="signature-block">
            <p>Yours sincerely,</p>
            <p className="sig-company"><strong>For {companyName}</strong></p>
            {data.recruiter_signature ? (
              <img src={data.recruiter_signature} alt="Signature" style={{ maxHeight: '50px', maxWidth: '150px', objectFit: 'contain', margin: '8px 0' }} />
            ) : (
              <div className="sig-line">________________________</div>
            )}
            <p><strong>{recruiterName}</strong></p>
            <p>{recruiterDesignation}</p>
          </div>

          <div className="acceptance-box">
            <div className="acceptance-title">ACCEPTANCE BY EMPLOYEE</div>
            <p>I, {ph('employee_full_name', 'Employee Full Name')}, have read and accept all terms and conditions of this Appointment Letter and its Annexures.</p>
            <table className="accept-table">
              <tbody>
                <tr>
                  <td>
                    Signature: {data.employee_signature ? (
                      <img src={data.employee_signature} alt="Employee Signature" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
                    ) : '________________________'}
                    <br /><br /><strong>Name:</strong> {ph('employee_full_name', 'Employee Name')}
                  </td>
                  <td>Date: __________<br /><br />Place: __________<br /><br /><strong>Employee ID:</strong> {ph('employee_id', 'ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="page-break">— Page Break —</div>

          {/* ── ANNEXURE A ── */}
          <div className="doc-title">ANNEXURE A</div>
          <div className="annexure-sub">COMPENSATION STRUCTURE</div>

          {b ? (
            <>
              <div className="annex-meta">
                <span><strong>Employee:</strong> {data.employee_full_name}</span>
                <span><strong>Designation:</strong> {data.designation}</span>
                <span><strong>Effective:</strong> {data.joining_date}</span>
              </div>
              <table className="salary-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Monthly (₹)</th>
                    <th>Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Basic Salary (40%)', b.basic],
                    ['House Rent Allowance (20%)', b.hra],
                    ['Special Allowance (30%)', b.special],
                    ['Provident Fund – Employer (5%)', b.pf],
                    ['Medical Insurance (5%)', b.insurance],
                  ].map(([label, amt], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'row-even' : ''}>
                      <td>{label}</td>
                      <td className="num">{amt.toLocaleString('en-IN')}</td>
                      <td className="num">{(amt * 12).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total CTC</strong></td>
                    <td className="num"><strong>{b.monthly.toLocaleString('en-IN')}</strong></td>
                    <td className="num"><strong>{b.annualCTC.toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tbody>
              </table>
              <p className="annex-note">Salary in words: <em>{data.ctc_words}</em></p>
            </>
          ) : (
            <div className="annex-placeholder">
              📊 Salary breakup will appear here automatically once Annual CTC is entered.
            </div>
          )}

          <div className="page-break">— Page Break —</div>

          {/* ── ANNEXURE B ── */}
          <div className="doc-title">ANNEXURE B</div>
          <div className="annexure-sub">CODE OF CONDUCT, POLICIES AND PROCEDURES</div>
          <p>This Annexure sets out the policies, procedures, and code of conduct applicable to all employees of {companyName}. All employees are required to read, understand, and comply with these provisions.</p>

          <div className="clause" style={{ marginTop: '16px' }}>
            <div className="clause-title">1. ATTENDANCE AND WORKING HOURS</div>
            <div style={{ marginLeft: '20px' }}>
              <p><strong>1.1 Working Hours:</strong> The standard working hours are from <strong>{workTime}</strong>, {workDayFrom} to {workDayTo}.</p>
              <p><strong>1.2 Break Time:</strong> Employees are entitled to <strong>{breakTime}</strong> break which includes lunch.</p>
              <p><strong>1.3 Attendance System:</strong> The Company follows a biometric/digital attendance system. All employees must record their attendance upon arrival and departure.</p>
              <p><strong>1.4 Grace Period:</strong> A grace period of <strong>15 minutes</strong> is allowed from the start time. <strong>However, this grace period can only be availed ONCE per week.</strong> If the grace period is exceeded more than once in a week, the subsequent late arrivals shall be treated as <strong>half-day absent</strong> and salary shall be deducted accordingly.</p>
              <p><strong>1.5 Late Arrival:</strong> Repeated late arrivals beyond the grace period may result in salary deductions and disciplinary action.</p>
              <p><strong>1.6 Permission for Leaving Office:</strong> If an employee needs to leave the office premises for more than 30 minutes during working hours, prior approval must be obtained from the reporting manager.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">2. LEAVE POLICY</div>
            <div style={{ marginLeft: '20px' }}>
              <p><strong>2.1 Leave Entitlement:</strong> Every employee is entitled to <strong>{leavesPerMonth} days</strong> of leave per calendar month, totaling {leavesPerYear} days per financial year.</p>
              <p><strong>2.2 Financial Year:</strong> The financial year for leave calculation starts from <strong>April 1st and ends on March 31st</strong>.</p>
              <p><strong>2.3 Leave Carry Forward:</strong> A maximum of <strong>{carryForwardDays} days</strong> of unutilized leave can be carried forward to the next financial year.</p>
              <p><strong>2.4 Lapse of Leave:</strong> Any leave balance exceeding {carryForwardDays} days shall automatically lapse on March 31st of each year.</p>
              <p><strong>2.5 No Leave Encashment: There is no provision for encashment or monetary compensation for unutilized or lapsed leaves.</strong></p>
              <p><strong>2.6 Leave Application:</strong> Leave must be applied for in advance through the designated channel. Emergency leave may be granted at the discretion of the reporting manager.</p>
              <p><strong>2.7 Leave Approval:</strong> All leaves are subject to approval by the sanctioning authority and may be refused based on business exigencies.</p>
              <p><strong>2.8 Public Holidays:</strong> The list of public holidays for each calendar year shall be communicated by the office of the CEO via email or WhatsApp at the beginning of each year.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">3. DRESS CODE</div>
            <div style={{ marginLeft: '20px' }}>
              <p>3.1 All employees are expected to maintain a clean, decent, and professional appearance at all times.</p>
              <p><strong>3.2 Office Dress Code:</strong> The dress code at the Company office is <strong>Formals or Business Casuals</strong>.</p>
              <p><strong>3.3 Client Location Dress Code:</strong> At client premises or during client meetings, the dress code shall be <strong>STRICTLY BUSINESS FORMALS</strong> on any given day of the year, without exception. This is mandatory and non-negotiable.</p>
              <p>3.4 Clothing must be tailored, neat, and clean. Good personal grooming and hygiene are essential.</p>
              <p>3.5 Non-compliance with the dress code may result in being asked to leave the premises and return in appropriate attire. Repeated violations may lead to disciplinary action.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">4. EQUAL EMPLOYMENT OPPORTUNITY</div>
            <div style={{ marginLeft: '20px' }}>
              <p>4.1 The Company provides equal employment opportunity to all employees and applicants and does not discriminate on any basis prohibited by law, including race, color, sex, religion, national origin, disability, marital status, or any other protected status.</p>
              <p>4.2 Any violation of this policy should be reported immediately to the reporting manager or the Director.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">5. PROFESSIONAL CODE OF CONDUCT</div>
            <div style={{ marginLeft: '20px' }}>
              <p>All employees are expected to observe the highest standards of ethical conduct, which includes:</p>
              <p>5.1 Acting with integrity and professionalism in all dealings.</p>
              <p>5.2 Treating colleagues, clients, and stakeholders with dignity and respect.</p>
              <p>5.3 Avoiding real or apparent conflicts of interest.</p>
              <p>5.4 Performing duties with skill, honesty, care, and diligence.</p>
              <p>5.5 Maintaining confidentiality of Company information.</p>
              <p>5.6 Complying with all Company policies and applicable laws.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">6. GIFTS, FAVOURS AND CONFLICT OF INTEREST</div>
            <div style={{ marginLeft: '20px' }}>
              <p>6.1 Employees must avoid any personal, financial, or other conflict of interest that may be directly associated with their duties.</p>
              <p>6.2 Any interest that may constitute a conflict must be promptly disclosed to the management.</p>
              <p>6.3 External appointments or conducting outside business is not permitted without prior written permission of the management.</p>
              <p>6.4 Employees should never offer or accept gifts or favors that may influence or appear to influence business transactions.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">7. ASSET MANAGEMENT</div>
            <div style={{ marginLeft: '20px' }}>
              <p>7.1 Employees are responsible for protecting all Company assets provided to them, including laptops, computers, peripherals, and other equipment.</p>
              <p>7.2 Any damage, theft, or misuse of Company property shall be the responsibility of the employee, and the cost may be deducted from salary or payable by the employee.</p>
              <p>7.3 All Company assets must be returned in good condition upon termination or resignation.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">8. USE OF ELECTRONIC AND NETWORK RESOURCES</div>
            <div style={{ marginLeft: '20px' }}>
              <p>8.1 Company computers, email, internet, and other electronic resources are provided for business purposes.</p>
              <p>8.2 These resources are Company property and may be monitored without prior notice.</p>
              <p>8.3 Inappropriate use, including personal social media browsing, downloading unauthorized content, or accessing inappropriate websites, may result in disciplinary action.</p>
              <p>8.4 Employees must not copy, extract, or forward confidential information through unauthorized means.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">9. CONFIDENTIALITY, NON-SOLICITATION AND NON-COMPETE</div>
            <div style={{ marginLeft: '20px' }}>
              <p>9.1 Confidential Information includes all proprietary data, trade secrets, business plans, client information, processes, and any other information of special value to the Company.</p>
              <p><strong>9.2 LIFETIME CONFIDENTIALITY OBLIGATION: The Employee acknowledges that all confidential information constitutes trade secrets of the Company. This confidentiality obligation shall remain binding throughout the ENTIRE LIFETIME of the Employee and shall survive the termination of employment for any reason whatsoever. Under no circumstances shall such trade secrets be disclosed, shared, divulged, or made available to any third party, directly or indirectly, at any point during the Employee's lifetime.</strong></p>
              <p>9.3 Upon termination, employees must return all confidential information in any form and obtain a No Objection Certificate.</p>
              <p>9.4 For 3 (three) years following termination, employees shall not hire or solicit Company employees, or solicit Company clients.</p>
              <p>9.5 Employees shall not engage in any competing business without prior written consent of the Company.</p>
              <p><strong>9.6 LEGAL CONSEQUENCES: Any breach of this confidentiality clause shall attract civil and criminal liability under the Indian Penal Code, Information Technology Act, 2000, and other applicable laws, which may result in imprisonment and substantial monetary penalties. The Company reserves the right to initiate criminal prosecution in addition to civil remedies.</strong></p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">10. INTELLECTUAL PROPERTY RIGHTS</div>
            <div style={{ marginLeft: '20px' }}>
              <p>10.1 All work created by an employee during the course of employment shall be the property of the Company.</p>
              <p>10.2 Employees shall not use, misuse, or copy any Company trademarks, copyrights, designs, or patented products/services.</p>
              <p>10.3 All intellectual property must be delivered to the Company upon termination along with any copies.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">11. WORKPLACE CONDUCT</div>
            <div style={{ marginLeft: '20px' }}>
              <p>The following are strictly prohibited:</p>
              <p>11.1 Smoking, consuming alcohol, or using recreational drugs or intoxicants on Company premises or during working hours.</p>
              <p>11.2 Using mobile phones for personal calls during work hours except in designated areas or during breaks.</p>
              <p>11.3 Using Company landlines for personal calls.</p>
              <p>11.4 Taking photographs of office premises, equipment, or personnel using mobile phones.</p>
              <p>11.5 Violation of these rules may result in immediate disciplinary action including termination.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">12. POLICY ON HARASSMENT (INCLUDING SEXUAL HARASSMENT)</div>
            <div style={{ marginLeft: '20px' }}>
              <p>12.1 The Company is committed to providing a harassment-free workplace where every employee is treated with dignity and respect.</p>
              <p>12.2 Harassment of any kind based on race, color, sex, religion, national origin, disability, marital status, or any other protected status is strictly prohibited.</p>
              <p>12.3 Sexual harassment includes unwelcome physical contact, demands for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome conduct of a sexual nature.</p>
              <p>12.4 Complaints should be made in writing to the <strong>HR Department or the Director of the Company</strong> within 3 months of the incident, with supporting details and witness information.</p>
              <p>12.5 All complaints will be investigated promptly and handled with due regard for confidentiality and privacy.</p>
              <p>12.6 False or malicious complaints may result in disciplinary action against the complainant.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">13. DISCIPLINARY ACTION</div>
            <div style={{ marginLeft: '20px' }}>
              <p>Disciplinary action may be taken for, including but not limited to:</p>
              <p>13.1 Insubordination or refusal to follow lawful instructions.</p>
              <p>13.2 Theft, misappropriation, or unauthorized possession of Company property.</p>
              <p>13.3 Falsifying or altering Company records.</p>
              <p>13.4 Violation of harassment or equal opportunity policies.</p>
              <p>13.5 Poor job performance.</p>
              <p>13.6 Unauthorized use or wasting of Company resources.</p>
              <p>13.7 Using profanity or language to taunt or provoke co-workers.</p>
              <p>13.8 Conduct that reflects poorly on the Company.</p>
              <p><strong>13.9 BREACH OF CONFIDENTIALITY: Any breach of the confidentiality clause, including but not limited to disclosure, sharing, or misuse of trade secrets, proprietary information, client data, or any confidential information of the Company.</strong></p>
              <p>Disciplinary actions may include: Verbal warning, Written warning, Suspension with or without pay, Stoppage of increment, Demotion, Immediate termination, and <strong>Criminal prosecution and imprisonment (in cases of confidentiality breach)</strong>.</p>
              <p><strong>IMPORTANT WARNING - CONFIDENTIALITY BREACH: Breach of confidentiality is a serious offence. In addition to immediate termination, the Company shall initiate criminal proceedings against the defaulting employee under the Indian Penal Code (Sections 403, 405, 406, 408, 420), Information Technology Act, 2000 (Sections 43, 66, 72), and any other applicable laws. Such breach may result in IMPRISONMENT up to 3 years and/or substantial monetary fines.</strong> The Company also reserves the right to claim damages for any losses incurred due to such breach.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">14. SAFETY AND HEALTH</div>
            <div style={{ marginLeft: '20px' }}>
              <p>14.1 The Company strives to provide a clean, hazard-free, and safe work environment.</p>
              <p>14.2 All employees are expected to observe safety rules and report any unsafe conditions immediately.</p>
              <p>14.3 A first-aid kit is available at the HR Room for employee convenience.</p>
              <p>14.4 The Company accepts no liability arising from self-administered use of the first-aid kit.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">15. OPEN DOOR POLICY</div>
            <div style={{ marginLeft: '20px' }}>
              <p>15.1 The Company encourages open communication. Employees may freely discuss job-related concerns with their reporting manager or HR.</p>
              <p>15.2 HR is committed to resolving employee concerns in a timely and appropriate manner.</p>
            </div>
          </div>

          <div className="clause">
            <div className="clause-title">16. AMENDMENTS</div>
            <div style={{ marginLeft: '20px' }}>
              <p>16.1 The Company reserves the right to amend, modify, or withdraw any of these policies at any time.</p>
              <p>16.2 Employees will be notified of significant changes through official communication channels.</p>
            </div>
          </div>

          <div className="acceptance-box">
            <div className="acceptance-title">ACKNOWLEDGEMENT — ANNEXURE B</div>
            <p>I, {ph('employee_full_name', 'Employee Full Name')}, acknowledge receipt of the Code of Conduct, Policies and Procedures of {companyName} contained in Annexure B.</p>
            <table className="accept-table">
              <tbody>
                <tr>
                  <td>Signature: ________________________<br /><br /><strong>Name:</strong> {ph('employee_full_name', 'Employee Name')}<br /><strong>Designation:</strong> {ph('designation', 'Designation')}</td>
                  <td>Date: __________<br /><br />Place: __________<br /><br /><strong>Employee ID:</strong> {ph('employee_id', 'ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <style>{`
        .preview-panel {
          display: flex; flex-direction: column; height: 100%;
          background: #2a2a2a;
        }
        .preview-toolbar {
          padding: 12px 20px; display: flex; align-items: center; justify-content: space-between;
          background: #1e1e1e; border-bottom: 1px solid #444; flex-shrink: 0;
        }
        .toolbar-left { display: flex; align-items: center; gap: 14px; }
        .preview-label { font-size: 13px; color: rgba(255,255,255,0.7); }
        .fill-status { font-size: 12px; }
        .status-done { color: #4ade80; font-weight: 600; }
        .status-pending { color: #c9a84c; }
        .download-btn {
          padding: 9px 22px; border-radius: 8px; border: none; font-size: 13px;
          font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .download-btn.active { background: linear-gradient(135deg, #27ae60, #2ecc71); color: #fff; }
        .download-btn.active:hover { opacity: 0.85; }
        .download-btn.disabled { background: #444; color: #666; cursor: not-allowed; }

        .preview-scroll { flex: 1; overflow-y: auto; padding: 32px 24px; }
        .a4-page {
          width: 794px; max-width: 100%; margin: 0 auto;
          background: #fff; box-shadow: 0 4px 40px rgba(0,0,0,0.5);
          padding: 64px 72px; color: #111;
          font-family: 'Times New Roman', Times, serif; font-size: 11.5px; line-height: 1.75;
        }

        .doc-title {
          text-align: center; font-size: 15px; font-weight: 700;
          text-decoration: underline; margin-bottom: 20px; letter-spacing: 1px;
        }
        .annexure-sub {
          text-align: center; font-size: 12px; font-weight: 600;
          text-decoration: underline; margin-top: -14px; margin-bottom: 16px;
          color: #333;
        }
        .ref-row {
          display: flex; justify-content: space-between;
          margin-bottom: 16px; font-size: 11.5px;
        }
        .address-block { margin-bottom: 16px; line-height: 1.9; }
        .subject-line { margin-bottom: 12px; }
        .salutation { margin-bottom: 14px; }
        .clause { margin-bottom: 14px; }
        .clause-title { font-weight: 700; margin-bottom: 4px; }
        .clause p { text-align: justify; }

        .ph-filled {
          background: #d4f5dc; color: #1a5c2e;
          padding: 0 3px; border-radius: 2px;
          font-style: normal; border: none;
        }
        .ph-empty {
          background: #ffe4e4; color: #c0392b;
          padding: 0 3px; border-radius: 2px;
          font-style: italic; border: none;
        }

        .signature-block { margin: 24px 0; line-height: 2; }
        .sig-company { margin-top: 8px; }
        .sig-line { margin: 8px 0; }

        .acceptance-box {
          border: 1px solid #999; padding: 14px 16px; margin-top: 20px; border-radius: 2px;
        }
        .acceptance-title {
          font-weight: 700; font-size: 12px; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;
        }
        .accept-table { width: 100%; margin-top: 12px; border-collapse: collapse; }
        .accept-table td { padding: 8px 12px; border: 1px solid #ddd; vertical-align: top; width: 50%; font-size: 11px; line-height: 2; }

        .page-break {
          margin: 36px 0; text-align: center; color: #bbb; font-size: 10px;
          border-top: 1px dashed #ddd; padding-top: 8px;
        }

        .annex-meta {
          display: flex; gap: 24px; margin-bottom: 14px;
          font-size: 11px; background: #f5f5f5; padding: 8px 12px; border-radius: 4px;
        }
        .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; }
        .salary-table th {
          background: #0d1b2a; color: #e8c97a; padding: 9px 12px;
          text-align: left; font-weight: 600;
        }
        .salary-table th:not(:first-child) { text-align: right; }
        .salary-table td { padding: 7px 12px; border-bottom: 1px solid #e8e8e8; }
        .salary-table .num { text-align: right; }
        .salary-table .row-even td { background: #f9f9f9; }
        .total-row td { background: #0d1b2a !important; color: #e8c97a; border: none; }
        .annex-note { font-size: 10.5px; color: #555; font-style: italic; margin-top: 6px; }
        .annex-placeholder {
          padding: 20px; text-align: center; color: #999;
          background: #f9f9f9; border: 1px dashed #ddd; border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
