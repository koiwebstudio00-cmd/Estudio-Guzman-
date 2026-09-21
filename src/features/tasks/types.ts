export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export interface TaskUser { id: string; name: string; email?: string }
export interface TaskComment { id: string; content: string; version: number; createdAt: string; updatedAt: string; author: Pick<TaskUser, 'id' | 'name'> }
export interface TaskHistory { id: string; fromStatus: TaskStatus | null; toStatus: TaskStatus; reason: string | null; changedAt: string; changedBy: Pick<TaskUser, 'id' | 'name'> }
export interface Task {
  id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority;
  dueDate: string | null; completedAt: string | null; version: number; createdAt: string; updatedAt: string;
  case: { id: string; title: string; caseNumber: string; status: string } | null;
  subCase: { id: string; title: string; status: string } | null;
  createdBy: Pick<TaskUser, 'id' | 'name'>; assignees: TaskUser[]; history: TaskHistory[];
  comments: TaskComment[]; documentCount: number;
}
