import { icons } from '../utils/icons';
function calculateStats(content) {
    const text = content.replace(/<[^>]*>/g, '');
    return {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        paragraphs: text.trim() ? text.split(/\n\s*\n/).length : 0,
    };
}
function createWordCountPanel(context) {
    const panel = document.createElement('div');
    panel.className = 'lilac-word-count-panel';
    panel.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600;">Document Statistics</h3>
    <div class="lilac-word-count-stats">
      <div class="lilac-word-count-stat">
        <span class="label">Words:</span>
        <span class="value" id="wc-words">0</span>
      </div>
      <div class="lilac-word-count-stat">
        <span class="label">Characters:</span>
        <span class="value" id="wc-chars">0</span>
      </div>
      <div class="lilac-word-count-stat">
        <span class="label">Characters (no spaces):</span>
        <span class="value" id="wc-chars-no-space">0</span>
      </div>
      <div class="lilac-word-count-stat">
        <span class="label">Paragraphs:</span>
        <span class="value" id="wc-paragraphs">0</span>
      </div>
    </div>
  `;
    const updateStats = () => {
        const stats = calculateStats(context.state.content);
        const wordsEl = panel.querySelector('#wc-words');
        const charsEl = panel.querySelector('#wc-chars');
        const charsNoSpaceEl = panel.querySelector('#wc-chars-no-space');
        const paragraphsEl = panel.querySelector('#wc-paragraphs');
        if (wordsEl)
            wordsEl.textContent = stats.words.toLocaleString();
        if (charsEl)
            charsEl.textContent = stats.characters.toLocaleString();
        if (charsNoSpaceEl)
            charsNoSpaceEl.textContent = stats.charactersNoSpaces.toLocaleString();
        if (paragraphsEl)
            paragraphsEl.textContent = stats.paragraphs.toLocaleString();
    };
    updateStats();
    return panel;
}
export const wordCountPlugin = {
    id: 'word-count',
    name: 'Word Count',
    version: '0.4.0',
    description: 'Displays word count and document statistics',
    author: 'Lilac Editor',
    panels: [
        {
            id: 'word-count-panel',
            title: 'Word Count',
            icon: icons.fileText,
            position: 'right',
            defaultOpen: false,
            render: (context, container) => {
                const panel = createWordCountPanel(context);
                container.appendChild(panel);
                // Update stats on content change
                const updateStats = () => {
                    const stats = calculateStats(context.state.content);
                    const wordsEl = panel.querySelector('#wc-words');
                    const charsEl = panel.querySelector('#wc-chars');
                    const charsNoSpaceEl = panel.querySelector('#wc-chars-no-space');
                    const paragraphsEl = panel.querySelector('#wc-paragraphs');
                    if (wordsEl)
                        wordsEl.textContent = stats.words.toLocaleString();
                    if (charsEl)
                        charsEl.textContent = stats.characters.toLocaleString();
                    if (charsNoSpaceEl)
                        charsNoSpaceEl.textContent = stats.charactersNoSpaces.toLocaleString();
                    if (paragraphsEl)
                        paragraphsEl.textContent = stats.paragraphs.toLocaleString();
                };
                // Initial update
                updateStats();
                // Listen for content changes
                const interval = setInterval(() => {
                    updateStats();
                }, 500);
                // Store interval for cleanup
                panel._updateInterval = interval;
            },
            destroy: () => {
                // Cleanup any intervals
                const panel = document.querySelector('.lilac-word-count-panel');
                if (panel && panel._updateInterval) {
                    clearInterval(panel._updateInterval);
                }
            },
        },
    ],
    toolbarButtons: [
        {
            id: 'word-count-toggle',
            icon: icons.fileText,
            label: 'Word Count',
            tooltip: 'Show word count',
            onClick: (context) => {
                let modal = document.querySelector('.lilac-word-count-modal');
                if (modal) {
                    modal.remove();
                    return;
                }
                modal = document.createElement('div');
                modal.className = 'lilac-word-count-modal';
                modal.innerHTML = `
          <div class="lilac-word-count-modal-backdrop">
            <div class="lilac-word-count-modal-content">
              <div class="lilac-word-count-modal-header">
                <h3>Document Statistics</h3>
                <button class="lilac-word-count-modal-close">&times;</button>
              </div>
              <div id="word-count-panel-container"></div>
            </div>
          </div>
        `;
                document.body.appendChild(modal);
                const container = modal.querySelector('#word-count-panel-container');
                if (container) {
                    container.appendChild(createWordCountPanel(context));
                }
                const closeBtn = modal.querySelector('.lilac-word-count-modal-close');
                const backdrop = modal.querySelector('.lilac-word-count-modal-backdrop');
                const closeModal = () => modal.remove();
                closeBtn?.addEventListener('click', closeModal);
                backdrop?.addEventListener('click', (e) => {
                    if (e.target === backdrop)
                        closeModal();
                });
            },
        },
    ],
    styles: `
    .lilac-word-count-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }
    .lilac-word-count-modal-backdrop {
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
    .lilac-word-count-modal-content {
      background: var(--lilac-color-surface, #f8f9fb);
      border-radius: 8px;
      width: 320px;
      max-width: 90vw;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .lilac-word-count-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--lilac-color-border, #e1e5e9);
    }
    .lilac-word-count-modal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .lilac-word-count-modal-close {
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
    .lilac-word-count-modal-close:hover {
      background: var(--lilac-color-hover, rgba(0,0,0,0.05));
    }
    .lilac-word-count-panel {
      padding: 16px;
      font-family: var(--lilac-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      font-size: 13px;
    }
    .lilac-word-count-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .lilac-word-count-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid var(--lilac-color-border, #e1e5e9);
    }
    .lilac-word-count-stat:last-child {
      border-bottom: none;
    }
    .lilac-word-count-stat .label {
      color: var(--lilac-color-text-secondary, #64748b);
      font-weight: 500;
    }
    .lilac-word-count-stat .value {
      font-weight: 600;
      color: var(--lilac-color-primary, #8b7cd8);
      font-variant-numeric: tabular-nums;
    }
  `,
    onInstall: () => {
        console.log('Word Count plugin installed');
    },
    onUninstall: () => {
        console.log('Word Count plugin uninstalled');
    },
};
