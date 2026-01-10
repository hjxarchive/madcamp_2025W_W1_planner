// API Base URL 설정 (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 공통 fetch 함수
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ============================================
// 프로젝트 API
// ============================================
export const projectAPI = {
  // 프로젝트 목록 조회
  getProjects: async () => {
    return apiRequest('/projects');
  },

  // 프로젝트 상세 조회
  getProject: async (projectId) => {
    return apiRequest(`/projects/${projectId}`);
  },

  // 프로젝트 생성
  createProject: async (projectData) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // 프로젝트 수정
  updateProject: async (projectId, projectData) => {
    return apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  // 프로젝트 삭제
  deleteProject: async (projectId) => {
    return apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Task API
// ============================================
export const taskAPI = {
  // Task 목록 조회 (프로젝트별)
  getTasks: async (projectId) => {
    return apiRequest(`/projects/${projectId}/tasks`);
  },

  // Task 생성
  createTask: async (projectId, taskData) => {
    return apiRequest(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Task 수정
  updateTask: async (projectId, taskId, taskData) => {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Task 삭제
  deleteTask: async (projectId, taskId) => {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Task 완료 상태 토글
  toggleTask: async (projectId, taskId, isDone) => {
    return apiRequest(`/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isDone }),
    });
  },
};

// ============================================
// 타이머 API
// ============================================
export const timerAPI = {
  // 타이머 시작
  startTimer: async (projectId, taskId) => {
    return apiRequest('/timer/start', {
      method: 'POST',
      body: JSON.stringify({ projectId, taskId }),
    });
  },

  // 타이머 중지
  stopTimer: async (timerId, elapsedTime) => {
    return apiRequest(`/timer/${timerId}/stop`, {
      method: 'POST',
      body: JSON.stringify({ elapsedTime }),
    });
  },

  // 현재 실행 중인 타이머 조회
  getActiveTimer: async () => {
    return apiRequest('/timer/active');
  },
};

// ============================================
// 아카이브 API
// ============================================
export const archiveAPI = {
  // 오늘의 아카이브 저장
  saveTodayArchive: async (archiveData) => {
    return apiRequest('/archive/today', {
      method: 'POST',
      body: JSON.stringify(archiveData),
    });
  },

  // 주간 아카이브 조회
  getWeeklyArchive: async (startDate, endDate) => {
    return apiRequest(`/archive/weekly?start=${startDate}&end=${endDate}`);
  },

  // 월간 아카이브 조회
  getMonthlyArchive: async (year, month) => {
    return apiRequest(`/archive/monthly?year=${year}&month=${month}`);
  },

  // 아카이브 이미지 다운로드
  downloadArchiveImage: async (archiveId) => {
    const response = await fetch(`${API_BASE_URL}/archive/${archiveId}/image`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive-${archiveId}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// ============================================
// 보고서 API
// ============================================
export const reportAPI = {
  // 보고서 작성
  createReport: async (projectId, reportData) => {
    return apiRequest(`/projects/${projectId}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  // 보고서 조회
  getReport: async (projectId) => {
    return apiRequest(`/projects/${projectId}/report`);
  },

  // 보고서 목록 조회
  getReports: async () => {
    return apiRequest('/reports');
  },
};

// ============================================
// 사용자 API
// ============================================
export const userAPI = {
  // 사용자 정보 조회
  getUser: async () => {
    return apiRequest('/user');
  },

  // 사용자 정보 수정
  updateUser: async (userData) => {
    return apiRequest('/user', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};
