import React, { useState } from 'react';
import Modal from '../components/Modal';
import { formatDate } from '../utils/helpers';
import { TOPICS } from '../store/useStore';

function TeacherForm({ initial = {}, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    gender: initial.gender || '남',
    position: initial.position || '집사',
    note: initial.note || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {[
        { label: '이름 *', key: 'name', type: 'text', required: true },
        { label: '연락처', key: 'phone', type: 'tel' },
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
          {['집사', '권사', '장로', '전도사', '목사', '성도', '청년', '기타'].map((p) => (
            <button key={p} type="button" onClick={() => set('position', p)}
              style={{
                padding: '7px 14px', border: '1px solid', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                fontWeight: form.position === p ? 700 : 400,
                borderColor: form.position === p ? '#DC2626' : '#D1D5DB',
                background: form.position === p ? '#FEF2F2' : '#fff',
                color: form.position === p ? '#DC2626' : '#374151',
              }}
            >{p}</button>
          ))}
        </div>
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

export default function Teachers({ teachers, addTeacher, updateTeacher, deleteTeacher, schedules, members = [] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [historyTeacher, setHistoryTeacher] = useState(null);

  // 각 교사별 교육 횟수
  const countMap = {};
  schedules.forEach((s) => s.assignments.forEach((a) => {
    if (a.completed) countMap[a.teacherId] = (countMap[a.teacherId] || 0) + 1;
  }));

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>👨‍🏫 교사 관리</h2>
        <button onClick={() => setShowAdd(true)} style={{
          background: '#DC2626', color: '#fff', border: 'none', borderRadius: 20,
          padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>+ 교사 등록</button>
      </div>

      {teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍🏫</div>
          <div>등록된 교사가 없습니다</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>교사를 먼저 등록해 주세요</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teachers.map((t) => (
            <div key={t.id} style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: '4px solid #DC2626',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {t.gender === '여' ? '👩‍🏫' : '👨‍🏫'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</span>
                      {t.position && <span style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{t.position}</span>}
                    </div>
                    {t.phone && <div style={{ fontSize: 12, color: '#6B7280' }}>{t.phone}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#DC2626' }}>{countMap[t.id] || 0}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>교육 완료</div>
                </div>
              </div>
              {t.note && <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280', background: '#F9FAFB', borderRadius: 8, padding: '6px 10px' }}>{t.note}</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={() => setHistoryTeacher(t)} style={{
                  flex: 1, padding: '7px', border: '1px solid #D97706', borderRadius: 8,
                  background: '#FFFBEB', color: '#D97706', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>📜 이력</button>
                <button onClick={() => setEditTeacher(t)} style={{
                  flex: 1, padding: '7px', border: '1px solid #E5E7EB', borderRadius: 8,
                  background: '#fff', cursor: 'pointer', fontSize: 13,
                }}>수정</button>
                <button onClick={() => { if (confirm(`${t.name} 교사를 삭제하시겠습니까?`)) deleteTeacher(t.id); }} style={{
                  flex: 1, padding: '7px', border: '1px solid #FCA5A5', borderRadius: 8,
                  background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 13,
                }}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="교사 등록" onClose={() => setShowAdd(false)}>
          <TeacherForm onSubmit={(data) => { addTeacher(data); setShowAdd(false); }} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editTeacher && (
        <Modal title="교사 수정" onClose={() => setEditTeacher(null)}>
          <TeacherForm initial={editTeacher} onSubmit={(data) => { updateTeacher(editTeacher.id, data); setEditTeacher(null); }} onClose={() => setEditTeacher(null)} />
        </Modal>
      )}
      {historyTeacher && (
        <Modal title={`${historyTeacher.name} 교사 교육 이력`} onClose={() => setHistoryTeacher(null)}>
          <TeacherHistory teacher={historyTeacher} schedules={schedules} members={members} />
        </Modal>
      )}
    </div>
  );
}

function TeacherHistory({ teacher, schedules, members }) {
  const history = schedules
    .flatMap((s) => s.assignments
      .filter((a) => a.teacherId === teacher.id && a.completed)
      .map((a) => ({ ...a, weekStart: s.weekStart, weekLabel: s.weekLabel }))
    )
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px', background: '#FEF2F2', borderRadius: 12 }}>
        <div style={{ fontSize: 32 }}>{teacher.gender === '여' ? '👩‍🏫' : '👨‍🏫'}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{teacher.name}</div>
          <div style={{ fontSize: 13, color: '#DC2626' }}>{teacher.position || ''} · 총 {history.length}회 교육</div>
        </div>
      </div>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: 14 }}>
          아직 완료된 교육이 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((h, i) => {
            const topic = TOPICS.find((t) => t.id === h.topicId);
            const member = members.find((m) => m.id === h.memberId);
            return (
              <div key={h.id || i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: '#FFF7ED', borderRadius: 10, border: '1px solid #FDE68A',
              }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{topic?.icon || '📚'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {member ? member.name : '(삭제됨)'}
                    {member?.position && <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>{member.position}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: topic?.color || '#D97706', marginTop: 1 }}>{topic?.name}</div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>
                  {formatDate(h.weekStart + 'T00:00:00')}<br />
                  <span style={{ color: '#D97706' }}>(주일)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
