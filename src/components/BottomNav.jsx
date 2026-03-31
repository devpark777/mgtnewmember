import React from 'react';

const tabs = [
  { id: 'dashboard', label: '홈', icon: '🏠' },
  { id: 'members', label: '교육생', icon: '👥' },
  { id: 'schedule', label: '일정', icon: '📅' },
  { id: 'teachers', label: '교사', icon: '👨‍🏫' },
  { id: 'graduates', label: '수료자', icon: '🎓' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #e5e7eb',
      display: 'flex', zIndex: 100,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      maxWidth: 480, margin: '0 auto',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1, padding: '8px 0 10px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}
        >
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: active === tab.id ? 700 : 400,
            color: active === tab.id ? '#4F46E5' : '#9CA3AF',
          }}>{tab.label}</span>
          {active === tab.id && (
            <div style={{
              position: 'absolute', bottom: 0,
              width: 32, height: 3, background: '#4F46E5', borderRadius: 2,
            }} />
          )}
        </button>
      ))}
    </nav>
  );
}
