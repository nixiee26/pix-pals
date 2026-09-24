import React, { useState } from 'react';
import {
  Plus,
  Check,
  Play,
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Subject, Topic, Task, TaskPriority, FocusMode } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';

interface PlannerViewProps {
  subjects: Subject[];
  topics: Topic[];
  tasks: Task[];
  onSaveSubjects: (subs: Subject[]) => void;
  onSaveTopics: (tops: Topic[]) => void;
  onSaveTasks: (tasks: Task[]) => void;
  onStartFocusTask: (task: Task) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  subjects,
  topics,
  tasks,
  onSaveSubjects,
  onSaveTopics,
  onSaveTasks,
  onStartFocusTask,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'pending' | 'completed'>('pending');
  const [calendarDate, setCalendarDate] = useState(new Date());

const calendarYear = calendarDate.getFullYear();
const calendarMonth = calendarDate.getMonth();

const daysInMonth = new Date(
  calendarYear,
  calendarMonth + 1,
  0
).getDate();

const firstDayOfMonth = new Date(
  calendarYear,
  calendarMonth,
  1
).getDay();

const calendarDays = Array.from(
  { length: firstDayOfMonth + daysInMonth },
  (_, index) =>
    index < firstDayOfMonth
      ? null
      : index - firstDayOfMonth + 1
);

const monthName = calendarDate.toLocaleString('default', {
  month: 'long',
  year: 'numeric',
});
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTopicId, setNewTopicId] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newEstimate, setNewEstimate] = useState<number>(45);
  const [newDeadline, setNewDeadline] = useState('');
  const [newPlannedStart, setNewPlannedStart] = useState('');

  // New subject state
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('💻');
  const [newSubColor, setNewSubColor] = useState('#4a6fa5');

  // New topic state
  const [newTopName, setNewTopName] = useState('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = topics.filter(t => t.subjectId === selectedSubjectId);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedSubjectId && t.subjectId !== selectedSubjectId) return false;
    if (selectedTopicId !== 'all' && t.topicId !== selectedTopicId) return false;

    if (filterMode === 'pending') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    if (filterMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return t.plannedStartTime?.startsWith(today) || t.deadline === today;
    }
    return true;
  });

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    onSaveTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      subjectId: newSubjectId,
      topicId: newTopicId || undefined,
      title: newTitle.trim(),
      priority: newPriority,
      estimatedMinutes: Number(newEstimate) || 25,
      completedMinutes: 0,
      deadline: newDeadline || undefined,
      plannedStartTime: newPlannedStart || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onSaveTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsTaskModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      name: newSubName.trim(),
      icon: newSubIcon,
      color: newSubColor,
      totalFocusMinutes: 0,
      createdAt: new Date().toISOString(),
    };

    onSaveSubjects([...subjects, newSub]);
    setSelectedSubjectId(newSub.id);
    setNewSubName('');
    setIsSubjectModalOpen(false);
  };
    const handleDeleteSubject = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const confirmed = window.confirm(
      `Delete "${subject.name}"?\n\nThis will also delete its topics and tasks.`
    );

    if (!confirmed) return;

    // Remove the subject
    onSaveSubjects(subjects.filter(s => s.id !== subjectId));

    // Remove topics belonging to this subject
    onSaveTopics(topics.filter(t => t.subjectId !== subjectId));

    // Remove tasks belonging to this subject
    onSaveTasks(tasks.filter(t => t.subjectId !== subjectId));

    // Select another subject
    const remainingSubjects = subjects.filter(s => s.id !== subjectId);
    setSelectedSubjectId(remainingSubjects[0]?.id || '');
    setSelectedTopicId('all');
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopName.trim() || !selectedSubjectId) return;

    const newTop: Topic = {
      id: `top_${Date.now()}`,
      subjectId: selectedSubjectId,
      name: newTopName.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveTopics([...topics, newTop]);
    setNewTopName('');
    setIsTopicModalOpen(false);
  };

  const priorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'bg-[#fbeae7] text-[#c9302c] border-[#c9302c]';
      case 'medium': return 'bg-[#fcf3d9] text-[#b37400] border-[#b37400]';
      case 'low': return 'bg-[#e7eef7] text-[#2c4875] border-[#2c4875]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* 1. Header with Companion Mascot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <PixelMascot id="calico_cat" state="studying" size={40} />
          </div>
          <div>
            <h1 className="font-pixel text-base text-[#2c221e]">Study Planner</h1>
            <p className="text-xs text-[#847367] font-medium">
              Structure subjects, topics & conquer tasks one session at a time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3 py-1.5 bg-[#ffffff] border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#faeedf] flex items-center gap-1 shadow-pixel-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>
          <button
            onClick={() => {
              setNewSubjectId(selectedSubjectId);
              setIsTaskModalOpen(true);
            }}
            className="px-3 py-1.5 pixel-btn-primary rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
            {/* 2. Monthly Calendar */}
      <div className="bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="font-pixel text-sm text-[#2c221e]">
              {monthName}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setCalendarDate(
                  new Date(calendarYear, calendarMonth - 1, 1)
                )
              }
              className="p-1.5 rounded-lg border-2 border-[#2c221e] hover:bg-[#faeedf]"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCalendarDate(new Date())}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#2c221e] text-[10px] font-bold hover:bg-[#faeedf]"
            >
              Today
            </button>

            <button
              onClick={() =>
                setCalendarDate(
                  new Date(calendarYear, calendarMonth + 1, 1)
                )
              }
              className="p-1.5 rounded-lg border-2 border-[#2c221e] hover:bg-[#faeedf]"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-[#847367] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} />;
            }

            const dateString =
              `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const dayTasks = tasks.filter(task =>
              task.deadline === dateString ||
              task.plannedStartTime?.startsWith(dateString)
            );

            const todayString =
              new Date().toISOString().split('T')[0];

            const isToday = todayString === dateString;

            return (
              <div
                key={day}
                className={`min-h-[70px] rounded-lg border-2 p-1.5 ${
                  isToday
                    ? 'bg-[#d9ead3] border-[#2c221e] shadow-pixel-sm'
                    : 'bg-[#fcfaf6] border-[#ded3c5] hover:bg-[#faeedf]'
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">
                    {day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[9px]">⭐</span>
                  )}
                </div>

                {/* Tasks */}
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-[8px] truncate rounded px-1 py-0.5 ${
                        task.completed
                          ? 'bg-[#d9ead3] text-[#2f5937]'
                          : 'bg-[#faeedf] text-[#5c4a3f]'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}

                  {dayTasks.length > 2 && (
                    <div className="text-[8px] text-[#847367]">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* 3. Main Content Grid: Left Subjects Column + Right Tasks Area */}
      {/* 2. Main Content Grid: Left Subjects Column + Right Tasks Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Subjects List (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3 shadow-pixel-sm">
            <h3 className="font-bold text-xs uppercase text-[#847367] tracking-wider mb-2 px-1">
              Subjects
            </h3>
            <div className="flex flex-col gap-1.5">
              {subjects.map(sub => {
                const subTasks = tasks.filter(t => t.subjectId === sub.id);
                const activeCount = subTasks.filter(t => !t.completed).length;
                const isSelected = selectedSubjectId === sub.id;

               return (
  <div
    key={sub.id}
    className={`flex items-center justify-between p-2.5 rounded-lg border-2 transition-all ${
      isSelected
        ? 'bg-[#faeedf] border-[#2c221e] shadow-pixel-sm font-bold translate-x-1'
        : 'bg-white border-transparent hover:border-[#ded3c5]'
    }`}
  >
    <button
      onClick={() => {
        setSelectedSubjectId(sub.id);
        setSelectedTopicId('all');
      }}
      className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
    >
      <span className="text-base">{sub.icon}</span>
      <span className="text-xs text-[#2c221e]">{sub.name}</span>
    </button>

    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-[#2c221e]">
        {activeCount}
      </span>

      <button
        onClick={() => handleDeleteSubject(sub.id)}
        className="p-1 text-[#baa494] hover:text-[#d9534f] hover:bg-[#fbeae7] rounded transition-colors"
        title={`Delete ${sub.name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
); 
              })}
            </div>
          </div>

          {/* Topics for current subject */}
          {currentSubject && (
            <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3 shadow-pixel-sm">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-bold text-xs uppercase text-[#847367] tracking-wider">
                  Topics ({currentSubject.name})
                </h3>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="text-xs text-[#488053] font-bold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Topic
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTopicId('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedTopicId === 'all'
                      ? 'bg-[#2c221e] text-white border-[#2c221e]'
                      : 'bg-[#fcfaf6] text-[#6b584d] border-[#ded3c5] hover:bg-white'
                  }`}
                >
                  All Topics
                </button>
                {subjectTopics.map(top => (
                  <button
                    key={top.id}
                    onClick={() => setSelectedTopicId(top.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                      selectedTopicId === top.id
                        ? 'bg-[#488053] text-white border-[#2c221e]'
                        : 'bg-[#fcfaf6] text-[#6b584d] border-[#ded3c5] hover:bg-white'
                    }`}
                  >
                    {top.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Tasks Board (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="flex items-center justify-between bg-white border-2 border-[#2c221e] rounded-xl p-2.5 shadow-pixel-sm">
            <div className="flex items-center gap-1.5">
              {(['pending', 'today', 'completed', 'all'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${
                    filterMode === mode
                      ? 'bg-[#d9ead3] text-[#1e3d23] border border-[#2c221e] shadow-xs'
                      : 'text-[#847367] hover:text-[#2c221e]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#847367] font-semibold pr-2">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-2.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border-2 border-[#2c221e] rounded-xl p-8 text-center shadow-pixel-sm flex flex-col items-center">
                <div className="w-12 h-12 mb-3">
                  <PixelMascot id="bear" size={48} />
                </div>
                <h4 className="font-bold text-sm text-[#2c221e]">
                  Your study desk is clear!
                </h4>
                <p className="text-xs text-[#847367] mt-1 max-w-sm">
                  Add a task or click on a subject to plan your next focused study session.
                </p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-4 px-4 py-2 pixel-btn-primary text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Your First Task
                </button>
              </div>
            ) : (
              filteredTasks.map(task => {
                const sub = subjects.find(s => s.id === task.subjectId);
                const top = topics.find(t => t.id === task.topicId);

                return (
                  <div
                    key={task.id}
                    className={`group bg-white border-2 border-[#2c221e] rounded-xl p-3.5 shadow-pixel-sm flex items-center justify-between gap-3 transition-all ${
                      task.completed ? 'opacity-65 bg-[#fcfaf6]' : 'hover:translate-x-0.5'
                    }`}
                  >
                    {/* Checkbox & Task details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 border-[#2c221e] flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-[#488053] text-white'
                            : 'bg-white hover:bg-[#faeedf]'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              task.completed
                                ? 'line-through text-[#847367]'
                                : 'text-[#2c221e]'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[9px] font-pixel px-1.5 py-0.5 rounded border uppercase ${priorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Subject / Topic / Deadline tags */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#847367] flex-wrap font-medium">
                          {sub && (
                            <span className="flex items-center gap-1 text-[#2c221e] font-semibold">
                              <span>{sub.icon}</span> {sub.name}
                            </span>
                          )}
                          {top && (
                            <span className="bg-[#f0e6dc] px-1.5 py-0.5 rounded text-[10px]">
                              {top.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.estimatedMinutes}m est.
                          </span>
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-[#df793b]">
                              <Calendar className="w-3 h-3" /> Due {task.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Start Focus & Delete */}
                    <div className="flex items-center gap-2">
                      {!task.completed && (
                        <button
                          onClick={() => onStartFocusTask(task)}
                          title="Start Focus on this task"
                          className="px-3 py-1.5 bg-[#488053] text-white rounded-lg text-xs font-bold hover:bg-[#3b6b44] border border-[#2c221e] shadow-xs flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-[#baa494] hover:text-[#d9534f] transition-colors rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-md w-full">
            <h3 className="font-pixel text-sm text-[#2c221e] mb-4">
              Add New Study Task
            </h3>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practice 3 recursive subset problems"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={e => {
                      setNewSubjectId(e.target.value);
                      setNewTopicId('');
                    }}
                    className="w-full px-2.5 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Topic (Optional)
                  </label>
                  <select
                    value={newTopicId}
                    onChange={e => setNewTopicId(e.target.value)}
                    className="w-full px-2.5 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold focus:outline-none"
                  >
                    <option value="">None</option>
                    {topics
                      .filter(t => t.subjectId === newSubjectId)
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newEstimate}
                    onChange={e => setNewEstimate(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-1.5 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Planned Start Time (Anti-Procrastination Tracking)
                </label>
                <input
                  type="datetime-local"
                  value={newPlannedStart}
                  onChange={e => setNewPlannedStart(e.target.value)}
                  className="w-full px-2 py-1.5 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0e6dc]">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-sm w-full">
            <h3 className="font-pixel text-sm text-[#2c221e] mb-4">New Subject</h3>
            <form onSubmit={handleCreateSubject} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={newSubIcon}
                    onChange={e => setNewSubIcon(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-sm font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                    Theme Color
                  </label>
                  <input
                    type="color"
                    value={newSubColor}
                    onChange={e => setNewSubColor(e.target.value)}
                    className="w-full h-10 p-1 border-2 border-[#2c221e] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0e6dc]">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Topic */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-sm w-full">
            <h3 className="font-pixel text-sm text-[#2c221e] mb-2">New Topic</h3>
            <p className="text-xs text-[#847367] mb-4">
              Adding topic to <span className="font-bold text-[#2c221e]">{currentSubject?.name}</span>
            </p>
            <form onSubmit={handleCreateTopic} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Management & Paging"
                  value={newTopName}
                  onChange={e => setNewTopName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0e6dc]">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
