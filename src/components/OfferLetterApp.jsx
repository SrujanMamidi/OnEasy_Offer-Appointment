import { useState } from 'react';
import OfferLetterForm from './OfferLetterForm.jsx';
import DocPreview from './DocPreview.jsx';
import { QUESTIONS } from '../utils.js';

export default function OfferLetterApp() {
  const [data, setData] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();
    const isNextYear = today.getMonth() >= 3; // April or later
    const finYear = isNextYear ? `${yearStr}-${(yearStr + 1).toString().slice(2)}` : `${yearStr - 1}-${yearStr.toString().slice(2)}`;

    const validity = new Date(today);
    validity.setDate(validity.getDate() + 3);
    const vDay = String(validity.getDate()).padStart(2, '0');
    const vMonth = String(validity.getMonth() + 1).padStart(2, '0');
    const vYearStr = validity.getFullYear();

    return {
      serial_number: `HR-${Math.floor(Math.random() * 900) + 100}`,
      letter_date: `${day}/${month}/${yearStr}`,
      year: finYear,
      joining_date: `${day}/${month}/${yearStr}`,
      offer_validity_date: `${vDay}/${vMonth}/${vYearStr}`,
      employee_id: `OE-EMP-${Math.floor(Math.random() * 9000) + 1000}`,
      // Default policy values
      leaves_per_month: '1.5',
      carry_forward_days: '4',
      notice_period_days: '45',
      absent_days_absconding: '3',
      probation_months: '6',
    };
  });
  const [allDone, setAllDone] = useState(false);

  function handleDataUpdate(update) {
    setData(prev => {
      const next = { ...prev, ...update };
      // Update global progress bar
      const requiredQs = QUESTIONS.filter(q => {
        if (q.conditional && !q.conditional(next)) return false;
        if (q.type === 'file' || q.type === 'readonly') return false;
        return true;
      });
      const filled = requiredQs.filter(q => next[q.id] && next[q.id] !== '').length;
      const pct = Math.round((filled / requiredQs.length) * 100);
      const bar = document.getElementById('globalProgress');
      const pctEl = document.getElementById('progressPct');
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      return next;
    });
  }

  function handleComplete() {
    setAllDone(true);
    const bar = document.getElementById('globalProgress');
    const pctEl = document.getElementById('progressPct');
    if (bar) bar.style.width = '100%';
    if (pctEl) pctEl.textContent = '100%';
  }

  async function handleDownloadOffer() {
    try {
      const { generateOfferLetterDocx } = await import('../docxGenerator.js');
      await generateOfferLetterDocx(data);
    } catch (err) {
      console.error('DOCX generation error:', err);
      alert('Error generating Offer Letter: ' + err.message);
    }
  }

  async function handleDownloadAppointment() {
    try {
      const { generateAppointmentLetterDocx } = await import('../docxGenerator.js');
      await generateAppointmentLetterDocx(data);
    } catch (err) {
      console.error('DOCX generation error:', err);
      alert('Error generating Appointment Letter: ' + err.message);
    }
  }

  return (
    <div className="app-layout">

      <div className="wizard-content">
        <div className="step-panel step-2 side-by-side">
          <div className="pane pane-form form-half">
            <OfferLetterForm
              initialData={data}
              onDataUpdate={handleDataUpdate}
              onComplete={handleComplete}
            />
          </div>

          <div className="pane pane-preview preview-half">
            <DocPreview
              data={data}
              allDone={allDone}
              onDownloadOffer={handleDownloadOffer}
              onDownloadAppointment={handleDownloadAppointment}
            />

            {allDone && (
              <div className="preview-actions">
                <button className="btn-primary huge" onClick={handleDownloadOffer}>
                  📄 Download Offer Letter
                </button>
                <button className="btn-primary huge" onClick={handleDownloadAppointment}>
                  📄 Download Appointment Letter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 60px);
          margin-top: 60px;
          overflow: hidden;
          background: #0d1b2a;
        }

        .wizard-content {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        
        .step-panel {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          animation: fadeIn 0.4s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-primary {
          background: linear-gradient(135deg, #c9a84c, #b8943a);
          color: #0d1b2a;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary.huge {
          padding: 18px 40px;
          font-size: 18px;
        }

        /* Side by Side Layout */
        .side-by-side {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
          align-items: stretch;
        }
        .form-half {
          flex: 0 0 520px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(201,168,76,0.15);
          background: rgba(0,0,0,0.1);
          height: 100%;
          min-width: 0;
          overflow: hidden;
        }
        .preview-half {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          position: relative;
        }
        .preview-actions {
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 20px;
          background: #1e1e1e;
          border-top: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 -10px 20px rgba(0,0,0,0.2);
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
