import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, User, Contact, LegalCase, Task, CaseAction, SubCase, Note, ActivityLog, Court, ManagementOffice } from '../types';
import { initialAppState } from '../data/mockData';

interface AppContextType extends AppState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  resetData: () => void;
  
  // Contacts
  addContact: (contact: Omit<Contact, 'id'>) => Contact;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  
  // Cases
  addCase: (legalCase: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>) => LegalCase;
  updateCase: (id: string, legalCase: Partial<LegalCase>) => void;
  
  // Actions
  addAction: (action: Omit<CaseAction, 'id' | 'systemUploadDate'>) => CaseAction;
  
  // SubCases
  addSubCase: (subCase: Omit<SubCase, 'id' | 'createdAt'>) => SubCase;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  
  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'estudio_guzman_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...initialAppState, 
          ...parsed,
          users: parsed.users || initialAppState.users,
          contacts: parsed.contacts || initialAppState.contacts,
          cases: parsed.cases || initialAppState.cases,
          actions: parsed.actions || initialAppState.actions,
          subCases: parsed.subCases || initialAppState.subCases,
          tasks: parsed.tasks || initialAppState.tasks,
          notes: parsed.notes || initialAppState.notes,
          logs: parsed.logs || initialAppState.logs,
          courts: parsed.courts || initialAppState.courts,
          managementOffices: parsed.managementOffices || initialAppState.managementOffices,
        };
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return initialAppState;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(state.users[0] || null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const resetData = () => {
    setState(initialAppState);
    setCurrentUser(initialAppState.users[0]);
  };

  const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

  const addLog = (actionStr: string, entityId?: string, entityType?: ActivityLog['relatedEntityType']) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: generateId('log'),
      userId: currentUser.id,
      action: actionStr,
      timestamp: new Date().toISOString(),
      relatedEntityId: entityId,
      relatedEntityType: entityType,
    };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs] }));
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = { ...contact, id: generateId('cnt') };
    setState(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
    addLog(`creó el contacto ${contact.firstName} ${contact.lastName || ''}`, newContact.id, 'Contact');
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
    addLog('actualizó un contacto', id, 'Contact');
  };

  const addCase = (legalCase: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: LegalCase = {
      ...legalCase,
      id: generateId('case'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, cases: [...prev.cases, newCase] }));
    addLog(`creó el juicio ${newCase.title}`, newCase.id, 'Case');
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<LegalCase>) => {
    setState(prev => ({
      ...prev,
      cases: prev.cases.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
    addLog('actualizó un juicio', id, 'Case');
  };

  const addAction = (action: Omit<CaseAction, 'id' | 'systemUploadDate'>) => {
    const newAction: CaseAction = {
      ...action,
      id: generateId('act'),
      systemUploadDate: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    
    // Update case updated At
    updateCase(action.caseId, { updatedAt: new Date().toISOString() });
    
    addLog(`agregó actuación: ${action.title}`, newAction.id, 'Action');
    return newAction;
  };

  const addSubCase = (subCase: Omit<SubCase, 'id' | 'createdAt'>) => {
    const newSubCase: SubCase = {
      ...subCase,
      id: generateId('sub'),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, subCases: [...prev.subCases, newSubCase] }));
    addLog(`creó un ${subCase.type}: ${subCase.title}`, newSubCase.id, 'SubCase');
    return newSubCase;
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId('tsk'),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    addLog(`creó la tarea: ${task.title}`, newTask.id, 'Task');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const isCompleting = updates.status === 'Completada' && t.status !== 'Completada';
          if (isCompleting) {
            addLog(`completó la tarea: ${t.title}`, t.id, 'Task');
          }
          return { ...t, ...updates };
        }
        return t;
      })
    }));
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: generateId('nt'),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, notes: [...prev.notes, newNote] }));
    addLog(`agregó una nota`, newNote.id, 'Note');
    return newNote;
  };

  return (
    <AppContext.Provider value={{
      ...state,
      currentUser,
      setCurrentUser,
      resetData,
      addContact,
      updateContact,
      addCase,
      updateCase,
      addAction,
      addSubCase,
      addTask,
      updateTask,
      addNote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
