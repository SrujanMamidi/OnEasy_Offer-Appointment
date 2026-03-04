import { useState, useEffect, useRef } from 'react';
import { QUESTIONS, numberToWords, formatIndianNumber, generateSalaryBreakup } from '../utils.js';

export default function OfferLetterForm({ initialData = {}, onDataUpdate, onComplete }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [recruiterSigPreview, setRecruiterSigPreview] = useState(null);
  const [employeeSigPreview, setEmployeeSigPreview] = useState(null);
  const [done, setDone] = useState(false);
  const [orgLookupLoading, setOrgLookupLoading] = useState(false);
  const [orgLookupMsg, setOrgLookupMsg] = useState(null);
  const formRef = useRef(null);

  // Group questions by section
  const sections = {};
  QUESTIONS.forEach(q => {
    const sec = q.section || 'Other';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(q);
  });

  // Check completeness
  useEffect(() => {
    const requiredQs = QUESTIONS.filter(q => {
      if (q.conditional && !q.conditional(formData)) return false;
      if (q.type === 'file' || q.type === 'readonly') return false;
      return true;
    });
    const allFilled = requiredQs.every(q => {
      const val = formData[q.id];
      return val !== undefined && val !== '' && q.validate(val) === null;
    });
    if (allFilled && !done && Object.keys(formData).length > 5) {
      setDone(true);
      onComplete();
    }
  }, [formData, done, onComplete]);

  function handleChange(id, value) {
    const newData = { ...formData, [id]: value };
    const parentUpdate = { [id]: value };

    // Auto-populate salary words & breakup when CTC changes
    if (id === 'annual_ctc') {
      const clean = parseInt(value.toString().replace(/,/g, ''));
      if (!isNaN(clean) && clean > 0) {
        parentUpdate.ctc_figures = formatIndianNumber(clean);
        parentUpdate.ctc_words = numberToWords(clean);
        parentUpdate.salary_breakup = generateSalaryBreakup(clean);
        newData.ctc_figures = parentUpdate.ctc_figures;
        newData.ctc_words = parentUpdate.ctc_words;
        newData.salary_breakup = parentUpdate.salary_breakup;
      }
    }

    // Calculate leaves per year from leaves per month
    if (id === 'leaves_per_month') {
      const lpm = parseFloat(value);
      if (!isNaN(lpm)) {
        parentUpdate.leaves_per_year = Math.round(lpm * 12);
        newData.leaves_per_year = parentUpdate.leaves_per_year;
      }
    }

    setFormData(newData);
    onDataUpdate(parentUpdate);

    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  // Lookup organization details from name
  async function handleOrgLookup() {
    const orgName = formData.org_name_for_logo;
    if (!orgName || !orgName.trim()) return;
    setOrgLookupLoading(true);
    setOrgLookupMsg(null);
    try {
      const res = await fetch('/api/org-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: orgName.trim() })
      });
      if (!res.ok) throw new Error('Lookup failed');
      const result = await res.json();
      const updates = {};
      if (result.office_address) {
        updates.office_address = result.office_address;
      }
      if (result.entity_type && ['Company', 'Proprietorship', 'Partnership', 'LLP', 'Firm'].includes(result.entity_type)) {
        updates.entity_type = result.entity_type;
      }
      if (result.org_full_name) {
        updates.org_name_for_logo = result.org_full_name;
      }
      if (Object.keys(updates).length > 0) {
        const newData = { ...formData, ...updates };
        setFormData(newData);
        onDataUpdate(updates);
        setOrgLookupMsg(`✓ Found details for "${result.org_full_name || orgName}"`);
      } else {
        setOrgLookupMsg('No details found. Please fill manually.');
      }
    } catch (err) {
      console.error('Org lookup error:', err);
      setOrgLookupMsg('Lookup failed. Please fill manually.');
    } finally {
      setOrgLookupLoading(false);
    }
  }

  function handleFileChange(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (id === 'org_logo') setLogoPreview(dataUrl);
      if (id === 'recruiter_signature') setRecruiterSigPreview(dataUrl);
      if (id === 'employee_signature') setEmployeeSigPreview(dataUrl);
      handleChange(id, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function getFilePreview(id) {
    if (id === 'org_logo') return logoPreview;
    if (id === 'recruiter_signature') return recruiterSigPreview;
    if (id === 'employee_signature') return employeeSigPreview;
    return null;
  }

  // Parse salary into Indian digit groups for display
  function getSalaryDigitGroups(val) {
    const clean = parseInt((val || '').toString().replace(/,/g, ''));
    if (isNaN(clean) || clean <= 0) return null;
    const str = clean.toString();
    const len = str.length;
    const groups = [];

    // Indian system: last 3 digits = hundreds, then groups of 2
    if (len >= 1) {
      const hundreds = str.slice(Math.max(0, len - 3));
      groups.unshift({ label: 'Hundreds', value: hundreds });
    }
    if (len > 3) {
      const thousands = str.slice(Math.max(0, len - 5), len - 3);
      groups.unshift({ label: 'Thousands', value: thousands });
    }
    if (len > 5) {
      const lakhs = str.slice(Math.max(0, len - 7), len - 5);
      groups.unshift({ label: 'Lakhs', value: lakhs });
    }
    if (len > 7) {
      const crores = str.slice(0, len - 7);
      groups.unshift({ label: 'Crores', value: crores });
    }
    return groups;
  }

  const filledCount = QUESTIONS.filter(q => {
    if (q.conditional && !q.conditional(formData)) return false;
    if (q.type === 'file' || q.type === 'readonly') return false;
    return formData[q.id] !== undefined && formData[q.id] !== '';
  }).length;

  const totalCount = QUESTIONS.filter(q => {
    if (q.conditional && !q.conditional(formData)) return false;
    if (q.type === 'file' || q.type === 'readonly') return false;
    return true;
  }).length;

  const progress = Math.round((filledCount / totalCount) * 100);

  return (
    <div className="form-panel" ref={formRef}>
      <div className="form-header">
        <div className="form-header-icon">📋</div>
        <div>
          <div className="form-header-title">Offer Letter Details</div>
          <div className="form-header-sub">
            {done ? <span className="done-sub">✓ All fields complete</span> : `${filledCount} of ${totalCount} fields filled`}
          </div>
        </div>
        <div className="form-progress-mini">
          <div className="mini-bar">
            <div className="mini-fill" style={{ width: `${done ? 100 : Math.min(progress, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="form-body">
        {Object.entries(sections).map(([sectionName, questions]) => {
          // Filter out conditional fields that shouldn't show
          const visibleQs = questions.filter(q => {
            if (q.conditional) return q.conditional(formData);
            return true;
          });
          if (visibleQs.length === 0) return null;

          return (
            <div key={sectionName} className="form-section">
              <div className="section-header">{sectionName}</div>
              {visibleQs.map(q => (
                <div key={q.id} className="form-field">
                  <label className="field-label">
                    {q.label}
                    {q.type !== 'file' && q.type !== 'readonly' && <span className="required-star">*</span>}
                  </label>
                  {q.note && <div className="field-note">{q.note}</div>}

                  {/* Select dropdown */}
                  {q.type === 'select' && (
                    <select
                      className="field-select"
                      value={formData[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {q.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* Date input */}
                  {q.type === 'date' && (
                    <input
                      type="text"
                      className="field-input"
                      value={formData[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'DD/MM/YYYY'}
                    />
                  )}

                  {/* Salary input with digit groups */}
                  {q.type === 'salary' && (
                    <div className="salary-input-group">
                      <input
                        type="text"
                        className="field-input salary-input"
                        value={formData[q.id] || ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          handleChange(q.id, raw);
                        }}
                        placeholder={q.placeholder}
                      />
                      {getSalaryDigitGroups(formData[q.id]) && (
                        <div className="salary-digit-display">
                          {getSalaryDigitGroups(formData[q.id]).map((g, i) => (
                            <div key={i} className="digit-group">
                              <div className="digit-label">{g.label}</div>
                              <div className="digit-boxes">
                                {g.value.split('').map((d, j) => (
                                  <div key={j} className="digit-box">{d}</div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="salary-formatted">
                            ₹ {formatIndianNumber(parseInt(formData[q.id]))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Readonly field */}
                  {q.type === 'readonly' && (
                    <div className="field-readonly">
                      {formData[q.id] || <span className="empty-msg">Auto-populated when salary is entered</span>}
                    </div>
                  )}

                  {/* File upload */}
                  {q.type === 'file' && (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept={q.accept}
                        onChange={e => handleFileChange(q.id, e.target.files[0])}
                        className="file-input"
                        id={`file-${q.id}`}
                      />
                      <label htmlFor={`file-${q.id}`} className="file-upload-label">
                        {getFilePreview(q.id) ? (
                          <div className="file-preview">
                            <img src={getFilePreview(q.id)} alt="Preview" className="file-preview-img" />
                            <span className="file-change-text">Click to change</span>
                          </div>
                        ) : (
                          <div className="file-placeholder">
                            <span className="upload-icon">📁</span>
                            <span>Click to upload (JPG, PNG, or PDF)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {/* Multiline textarea */}
                  {q.multiline && !q.type && (
                    <textarea
                      className="field-textarea"
                      value={formData[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={3}
                    />
                  )}

                  {/* Regular text input */}
                  {!q.type && !q.multiline && (
                    <div className={q.id === 'org_name_for_logo' ? 'org-name-row' : ''}>
                      <input
                        type="text"
                        className="field-input"
                        value={formData[q.id] || ''}
                        onChange={e => handleChange(q.id, e.target.value)}
                        placeholder={q.placeholder}
                      />
                      {q.id === 'org_name_for_logo' && (
                        <>
                          <button
                            type="button"
                            className="org-lookup-btn"
                            onClick={handleOrgLookup}
                            disabled={orgLookupLoading || !formData.org_name_for_logo?.trim()}
                            title="Search & auto-fill organization details"
                          >
                            {orgLookupLoading ? (
                              <span className="lookup-spinner" />
                            ) : (
                              '🔍 Search & Autofill'
                            )}
                          </button>
                          {orgLookupMsg && (
                            <div className={`org-lookup-msg ${orgLookupMsg.startsWith('✓') ? 'success' : 'warn'}`}>
                              {orgLookupMsg}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {errors[q.id] && <div className="field-error">{errors[q.id]}</div>}
                </div>
              ))}
            </div>
          );
        })}

        {/* Salary Breakup Table - auto-generated */}
        {formData.salary_breakup && (
          <div className="form-section">
            <div className="section-header">Salary Breakup (Auto-Generated)</div>
            <div className="salary-breakup-card">
              <table className="breakup-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Monthly (₹)</th>
                    <th>Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Basic Salary (40%)', formData.salary_breakup.basic],
                    ['HRA (20%)', formData.salary_breakup.hra],
                    ['Special Allowance (30%)', formData.salary_breakup.special],
                    ['PF - Employer (5%)', formData.salary_breakup.pf],
                    ['Medical Insurance (5%)', formData.salary_breakup.insurance],
                  ].map(([label, amt], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'row-even' : ''}>
                      <td>{label}</td>
                      <td className="num">{amt.toLocaleString('en-IN')}</td>
                      <td className="num">{(amt * 12).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total CTC</strong></td>
                    <td className="num"><strong>{formData.salary_breakup.monthly.toLocaleString('en-IN')}</strong></td>
                    <td className="num"><strong>{formData.salary_breakup.annualCTC.toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {done && (
        <div className="form-done-bar">
          <span className="done-text">🎉 All fields filled! Your document is ready for download.</span>
        </div>
      )}

      <style>{`
        .form-panel {
          display: flex; flex-direction: column;
          height: 100%; background: transparent;
        }
        .form-header {
          padding: 14px 18px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          flex-shrink: 0;
        }
        .form-header-icon { font-size: 20px; }
        .form-header-title { font-size: 14px; font-weight: 600; color: #e8c97a; font-family: 'Playfair Display', serif; }
        .form-header-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .done-sub { color: #4ade80 !important; }
        .form-progress-mini { margin-left: auto; }
        .mini-bar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .mini-fill { height: 100%; background: linear-gradient(90deg, #c9a84c, #e8c97a); border-radius: 2px; transition: width 0.4s; }

        .form-body {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 8px;
        }

        .form-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 4px;
        }

        .section-header {
          font-size: 13px;
          font-weight: 700;
          color: #e8c97a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          font-family: 'Playfair Display', serif;
        }

        .form-field {
          margin-bottom: 14px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          margin-bottom: 5px;
        }
        .required-star { color: #f87171; margin-left: 3px; }

        .field-note {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 5px;
          font-style: italic;
        }

        .field-input, .field-textarea, .field-select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(0,0,0,0.25);
          color: #fff;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus, .field-textarea:focus, .field-select:focus {
          border-color: #c9a84c;
        }
        .field-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .field-select {
          cursor: pointer;
        }
        .field-select option {
          background: #1a2d42;
          color: #fff;
        }

        .field-readonly {
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          color: #e8c97a;
          font-size: 13px;
          font-style: italic;
          min-height: 38px;
        }
        .empty-msg { color: rgba(255,255,255,0.3); }

        .field-error {
          font-size: 11px;
          color: #f87171;
          margin-top: 4px;
        }

        /* Salary digit display */
        .salary-input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .salary-input {
          font-size: 16px !important;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .salary-digit-display {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
          padding: 10px;
          background: rgba(201,168,76,0.06);
          border-radius: 8px;
          border: 1px solid rgba(201,168,76,0.15);
        }
        .digit-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .digit-label {
          font-size: 9px;
          font-weight: 700;
          color: #c9a84c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .digit-boxes {
          display: flex;
          gap: 3px;
        }
        .digit-box {
          width: 26px;
          height: 32px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #e8c97a;
          font-family: 'Inter', monospace;
        }
        .salary-formatted {
          font-size: 14px;
          font-weight: 700;
          color: #4ade80;
          margin-left: auto;
          padding: 4px 10px;
          background: rgba(74,222,128,0.08);
          border-radius: 6px;
        }

        /* File upload */
        .file-upload-area {
          position: relative;
        }
        .file-input {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
          overflow: hidden;
        }
        .file-upload-label {
          display: block;
          cursor: pointer;
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .file-upload-label:hover {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.05);
        }
        .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
        }
        .upload-icon { font-size: 24px; }
        .file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .file-preview-img {
          max-width: 120px;
          max-height: 60px;
          border-radius: 4px;
          object-fit: contain;
        }
        .file-change-text {
          font-size: 11px;
          color: #c9a84c;
        }

        /* Salary breakup table in form */
        .salary-breakup-card {
          overflow-x: auto;
        }
        .breakup-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .breakup-table th {
          background: rgba(201,168,76,0.15);
          color: #e8c97a;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
        }
        .breakup-table th:not(:first-child) { text-align: right; }
        .breakup-table td {
          padding: 7px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
        }
        .breakup-table .num { text-align: right; font-family: 'Inter', monospace; }
        .breakup-table .row-even td { background: rgba(255,255,255,0.02); }
        .breakup-table .total-row td {
          background: rgba(201,168,76,0.12) !important;
          color: #e8c97a;
          border: none;
          font-weight: 600;
        }

        /* Org name lookup */
        .org-name-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .org-lookup-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(201,168,76,0.4);
          background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08));
          color: #e8c97a;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: fit-content;
        }
        .org-lookup-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.15));
          border-color: #c9a84c;
        }
        .org-lookup-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .lookup-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(201,168,76,0.3);
          border-top-color: #e8c97a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .org-lookup-msg {
          font-size: 11px;
          padding: 4px 0;
        }
        .org-lookup-msg.success { color: #4ade80; }
        .org-lookup-msg.warn { color: #fbbf24; }

        .form-done-bar {
          padding: 14px 18px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(74,222,128,0.07);
          flex-shrink: 0;
        }
        .done-text { font-size: 13px; color: #4ade80; }

        /* Tablet */
        @media (max-width: 1024px) {
          .form-body {
            padding: 12px;
          }
          .form-section {
            padding: 12px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .form-header {
            padding: 10px 12px;
            gap: 8px;
          }
          .form-header-title {
            font-size: 13px;
          }
          .form-body {
            padding: 10px;
            gap: 6px;
          }
          .form-section {
            padding: 10px;
          }
          .section-header {
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          .field-label {
            font-size: 11px;
          }
          .field-input, .field-textarea, .field-select {
            padding: 9px 10px;
            font-size: 14px; /* better for mobile tap targets */
          }
          .salary-digit-display {
            gap: 8px;
            padding: 8px;
            flex-wrap: wrap;
          }
          .digit-box {
            width: 22px;
            height: 28px;
            font-size: 14px;
          }
          .salary-formatted {
            font-size: 12px;
            margin-left: 0;
            width: 100%;
            text-align: center;
          }
          .breakup-table {
            font-size: 11px;
          }
          .breakup-table th, .breakup-table td {
            padding: 6px 8px;
          }
          .file-upload-label {
            padding: 12px;
          }
          .org-lookup-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .form-body {
            padding: 8px;
          }
          .form-section {
            padding: 8px;
            border-radius: 8px;
          }
          .digit-box {
            width: 20px;
            height: 26px;
            font-size: 13px;
          }
          .digit-label {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
}
