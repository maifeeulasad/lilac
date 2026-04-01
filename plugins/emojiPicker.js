import { icons } from '../utils/icons.js';
const EMOJI_CATEGORIES = {
    smileys: {
        name: 'Smileys & People',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡'],
    },
    nature: {
        name: 'Animals & Nature',
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'],
    },
    food: {
        name: 'Food & Drink',
        emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈'],
    },
    objects: {
        name: 'Objects',
        emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️'],
    },
    symbols: {
        name: 'Symbols',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐', '🌟', '💫', '⚡', '🔥', '💥', '❄️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❗', '❓', '💯'],
    },
};
export const emojiPlugin = {
    id: 'emoji-picker',
    name: 'Emoji Picker',
    version: '1.0.0',
    description: 'Add emojis to your content with an easy-to-use picker',
    author: 'Lilac Editor',
    toolbarButtons: [
        {
            id: 'emoji-picker',
            icon: icons.smile,
            label: 'Insert Emoji',
            tooltip: 'Insert emoji (Ctrl+Shift+E)',
            onClick: (context) => {
                const modal = document.createElement('div');
                modal.className = 'lilac-emoji-modal';
                modal.innerHTML = `
          <div class="lilac-emoji-modal-backdrop">
            <div class="lilac-emoji-modal-content">
              <div class="lilac-emoji-modal-header">
                <h3>Insert Emoji</h3>
                <button class="lilac-emoji-modal-close">&times;</button>
              </div>
              <div class="lilac-emoji-picker">
                <div class="lilac-emoji-categories">
                  ${Object.entries(EMOJI_CATEGORIES).map(([key, category]) => `<button class="lilac-emoji-category ${key === 'smileys' ? 'active' : ''}" data-category="${key}" title="${category.name}">
                      ${category.emojis[0]}
                    </button>`).join('')}
                </div>
                <div class="lilac-emoji-grid" id="emoji-grid">
                  ${EMOJI_CATEGORIES.smileys.emojis.map(emoji => `<button class="lilac-emoji-button" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
                document.body.appendChild(modal);
                const closeBtn = modal.querySelector('.lilac-emoji-modal-close');
                const backdrop = modal.querySelector('.lilac-emoji-modal-backdrop');
                const closeModal = () => modal.remove();
                closeBtn?.addEventListener('click', closeModal);
                backdrop?.addEventListener('click', (e) => {
                    if (e.target === backdrop)
                        closeModal();
                });
                // Category switching
                modal.querySelectorAll('.lilac-emoji-category').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const category = btn.dataset.category;
                        modal.querySelectorAll('.lilac-emoji-category').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const grid = modal.querySelector('#emoji-grid');
                        if (grid) {
                            grid.innerHTML = EMOJI_CATEGORIES[category].emojis.map(emoji => `<button class="lilac-emoji-button" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`).join('');
                            grid.querySelectorAll('.lilac-emoji-button').forEach(emojiBtn => {
                                emojiBtn.addEventListener('click', () => {
                                    const emoji = emojiBtn.dataset.emoji;
                                    if (emoji) {
                                        context.insertContent(emoji);
                                        closeModal();
                                    }
                                });
                            });
                        }
                    });
                });
                // Initial emoji click handlers
                modal.querySelectorAll('.lilac-emoji-button').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const emoji = btn.dataset.emoji;
                        if (emoji) {
                            context.insertContent(emoji);
                            closeModal();
                        }
                    });
                });
            },
        },
    ],
    keyboardShortcuts: [
        {
            key: 'e',
            ctrlKey: true,
            shiftKey: true,
            action: () => {
                const emojiButton = document.querySelector('[data-tooltip="Insert emoji (Ctrl+Shift+E)"]');
                if (emojiButton) {
                    emojiButton.click();
                }
            },
        },
    ],
    styles: `
    .lilac-emoji-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }
    .lilac-emoji-modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lilac-emoji-modal-content {
      background: var(--lilac-color-surface, #f8f9fb);
      border-radius: 8px;
      width: 400px;
      max-width: 90vw;
      max-height: 80vh;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    .lilac-emoji-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--lilac-color-border, #e1e5e9);
    }
    .lilac-emoji-modal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .lilac-emoji-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--lilac-color-text-secondary, #64748b);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .lilac-emoji-modal-close:hover {
      background: var(--lilac-color-hover, rgba(0,0,0,0.05));
    }
    .lilac-emoji-picker {
      padding: 16px;
    }
    .lilac-emoji-categories {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--lilac-color-border, #e1e5e9);
    }
    .lilac-emoji-category {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      opacity: 0.6;
      transition: all 0.2s ease;
    }
    .lilac-emoji-category:hover {
      background: var(--lilac-color-hover, rgba(0,0,0,0.05));
      opacity: 1;
    }
    .lilac-emoji-category.active {
      background: var(--lilac-color-primary, #8b7cd8);
      opacity: 1;
    }
    .lilac-emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
    .lilac-emoji-button {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      transition: background-color 0.2s ease;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lilac-emoji-button:hover {
      background: var(--lilac-color-hover, rgba(0,0,0,0.05));
    }
    .lilac-emoji-button:active {
      transform: scale(0.95);
    }
  `,
    onInstall: () => {
        console.log('Emoji Picker plugin installed');
    },
    onUninstall: () => {
        console.log('Emoji Picker plugin uninstalled');
    },
};
