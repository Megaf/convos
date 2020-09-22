import './sass/convos.scss';
import App from './App.svelte';
import hljs from './js/hljs';
import VideoApp from './VideoApp.svelte';
import {q, tagNameIs} from './js/util';

const body = document.querySelector('body');
body.classList = body.className.replace(/no-js/, 'has-js');
q(document, '#hamburger_checkbox_toggle', el => { el.checked = false });

if (document.querySelector('meta[name="convos:start"][content="chat"]')) {
  document.querySelector('.footer-wrapper').remove();
  document.querySelector('main').remove();
  const app = new App({target: document.body});
}
else if (document.querySelector('meta[name="convos:start"][content="video"]')) {
  document.querySelector('main').remove();
  const footer = document.querySelector('.footer-wrapper');
  const app = new VideoApp({target: document.body});
  document.body.appendChild(footer);
}
else {
  document.addEventListener('DOMContentLoaded', function(e) {
    q(document, 'pre', el => hljs.lineNumbersBlock(el));
  });
}

// Global shortcuts
document.addEventListener('keydown', function(e) {
  // Esc
  if (e.keyCode == 27) {
    q(document, '.fullscreen-wrapper', el => el.click());
    moveFocus();
  }

  // Shift+Enter
  if (e.keyCode == 13 && e.shiftKey) {
    e.preventDefault();
    moveFocus('toggle');
  }
});

// Like "load", but from ./store/Route.js
document.addEventListener('routerender', () => moveFocus());

function moveFocus(toggle) {
  if ('ontouchstart' in window) return;

  const firstEl = (sel) => {
    for (let i = 0; i < sel.length; i++) {
      const el = document.querySelector(sel[i]);
      if (el && el.tabIndex != -1) return el;
    }
    return null;
  };

  // Switch to menu item if main area item has focus
  const menuItem = toggle && firstEl(['input.is-primary-menu-item', 'a.is-primary-menu-item']);
  const targetEl = document.activeElement;
  if (tagNameIs(targetEl, ['a', 'input', 'textarea']) && menuItem && targetEl != menuItem) {
    return menuItem.focus();
  }

  // Try to focus elements in the main area
  const mainItem = firstEl(['.is-primary-input', 'main input[type="text"], article input[type="text"]', 'main a, article a']);
  if (mainItem) return mainItem.focus();

  // Fallback
  if (menuItem) return menuItem.focus();
}
