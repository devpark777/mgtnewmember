import React, { useState } from 'react';
import { TOPICS } from '../store/useStore';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import TopicBadge from '../components/TopicBadge';

// 이번 주 또는 다음 주 일요일 계산 (교육일)
function getNextSunday() {
  const d = new Date();
  const day = d.getDay(); // 0=일요일
  const diff = day === 0 ? 7 : 7 - day; // 오늘이 일요일이면 다음 주 일요일
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// 오늘을 기준으로 가장 가까운 주일 (일요일) 계산
// 오늘이 일요일이면 오늘, 월~수면 지난 주일, 목~토면 다음 주일
function getNearestSunday() {
  const d = new Date();
  const day = d.getDay(); // 0=일, 1=월 ... 6=토
  let diff = 0;
  if (day === 0) diff = 0;          // 오늘이 일요일
  else if (day <= 3) diff = -day;   // 월(1)~수(3) → 지난 일요일
  else diff = 7 - day;              // 목(4)~토(6) → 다음 일요일
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function MemberForm({ initial = {}, onSubmit, onClose }) {
  const nearestSunday = getNearestSunday();
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    gender: initial.gender || '남',
    position: initial.position || '성도',
    churchRegisteredAt: initial.churchRegisteredAt || nearestSunday,
    address: initial.address || '',
    note: initial.note || '',
    educationStartDate: initial.educationStartDate || getNextSunday(),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {[
        { label: '이름 *', key: 'name', type: 'text', required: true },
        { label: '연락처', key: 'phone', type: 'tel' },
        { label: '주소', key: 'address', type: 'text' },
      ].map(({ label, key, type, required }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label}</label>
          <input
            type={type} value={form[key]} onChange={(e) => set(key, e.target.value)}
            required={required}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }}
          />
        </div>
      ))}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>성별</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['남', '여'].map((g) => (
            <button key={g} type="button" onClick={() => set('gender', g)}
              style={{
                flex: 1, padding: '10px', border: '1px solid', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: form.gender === g ? 700 : 400,
                borderColor: form.gender === g ? '#4F46E5' : '#D1D5DB',
                background: form.gender === g ? '#EEF2FF' : '#fff',
                color: form.gender === g ? '#4F46E5' : '#374151',
              }}
            >{g}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>직분</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['성도', '집사', '권사', '장로', '전도사', '목사', '기타'].map((p) => (
            <button key={p} type="button" onClick={() => set('position', p)}
              style={{
                padding: '7px 14px', border: '1px solid', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                fontWeight: form.position === p ? 700 : 400,
                borderColor: form.position === p ? '#4F46E5' : '#D1D5DB',
                background: form.position === p ? '#EEF2FF' : '#fff',
                color: form.position === p ? '#4F46E5' : '#374151',
              }}
            >{p}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>교회 등록일</label>
        <input
          type="date" value={form.churchRegisteredAt}
          onChange={(e) => set('churchRegisteredAt', e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>
          교육 시작일 <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(이 날짜 주부터 자동 배치에 포함)</span>
        </label>
        <input
          type="date" value={form.educationStartDate}
          onChange={(e) => set('educationStartDate', e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }}
        />
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>기본값: 다음 주 일요일 (주일)</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>메모</label>
        <textarea value={form.note} onChange={(e) => set('note', e.target.value)}
          rows={2}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14, resize: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 15 }}>취소</button>
        <button type="submit" style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>저장</button>
      </div>
    </form>
  );
}

function ProgressDots({ completedTopics }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {TOPICS.map((t) => (
        <div key={t.id} style={{
          width: 14, height: 14, borderRadius: '50%',
          background: completedTopics.includes(t.id) ? t.color : '#E5E7EB',
          title: t.name,
        }} title={t.name} />
      ))}
    </div>
  );
}

export default function Members({ members, schedules = [], teachers = [], addMember, updateMember, deleteMember }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | graduated

  const filtered = members
    .filter((m) => {
      if (filter === 'active') return !m.isGraduated;
      if (filter === 'graduated') return m.isGraduated;
      return true;
    })
    .filter((m) => m.name.includes(search) || (m.phone || '').includes(search));

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>👥 교육생 관리</h2>
        <button onClick={() => setShowAdd(true)} style={{
          background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 20,
          padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>+ 새신자 등록</button>
      </div>

      <input
        placeholder="이름 또는 연락처 검색"
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['all', '전체'], ['active', '교육중'], ['graduated', '수료']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '6px 14px', borderRadius: 20, border: '1px solid',
            borderColor: filter === v ? '#4F46E5' : '#E5E7EB',
            background: filter === v ? '#4F46E5' : '#fff',
            color: filter === v ? '#fff' : '#6B7280',
            cursor: 'pointer', fontSize: 13, fontWeight: filter === v ? 700 : 400,
          }}>{l} {filter === v ? `(${filtered.length})` : ''}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
          <div>등록된 교육생이 없습니다</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => setViewMember(m)}
              style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                borderLeft: `4px solid ${m.isGraduated ? '#059669' : '#4F46E5'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>{m.gender}</span>
                  {m.position && <span style={{ marginLeft: 4, fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{m.position}</span>}
                  {m.isGraduated && <span style={{ marginLeft: 4, fontSize: 11, background: '#D1FAE5', color: '#059669', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>수료</span>}
                </div>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {m.churchRegisteredAt ? formatDate(m.churchRegisteredAt + 'T00:00:00') : formatDate(m.registeredAt)}
                </span>
              </div>
              {m.phone && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{m.phone}</div>}
              {m.educationStartDate && !m.isGraduated && (
                <div style={{ fontSize: 11, color: '#D97706', marginTop: 3 }}>
                  📅 교육 시작: {formatDate(m.educationStartDate + 'T00:00:00')}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <ProgressDots completedTopics={m.completedTopics} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>{m.completedTopics.length}/{TOPICS.length} 완료</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="새신자 등록" onClose={() => setShowAdd(false)}>
          <MemberForm onSubmit={(data) => { addMember(data); setShowAdd(false); }} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {editMember && (
        <Modal title="교육생 수정" onClose={() => setEditMember(null)}>
          <MemberForm initial={editMember} onSubmit={(data) => { updateMember(editMember.id, data); setEditMember(null); }} onClose={() => setEditMember(null)} />
        </Modal>
      )}

      {viewMember && (
        <Modal title="교육생 상세" onClose={() => setViewMember(null)}>
          <MemberDetail
            member={viewMember}
            schedules={schedules}
            teachers={teachers}
            onEdit={() => { setEditMember(viewMember); setViewMember(null); }}
            onDelete={() => { if (confirm(`${viewMember.name}님을 삭제하시겠습니까?`)) { deleteMember(viewMember.id); setViewMember(null); } }}
          />
        </Modal>
      )}
    </div>
  );
}

function MemberDetail({ member, schedules = [], teachers = [], onEdit, onDelete }) {
  // 이 교육생의 완료된 교육 이력 (날짜순)
  const history = schedules
    .flatMap((s) => s.assignments
      .filter((a) => a.memberId === member.id && a.completed)
      .map((a) => ({ ...a, weekStart: s.weekStart, weekLabel: s.weekLabel }))
    )
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: member.isGraduated ? '#D1FAE5' : '#EEF2FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 8px',
        }}>{member.gender === '여' ? '👩' : '👨'}</div>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>{member.name}</h3>
        {member.isGraduated && <span style={{ background: '#D1FAE5', color: '#059669', padding: '3px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🎓 수료 완료</span>}
      </div>

      <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        {[
          ['직분', member.position || '성도'],
          ['연락처', member.phone || '-'],
          ['성별', member.gender],
          ['주소', member.address || '-'],
          ['교회 등록일', member.churchRegisteredAt ? formatDate(member.churchRegisteredAt + 'T00:00:00') : '-'],
          ['시스템 등록', formatDate(member.registeredAt)],
          !member.isGraduated && member.educationStartDate && ['교육 시작일', formatDate(member.educationStartDate + 'T00:00:00') + ' (주일)'],
          member.isGraduated && ['수료일', formatDate(member.graduationDate)],
        ].filter(Boolean).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: 14 }}>
            <span style={{ color: '#6B7280', width: 70, flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
          </div>
        ))}
        {member.note && (
          <div style={{ display: 'flex', padding: '6px 0', fontSize: 14 }}>
            <span style={{ color: '#6B7280', width: 70, flexShrink: 0 }}>메모</span>
            <span>{member.note}</span>
          </div>
        )}
      </div>

      <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>교육 진행 현황</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {TOPICS.map((t) => {
          const done = member.completedTopics.includes(t.id);
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: done ? t.color + '15' : '#F9FAFB',
              border: `1px solid ${done ? t.color + '40' : '#E5E7EB'}`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: done ? t.color : '#374151' }}>
                {t.icon} {t.name}
              </span>
              <span style={{ fontSize: 18 }}>{done ? '✅' : '⬜'}</span>
            </div>
          );
        })}
      </div>

      {/* 교육 이력 */}
      <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>📜 교육 이력</h4>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>
          아직 완료된 교육이 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {history.map((h, i) => {
            const topic = TOPICS.find((t) => t.id === h.topicId);
            const teacher = teachers.find((t) => t.id === h.teacherId);
            return (
              <div key={h.id || i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0',
              }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{topic?.icon || '📚'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: topic?.color || '#374151' }}>{topic?.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {teacher ? `${teacher.name}${teacher.position ? ' ' + teacher.position : ''} 교사` : '교사 미상'}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>
                  {formatDate(h.weekStart + 'T00:00:00')}<br />
                  <span style={{ color: '#059669' }}>(주일)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDelete} style={{ flex: 1, padding: '12px', border: '1px solid #FCA5A5', borderRadius: 12, background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>삭제</button>
        <button onClick={onEdit} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>수정하기</button>
      </div>
    </div>
  );
}
