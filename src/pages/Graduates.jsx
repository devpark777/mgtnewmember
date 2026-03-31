import React, { useState } from 'react';
import { TOPICS } from '../store/useStore';
import { formatDate } from '../utils/helpers';
import TopicBadge from '../components/TopicBadge';

export default function Graduates({ graduates, members }) {
  const [search, setSearch] = useState('');

  const graduateMembers = graduates
    .map((g) => {
      const member = members.find((m) => m.id === g.memberId);
      return member ? { ...member, graduationDate: g.graduationDate } : null;
    })
    .filter(Boolean)
    .filter((m) => m.name.includes(search) || (m.phone || '').includes(search))
    .sort((a, b) => new Date(b.graduationDate) - new Date(a.graduationDate));

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>🎓 수료자 명단</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>4가지 교육 과정을 모두 이수한 교육생</p>
      </div>

      {/* 통계 */}
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', borderRadius: 16, padding: '20px', color: '#fff', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{graduates.length}</div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: 0.9 }}>총 수료자</div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 12, fontSize: 13 }}>
          <span>남 {graduateMembers.filter((m) => m.gender === '남').length}명</span>
          <span>·</span>
          <span>여 {graduateMembers.filter((m) => m.gender === '여').length}명</span>
        </div>
      </div>

      <input
        placeholder="이름 또는 연락처 검색"
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, marginBottom: 16 }}
      />

      {graduateMembers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
          <div>아직 수료자가 없습니다</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>4가지 교육 과정 완료 시 자동으로 등록됩니다</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {graduateMembers.map((m, idx) => (
            <div key={m.id} style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #059669',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#059669', flexShrink: 0,
                }}>
                  {graduateMembers.length - idx}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{m.gender}</span>
                  </div>
                  {m.phone && <div style={{ fontSize: 12, color: '#6B7280' }}>{m.phone}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>수료일</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>{formatDate(m.graduationDate)}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {TOPICS.map((t) => (
                  <TopicBadge key={t.id} topicId={t.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
