import { AppState, User, Contact, LegalCase, Court, ManagementOffice, Task, CaseAction, SubCase, Note, ActivityLog } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Diego Guzmán', role: 'Jefe' },
  { id: 'u2', name: 'Silvina', role: 'Socia' },
  { id: 'u3', name: 'Cony', role: 'Abogada' },
  { id: 'u4', name: 'Agustina', role: 'Abogada' },
  { id: 'u5', name: 'Karen', role: 'Secretaria' },
];

export const mockCourts: Court[] = [
  { id: 'c1', name: 'Juzgado del Trabajo de la Novena Nominación' },
  { id: 'c2', name: 'Juzgado en lo Civil y Comercial N.º 5' },
  { id: 'c3', name: 'Juzgado de Familia de 2da Nominación' },
];

export const mockOffices: ManagementOffice[] = [
  { id: 'o1', name: 'Oficina de Gestión Asociada del Trabajo N.º 3' },
  { id: 'o2', name: 'Oficina Central de Notificaciones' },
];

export const mockContacts: Contact[] = [
  { id: 'cnt1', firstName: 'Karen Nerea', lastName: 'Díaz', type: 'Cliente', dni: '35123456', phone: '3511234567', email: 'karen.diaz@example.com' },
  { id: 'cnt2', firstName: 'Panini S.A.', type: 'Empresa', cuit: '30-12345678-9', phone: '1144445555' },
  { id: 'cnt3', firstName: 'Carlos', lastName: 'Gómez', type: 'Cliente', dni: '28999888', email: 'carlosgomez@example.com' },
  { id: 'cnt4', firstName: 'Constructora del Sur SRL', type: 'Empresa', cuit: '30-98765432-1' },
  { id: 'cnt5', firstName: 'María', lastName: 'López', type: 'Abogado', phone: '3519998888', notes: 'Abogada de la contraparte' },
  { id: 'cnt6', firstName: 'Juan', lastName: 'Pérez', type: 'Perito', phone: '3517776666', notes: 'Perito contable' },
  { id: 'cnt7', firstName: 'Laura', lastName: 'Martínez', type: 'Cliente', dni: '40111222' },
  { id: 'cnt8', firstName: 'Banco Nación', type: 'Empresa', cuit: '30-50001091-2' },
];

const today = new Date().toISOString();
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

export const mockCases: LegalCase[] = [
  {
    id: 'case1',
    title: 'Díaz Karen Nerea c/ Panini S.A.',
    caseNumber: '123456/2026',
    type: 'Laboral',
    status: 'Activo',
    startDate: '2026-05-07T00:00:00Z',
    courtId: 'c1',
    managementOfficeId: 'o1',
    clientId: 'cnt1',
    opponentId: 'cnt2',
    responsibleId: 'u4', // Agustina
    createdAt: '2026-05-07T00:00:00Z',
    updatedAt: today,
  },
  {
    id: 'case2',
    title: 'Gómez Carlos c/ Constructora del Sur SRL',
    caseNumber: '98765/2025',
    type: 'Laboral',
    status: 'Activo',
    startDate: '2025-10-15T00:00:00Z',
    courtId: 'c1',
    managementOfficeId: 'o1',
    clientId: 'cnt3',
    opponentId: 'cnt4',
    responsibleId: 'u3', // Cony
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'case3',
    title: 'Martínez Laura c/ Banco Nación s/ Daños y Perjuicios',
    caseNumber: '44556/2026',
    type: 'Civil y Comercial',
    status: 'Pendiente',
    startDate: '2026-02-10T00:00:00Z',
    courtId: 'c2',
    clientId: 'cnt7',
    opponentId: 'cnt8',
    responsibleId: 'u1', // Diego
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: lastWeek,
  }
];

export const mockActions: CaseAction[] = [
  {
    id: 'act1',
    caseId: 'case1',
    title: 'Presentación de demanda',
    type: 'Demanda',
    documentDate: '2026-05-07T10:00:00Z',
    systemUploadDate: '2026-05-07T10:30:00Z',
    uploadedById: 'u5',
    hasFile: true,
  },
  {
    id: 'act2',
    caseId: 'case1',
    title: 'Decreto del juzgado',
    type: 'Decreto',
    documentDate: '2026-05-12T09:00:00Z',
    systemUploadDate: '2026-05-12T11:00:00Z',
    uploadedById: 'u4',
    hasFile: true,
  },
  {
    id: 'act3',
    caseId: 'case1',
    title: 'Cédula presentada',
    type: 'Cédula',
    documentDate: '2026-05-18T14:00:00Z',
    systemUploadDate: '2026-05-18T15:00:00Z',
    uploadedById: 'u5',
    presentedById: 'u3',
  },
  {
    id: 'act4',
    caseId: 'case1',
    title: 'Contestación de demanda',
    type: 'Contestación',
    documentDate: '2026-05-27T12:00:00Z',
    systemUploadDate: '2026-05-28T09:00:00Z',
    uploadedById: 'u5',
    hasFile: true,
  }
];

export const mockSubCases: SubCase[] = [
  {
    id: 'sub1',
    caseId: 'case1',
    type: 'Prueba',
    title: 'A1 - Documental',
    status: 'Activo',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'sub2',
    caseId: 'case1',
    type: 'Prueba',
    title: 'A2 - Testimonial',
    status: 'Activo',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'sub3',
    caseId: 'case2',
    type: 'Incidente',
    title: 'Incidente de Nulidad',
    status: 'Activo',
    createdAt: '2026-01-10T00:00:00Z',
  }
];

export const mockTasks: Task[] = [
  {
    id: 'tsk1',
    title: 'Comprar movilidad',
    description: 'Para el expediente de Díaz',
    caseId: 'case1',
    responsibleId: 'u5', // Karen
    createdById: 'u4',
    createdAt: yesterday,
    dueDate: nextWeek,
    priority: 'Alta',
    status: 'Pendiente'
  },
  {
    id: 'tsk2',
    title: 'Redactar oficio a AFIP',
    caseId: 'case2',
    responsibleId: 'u3', // Cony
    createdById: 'u1',
    createdAt: lastWeek,
    dueDate: today,
    priority: 'Media',
    status: 'Pendiente'
  },
  {
    id: 'tsk3',
    title: 'Contactar perito',
    caseId: 'case1',
    subCaseId: 'sub2',
    responsibleId: 'u4', // Agustina
    createdById: 'u4',
    createdAt: lastWeek,
    status: 'Completada',
    priority: 'Baja'
  }
];

export const mockNotes: Note[] = [
  {
    id: 'nt1',
    content: 'Cliente confirmó disponibilidad para audiencia.',
    authorId: 'u4',
    caseId: 'case1',
    createdAt: yesterday,
  }
];

export const mockLogs: ActivityLog[] = [
  {
    id: 'log1',
    userId: 'u4', // Agustina
    action: 'creó el juicio Díaz Karen Nerea c/ Panini S.A.',
    timestamp: '2026-05-07T00:00:00Z',
    relatedEntityId: 'case1',
    relatedEntityType: 'Case'
  },
  {
    id: 'log2',
    userId: 'u5', // Karen
    action: 'agregó Presentación de demanda',
    timestamp: '2026-05-07T10:30:00Z',
    relatedEntityId: 'act1',
    relatedEntityType: 'Action'
  },
  {
    id: 'log3',
    userId: 'u4', // Agustina
    action: 'agregó una nota',
    timestamp: yesterday,
    relatedEntityId: 'nt1',
    relatedEntityType: 'Note'
  }
];

export const initialAppState: AppState = {
  users: mockUsers,
  contacts: mockContacts,
  cases: mockCases,
  actions: mockActions,
  subCases: mockSubCases,
  tasks: mockTasks,
  notes: mockNotes,
  logs: mockLogs,
  courts: mockCourts,
  managementOffices: mockOffices,
};
