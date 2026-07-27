import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { useVoice } from '../../hooks/useVoice';
import { generateChatResponse } from '../../services/api';

const CHIPS = [
  '🔍 What are the top 3 business insights?',
  '⚠️ Are there anomalies or outliers?',
  '📊 Which chart best represents this data?',
  '💡 What actions should the business take?',
  '📉 What are the key risks in this dataset?',
];

function MarkdownMsg({ text }) {
  const html = text
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<strong>$1</strong>')
    .replace(/^# (.+)$/gm, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '• $1<br/>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ChatPanel() {
  const { active } = useData();
  const [messages, setMessages] = useState([
    { role: 'ai', content: "👋 Hello! I'm **NexusViz AI**. Upload a dataset and ask me anything about your data — insights, trends, anomalies, chart recommendations, or business actions!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, supported } = useVoice();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  async function sendMessage(text) {
    const question = (text || input).trim();
    if (!question || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
      const result = await generateChatResponse(
        active?.fileName || 'Dataset',
        active?.profile || {},
        '',
        question,
        history
      );
      const aiMsg = { role: 'ai', content: result.text };
      setMessages((prev) => [...prev, aiMsg]);
      speak(result.text.replace(/\*\*(.*?)\*\*/g, '$1').substring(0, 200));
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'ai', content: `❌ Error: ${e.message}. Please check the backend connection.` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="section-enter" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <div className="section-title">💬 Conversational Data Chat</div>
          <div className="section-subtitle">Ask anything about your dataset in plain English</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isSpeaking && <button className="btn btn-ghost btn-sm" onClick={() => window.speechSynthesis?.cancel()}>🔇 Stop</button>}
          <button className="btn btn-danger btn-sm" onClick={() => setMessages([messages[0]])}>🗑 Clear</button>
        </div>
      </div>

      {/* Quick Chips */}
      <div className="prompt-chips" style={{ marginBottom: '1rem' }}>
        {CHIPS.map((chip) => (
          <button key={chip} className="chip" onClick={() => sendMessage(chip)}>{chip}</button>
        ))}
      </div>

      {/* Messages */}
      <div className="ai-panel">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === 'user' ? '' : ''}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className={`chat-bubble ${msg.role === 'user' ? 'user' : ''}`}>
                <MarkdownMsg text={msg.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message">
              <div className="chat-avatar ai">🤖</div>
              <div className="chat-bubble">
                <div className="loading-dots">
                  <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-row">
          {supported && (
            <div style={{ position: 'relative' }}>
              <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={() => isListening ? stopListening() : startListening()}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <><div className="voice-ring" style={{ position: 'absolute', inset: -4 }} />🎙</>
                ) : '🎙'}
              </button>
            </div>
          )}
          <textarea
            className="textarea"
            placeholder="Ask about your data… (Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="btn btn-primary btn-sm" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            {loading ? <div className="spinner" /> : '↑ Send'}
          </button>
        </div>
      </div>

      {!active && (
        <div className="badge badge-info" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          ℹ Upload a dataset to enable context-aware AI chat responses.
        </div>
      )}
    </div>
  );
}
