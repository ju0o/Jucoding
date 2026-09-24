'use strict';

const { app } = require('electron');

app.on('browser-window-created', (_event, win) => {
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      (() => {
        if (!document.querySelector('link[data-jucoding-v4-theme]')) {
          const theme = document.createElement('link');
          theme.rel = 'stylesheet';
          theme.href = new URL('./jucoding-v4-theme.css', location.href).href;
          theme.dataset.jucodingV4Theme = 'true';
          document.head.appendChild(theme);
        }

        const mountScript = (src, marker) => {
          if (document.querySelector('script[' + marker + ']')) return;
          const script = document.createElement('script');
          script.src = new URL(src, location.href).href;
          script.setAttribute(marker, 'true');
          document.body.appendChild(script);
        };

        mountScript('./jucoding-v4-shell.js', 'data-jucoding-v4-shell');
        mountScript('./v4-entry.js', 'data-v4-entry');
      })();
    `).catch((error) => console.error('JuCoding V4 shell injection failed', error));
  });
});

require('./main.js');
