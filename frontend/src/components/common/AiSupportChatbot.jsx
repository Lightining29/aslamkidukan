import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Phone, Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import AaanLogo from './AaanLogo';
import { processAiSupportQuery } from '../../utils/aiSupportEngine';
import { submitContact } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './AiSupportChatbot.css';

export default function AiSupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'bot',
      text: '👋 Hello! I am your 24/7 AAAN AI Support Assistant. How can I help you today with your order, shipping, warranty, or returns?',
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
      // Process AI Query
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
      }, 500);
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
        message: `[AI Escalated Human Ticket]: ${escalationForm.message}`
      });

      toastSuccess('Ticket Submitted! 📩', 'Our support team will contact you within 15 minutes.');
      setShowEscalationForm(false);

      const confirmMsg = {
        id: `b-sys-${Date.now()}`,
        sender: 'bot',
        text: '✅ Your high-priority support ticket has been dispatched to our Human Support Executives. We will email & SMS you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      toastError('Submission Error', err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="aaan-ai-support-wrapper">
      {/* Floating Small Toggle Button */}
      {!isOpen && (
        <button
          className="ai-chat-fab small-chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open 24/7 AI Support"
          title="24/7 AI Support Chat"
        >
          <div className="fab-icon-box">
            <MessageSquare size={20} color="#FFFFFF" />
            <span className="fab-online-dot" />
          </div>
          <span className="fab-mini-text">Chat</span>
        </button>
      )}

      {/* Support Chat Drawer */}
      {isOpen && (
        <div className="ai-chat-drawer">
          
          {/* Header */}
          <div className="chat-drawer-header">
            <div className="header-brand-info">
              <AaanLogo size="sm" light={true} />
              <div>
                <strong>AAAN AI Support Executive</strong>
                <span className="online-badge">● 24/7 AI Assistant · Fast Answers</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Quick Suggestion Chips Bar */}
          <div className="quick-chips-bar">
            {[
              { label: '📦 Track Order', prompt: 'Where is my order and how to track it?' },
              { label: '🚚 Shipping Info', prompt: 'What are the shipping charges and delivery time?' },
              { label: '🔄 Returns & Refunds', prompt: 'What is the return policy and refund timeline?' },
              { label: '🛡️ Claim Warranty', prompt: 'How to claim 1 year AAAN official warranty?' },
              { label: '🎟️ Promo Codes', prompt: 'What active coupon codes can I use?' },
              { label: '🙋 Human Agent', prompt: 'I want to speak with a human support agent' }
            ].map((chip) => (
              <button
                key={chip.label}
                className="chip-btn"
                onClick={() => handleSend(chip.prompt)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Thread Container */}
          <div className="chat-messages-thread">
            {messages.map((m) => (
              <div key={m.id} className={`msg-row ${m.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                {m.sender === 'bot' && (
                  <div className="bot-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className="msg-bubble">
                  <div className="msg-text" dangerouslySetInnerHTML={{ __html: formatMarkdownText(m.text) }} />
                  
                  {m.confidence !== undefined && (
                    <div className="msg-meta-row">
                      <span className="confidence-pill">
                        AI Confidence: {Math.round(m.confidence * 100)}%
                      </span>
                      <span className="msg-time">{m.time}</span>
                    </div>
                  )}

                  {m.escalate && !showEscalationForm && (
                    <button
                      className="btn-trigger-escalation"
                      onClick={() => {
                        setEscalationForm({ ...escalationForm, message: input || m.text });
                        setShowEscalationForm(true);
                      }}
                    >
                      <Phone size={14} /> Connect to Human Representative
                    </button>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="msg-row bot-msg">
                <div className="bot-avatar">
                  <Bot size={16} />
                </div>
                <div className="msg-bubble typing-bubble">
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
                  <AlertCircle size={18} color="#4F46E5" />
                  <strong>Submit Ticket for Human Support Agent</strong>
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
                    {submittingTicket ? 'Dispatching…' : '📩 Send Priority Ticket'}
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
              placeholder="Ask about orders, shipping, warranty..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
              <Send size={16} />
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
