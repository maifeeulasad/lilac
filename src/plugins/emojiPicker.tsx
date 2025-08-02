import { Smile } from 'lucide-react';
import React from 'react';
import { EditorContext, EditorPlugin, ToolbarButton } from '../types/plugin';

const EMOJI_CATEGORIES = {
    smileys: {
        name: 'Smileys & People',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    },
    nature: {
        name: 'Animals & Nature',
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️'],
    },
    food: {
        name: 'Food & Drink',
        emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
    },
    travel: {
        name: 'Travel & Places',
        emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜'],
    },
    objects: {
        name: 'Objects',
        emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖽️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
    },
};

const EmojiPicker: React.FC<{ onEmojiSelect: (emoji: string) => void }> = ({ onEmojiSelect }) => {
    const [activeCategory, setActiveCategory] = React.useState<keyof typeof EMOJI_CATEGORIES>('smileys');

    return (
        <div className="lilac-emoji-picker">
            <div className="lilac-emoji-categories">
                {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                    <button
                        key={key}
                        className={`lilac-emoji-category ${activeCategory === key ? 'active' : ''}`}
                        onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
                        title={category.name}
                    >
                        {category.emojis[0]}
                    </button>
                ))}
            </div>
            <div className="lilac-emoji-grid">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
                    <button
                        key={index}
                        className="lilac-emoji-button"
                        onClick={() => onEmojiSelect(emoji)}
                        title={emoji}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const emojiPlugin: EditorPlugin = {
    id: 'emoji-picker',
    name: 'Emoji Picker',
    version: '1.0.0',
    description: 'Add emojis to your content with an easy-to-use picker',
    author: 'Lilac Editor',

    toolbarButtons: [
        {
            id: 'emoji-picker',
            icon: React.createElement(Smile, { size: 16 }),
            label: 'Insert Emoji',
            tooltip: 'Insert emoji (Ctrl+Shift+E)',
            group: 'insert',
            shortcut: 'Ctrl+Shift+E',
            onClick: (context: EditorContext) => {
                // Create and show emoji picker modal
                const modal = document.createElement('div');
                modal.className = 'lilac-emoji-modal';
                modal.innerHTML = `
          <div class="lilac-emoji-modal-backdrop">
            <div class="lilac-emoji-modal-content">
              <div class="lilac-emoji-modal-header">
                <h3>Insert Emoji</h3>
                <button class="lilac-emoji-modal-close">×</button>
              </div>
              <div id="lilac-emoji-picker-container"></div>
            </div>
          </div>
        `;

                document.body.appendChild(modal);

                // Add event listeners
                const closeBtn = modal.querySelector('.lilac-emoji-modal-close') as HTMLElement;
                const backdrop = modal.querySelector('.lilac-emoji-modal-backdrop') as HTMLElement;

                const closeModal = () => {
                    document.body.removeChild(modal);
                };

                closeBtn.addEventListener('click', closeModal);
                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) closeModal();
                });

                // Render emoji picker
                const container = modal.querySelector('#lilac-emoji-picker-container');
                if (container) {
                    React.createElement(EmojiPicker, {
                        onEmojiSelect: (emoji: string) => {
                            context.insertContent(emoji);
                            closeModal();
                        }
                    });

                    // Note: In a real implementation, you'd need to use ReactDOM.render here
                    // For now, we'll create a simple native implementation
                    container.innerHTML = `
            <div class="lilac-emoji-picker">
              <div class="lilac-emoji-categories">
                ${Object.entries(EMOJI_CATEGORIES).map(([key, category]) =>
                        `<button class="lilac-emoji-category ${key === 'smileys' ? 'active' : ''}" data-category="${key}" title="${category.name}">
                    ${category.emojis[0]}
                  </button>`
                    ).join('')}
              </div>
              <div class="lilac-emoji-grid" id="emoji-grid">
                ${EMOJI_CATEGORIES.smileys.emojis.map(emoji =>
                        `<button class="lilac-emoji-button" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`
                    ).join('')}
              </div>
            </div>
          `;

                    // Add category switching
                    container.querySelectorAll('.lilac-emoji-category').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const target = e.target as HTMLElement;
                            const category = target.dataset.category as keyof typeof EMOJI_CATEGORIES;

                            // Update active state
                            container.querySelectorAll('.lilac-emoji-category').forEach(b => b.classList.remove('active'));
                            target.classList.add('active');

                            // Update emoji grid
                            const grid = container.querySelector('#emoji-grid');
                            if (grid) {
                                grid.innerHTML = EMOJI_CATEGORIES[category].emojis.map(emoji =>
                                    `<button class="lilac-emoji-button" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`
                                ).join('');

                                // Re-add emoji click listeners
                                grid.querySelectorAll('.lilac-emoji-button').forEach(emojiBtn => {
                                    emojiBtn.addEventListener('click', (e) => {
                                        const target = e.target as HTMLElement;
                                        const emoji = target.dataset.emoji;
                                        if (emoji) {
                                            context.insertContent(emoji);
                                            closeModal();
                                        }
                                    });
                                });
                            }
                        });
                    });

                    // Add emoji click listeners
                    container.querySelectorAll('.lilac-emoji-button').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const target = e.target as HTMLElement;
                            const emoji = target.dataset.emoji;
                            if (emoji) {
                                context.insertContent(emoji);
                                closeModal();
                            }
                        });
                    });
                }
            },
        },
    ] as ToolbarButton[],

    keyboardShortcuts: [
        {
            key: 'e',
            ctrlKey: true,
            shiftKey: true,
            action: (_: EditorContext) => {
                // Trigger emoji picker
                const emojiButton = document.querySelector('[data-tooltip="Insert emoji (Ctrl+Shift+E)"]') as HTMLElement;
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
      background: var(--lilac-color-surface);
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
      border-bottom: 1px solid var(--lilac-color-border);
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
      color: var(--lilac-color-text-secondary);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    
    .lilac-emoji-modal-close:hover {
      background: var(--lilac-color-hover);
    }
    
    .lilac-emoji-picker {
      padding: 16px;
    }
    
    .lilac-emoji-categories {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--lilac-color-border);
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
      background: var(--lilac-color-hover);
      opacity: 1;
    }
    
    .lilac-emoji-category.active {
      background: var(--lilac-color-primary);
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
      background: var(--lilac-color-hover);
    }
    
    .lilac-emoji-button:active {
      transform: scale(0.95);
    }
  `,

    onInstall: (_: EditorContext) => {
        console.log('Emoji Picker plugin installed');
    },

    onUninstall: (_: EditorContext) => {
        console.log('Emoji Picker plugin uninstalled');
    },
};
