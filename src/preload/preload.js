'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vibeCodingApp', {
  // 강의 매니페스트 읽기
  readManifest: () => ipcRenderer.invoke('read-manifest'),

  // 공식자료 연구노트 카탈로그 읽기
  readOfficialSources: () => ipcRenderer.invoke('read-official-sources'),

  // 커뮤니티에 공유 가능한 별첨자료 목록 읽기
  readShareResources: () => ipcRenderer.invoke('read-community-share-resources'),

  // content 폴더의 file:// 기반 URL 반환
  getContentBase: () => ipcRenderer.invoke('get-content-base'),

  // 전체화면 토글 (true/false 반환)
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),

  // 현재 전체화면 상태 확인
  getFullscreen: () => ipcRenderer.invoke('get-fullscreen'),

  // 현재 강의/별첨을 PDF 파일로 저장
  savePdf: (data, defaultPath) => ipcRenderer.invoke('save-pdf', data, defaultPath),

  // 외부 브라우저에서 안전한 http/https URL 열기
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // 사용자 데이터 저장/불러오기 (app userData 폴더)
  saveData: (key, value) => ipcRenderer.invoke('save-user-data', key, value),
  loadData: (key) => ipcRenderer.invoke('load-user-data', key),
  exportData: () => ipcRenderer.invoke('export-user-data'),
  importData: () => ipcRenderer.invoke('import-user-data'),
  openContentPath: (relativePath) => ipcRenderer.invoke('open-content-path', relativePath),

  // -------------------------------------------------------------------------
  // JuCoding Archive (외부 자료함) — V4.1
  //
  // Reading material never changes the lecture. The only mutating call is
  // applyProposal(), which the main process backs up first.
  // -------------------------------------------------------------------------

  // Folder tree state, plus the AI provider status ("AI 정리는 연결되지 않았습니다."
  // when no AI provider is configured — the Archive still works without one).
  archiveStatus: () => ipcRenderer.invoke('archive-status'),

  // Reveals Archive/<which> in the OS file manager (defaults to inbox).
  openArchiveFolder: (which) => ipcRenderer.invoke('archive-open-folder', which || 'inbox'),

  // Lists new material in Archive/inbox without changing anything.
  scanArchive: () => ipcRenderer.invoke('archive-scan'),

  // Analyses material into a Lecture Update Proposal draft.
  proposeFromArchive: (fileNames) => ipcRenderer.invoke('archive-propose', fileNames || null),

  listProposals: () => ipcRenderer.invoke('archive-proposals'),
  getProposal: (id) => ipcRenderer.invoke('archive-proposal', id),

  // Applies the approved subset. decisions: [{ id, decision: 'apply'|'keep', after }]
  applyProposal: (id, decisions) => ipcRenderer.invoke('archive-apply', id, decisions || []),

  // Approved lecture overrides, merged over the shipped content at render time.
  getLectureOverrides: () => ipcRenderer.invoke('archive-overrides'),
  getOrganizerStatus: () => ipcRenderer.invoke('organizer-status'),

  // 개발/패키징 여부
  isDev: () => ipcRenderer.invoke('is-dev'),

  // 메인 프로세스 → 렌더러 이벤트 구독
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut', (_event, key) => callback(key));
  },
  onFullscreenChanged: (callback) => {
    ipcRenderer.on('fullscreen-changed', (_event, isFS) => callback(isFS));
  }
});
