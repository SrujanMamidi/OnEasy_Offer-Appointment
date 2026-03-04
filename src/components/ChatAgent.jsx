import { useState, useEffect, useRef } from 'react';
import { QUESTIONS, numberToWords, formatIndianNumber, generateSalaryBreakup } from '../utils.js';

export default function ChatAgent({ initialData = {}, onDataUpdate, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(initialData);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Derive a smart placeholder based on the last agent message
  const lastAgentMsg = messages.filter(m => m.role === 'agent').pop()?.text || '';
  let currentPlaceholder = "Type details (e.g. John joining as Dev for 10L CTC...)";

  if (lastAgentMsg.toLowerCase().includes('employee id') || lastAgentMsg.toLowerCase().includes('reporting manager')) {
    currentPlaceholder = "e.g., ID is OE-2024-001 and manager is Engineering Lead";
  } else if (lastAgentMsg.toLowerCase().includes('title') || lastAgentMsg.toLowerCase().includes('address')) {
    currentPlaceholder = "e.g., Mr., 123 Main St, New York, NY 10001";
  } else if (lastAgentMsg.toLowerCase().includes('ctc') || lastAgentMsg.toLowerCase().includes('designation')) {
    currentPlaceholder = "e.g., 800000 CTC as Audit Manager";
  } else if (lastAgentMsg.toLowerCase().includes('date')) {
    currentPlaceholder = "e.g., Joining on 15/05/2024 or Valid until 20/05/2024";
  }

  useEffect(() => {
    // Only set initial message once component mounts
    setTimeout(() => {
      const alreadyExtracted = Object.keys(initialData).length;
      let text = "👋 Welcome! I'll collect all required details for the Offer & Appointment Letter.\n\nJust tell me about the candidate (e.g., 'Ramesh is joining as an Audit Manager with an 8 lakh CTC'). Let's begin!";

      if (alreadyExtracted > 0) {
        text = `👋 Welcome! I've already autofilled the candidate address from the previous step.\n\nNow, tell me the rest of their details (e.g., 'Ramesh is joining as an Audit Manager with an 8 lakh CTC').`;
      }

      setMessages([{ role: 'agent', text }]);
    }, 300);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if all fields are extracted
  useEffect(() => {
    const requiredKeys = QUESTIONS.map(q => q.id);
    const completedKeys = Object.keys(extractedData);
    const isComplete = requiredKeys.every(k => completedKeys.includes(k) && !!extractedData[k]);

    if (isComplete && !done && messages.length > 1) {
      setDone(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          text: '✅ All done! I have all the information needed. The document preview is ready in the next step.',
        }]);
        onComplete();
      }, 500);
    }
  }, [extractedData, done, messages.length, onComplete]);

  async function handleSend() {
    if (!input.trim() || isLoading || done) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          extractedData: extractedData
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      // Update local extracted data state
      let newData = { ...extractedData };
      let parentUpdate = {};

      if (data.extracted && Object.keys(data.extracted).length > 0) {
        for (const [key, value] of Object.entries(data.extracted)) {
          if (value) {
            newData[key] = value;
            parentUpdate[key] = value;

            // Handle special case for CTC to generate breakup
            if (key === 'annual_ctc') {
              const clean = parseInt(value.toString().replace(/,/g, ''));
              if (!isNaN(clean)) {
                parentUpdate.ctc_figures = formatIndianNumber(clean);
                parentUpdate.ctc_words = numberToWords(clean);
                parentUpdate.salary_breakup = generateSalaryBreakup(clean);
              }
            }
          }
        }

        setExtractedData(newData);
        if (Object.keys(parentUpdate).length > 0) {
          onDataUpdate(parentUpdate);
        }
      }

      setMessages(prev => [...prev, { role: 'agent', text: data.reply || "Got it. What else?" }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'agent', text: "Sorry, I had trouble processing that. Could you try again?" }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const progress = Math.round((Object.keys(extractedData).length / QUESTIONS.length) * 100);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-icon">💬</div>
        <div>
          <div className="chat-header-title">AI Document Agent</div>
          {!done && <div className="chat-header-sub">{Object.keys(extractedData).length} of {QUESTIONS.length} Fields Gathered</div>}
          {done && <div className="chat-header-sub done-sub">✓ Complete</div>}
        </div>
        <div className="chat-progress-mini">
          <div className="mini-bar">
            <div className="mini-fill" style={{ width: `${done ? 100 : Math.min(progress, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            {msg.role === 'agent' && <div className="agent-avatar">OE</div>}
            <div className={`msg-bubble ${msg.role}`}>
              <p>{msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="msg-row agent">
            <div className="agent-avatar">OE</div>
            <div className="msg-bubble agent typing">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!done && (
        <div className="chat-input-area">
          <div className="input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKey}
              placeholder={currentPlaceholder}
              disabled={isLoading}
              rows={1}
            />
            <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
              →
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="chat-done-bar">
          <span className="done-text">🎉 All fields collected successfully!</span>
        </div>
      )}

      <style>{`
        .chat-panel {
          display: flex; flex-direction: column;
          height: 100%; background: transparent;
        }
        .chat-header {
          padding: 14px 18px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          flex-shrink: 0;
        }
        .chat-header-icon { font-size: 20px; }
        .chat-header-title { font-size: 14px; font-weight: 600; color: #e8c97a; font-family: 'Playfair Display', serif; }
        .chat-header-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .done-sub { color: #4ade80 !important; }
        .chat-progress-mini { margin-left: auto; }
        .mini-bar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .mini-fill { height: 100%; background: linear-gradient(90deg, #c9a84c, #e8c97a); border-radius: 2px; transition: width 0.4s; }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 20px 16px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .msg-row { display: flex; gap: 10px; align-items: flex-start; }
        .msg-row.user { justify-content: flex-end; }
        .agent-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #c9a84c, #e8c97a);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; color: #0d1b2a; margin-top: 2px;
        }
        .msg-bubble {
          max-width: 78%; padding: 10px 14px; border-radius: 12px;
          font-size: 13.5px; line-height: 1.65; white-space: pre-wrap;
        }
        .msg-bubble.agent {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.88); border-radius: 4px 12px 12px 12px;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #c9a84c, #b8943a);
          color: #0d1b2a; font-weight: 500; border-radius: 12px 12px 4px 12px;
        }
        
        .typing .dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background-color: rgba(255,255,255,0.6); margin: 0 2px;
          animation: wave 1.3s linear infinite;
        }
        .typing .dot:nth-child(2) { animation-delay: -1.1s; }
        .typing .dot:nth-child(3) { animation-delay: -0.9s; }
        @keyframes wave {
          0%, 60%, 100% { transform: initial; }
          30% { transform: translateY(-4px); }
        }

        .chat-input-area {
          padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.25); flex-shrink: 0;
        }
        .input-row { display: flex; gap: 8px; align-items: flex-end; }
        .chat-input {
          flex: 1; padding: 14px 16px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: #fff; font-size: 14px; font-family: 'Inter', sans-serif; outline: none;
          transition: border 0.2s;
          resize: none;
          min-height: 50px;
          max-height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
          line-height: 1.5;
          box-sizing: border-box;
        }
        .chat-input:focus { border-color: rgba(201,168,76,0.5); }
        .chat-input:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .send-btn {
          padding: 0 20px; border-radius: 8px; border: none;
          height: 50px;
          background: linear-gradient(135deg, #c9a84c, #b8943a);
          color: #0d1b2a; font-weight: 700; cursor: pointer; font-size: 18px;
          transition: opacity 0.2s; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .chat-done-bar {
          padding: 14px 18px; text-align: center;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(74,222,128,0.07); flex-shrink: 0;
        }
        .done-text { font-size: 13px; color: #4ade80; }
      `}</style>
    </div>
  );
}
