import { useState, useEffect, useRef } from 'react';
import { X, Send, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { processAiSupportQuery } from '../../utils/aiSupportEngine';
import { submitContact } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import { ROBOT_3D_BASE64 } from '../../assets/robotImage.js';
import './AiSupportChatbot.css';

// 3D Animated Robot Mascot Component (Shiny Black Circular Portal Background)
function Animated3DRobotMascot({ size = 'md', interactive = false }) {
  return (
    <div className={`robot-3d-mascot-wrapper size-${size} ${interactive ? 'interactive-mascot' : ''}`}>
      {/* Shiny Obsidian Black Circle Background Pod */}
      <div className="shiny-black-circle-bg">
        <div className="black-circle-gloss-overlay" />
        <div className="black-circle-glow-ring" />
      </div>

      {/* Main 3D Articulated Robot Body */}
      <div className="robot-3d-character-container">
        <img
          src={ROBOT_3D_BASE64}
          alt="3D AI Support Robot"
          className="robot-3d-img"
        />
      </div>
    </div>
  );
}

export default function AiSupportChatbot() {
  const { user, isAdmin } = useAuth();
  const userIsAdmin = isAdmin || user?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(userIsAdmin ? 'admin' : 'customer');
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'bot',
      text: userIsAdmin
        ? `👑 Welcome Admin ${user?.name || ''}! Query live store DB metrics, orders, revenue & stock below.`
        : `👋 Welcome! I'm ChatBot, your 24/7 assistant. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationForm, setEscalationForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-detect role whenever user auth changes
  useEffect(() => {
    if (userIsAdmin) {
      setActiveTab('admin');
    } else {
      setActiveTab('customer');
    }
  }, [userIsAdmin]);

  // Global window event listener to open chatbot from sidebar, profile, or any button
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ai-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-ai-chatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, isOpen]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || input.trim();
    if (!textToSend) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setTyping(true);

    try {
      const aiResult = await processAiSupportQuery(textToSend, messages);

      setTimeout(() => {
        const botMsg = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: aiResult.response,
          domain: aiResult.domain,
          confidence: aiResult.confidence,
          escalate: aiResult.escalate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMsg]);
        setTyping(false);

        if (aiResult.escalate) {
          setShowEscalationForm(true);
        }
      }, 350);
    } catch {
      setTyping(false);
    }
  };

  const handleEscalationSubmit = async (e) => {
    e.preventDefault();
    if (!escalationForm.email || !escalationForm.message) {
      toastError('Missing Fields', 'Please enter your email and support message.');
      return;
    }

    setSubmittingTicket(true);
    try {
      await submitContact({
        name: escalationForm.name || (user?.name || 'Valued Customer'),
        email: escalationForm.email,
        phone: escalationForm.phone,
        message: `[Support Bot Escalation Ticket]: ${escalationForm.message}`
      });

      toastSuccess('Ticket Dispatched! 📩', 'Our support executive will contact you shortly.');
      setShowEscalationForm(false);

      const confirmMsg = {
        id: `b-sys-${Date.now()}`,
        sender: 'bot',
        text: '✅ Priority support ticket dispatched. Our team will contact you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      toastError('Submission Error', err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // User Action Question Pills
  const customerPillQuestions = [
    {
      theme: 'pill-green',
      iconEmoji: '🔄 📦',
      label: 'How much time do I have left for return?',
      prompt: 'Hi, How much time do I have left for my order to be returned?'
    },
    {
      theme: 'pill-purple',
      iconEmoji: '🚚 🛵',
      label: 'Where is my latest order & tracking status?',
      prompt: 'Where is my latest order and tracking status?'
    },
    {
      theme: 'pill-blue',
      iconEmoji: '🌿 🖼️',
      label: 'What 3D wall stickers are in stock & prices?',
      prompt: 'What 3D wall stickers do you have in stock?'
    },
    {
      theme: 'pill-gold',
      iconEmoji: '🎟️ 🏷️',
      label: 'What active discount coupon codes can I use?',
      prompt: 'What active coupon discount codes can I use?'
    },
    {
      theme: 'pill-slate',
      iconEmoji: '💳 💰',
      label: 'Do you offer Cash on Delivery & free shipping?',
      prompt: 'Do you offer Cash on Delivery payment?'
    }
  ];

  // Admin Action Question Pills
  const adminPillQuestions = [
    {
      theme: 'pill-green',
      iconEmoji: '💰 📊',
      label: 'Inspect Store Gross Revenue & Sales (DB)',
      prompt: 'How much total sales and revenue this month?'
    },
    {
      theme: 'pill-purple',
      iconEmoji: '📦 🚚',
      label: 'Audit Pending Orders & Dispatch (DB)',
      prompt: 'How many total orders today and pending dispatch?'
    },
    {
      theme: 'pill-blue',
      iconEmoji: '⚠️ 📦',
      label: 'Check Low Stock & Out of Stock Products (DB)',
      prompt: 'Show low stock and out of stock products in DB'
    },
    {
      theme: 'pill-gold',
      iconEmoji: '👥 🗃️',
      label: 'Audit Total Registered Customer Count (DB)',
      prompt: 'How many total registered customers are in database?'
    }
  ];

  const currentQuestions = activeTab === 'admin' ? adminPillQuestions : customerPillQuestions;

  return (
    <div className="aaan-ai-support-wrapper">
      {/* Floating Compact 3D Robot Mascot Launcher Button */}
      {!isOpen && (
        <div className="floating-3d-robot-launcher" onClick={() => setIsOpen(true)}>
          <div className="robot-speech-bubble-pop">
            <span>Help? 👋</span>
          </div>
          <Animated3DRobotMascot size="lg" interactive={true} />
        </div>
      )}

      {/* Compact Support Chat Card Drawer */}
      {isOpen && (
        <div className="ai-chat-drawer">
          
          {/* Card Header */}
          <div className="chat-drawer-header">
            <div className="header-brand-info">
              <Animated3DRobotMascot size="md" />
              <div className="bot-header-text">
                <h3 className="bot-title">Support Bot</h3>
                <span className="bot-status-text">
                  <span className="live-green-pulse-dot" /> Online
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`role-indicator-badge ${userIsAdmin ? 'admin-badge' : 'user-badge'}`}>
                {userIsAdmin ? '👑 Admin' : '👤 User'}
              </span>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Thread Container */}
          <div className="chat-messages-thread">
            {messages.map((m) => (
              <div key={m.id} className={`msg-wrapper ${m.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}>
                
                {/* Sender Header Label */}
                <div className="msg-sender-label">
                  {m.sender === 'bot' ? (
                    <div className="bot-label-pill">
                      <Animated3DRobotMascot size="sm" />
                      <span>Support Bot</span>
                    </div>
                  ) : (
                    <span className="customer-label">Customer</span>
                  )}
                </div>

                {/* Bubble */}
                <div className={`msg-bubble ${m.sender === 'user' ? 'customer-bubble' : 'bot-bubble'}`}>
                  <div className="msg-text" dangerouslySetInnerHTML={{ __html: formatMarkdownText(m.text) }} />
                </div>
              </div>
            ))}

            {typing && (
              <div className="msg-wrapper bot-wrapper">
                <div className="msg-sender-label">
                  <div className="bot-label-pill">
                    <Animated3DRobotMascot size="sm" />
                    <span>Support Bot</span>
                  </div>
                </div>
                <div className="msg-bubble bot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Action Questions Card Section */}
            <div className="action-pills-card-box">
              <div className="action-card-prompt-header">
                Select an action or ask a question:
              </div>

              <div className="action-pills-list">
                {currentQuestions.map((q) => (
                  <button
                    key={q.label}
                    className={`action-pill-btn ${q.theme}`}
                    onClick={() => handleSend(q.prompt)}
                  >
                    <span className="pill-emoji-badge">{q.iconEmoji}</span>
                    <span className="pill-text">{q.label}</span>
                    <ChevronRight size={14} className="pill-arrow-icon" />
                  </button>
                ))}
              </div>
            </div>

            {/* Human Escalation Form Card */}
            {showEscalationForm && (
              <div className="escalation-form-card">
                <div className="esc-head">
                  <AlertCircle size={16} color="#0066FF" />
                  <strong>Submit Support Ticket</strong>
                  <button onClick={() => setShowEscalationForm(false)} className="esc-close">✕</button>
                </div>
                <form onSubmit={handleEscalationSubmit} className="esc-form">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={escalationForm.name}
                    onChange={(e) => setEscalationForm({ ...escalationForm, name: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    required
                    value={escalationForm.email}
                    onChange={(e) => setEscalationForm({ ...escalationForm, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={escalationForm.phone}
                    onChange={(e) => setEscalationForm({ ...escalationForm, phone: e.target.value })}
                  />
                  <textarea
                    placeholder="Describe your inquiry..."
                    required
                    rows={2}
                    value={escalationForm.message}
                    onChange={(e) => setEscalationForm({ ...escalationForm, message: e.target.value })}
                  />
                  <button type="submit" className="btn-submit-esc" disabled={submittingTicket}>
                    {submittingTicket ? 'Dispatching…' : '📩 Dispatch Ticket'}
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder={userIsAdmin ? "Ask DB metrics..." : "Ask a question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim()} aria-label="Send">
              <Send size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

function formatMarkdownText(txt) {
  if (!txt) return '';
  return txt
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}
