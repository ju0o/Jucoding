'use strict';

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const qaDir = path.join(root, 'artifacts', 'qa');
const screenshotPath = path.join(qaDir, 'jucoding-v4-1366x768.png');
const reportPath = path.join(qaDir, 'jucoding-v4-1366x768.json');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1366,
    height: 768,
    backgroundColor: '#eef2ff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const errors = [];
  win.webContents.on('console-message', (_event, level, message) => {
    if (/Electron Security Warning/i.test(message)) return;
    if (level >= 2 || /uncaught|failed|error/i.test(message)) errors.push(message);
  });

  try {
    await win.loadFile(path.join(root, 'src/content/v4/one-shot.html'));
    await wait(450);

    const initial = await win.webContents.executeJavaScript(`
      (() => ({
        title: document.title,
        brand: document.querySelector('.brand strong')?.textContent || '',
        deck: Boolean(document.querySelector('.deck-shell')),
        stage: Boolean(document.querySelector('#stage .scene')),
        counter: document.querySelector('#scene-counter')?.textContent || '',
        chapterButtons: document.querySelectorAll('#chapter-grid .chapter-button').length,
        hasNext: Boolean(document.querySelector('#next')),
        hasPrev: Boolean(document.querySelector('#prev')),
        hasMap: Boolean(document.querySelector('#btn-map')),
        hasNotes: Boolean(document.querySelector('#btn-notes')),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
      }))()
    `);

    fs.mkdirSync(qaDir, { recursive: true });
    fs.writeFileSync(screenshotPath, (await win.webContents.capturePage()).toPNG());

    const projectForm = await win.webContents.executeJavaScript(`
      (() => {
        const clickNextUntil = (selector, max = 30) => {
          let guard = 0;
          while (!document.querySelector(selector) && guard < max) {
            document.querySelector('#next')?.click();
            guard += 1;
          }
          return guard;
        };
        const steps = clickNextUntil('#project-build');
        const what = document.querySelector('#project-what');
        const who = document.querySelector('#project-who');
        const core = document.querySelector('#project-core');
        if (what) what.value = '모임 자료를 자동으로 정리하는 앱';
        if (who) who.value = '스터디 운영자';
        if (core) core.value = '메모를 넣으면 회차 자료 초안을 만든다';
        document.querySelector('#project-build')?.click();
        return {
          steps,
          present: Boolean(document.querySelector('#project-build')),
          output: document.querySelector('#project-plan-output')?.textContent || '',
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
        };
      })()
    `);

    const automationForm = await win.webContents.executeJavaScript(`
      (() => {
        let guard = 0;
        while (!document.querySelector('#auto-build') && guard < 30) {
          document.querySelector('#next')?.click();
          guard += 1;
        }
        const task = document.querySelector('#auto-task');
        const worker = document.querySelector('#auto-worker');
        const result = document.querySelector('#auto-result');
        if (task) task.value = '재고 기록';
        if (worker) worker.value = '사진을 읽고 품목별 수량 정리';
        if (result) result.value = '날짜별 재고표 저장';
        document.querySelector('#auto-build')?.click();
        return {
          steps: guard,
          present: Boolean(document.querySelector('#auto-build')),
          output: document.querySelector('#auto-output')?.textContent || '',
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
        };
      })()
    `);

    const dialogs = await win.webContents.executeJavaScript(`
      (() => {
        const chapters = document.querySelector('#chapter-dialog');
        const map = document.querySelector('#map-dialog');
        document.querySelector('#btn-chapters')?.click();
        const chaptersOpen = Boolean(chapters?.open);
        chapters?.close();
        document.querySelector('#btn-map')?.click();
        const mapOpen = Boolean(map?.open);
        map?.close();
        document.querySelector('#btn-notes')?.click();
        const notesOpen = document.querySelector('#speaker-cue')?.classList.contains('open') || false;
        return { chaptersOpen, mapOpen, notesOpen };
      })()
    `);

    const sceneCount = Number((initial.counter.match(/\/\s*(\d+)/) || [])[1] || 0);
    const ok = initial.title.includes('JuCoding')
      && initial.brand === 'JuCoding'
      && initial.deck
      && initial.stage
      && sceneCount >= 18
      && initial.chapterButtons === 6
      && initial.hasNext
      && initial.hasPrev
      && initial.hasMap
      && initial.hasNotes
      && !initial.overflowX
      && !initial.overflowY
      && projectForm.present
      && projectForm.output.includes('모임 자료를 자동으로 정리하는 앱')
      && projectForm.output.includes('스터디 운영자')
      && !projectForm.overflowX
      && !projectForm.overflowY
      && automationForm.present
      && automationForm.output.includes('재고 기록')
      && automationForm.output.includes('날짜별 재고표 저장')
      && !automationForm.overflowX
      && !automationForm.overflowY
      && dialogs.chaptersOpen
      && dialogs.mapOpen
      && dialogs.notesOpen
      && errors.length === 0;

    const report = { ok, initial, projectForm, automationForm, dialogs, errors, screenshotPath };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(JSON.stringify(report, null, 2));
    app.exit(ok ? 0 : 1);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
