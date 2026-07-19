import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import usePermission from '../../hooks/usePermission';
import {
  Clock,
  Calendar,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Coffee,
  LogOut,
  Sliders,
  Play,
  Check,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export const AttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission } = usePermission();
  const isManager = hasPermission('read_employees');

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'roster'
  const [currentTime, setCurrentTime] = useState(new Date());

  // Personal state
  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [personalLogs, setPersonalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // Roster state
  const [roster, setRoster] = useState([]);
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().slice(0, 10));
  const [rosterLoading, setRosterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showLogModal, setShowLogModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [logForm, setLogForm] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    clockIn: '',
    clockOut: '',
    status: 'present',
    remarks: '',
  });

  // Clock tick effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial today status
  useEffect(() => {
    fetchTodayStatus();
    fetchPersonalHistory();
  }, []);

  // Fetch roster when date or tab changes
  useEffect(() => {
    if (activeTab === 'roster' && isManager) {
      fetchRoster();
      fetchEmployeesList();
    }
  }, [activeTab, rosterDate, isManager]);

  const fetchTodayStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/today');
      setEmployee(res.data.data.employee);
      setTodayAttendance(res.data.data.attendance);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading attendance details', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalHistory = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/attendance/history?limit=30');
      setPersonalLogs(res.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading personal logs', type: 'error' }));
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchRoster = async () => {
    setRosterLoading(true);
    try {
      const res = await api.get(`/attendance/roster?date=${rosterDate}`);
      setRoster(res.data.data.roster);
    } catch (err) {
      dispatch(addToast({ message: 'Error loading daily roster', type: 'error' }));
    } finally {
      setRosterLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      setEmployeesList(res.data.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await api.post('/attendance/clock-in');
      setTodayAttendance(res.data.data.attendance);
      fetchPersonalHistory();
      dispatch(addToast({ message: 'Clocked in successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to clock in', type: 'error' }));
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await api.post('/attendance/clock-out');
      setTodayAttendance(res.data.data.attendance);
      fetchPersonalHistory();
      dispatch(addToast({ message: 'Clocked out successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to clock out', type: 'error' }));
    }
  };

  const handleStartBreak = async () => {
    try {
      const res = await api.post('/attendance/break/start');
      setTodayAttendance(res.data.data.attendance);
      dispatch(addToast({ message: 'Break started', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to start break', type: 'error' }));
    }
  };

  const handleEndBreak = async () => {
    try {
      const res = await api.post('/attendance/break/end');
      setTodayAttendance(res.data.data.attendance);
      dispatch(addToast({ message: 'Break ended', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to end break', type: 'error' }));
    }
  };

  const handleOpenManualLog = () => {
    setIsEditing(false);
    setSelectedLogId(null);
    setLogForm({
      employeeId: employeesList[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      clockIn: '',
      clockOut: '',
      status: 'present',
      remarks: '',
    });
    setShowLogModal(true);
  };

  const handleOpenEditLog = (item) => {
    setIsEditing(true);
    setSelectedLogId(item.attendance._id);
    const inDate = item.attendance.clockIn ? new Date(item.attendance.clockIn) : null;
    const outDate = item.attendance.clockOut ? new Date(item.attendance.clockOut) : null;

    const toLocalDatetimeString = (date) => {
      if (!date) return '';
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setLogForm({
      employeeId: item.employee._id,
      date: item.attendance.date,
      clockIn: toLocalDatetimeString(inDate),
      clockOut: toLocalDatetimeString(outDate),
      status: item.attendance.status,
      remarks: item.attendance.remarks || '',
    });
    setShowLogModal(true);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.patch(`/attendance/log/${selectedLogId}`, logForm);
        dispatch(addToast({ message: 'Attendance log updated successfully', type: 'success' }));
      } else {
        await api.post('/attendance/log', logForm);
        dispatch(addToast({ message: 'Attendance record logged successfully', type: 'success' }));
      }
      setShowLogModal(false);
      fetchRoster();
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Operation failed', type: 'error' }));
    }
  };

  // Stats calculation
  const stats = roster.reduce(
    (acc, cur) => {
      if (cur.attendance) {
        if (cur.attendance.status === 'present') acc.present++;
        else if (cur.attendance.status === 'late') acc.late++;
        
        const hasActiveBreak = cur.attendance.breaks.some(b => b.end === null);
        if (hasActiveBreak) acc.onBreak++;
        
        if (cur.attendance.clockOut) acc.checkedOut++;
      } else {
        acc.absent++;
      }
      return acc;
    },
    { present: 0, late: 0, onBreak: 0, absent: 0, checkedOut: 0 }
  );

  const filteredRoster = roster.filter((item) =>
    item.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Time formatter
  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary" /> Staff Attendance
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Clock in/out of shifts, log breaks, check worked hours, or manage team roster.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-card p-1 shadow-soft">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'personal'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-850'
              }`}
            >
              My Attendance
            </button>
            {isManager && (
              <button
                onClick={() => setActiveTab('roster')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'roster'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-850'
                }`}
              >
                Team Roster
              </button>
            )}
          </div>
        </div>

        {activeTab === 'personal' ? (
          /* PERSONAL ATTENDANCE VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clock-in actions card */}
            <Card className="lg:col-span-1 p-6 flex flex-col justify-between items-center border border-slate-100 dark:border-zinc-900 space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                  {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <h2 className="text-4xl font-extrabold font-mono text-slate-800 dark:text-zinc-50 tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h2>
                {employee && (
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Shift Time: <span className="text-slate-700 dark:text-zinc-350 font-bold">{employee.shift?.start} - {employee.shift?.end}</span>
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="w-full flex justify-center">
                {!todayAttendance ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-105/70 text-slate-550 dark:bg-zinc-850/50 dark:text-zinc-400 rounded-pill text-[10px] font-bold uppercase">
                    <AlertCircle className="w-4 h-4" /> Not Clocked In
                  </div>
                ) : todayAttendance.clockOut ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-pill text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" /> Shift Ended
                  </div>
                ) : todayAttendance.breaks.some(b => b.end === null) ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-750 dark:bg-purple-950/20 dark:text-purple-400 rounded-pill text-[10px] font-bold uppercase">
                    <Coffee className="w-4 h-4 animate-pulse" /> On Break
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded-pill text-[10px] font-bold uppercase">
                    <Play className="w-4 h-4 animate-pulse" /> Shift Active ({todayAttendance.status})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                {loading ? (
                  <Skeleton variant="rectangular" height={50} className="rounded-card" />
                ) : !todayAttendance ? (
                  <Button
                    variant="primary"
                    className="w-full py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    onClick={handleClockIn}
                  >
                    Start Shift (Clock In)
                  </Button>
                ) : todayAttendance.clockOut ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-center text-xs text-slate-500 font-semibold">
                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    Good work today! Clocked out at {formatTime(todayAttendance.clockOut)}.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {todayAttendance.breaks.some(b => b.end === null) ? (
                      <Button
                        variant="secondary"
                        className="py-3 text-xs font-bold border-purple-250 bg-purple-50 hover:bg-purple-100/50 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400"
                        onClick={handleEndBreak}
                      >
                        End Break
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="py-3 text-xs font-bold border-slate-200 dark:border-zinc-800"
                        onClick={handleStartBreak}
                      >
                        Take Break
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      className="py-3 text-xs font-bold bg-red-600 hover:bg-red-750 text-white"
                      onClick={handleClockOut}
                    >
                      Clock Out
                    </Button>
                  </div>
                )}
              </div>

              {/* Hours counter details */}
              {todayAttendance && (
                <div className="w-full grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-zinc-900/30 p-3 rounded-card border border-slate-50 dark:border-zinc-900/50 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Clocked In</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono">{formatTime(todayAttendance.clockIn)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Worked Hours</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono">
                      {todayAttendance.clockOut ? `${todayAttendance.totalHours} hrs` : '--'}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* History Table logs */}
            <Card className="lg:col-span-2 p-6 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-1.5 text-primary" /> History Log (Last 30 Days)
                </h3>
                <p className="text-[11px] text-slate-500">Your recent clock-ins and checked durations.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-bold">
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Clock In</th>
                      <th className="py-2">Clock Out</th>
                      <th className="py-2 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-zinc-900/50">
                          <td colSpan="5" className="py-3"><Skeleton variant="text" /></td>
                        </tr>
                      ))
                    ) : personalLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-450 font-semibold">No attendance records found yet.</td>
                      </tr>
                    ) : (
                      personalLogs.map((log) => (
                        <tr key={log._id} className="border-b border-slate-50 dark:border-zinc-900/50 text-slate-650 dark:text-zinc-350 hover:bg-slate-50/30 dark:hover:bg-zinc-900/10">
                          <td className="py-2.5 font-semibold font-mono">{log.date}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded-pill text-[9px] font-bold capitalize ${
                              log.status === 'present'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : log.status === 'late'
                                ? 'bg-yellow-100 text-yellow-750 dark:bg-yellow-950/20 dark:text-yellow-450'
                                : 'bg-red-105 text-red-650 dark:bg-red-950/20 dark:text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono">{formatTime(log.clockIn)}</td>
                          <td className="py-2.5 font-mono">{formatTime(log.clockOut)}</td>
                          <td className="py-2.5 text-right font-semibold font-mono">{log.clockOut ? `${log.totalHours} hrs` : '--'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          /* ADMIN/MANAGER DAILY ROSTER VIEW */
          <div className="space-y-6">
            {/* Filter controls and Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Date Filter & search */}
              <Card className="md:col-span-2 lg:col-span-2 p-4 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col space-y-1 w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Date</label>
                    <input
                      type="date"
                      value={rosterDate}
                      onChange={(e) => setRosterDate(e.target.value)}
                      className="border border-slate-200 dark:border-zinc-800 rounded-input px-3 py-1.5 text-xs bg-transparent dark:text-zinc-200 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Search Staff</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-2 py-1.5 rounded-input">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs w-full focus:outline-none dark:text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-zinc-850">
                  <span className="text-[10px] text-slate-400 font-semibold">Log staff attendance manually</span>
                  <Button variant="outline" size="sm" icon={Plus} className="py-1" onClick={handleOpenManualLog}>
                    Add Log
                  </Button>
                </div>
              </Card>

              {/* Stats Grid */}
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-4 gap-4">
                <Card className="p-3 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between items-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Present</span>
                  <span className="text-xl font-extrabold text-emerald-500 font-mono mt-1">{stats.present}</span>
                  <span className="text-[8px] text-slate-400">On Time</span>
                </Card>
                <Card className="p-3 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between items-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Late</span>
                  <span className="text-xl font-extrabold text-yellow-500 font-mono mt-1">{stats.late}</span>
                  <span className="text-[8px] text-slate-400">Late Check-ins</span>
                </Card>
                <Card className="p-3 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between items-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">On Break</span>
                  <span className="text-xl font-extrabold text-purple-500 font-mono mt-1">{stats.onBreak}</span>
                  <span className="text-[8px] text-slate-400">Active Break</span>
                </Card>
                <Card className="p-3 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between items-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Absent</span>
                  <span className="text-xl font-extrabold text-red-500 font-mono mt-1">{stats.absent}</span>
                  <span className="text-[8px] text-slate-400">No Record</span>
                </Card>
              </div>
            </div>

            {/* Roster Listing table */}
            <Card className="p-6 border border-slate-100 dark:border-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-bold">
                      <th className="py-2.5">Staff Member</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">Scheduled Shift</th>
                      <th className="py-2.5">Check-in Status</th>
                      <th className="py-2.5">Clock In / Out</th>
                      <th className="py-2.5">Worked Duration</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterLoading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-zinc-900/50">
                          <td colSpan="7" className="py-3"><Skeleton variant="text" /></td>
                        </tr>
                      ))
                    ) : filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-450 font-semibold">No employee files registered on this roster.</td>
                      </tr>
                    ) : (
                      filteredRoster.map((item) => {
                        const hasCheckedIn = !!item.attendance;
                        const statusClass = !hasCheckedIn
                          ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400'
                          : item.attendance.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-yellow-100 text-yellow-750 dark:bg-yellow-950/20 dark:text-yellow-450';

                        return (
                          <tr key={item.employee._id} className="border-b border-slate-50 dark:border-zinc-900/50 text-slate-650 dark:text-zinc-350 hover:bg-slate-50/30 dark:hover:bg-zinc-900/10">
                            <td className="py-3.5 font-bold text-slate-800 dark:text-zinc-100">{item.employee.name}</td>
                            <td className="py-3.5 uppercase text-[10px] font-bold text-slate-450">{item.employee.role}</td>
                            <td className="py-3.5 font-mono">{item.employee.shift?.start} - {item.employee.shift?.end}</td>
                            <td className="py-3.5">
                              <span className={`px-1.5 py-0.5 rounded-pill text-[9px] font-bold capitalize ${statusClass}`}>
                                {hasCheckedIn ? item.attendance.status : 'Absent'}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-[10px]">
                              {hasCheckedIn ? (
                                <div className="flex items-center gap-1">
                                  <span>{formatTime(item.attendance.clockIn)}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  <span>{formatTime(item.attendance.clockOut)}</span>
                                </div>
                              ) : (
                                '--'
                              )}
                            </td>
                            <td className="py-3.5 font-semibold font-mono text-slate-850 dark:text-zinc-200">
                              {hasCheckedIn && item.attendance.clockOut ? (
                                <span className="flex items-center gap-1">
                                  {item.attendance.totalHours} hrs
                                  {item.attendance.overtimeHours > 0 && (
                                    <span className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/25 dark:text-indigo-400 px-1 rounded-pill font-bold font-sans">
                                      +{item.attendance.overtimeHours} OT
                                    </span>
                                  )}
                                </span>
                              ) : hasCheckedIn ? (
                                <span className="text-primary font-bold animate-pulse">On Shift</span>
                              ) : (
                                '--'
                              )}
                            </td>
                            <td className="py-3.5 text-right">
                              {hasCheckedIn ? (
                                <Button
                                  variant="text"
                                  size="sm"
                                  className="text-primary hover:bg-primary/5 py-1 px-2 font-bold"
                                  onClick={() => handleOpenEditLog(item)}
                                >
                                  Edit Log
                                </Button>
                              ) : (
                                <Button
                                  variant="text"
                                  size="sm"
                                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-850 py-1 px-2 font-semibold"
                                  onClick={() => {
                                    handleOpenManualLog();
                                    setLogForm(prev => ({ ...prev, employeeId: item.employee._id }));
                                  }}
                                >
                                  Log Clock In
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Manual Adjust / Log modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                {isEditing ? 'Adjust Attendance Log' : 'Log Manual Attendance'}
              </h3>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                {!isEditing && (
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Staff Member</label>
                    <select
                      value={logForm.employeeId}
                      onChange={(e) => setLogForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    >
                      {employeesList.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label="Date"
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  disabled={isEditing}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Clock In Time"
                    type="datetime-local"
                    value={logForm.clockIn}
                    onChange={(e) => setLogForm(prev => ({ ...prev, clockIn: e.target.value }))}
                    required
                  />
                  <Input
                    label="Clock Out Time"
                    type="datetime-local"
                    value={logForm.clockOut}
                    onChange={(e) => setLogForm(prev => ({ ...prev, clockOut: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Status Check</label>
                    <select
                      value={logForm.status}
                      onChange={(e) => setLogForm(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 text-xs border bg-white border-slate-350 rounded-input focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    >
                      <option value="present">Present (On Time)</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half Day</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Remarks"
                  placeholder="e.g. forgot card, manual adjustment by manager"
                  value={logForm.remarks}
                  onChange={(e) => setLogForm(prev => ({ ...prev, remarks: e.target.value }))}
                />

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Log</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
