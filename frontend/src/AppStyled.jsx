import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, ChevronLeft, ChevronRight, Users, User, Calendar, CheckCircle2, Circle, Clock, BarChart3, X, ChevronDown, FileText, Star, Download, Image } from 'lucide-react';

// ============================================
// 샘플 데이터
// ============================================
const sampleUser = {
  id: 'u1',
  nickname: 'Hanjin',
  emoji: '😊'
};

const initialProjects = [
  {
    id: 'p1',
    title: '해석학 I',
    totalTimeMs: 0,
    dueDate: new Date('2025-10-25'),
    memberCount: 1,
    report: null,
    tasks: [
      { id: 't1', content: '25.10.12. 수업 복습', isDone: true, durationMs: 0 },
      { id: 't2', content: 'Quiz 복습 공부', isDone: true, durationMs: 0 },
      { id: 't3', content: 'HW #4 제출', isDone: false, durationMs: 0 },
      { id: 't4', content: '25.10.14. 수업 예습', isDone: false, durationMs: 0 },
    ],
  },
  {
    id: 'p2',
    title: '몰캠 W1',
    totalTimeMs: 0,
    dueDate: new Date('2025-01-15'),
    memberCount: 2,
    report: null,
    members: [
      { id: 'm1', nickname: '탁한진', timeMs: 0, progress: 50 },
      { id: 'm2', nickname: '안준영', timeMs: 0, progress: 30 },
    ],
    tasks: [
      { id: 't1', content: 'Figma로 디자인', isDone: false, durationMs: 0, assigneeId: 'm1', assigneeName: '탁한진' },
      { id: 't2', content: 'DB에 → Root', isDone: false, durationMs: 0, assigneeId: 'm1', assigneeName: '탁한진' },
      { id: 't3', content: 'DB Schema 제작', isDone: true, durationMs: 0, assigneeId: 'm2', assigneeName: '안준영' },
      { id: 't4', content: 'KCLOUD에 서버 연결', isDone: false, durationMs: 0, assigneeId: 'm2', assigneeName: '안준영' },
    ],
  },
];

// 바코드용 시간 슬롯 생성
const generateTimeSlots = (seed = 0) => {
  const slots = new Array(144).fill(false);
  const patterns = [
    [54,55,56,57,58,59,60,61,62,63,64,65,66,84,85,86,87,88,89,90,120,121,122,123,124,125,126,127,128,129,130,131,132],
    [48,49,50,51,52,53,54,55,72,73,74,75,76,77,78,96,97,98,99,100,101,102,103,104],
    [60,61,62,63,64,65,66,67,68,69,70,90,91,92,93,94,95,96,114,115,116,117,118,119,120],
    [42,43,44,45,46,47,48,78,79,80,81,82,83,84,85,86,108,109,110,111,112,113,114,115,116,117],
    [54,55,56,57,58,59,60,61,62,84,85,86,87,88,89,90,91,92,93,94,126,127,128,129,130,131,132,133,134],
    [36,37,38,39,40,41,42,66,67,68,69,70,71,72,102,103,104,105,106,107,108,109,110],
    [48,49,50,51,52,53,78,79,80,81,82,83,84,85,86,87,120,121,122,123,124,125,126,127,128,129,130],
  ];
  patterns[seed % 7].forEach(i => { if (i < 144) slots[i] = true; });
  return slots;
};

// 7일치 샘플 데이터 생성
const generateWeeklyArchive = () => {
  const baseDate = new Date('2026-01-09');
  const taskVariations = [
    [
      { taskName: '25.10.12. 수업 복습', projectName: '해석학 I', durationMs: 4340000 },
      { taskName: 'Quiz#3 준비', projectName: '해석학 I', durationMs: 1632000 },
      { taskName: 'Figma로 디자인', projectName: '몰캠 W1', durationMs: 7813000 },
    ],
    [
      { taskName: '알고리즘 문제풀이', projectName: '코딩테스트', durationMs: 5400000 },
      { taskName: 'DB Schema 제작', projectName: '몰캠 W1', durationMs: 2400000 },
    ],
    [
      { taskName: '미적분학 복습', projectName: '해석학 I', durationMs: 3600000 },
      { taskName: 'API 설계', projectName: '몰캠 W1', durationMs: 4800000 },
      { taskName: '팀 미팅', projectName: '몰캠 W1', durationMs: 1800000 },
    ],
    [
      { taskName: '과제 제출', projectName: '해석학 I', durationMs: 2700000 },
      { taskName: 'Frontend 개발', projectName: '몰캠 W1', durationMs: 6300000 },
    ],
    [
      { taskName: '시험 준비', projectName: '해석학 I', durationMs: 7200000 },
      { taskName: 'Code Review', projectName: '몰캠 W1', durationMs: 1800000 },
      { taskName: '버그 수정', projectName: '몰캠 W1', durationMs: 2400000 },
    ],
    [
      { taskName: '논문 읽기', projectName: '연구', durationMs: 5400000 },
      { taskName: '발표 준비', projectName: '몰캠 W1', durationMs: 3600000 },
    ],
    [
      { taskName: '주간 회고', projectName: '개인', durationMs: 1800000 },
      { taskName: '다음주 계획', projectName: '개인', durationMs: 1200000 },
      { taskName: '자료 정리', projectName: '해석학 I', durationMs: 2400000 },
    ],
  ];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (6 - i));
    const tasks = taskVariations[i];
    const totalTimeMs = tasks.reduce((sum, t) => sum + t.durationMs, 0);
    return {
      date,
      tasks,
      totalTimeMs,
      timeSlots: generateTimeSlots(i),
    };
  });
};

const weeklyArchiveData = generateWeeklyArchive();

// ============================================
// 유틸리티 함수
// ============================================
const formatTime = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatTimeShort = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.`;
};

const formatDateFull = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getDayName = (date) => {
  if (!date) return '';
  return ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];
};

const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  return Math.round((tasks.filter(t => t.isDone).length / tasks.length) * 100);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// 오늘의 Task (미완료)
const getTodayTasks = (projects) => {
  const todayTasks = [];
  projects.forEach(project => {
    project.tasks.filter(task => !task.isDone).forEach(task => {
      todayTasks.push({ ...task, projectId: project.id, projectTitle: project.title });
    });
  });
  return todayTasks;
};

// ============================================
// 컴포넌트들
// ============================================

const TotalTimeDisplay = ({ timeMs, isRunning, currentTask, onTimerClick }) => (
  <div className="flex flex-col items-center py-8">
    <button onClick={onTimerClick} className={`relative w-48 h-48 rounded-full border-4 ${isRunning ? 'border-[#D4AF37]' : 'border-gray-300'} flex items-center justify-center bg-[#E5D3B3] shadow-inner transition-all hover:shadow-md`}>
      {isRunning && <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] animate-pulse" />}
      <div className="flex flex-col items-center">
        <span className={`text-4xl font-mono font-bold ${isRunning ? 'text-[#D4AF37]' : 'text-[#4B4B2E]'}`}>{formatTime(timeMs)}</span>
        {isRunning && currentTask && <span className="text-xs text-gray-500 mt-2 max-w-32 truncate">{currentTask.content}</span>}
      </div>
    </button>
    {isRunning && (
      <div className="flex items-center gap-2 mt-4 text-[#D4AF37]">
        <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
        <span className="text-sm font-medium">측정 중...</span>
      </div>
    )}
  </div>
);

const DailyTodoSection = ({ todayTasks, onToggle, onStartTimer }) => (
  <div className="px-4 py-3">
    <h3 className="text-sm font-semibold text-gray-600 mb-2">Daily Todo ({todayTasks.length})</h3>
    {todayTasks.length > 0 ? (
      <div className="space-y-2">
        {todayTasks.slice(0, 5).map(task => (
          <div key={`${task.projectId}-${task.id}`} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button onClick={() => onToggle(task.projectId, task.id)}>
                <Circle size={18} className="text-gray-400" />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-sm block truncate text-gray-800">{task.content}</span>
                <span className="text-xs text-gray-400">{task.projectTitle}</span>
              </div>
            </div>
            <button onClick={() => onStartTimer(task)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <Play size={14} />
            </button>
          </div>
        ))}
        {todayTasks.length > 5 && <p className="text-xs text-gray-400 text-center">+{todayTasks.length - 5}개 더...</p>}
      </div>
    ) : (
      <div className="text-center py-4 text-gray-400 text-sm">🎉 오늘 할 일을 모두 완료했습니다!</div>
    )}
  </div>
);

const MainProjectCard = ({ project, onClick, isTimerRunning, currentProjectId, elapsedTime }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const displayTime = project.id === currentProjectId ? project.totalTimeMs + elapsedTime : project.totalTimeMs;
  const isCurrentProject = project.id === currentProjectId && isTimerRunning;
  const isCompleted = progress === 100;

  return (
    <button onClick={onClick} className={`w-full bg-white border rounded-lg p-3 text-left hover:bg-gray-50 transition-colors ${isCurrentProject ? 'border-red-300 bg-red-50' : isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted && <span className="text-green-500">✓</span>}
          <span className="font-medium text-gray-900">{project.title}</span>
          {isCurrentProject && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </div>
        <span className={`font-mono text-sm ${isCurrentProject ? 'text-red-500' : 'text-gray-600'}`}>{formatTime(displayTime)}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex-1 mr-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-800'}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className={`text-xs ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{progress}% ({completedTasks}/{project.tasks.length})</span>
      </div>
      {project.memberCount > 1 && <div className="flex items-center gap-1 mt-2 text-xs text-gray-500"><Users size={12} /><span>팀 프로젝트</span></div>}
      {isCompleted && !project.report && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><FileText size={12} /><span>보고서 작성 가능</span></div>}
    </button>
  );
};

const CircularProgress = ({ progress, completedTasks, totalTasks, size = 120 }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isCompleted = progress === 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={isCompleted ? "#22C55E" : "#374151"} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isCompleted ? (<><span className="text-2xl">🎉</span><span className="text-xs text-green-600 font-medium">완료!</span></>) : (<><span className="text-2xl font-bold text-gray-900">{progress}%</span><span className="text-xs text-gray-500">{completedTasks}/{totalTasks}</span></>)}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onStartTimer, showAssignee = false, isTimerRunning, currentTaskId, elapsedTime }) => {
  const isCurrentTask = task.id === currentTaskId && isTimerRunning;
  const displayDuration = isCurrentTask ? (task.durationMs || 0) + elapsedTime : (task.durationMs || 0);

  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 ${isCurrentTask ? 'bg-red-50 -mx-2 px-2 rounded' : ''}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={() => onToggle(task.id)}>
          {task.isDone ? <CheckCircle2 size={20} className="text-gray-800" /> : <Circle size={20} className="text-gray-300" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${task.isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.content}</span>
            {isCurrentTask && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {showAssignee && task.assigneeName && <span className="text-xs text-gray-400">👤 {task.assigneeName}</span>}
            {displayDuration > 0 && <span className={`text-xs ${isCurrentTask ? 'text-red-500' : 'text-gray-400'}`}>⏱ {formatTimeShort(displayDuration)}</span>}
          </div>
        </div>
      </div>
      {!task.isDone && !isCurrentTask && <button onClick={() => onStartTimer(task)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><Play size={16} /></button>}
      {isCurrentTask && <span className="text-xs text-red-500 font-medium">측정 중</span>}
    </div>
  );
};

const MemberCard = ({ member }) => (
  <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
    <div className="w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center"><User size={20} className="text-blue-600" /></div>
    <p className="text-sm font-medium text-gray-900">{member.nickname}</p>
    <p className="text-xs font-mono text-gray-600 mt-1">{formatTime(member.timeMs)}</p>
    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gray-800 rounded-full" style={{ width: `${member.progress}%` }} /></div>
  </div>
);

const DashedLine = () => <div className="border-t border-dashed border-gray-300 my-3" />;

const ReceiptBarcode = ({ timeSlots, code }) => (
  <div className="flex flex-col items-center py-4">
    <div className="flex gap-px h-16 w-full max-w-xs">
      {timeSlots.map((active, i) => <div key={i} className={`flex-1 ${active ? 'bg-black' : 'bg-white'}`} style={{ minWidth: '1px' }} />)}
    </div>
    <p className="font-mono text-xs text-gray-600 mt-2 tracking-widest">{code}</p>
  </div>
);

// 영수증 컴포넌트 (이미지 출력용)
const ReceiptCard = React.forwardRef(({ user, archive, showDownloadButton = true, onDownload }, ref) => {
  const barcodeCode = `${formatDateFull(archive.date).replace(/-/g, '')}${String(archive.tasks.length).padStart(4, '0')}`;
  
  return (
    <div className="relative">
      <div ref={ref} className="bg-white rounded-lg shadow-sm mx-auto max-w-sm" style={{ fontFamily: 'monospace' }}>
        {/* 로고 */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center transform rotate-12"><Clock size={24} className="text-white -rotate-12" /></div>
        </div>
        
        {/* 제목 */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900">{user.nickname}'s Momento</h2>
          <p className="text-sm text-gray-500 mt-1">{formatDate(archive.date)} ({getDayName(archive.date)})</p>
        </div>
        
        <DashedLine />
        
        {/* 기록 일시 */}
        <div className="px-6 py-2"><div className="flex justify-between text-sm"><span className="text-gray-600">기록 일시</span><span className="text-gray-900">{formatDateFull(archive.date)} 23:59:59</span></div></div>
        
        <DashedLine />
        
        {/* Task 내역 헤더 */}
        <div className="px-6 py-2"><div className="flex justify-between text-xs text-gray-500 font-semibold"><span className="flex-1">Task명</span><span className="w-16 text-center">프로젝트</span><span className="w-20 text-right">소요시간</span></div></div>
        
        <div className="border-t border-dashed border-gray-300" />
        
        {/* Task 목록 */}
        <div className="px-6 py-2">
          {archive.tasks.map((t, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5">
              <span className="flex-1 text-gray-800 truncate pr-2">{t.taskName}</span>
              <span className="w-16 text-center text-gray-600 truncate text-xs">{t.projectName}</span>
              <span className="w-20 text-right font-mono text-gray-900">{formatTime(t.durationMs)}</span>
            </div>
          ))}
        </div>
        
        <DashedLine />
        
        {/* 합계 */}
        <div className="px-6 py-2"><div className="flex justify-between text-sm"><span className="text-gray-600">합계</span><span className="font-mono font-bold text-gray-900">{formatTime(archive.totalTimeMs)}</span></div></div>
        
        <DashedLine />
        
        {/* 상세 내역 */}
        <div className="px-6 py-2">
          <p className="text-xs text-gray-500 font-semibold mb-2">[상세 내역]</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">완료 Task</span><span className="text-gray-900">{archive.tasks.length}개</span></div>
            <div className="flex justify-between"><span className="text-gray-600">평균 소요시간</span><span className="font-mono text-gray-900">{formatTime(Math.floor(archive.totalTimeMs / Math.max(archive.tasks.length, 1)))}</span></div>
          </div>
        </div>
        
        <DashedLine />
        
        {/* 총 소요시간 강조 */}
        <div className="px-6 py-3"><div className="flex justify-between items-center"><span className="font-bold text-gray-900">총 소요시간</span><span className="text-2xl font-mono font-bold text-gray-900">{formatTime(archive.totalTimeMs)}</span></div></div>
        
        <DashedLine />
        
        {/* 바코드 타임라인 */}
        <div className="px-6 py-4">
          <p className="text-xs text-gray-500 mb-2 text-center">[24시간 타임라인]</p>
          <ReceiptBarcode timeSlots={archive.timeSlots} code={barcodeCode} />
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-4"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        </div>
        
        <DashedLine />
        
        {/* 하단 문구 */}
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-gray-600">오늘도 수고하셨습니다 :)</p>
          <div className="mt-2 text-xs text-gray-400"><p>• 내일도 화이팅!</p><p>• Keep tracking your time</p></div>
        </div>
        
        <div className="h-4 bg-gradient-to-b from-white to-gray-100 rounded-b-lg" />
      </div>
      
      {/* 다운로드 버튼 */}
      {showDownloadButton && (
        <button 
          onClick={onDownload}
          className="absolute top-4 right-4 p-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        >
          <Download size={18} />
        </button>
      )}
    </div>
  );
});

const FloatingTimer = ({ isRunning, elapsedTime, project, task, onStop, onExpand }) => {
  if (!isRunning) return null;
  return (
    <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40">
      <div className="bg-gray-900 text-white rounded-xl p-3 shadow-lg flex items-center justify-between">
        <button onClick={onExpand} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-3 h-3 bg-white rounded-full animate-pulse" /></div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{task?.content || '시간 측정 중'}</p>
            <p className="text-xs text-gray-400 truncate">{project?.title}</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold">{formatTimeShort(elapsedTime)}</span>
          <button onClick={onStop} className="p-2 bg-red-500 rounded-full hover:bg-red-600"><Square size={16} /></button>
        </div>
      </div>
    </div>
  );
};

const TimerSelectModal = ({ isOpen, onClose, projects, onSelectTask }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const incompleteTasks = selectedProject?.tasks.filter(t => !t.isDone) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">시간 측정 시작</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택</label>
            <div className="relative">
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white appearance-none">
                <option value="">프로젝트를 선택하세요</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title} {calculateProgress(p.tasks) === 100 ? '✓' : ''}</option>)}
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task 선택</label>
              {incompleteTasks.length > 0 ? (
                <div className="space-y-2">
                  {incompleteTasks.map(task => (
                    <button key={task.id} onClick={() => { onSelectTask(selectedProject, task); setSelectedProjectId(''); onClose(); }} className="w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.content}</p>
                        {task.durationMs > 0 && <p className="text-xs text-gray-500">누적: {formatTimeShort(task.durationMs)}</p>}
                      </div>
                      <Play size={18} className="text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500 text-center py-4">완료되지 않은 Task가 없습니다</p>}
            </div>
          )}
          {!selectedProject && <div className="text-center py-8 text-gray-400"><Clock size={48} className="mx-auto mb-2 opacity-50" /><p className="text-sm">프로젝트를 선택하면<br />Task 목록이 표시됩니다</p></div>}
        </div>
      </div>
    </div>
  );
};

const TimerFullModal = ({ isOpen, onClose, project, task, elapsedTime, onStop }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <button onClick={onClose} className="p-2"><ChevronDown size={24} className="text-gray-600" /></button>
        <span className="text-sm text-gray-500">측정 중</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-500 mb-2">{project?.title}</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">{task?.content}</h2>
        <div className="w-56 h-56 rounded-full border-4 border-red-400 flex items-center justify-center bg-red-50">
          <span className="text-5xl font-mono font-bold text-red-500">{formatTime(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-2 mt-6 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span>측정 중...</span></div>
        {task?.durationMs > 0 && <p className="text-sm text-gray-500 mt-4">이전 누적: {formatTimeShort(task.durationMs)}</p>}
        <button onClick={onStop} className="mt-12 px-12 py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2"><Square size={20} />측정 종료</button>
      </div>
    </div>
  );
};

const WriteReportModal = ({ isOpen, onClose, project, onSave }) => {
  const [rating, setRating] = useState(8);
  const [memo, setMemo] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen || !project) return null;
  const completedTasks = project.tasks.filter(t => t.isDone);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">보고서 작성</h2>
            <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl mb-2 block">🎉</span>
            <h3 className="font-semibold text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-600 mt-1">프로젝트 완료!</p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <div><p className="text-gray-500">총 시간</p><p className="font-mono font-medium">{formatTime(project.totalTimeMs)}</p></div>
              <div><p className="text-gray-500">완료 Task</p><p className="font-medium">{completedTasks.length}개</p></div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">평가</label>
            <div className="flex items-center justify-center gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(star => (
                <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} className="p-1">
                  <Star size={24} className={`transition-colors ${star <= (hoveredStar || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-lg font-bold text-gray-900">{rating}/10</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">완료한 Task ({completedTasks.length})</label>
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-1.5 text-sm">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /><span className="text-gray-700 truncate">{task.content}</span></div>
                  {task.durationMs > 0 && <span className="text-xs text-gray-400">{formatTimeShort(task.durationMs)}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">회고 메모 (선택)</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="이 프로젝트를 하면서 느낀 점..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none h-24" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600">나중에</button>
            <button onClick={() => { onSave({ rating, memo, createdAt: new Date(), totalTimeMs: project.totalTimeMs, completedTasks: completedTasks.length }); setRating(8); setMemo(''); onClose(); }} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium">저장하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isTeam, setIsTeam] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">새 프로젝트</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onCreate({ id: generateId(), title: title.trim(), totalTimeMs: 0, dueDate: dueDate ? new Date(dueDate) : null, memberCount: isTeam ? 2 : 1, report: null, members: isTeam ? [{ id: 'm1', nickname: sampleUser.nickname, timeMs: 0, progress: 0 }] : undefined, tasks: [] }); setTitle(''); setDueDate(''); setIsTeam(false); onClose(); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 해석학 공부" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400" autoFocus />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">마감일 (선택)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-gray-800 focus:ring-gray-400" />
              <span className="text-sm text-gray-700">팀 프로젝트</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600">취소</button>
            <button type="submit" disabled={!title.trim()} className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300">생성</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAdd, members }) => {
  const [content, setContent] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">새 Task</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!content.trim()) return; const assignee = members?.find(m => m.id === assigneeId); onAdd({ id: generateId(), content: content.trim(), isDone: false, durationMs: 0, assigneeId: assigneeId || undefined, assigneeName: assignee?.nickname || undefined }); setContent(''); setAssigneeId(''); onClose(); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task 내용 *</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="예: 수업 복습하기" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400" autoFocus />
          </div>
          {members && members.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">담당자 (선택)</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white">
                <option value="">담당자 없음</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.nickname}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600">취소</button>
            <button type="submit" disabled={!content.trim()} className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300">추가</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// 페이지 컴포넌트들
// ============================================

const MainPage = ({ user, totalTimeMs, projects, onProjectClick, onStartTimer, onCreateProject, isTimerRunning, currentProjectId, elapsedTime, currentTask, onTimerClick, onToggleDailyTask, onStartDailyTaskTimer }) => {
  const todayTasks = getTodayTasks(projects);
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-light text-gray-900"><span className="font-semibold">{user.nickname}</span>'s Momento.</h1>
      </div>
      <TotalTimeDisplay timeMs={totalTimeMs + (isTimerRunning ? elapsedTime : 0)} isRunning={isTimerRunning} currentTask={currentTask} onTimerClick={onTimerClick} />
      <DailyTodoSection todayTasks={todayTasks} onToggle={onToggleDailyTask} onStartTimer={onStartDailyTaskTimer} />
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-600">프로젝트 ({projects.length})</span></div>
        <div className="space-y-2">
          {projects.map(project => <MainProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} isTimerRunning={isTimerRunning} currentProjectId={currentProjectId} elapsedTime={elapsedTime} />)}
          <button onClick={onCreateProject} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600"><Plus size={18} />새 프로젝트</button>
        </div>
      </div>
      {!isTimerRunning && projects.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-md mx-auto">
          <button onClick={onStartTimer} className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"><Play size={20} />시간 측정 시작</button>
        </div>
      )}
    </div>
  );
};

const PersonalProjectPage = ({ project, onBack, onToggleTask, onStartTaskTimer, onAddTask, isTimerRunning, currentTaskId, elapsedTime, onWriteReport }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const isCompleted = progress === 100;
  const currentTaskInProject = project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning ? project.totalTimeMs + elapsedTime : project.totalTimeMs;

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button>
        <div className="text-center">
          <h1 className="font-semibold text-gray-900">{project.title}</h1>
          <span className={`text-sm font-mono ${currentTaskInProject && isTimerRunning ? 'text-red-500' : 'text-gray-600'}`}>{formatTime(displayTotalTime)}</span>
        </div>
        <div className="w-6" />
      </div>
      {project.dueDate && <div className="px-4 py-2 text-sm text-gray-600">Due date: ~ {formatDate(project.dueDate)}</div>}
      <div className="flex justify-center py-6"><CircularProgress progress={progress} completedTasks={completedTasks} totalTasks={project.tasks.length} /></div>
      {isCompleted && !project.report && (
        <div className="px-4 pb-4">
          <button onClick={onWriteReport} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"><FileText size={18} />보고서 작성하기</button>
        </div>
      )}
      {project.report && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600" /><span className="text-sm text-green-700">보고서 작성 완료</span></div>
            <div className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium text-gray-700">{project.report.rating}/10</span></div>
          </div>
        </div>
      )}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-600">Task ({completedTasks}/{project.tasks.length})</span></div>
        <div className="bg-gray-50 rounded-lg p-4">
          {project.tasks.length > 0 ? project.tasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggleTask} onStartTimer={onStartTaskTimer} isTimerRunning={isTimerRunning} currentTaskId={currentTaskId} elapsedTime={elapsedTime} />) : <p className="text-sm text-gray-400 text-center py-4">Task가 없습니다</p>}
          <button onClick={onAddTask} className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600"><Plus size={16} />Task 추가</button>
        </div>
      </div>
    </div>
  );
};

const TeamProjectPage = ({ project, onBack, onToggleTask, onStartTaskTimer, onAddTask, isTimerRunning, currentTaskId, elapsedTime, onWriteReport }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const isCompleted = progress === 100;
  const currentTaskInProject = project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning ? project.totalTimeMs + elapsedTime : project.totalTimeMs;

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button>
        <div className="text-center">
          <h1 className="font-semibold text-gray-900">{project.title}</h1>
          <span className={`text-sm font-mono ${currentTaskInProject && isTimerRunning ? 'text-red-500' : 'text-gray-600'}`}>{formatTime(displayTotalTime)}</span>
        </div>
        <button className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">+ 팀원</button>
      </div>
      <div className="px-4 py-2 flex items-center gap-2 text-gray-600"><span>Team:</span><Users size={16} /><span className="text-sm">{project.members?.length || project.memberCount}명</span></div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-600">전체 진행률</span><span className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>{progress}% ({completedTasks}/{project.tasks.length})</span></div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-800'}`} style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="px-4 py-4"><div className="flex gap-3">{project.members?.map(m => <MemberCard key={m.id} member={m} />)}</div></div>
      {isCompleted && !project.report && (
        <div className="px-4 pb-4">
          <button onClick={onWriteReport} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"><FileText size={18} />보고서 작성하기</button>
        </div>
      )}
      {project.report && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600" /><span className="text-sm text-green-700">보고서 작성 완료</span></div>
            <div className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium text-gray-700">{project.report.rating}/10</span></div>
          </div>
        </div>
      )}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-600">Task ({completedTasks}/{project.tasks.length})</span></div>
        <div className="bg-gray-50 rounded-lg p-4">
          {project.tasks.length > 0 ? project.tasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggleTask} onStartTimer={onStartTaskTimer} showAssignee isTimerRunning={isTimerRunning} currentTaskId={currentTaskId} elapsedTime={elapsedTime} />) : <p className="text-sm text-gray-400 text-center py-4">Task가 없습니다</p>}
          <button onClick={onAddTask} className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600"><Plus size={16} />Task 추가</button>
        </div>
      </div>
    </div>
  );
};

const ReportPage = ({ projects, onBack }) => {
  const completedProjects = projects.filter(p => p.report);
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button>
        <h1 className="font-semibold text-gray-900">보고서</h1>
        <div className="w-6" />
      </div>
      <div className="px-4 py-4">
        {completedProjects.length > 0 ? (
          <div className="space-y-4">
            {completedProjects.map(p => (
              <div key={p.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <div className="flex items-center gap-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /><span className="font-medium">{p.report.rating}/10</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><p className="text-xs text-gray-500">총 소요시간</p><p className="font-mono font-medium">{formatTime(p.report.totalTimeMs)}</p></div>
                  <div><p className="text-xs text-gray-500">완료 Task</p><p className="font-medium">{p.report.completedTasks}개</p></div>
                </div>
                {p.report.memo && <div className="bg-white rounded-lg p-3 text-sm text-gray-600">{p.report.memo}</div>}
                <p className="text-xs text-gray-400 mt-2">{formatDate(p.report.createdAt)} 작성</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>작성된 보고서가 없습니다</p>
            <p className="text-sm mt-1">프로젝트를 100% 완료하면<br />보고서를 작성할 수 있습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 주간 아카이브 슬라이드뷰
// ============================================

const WeeklyArchivePage = ({ user, weeklyData, onBack, onViewMonthly }) => {
  const [currentIndex, setCurrentIndex] = useState(6); // 가장 최근 날짜부터 시작
  const scrollContainerRef = useRef(null);
  const receiptRefs = useRef([]);
  
  const totalWeekTime = weeklyData.reduce((sum, d) => sum + d.totalTimeMs, 0);
  
  // 이미지로 저장하는 함수 (실제 구현은 html2canvas 라이브러리 필요)
  const handleDownload = async (index) => {
    const element = receiptRefs.current[index];
    if (!element) return;
    
    // 실제 앱에서는 html2canvas를 사용
    // 여기서는 알림으로 대체
    alert(`${formatDate(weeklyData[index].date)} 영수증 이미지 저장!\n\n실제 구현시 html2canvas 라이브러리를 사용하여 PNG로 저장됩니다.`);
  };
  
  // 스크롤 시 현재 인덱스 업데이트
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85;
    const gap = 16;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < weeklyData.length) {
      setCurrentIndex(newIndex);
    }
  };
  
  // 특정 인덱스로 스크롤
  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.offsetWidth * 0.85;
    const gap = 16;
    container.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button>
        <h1 className="font-semibold text-gray-900">주간 아카이브</h1>
        <div className="w-6" />
      </div>
      
      {/* 주간 요약 */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">이번 주 총 시간</span>
          <span className="font-mono font-bold text-xl text-gray-900">{formatTime(totalWeekTime)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDateShort(weeklyData[0].date)} ~ {formatDateShort(weeklyData[6].date)}</span>
          <span>일 평균 {formatTime(Math.floor(totalWeekTime / 7))}</span>
        </div>
      </div>
      
      {/* 날짜 네비게이션 */}
      <div className="bg-white px-2 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {weeklyData.map((day, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all ${
                currentIndex === index 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs">{getDayName(day.date)}</span>
              <span className={`text-sm font-medium ${currentIndex === index ? 'text-white' : ''}`}>
                {new Date(day.date).getDate()}
              </span>
              {day.totalTimeMs > 0 && currentIndex !== index && (
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 슬라이드 영수증 카드 */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 py-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {weeklyData.map((archive, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 snap-center"
            style={{ width: '85%' }}
          >
            <ReceiptCard
              ref={(el) => receiptRefs.current[index] = el}
              user={user}
              archive={archive}
              showDownloadButton={true}
              onDownload={() => handleDownload(index)}
            />
          </div>
        ))}
      </div>
      
      {/* 페이지 인디케이터 */}
      <div className="flex justify-center gap-1.5 py-2">
        {weeklyData.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === index 
                ? 'w-6 bg-gray-900' 
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* 하단 버튼 */}
      <div className="px-4 pt-2 space-y-2">
        <button 
          onClick={() => handleDownload(currentIndex)}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Download size={18} />
          현재 영수증 이미지 저장
        </button>
        <button 
          onClick={onViewMonthly}
          className="w-full py-3 border border-gray-300 bg-white rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          월간 아카이브 보기
        </button>
      </div>
    </div>
  );
};

const MonthlyArchivePage = ({ onBack, user }) => {
  const [selectedDate, setSelectedDate] = useState(9);
  const days = Array.from({ length: 31 }, (_, i) => { const hasData = Math.random() > 0.3; return { day: i + 1, hasData, intensity: hasData ? Math.random() : 0, timeMs: hasData ? Math.floor(Math.random() * 36000000) : 0 }; });
  const selectedDayData = days.find(d => d.day === selectedDate);
  const selectedTimeSlots = generateTimeSlots(selectedDate);

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200"><button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button><h1 className="font-semibold text-gray-900">월간 아카이브</h1><div className="w-6" /></div>
      
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mx-auto max-w-sm" style={{ fontFamily: 'monospace' }}>
          {/* 로고 */}
          <div className="flex justify-center pt-6 pb-2"><div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center transform rotate-12"><Calendar size={24} className="text-white -rotate-12" /></div></div>
          
          {/* 월 선택 */}
          <div className="flex items-center justify-center gap-6 py-4"><button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-gray-600" /></button><span className="font-bold text-lg text-gray-900">2026년 1월</span><button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} className="text-gray-600" /></button></div>
          
          <DashedLine />
          
          {/* 캘린더 */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-7 gap-1 mb-2">{['일','월','화','수','목','금','토'].map((d, i) => <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(3)].map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
              {days.map(({ day, hasData, intensity }) => {
                const isSelected = selectedDate === day, isToday = day === 9;
                return <button key={day} onClick={() => setSelectedDate(day)} className={`aspect-square rounded flex flex-col items-center justify-center text-xs transition-all ${isSelected ? 'bg-gray-900 text-white' : isToday ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' : 'hover:bg-gray-100 text-gray-700'}`}><span className={isSelected ? 'font-bold' : ''}>{day}</span>{hasData && !isSelected && <div className="w-1 h-2 bg-gray-400 rounded-full mt-0.5" style={{ opacity: 0.3 + intensity * 0.7 }} />}</button>;
              })}
            </div>
          </div>
          
          <DashedLine />
          
          {/* 선택된 날짜 상세 */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">[선택한 날짜]</p>
            <div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-900">2026.1.{selectedDate}.</span>{selectedDayData?.hasData && <span className="font-mono text-lg font-bold text-gray-900">{formatTime(selectedDayData.timeMs)}</span>}</div>
            {selectedDayData?.hasData ? (
              <>
                <p className="text-xs text-gray-500 mb-2">09:10:00 ~ 18:30:00</p>
                <div className="flex gap-px h-8 bg-gray-100 rounded overflow-hidden">{selectedTimeSlots.map((active, i) => <div key={i} className={`flex-1 ${active ? 'bg-gray-900' : 'bg-white'}`} style={{ minWidth: '1px' }} />)}</div>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
              </>
            ) : <div className="text-center py-4 text-gray-400"><p className="text-sm">기록 없음</p></div>}
          </div>
          
          <DashedLine />
          
          <div className="px-6 py-4 text-center"><p className="text-sm text-gray-600">날짜를 선택하면 상세 기록을 볼 수 있습니다</p></div>
          <div className="h-4 bg-gradient-to-b from-white to-gray-100 rounded-b-lg" />
        </div>
      </div>
      
      {selectedDayData?.hasData && <div className="px-4"><button className="w-full py-3 border border-gray-300 bg-white rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2"><FileText size={18} />{selectedDate}일 상세 기록 보기</button></div>}
    </div>
  );
};

const BottomNav = ({ activeTab, onTabChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto z-30">
    <div className="flex justify-around py-3">
      {[{ key: 'main', icon: Clock, label: '메인' }, { key: 'report', icon: BarChart3, label: '보고서' }, { key: 'archive', icon: Calendar, label: '아카이브' }].map(({ key, icon: Icon, label }) => <button key={key} onClick={() => onTabChange(key)} className={`flex flex-col items-center px-4 py-1 ${activeTab === key ? 'text-gray-900' : 'text-gray-400'}`}><Icon size={22} /><span className="text-xs mt-1">{label}</span></button>)}
    </div>
  </div>
);

// ============================================
// 메인 앱
// ============================================
export default function MomentoApp() {
  const [activeTab, setActiveTab] = useState('main');
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [archiveView, setArchiveView] = useState('weekly'); // 'weekly' | 'monthly'

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimerSelect, setShowTimerSelect] = useState(false);
  const [showTimerFull, setShowTimerFull] = useState(false);
  const [showWriteReport, setShowWriteReport] = useState(false);

  const totalTimeMs = projects.reduce((sum, p) => sum + p.totalTimeMs, 0);

  useEffect(() => {
    let interval;
    if (isTimerRunning) { interval = setInterval(() => setElapsedTime(prev => prev + 1000), 1000); }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleDailyTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t) }));
  };

  const handleStartDailyTaskTimer = (task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (project) { setCurrentProject(project); setCurrentTask(task); setElapsedTime(0); setIsTimerRunning(true); }
  };

  const handleToggleTask = (taskId) => {
    if (selectedProject) {
      const updateTasks = (p) => ({ ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t) });
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updateTasks(p) : p));
      setSelectedProject(prev => updateTasks(prev));
    }
  };

  const handleCreateProject = (newProject) => setProjects(prev => [...prev, newProject]);

  const handleAddTask = (newTask) => {
    if (selectedProject) {
      const updateTasks = (p) => ({ ...p, tasks: [...p.tasks, newTask] });
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updateTasks(p) : p));
      setSelectedProject(prev => updateTasks(prev));
    }
  };

  const handleStartTimerWithTask = (project, task) => { setCurrentProject(project); setCurrentTask(task); setElapsedTime(0); setIsTimerRunning(true); };

  const handleStartTaskTimer = (task) => { if (selectedProject) handleStartTimerWithTask(selectedProject, task); };

  const handleStopTimer = () => {
    if (currentProject && currentTask && elapsedTime > 0) {
      setProjects(prev => prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedTasks = p.tasks.map(t => t.id !== currentTask.id ? t : { ...t, durationMs: (t.durationMs || 0) + elapsedTime });
        return { ...p, tasks: updatedTasks, totalTimeMs: p.totalTimeMs + elapsedTime };
      }));
      if (selectedProject && selectedProject.id === currentProject.id) {
        setSelectedProject(prev => {
          const updatedTasks = prev.tasks.map(t => t.id !== currentTask.id ? t : { ...t, durationMs: (t.durationMs || 0) + elapsedTime });
          return { ...prev, tasks: updatedTasks, totalTimeMs: prev.totalTimeMs + elapsedTime };
        });
      }
    }
    setIsTimerRunning(false); setElapsedTime(0); setCurrentProject(null); setCurrentTask(null); setShowTimerFull(false);
  };

  const handleSaveReport = (reportData) => {
    if (selectedProject) {
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, report: reportData } : p));
      setSelectedProject(prev => ({ ...prev, report: reportData }));
    }
  };

  const renderContent = () => {
    if (selectedProject) {
      const Page = selectedProject.memberCount > 1 ? TeamProjectPage : PersonalProjectPage;
      return <Page project={selectedProject} onBack={() => setSelectedProject(null)} onToggleTask={handleToggleTask} onStartTaskTimer={handleStartTaskTimer} onAddTask={() => setShowAddTask(true)} isTimerRunning={isTimerRunning} currentTaskId={currentTask?.id} elapsedTime={elapsedTime} onWriteReport={() => setShowWriteReport(true)} />;
    }
    switch (activeTab) {
      case 'main': return <MainPage user={sampleUser} totalTimeMs={totalTimeMs} projects={projects} onProjectClick={setSelectedProject} onStartTimer={() => setShowTimerSelect(true)} onCreateProject={() => setShowCreateProject(true)} isTimerRunning={isTimerRunning} currentProjectId={currentProject?.id} elapsedTime={elapsedTime} currentTask={currentTask} onTimerClick={() => isTimerRunning && setShowTimerFull(true)} onToggleDailyTask={handleToggleDailyTask} onStartDailyTaskTimer={handleStartDailyTaskTimer} />;
      case 'report': return <ReportPage projects={projects} onBack={() => setActiveTab('main')} />;
      case 'archive': return archiveView === 'monthly' 
        ? <MonthlyArchivePage onBack={() => setArchiveView('weekly')} user={sampleUser} /> 
        : <WeeklyArchivePage user={sampleUser} weeklyData={weeklyArchiveData} onBack={() => setActiveTab('main')} onViewMonthly={() => setArchiveView('monthly')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if (tab === 'archive') setArchiveView('weekly'); }} />
      <FloatingTimer isRunning={isTimerRunning} elapsedTime={elapsedTime} project={currentProject} task={currentTask} onStop={handleStopTimer} onExpand={() => setShowTimerFull(true)} />
      <TimerFullModal isOpen={showTimerFull} onClose={() => setShowTimerFull(false)} project={currentProject} task={currentTask} elapsedTime={elapsedTime} onStop={handleStopTimer} />
      <TimerSelectModal isOpen={showTimerSelect} onClose={() => setShowTimerSelect(false)} projects={projects} onSelectTask={handleStartTimerWithTask} />
      <CreateProjectModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} onCreate={handleCreateProject} />
      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} onAdd={handleAddTask} members={selectedProject?.members} />
      <WriteReportModal isOpen={showWriteReport} onClose={() => setShowWriteReport(false)} project={selectedProject} onSave={handleSaveReport} />
      
      {/* 스크롤바 숨기기 스타일 */}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
