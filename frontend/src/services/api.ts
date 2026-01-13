import { API_BASE_URL } from '@constants/index';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ============ Type Definitions ============
export interface User {
  id: string;
  firebaseUid: string;
  nickname: string;
  profileEmoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  nickname: string;
  profileEmoji: string | null;
  role: 'owner' | 'member';
}

export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  assigneeId: string | null;
  assigneeNickname: string | null;
  displayOrder: number;
  totalTimeMinutes: number;
}

export type ProjectStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'COMPLETED';

export interface ProjectSummary {
  id: string;
  title: string;
  coverImageUrl: string | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  status: ProjectStatus;
  rating: number | null;
  completedAt: string | null;
  memberCount: number;
  completedChecklistCount: number;
  totalChecklistCount: number;
  totalTimeMinutes: number;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  coverImageUrl: string | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  status: ProjectStatus;
  rating: number | null;
  completedAt: string | null;
  members: ProjectMember[];
  checklists: ChecklistItem[];
  createdAt: string;
}

export interface TimeLog {
  id: string;
  checklistId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes?: number;
}

export interface TimeLogDetail {
  id: string;
  checklistId: string;
  checklistContent: string;
  projectId: string;
  projectTitle: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
}

export interface CompletedTask {
  id: string;
  content: string;
  projectId: string;
  projectTitle: string;
  completedAt: string;
  totalTimeMinutes: number;
}

export interface TodaySummaryResponse {
  date: string;
  totalMinutes: number;
  totalSeconds?: number; // 초 단위 정밀도
  completedTasksCount: number;
  projects: {
    projectId: string;
    projectTitle: string;
    minutes: number;
    completedTasksCount: number;
  }[];
  timeLogs: TimeLogDetail[];
  completedTasks: CompletedTask[];
}

export interface Location {
  id: string;
  name: string;
}

export interface StudySession {
  id: string;
  userId: string;
  locationId: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface Participant {
  userId: string;
  nickname: string;
  profileEmoji: string | null;
  currentProject: string | null;
  todayTotalMinutes: number;
  joinedAt: string;
}

export interface DailyReceipt {
  id: string;
  date: string;
  imageUrl: string | null;
  totalMinutes: number;
  completedTasksCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// ============ API Service Class ============
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.log(`[API] Error: ${response.status}`, data);
        return {
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }

      console.log(`[API] Success: ${response.status}`);
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.log(`[API] Network Error:`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Base HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============ Users API ============
  
  /** 내 정보 조회 */
  async getMe() {
    return this.get<User>('/users/me');
  }

  /** 회원가입 (최초 로그인 시) */
  async createUser(data: { nickname: string; profileEmoji?: string }) {
    return this.post<User>('/users', data);
  }

  /** 내 정보 수정 */
  async updateMe(data: { nickname?: string; profileEmoji?: string }) {
    return this.patch<User>('/users/me', data);
  }

  /** 닉네임으로 사용자 검색 (멤버 초대용) */
  async searchUserByNickname(nickname: string) {
    return this.get<User>(`/users/search?nickname=${encodeURIComponent(nickname)}`);
  }

  /** 닉네임 사용 가능 여부 확인 */
  async checkNickname(nickname: string) {
    return this.get<{ available: boolean; message: string }>(`/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  }

  // ============ Projects API ============
  
  /** 진행 중인 프로젝트 (개인 + 협업 모두) */
  async getCurrentProjects() {
    return this.get<PaginatedResponse<ProjectSummary>>('/projects/current');
  }

  /** 완료된 프로젝트 */
  async getPastProjects() {
    return this.get<PaginatedResponse<ProjectSummary>>('/projects/past');
  }

  /** 프로젝트 상세 조회 */
  async getProject(id: string) {
    return this.get<ProjectDetail>(`/projects/${id}`);
  }

  /** 프로젝트 생성 (개인/협업 모두 지원) */
  async createProject(data: {
    title: string;
    coverImageUrl?: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    memberNicknames?: string[];  // 협업 프로젝트 생성 시 함께 추가할 멤버 닉네임
  }) {
    return this.post<ProjectDetail>('/projects', data);
  }

  /** 프로젝트 수정 */
  async updateProject(id: string, data: {
    title?: string;
    coverImageUrl?: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    rating?: number;
  }) {
    return this.patch<ProjectDetail>(`/projects/${id}`, data);
  }

  /** 프로젝트 삭제 */
  async deleteProject(id: string) {
    return this.delete<void>(`/projects/${id}`);
  }

  /** 프로젝트 완료 (보고서 작성) */
  async completeProject(id: string, data: { rating: number }) {
    return this.post<{
      id: string;
      title: string;
      rating: number;
      completedAt: string;
      totalTimeMinutes: number;
      message: string;
    }>(`/projects/${id}/complete`, data);
  }

  // ============ Project Members API ============
  
  /** 멤버 추가 (닉네임으로 초대) */
  async addProjectMember(projectId: string, data: { userId: string; role?: string }) {
    return this.post<ProjectMember>(`/projects/${projectId}/members`, data);
  }

  /** 멤버 삭제 */
  async removeProjectMember(projectId: string, userId: string) {
    return this.delete<void>(`/projects/${projectId}/members/${userId}`);
  }

  // ============ Checklists API ============
  
  /** 체크리스트 추가 */
  async createChecklist(projectId: string, data: {
    content: string;
    assigneeId?: string;
    displayOrder?: number;
  }) {
    return this.post<ChecklistItem>(`/projects/${projectId}/checklists`, data);
  }

  /** 체크리스트 수정 */
  async updateChecklist(id: string, data: {
    content?: string;
    isCompleted?: boolean;
    assigneeId?: string;
    displayOrder?: number;
  }) {
    return this.patch<ChecklistItem>(`/checklists/${id}`, data);
  }

  /** 체크리스트 삭제 */
  async deleteChecklist(id: string) {
    return this.delete<void>(`/checklists/${id}`);
  }

  // ============ Time Logs API ============
  
  /** 타이머 시작 */
  async startTimer(checklistId: string) {
    return this.post<TimeLog>(`/checklists/${checklistId}/time-logs/start`);
  }

  /** 타이머 정지 */
  async stopTimer(timeLogId: string) {
    return this.post<TimeLog>(`/time-logs/${timeLogId}/stop`);
  }

  /** 오늘 활동 요약 조회 (일일 영수증용) */
  async getTodaySummary() {
    return this.get<TodaySummaryResponse>('/time-logs/today');
  }

  // ============ Locations API ============
  
  /** 장소 목록 조회 */
  async getLocations() {
    return this.get<{ data: Location[] }>('/locations');
  }

  /** 장소 생성 */
  async createLocation(data: { name: string }) {
    return this.post<Location>('/locations', data);
  }

  // ============ Study Sessions API ============
  
  /** 스터디 세션 참가 */
  async joinStudySession(locationId: string) {
    return this.post<StudySession>(`/locations/${locationId}/join`);
  }

  /** 스터디 세션 퇴장 */
  async leaveStudySession(sessionId: string) {
    return this.post<StudySession>(`/study-sessions/${sessionId}/leave`);
  }

  /** 특정 장소의 참가자 조회 */
  async getLocationParticipants(locationId: string) {
    return this.get<{
      location: Location;
      participants: Participant[];
    }>(`/locations/${locationId}/participants`);
  }

  // ============ Daily Receipts API ============
  
  /** 영수증 목록 조회 (아카이브 탭) */
  async getReceipts(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<PaginatedResponse<DailyReceipt>>(`/receipts${query}`);
  }

  /** 특정 날짜 영수증 조회 */
  async getReceiptByDate(date: string) {
    return this.get<DailyReceipt>(`/receipts/${date}`);
  }

  /** 영수증 생성/갱신 */
  async createOrUpdateReceipt(data: { date: string; imageUrl?: string }) {
    return this.post<DailyReceipt>('/receipts', data);
  }

  /** 영수증 이미지 생성 요청 */
  async generateReceiptImage(date: string) {
    return this.post<DailyReceipt>(`/receipts/${date}/generate-image`, {});
  }

  /** 영수증 상세 정보 조회 */
  async getReceiptDetails(date: string) {
    return this.get<{
      id: string | null;
      date: string;
      imageUrl: string | null;
      tasks: { taskName: string; projectName: string; durationMs: number }[];
      totalTimeMs: number;
      totalMinutes: number;
      completedTasksCount: number;
      timeSlots: boolean[];
      createdAt: string | null;
    }>(`/receipts/${date}/details`);
  }

  /** 영수증 삭제 */
  async deleteReceipt(date: string) {
    return this.delete<void>(`/receipts/${date}`);
  }

  // ============ Collab Projects API ============
  
  /** 협업 프로젝트 목록 조회 (멤버가 2명 이상인 프로젝트) */
  async getCollabProjects() {
    // 현재 진행 중인 프로젝트에서 협업 프로젝트(멤버 2명 이상)만 필터링
    const response = await this.get<PaginatedResponse<ProjectSummary>>('/projects/current');
    if (response.data) {
      const collabProjects = response.data.data.filter(p => p.memberCount > 1);
      return {
        ...response,
        data: collabProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: undefined as string | undefined,
          color: '#6366F1', // 기본 색상
          members: [] as { id: string; name: string; avatar?: string; role: 'owner' | 'admin' | 'member'; isOnline: boolean }[],
          taskCount: p.totalChecklistCount,
          completedCount: p.completedChecklistCount,
          lastActivity: p.createdAt,
        })),
      };
    }
    return { ...response, data: [] };
  }
}

export const api = new ApiService();
export default api;
