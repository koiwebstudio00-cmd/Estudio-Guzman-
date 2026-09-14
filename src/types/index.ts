export type UserRole = 'Jefe' | 'Socia' | 'Abogada' | 'Secretaria';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ContactType = 'Cliente' | 'Abogado' | 'Empresa' | 'Representante' | 'Perito' | 'Testigo' | 'Contacto judicial' | 'Policía' | 'Otro';

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  type: ContactType;
  dni?: string;
  cuit?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type CaseStatus = 'Activo' | 'Pendiente' | 'Cerrado' | 'Archivado';
export type CaseType = 'Laboral' | 'Civil y Comercial' | 'Penal' | 'Familia';

export interface Court {
  id: string;
  name: string; // e.g. "Juzgado del Trabajo de la Novena Nominación"
}

export interface ManagementOffice {
  id: string;
  name: string; // e.g. "Oficina de Gestión Asociada del Trabajo N.º 3"
}

export interface LegalCase {
  id: string;
  type: CaseType;
  title: string; // Carátula
  caseNumber: string; // Número de expediente
  status: CaseStatus;
  startDate: string;
  
  courtId?: string;
  managementOfficeId?: string;
  
  clientId: string; // Actor
  opponentId?: string; // Demandado (can be a Contact)
  
  responsibleId: string; // User ID
  
  createdAt: string;
  updatedAt: string;
}

export type ActionType = 'Demanda' | 'Contestación' | 'Cédula' | 'Decreto' | 'Resolución' | 'Presentación' | 'Oficio' | 'Notificación' | 'Otro';

export interface CaseAction {
  id: string;
  caseId: string; // Juicio principal
  subCaseId?: string; // Cuaderno o incidente
  
  title: string;
  type: ActionType;
  documentDate: string;
  presentationDate?: string;
  systemUploadDate: string;
  
  uploadedById: string; // User ID
  presentedById?: string; // User ID
  
  description?: string;
  hasFile?: boolean; // Mock PDF existence
}

export interface SubCase {
  id: string;
  caseId: string;
  type: 'Prueba' | 'Incidente';
  title: string; // e.g. "A1 - Documental"
  description?: string;
  status: 'Activo' | 'Resuelto' | 'Cerrado';
  createdAt: string;
}

export type TaskStatus = 'Pendiente' | 'En progreso' | 'Completada';
export type TaskPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface Task {
  id: string;
  title: string;
  description?: string;
  responsibleId: string; // User ID
  createdById: string; // User ID
  
  createdAt: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  caseId?: string;
  subCaseId?: string;
  
  notes?: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  caseId?: string;
  subCaseId?: string;
  contactId?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  relatedEntityId?: string;
  relatedEntityType?: 'Case' | 'Task' | 'Contact' | 'Action' | 'SubCase' | 'Note';
}

export interface AppState {
  users: User[];
  contacts: Contact[];
  cases: LegalCase[];
  actions: CaseAction[];
  subCases: SubCase[];
  tasks: Task[];
  notes: Note[];
  logs: ActivityLog[];
  courts: Court[];
  managementOffices: ManagementOffice[];
}
