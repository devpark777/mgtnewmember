import { useState, useCallback } from 'react';

// 4가지 교육 주제
export const TOPICS = [
  { id: 1, name: '행복한 삶으로의 초대', color: '#4F46E5', icon: '😊' },
  { id: 2, name: '예수님, 구원과 축복의 근원', color: '#059669', icon: '✝️' },
  { id: 3, name: '믿음으로 누리는 풍성한 삶', color: '#D97706', icon: '🌿' },
  { id: 4, name: '자라나는 믿음, 더 풍성한 축복', color: '#DC2626', icon: '🌱' },
];

const STORAGE_KEY = 'church_edu_app';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    members: [],
    teachers: [],
    schedules: [], // { id, weekLabel, weekStart, assignments: [{id, teacherId, memberId, topicId, completed}] }
    graduates: [],
    attendance: {}, // { 'YYYY-MM-DD': ['memberId', ...] }
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let storeInstance = null;

export function useStore() {
  const [data, setData] = useState(() => loadData());

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ── 멤버 ──────────────────────────────────────────────
  const addMember = (member) => {
    // educationStartDate 기본값: 다음 주 일요일 (교육은 매주 주일 실시)
    const defaultStart = (() => {
      const d = new Date();
      const day = d.getDay(); // 0=일
      const diff = day === 0 ? 7 : 7 - day; // 오늘 일요일이면 다음 주 일요일
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })();

    update((d) => ({
      ...d,
      members: [
        ...d.members,
        {
          id: Date.now().toString(),
          completedTopics: [],
          isGraduated: false,
          graduationDate: null,
          registeredAt: new Date().toISOString(),
          educationStartDate: defaultStart, // 교육 시작일
          ...member,
        },
      ],
    }));
  };

  const updateMember = (id, changes) => {
    update((d) => ({
      ...d,
      members: d.members.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    }));
  };

  const deleteMember = (id) => {
    update((d) => ({
      ...d,
      members: d.members.filter((m) => m.id !== id),
    }));
  };

  // ── 교사 ──────────────────────────────────────────────
  const addTeacher = (teacher) => {
    update((d) => ({
      ...d,
      teachers: [
        ...d.teachers,
        { id: Date.now().toString(), ...teacher },
      ],
    }));
  };

  const updateTeacher = (id, changes) => {
    update((d) => ({
      ...d,
      teachers: d.teachers.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    }));
  };

  const deleteTeacher = (id) => {
    update((d) => ({
      ...d,
      teachers: d.teachers.filter((t) => t.id !== id),
    }));
  };

  // ── 일정 ──────────────────────────────────────────────
  // selectedMemberIds: 관리자가 이번 주 참석 확인한 교육생 ID 목록
  // selectedTopicIds: 이번 주 교육할 과목 ID 목록 (순서 무관)
  const autoSchedule = (weekLabel, weekStart, selectedMemberIds, selectedTopicIds) => {
    update((d) => {
      const teachers = d.teachers;
      if (teachers.length === 0) return d;

      // 이번 주에 교육 시작일이 된 미수료 멤버
      const eligibleMembers = d.members.filter((m) => {
        if (m.isGraduated) return false;
        const startDate = m.educationStartDate || m.registeredAt?.split('T')[0];
        if (!startDate) return true;
        return startDate <= weekStart;
      });

      // 참석 확인된 멤버만 필터
      const attendingMembers = selectedMemberIds && selectedMemberIds.length > 0
        ? eligibleMembers.filter((m) => selectedMemberIds.includes(m.id))
        : eligibleMembers;

      if (attendingMembers.length === 0) return d;

      // 이번 weekStart에 이미 배정된 멤버 ID 수집 (중복 방지)
      const alreadyScheduledIds = new Set(
        d.schedules
          .filter((s) => s.weekStart === weekStart)
          .flatMap((s) => s.assignments.map((a) => a.memberId))
      );

      const toSchedule = attendingMembers.filter((m) => !alreadyScheduledIds.has(m.id));
      if (toSchedule.length === 0) return d;

      // Step 1: 각 교육생의 과목 결정
      // selectedTopicIds가 있으면 → 이번 주 교육 과목 중 미이수 과목 우선 배정 (순서 무관)
      // selectedTopicIds가 없으면 → 미이수 중 가장 낮은 번호 (기존 방식)
      const availableTopicIds = selectedTopicIds && selectedTopicIds.length > 0
        ? new Set(selectedTopicIds)
        : null;

      const memberTopicPairs = [];
      toSchedule.forEach((member) => {
        const remaining = TOPICS.filter((t) => !member.completedTopics.includes(t.id));
        if (remaining.length === 0) return;

        // 이번 주 가르칠 과목 중 미이수 과목 찾기
        const matchedTopic = availableTopicIds
          ? remaining.find((t) => availableTopicIds.has(t.id))
          : remaining[0];

        if (!matchedTopic) return; // 이번 주 가르칠 과목 중 필요한 과목 없음
        memberTopicPairs.push({ memberId: member.id, topicId: matchedTopic.id });
      });

      if (memberTopicPairs.length === 0) return d;

      // Step 2: 과목별로 교육생 그룹화
      // 예: { 1: ['memberA'], 2: ['memberB', 'memberC'] }
      const topicGroups = {};
      memberTopicPairs.forEach(({ memberId, topicId }) => {
        if (!topicGroups[topicId]) topicGroups[topicId] = [];
        topicGroups[topicId].push(memberId);
      });

      // Step 3: 과목 그룹별로 교사 1명 랜덤 배정
      // 규칙: 같은 주일 교사는 하나의 과목만 담당 (중복 배정 불가)
      const shuffledTeachers = [...teachers].sort(() => Math.random() - 0.5);
      const usedTeacherIds = new Set(); // 이번 주에 이미 배정된 교사 추적
      const assignments = [];

      Object.entries(topicGroups).forEach(([topicId, memberIds]) => {
        // 아직 배정되지 않은 교사 중 선택
        const availableTeacher = shuffledTeachers.find(t => !usedTeacherIds.has(t.id));
        if (availableTeacher) {
          usedTeacherIds.add(availableTeacher.id);
        }
        memberIds.forEach((memberId) => {
          assignments.push({
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            teacherId: availableTeacher?.id || null, // 교사 부족 시 null
            memberId,
            topicId: parseInt(topicId),
            completed: false,
          });
        });
      });

      if (assignments.length === 0) return d;

      const newSchedule = {
        id: Date.now().toString(),
        weekLabel,
        weekStart,
        assignments,
      };

      return { ...d, schedules: [...d.schedules, newSchedule] };
    });
  };

  const markAssignmentDone = (scheduleId, assignmentId) => {
    update((d) => {
      const schedule = d.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return d;

      const assignment = schedule.assignments.find((a) => a.id === assignmentId);
      if (!assignment) return d;

      // 배정 완료 처리
      const updatedSchedules = d.schedules.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              assignments: s.assignments.map((a) =>
                a.id === assignmentId ? { ...a, completed: true } : a
              ),
            }
          : s
      );

      // 멤버 completedTopics 업데이트
      let updatedMembers = d.members.map((m) => {
        if (m.id !== assignment.memberId) return m;
        const already = m.completedTopics.includes(assignment.topicId);
        if (already) return m;
        const newCompleted = [...m.completedTopics, assignment.topicId];
        return { ...m, completedTopics: newCompleted };
      });

      // 수료 체크
      let updatedGraduates = [...d.graduates];
      updatedMembers = updatedMembers.map((m) => {
        if (!m.isGraduated && m.completedTopics.length >= TOPICS.length) {
          const graduationDate = new Date().toISOString();
          if (!updatedGraduates.find((g) => g.memberId === m.id)) {
            updatedGraduates.push({ memberId: m.id, graduationDate });
          }
          return { ...m, isGraduated: true, graduationDate };
        }
        return m;
      });

      return {
        ...d,
        schedules: updatedSchedules,
        members: updatedMembers,
        graduates: updatedGraduates,
      };
    });
  };

  const undoAssignment = (scheduleId, assignmentId) => {
    update((d) => {
      const schedule = d.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return d;
      const assignment = schedule.assignments.find((a) => a.id === assignmentId);
      if (!assignment || !assignment.completed) return d;

      const updatedSchedules = d.schedules.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              assignments: s.assignments.map((a) =>
                a.id === assignmentId ? { ...a, completed: false } : a
              ),
            }
          : s
      );

      // 해당 주제를 다른 schedule에서도 완료한 경우가 있으면 유지
      const otherCompleted = d.schedules
        .filter((s) => s.id !== scheduleId)
        .flatMap((s) => s.assignments)
        .filter((a) => a.memberId === assignment.memberId && a.topicId === assignment.topicId && a.completed);

      let updatedMembers = d.members;
      let updatedGraduates = d.graduates;

      if (otherCompleted.length === 0) {
        updatedMembers = d.members.map((m) => {
          if (m.id !== assignment.memberId) return m;
          const newCompleted = m.completedTopics.filter((t) => t !== assignment.topicId);
          return { ...m, completedTopics: newCompleted, isGraduated: newCompleted.length >= TOPICS.length };
        });
        updatedGraduates = d.graduates.filter((g) => {
          const member = updatedMembers.find((m) => m.id === g.memberId);
          return member && member.isGraduated;
        });
      }

      return { ...d, schedules: updatedSchedules, members: updatedMembers, graduates: updatedGraduates };
    });
  };

  const deleteSchedule = (scheduleId) => {
    update((d) => ({ ...d, schedules: d.schedules.filter((s) => s.id !== scheduleId) }));
  };

  const updateAssignment = (scheduleId, assignmentId, changes) => {
    update((d) => ({
      ...d,
      schedules: d.schedules.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              assignments: s.assignments.map((a) =>
                a.id === assignmentId ? { ...a, ...changes } : a
              ),
            }
          : s
      ),
    }));
  };

  const addAssignment = (scheduleId, assignment) => {
    update((d) => ({
      ...d,
      schedules: d.schedules.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              assignments: [
                ...s.assignments,
                { id: Date.now().toString(), completed: false, ...assignment },
              ],
            }
          : s
      ),
    }));
  };

  const removeAssignment = (scheduleId, assignmentId) => {
    update((d) => ({
      ...d,
      schedules: d.schedules.map((s) =>
        s.id === scheduleId
          ? { ...s, assignments: s.assignments.filter((a) => a.id !== assignmentId) }
          : s
      ),
    }));
  };

  // ── 참석 확인 ──────────────────────────────────────────
  const toggleAttendance = (weekStart, memberId) => {
    update((d) => {
      const current = d.attendance?.[weekStart] || [];
      const isIn = current.includes(memberId);
      return {
        ...d,
        attendance: {
          ...d.attendance,
          [weekStart]: isIn
            ? current.filter((id) => id !== memberId)
            : [...current, memberId],
        },
      };
    });
  };

  const setAllAttendance = (weekStart, memberIds) => {
    update((d) => ({
      ...d,
      attendance: { ...d.attendance, [weekStart]: memberIds },
    }));
  };

  const clearAttendance = (weekStart) => {
    update((d) => ({
      ...d,
      attendance: { ...d.attendance, [weekStart]: [] },
    }));
  };

  return {
    members: data.members,
    teachers: data.teachers,
    schedules: data.schedules,
    graduates: data.graduates,
    attendance: data.attendance || {},
    addMember, updateMember, deleteMember,
    addTeacher, updateTeacher, deleteTeacher,
    autoSchedule, markAssignmentDone, undoAssignment,
    deleteSchedule, updateAssignment, addAssignment, removeAssignment,
    toggleAttendance, setAllAttendance, clearAttendance,
  };
}
