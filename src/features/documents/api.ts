import { ApiProblem, apiRequest, apiUrl, getCsrfToken } from '../../lib/api';
import type { LegalDocument } from './types';

export const getDocuments = (caseId: string, cursor?: string, signal?: AbortSignal) => apiRequest<{ data: LegalDocument[]; meta: { nextCursor: string | null } }>(`/documents?caseId=${caseId}&limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, { signal });

const multipartRequest = (path: string, form: FormData, onProgress: (percent: number) => void) => new Promise<LegalDocument>((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', apiUrl(path));
  xhr.withCredentials = true;
  const csrf = getCsrfToken();
  if (csrf) xhr.setRequestHeader('x-csrf-token', csrf);
  xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
  xhr.onerror = () => reject(new Error('No se pudo conectar con el servidor.'));
  xhr.onload = () => {
    let body: unknown;
    try { body = JSON.parse(xhr.responseText); } catch { body = null; }
    if (xhr.status >= 200 && xhr.status < 300) { resolve((body as { data: LegalDocument }).data); return; }
    const fallback = { type: 'about:blank', title: 'Error HTTP', status: xhr.status, detail: 'No se pudo completar el upload.' };
    reject(new ApiProblem((body && typeof body === 'object' ? body : fallback) as typeof fallback));
  };
  xhr.send(form);
});

export const uploadDocument = (form: FormData, onProgress: (percent: number) => void) => multipartRequest('/documents', form, onProgress);
export const uploadDocumentVersion = (documentId: string, file: File, onProgress: (percent: number) => void) => { const form = new FormData(); form.append('file', file); return multipartRequest(`/documents/${documentId}/versions`, form, onProgress); };
export async function downloadDocumentVersion(documentId: string, version: { id: string; originalName: string }) { const response = await fetch(apiUrl(`/documents/${documentId}/versions/${version.id}/download`), { credentials: 'include' }); if (!response.ok) { const fallback = { type: 'about:blank', title: 'Error HTTP', status: response.status, detail: 'No se pudo descargar el archivo.' }; throw new ApiProblem(await response.json().catch(() => fallback)); } const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = version.originalName; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); }
