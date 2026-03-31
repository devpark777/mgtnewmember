import React, { useState } from 'react';
import { useStore } from './store/useStore';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedule from './pages/Schedule';
import Teachers from './pages/Teachers';
import Graduates from './pages/Graduates';

function App() {
  const [tab, setTab] = useState('dashboard');
  const store = useStore();

  const renderPage = () => {
    switch (tab) {
      case 'dashboard':
        return <Dashboard {...store} onNavigate={setTab} />;
      case 'members':
        return <Members members={store.members} schedules={store.schedules} teachers={store.teachers} addMember={store.addMember} updateMember={store.updateMember} deleteMember={store.deleteMember} />;
      case 'schedule':
        return <Schedule
          schedules={store.schedules} members={store.members} teachers={store.teachers}
          attendance={store.attendance}
          autoSchedule={store.autoSchedule} markAssignmentDone={store.markAssignmentDone}
          undoAssignment={store.undoAssignment} deleteSchedule={store.deleteSchedule}
          updateAssignment={store.updateAssignment} addAssignment={store.addAssignment}
          removeAssignment={store.removeAssignment}
          toggleAttendance={store.toggleAttendance}
          setAllAttendance={store.setAllAttendance}
          clearAttendance={store.clearAttendance}
        />;
      case 'teachers':
        return <Teachers teachers={store.teachers} members={store.members} addTeacher={store.addTeacher} updateTeacher={store.updateTeacher} deleteTeacher={store.deleteTeacher} schedules={store.schedules} />;
      case 'graduates':
        return <Graduates graduates={store.graduates} members={store.members} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      minHeight: '100vh', background: '#F9FAFB',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
    }}>
      <div style={{ paddingBottom: 80 }}>
        {renderPage()}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App
