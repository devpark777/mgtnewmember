import React, { useState } from 'react';
import { TOPICS } from '../store/useStore';
import { getWeekLabel, getThisSunday, getWeekRangeLabel } from '../utils/helpers';
import Modal from '../components/Modal';
import TopicBadge from '../components/TopicBadge';

function CreateScheduleModal({ members, teachers, onConfirm, onClose }) {
  const today = new Date();
  const sunday = getThisSunday(today);
  const [weekStart, setWeekStart] = useState(sunday.toISOString().split('T')[0]);
  const [weekLabel, setWeekLabel] = useState(getWeekLabel(sunday));
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [step, setStep] = useState(1); // 1: 날짜선택, 2: 참석확인

  const handleWeekChange = (v) => {
    setWeekStart(v);
    setWeekLabel(getWeekLabel(new Date(v)));
    setCheckedIds(new Set());
  };

  const eligibleMembers = members.filter((m) => {
    if (m.isGraduated) return false;
    const startDate = m.educationStartDate || m.registeredAt?.split('T')[0];
    if (!startDate) return true;
    return startDate <= weekStart;
  });
  const waitingMembers = members.filter((m) => {
    if (m.isGraduated) return false;
    const startDate = m.educationStartDate || m.registeredAt?.split('T')[0];
    return startDate && startDate > weekStart;
  });

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (checkedIds.size === eligibleMembers.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(eligibleMembers.map((m) => m.id)));
    }
  };

  const canGenerate = teachers.length > 0 && checkedIds.size > 0;

  if (step === 1) return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>주일 날짜 선택</label>
        <input type="date" value={weekStart} onChange={(e) => handleWeekChange(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14, marginBottom: 8 }} />
        <input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)}
          placeholder="주차 라벨 (예: 2025년 13주차)"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }} />
      </div>
      {teachers.length === 0 && (
        <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '12px', marginBottom: 12, fontSize: 13, color: '#991B1B' }}>
          ⚠️ 등록된 교사가 없습니다.
        </div>
      )}
      {eligibleMembers.length === 0 && teachers.length > 0 && (
        <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '12px', marginBottom: 12, fontSize: 13, color: '#991B1B' }}>
          ⚠️ 이번 주 배치 가능한 교육생이 없습니다.
        </div>
      )}
      {waitingMembers.length > 0 && (
        <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400E' }}>
          ⏳ 교육 시작일 미도래 {waitingMembers.length}명 제외: {waitingMembers.map((m) => m.name).join(', ')}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 15 }}>취소</button>
        <button onClick={() => setStep(2)} disabled={teachers.length === 0 || eligibleMembers.length === 0}
          style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: (teachers.length === 0 || eligibleMembers.length === 0) ? '#D1D5DB' : '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
          다음: 참석예정자 확인 →
        </button>
      </div>
    </div>
  );

  // step 2: 참석 확인
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>📋 이번 주 참석예정자 확인</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{weekLabel} · {weekStart} (주일)</div>
        </div>
        <button onClick={toggleAll} style={{ fontSize: 12, padding: '5px 10px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
          {checkedIds.size === eligibleMembers.length ? '전체 해제' : '전체 선택'}
        </button>
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
        {eligibleMembers.map((m, i) => {
          const checked = checkedIds.has(m.id);
          const remaining = TOPICS.filter((t) => !m.completedTopics.includes(t.id));
          const nextTopic = remaining[0];
          return (
            <div key={m.id} onClick={() => toggleCheck(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                borderBottom: i < eligibleMembers.length - 1 ? '1px solid #F3F4F6' : 'none',
                background: checked ? '#EEF2FF' : '#fff', cursor: 'pointer',
              }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#4F46E5' : '#D1D5DB'}`,
                background: checked ? '#4F46E5' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {checked && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
                {m.position && <span style={{ fontSize: 11, color: '#4F46E5', marginLeft: 5 }}>{m.position}</span>}
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 5 }}>{m.completedTopics.length}/{TOPICS.length}회 완료</span>
              </div>
              {nextTopic && (
                <span style={{ fontSize: 11, background: nextTopic.color + '20', color: nextTopic.color, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                  {nextTopic.icon} {nextTopic.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 13, color: '#065F46' }}>
        참석예정자: <strong>{checkedIds.size}명</strong> / 대상 {eligibleMembers.length}명
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 14 }}>← 이전</button>
        <button onClick={() => onConfirm(weekLabel, weekStart, [...checkedIds])} disabled={!canGenerate}
          style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: canGenerate ? '#4F46E5' : '#D1D5DB', color: '#fff', cursor: canGenerate ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}>
          {checkedIds.size}명 자동 배치 생성
        </button>
      </div>
    </div>
  );
}

function EditAssignmentModal({ assignment, schedule, members, teachers, onSave, onRemove, onClose }) {
  const [teacherId, setTeacherId] = useState(assignment.teacherId);
  const [memberId, setMemberId] = useState(assignment.memberId);
  const [topicId, setTopicId] = useState(assignment.topicId);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교육생</label>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교사</label>
        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14 }}>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교육 주제</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TOPICS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTopicId(t.id)} style={{
              padding: '10px 14px', border: '1px solid', borderRadius: 10, cursor: 'pointer',
              borderColor: topicId === t.id ? t.color : '#E5E7EB',
              background: topicId === t.id ? t.color + '15' : '#fff',
              color: topicId === t.id ? t.color : '#374151',
              fontWeight: topicId === t.id ? 700 : 400, fontSize: 14, textAlign: 'left',
            }}>{t.icon} {t.name}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onRemove()} style={{ flex: 1, padding: '12px', border: '1px solid #FCA5A5', borderRadius: 12, background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 14 }}>삭제</button>
        <button onClick={() => onSave({ teacherId, memberId, topicId })} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>저장</button>
      </div>
    </div>
  );
}

function AddAssignmentModal({ schedule, members, teachers, onSave, onClose }) {
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [topicId, setTopicId] = useState(1);

  // 이미 이번 일정에 배정된 교육생 ID
  const scheduledMemberIds = new Set(schedule?.assignments?.map((a) => a.memberId) || []);
  // 이번 일정에서 교사별 담당 과목
  const teacherTopicMap = {};
  (schedule?.assignments || []).forEach((a) => {
    if (a.teacherId && !teacherTopicMap[a.teacherId]) {
      teacherTopicMap[a.teacherId] = a.topicId;
    }
  });

  const memberConflict = scheduledMemberIds.has(memberId);
  const teacherConflict = teacherTopicMap[teacherId] && teacherTopicMap[teacherId] !== topicId;
  const conflictTeacherTopic = teacherConflict ? TOPICS.find((t) => t.id === teacherTopicMap[teacherId]) : null;
  const canSave = !memberConflict && !teacherConflict;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교육생</label>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${memberConflict ? '#FCA5A5' : '#D1D5DB'}`, borderRadius: 10, fontSize: 14, background: memberConflict ? '#FEF2F2' : '#fff' }}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}{scheduledMemberIds.has(m.id) ? ' ⚠️ 이미 배정됨' : ''}</option>)}
        </select>
        {memberConflict && (
          <div style={{ marginTop: 5, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
            ⛔ 이 교육생은 이번 주일에 이미 교육이 배정되어 있습니다
          </div>
        )}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교사</label>
        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${teacherConflict ? '#FCA5A5' : '#D1D5DB'}`, borderRadius: 10, fontSize: 14, background: teacherConflict ? '#FEF2F2' : '#fff' }}>
          {teachers.map((t) => {
            const assignedTopicId = teacherTopicMap[t.id];
            const conflict = assignedTopicId && assignedTopicId !== topicId;
            const conflictTopic = conflict ? TOPICS.find((tp) => tp.id === assignedTopicId) : null;
            return <option key={t.id} value={t.id}>{t.name}{conflict ? ` ⚠️ ${conflictTopic?.id}과 담당중` : ''}</option>;
          })}
        </select>
        {teacherConflict && (
          <div style={{ marginTop: 5, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
            ⛔ 이 교사는 이번 주일에 이미 {conflictTeacherTopic?.icon}{conflictTeacherTopic?.id}과를 담당하고 있습니다
          </div>
        )}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>교육 주제</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TOPICS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTopicId(t.id)} style={{
              padding: '10px 14px', border: '1px solid', borderRadius: 10, cursor: 'pointer',
              borderColor: topicId === t.id ? t.color : '#E5E7EB',
              background: topicId === t.id ? t.color + '15' : '#fff',
              color: topicId === t.id ? t.color : '#374151',
              fontWeight: topicId === t.id ? 700 : 400, fontSize: 14, textAlign: 'left',
            }}>{t.icon} {t.id}과: {t.name}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 14 }}>취소</button>
        <button onClick={() => canSave && onSave({ teacherId, memberId, topicId })} disabled={!canSave}
          style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 12, background: canSave ? '#4F46E5' : '#D1D5DB', color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}>추가</button>
      </div>
    </div>
  );
}

// 로컬 날짜 기준으로 가장 가까운 일요일 구하기 (타임존 버그 방지)
function getNearestSunday() {
  const d = new Date();
  const day = d.getDay(); // 0=일, 1=월 ... 6=토
  const diff = day === 0 ? 0 : 7 - day; // 오늘이 일요일이면 0, 아니면 다음 일요일까지 남은 일수
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ── 참석예정자 패널 ──────────────────────────────────────
function AttendancePanel({ members, attendance, toggleAttendance, setAllAttendance, clearAttendance, onScheduleCreate }) {
  const [weekStart, setWeekStart] = useState(getNearestSunday());

  const eligible = members.filter((m) => {
    if (m.isGraduated) return false;
    const startDate = m.educationStartDate || m.registeredAt?.split('T')[0];
    return !startDate || startDate <= weekStart;
  });

  const confirmed = attendance[weekStart] || [];
  const confirmedSet = new Set(confirmed);
  const allChecked = eligible.length > 0 && eligible.every((m) => confirmedSet.has(m.id));

  const handleToggleAll = () => {
    if (allChecked) clearAttendance(weekStart);
    else setAllAttendance(weekStart, eligible.map((m) => m.id));
  };

  return (
    <div>
      {/* 주일 날짜 선택 */}
      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📅</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600, marginBottom: 4 }}>참석예정 주일</div>
          <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#1F2937', outline: 'none', width: '100%' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#4F46E5' }}>{confirmed.length}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>/ {eligible.length}명</div>
        </div>
      </div>

      {/* 전체 선택/해제 */}
      {eligible.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>교육 대상자 ({eligible.length}명)</span>
          <button onClick={handleToggleAll} style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #D1D5DB', borderRadius: 20, background: '#fff', cursor: 'pointer' }}>
            {allChecked ? '전체 해제' : '전체 선택'}
          </button>
        </div>
      )}

      {eligible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: 13 }}>
          이 주일에 해당하는 교육 대상자가 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {eligible.map((m) => {
            const isConfirmed = confirmedSet.has(m.id);
            const remaining = TOPICS.filter((t) => !m.completedTopics.includes(t.id));
            const nextTopic = remaining[0];
            return (
              <div key={m.id} onClick={() => toggleAttendance(weekStart, m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  background: isConfirmed ? '#F0FDF4' : '#fff',
                  border: `1.5px solid ${isConfirmed ? '#6EE7B7' : '#E5E7EB'}`,
                  transition: 'all 0.15s',
                }}>
                {/* 체크박스 */}
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  border: `2px solid ${isConfirmed ? '#059669' : '#D1D5DB'}`,
                  background: isConfirmed ? '#059669' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isConfirmed && <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
                    {m.position && <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '1px 6px', borderRadius: 8 }}>{m.position}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {m.completedTopics.length}/4과목 완료
                    {nextTopic && <span style={{ marginLeft: 6, color: nextTopic.color }}>다음: {nextTopic.icon}{nextTopic.id}과</span>}
                  </div>
                  {/* 완료된 과목 표시 */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                    {TOPICS.map((t) => (
                      <div key={t.id} style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: m.completedTopics.includes(t.id) ? t.color : '#E5E7EB',
                      }} title={t.name} />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isConfirmed ? '#059669' : '#D1D5DB' }}>
                  {isConfirmed ? '참석' : '미확인'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 배치 생성 버튼 */}
      {confirmed.length > 0 && (
        <button
          onClick={() => onScheduleCreate(weekStart, confirmed)}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: 14,
            background: '#4F46E5', color: '#fff', cursor: 'pointer',
            fontSize: 15, fontWeight: 700,
          }}>
          ✅ 참석예정자 {confirmed.length}명으로 배치 생성
        </button>
      )}
    </div>
  );
}

// ── 교사 변경 모달 ──────────────────────────────────────
function ChangeTeacherModal({ teachers, currentTeacherId, topicName, topicId, schedule, onSelect, onClose }) {
  // 이번 일정에서 교사별로 담당 과목 파악 (다른 과목 배정 여부 확인)
  const teacherTopicMap = {}; // { teacherId: topicId }
  if (schedule) {
    schedule.assignments.forEach((a) => {
      if (a.teacherId && !teacherTopicMap[a.teacherId]) {
        teacherTopicMap[a.teacherId] = a.topicId;
      }
    });
  }

  return (
    <div>
      <div style={{ background: '#FFF9EC', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400E' }}>
        📌 선택한 교사가 <strong>{topicName}</strong> 수강 교육생 전원에게 적용됩니다
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {teachers.map((t) => {
          const isCurrent = t.id === currentTeacherId;
          const assignedTopicId = teacherTopicMap[t.id];
          // 현재 과목이 아닌 다른 과목에 이미 배정됨 → 불가
          const isConflict = assignedTopicId && assignedTopicId !== topicId && !isCurrent;
          const conflictTopic = isConflict ? TOPICS.find((tp) => tp.id === assignedTopicId) : null;

          return (
            <button
              key={t.id}
              onClick={() => !isConflict && onSelect(t.id)}
              disabled={isConflict}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                border: `1.5px solid ${isCurrent ? '#4F46E5' : isConflict ? '#FECACA' : '#E5E7EB'}`,
                borderRadius: 12,
                background: isCurrent ? '#EEF2FF' : isConflict ? '#FEF2F2' : '#fff',
                cursor: isConflict ? 'not-allowed' : 'pointer',
                textAlign: 'left', opacity: isConflict ? 0.7 : 1,
              }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{t.gender === '여' ? '👩‍🏫' : '👨‍🏫'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: isCurrent ? '#4F46E5' : isConflict ? '#991B1B' : '#1F2937' }}>{t.name}</span>
                  {t.position && <span style={{ fontSize: 11, background: isCurrent ? '#4F46E5' : '#F3F4F6', color: isCurrent ? '#fff' : '#6B7280', padding: '1px 7px', borderRadius: 8 }}>{t.position}</span>}
                  {isCurrent && <span style={{ fontSize: 10, color: '#4F46E5', fontWeight: 700 }}>✓ 현재</span>}
                </div>
                {isConflict && (
                  <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>
                    ⛔ 이번 주 {conflictTopic?.icon}{conflictTopic?.id}과 담당 중 (중복 배정 불가)
                  </div>
                )}
                {t.phone && !isConflict && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{t.phone}</div>}
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={onClose} style={{
        width: '100%', marginTop: 14, padding: '12px', border: '1px solid #E5E7EB',
        borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#6B7280',
      }}>취소</button>
    </div>
  );
}

// ── 주간 일정 패널 ──────────────────────────────────────
function SchedulePanel({ schedules, members, teachers, autoSchedule, markAssignmentDone, undoAssignment, deleteSchedule, updateAssignment, addAssignment, removeAssignment }) {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedScheduleForAdd, setSelectedScheduleForAdd] = useState(null);
  const [changeTeacher, setChangeTeacher] = useState(null); // { scheduleId, topicId, topicName, assignmentIds, currentTeacherId }

  const sorted = [...schedules].sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

  const handleCreate = (weekLabel, weekStart, selectedIds) => {
    autoSchedule(weekLabel, weekStart, selectedIds);
    setShowCreate(false);
  };

  const completionRate = (s) => {
    const total = s.assignments.length;
    if (!total) return 0;
    return Math.round((s.assignments.filter((a) => a.completed).length / total) * 100);
  };

  // 과목별 그룹 만들기
  const getTopicGroups = (schedule) => {
    const topicMap = {};
    schedule.assignments.forEach((a) => {
      if (!topicMap[a.topicId]) topicMap[a.topicId] = { teacherId: a.teacherId, assignments: [] };
      topicMap[a.topicId].assignments.push(a);
    });
    return Object.entries(topicMap).sort(([a], [b]) => parseInt(a) - parseInt(b));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>총 {sorted.length}개 일정</span>
        <button onClick={() => setShowCreate(true)} style={{
          background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 20,
          padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>+ 수동 생성</button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 13 }}>생성된 일정이 없습니다</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>참석예정자 탭에서 배치를 생성해보세요</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((schedule) => {
            const rate = completionRate(schedule);
            const isExpanded = expandedId === schedule.id;
            const topicGroups = getTopicGroups(schedule);

            return (
              <div key={schedule.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* 일정 헤더 */}
                <div onClick={() => setExpandedId(isExpanded ? null : schedule.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{schedule.weekLabel}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      📅 {schedule.weekStart.replace(/-/g, '.')} (주일) · {schedule.assignments.length}명
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {topicGroups.map(([topicId, group]) => {
                        const topic = TOPICS.find((t) => t.id === parseInt(topicId));
                        const teacher = teachers.find((t) => t.id === group.teacherId);
                        const teacherName = teacher ? teacher.name : '교사미배정';
                        return (
                          <div key={topicId} style={{
                            display: 'flex', flexDirection: 'column',
                            background: topic?.color + '12',
                            border: `1px solid ${topic?.color}40`,
                            borderRadius: 8, padding: '4px 8px',
                          }}>
                            <span style={{ fontSize: 11, color: topic?.color, fontWeight: 700 }}>
                              {topic?.icon} {topic?.id}과 · {group.assignments.length}명
                            </span>
                            <span style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }}>
                              👨‍🏫 {teacherName}{teacher?.position ? ` ${teacher.position}` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: rate === 100 ? '#059669' : '#4F46E5' }}>{rate}%</div>
                    <div style={{ width: 44, height: 5, background: '#F3F4F6', borderRadius: 4 }}>
                      <div style={{ width: `${rate}%`, background: rate === 100 ? '#059669' : '#4F46E5', height: 5, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 14, color: '#9CA3AF' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 펼쳐진 내용 - 과목별 그룹 */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 14px 14px' }}>
                    {/* 관리 버튼 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 12 }}>
                      <button onClick={() => { setSelectedScheduleForAdd(schedule); setShowAddAssignment(true); }}
                        style={{ background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>+ 배정 추가</button>
                      <button onClick={() => { if (window.confirm('이 일정을 삭제하시겠습니까?')) { deleteSchedule(schedule.id); setExpandedId(null); } }}
                        style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>🗑 일정 삭제</button>
                    </div>

                    {/* 과목별 그룹 표시 */}
                    {topicGroups.map(([topicId, group]) => {
                      const topic = TOPICS.find((t) => t.id === parseInt(topicId));
                      const teacher = teachers.find((t) => t.id === group.teacherId);
                      const allDone = group.assignments.every((a) => a.completed);

                      return (
                        <div key={topicId} style={{
                          marginBottom: 10, borderRadius: 12, overflow: 'hidden',
                          border: `1.5px solid ${allDone ? '#BBF7D0' : topic?.color + '40'}`,
                        }}>
                          {/* 과목 헤더 */}
                          <div style={{
                            padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8,
                            background: allDone ? '#F0FDF4' : topic?.color + '10',
                          }}>
                            <span style={{ fontSize: 18 }}>{topic?.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: topic?.color }}>{topic?.id}과: {topic?.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                  👨‍🏫 {teacher ? `${teacher.name}${teacher.position ? ' ' + teacher.position : ''}` : '⚠️ 미배정'}
                                </span>
                                {!allDone && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setChangeTeacher({
                                        scheduleId: schedule.id,
                                        topicId,
                                        topicName: `${topic?.id}과: ${topic?.name}`,
                                        assignmentIds: group.assignments.map((a) => a.id),
                                        currentTeacherId: group.teacherId,
                                      });
                                    }}
                                    style={{
                                      background: '#fff', border: '1px solid #D1D5DB',
                                      borderRadius: 6, padding: '2px 7px', cursor: 'pointer',
                                      fontSize: 10, color: '#4F46E5', fontWeight: 700,
                                    }}>변경</button>
                                )}
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>
                              {group.assignments.filter((a) => a.completed).length}/{group.assignments.length}명
                            </span>
                          </div>

                          {/* 교육생 목록 */}
                          {group.assignments.map((a) => {
                            const member = members.find((m) => m.id === a.memberId);
                            return (
                              <div key={a.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 12px', background: a.completed ? '#F0FDF4' : '#fff',
                                borderTop: '1px solid #F3F4F6',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 14 }}>{member?.gender === '여' ? '👩' : '👨'}</span>
                                  <div>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{member?.name || '(삭제됨)'}</span>
                                    {member?.position && <span style={{ fontSize: 10, background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: 6, marginLeft: 4 }}>{member.position}</span>}
                                    {member && <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }}>{member.completedTopics.length}/4 완료</span>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  <button onClick={() => { setEditAssignment({ assignment: a, scheduleId: schedule.id }); }}
                                    style={{ background: '#F3F4F6', border: 'none', borderRadius: 7, padding: '4px 7px', cursor: 'pointer', fontSize: 11 }}>✏️</button>
                                  <button onClick={() => a.completed ? undoAssignment(schedule.id, a.id) : markAssignmentDone(schedule.id, a.id)}
                                    style={{
                                      background: a.completed ? '#D1FAE5' : '#EEF2FF',
                                      color: a.completed ? '#059669' : '#4F46E5',
                                      border: 'none', borderRadius: 7, padding: '4px 9px',
                                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                    }}>
                                    {a.completed ? '✅완료' : '완료'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal title="주간 일정 수동 배치" onClose={() => setShowCreate(false)}>
          <CreateScheduleModal members={members} teachers={teachers} onConfirm={handleCreate} onClose={() => setShowCreate(false)} />
        </Modal>
      )}
      {editAssignment && (
        <Modal title="배정 수정" onClose={() => setEditAssignment(null)}>
          <EditAssignmentModal
            assignment={editAssignment.assignment}
            schedule={schedules.find((s) => s.id === editAssignment.scheduleId)}
            members={members} teachers={teachers}
            onSave={(changes) => { updateAssignment(editAssignment.scheduleId, editAssignment.assignment.id, changes); setEditAssignment(null); }}
            onRemove={() => { removeAssignment(editAssignment.scheduleId, editAssignment.assignment.id); setEditAssignment(null); }}
            onClose={() => setEditAssignment(null)}
          />
        </Modal>
      )}
      {showAddAssignment && selectedScheduleForAdd && (
        <Modal title="배정 추가" onClose={() => setShowAddAssignment(false)}>
          <AddAssignmentModal
            schedule={selectedScheduleForAdd} members={members} teachers={teachers}
            onSave={(data) => { addAssignment(selectedScheduleForAdd.id, data); setShowAddAssignment(false); }}
            onClose={() => setShowAddAssignment(false)}
          />
        </Modal>
      )}
      {changeTeacher && (
        <Modal title={`교사 배정 변경`} onClose={() => setChangeTeacher(null)}>
          <ChangeTeacherModal
            teachers={teachers}
            currentTeacherId={changeTeacher.currentTeacherId}
            topicName={changeTeacher.topicName}
            topicId={parseInt(changeTeacher.topicId)}
            schedule={schedules.find((s) => s.id === changeTeacher.scheduleId)}
            onSelect={(teacherId) => {
              changeTeacher.assignmentIds.forEach((assignmentId) => {
                updateAssignment(changeTeacher.scheduleId, assignmentId, { teacherId });
              });
              setChangeTeacher(null);
            }}
            onClose={() => setChangeTeacher(null)}
          />
        </Modal>
      )}
    </div>
  );
}

export default function Schedule({ schedules, members, teachers, attendance, autoSchedule, markAssignmentDone, undoAssignment, deleteSchedule, updateAssignment, addAssignment, removeAssignment, toggleAttendance, setAllAttendance, clearAttendance }) {
  const [activeTab, setActiveTab] = useState('attendance');

  const handleScheduleFromAttendance = (weekStart, confirmedIds) => {
    const weekLabel = getWeekLabel(new Date(weekStart));
    autoSchedule(weekLabel, weekStart, confirmedIds);
    setActiveTab('schedules');
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>📅 교육 일정 관리</h2>

      {/* 탭 */}
      <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {[['attendance', '✋ 참석예정자'], ['schedules', '📋 주간 일정']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: '9px', border: 'none', borderRadius: 9, cursor: 'pointer',
            background: activeTab === id ? '#fff' : 'transparent',
            fontWeight: activeTab === id ? 700 : 400,
            color: activeTab === id ? '#1F2937' : '#6B7280',
            fontSize: 14,
            boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'attendance' ? (
        <AttendancePanel
          members={members} attendance={attendance}
          toggleAttendance={toggleAttendance}
          setAllAttendance={setAllAttendance}
          clearAttendance={clearAttendance}
          onScheduleCreate={handleScheduleFromAttendance}
        />
      ) : (
        <SchedulePanel
          schedules={schedules} members={members} teachers={teachers}
          autoSchedule={autoSchedule} markAssignmentDone={markAssignmentDone}
          undoAssignment={undoAssignment} deleteSchedule={deleteSchedule}
          updateAssignment={updateAssignment} addAssignment={addAssignment}
          removeAssignment={removeAssignment}
        />
      )}
    </div>
  );
}
