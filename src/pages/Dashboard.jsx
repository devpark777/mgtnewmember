import React, { useState } from 'react';
import { TOPICS } from '../store/useStore';
import { formatDate } from '../utils/helpers';
import TopicBadge from '../components/TopicBadge';

// 기간 필터 라벨
const PERIODS = [
  { id: 'all',     label: '전체' },
  { id: 'year',    label: '올해' },
  { id: 'quarter', label: '이번 분기' },
  { id: 'month',   label: '이번 달' },
];

function getPeriodLabel(period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const q = Math.ceil(m / 3);
  if (period === 'year')    return `${y}년`;
  if (period === 'quarter') return `${y}년 ${q}분기`;
  if (period === 'month')   return `${y}년 ${m}월`;
  return '전체';
}

function isInPeriod(dateStr, period) {
  if (!dateStr || period === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const q = Math.floor(m / 3);
  if (period === 'year')    return d.getFullYear() === y;
  if (period === 'quarter') return d.getFullYear() === y && Math.floor(d.getMonth() / 3) === q;
  if (period === 'month')   return d.getFullYear() === y && d.getMonth() === m;
  return true;
}

export default function Dashboard({ members, teachers, schedules, graduates, onNavigate }) {
  const [period, setPeriod] = useState('year');

  const now = new Date();

  // 기간 필터된 교육생 (교회 등록일 기준)
  const filteredMembers = members.filter((m) =>
    isInPeriod(m.churchRegisteredAt || m.registeredAt, period)
  );
  // 기간 필터된 수료자 (수료일 기준)
  const filteredGraduates = graduates.filter((g) =>
    isInPeriod(g.graduationDate, period)
  );
  // 현재 교육 중인 인원은 항상 전체 기준 (현재 상태)
  const activeMembers = members.filter((m) => !m.isGraduated);
  // 기간 내 수료자 수
  const periodGraduateCount = filteredGraduates.length;

  const latestSchedule = [...schedules].sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))[0];

  const stats = [
    {
      label: `등록 교육생`,
      sub: getPeriodLabel(period),
      value: filteredMembers.length,
      icon: '👥', color: '#4F46E5', page: 'members',
    },
    {
      label: '현재 교육 중',
      sub: '전체 기준',
      value: activeMembers.length,
      icon: '📚', color: '#D97706', page: 'members',
    },
    {
      label: '수료자',
      sub: getPeriodLabel(period),
      value: periodGraduateCount,
      icon: '🎓', color: '#059669', page: 'graduates',
    },
    {
      label: '교사',
      sub: '전체',
      value: teachers.length,
      icon: '👨‍🏫', color: '#DC2626', page: 'teachers',
    },
  ];

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
          ⛪ 새신자 교육 관리
        </h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>
          {now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 기간 필터 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {PERIODS.map((p) => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
            borderColor: period === p.id ? '#4F46E5' : '#E5E7EB',
            background: period === p.id ? '#4F46E5' : '#fff',
            color: period === p.id ? '#fff' : '#6B7280',
            cursor: 'pointer', fontSize: 13, fontWeight: period === p.id ? 700 : 400,
            flexShrink: 0,
          }}>{p.label}</button>
        ))}
      </div>

      {/* 기간 안내 */}
      {period !== 'all' && (
        <div style={{ background: '#EEF2FF', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>
          📊 {getPeriodLabel(period)} 기준 통계
        </div>
      )}

      {/* 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {stats.map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.page)} style={{
            background: '#fff', border: '1px solid #f3f4f6',
            borderRadius: 14, padding: '14px 12px', textAlign: 'left',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* 현재 교육생 현황 */}
      {activeMembers.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📋 현재 교육생 현황 ({activeMembers.length}명)</h3>
            <button onClick={() => onNavigate('members')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>전체 보기 →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeMembers.map((m) => {
              const remaining = TOPICS.filter((t) => !m.completedTopics.includes(t.id));
              const nextTopic = remaining[0];
              const today = new Date().toISOString().split('T')[0];
              const notStarted = m.educationStartDate && m.educationStartDate > today;
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{m.gender === '여' ? '👩' : '👨'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                      {m.position && <span style={{ fontSize: 10, background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: 6 }}>{m.position}</span>}
                      {notStarted && <span style={{ fontSize: 10, background: '#FEF9C3', color: '#854D0E', padding: '1px 5px', borderRadius: 6 }}>대기중</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 4, alignItems: 'center' }}>
                      {TOPICS.map((t) => {
                        const done = m.completedTopics.includes(t.id);
                        return (
                          <div key={t.id} title={`${t.id}과: ${t.name}`} style={{
                            width: 16, height: 16, borderRadius: '50%',
                            background: done ? t.color : '#E5E7EB',
                            border: `2px solid ${done ? t.color : '#D1D5DB'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {done && <span style={{ color: '#fff', fontSize: 8, fontWeight: 900 }}>✓</span>}
                          </div>
                        );
                      })}
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>{m.completedTopics.length}/4</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {nextTopic && !notStarted ? (
                      <span style={{ fontSize: 11, background: nextTopic.color + '20', color: nextTopic.color, padding: '3px 7px', borderRadius: 10, fontWeight: 600 }}>
                        다음: {nextTopic.icon}{nextTopic.id}과
                      </span>
                    ) : notStarted ? (
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                        {m.educationStartDate?.replace(/-/g, '.')}~
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 과목별 이수 현황 */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>📊 과목별 이수 현황</h3>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '12px 0' }}>등록된 교육생이 없습니다</div>
        ) : (
          TOPICS.map((topic) => {
            const completed = members.filter((m) => m.completedTopics.includes(topic.id)).length;
            const pct = members.length > 0 ? Math.round((completed / members.length) * 100) : 0;
            return (
              <div key={topic.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{topic.icon} {topic.id}과: {topic.name}</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{completed}/{members.length}명</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 6, height: 7 }}>
                  <div style={{ width: `${pct}%`, background: topic.color, borderRadius: 6, height: 7, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 최근 일정 */}
      {latestSchedule ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📅 최근 교육 일정</h3>
            <button onClick={() => onNavigate('schedule')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>전체 보기 →</button>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
            {latestSchedule.weekLabel} · {latestSchedule.weekStart.replace(/-/g, '.')} (주일)
          </div>
          {(() => {
            const topicMap = {};
            latestSchedule.assignments.forEach((a) => {
              if (!topicMap[a.topicId]) topicMap[a.topicId] = { assignments: [], teacherId: a.teacherId };
              topicMap[a.topicId].assignments.push(a);
            });
            return Object.entries(topicMap).map(([topicId, group]) => {
              const topic = TOPICS.find((t) => t.id === parseInt(topicId));
              const teacher = teachers.find((t) => t.id === group.teacherId);
              const memberNames = group.assignments.map((a) => {
                const m = members.find((m) => m.id === a.memberId);
                return m?.name || '(삭제됨)';
              });
              const allDone = group.assignments.every((a) => a.completed);
              return (
                <div key={topicId} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                  marginBottom: 6, borderRadius: 8,
                  background: allDone ? '#F0FDF4' : '#F9FAFB',
                  border: `1px solid ${allDone ? '#BBF7D0' : '#E5E7EB'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{topic?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: topic?.color }}>{topic?.id}과: {topic?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                      교사: {teacher ? `${teacher.name}${teacher.position ? ' ' + teacher.position : ''}` : '미배정'} · {memberNames.join(', ')}
                    </div>
                  </div>
                  {allDone && <span style={{ fontSize: 14 }}>✅</span>}
                </div>
              );
            });
          })()}
        </div>
      ) : (
        <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>아직 생성된 일정이 없습니다</div>
          <button onClick={() => onNavigate('schedule')} style={{
            marginTop: 12, background: '#4F46E5', color: '#fff', border: 'none',
            borderRadius: 20, padding: '8px 20px', cursor: 'pointer', fontSize: 14,
          }}>일정 생성하기</button>
        </div>
      )}
    </div>
  );
}
