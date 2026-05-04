import { useState, useEffect } from 'react';
import axiosInstance from '../service/api';
import { DaySchedule, Branch, PublicHoliday, TimeSlot } from '../types/branchTiming';
import { toast } from 'react-toastify';
import {
  Clock, Plus, Trash2, Building, Copy, Calendar,
  ChevronDown, CalendarOff, Edit2, Check, X, RotateCcw,
} from 'lucide-react';

interface SlotFormState {
  label: string;
  startTime: string;
  capacity: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BranchTiming: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'holidays'>('schedule');
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [showCopyMenu, setShowCopyMenu] = useState<number | null>(null);
  const [togglingDay, setTogglingDay] = useState<string | null>(null);
  const [copyingTo, setCopyingTo] = useState<string | null>(null);

  // Add slot form
  const [addSlotScheduleId, setAddSlotScheduleId] = useState<string | null>(null);
  const [addSlotForm, setAddSlotForm] = useState<SlotFormState>({ label: '', startTime: '09:00', capacity: 5 });
  const [addingSlot, setAddingSlot] = useState(false);

  // Edit slot form
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSlotForm, setEditSlotForm] = useState<SlotFormState>({ label: '', startTime: '09:00', capacity: 5 });
  const [savingSlot, setSavingSlot] = useState(false);

  // Holiday form
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayRecurring, setNewHolidayRecurring] = useState(false);
  const [addingHoliday, setAddingHoliday] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchHolidays();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchSchedule();
    } else {
      setSchedules([]);
    }
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const response = await axiosInstance.get('/1.0/branch');
      const data = response.data?.filter((branch: Branch) => branch.is_active) || [];
      
      setBranches(data);
      if (data.length > 0) setSelectedBranchId(data[0].id);
    } catch {
      toast.error('Failed to load branches');
    } finally {
      setBranchesLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch/schedule/holidays');
      setHolidays(response.data || []);
    } catch {
      setHolidays([]);
    }
  };

  const fetchBranchSchedule = async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    try {
      let response = await axiosInstance.get(`/1.0/branch/schedule/all/${selectedBranchId}`);
      let data: any[] = response.data || [];

      if (data.length === 0) {
        await axiosInstance.post(`/1.0/branch/schedule/seed/${selectedBranchId}`);
        response = await axiosInstance.get(`/1.0/branch/schedule/all/${selectedBranchId}`);
        data = response.data || [];
      }

      // Map API response to DaySchedule format
      // API returns: { id, branchId, dayOfWeek, isActive, slots }
      const dataMap: Record<string, DaySchedule> = {};
      data.forEach((item: any) => {
        dataMap[item.dayOfWeek] = {
          id: item.id,
          day: item.dayOfWeek,
          isActive: item.isActive,
          slots: item.slots || []
        };
      });
      
      setSchedules(DAYS.map(day => dataMap[day] || { day, isActive: true, slots: [] }));
    } catch {
      toast.error('Failed to load branch schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async (schedule: DaySchedule) => {
    if (!schedule.id || togglingDay) return;
    setTogglingDay(schedule.id);
    try {
      await axiosInstance.patch(`/1.0/branch/schedule/day/${schedule.id}`, { isActive: !schedule.isActive });
      setSchedules(prev => prev.map(s =>
        s.id === schedule.id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch {
      toast.error('Failed to update day');
    } finally {
      setTogglingDay(null);
    }
  };

  const handleAddSlot = async () => {
    if (!addSlotScheduleId || !addSlotForm.label.trim()) {
      toast.error('Please enter a slot label');
      return;
    }
    const [h, m] = addSlotForm.startTime.split(':').map(Number);
    setAddingSlot(true);
    try {
      const response = await axiosInstance.post(`/1.0/branch/schedule/day/${addSlotScheduleId}/slots`, {
        label: addSlotForm.label.trim(),
        startHour: h,
        startMinute: m,
        capacity: addSlotForm.capacity,
        isActive: true,
      });
      const newSlot: TimeSlot = response.data;
      setSchedules(prev => prev.map(s =>
        s.id === addSlotScheduleId ? { ...s, slots: [...s.slots, newSlot] } : s
      ));
      setAddSlotScheduleId(null);
      toast.success('Slot added');
    } catch {
      toast.error('Failed to add slot');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleSaveSlot = async () => {
    if (!editingSlotId || !editSlotForm.label.trim()) return;
    const [h, m] = editSlotForm.startTime.split(':').map(Number);
    setSavingSlot(true);
    try {
      await axiosInstance.patch(`/1.0/branch/schedule/slots/${editingSlotId}`, {
        label: editSlotForm.label.trim(),
        startHour: h,
        startMinute: m,
        capacity: editSlotForm.capacity,
      });
      setSchedules(prev => prev.map(s => ({
        ...s,
        slots: s.slots.map(slot =>
          slot.id === editingSlotId
            ? { ...slot, label: editSlotForm.label.trim(), startHour: h, startMinute: m, capacity: editSlotForm.capacity }
            : slot
        ),
      })));
      setEditingSlotId(null);
      toast.success('Slot updated');
    } catch {
      toast.error('Failed to update slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, scheduleId: string) => {
    try {
      await axiosInstance.delete(`/1.0/branch/schedule/slots/${slotId}`);
      setSchedules(prev => prev.map(s =>
        s.id === scheduleId ? { ...s, slots: s.slots.filter(slot => slot.id !== slotId) } : s
      ));
      toast.success('Slot removed');
    } catch {
      toast.error('Failed to remove slot');
    }
  };

  const handleCopyToDay = async (fromSchedule: DaySchedule, toSchedule: DaySchedule) => {
    if (!toSchedule.id) return;
    setCopyingTo(toSchedule.id);
    setShowCopyMenu(null);
    try {
      await Promise.all(toSchedule.slots.map(slot => axiosInstance.delete(`/1.0/branch/schedule/slots/${slot.id}`)));
      const newSlots = await Promise.all(
        fromSchedule.slots.map(slot =>
          axiosInstance.post(`/1.0/branch/schedule/day/${toSchedule.id}/slots`, {
            label: slot.label,
            startHour: slot.startHour,
            startMinute: slot.startMinute,
            capacity: slot.capacity,
            isActive: slot.isActive,
          }).then(r => r.data)
        )
      );
      setSchedules(prev => prev.map(s =>
        s.id === toSchedule.id ? { ...s, slots: newSlots } : s
      ));
      toast.success(`Copied to ${toSchedule.day}`);
    } catch {
      toast.error('Failed to copy schedule');
    } finally {
      setCopyingTo(null);
    }
  };

  const handleApplyToAllDays = async (fromSchedule: DaySchedule, fromIndex: number) => {
    setShowCopyMenu(null);
    setCopyingTo('all');
    try {
      const targets = schedules.filter((_, i) => i !== fromIndex);
      for (const target of targets) {
        if (!target.id) continue;
        await Promise.all(target.slots.map(slot => axiosInstance.delete(`/1.0/branch/schedule/slots/${slot.id}`)));
        const newSlots = await Promise.all(
          fromSchedule.slots.map(slot =>
            axiosInstance.post(`/1.0/branch/schedule/day/${target.id}/slots`, {
              label: slot.label,
              startHour: slot.startHour,
              startMinute: slot.startMinute,
              capacity: slot.capacity,
              isActive: slot.isActive,
            }).then(r => r.data)
          )
        );
        setSchedules(prev => prev.map(s =>
          s.id === target.id ? { ...s, slots: newSlots } : s
        ));
      }
      toast.success('Applied to all days');
    } catch {
      toast.error('Failed to apply to all days');
    } finally {
      setCopyingTo(null);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayName.trim()) {
      toast.error('Please enter both date and holiday name');
      return;
    }
    const [year, month, day] = newHolidayDate.split('-').map(Number);
    setAddingHoliday(true);
    try {
      const response = await axiosInstance.post('/1.0/branch/schedule/holidays', {
        name: newHolidayName.trim(),
        day,
        month,
        year: newHolidayRecurring ? null : year,
        isActive: true,
      });
      setHolidays(prev => [...prev, response.data]);
      setNewHolidayDate('');
      setNewHolidayName('');
      setNewHolidayRecurring(false);
      toast.success('Holiday added');
    } catch {
      toast.error('Failed to add holiday');
    } finally {
      setAddingHoliday(false);
    }
  };

  const handleRemoveHoliday = async (holidayId: string) => {
    try {
      await axiosInstance.delete(`/1.0/branch/schedule/holidays/${holidayId}`);
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      toast.success('Holiday removed');
    } catch {
      toast.error('Failed to remove holiday');
    }
  };

  const hourMinToTimeStr = (hour: number, minute: number) =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const formatTimeLabel = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    const mins = minute !== 0 ? `:${String(minute).padStart(2, '0')}` : '';
    return `${h12}${mins} ${ampm}`;
  };

  const formatHolidayDate = (day: number, month: number, year: number | null) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month - 1]} ${day}${year ? ` ${year}` : ' (Recurring)'}`;
  };

  if (branchesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Clock size={32} />
          <div>
            <h1 className="text-2xl font-bold">Branch Schedule Management</h1>
            <p className="text-blue-200 text-sm mt-1">Configure weekly availability and time slots</p>
          </div>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Building size={20} className="text-blue-900" />
          <span className="font-semibold text-blue-900">Select Branch</span>
        </div>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        >
          <option value="">Select a branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.enName || branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['schedule', 'holidays'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-900 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab === 'schedule' ? <Clock size={18} /> : <Calendar size={18} />}
            {tab === 'schedule' ? 'Weekly Schedule' : 'Public Holidays'}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent" />
            </div>
          ) : !selectedBranchId ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
              <Building size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium">Please select a branch to manage schedule</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule, dayIndex) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === schedule.day;
                const isToggling = togglingDay === schedule.id;
                const isCopying = copyingTo === schedule.id || copyingTo === 'all';

                console.log(schedule);

                return (
                  <div
                    key={schedule.day}
                    className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${
                      !schedule.isActive
                        ? 'border-gray-200 opacity-60'
                        : isToday
                          ? 'border-blue-500 shadow-lg shadow-blue-100'
                          : 'border-gray-100 shadow-sm'
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`px-5 py-4 flex items-center justify-between ${schedule.isActive ? 'bg-gray-50' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleDay(schedule)}
                          disabled={isToggling || !schedule.id}
                          className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 ${
                            schedule.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {isToggling ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            </span>
                          ) : (
                            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              schedule.isActive ? 'translate-x-7' : 'translate-x-0'
                            }`} />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-800">{schedule.day}</h3>
                            {isToday && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">TODAY</span>}
                            {!schedule.isActive && <span className="px-2 py-0.5 bg-gray-400 text-white text-xs font-semibold rounded">CLOSED</span>}
                          </div>
                          <p className="text-sm text-gray-500">
                            {schedule.isActive
                              ? `${schedule.slots.length} time slot${schedule.slots.length !== 1 ? 's' : ''}`
                              : 'Day is inactive — no appointments'}
                          </p>
                        </div>
                      </div>

                      {schedule.isActive && (
                        <div className="flex items-center gap-2">
                          {isCopying ? (
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-2">
                              <RotateCcw size={14} className="animate-spin" /> Copying...
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setAddSlotScheduleId(schedule.id || null);
                                  setAddSlotForm({ label: '', startTime: '09:00', capacity: 5 });
                                  setEditingSlotId(null);
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
                              >
                                <Plus size={16} />
                                Add Slot
                              </button>

                              <div className="relative">
                                <button
                                  onClick={() => setShowCopyMenu(showCopyMenu === dayIndex ? null : dayIndex)}
                                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  <Copy size={16} />
                                  Copy
                                  <ChevronDown size={14} />
                                </button>

                                {showCopyMenu === dayIndex && (
                                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10 py-2">
                                    <button
                                      onClick={() => handleApplyToAllDays(schedule, dayIndex)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-900 font-medium"
                                    >
                                      Apply to all days
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <p className="px-4 py-1 text-xs text-gray-400 uppercase">Copy to specific day</p>
                                    {schedules.map((s, idx) =>
                                      idx !== dayIndex && (
                                        <button
                                          key={s.day}
                                          onClick={() => handleCopyToDay(schedule, s)}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                                        >
                                          {s.day}
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time Slots */}
                    {schedule.isActive && (
                      <div className="p-5">
                        {schedule.slots.length === 0 && addSlotScheduleId !== schedule.id ? (
                          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Clock size={32} className="text-gray-300 mb-2" />
                            <p className="text-gray-400 text-sm">No time slots configured</p>
                            <button
                              onClick={() => {
                                setAddSlotScheduleId(schedule.id || null);
                                setAddSlotForm({ label: '', startTime: '09:00', capacity: 5 });
                              }}
                              className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                            >
                              + Add your first slot
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {schedule.slots.map((slot) => (
                              <div key={slot.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                {editingSlotId === slot.id ? (
                                  <div className="p-3 bg-blue-50 flex flex-wrap items-end gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                                      <input
                                        type="text"
                                        value={editSlotForm.label}
                                        onChange={(e) => setEditSlotForm(f => ({ ...f, label: e.target.value }))}
                                        placeholder="e.g. 10 AM - 12 PM"
                                        className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                                      <input
                                        type="time"
                                        value={editSlotForm.startTime}
                                        onChange={(e) => setEditSlotForm(f => ({ ...f, startTime: e.target.value }))}
                                        className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={editSlotForm.capacity}
                                        onChange={(e) => setEditSlotForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                                        className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleSaveSlot}
                                        disabled={savingSlot}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
                                      >
                                        {savingSlot
                                          ? <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                          : <Check size={14} />}
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingSlotId(null)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                                      >
                                        <X size={14} /> Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-3 bg-gray-50 group hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Clock size={16} className="text-blue-700" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800 text-sm">{slot.label}</p>
                                        <p className="text-xs text-gray-500">
                                          Starts {formatTimeLabel(slot.startHour, slot.startMinute)} · {slot.capacity} capacity
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setEditingSlotId(slot.id || null);
                                          setEditSlotForm({
                                            label: slot.label,
                                            startTime: hourMinToTimeStr(slot.startHour, slot.startMinute),
                                            capacity: slot.capacity,
                                          });
                                          setAddSlotScheduleId(null);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                      >
                                        <Edit2 size={15} />
                                      </button>
                                      <button
                                        onClick={() => slot.id && schedule.id && handleDeleteSlot(slot.id, schedule.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Add slot inline form */}
                            {addSlotScheduleId === schedule.id && (
                              <div className="border-2 border-blue-300 border-dashed rounded-lg p-3 bg-blue-50">
                                <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">New Slot</p>
                                <div className="flex flex-wrap items-end gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                                    <input
                                      type="text"
                                      value={addSlotForm.label}
                                      onChange={(e) => setAddSlotForm(f => ({ ...f, label: e.target.value }))}
                                      placeholder="e.g. 10 AM - 12 PM"
                                      className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                                    <input
                                      type="time"
                                      value={addSlotForm.startTime}
                                      onChange={(e) => setAddSlotForm(f => ({ ...f, startTime: e.target.value }))}
                                      className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={addSlotForm.capacity}
                                      onChange={(e) => setAddSlotForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                                      className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleAddSlot}
                                      disabled={addingSlot}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 text-white text-sm font-medium rounded hover:bg-blue-800 disabled:opacity-50"
                                    >
                                      {addingSlot
                                        ? <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                        : <Check size={14} />}
                                      Add
                                    </button>
                                    <button
                                      onClick={() => setAddSlotScheduleId(null)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                                    >
                                      <X size={14} /> Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Holidays Tab */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalendarOff size={20} className="text-red-500" />
              Public Holidays (KSA)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add public holidays when the branch will be closed. These dates will be excluded from booking.
            </p>
          </div>

          {/* Add Holiday Form */}
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="e.g., Eid Al-Fitr"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pb-2.5">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newHolidayRecurring}
                  onChange={(e) => setNewHolidayRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700 cursor-pointer select-none">
                  Recurring annually
                </label>
              </div>
              <button
                onClick={handleAddHoliday}
                disabled={addingHoliday}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {addingHoliday
                  ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  : <Plus size={18} />}
                Add Holiday
              </button>
            </div>
          </div>

          {/* Holidays List */}
          <div className="p-5">
            {holidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Calendar size={48} className="mb-3 opacity-50" />
                <p className="font-medium">No holidays configured</p>
                <p className="text-sm">Add public holidays to exclude them from booking</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...holidays]
                  .sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day)
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100 shrink-0">
                          <Calendar size={24} className="text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{holiday.name}</p>
                          <p className="text-sm text-gray-500">{formatHolidayDate(holiday.day, holiday.month, holiday.year)}</p>
                        </div>
                        {holiday.year === null && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">ANNUAL</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveHoliday(holiday.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchTiming;
