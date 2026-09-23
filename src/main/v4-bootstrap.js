'use strict';

const { app } = require('electron');

app.on('browser-window-created', (_event, win) => {
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      (() => {
        if (document.querySelector('script[data-v4-entry]')) return;
        const script = document.createElement('script');
        script.src = new URL('./v4-entry.js', location.href).href;
        script.dataset.v4Entry = 'true';
        document.body.appendChild(script);
      })();
    `).catch((error) => console.error('V4 launcher injection failed', error));
  });
});

require('./main.js');
