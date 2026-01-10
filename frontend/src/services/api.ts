import { API_BASE_URL } from '@constants/index';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

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
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============ Auth API ============
  async login(email: string, password: string) {
    return this.post<{ access_token: string; user: any }>('/auth/login', {
      email,
      password,
    });
  }

  async register(email: string, password: string, name: string) {
    return this.post<{ access_token: string; user: any }>('/auth/register', {
      email,
      password,
      name,
    });
  }

  async getProfile() {
    return this.get<any>('/auth/profile');
  }

  // ============ Projects API ============
  async getProjects() {
    return this.get<any[]>('/projects');
  }

  async getProject(id: string) {
    return this.get<any>(`/projects/${id}`);
  }

  async createProject(data: {
    title: string;
    description?: string;
    color?: string;
    icon?: string;
    isTeam?: boolean;
  }) {
    return this.post<any>('/projects', data);
  }

  async updateProject(id: string, data: Partial<{
    title: string;
    description: string;
    color: string;
    icon: string;
  }>) {
    return this.patch<any>(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.delete<void>(`/projects/${id}`);
  }

  async archiveProject(id: string) {
    return this.patch<any>(`/projects/${id}/archive`, {});
  }

  // ============ Tasks API ============
  async getTasks(projectId?: string) {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    return this.get<any[]>(endpoint);
  }

  async getTodayTasks() {
    return this.get<any[]>('/tasks/today');
  }

  async getTask(id: string) {
    return this.get<any>(`/tasks/${id}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    projectId?: string;
    dueDate?: string;
    priority?: number;
  }) {
    return this.post<any>('/tasks', data);
  }

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    priority: number;
  }>) {
    return this.patch<any>(`/tasks/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.delete<void>(`/tasks/${id}`);
  }

  async toggleTask(id: string) {
    return this.patch<any>(`/tasks/${id}/toggle`, {});
  }

  // ============ Time Tracking API ============
  async startTimer(taskId?: string) {
    return this.post<any>('/time-tracking/start', { taskId });
  }

  async stopTimer() {
    return this.post<any>('/time-tracking/stop', {});
  }

  async getTodayTime() {
    return this.get<{ totalSeconds: number }>('/time-tracking/today');
  }

  async getTimeHistory(startDate?: string, endDate?: string) {
    let endpoint = '/time-tracking/history';
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.get<any[]>(endpoint);
  }

  // ============ Study Sessions API ============
  async getStudySessions() {
    return this.get<any[]>('/study-sessions');
  }

  async createStudySession(data: {
    title: string;
    description?: string;
    scheduledAt?: string;
    duration?: number;
  }) {
    return this.post<any>('/study-sessions', data);
  }

  async joinStudySession(id: string) {
    return this.post<any>(`/study-sessions/${id}/join`, {});
  }

  async leaveStudySession(id: string) {
    return this.post<any>(`/study-sessions/${id}/leave`, {});
  }

  // ============ Archive API ============
  async getArchivedProjects() {
    return this.get<any[]>('/projects/archived');
  }

  async getArchiveReceipt(projectId: string) {
    return this.get<any>(`/projects/${projectId}/receipt`);
  }

  // ============ Collab API ============
  async getCollabProjects() {
    return this.get<any[]>('/collab/projects');
  }

  async createCollabProject(data: {
    title: string;
    description?: string;
  }) {
    return this.post<any>('/collab/projects', data);
  }

  async inviteToCollab(projectId: string, email: string) {
    return this.post<any>(`/collab/projects/${projectId}/invite`, { email });
  }
}

export const api = new ApiService();
export default api;
