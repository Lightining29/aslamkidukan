import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Shield, AlertCircle } from 'lucide-react';
import { processAiSupportQuery } from '../../utils/aiSupportEngine';
import { submitContact } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './AiSupportChatbot.css';

export default function AiSupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'admin'
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'bot',
      text: "👋 Welcome to Support Bot. I'm ChatBot, your AI assistant. Let me know how I can help you.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationForm, setEscalationForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const messagesEndRef = useRef(null);

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
      }, 400);
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
        name: escalationForm.name || 'Valued Customer',
        email: escalationForm.email,
        phone: escalationForm.phone,
        message: `[Support Bot Escalation Ticket]: ${escalationForm.message}`
      });

      toastSuccess('Ticket Dispatched! 📩', 'Our support executive will contact you shortly.');
      setShowEscalationForm(false);

      const confirmMsg = {
        id: `b-sys-${Date.now()}`,
        sender: 'bot',
        text: '✅ Your high-priority support ticket has been dispatched to our Human Support Executives. We will contact you via email and phone shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      toastError('Submission Error', err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const customerQuestions = [
    { label: '🔄 Return Time Limit', prompt: 'Hi, How much time do I have left for my order to be returned?' },
    { label: '📦 Track My Order', prompt: 'Where is my latest order and tracking status?' },
    { label: '🌿 3D Stickers in Stock', prompt: 'What 3D wall stickers do you have in stock?' },
    { label: '🎟️ Active Promo Codes', prompt: 'What active coupon discount codes can I use?' },
    { label: '🚚 Shipping & Delivery', prompt: 'What are the shipping charges and delivery timelines?' },
    { label: '💳 Cash on Delivery', prompt: 'Do you offer Cash on Delivery payment?' }
  ];

  const adminQuestions = [
    { label: '📊 Today’s Sales & Revenue', prompt: 'How much total sales and revenue this month?' },
    { label: '📦 Pending Orders to Ship', prompt: 'How many total orders today and pending dispatch?' },
    { label: '⚠️ Low Stock Products', prompt: 'Show low stock and out of stock products in DB' },
    { label: '👥 Total Customer Count', prompt: 'How many total registered customers are in database?' }
  ];

  return (
    <div className="aaan-ai-support-wrapper">
      {/* Floating Small Circular Chat Trigger Button */}
      {!isOpen && (
        <button
          className="ai-chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open Support Bot"
          title="Support Bot"
        >
          <div className="fab-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
              <path d="M9.5 13.5c.83.67 1.67 1 2.5 1s1.67-.33 2.5-1"></path>
            </svg>
            <span className="fab-online-dot" />
          </div>
        </button>
      )}

      {/* Support Chat Card Drawer */}
      {isOpen && (
        <div className="ai-chat-drawer">
          
          {/* Card Header (Matches UI Mockup) */}
          <div className="chat-drawer-header">
            <div className="header-brand-info">
              <div className="bot-header-avatar-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <circle cx="9" cy="10" r="1.2" fill="currentColor"></circle>
                  <circle cx="15" cy="10" r="1.2" fill="currentColor"></circle>
                  <path d="M9.5 13.5c.83.67 1.67 1 2.5 1s1.67-.33 2.5-1"></path>
                </svg>
                <span className="avatar-online-dot" />
              </div>
              <div className="bot-header-text">
                <h3 className="bot-title">Support Bot</h3>
                <span className="bot-status-text">Online</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
              <X size={18} />
            </button>
          </div>

          {/* User / Admin Question Selector Tabs */}
          <div className="chat-mode-toggle-bar">
            <button 
              className={`mode-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              👤 Customer Questions
            </button>
            <button 
              className={`mode-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              👑 Admin DB Queries
            </button>
          </div>

          {/* Quick Suggestion Question Chips Bar */}
          <div className="quick-chips-bar">
            {(activeTab === 'customer' ? customerQuestions : adminQuestions).map((chip) => (
              <button
                key={chip.label}
                className="chip-btn"
                onClick={() => handleSend(chip.prompt)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Thread Container (Matches Chat Design) */}
          <div className="chat-messages-thread">
            {messages.map((m) => (
              <div key={m.id} className={`msg-wrapper ${m.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}>
                
                {/* Sender Header Label */}
                <div className="msg-sender-label">
                  {m.sender === 'bot' ? (
                    <div className="bot-label-pill">
                      <div className="mini-bot-icon">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
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
                    <div className="mini-bot-icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
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

            {/* Human Escalation Form Card */}
            {showEscalationForm && (
              <div className="escalation-form-card">
                <div className="esc-head">
                  <AlertCircle size={18} color="#0066FF" />
                  <strong>Submit Ticket for Support Team</strong>
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
                    {submittingTicket ? 'Dispatching…' : '📩 Dispatch Ticket to Admin'}
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
              placeholder="Ask a question or type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim()} aria-label="Send">
              <Send size={15} />
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
