import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, ChevronLeft, ChevronRight, Users, User, Calendar, CheckCircle2, Circle, Clock, BarChart3, X, ChevronDown, FileText, Star, Download, Image } from 'lucide-react';
import { projectAPI, taskAPI, timerAPI, archiveAPI, reportAPI } from './src/api.js';

// ============================================
// 샘플 데이터
// ============================================
const initialUser = {
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
      { id: 't1', content: '25.10.12. 수업 복습', isDone: false, durationMs: 0 },
      { id: 't2', content: 'Quiz 복습 공부', isDone: false, durationMs: 0 },
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
      { id: 'm1', nickname: 'Hanjin', timeMs: 0, progress: 0 },
      { id: 'm2', nickname: '안준영', timeMs: 0, progress: 0 },
    ],
    tasks: [
      { id: 't1', content: 'Figma로 디자인', isDone: false, durationMs: 0, assigneeId: 'm1', assigneeName: 'Hanjin' },
      { id: 't2', content: 'DB에 → Root', isDone: false, durationMs: 0, assigneeId: 'm1', assigneeName: 'Hanjin' },
      { id: 't3', content: 'DB Schema 제작', isDone: false, durationMs: 0, assigneeId: 'm2', assigneeName: '안준영' },
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

// 7일치 샘플 데이터 생성 (월요일부터 일요일)
const generateWeeklyArchive = (targetDate = null) => {
  // targetDate가 없으면 오늘 날짜 사용
  const baseDate = targetDate ? new Date(targetDate) : new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  // baseDate가 월요일이 아니면 가장 가까운 월요일로 조정
  const dayOfWeek = baseDate.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  const mondayDate = new Date(baseDate);
  // 일요일(0)인 경우 -6일, 월요일(1)인 경우 -0일, 화요일(2)인 경우 -1일, ...
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  mondayDate.setDate(baseDate.getDate() + offset);
  
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

  // 월요일부터 일요일까지 (0=월, 1=화, ..., 6=일)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
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
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatTimeShort = (ms) => {
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

const formatDate = (date) => date ? `${new Date(date).getFullYear()}.${new Date(date).getMonth() + 1}.${new Date(date).getDate()}.` : '';
const formatDateFull = (date) => date ? `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, '0')}-${String(new Date(date).getDate()).padStart(2, '0')}` : '';
const formatDateShort = (date) => date ? `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}` : '';
const getDayName = (date) => ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];

const calculateProgress = (tasks) => tasks?.length ? Math.round((tasks.filter(t => t.isDone).length / tasks.length) * 100) : 0;
const generateId = () => Math.random().toString(36).substr(2, 9);
const getTodayTasks = (projects, currentUser) => {
  const t = [];
  projects.forEach(p => {
    // 개인 프로젝트는 모든 Task 포함, 팀 프로젝트는 할당된 Task만 포함
    const filteredTasks = p.tasks.filter(task => {
      if (task.isDone) return false;
      
      // 팀 프로젝트인 경우 할당자 체크
      if (p.memberCount > 1 && p.members) {
        // 현재 사용자가 이 프로젝트의 멤버인지 확인
        // 멤버 목록에서 현재 사용자의 nickname 또는 id로 찾기
        const currentMember = p.members.find(m => 
          m.nickname === currentUser?.nickname || 
          m.id === currentUser?.id ||
          // 또는 멤버의 userId가 현재 사용자 id와 일치하는 경우
          (m.userId && m.userId === currentUser?.id)
        );
        
        if (currentMember) {
          // 현재 사용자가 멤버인 경우, 해당 멤버에게 할당된 Task만 표시
          return task.assigneeId === currentMember.id;
        }
        
        // 현재 사용자가 멤버가 아니면 Task 표시 안 함
        return false;
      }
      
      // 개인 프로젝트는 모든 Task 표시
      return true;
    });
    
    filteredTasks.forEach(task => 
      t.push({ ...task, projectId: p.id, projectTitle: p.title })
    );
  });
  return t;
};

// 오늘의 아카이브 데이터 생성 (실시간 업데이트)
const generateTodayArchive = (projects, currentProject, currentTask, elapsedTime) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasks = [];
  projects.forEach(project => {
    project.tasks.forEach(task => {
      let taskDuration = task.durationMs || 0;
      
      // 현재 실행 중인 작업이면 elapsedTime 추가
      if (currentProject?.id === project.id && currentTask?.id === task.id && elapsedTime > 0) {
        taskDuration += elapsedTime;
      }
      
      // durationMs가 0보다 큰 경우 모두 추가 (완료 여부와 관계없이)
      if (taskDuration > 0) {
        tasks.push({
          taskName: task.content,
          projectName: project.title,
          durationMs: taskDuration
        });
      }
    });
  });
  
  const totalTimeMs = tasks.reduce((sum, t) => sum + t.durationMs, 0);
  const dayOfWeek = today.getDay();
  
  // 실시간 타임슬롯 생성 (실제 작업한 시간대만 반영)
  // 144개 슬롯 = 24시간 * 6 (10분 단위)
  const timeSlots = new Array(144).fill(false);
  
  // 현재 실제 시간 계산
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();
  const currentSlotIndex = Math.min(Math.floor((currentHours * 60 + currentMins) / 10), 143);
  
  if (tasks.length > 0) {
    tasks.forEach((task) => {
      // 현재 실행 중인 작업인지 확인
      const isCurrentRunningTask = currentProject && currentTask && 
          task.taskName === currentTask.content && 
          task.projectName === currentProject.title &&
          elapsedTime > 0;
      
      if (isCurrentRunningTask) {
        // 현재 실행 중인 작업: 실제 시간대에 표시
        // 현재 시간에서 경과 시간을 빼서 시작 시간 계산
        const currentTimeInMinutes = currentHours * 60 + currentMins;
        const elapsedMinutes = Math.floor(elapsedTime / 60000);
        const startMinutes = currentTimeInMinutes - elapsedMinutes;
        
        // 시작 슬롯과 종료 슬롯 계산
        const startSlot = Math.max(0, Math.floor(startMinutes / 10));
        const endSlot = Math.min(currentSlotIndex, 143);
        const slotsNeeded = endSlot - startSlot + 1;
        
        // 실제 시간대에 슬롯 채우기 (시작 시간부터 현재 시간까지)
        for (let i = 0; i < slotsNeeded && (startSlot + i) < 144; i++) {
          timeSlots[startSlot + i] = true;
        }
      } else {
        // 완료된 작업: Task의 startTime과 endTime 또는 durationMs를 기반으로 바코드 생성
        // 프로젝트에서 실제 Task 객체 찾기
        let actualTask = null;
        projects.forEach(p => {
          const found = p.tasks.find(t => t.content === task.taskName && p.title === task.projectName);
          if (found) actualTask = found;
        });
        
        if (actualTask && task.durationMs > 0) {
          let startSlot, endSlot;
          
          // startTime과 endTime이 있으면 정확하게 계산
          if (actualTask.startTime && actualTask.endTime) {
            const startDate = new Date(actualTask.startTime);
            const endDate = new Date(actualTask.endTime);
            const startHours = startDate.getHours();
            const startMins = startDate.getMinutes();
            const endHours = endDate.getHours();
            const endMins = endDate.getMinutes();
            
            startSlot = Math.max(0, Math.floor((startHours * 60 + startMins) / 10));
            endSlot = Math.min(Math.floor((endHours * 60 + endMins) / 10), 143);
          } else {
            // startTime/endTime이 없으면 durationMs를 기반으로 현재 시간에서 역산
            const taskDurationMinutes = Math.floor(task.durationMs / 60000);
            const endMinutes = currentHours * 60 + currentMins;
            const startMinutes = endMinutes - taskDurationMinutes;
            
            startSlot = Math.max(0, Math.floor(startMinutes / 10));
            endSlot = Math.min(Math.floor(endMinutes / 10), 143);
          }
          
          // 시간대에 슬롯 채우기
          for (let i = startSlot; i <= endSlot && i < 144; i++) {
            timeSlots[i] = true;
          }
        }
      }
    });
  }
  
  return {
    date: today,
    tasks,
    totalTimeMs,
    timeSlots
  };
};

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
        <div className="px-6 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">기록 일시</span>
            <span className="text-gray-900">
              {archive.recordedAt 
                ? (() => {
                    const recorded = new Date(archive.recordedAt);
                    const hours = String(recorded.getHours()).padStart(2, '0');
                    const minutes = String(recorded.getMinutes()).padStart(2, '0');
                    const seconds = String(recorded.getSeconds()).padStart(2, '0');
                    return `${formatDateFull(archive.date)} ${hours}:${minutes}:${seconds}`;
                  })()
                : `${formatDateFull(archive.date)} 23:59:59`
              }
            </span>
          </div>
        </div>
        
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

// ============================================
// 컴포넌트들
// ============================================

const TotalTimeDisplay = ({ timeMs, isRunning, currentTask, onTimerClick }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 192; // w-48 = 192px
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const drawWave = (t) => {
      ctx.clearRect(0, 0, size, size);
      
      // 원형 마스크
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.clip();

      // 배경
      ctx.fillStyle = isRunning ? '#E8F4FD' : '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // 파도 그리기 - 아래에서 위로 채워지는 방식
      const baseY = size * 0.55; // 파도 시작 위치 (중앙 아래)
      const amplitude = 30;
      const frequency = 0.02;
      const speed = 0.06; // 파도 속도 (기존 0.12에서 절반으로 감소)

      // 첫 번째 파도 (가장 큰 파도)
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + amplitude * Math.sin((x * frequency) + (t * speed));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = isRunning ? 'rgba(124, 185, 232, 0.5)' : 'rgba(234, 179, 8, 0.45)';
      ctx.fill();

      // 두 번째 파도 (중간 크기)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 5);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 5 + amplitude * 0.9 * Math.sin((x * frequency * 1.15) + (t * speed * 1.4) + Math.PI / 3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = isRunning ? 'rgba(124, 185, 232, 0.45)' : 'rgba(234, 179, 8, 0.4)';
      ctx.fill();

      // 세 번째 파도 (작은 파도)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 12);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 12 + amplitude * 0.75 * Math.sin((x * frequency * 0.85) + (t * speed * 0.85) + Math.PI / 1.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = isRunning ? 'rgba(124, 185, 232, 0.4)' : 'rgba(234, 179, 8, 0.35)';
      ctx.fill();

      // 네 번째 파도 (가장 작은 파도, 디테일)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 20);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 20 + amplitude * 0.6 * Math.sin((x * frequency * 1.3) + (t * speed * 1.1) + Math.PI);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = isRunning ? 'rgba(124, 185, 232, 0.3)' : 'rgba(234, 179, 8, 0.25)';
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      timeRef.current += 1;
      drawWave(timeRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  return (
  <div className="flex flex-col items-center py-8">
      <button onClick={onTimerClick} className={`relative w-48 h-48 rounded-full border-4 ${isRunning ? 'border-[#7CB9E8]' : 'border-gray-300'} flex items-center justify-center shadow-inner transition-all hover:shadow-md overflow-hidden`} style={{ background: 'transparent' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: '50%', zIndex: 0 }} />
        {isRunning && <div className="absolute inset-0 rounded-full border-4 border-[#7CB9E8] animate-pulse z-10 pointer-events-none" />}
        <div className="flex flex-col items-center relative z-30">
          <span className="text-3xl font-mono font-bold text-gray-900">{formatTime(timeMs)}</span>
        {isRunning && currentTask && <span className="text-xs text-gray-500 mt-2 max-w-32 truncate">{currentTask.content}</span>}
      </div>
    </button>
      {isRunning && <div className="flex items-center gap-2 mt-4 text-[#7CB9E8]"><div className="w-2 h-2 bg-[#7CB9E8] rounded-full animate-pulse" /><span className="text-sm font-medium">측정 중...</span></div>}
  </div>
);
};

const DailyTodoSection = ({ todayTasks, onToggle, onStartTimer, isTimerRunning, currentTaskId, currentProjectId, elapsedTime }) => {
  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">Daily Todo ({todayTasks.length})</h3>
      {todayTasks.length > 0 ? (
        <div className="space-y-2">
          {todayTasks.slice(0, 5).map(task => {
            // 프로젝트 ID와 Task ID를 모두 비교
            const isCurrentTask = task.projectId === currentProjectId && task.id === currentTaskId && isTimerRunning;
            const displayDuration = isCurrentTask ? (task.durationMs || 0) + elapsedTime : (task.durationMs || 0);
            return (
              <div key={`${task.projectId}-${task.id}`} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button onClick={() => onToggle(task.projectId, task.id)}><Circle size={18} className="text-gray-400" /></button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block truncate text-gray-800">{task.content}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{task.projectTitle}</span>
                      {displayDuration > 0 && (
                        <span className={`text-xs font-mono ${isCurrentTask ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                          ⏱ {formatTimeShort(displayDuration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => onStartTimer(task)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><Play size={14} /></button>
              </div>
            );
          })}
        </div>
      ) : <div className="text-center py-4 text-gray-400 text-sm">🎉 오늘 할 일을 모두 완료했습니다!</div>}
    </div>
  );
};

const MainProjectCard = ({ project, onClick, isTimerRunning, currentProjectId, elapsedTime }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const displayTime = project.id === currentProjectId ? project.totalTimeMs + elapsedTime : project.totalTimeMs;
  const isCurrentProject = project.id === currentProjectId && isTimerRunning;
  const isCompleted = progress === 100;

  return (
    <button onClick={onClick} className={`w-full bg-white border rounded-lg p-3 text-left hover:bg-gray-50 transition-colors ${isCurrentProject ? 'border-[#7CB9E8] bg-[#E8F4FD]' : isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted && <span className="text-green-500">✓</span>}
          <span className="font-medium text-gray-900">{project.title}</span>
          {isCurrentProject && <div className="w-2 h-2 bg-[#7CB9E8] rounded-full animate-pulse" />}
        </div>
        <span className={`font-mono text-sm ${isCurrentProject ? 'text-gray-900' : 'text-gray-600'}`}>{formatTime(displayTime)}</span>
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
    </button>
  );
};

const CircularProgress = ({ progress, completedTasks, totalTasks, size = 120 }) => {
  const radius = (size - 16) / 2, circumference = 2 * Math.PI * radius, offset = circumference - (progress / 100) * circumference, isCompleted = progress === 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={isCompleted ? "#22C55E" : "#374151"} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isCompleted ? <><span className="text-2xl">🎉</span><span className="text-xs text-green-600 font-medium">완료!</span></> : <><span className="text-2xl font-bold text-gray-900">{progress}%</span><span className="text-xs text-gray-500">{completedTasks}/{totalTasks}</span></>}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onStartTimer, showAssignee = false, isTimerRunning, currentTaskId, currentProjectId, elapsedTime, isTeamProject = false, projectId }) => {
  // 프로젝트 ID와 Task ID를 모두 비교하여 정확한 Task 확인
  const isCurrentTask = projectId === currentProjectId && task.id === currentTaskId && isTimerRunning;
  const displayDuration = isCurrentTask ? (task.durationMs || 0) + elapsedTime : (task.durationMs || 0);
  
  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 transition-all duration-300 ${
      isCurrentTask 
        ? 'bg-gradient-to-r from-orange-50 to-yellow-50 -mx-2 px-2 rounded shadow-sm border-orange-200' 
        : ''
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={() => onToggle(task.id)}>{task.isDone ? <CheckCircle2 size={20} className="text-gray-800" /> : <Circle size={20} className="text-gray-300" />}</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${task.isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {task.content}
            </span>
            {isCurrentTask && (
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse flex-shrink-0" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {showAssignee && task.assigneeName && (
              <span className="text-xs text-gray-400">
                👤 {task.assigneeName}
              </span>
            )}
            {displayDuration > 0 && (
              <span className={`text-xs font-mono ${isCurrentTask ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                ⏱ {formatTimeShort(displayDuration)}
              </span>
            )}
          </div>
        </div>
      </div>
      {!task.isDone && !isCurrentTask && (
        <button
          onClick={() => onStartTimer(task)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <Play size={16} />
        </button>
      )}
      {isCurrentTask && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          <span className="text-xs text-orange-600 font-semibold">측정 중</span>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, project, currentTask, elapsedTime, isActive }) => {
  // 해당 멤버에게 할당된 Task들의 시간 합계 계산
  // project?.tasks가 없으면 빈 배열, 있으면 필터링
  const memberTasks = project?.tasks?.filter(t => t.assigneeId === member.id) || [];
  
  // 현재 실행 중인 Task가 이 멤버에게 할당되어 있는지 확인
  const isCurrentTaskAssigned = currentTask && currentTask.assigneeId === member.id;
  
  // 멤버의 총 시간 계산 (실시간 반영)
  const memberTimeMs = memberTasks.reduce((sum, task) => {
    let taskDuration = task.durationMs || 0;
    // 현재 실행 중인 Task이고 이 멤버에게 할당된 경우 elapsedTime 추가
    if (isCurrentTaskAssigned && currentTask && currentTask.id === task.id && elapsedTime >= 0) {
      taskDuration += elapsedTime;
    }
    return sum + taskDuration;
  }, 0);
  
  // 진행률 계산 (완료된 Task / 전체 Task)
  const completedTasks = memberTasks.filter(t => t.isDone).length;
  const memberProgress = memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0;
  
  // 실시간 업데이트를 위해 항상 계산된 값을 사용
  // 현재 실행 중인 Task가 이 멤버에게 할당되어 있으면 무조건 계산된 값 사용
  // 그렇지 않으면 계산된 값이 0보다 크면 사용, 아니면 member.timeMs 사용
  const displayTimeMs = isCurrentTaskAssigned 
    ? memberTimeMs 
    : (memberTimeMs > 0 ? memberTimeMs : (member.timeMs || 0));
  
  return (
    <div className={`flex-1 rounded-lg p-3 text-center transition-all duration-300 ${
      isActive ? 'bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg border-2 border-orange-300' : 'bg-gray-50'
    }`}>
      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
        isActive ? 'bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg' : 'bg-blue-100'
      } ${isActive ? 'animate-pulse' : ''}`}>
        <User size={20} className={isActive ? 'text-white' : 'text-blue-600'} />
      </div>
      <p className="text-sm font-medium text-gray-900">{member.nickname || '멤버'}</p>
      <p className={`text-xs font-mono mt-1 transition-colors duration-300 ${
        isActive ? 'text-gray-600 font-bold' : 'text-gray-600'
      }`}>
        {formatTime(displayTimeMs)}
      </p>
      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            isActive ? 'bg-gradient-to-r from-orange-400 to-yellow-400' : 'bg-gray-800'
          }`}
          style={{ width: `${memberProgress}%` }}
        />
      </div>
      {isActive && (
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BarcodeTimeline = ({ timeSlots }) => (
  <div className="mt-6">
    <p className="text-xs text-gray-500 mb-2">24시간 타임라인 (10분 단위)</p>
    <div className="flex gap-px h-12 bg-gray-100 rounded overflow-hidden">
      {timeSlots.map((active, i) => <div key={i} className={`flex-1 ${active ? 'bg-gray-900' : 'bg-white'}`} style={{ minWidth: '1px' }} />)}
    </div>
    <div className="flex justify-between mt-1 text-xs text-gray-400"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
  </div>
);

const FloatingTimer = ({ isRunning, elapsedTime, project, task, onStop, onExpand }) => {
  if (!isRunning) return null;
  return (
    <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40">
      <div className="bg-gray-900 text-white rounded-xl p-3 shadow-lg flex items-center justify-between">
        <button onClick={onExpand} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-[#7CB9E8] rounded-full flex items-center justify-center flex-shrink-0"><div className="w-3 h-3 bg-white rounded-full animate-pulse" /></div>
          <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium truncate">{task?.content || '시간 측정 중'}</p><p className="text-xs text-gray-400 truncate">{project?.title}</p></div>
        </button>
        <div className="flex items-center gap-3"><span className="font-mono text-lg font-bold">{formatTimeShort(elapsedTime)}</span><button onClick={onStop} className="p-2 bg-[#7CB9E8] rounded-full hover:bg-[#6BA8D8]"><Square size={16} /></button></div>
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
        <div className="flex items-center justify-between p-4 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">시간 측정 시작</h2><button onClick={onClose}><X size={24} className="text-gray-400" /></button></div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택</label>
            <div className="relative"><select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white appearance-none"><option value="">프로젝트를 선택하세요</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select><ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
            </div>
          {selectedProject && incompleteTasks.length > 0 && <div className="space-y-2">{incompleteTasks.map(task => <button key={task.id} onClick={() => { onSelectTask(selectedProject, task); setSelectedProjectId(''); onClose(); }} className="w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 flex items-center justify-between"><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{task.content}</p></div><Play size={18} className="text-gray-400 flex-shrink-0" /></button>)}</div>}
          </div>
      </div>
    </div>
  );
};

const TimerFullModal = ({ isOpen, onClose, project, task, elapsedTime, onStop }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 224; // w-56 = 224px
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const drawWave = (t) => {
      ctx.clearRect(0, 0, size, size);
      
      // 원형 마스크
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.clip();

      // 배경
      ctx.fillStyle = '#E8F4FD';
      ctx.fillRect(0, 0, size, size);

      // 파도 그리기 - 아래에서 위로 채워지는 방식
      const baseY = size * 0.55; // 파도 시작 위치 (중앙 아래)
      const amplitude = 30;
      const frequency = 0.02;
      const speed = 0.06; // 파도 속도

      // 첫 번째 파도 (가장 큰 파도)
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + amplitude * Math.sin((x * frequency) + (t * speed));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = 'rgba(124, 185, 232, 0.5)';
      ctx.fill();

      // 두 번째 파도 (중간 크기)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 5);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 5 + amplitude * 0.9 * Math.sin((x * frequency * 1.15) + (t * speed * 1.4) + Math.PI / 3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = 'rgba(124, 185, 232, 0.45)';
      ctx.fill();

      // 세 번째 파도 (작은 파도)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 12);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 12 + amplitude * 0.75 * Math.sin((x * frequency * 0.85) + (t * speed * 0.85) + Math.PI / 1.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = 'rgba(124, 185, 232, 0.4)';
      ctx.fill();

      // 네 번째 파도 (가장 작은 파도, 디테일)
      ctx.beginPath();
      ctx.moveTo(0, baseY + 20);
      for (let x = 0; x <= size; x += 1.5) {
        const y = baseY + 20 + amplitude * 0.6 * Math.sin((x * frequency * 1.3) + (t * speed * 1.1) + Math.PI);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = 'rgba(124, 185, 232, 0.3)';
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      timeRef.current += 1;
      drawWave(timeRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <button onClick={onClose} className="p-2">
          <ChevronDown size={24} className="text-gray-600" />
        </button>
        <span className="text-sm text-gray-500">측정 중</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-500 mb-2">{project?.title}</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">{task?.content}</h2>
        <div className="relative w-56 h-56 rounded-full border-4 border-[#7CB9E8] flex items-center justify-center overflow-hidden" style={{ background: 'transparent' }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: '50%', zIndex: 0 }} />
          <div className="absolute inset-0 rounded-full border-4 border-[#7CB9E8] animate-pulse z-10 pointer-events-none" />
          <span className="text-4xl font-mono font-bold text-gray-900 relative z-30">{formatTime(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-2 mt-6 text-[#7CB9E8]">
          <div className="w-2 h-2 bg-[#7CB9E8] rounded-full animate-pulse" />
          <span>측정 중...</span>
        </div>
        <button onClick={onStop} className="mt-12 px-12 py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2">
          <Square size={20} />측정 종료
        </button>
      </div>
    </div>
  );
};

const CreateProjectModal = ({ isOpen, onClose, onCreate, currentUser }) => {
  const [title, setTitle] = useState('');
  const [isTeam, setIsTeam] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState([{ id: generateId(), nickname: currentUser?.nickname || 'Hanjin', timeMs: 0, progress: 0 }]);
  const [newMemberNickname, setNewMemberNickname] = useState('');
  
  const handleAddMember = () => {
    if (!newMemberNickname.trim()) return;
    setMembers([...members, { 
      id: generateId(), 
      nickname: newMemberNickname.trim(), 
      timeMs: 0, 
      progress: 0 
    }]);
    setNewMemberNickname('');
  };
  
  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const projectData = {
      id: generateId(),
      title: title.trim(),
      totalTimeMs: 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      memberCount: isTeam ? members.length : 1,
      report: null,
      tasks: [],
      ...(isTeam && { members: members })
    };
    
    onCreate(projectData);
    // 초기화
    setTitle('');
    setDueDate('');
    setIsTeam(false);
    setMembers([{ id: generateId(), nickname: currentUser?.nickname || 'Hanjin', timeMs: 0, progress: 0 }]);
    setNewMemberNickname('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">새 프로젝트</h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="예: 해석학 공부" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400" 
              autoFocus 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">마감일 (선택)</label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400" 
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isTeam} 
                onChange={(e) => setIsTeam(e.target.checked)} 
                className="w-5 h-5 rounded border-gray-300 text-gray-800 focus:ring-gray-400" 
              />
              <span className="text-sm text-gray-700">팀 프로젝트</span>
            </label>
          </div>
          
          {isTeam && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">참여 인원</label>
              <div className="space-y-2 mb-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-800">{member.nickname}</span>
                      {member.nickname === currentUser?.nickname && (
                        <span className="text-xs text-gray-500">(나)</span>
                      )}
                    </div>
                    {member.nickname !== currentUser?.nickname && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMemberNickname} 
                  onChange={(e) => setNewMemberNickname(e.target.value)} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder="닉네임 입력" 
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm" 
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!newMemberNickname.trim()}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600"
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={!title.trim()} 
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAdd, members }) => {
  const [content, setContent] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const assignee = members?.find(m => m.id === assigneeId);
    const newTask = {
      id: generateId(),
      content: content.trim(),
      isDone: false,
      durationMs: 0,
      ...(assignee && {
        assigneeId: assignee.id,
        assigneeName: assignee.nickname
      })
    };
    
    onAdd(newTask);
    setContent('');
    setAssigneeId('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">새 Task</h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task 내용 *
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 수업 복습하기"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
              autoFocus
            />
          </div>
          
          {members && members.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                담당자 (선택)
              </label>
              <div className="relative">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white appearance-none"
                >
                  <option value="">담당자 없음</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.nickname}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 도넛 차트 컴포넌트 (보고서용 - 회색 계열)
const ReportDonutChart = ({ tasks, totalTimeMs, size = 280, onSegmentClick, showLabels = true }) => {
  const grayColors = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'];
  
  // Task를 올림차순으로 정렬 (content 기준)
  const tasksWithTime = tasks
    .filter(t => t.durationMs > 0)
    .sort((a, b) => a.content.localeCompare(b.content));
  
  // 텍스트가 잘리지 않도록 패딩 추가 (텍스트 표시 여부에 따라 조정)
  const padding = showLabels ? 80 : 20; // 텍스트 공간 확보
  const chartSize = size - padding * 2;
  const innerRadius = chartSize / 2 - 25;
  const outerRadius = chartSize / 2 - 5;
  const centerX = size / 2;
  const centerY = size / 2;
  
  if (totalTimeMs === 0 || tasksWithTime.length === 0) {
    return (
      <div className="flex items-center justify-center w-full" style={{ height: size }}>
        <div className="text-center">
          <p className="text-sm text-gray-400">시간 기록 없음</p>
        </div>
      </div>
    );
  }
  
  // 각 segment의 path를 생성
  let currentAngle = -90; // 시작 각도 (위쪽부터)
  const segments = tasksWithTime.map((task, index) => {
    const percentage = (task.durationMs / totalTimeMs) * 100;
    const angle = (percentage / 100) * 360;
    
    // 시작 및 종료 각도 (도 단위)
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // 라디안으로 변환
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // 중심 각도 (텍스트 배치용)
    const midAngleRad = ((startAngle + angle / 2) * Math.PI) / 180;
    
    // 외곽 포인트 계산
    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    // 원호를 위한 큰 원/작은 원 플래그
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Path 생성
    const path = [
      `M ${x1} ${y1}`, // 내부 시작점
      `L ${x2} ${y2}`, // 외부 시작점
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`, // 외부 원호
      `L ${x4} ${y4}`, // 내부 끝점
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`, // 내부 원호
      'Z'
    ].join(' ');
    
    // 텍스트 위치 계산 (외곽에 배치 - 여유 공간 확보)
    const textRadius = outerRadius + 15;
    const textX = centerX + textRadius * Math.cos(midAngleRad);
    const textY = centerY + textRadius * Math.sin(midAngleRad);
    
    // 텍스트 정렬 방향 계산
    const textAnchor = textX > centerX ? 'start' : textX < centerX ? 'end' : 'middle';
    const dominantBaseline = 'middle';
    
    const segment = {
      task,
      percentage,
      path,
      textX,
      textY,
      textAnchor,
      dominantBaseline,
      midAngleRad,
      color: grayColors[index % grayColors.length]
    };
    
    currentAngle += angle;
    return segment;
  });
  
  return (
    <div className="flex items-center justify-center w-full" style={{ height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {/* 도넛 차트 경로들 */}
        {segments.map((segment) => (
          <g key={segment.task.id}>
            <path
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSegmentClick && onSegmentClick(segment.task)}
              style={{
                transition: 'all 0.3s ease'
              }}
            />
            {/* Task 명 텍스트 (showLabels가 true일 때만 표시) */}
            {showLabels && (
              <text
                x={segment.textX}
                y={segment.textY}
                textAnchor={segment.textAnchor}
                dominantBaseline={segment.dominantBaseline}
                fontSize="11"
                fill="#374151"
                fontWeight="500"
                className="pointer-events-none"
              >
                {segment.task.content}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// 도넛 차트 컴포넌트 (보고서 작성용)
const DonutChart = ({ tasks, totalTimeMs, size = 200 }) => {
  const colors = [
    '#7CB9E8', '#A8D8EA', '#B8E0D2', '#D6EADF', '#E8D5C4',
    '#FFB6C1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'
  ];
  
  const tasksWithTime = tasks.filter(t => t.durationMs > 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  
  if (totalTimeMs === 0 || tasksWithTime.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <p className="text-sm text-gray-400">시간 기록 없음</p>
        </div>
      </div>
    );
  }
  
  // 누적 비율을 미리 계산
  let cumulativePercentage = 0;
  const segments = tasksWithTime.map((task, index) => {
    const percentage = (task.durationMs / totalTimeMs) * 100;
    const segmentLength = (percentage / 100) * circumference;
    const segmentOffset = circumference - (cumulativePercentage / 100) * circumference;
    
    const segment = {
      task,
      percentage,
      segmentLength,
      segmentOffset,
      color: colors[index % colors.length]
    };
    
    cumulativePercentage += percentage;
    return segment;
  });
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((segment) => (
          <circle
            key={segment.task.id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth="16"
            strokeDasharray={`${segment.segmentLength} ${circumference}`}
            strokeDashoffset={segment.segmentOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease'
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-gray-900">{tasksWithTime.length}</p>
        <p className="text-xs text-gray-500">Tasks</p>
      </div>
    </div>
  );
};

const WriteReportModal = ({ isOpen, onClose, project, onSave }) => {
  const [rating, setRating] = useState(5);
  const [memo, setMemo] = useState('');
  
  if (!isOpen || !project) return null;
  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">보고서 작성</h2>
            <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
          </div>
          
          {/* 프로젝트명 + 총 소요시간 (상단) */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
            <p className="text-sm text-gray-500">총 소요시간</p>
            <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{formatTime(project.totalTimeMs)}</p>
          </div>
          
          {/* Task별 시간 비율 도넛 차트 (중앙) - 보고서 양식과 동일 */}
          <div className="mb-6 flex justify-center">
            <ReportDonutChart tasks={tasksWithTime} totalTimeMs={project.totalTimeMs} size={200} showLabels={false} />
          </div>
          
          {/* 진행한 Task들 목록 (체크박스) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">진행한 Task ({completedTasks.length})</label>
            <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
              {completedTasks.length > 0 ? completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-800 truncate">{task.content}</span>
                  </div>
                  {task.durationMs > 0 && (
                    <span className="text-xs font-mono text-gray-600 ml-2 flex-shrink-0">
                      {formatTimeShort(task.durationMs)}
                    </span>
                  )}
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">완료된 Task가 없습니다</p>
              )}
            </div>
          </div>
          
          {/* 평점 (5점 만점 정수) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="5"
                step="1"
                value={rating}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 5) {
                    setRating(value);
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <span className="text-lg text-gray-600">/ 5</span>
              <div className="flex items-center gap-1 flex-1">
                {[1,2,3,4,5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    className={`transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium"
            >
              나중에
            </button>
            <button
              onClick={() => {
                onSave({
                  rating,
                  memo,
                  createdAt: new Date(),
                  totalTimeMs: project.totalTimeMs,
                  completedTasks: completedTasks.length
                });
                setRating(5);
                setMemo('');
                onClose();
              }}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 개인정보 모달
const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(user?.nickname || '');
  
  useEffect(() => {
    if (user) {
      setEditedNickname(user.nickname || '');
    }
  }, [user]);
  
  if (!isOpen || !user) return null;
  
  const handleSave = () => {
    if (editedNickname.trim() && onUpdateUser) {
      onUpdateUser({ ...user, nickname: editedNickname.trim() });
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setEditedNickname(user.nickname || '');
    setIsEditing(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8" style={{ minHeight: '600px' }}>
        <div className="flex items-center justify-between px-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">개인정보</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          {/* 원형 동그라미 안에 이모지 */}
          <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center mb-8">
            <div className="text-8xl">
              {user.emoji || '👤'}
            </div>
          </div>
          
          {/* 닉네임 편집 */}
          <div className="flex flex-col items-center gap-3 w-full px-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedNickname}
                  onChange={(e) => setEditedNickname(e.target.value)}
                  className="text-2xl font-semibold text-gray-900 text-center px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  autoFocus
                  placeholder="닉네임을 입력하세요"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    disabled={!editedNickname.trim()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {user.nickname}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  수정
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 영수증 미리보기 모달
const ReceiptPreviewModal = ({ isOpen, onClose, user, archive, onSave, hasTimerButton = false }) => {
  if (!isOpen || !archive) return null;
  
  // 작업이 없을 때도 빈 영수증 표시
  const displayArchive = archive.tasks.length === 0 
    ? { ...archive, tasks: [], totalTimeMs: 0, timeSlots: new Array(144).fill(false) }
    : archive;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm my-8 relative" style={{ marginBottom: '2rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">오늘의 영수증</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 140px)', paddingBottom: '1rem' }}>
          <ReceiptCard
            user={user}
            archive={displayArchive}
            showDownloadButton={false}
          />
          </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium"
          >
            닫기
          </button>
          <button
            onClick={onSave}
            disabled={archive.tasks.length === 0}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              archive.tasks.length > 0
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download size={18} />
            저장하기
          </button>
            </div>
      </div>
    </div>
  );
};

// ============================================
// 페이지 컴포넌트들
// ============================================

const MainPage = ({ user, totalTimeMs, projects, onProjectClick, onStartTimer, onCreateProject, isTimerRunning, currentProjectId, elapsedTime, currentTask, onTimerClick, onToggleDailyTask, onStartDailyTaskTimer, currentProject, onShowReceipt, showReceiptPreview, onSaveArchive, savedTodayArchive, onShowProfile }) => {
  const todayTasks = getTodayTasks(projects, user);
  const todayArchiveRef = useRef(null);
  const [savingArchive, setSavingArchive] = useState(false);
  
  // 오늘 날짜 확인
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const savedArchiveDate = savedTodayArchive ? new Date(savedTodayArchive.date) : null;
  if (savedArchiveDate) savedArchiveDate.setHours(0, 0, 0, 0);
  const isSavedArchiveToday = savedTodayArchive && savedArchiveDate && savedArchiveDate.getTime() === today.getTime();
  
  // 타이머가 실행 중이면 항상 실시간 아카이브 사용, 아니면 저장된 아카이브가 있으면 사용
  const todayArchive = isTimerRunning
    ? generateTodayArchive(projects, currentProject, currentTask, elapsedTime)
    : (isSavedArchiveToday 
        ? savedTodayArchive 
        : generateTodayArchive(projects, currentProject, currentTask, elapsedTime));
  
  const handleDownloadTodayArchive = async () => {
    if (todayArchive.tasks.length === 0) return;
    
    try {
      setSavingArchive(true);
      
      // 실제 저장 시점 기록
      const archiveWithTimestamp = {
        ...todayArchive,
        recordedAt: new Date()
      };
      
      // 백엔드에 아카이브 저장 시도
      try {
        await archiveAPI.saveTodayArchive(archiveWithTimestamp);
      } catch (apiErr) {
        console.warn('API 저장 실패 (로컬 데이터는 업데이트됨):', apiErr);
        // API 저장 실패해도 로컬 데이터는 업데이트
      }
      
      // 아카이브 페이지 데이터 업데이트 (항상 실행)
      if (onSaveArchive) {
        onSaveArchive(archiveWithTimestamp);
      }
      
      alert(`${formatDate(todayArchive.date)} 오늘의 영수증이 저장되었습니다!`);
    } catch (err) {
      console.error('Failed to save archive:', err);
      alert('아카이브 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingArchive(false);
    }
  };

  const handleShowReceipt = () => {
    if (onShowReceipt) {
      onShowReceipt();
    }
  };
  
  return (
    <div 
      className="min-h-screen bg-gray-50" 
      style={{ 
        paddingBottom: (!isTimerRunning && projects.length > 0)
          ? 'calc(6rem + 80px + 2rem)'
          : 'calc(6rem + 2rem)'
      }}
    >
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-light text-gray-900"><span className="font-semibold">{user.nickname}</span>'s Momento.</h1>
          <button 
            onClick={onShowProfile}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <User size={24} className="text-gray-600" />
          </button>
        </div>
      </div>
      <TotalTimeDisplay timeMs={totalTimeMs + (isTimerRunning ? elapsedTime : 0)} isRunning={isTimerRunning} currentTask={currentTask} onTimerClick={onTimerClick} />
      <DailyTodoSection 
        todayTasks={todayTasks} 
        onToggle={onToggleDailyTask} 
        onStartTimer={onStartDailyTaskTimer}
        isTimerRunning={isTimerRunning}
        currentTaskId={currentTask?.id}
        currentProjectId={currentProject?.id}
        elapsedTime={elapsedTime}
      />
      <div className="px-4 py-3">
        {(() => {
          // 보고서가 작성된 프로젝트는 제외
          const activeProjects = projects.filter(p => !p.report);
          return (
            <>
              <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-600">프로젝트 ({activeProjects.length})</span></div>
              <div className="space-y-2">
                {activeProjects.map(project => <MainProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} isTimerRunning={isTimerRunning} currentProjectId={currentProjectId} elapsedTime={elapsedTime} />)}
                <button onClick={onCreateProject} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600"><Plus size={18} />새 프로젝트</button>
              </div>
            </>
          );
        })()}
      </div>
      {/* 영수증 확인 및 저장 버튼 (항상 표시) */}
      <div className="px-4 py-3 space-y-2">
        <button 
          onClick={handleShowReceipt}
          disabled={todayArchive.tasks.length === 0}
          className={`w-full py-3 border-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
            todayArchive.tasks.length > 0
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FileText size={20} />
          오늘의 영수증 보기
        </button>
        <button 
          onClick={handleDownloadTodayArchive}
          disabled={todayArchive.tasks.length === 0 || savingArchive}
          className={`w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-colors ${
            todayArchive.tasks.length > 0 && !savingArchive
              ? 'hover:bg-gray-800' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Download size={20} />
          {savingArchive ? '저장 중...' : '오늘의 아카이브 저장'}
        </button>
      </div>
      
      {/* 영수증 카드 (시간 측정 시작 시 표시, 시간 측정 시작 버튼 위로 표시) */}
      {isTimerRunning && todayArchive.tasks.length > 0 && (
        <div 
          className="px-4 py-4" 
          style={{ 
            marginBottom: (!isTimerRunning && projects.length > 0) ? '100px' : '0'
          }}
        >
          <ReceiptCard
            ref={todayArchiveRef}
            user={user}
            archive={todayArchive}
            showDownloadButton={false}
          />
        </div>
      )}
      
      {!isTimerRunning && projects.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-md mx-auto z-20">
          <button onClick={onStartTimer} className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg">
            <Play size={20} />시간 측정 시작
          </button>
        </div>
      )}
    </div>
  );
};

const PersonalProjectPage = ({ project, onBack, onToggleTask, onStartTaskTimer, onAddTask, isTimerRunning, currentTaskId, currentProjectId, elapsedTime, onWriteReport }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const isCompleted = progress === 100;
  const currentTaskInProject = project.id === currentProjectId && project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning ? project.totalTimeMs + elapsedTime : project.totalTimeMs;
  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200"><button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button><div className="text-center"><h1 className="font-semibold text-gray-900">{project.title}</h1><span className={`text-sm font-mono ${currentTaskInProject && isTimerRunning ? 'text-[#7CB9E8]' : 'text-gray-600'}`}>{formatTime(displayTotalTime)}</span></div><div className="w-6" /></div>
      {project.dueDate && <div className="px-4 py-2 text-sm text-gray-600">Due date: ~ {formatDate(project.dueDate)}</div>}
      <div className="flex justify-center py-6"><CircularProgress progress={progress} completedTasks={completedTasks} totalTasks={project.tasks.length} /></div>
      <div className="px-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-600">Task ({completedTasks}/{project.tasks.length})</span></div>
        <div className="bg-gray-50 rounded-lg p-4">
          {project.tasks.length > 0 ? project.tasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggleTask} onStartTimer={onStartTaskTimer} isTimerRunning={isTimerRunning} currentTaskId={currentTaskId} currentProjectId={currentProjectId} projectId={project.id} elapsedTime={elapsedTime} />) : <p className="text-sm text-gray-400 text-center py-4">Task가 없습니다</p>}
          <button onClick={onAddTask} className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600"><Plus size={16} />Task 추가</button>
        </div>
      </div>
      {isCompleted && !project.report && (
        <div className="px-4 py-4">
          <button
            onClick={onWriteReport}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            <FileText size={18} />
            보고서 작성하기
          </button>
        </div>
      )}
    </div>
  );
};

const TeamProjectPage = ({ project, onBack, onToggleTask, onStartTaskTimer, onAddTask, isTimerRunning, currentTaskId, currentProjectId, elapsedTime, onWriteReport }) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const isCompleted = progress === 100;
  const currentTaskInProject = project.id === currentProjectId && project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning ? project.totalTimeMs + elapsedTime : project.totalTimeMs;
  const isActive = currentTaskInProject && isTimerRunning;
  
  // 현재 실행 중인 Task의 할당자 찾기
  const activeMemberId = currentTaskInProject?.assigneeId;
  
  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${
      isActive ? 'bg-gradient-to-b from-orange-50/30 to-white' : 'bg-white'
    }`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b transition-all duration-300 ${
        isActive ? 'border-orange-200 bg-gradient-to-r from-orange-50/50 to-yellow-50/50' : 'border-gray-200'
      }`}>
        <button onClick={onBack}>
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div className="text-center">
          <h1 className="font-semibold text-gray-900">{project.title}</h1>
          <div className="flex items-center justify-center gap-2">
            {isActive && (
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <span className={`text-sm font-mono transition-colors duration-300 ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-600'
            }`}>
              {formatTime(displayTotalTime)}
            </span>
          </div>
        </div>
        <button className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">+ 팀원</button>
      </div>
      <div className="px-4 py-2 flex items-center gap-2 text-gray-600">
        <span>Team:</span>
        <Users size={16} />
        <span className="text-sm">{project.members?.length || project.memberCount}명</span>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">전체 진행률</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-800 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex gap-3">
          {project.members?.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              project={project}
              currentTask={currentTaskInProject}
              elapsedTime={elapsedTime}
              isActive={isActive && m.id === activeMemberId}
            />
          ))}
        </div>
      </div>
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Task ({completedTasks}/{project.tasks.length})</span>
        </div>
        <div className={`bg-gray-50 rounded-lg p-4 transition-all duration-300 ${
          isActive ? 'border-2 border-orange-200 shadow-sm' : ''
        }`}>
          {project.tasks.length > 0 ? (
            project.tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onStartTimer={onStartTaskTimer}
                showAssignee
                isTimerRunning={isTimerRunning}
                currentTaskId={currentTaskId}
                currentProjectId={currentProjectId}
                projectId={project.id}
                elapsedTime={elapsedTime}
                isTeamProject={true}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Task가 없습니다</p>
          )}
          <button onClick={onAddTask} className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600">
            <Plus size={16} />
            Task 추가
          </button>
        </div>
      </div>
      {isCompleted && !project.report && (
        <div className="px-4 py-4">
          <button
            onClick={onWriteReport}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-colors"
          >
            <FileText size={18} />
            보고서 작성하기
          </button>
        </div>
      )}
    </div>
  );
};

const ReportDetailPage = ({ project, onBack }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  
  if (!project || !project.report) return null;
  
  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);
  
  const handleSegmentClick = (task) => {
    setSelectedTask(task);
  };
  
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={onBack}>
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="font-semibold text-gray-900">보고서</h1>
        <div className="w-6" />
      </div>
      
      {/* 프로젝트 정보 섹션 */}
      <div className="py-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h2>
        <p className="text-4xl font-mono font-bold text-gray-900">{formatTime(project.totalTimeMs)}</p>
        <p className="text-sm text-gray-500 mt-2">총 소요시간</p>
      </div>
      
      {/* Task별 시간 비율 도넛 차트 */}
      <div className="py-6 flex justify-center">
        <ReportDonutChart 
          tasks={tasksWithTime} 
          totalTimeMs={project.totalTimeMs} 
          size={320}
          onSegmentClick={handleSegmentClick}
        />
      </div>
      
      {/* Task 정보 모달 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Task 정보</h3>
              <button onClick={() => setSelectedTask(null)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Task 명</p>
                <p className="text-base font-medium text-gray-900">{selectedTask.content}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">소요 시간</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{formatTime(selectedTask.durationMs)}</p>
              </div>
              
              {selectedTask.assigneeName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">참여인원</p>
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-600" />
                    <p className="text-base font-medium text-gray-900">{selectedTask.assigneeName}</p>
                  </div>
                </div>
              )}
              
              {project.memberCount > 1 && !selectedTask.assigneeName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">참여인원</p>
                  <p className="text-base text-gray-600">할당되지 않음</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedTask(null)}
              className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      
      {/* 하단 2열 레이아웃 */}
      <div className="px-4 py-6 grid grid-cols-2 gap-6">
        {/* 왼쪽: 진행한 Task들 */}
        <div className="pl-16">
          <h3 className="text-sm font-medium text-gray-700 mb-3">진행한 Task들</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-gray-900 flex-shrink-0" />
                <span className="text-sm text-gray-800 truncate">{task.content}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 오른쪽: 평점 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">평점</h3>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold text-gray-900">{project.report.rating}</span>
            <span className="text-base text-gray-600 mb-1">/5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportPage = ({ projects, onBack, onViewReport }) => {
  const completedProjects = projects.filter(p => p.report);
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={onBack}>
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="font-semibold text-gray-900">보고서</h1>
        <div className="w-6" />
      </div>
      <div className="px-4 py-4">
        {completedProjects.length > 0 ? (
          completedProjects.map(p => (
            <button
              key={p.id}
              onClick={() => onViewReport && onViewReport(p)}
              className="w-full bg-gray-50 rounded-xl p-4 mb-4 text-left hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              {p.report && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>평점: {p.report.rating}/5</span>
                  <span>총 시간: {formatTime(p.totalTimeMs)}</span>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>작성된 보고서가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 주간 아카이브 슬라이드뷰
// ============================================

const WeeklyArchivePage = ({ user, weeklyData, onBack, onViewMonthly, initialDate }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // initialDate가 있으면 해당 날짜의 인덱스 찾기
    if (initialDate) {
      const targetDate = new Date(initialDate);
      targetDate.setHours(0, 0, 0, 0);
      const index = weeklyData.findIndex(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === targetDate.getTime();
      });
      return index >= 0 ? index : 6; // 찾지 못하면 마지막 인덱스
    }
    
    // initialDate가 없으면 오늘 날짜 찾기
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = weeklyData.findIndex(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === today.getTime();
    });
    
    return todayIndex >= 0 ? todayIndex : 6; // 오늘 날짜를 찾지 못하면 마지막 인덱스
  });
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
  
  // 스크롤 시 현재 인덱스 업데이트 (throttled)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;
    const cardWidth = containerWidth * 0.85;
    const gap = 16;
    const cardWithGap = cardWidth + gap;
    
    // 정확한 인덱스 계산 (중앙 기준)
    const newIndex = Math.round((scrollLeft + containerWidth / 2) / cardWithGap);
    const clampedIndex = Math.max(0, Math.min(newIndex, weeklyData.length - 1));
    
    if (clampedIndex !== currentIndex && clampedIndex >= 0 && clampedIndex < weeklyData.length) {
      setCurrentIndex(clampedIndex);
    }
  };
  
  // 특정 인덱스로 스크롤
  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const containerWidth = container.offsetWidth;
    const cardWidth = containerWidth * 0.85;
    const gap = 16;
    const cardWithGap = cardWidth + gap;
    
    // 카드 중앙이 화면 중앙에 오도록 계산
    const scrollLeft = index * cardWithGap;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setCurrentIndex(index);
  };
  
  // initialDate가 있으면 해당 인덱스로 스크롤, 없으면 오늘 날짜로 스크롤
  useEffect(() => {
    if (!scrollContainerRef.current || weeklyData.length === 0) return;
    
    const targetDate = initialDate ? new Date(initialDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const index = weeklyData.findIndex(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === targetDate.getTime();
    });
    
    if (index >= 0) {
      setTimeout(() => scrollToIndex(index), 100); // 렌더링 후 스크롤
    }
  }, [initialDate, weeklyData]);

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
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          overscrollBehaviorX: 'contain'
        }}
      >
        {weeklyData.map((archive, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 snap-center snap-align-center"
            style={{ 
              width: '85%',
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always'
            }}
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

const MonthlyArchivePage = ({ onBack, user, onViewWeekly }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // 2026년 1월
  const [selectedDate, setSelectedDate] = useState(9);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // 해당 월의 일수 계산
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // 해당 월의 첫 날의 요일 (0=일요일, 1=월요일, ..., 6=토요일)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // 월요일부터 시작하도록 조정 (일요일=0을 6으로, 월요일=1을 0으로, ...)
  const firstDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const days = Array.from({ length: daysInMonth }, (_, i) => { 
    const hasData = Math.random() > 0.3; 
    return { day: i + 1, hasData, intensity: hasData ? Math.random() : 0, timeMs: hasData ? Math.floor(Math.random() * 36000000) : 0 }; 
  });
  
  const selectedDayData = days.find(d => d.day === selectedDate);
  const selectedTimeSlots = generateTimeSlots(selectedDate);
  
  // 월 변경 함수
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(1); // 날짜 초기화
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(1); // 날짜 초기화
  };
  
  // 오늘 날짜 확인
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200"><button onClick={onBack}><ChevronLeft size={24} className="text-gray-600" /></button><h1 className="font-semibold text-gray-900">월간 아카이브</h1><div className="w-6" /></div>
      
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mx-auto max-w-sm" style={{ fontFamily: 'monospace' }}>
          {/* 로고 */}
          <div className="flex justify-center pt-6 pb-2"><div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center transform rotate-12"><Calendar size={24} className="text-white -rotate-12" /></div></div>
          
          {/* 월 선택 */}
          <div className="flex items-center justify-center gap-6 py-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <span className="font-bold text-lg text-gray-900">{year}년 {month + 1}월</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          
          <DashedLine />
          
          {/* 캘린더 */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-7 gap-1 mb-2">{['월','화','수','목','금','토','일'].map((d, i) => <div key={d} className={`text-center text-xs font-medium py-1 ${i === 5 ? 'text-blue-400' : i === 6 ? 'text-red-400' : 'text-gray-500'}`}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {/* 첫 주의 빈 칸 (월요일 기준) */}
              {[...Array(firstDayOffset)].map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
              {days.map(({ day, hasData, intensity }) => {
                const isSelected = selectedDate === day;
                const isToday = isCurrentMonth && day === todayDate;
                return <button key={day} onClick={() => setSelectedDate(day)} className={`aspect-square rounded flex flex-col items-center justify-center text-xs transition-all ${isSelected ? 'bg-gray-900 text-white' : isToday ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' : 'hover:bg-gray-100 text-gray-700'}`}><span className={isSelected ? 'font-bold' : ''}>{day}</span>{hasData && !isSelected && <div className="w-1 h-2 bg-gray-400 rounded-full mt-0.5" style={{ opacity: 0.3 + intensity * 0.7 }} />}</button>;
              })}
      </div>
      </div>
          
          <DashedLine />
          
          {/* 선택된 날짜 상세 */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">[선택한 날짜]</p>
            <div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-900">{year}.{month + 1}.{selectedDate}.</span>{selectedDayData?.hasData && <span className="font-mono text-lg font-bold text-gray-900">{formatTime(selectedDayData.timeMs)}</span>}</div>
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
      
      {selectedDayData?.hasData && (
        <div className="px-4">
          <button 
            onClick={() => {
              if (onViewWeekly) {
                const targetDate = new Date(year, month, selectedDate); // 선택한 연월일
                onViewWeekly(targetDate);
              }
            }}
            className="w-full py-3 border border-gray-300 bg-white rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <FileText size={18} />{selectedDate}일 상세 기록 보기
          </button>
        </div>
      )}
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
  const [selectedReport, setSelectedReport] = useState(null);
  const [archiveView, setArchiveView] = useState('weekly'); // 'weekly' | 'monthly'
  const [weeklyArchiveData, setWeeklyArchiveData] = useState(() => generateWeeklyArchive(new Date())); // 오늘 날짜 기준으로 초기화
  const [selectedArchiveDate, setSelectedArchiveDate] = useState(null); // 주간 아카이브에서 표시할 날짜
  const [savedTodayArchive, setSavedTodayArchive] = useState(null);
  const [currentUser, setCurrentUser] = useState(initialUser);
  
  // 해당 날짜가 포함된 주의 데이터를 생성하는 함수 (월요일부터 일요일)
  const getWeekDataForDate = (targetDate) => {
    // generateWeeklyArchive를 사용하여 해당 날짜의 주간 데이터 생성
    const weekData = generateWeeklyArchive(targetDate);
    
    // 기존 weeklyArchiveData에서 실제 저장된 데이터가 있으면 병합
    return weekData.map(dayData => {
      const dayDate = new Date(dayData.date);
      dayDate.setHours(0, 0, 0, 0);
      
      const existingData = weeklyArchiveData.find(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === dayDate.getTime();
      });
      
      // 실제 저장된 데이터가 있으면 그것을 사용, 없으면 생성된 샘플 데이터 사용
      return existingData || dayData;
    });
  };
  
  // 월간 아카이브에서 주간 아카이브로 이동
  const handleViewWeekly = (targetDate) => {
    const weekData = getWeekDataForDate(targetDate);
    setWeeklyArchiveData(weekData);
    setSelectedArchiveDate(targetDate);
    setArchiveView('weekly');
  };

  // 사용자 이름 변경 시 프로젝트 멤버 이름도 함께 업데이트
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    
    // 모든 프로젝트에서 현재 사용자 이름과 일치하는 멤버 찾아서 업데이트
    setProjects(prev => prev.map(project => {
      if (!project.members) return project;
      
      const updatedMembers = project.members.map(member => {
        // 현재 사용자 이름과 일치하는 멤버 찾기 (기존 'Hanjin' 또는 변경 전 이름)
        // 또는 userId가 일치하는 경우
        if (member.nickname === currentUser.nickname || 
            member.id === currentUser.id ||
            (member.userId && member.userId === currentUser.id)) {
          return { ...member, nickname: updatedUser.nickname };
        }
        return member;
      });
      
      // Task의 assigneeName도 업데이트
      const updatedTasks = project.tasks.map(task => {
        const member = updatedMembers.find(m => m.id === task.assigneeId);
        if (member && member.nickname === updatedUser.nickname) {
          return { ...task, assigneeName: updatedUser.nickname };
        }
        return task;
      });
      
      return {
        ...project,
        members: updatedMembers,
        tasks: updatedTasks
      };
    }));
  };

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [activeTimerId, setActiveTimerId] = useState(null);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimerSelect, setShowTimerSelect] = useState(false);
  const [showTimerFull, setShowTimerFull] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [showWriteReport, setShowWriteReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalTimeMs = projects.reduce((sum, p) => sum + p.totalTimeMs, 0);

  // 초기 데이터 로드
  useEffect(() => {
    loadProjects();
  }, []);

  // 날짜가 바뀌면 저장된 오늘의 아카이브 초기화
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (savedTodayArchive) {
        const savedDate = new Date(savedTodayArchive.date);
        savedDate.setHours(0, 0, 0, 0);
        
        if (savedDate.getTime() !== today.getTime()) {
          setSavedTodayArchive(null);
        }
      }
    };
    
    // 매 분마다 확인 (날짜 변경 감지)
    const interval = setInterval(checkDateChange, 60000);
    checkDateChange(); // 즉시 한 번 실행
    
    return () => clearInterval(interval);
  }, [savedTodayArchive]);

  // 프로젝트 목록 로드
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('프로젝트를 불러오는데 실패했습니다.');
      // 에러 발생 시 초기 데이터 사용
      setProjects(initialProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isTimerRunning) { interval = setInterval(() => setElapsedTime(prev => prev + 1000), 1000); }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleDailyTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t) }));
  };

  const handleStartDailyTaskTimer = async (task) => {
    try {
    const project = projects.find(p => p.id === task.projectId);
      if (!project) return;

      const timerData = await timerAPI.startTimer(project.id, task.id);
      setActiveTimerId(timerData.id);
      setCurrentProject(project);
      setCurrentTask(task);
      setElapsedTime(0);
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Failed to start timer:', err);
      setError('타이머를 시작하는데 실패했습니다.');
      // 실패 시 로컬 상태만 업데이트
      const project = projects.find(p => p.id === task.projectId);
      if (project) {
        setCurrentProject(project);
        setCurrentTask(task);
        setElapsedTime(0);
        setIsTimerRunning(true);
      }
    }
  };

  const handleToggleTask = (taskId) => {
    if (selectedProject) {
      const updateTasks = (p) => ({ ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t) });
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updateTasks(p) : p));
      setSelectedProject(prev => updateTasks(prev));
    }
  };

  const handleCreateProject = async (newProject) => {
    try {
      const createdProject = await projectAPI.createProject(newProject);
      setProjects(prev => [...prev, createdProject]);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('프로젝트를 생성하는데 실패했습니다.');
      // 실패 시 로컬 상태만 업데이트
      setProjects(prev => [...prev, newProject]);
    }
  };

  const handleAddTask = (newTask) => {
    if (selectedProject) {
      const updateTasks = (p) => ({ ...p, tasks: [...p.tasks, newTask] });
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updateTasks(p) : p));
      setSelectedProject(prev => updateTasks(prev));
    }
  };

  const handleStartTimerWithTask = async (project, task) => {
    try {
      const timerData = await timerAPI.startTimer(project.id, task.id);
      setActiveTimerId(timerData.id);
      // Task에 시작 시간 저장
      const taskWithStartTime = { ...task, startTime: new Date() };
      setCurrentProject(project);
      setCurrentTask(taskWithStartTime);
      setElapsedTime(0);
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Failed to start timer:', err);
      setError('타이머를 시작하는데 실패했습니다.');
      // 실패 시 로컬 상태만 업데이트
      const taskWithStartTime = { ...task, startTime: new Date() };
      setCurrentProject(project);
      setCurrentTask(taskWithStartTime);
      setElapsedTime(0);
      setIsTimerRunning(true);
    }
  };

  const handleStartTaskTimer = (task) => {
    if (selectedProject) {
      handleStartTimerWithTask(selectedProject, task);
    }
  };

  const handleStopTimer = () => {
    if (currentProject && currentTask && elapsedTime > 0) {
      const endTime = new Date();
      const startTime = currentTask.startTime || new Date(endTime.getTime() - elapsedTime);
      
      setProjects(prev => prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedTasks = p.tasks.map(t => 
          t.id !== currentTask.id 
            ? t 
            : { 
                ...t, 
                durationMs: (t.durationMs || 0) + elapsedTime,
                startTime: startTime,
                endTime: endTime
              }
        );
        return { ...p, tasks: updatedTasks, totalTimeMs: p.totalTimeMs + elapsedTime };
      }));
      if (selectedProject && selectedProject.id === currentProject.id) {
        setSelectedProject(prev => {
          const updatedTasks = prev.tasks.map(t => 
            t.id !== currentTask.id 
              ? t 
              : { 
                  ...t, 
                  durationMs: (t.durationMs || 0) + elapsedTime,
                  startTime: startTime,
                  endTime: endTime
                }
          );
          return { ...prev, tasks: updatedTasks, totalTimeMs: prev.totalTimeMs + elapsedTime };
        });
      }
    }
    setIsTimerRunning(false); setElapsedTime(0); setCurrentProject(null); setCurrentTask(null); setShowTimerFull(false);
  };

  const handleSaveReport = async (reportData) => {
    if (selectedProject) {
      try {
        setLoading(true);
        const savedReport = await reportAPI.createReport(selectedProject.id, reportData);
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, report: savedReport } : p));
        setSelectedProject(prev => ({ ...prev, report: savedReport }));
        // 보고서 저장 후 메인 페이지로 이동
        setSelectedProject(null);
      } catch (err) {
        console.error('Failed to save report:', err);
        setError('보고서 저장에 실패했습니다.');
        // 실패 시 로컬 상태만 업데이트
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, report: reportData } : p));
        setSelectedProject(prev => ({ ...prev, report: reportData }));
        // 실패 시에도 메인 페이지로 이동
        setSelectedProject(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveArchive = (archive) => {
    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 저장된 오늘의 아카이브 업데이트 (메인 페이지에서 계속 확인 가능)
    setSavedTodayArchive(archive);
    
    // 주간 아카이브 데이터 업데이트
    setWeeklyArchiveData(prev => {
      const updated = [...prev];
      
      // 오늘 날짜와 일치하는 데이터 찾기
      const todayIndex = updated.findIndex(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });
      
      if (todayIndex !== -1) {
        // 오늘 날짜 데이터가 있으면 업데이트
        updated[todayIndex] = {
          ...archive,
          date: today
        };
      } else {
        // 오늘 날짜 데이터가 없으면 추가 (가장 최근 날짜로)
        updated.push({
          ...archive,
          date: today
        });
        
        // 7일 데이터만 유지 (가장 오래된 것 제거)
        if (updated.length > 7) {
          updated.shift();
        }
        
        // 날짜순으로 정렬
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      return updated;
    });
  };

  const renderContent = () => {
    if (selectedReport) {
      return <ReportDetailPage project={selectedReport} onBack={() => setSelectedReport(null)} />;
    }
    if (selectedProject) { 
      const Page = selectedProject.memberCount > 1 ? TeamProjectPage : PersonalProjectPage; 
      return <Page 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
        onToggleTask={handleToggleTask} 
        onStartTaskTimer={handleStartTaskTimer} 
        onAddTask={() => setShowAddTask(true)} 
        isTimerRunning={isTimerRunning} 
        currentTaskId={currentTask?.id}
        currentProjectId={currentProject?.id}
        elapsedTime={elapsedTime} 
        onWriteReport={() => setShowWriteReport(true)}
      />; 
    }
    switch (activeTab) {
      case 'main': {
        const todayArchive = generateTodayArchive(projects, currentProject, currentTask, elapsedTime);
        return <MainPage user={currentUser} totalTimeMs={totalTimeMs} projects={projects} onProjectClick={setSelectedProject} onStartTimer={() => setShowTimerSelect(true)} onCreateProject={() => setShowCreateProject(true)} isTimerRunning={isTimerRunning} currentProjectId={currentProject?.id} elapsedTime={elapsedTime} currentTask={currentTask} currentProject={currentProject} onTimerClick={() => isTimerRunning && setShowTimerFull(true)} onToggleDailyTask={handleToggleDailyTask} onStartDailyTaskTimer={handleStartDailyTaskTimer} onShowReceipt={() => setShowReceiptPreview(true)} showReceiptPreview={showReceiptPreview} onSaveArchive={handleSaveArchive} savedTodayArchive={savedTodayArchive} onShowProfile={() => setShowProfile(true)} />;
      }
      case 'report': return <ReportPage projects={projects} onBack={() => setActiveTab('main')} onViewReport={(project) => setSelectedReport(project)} />;
      case 'archive': return archiveView === 'monthly' 
        ? <MonthlyArchivePage onBack={() => setArchiveView('weekly')} user={currentUser} onViewWeekly={handleViewWeekly} /> 
        : <WeeklyArchivePage user={currentUser} weeklyData={weeklyArchiveData} onBack={() => { setActiveTab('main'); setSelectedArchiveDate(null); }} onViewMonthly={() => setArchiveView('monthly')} initialDate={selectedArchiveDate} />;
      default: return null;
    }
  };

  const handleTabChange = (tab) => {
    // 프로젝트 선택 해제하고 해당 탭으로 이동
    if (selectedProject) {
      setSelectedProject(null);
    }
    if (selectedReport) {
      setSelectedReport(null);
    }
    setActiveTab(tab);
    if (tab === 'archive') {
      setArchiveView('weekly');
      // 오늘 날짜를 포함한 주로 업데이트
      const today = new Date();
      const weekData = getWeekDataForDate(today);
      setWeeklyArchiveData(weekData);
      setSelectedArchiveDate(today);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {error && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}
      {loading && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg">
          <span className="text-sm">로딩 중...</span>
        </div>
      )}
      {renderContent()}
      {!selectedReport && <BottomNav activeTab={selectedProject ? 'main' : activeTab} onTabChange={handleTabChange} />}
      <FloatingTimer isRunning={isTimerRunning} elapsedTime={elapsedTime} project={currentProject} task={currentTask} onStop={handleStopTimer} onExpand={() => setShowTimerFull(true)} />
      <TimerFullModal isOpen={showTimerFull} onClose={() => setShowTimerFull(false)} project={currentProject} task={currentTask} elapsedTime={elapsedTime} onStop={handleStopTimer} />
      <TimerSelectModal isOpen={showTimerSelect} onClose={() => setShowTimerSelect(false)} projects={projects} onSelectTask={handleStartTimerWithTask} />
      <CreateProjectModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} onCreate={handleCreateProject} currentUser={currentUser} />
      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} onAdd={handleAddTask} members={selectedProject?.members} />
      <WriteReportModal isOpen={showWriteReport} onClose={() => setShowWriteReport(false)} project={selectedProject} onSave={handleSaveReport} />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={currentUser} onUpdateUser={handleUpdateUser} />
      <ReceiptPreviewModal 
        isOpen={showReceiptPreview} 
        onClose={() => setShowReceiptPreview(false)} 
        user={currentUser}
        archive={generateTodayArchive(projects, currentProject, currentTask, elapsedTime)}
        hasTimerButton={!isTimerRunning && projects.length > 0}
        onSave={async () => {
          const archive = generateTodayArchive(projects, currentProject, currentTask, elapsedTime);
          if (archive.tasks.length === 0) {
            alert('저장할 작업이 없습니다.');
            return;
          }
          
          try {
            // 실제 저장 시점 기록
            const archiveWithTimestamp = {
              ...archive,
              recordedAt: new Date()
            };
            
            // 백엔드에 아카이브 저장 시도
            try {
              await archiveAPI.saveTodayArchive(archiveWithTimestamp);
            } catch (apiErr) {
              console.warn('API 저장 실패 (로컬 데이터는 업데이트됨):', apiErr);
              // API 저장 실패해도 로컬 데이터는 업데이트
            }
            
            // 아카이브 페이지 데이터 업데이트 (항상 실행)
            if (handleSaveArchive) {
              handleSaveArchive(archiveWithTimestamp);
            }
            
            alert(`${formatDate(archive.date)} 오늘의 영수증이 저장되었습니다!`);
            setShowReceiptPreview(false);
          } catch (err) {
            console.error('Failed to save archive:', err);
            alert('아카이브 저장에 실패했습니다. 다시 시도해주세요.');
          }
        }}
      />
      
      {/* 스크롤바 숨기기 스타일 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}