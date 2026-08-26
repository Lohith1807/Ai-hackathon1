import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Mic, Send, Bot, Volume2, VolumeX } from 'lucide-react';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I\'m Medy AI 🩺 Ask me anything about healthcare — in any language!' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Detect language for TTS voice selection
  const detectLang = (text) => {
    // Telugu Unicode range
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
    // Hindi/Devanagari
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
    // Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
    // Bengali
    if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
    // Arabic
    if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
    // Japanese
    if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) return 'ja-JP';
    return 'en-US';
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const lang = detectLang(text);
    utterance.lang = lang;

    // Try to find a female voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0];
    const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
    const femaleVoice = langVoices.find(v => /female|woman|zira|heera|swara|google.*female/i.test(v.name))
      || langVoices.find(v => !/male|david|mark|ravi/i.test(v.name))
      || langVoices[0];
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10) // Send last 10 messages for context
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      const botText = data.reply;
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
      // Auto-speak the response
      speakText(botText);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, #00b894))',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open AI Chat"
        >
          <MessageCircle size={30} color="white" />
        </button>
      )}

      {/* Centered Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => { setIsOpen(false); stopSpeaking(); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />

          {/* Chat Window – Centered */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(420px, 92vw)',
            height: 'min(580px, 85vh)',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, #00b894))',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Bot size={26} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Medy AI</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>Healthcare Assistant • Multilingual</p>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); stopSpeaking(); }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8f9fa' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <div style={{
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, #00b894))'
                      : 'white',
                    color: m.role === 'user' ? 'white' : 'var(--text-main)',
                    padding: '0.75rem 1rem',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    maxWidth: '82%',
                    lineHeight: 1.5,
                    fontSize: '0.92rem',
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </div>
                  {m.role === 'model' && i > 0 && (
                    <button
                      onClick={() => speakText(m.text)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px', flexShrink: 0 }}
                      title="Read aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Speaking indicator */}
            {isSpeaking && (
              <div
                onClick={stopSpeaking}
                style={{
                  padding: '0.4rem 1rem',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, #00b894))',
                  color: 'white',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  justifyContent: 'center',
                }}
              >
                <VolumeX size={14} /> Speaking... tap to stop
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              background: 'white',
            }}>
              <button
                onClick={toggleListen}
                style={{
                  background: isListening ? 'var(--brand-secondary, #00b894)' : '#f0f0f0',
                  border: 'none',
                  color: isListening ? 'white' : '#666',
                  cursor: 'pointer',
                  padding: '0.6rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  flexShrink: 0,
                }}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? '🎤 Listening...' : 'Type in any language...'}
                style={{
                  flex: 1,
                  border: '1px solid #e0e0e0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: '#f8f9fa',
                  padding: '0.6rem 1rem',
                  borderRadius: '24px',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                style={{
                  background: input.trim() ? 'var(--brand-primary)' : '#e0e0e0',
                  border: 'none',
                  color: 'white',
                  cursor: input.trim() ? 'pointer' : 'default',
                  padding: '0.6rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,184,148,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(0,184,148,0); }
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background: #aaa;
          border-radius: 50%;
          display: inline-block;
          animation: dotBounce 1.2s infinite ease-in-out;
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
