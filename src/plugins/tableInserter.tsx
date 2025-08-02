import React from 'react';
import { Table } from 'lucide-react';
import { EditorPlugin, EditorContext, ToolbarButton } from '../types/plugin';

export const tablePlugin: EditorPlugin = {
  id: 'table-inserter',
  name: 'Table Inserter',
  version: '1.0.0',
  description: 'Insert and manage HTML tables',
  author: 'Lilac Editor',

  toolbarButtons: [
    {
      id: 'insert-table',
      icon: React.createElement(Table, { size: 16 }),
      label: 'Insert Table',
      tooltip: 'Insert table (Ctrl+Shift+T)',
      group: 'insert',
      shortcut: 'Ctrl+Shift+T',
      onClick: (context: EditorContext) => {
        // Create table insertion modal
        const modal = document.createElement('div');
        modal.className = 'lilac-table-modal';
        modal.innerHTML = `
          <div class="lilac-table-modal-backdrop">
            <div class="lilac-table-modal-content">
              <div class="lilac-table-modal-header">
                <h3>Insert Table</h3>
                <button class="lilac-table-modal-close">×</button>
              </div>
              <div class="lilac-table-options">
                <div class="lilac-table-option">
                  <label for="table-rows">Rows:</label>
                  <input type="number" id="table-rows" min="1" max="20" value="3">
                </div>
                <div class="lilac-table-option">
                  <label for="table-cols">Columns:</label>
                  <input type="number" id="table-cols" min="1" max="10" value="3">
                </div>
                <div class="lilac-table-option">
                  <label>
                    <input type="checkbox" id="table-header" checked>
                    Include header row
                  </label>
                </div>
                <div class="lilac-table-option">
                  <label>
                    <input type="checkbox" id="table-borders" checked>
                    Show borders
                  </label>
                </div>
              </div>
              <div class="lilac-table-preview">
                <h4>Preview:</h4>
                <div id="table-preview-container"></div>
              </div>
              <div class="lilac-table-actions">
                <button class="lilac-btn lilac-btn-secondary" id="table-cancel">Cancel</button>
                <button class="lilac-btn lilac-btn-primary" id="table-insert">Insert Table</button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        const rowsInput = modal.querySelector('#table-rows') as HTMLInputElement;
        const colsInput = modal.querySelector('#table-cols') as HTMLInputElement;
        const headerCheck = modal.querySelector('#table-header') as HTMLInputElement;
        const bordersCheck = modal.querySelector('#table-borders') as HTMLInputElement;
        const previewContainer = modal.querySelector('#table-preview-container') as HTMLElement;
        const closeBtn = modal.querySelector('.lilac-table-modal-close') as HTMLElement;
        const cancelBtn = modal.querySelector('#table-cancel') as HTMLElement;
        const insertBtn = modal.querySelector('#table-insert') as HTMLElement;
        const backdrop = modal.querySelector('.lilac-table-modal-backdrop') as HTMLElement;

        const generateTableHTML = (): string => {
          const rows = parseInt(rowsInput.value) || 3;
          const cols = parseInt(colsInput.value) || 3;
          const hasHeader = headerCheck.checked;
          const hasBorders = bordersCheck.checked;

          let html = `<table class="lilac-table${hasBorders ? ' lilac-table-bordered' : ''}">`;
          
          if (hasHeader) {
            html += '<thead><tr>';
            for (let c = 0; c < cols; c++) {
              html += `<th>Header ${c + 1}</th>`;
            }
            html += '</tr></thead>';
          }
          
          html += '<tbody>';
          const startRow = hasHeader ? 1 : 0;
          const totalRows = hasHeader ? rows : rows;
          
          for (let r = startRow; r < totalRows + startRow; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
              html += `<td>Cell ${r + 1}-${c + 1}</td>`;
            }
            html += '</tr>';
          }
          html += '</tbody></table>';
          
          return html;
        };

        const updatePreview = () => {
          previewContainer.innerHTML = generateTableHTML();
        };

        const closeModal = () => {
          document.body.removeChild(modal);
        };

        // Event listeners
        [rowsInput, colsInput, headerCheck, bordersCheck].forEach(input => {
          input.addEventListener('change', updatePreview);
          input.addEventListener('input', updatePreview);
        });

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) closeModal();
        });

        insertBtn.addEventListener('click', () => {
          const tableHTML = generateTableHTML();
          context.insertContent(tableHTML);
          closeModal();
        });

        // Initial preview
        updatePreview();
      },
    },
  ] as ToolbarButton[],

  keyboardShortcuts: [
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: (context: EditorContext) => {
        const tableButton = document.querySelector('[data-tooltip="Insert table (Ctrl+Shift+T)"]') as HTMLElement;
        if (tableButton) {
          tableButton.click();
        }
      },
    },
  ],

  styles: `
    .lilac-table-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }
    
    .lilac-table-modal-backdrop {
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
    
    .lilac-table-modal-content {
      background: var(--lilac-color-surface);
      border-radius: 8px;
      width: 500px;
      max-width: 90vw;
      max-height: 80vh;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .lilac-table-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--lilac-color-border);
    }
    
    .lilac-table-modal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .lilac-table-modal-close {
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
    
    .lilac-table-modal-close:hover {
      background: var(--lilac-color-hover);
    }
    
    .lilac-table-options {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .lilac-table-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .lilac-table-option label {
      font-weight: 500;
      min-width: 80px;
    }
    
    .lilac-table-option input[type="number"] {
      padding: 4px 8px;
      border: 1px solid var(--lilac-color-border);
      border-radius: 4px;
      width: 60px;
    }
    
    .lilac-table-option input[type="checkbox"] {
      margin-right: 4px;
    }
    
    .lilac-table-preview {
      padding: 16px;
      border-top: 1px solid var(--lilac-color-border);
      border-bottom: 1px solid var(--lilac-color-border);
      background: var(--lilac-color-background);
    }
    
    .lilac-table-preview h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }
    
    .lilac-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .lilac-table th,
    .lilac-table td {
      padding: 8px 12px;
      text-align: left;
    }
    
    .lilac-table th {
      font-weight: 600;
      background: var(--lilac-color-surface);
    }
    
    .lilac-table-bordered {
      border: 1px solid var(--lilac-color-border);
    }
    
    .lilac-table-bordered th,
    .lilac-table-bordered td {
      border: 1px solid var(--lilac-color-border);
    }
    
    .lilac-table-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .lilac-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .lilac-btn-primary {
      background: var(--lilac-color-primary);
      color: white;
    }
    
    .lilac-btn-primary:hover {
      background: var(--lilac-color-primary-hover);
    }
    
    .lilac-btn-secondary {
      background: var(--lilac-color-surface);
      color: var(--lilac-color-text);
      border: 1px solid var(--lilac-color-border);
    }
    
    .lilac-btn-secondary:hover {
      background: var(--lilac-color-hover);
    }
    
    /* Table styles in editor content */
    .lilac-editor__content .lilac-table {
      margin: 16px 0;
      width: 100%;
      border-collapse: collapse;
      font-size: inherit;
    }
    
    .lilac-editor__content .lilac-table th,
    .lilac-editor__content .lilac-table td {
      padding: 8px 12px;
      text-align: left;
      min-width: 100px;
    }
    
    .lilac-editor__content .lilac-table th {
      font-weight: 600;
      background: var(--lilac-color-surface);
    }
    
    .lilac-editor__content .lilac-table-bordered {
      border: 1px solid var(--lilac-color-border);
    }
    
    .lilac-editor__content .lilac-table-bordered th,
    .lilac-editor__content .lilac-table-bordered td {
      border: 1px solid var(--lilac-color-border);
    }
    
    .lilac-editor__content .lilac-table tr:nth-child(even) {
      background: rgba(0, 0, 0, 0.02);
    }
    
    .lilac-editor__content .lilac-table tr:hover {
      background: var(--lilac-color-hover);
    }
  `,

  onInstall: (context: EditorContext) => {
    console.log('Table Inserter plugin installed');
  },

  onUninstall: (context: EditorContext) => {
    console.log('Table Inserter plugin uninstalled');
  },
};
