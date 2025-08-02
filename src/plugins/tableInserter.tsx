import { Table } from 'lucide-react';
import React from 'react';
import { EditorContext, EditorPlugin, ToolbarButton } from '../types/plugin';

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

                // Helper functions for table manipulation
                const positionTableControls = (wrapper: HTMLElement, table: HTMLElement) => {
                    const rows = table.querySelectorAll('tr');
                    const firstRowCells = rows[0]?.querySelectorAll('th, td');

                    // Position row controls
                    const rowControls = wrapper.querySelectorAll('.lilac-table-add-row-line');
                    rowControls.forEach((control, index) => {
                        const element = control as HTMLElement;
                        if (index === 0) {
                            element.style.top = '-5px';
                        } else if (index === rowControls.length - 1) {
                            element.style.bottom = '-5px';
                            element.style.top = 'auto';
                        } else {
                            // Calculate position based on row height
                            const rowHeight = 40; // Approximate row height
                            const topOffset = (index - 1) * rowHeight + rowHeight / 2;
                            element.style.top = `${topOffset}px`;
                        }
                    });

                    // Position column controls
                    const colControls = wrapper.querySelectorAll('.lilac-table-add-col-line');
                    const tableWidth = table.offsetWidth;
                    const colCount = firstRowCells ? firstRowCells.length : 3;
                    const colWidth = tableWidth / colCount;

                    colControls.forEach((control, index) => {
                        const element = control as HTMLElement;
                        if (index === 0) {
                            element.style.left = '-5px';
                        } else if (index === colControls.length - 1) {
                            element.style.right = '-5px';
                            element.style.left = 'auto';
                        } else {
                            // Calculate position based on column width
                            const leftOffset = (index - 1) * colWidth + colWidth / 2;
                            element.style.left = `${leftOffset}px`;
                        }
                    });
                };

                const addRowToTable = (table: HTMLElement, rowIndex: number) => {
                    const tbody = table.querySelector('tbody');
                    const rows = table.querySelectorAll('tbody tr');
                    const colCount = rows[0]?.querySelectorAll('td, th').length || 3;

                    const newRow = document.createElement('tr');
                    for (let c = 0; c < colCount; c++) {
                        const cell = document.createElement('td');
                        cell.textContent = `New Cell ${rowIndex + 1}-${c + 1}`;
                        newRow.appendChild(cell);
                    }

                    if (tbody) {
                        if (rowIndex >= rows.length) {
                            tbody.appendChild(newRow);
                        } else if (rows[rowIndex]) {
                            tbody.insertBefore(newRow, rows[rowIndex]);
                        }
                    }

                    // Update controls
                    const wrapper = table.closest('.lilac-table-wrapper') as HTMLElement;
                    if (wrapper) {
                        const currentRows = parseInt(table.dataset.rows || '3') + 1;
                        table.dataset.rows = currentRows.toString();
                        // Regenerate controls
                        const controlsDiv = wrapper.querySelector('.lilac-table-controls');
                        if (controlsDiv) {
                            controlsDiv.innerHTML = '';
                            for (let r = 0; r <= currentRows; r++) {
                                const rowControl = document.createElement('div');
                                rowControl.className = 'lilac-table-add-row-line';
                                rowControl.dataset.row = r.toString();
                                rowControl.title = `Add row ${r === 0 ? 'at top' : r === currentRows ? 'at bottom' : 'here'}`;
                                controlsDiv.appendChild(rowControl);
                            }
                            const currentCols = parseInt(table.dataset.cols || '3');
                            for (let c = 0; c <= currentCols; c++) {
                                const colControl = document.createElement('div');
                                colControl.className = 'lilac-table-add-col-line';
                                colControl.dataset.col = c.toString();
                                colControl.title = `Add column ${c === 0 ? 'at left' : c === currentCols ? 'at right' : 'here'}`;
                                controlsDiv.appendChild(colControl);
                            }

                            // Reposition controls and reattach event listeners
                            setTimeout(() => {
                                positionTableControls(wrapper, table);

                                // Reattach event listeners
                                wrapper.querySelectorAll('.lilac-table-add-row-line').forEach(btn => {
                                    btn.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        addRowToTable(table, parseInt((btn as HTMLElement).dataset.row || '0'));
                                    });
                                });

                                wrapper.querySelectorAll('.lilac-table-add-col-line').forEach(btn => {
                                    btn.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        addColumnToTable(table, parseInt((btn as HTMLElement).dataset.col || '0'));
                                    });
                                });
                            }, 10);
                        }
                    }
                };

                const addColumnToTable = (table: HTMLElement, colIndex: number) => {
                    const rows = table.querySelectorAll('tr');

                    rows.forEach((row, rowIdx) => {
                        const cells = row.querySelectorAll('td, th');
                        const newCell = document.createElement(rowIdx === 0 && table.querySelector('thead') ? 'th' : 'td');
                        newCell.textContent = rowIdx === 0 && table.querySelector('thead') ? `Header ${colIndex + 1}` : `Cell ${rowIdx + 1}-${colIndex + 1}`;

                        if (colIndex >= cells.length) {
                            row.appendChild(newCell);
                        } else if (cells[colIndex]) {
                            row.insertBefore(newCell, cells[colIndex]);
                        }
                    });

                    // Update controls
                    const wrapper = table.closest('.lilac-table-wrapper') as HTMLElement;
                    if (wrapper) {
                        const currentCols = parseInt(table.dataset.cols || '3') + 1;
                        table.dataset.cols = currentCols.toString();
                        // Regenerate controls
                        const controlsDiv = wrapper.querySelector('.lilac-table-controls');
                        if (controlsDiv) {
                            controlsDiv.innerHTML = '';
                            const currentRows = parseInt(table.dataset.rows || '3');
                            for (let r = 0; r <= currentRows; r++) {
                                const rowControl = document.createElement('div');
                                rowControl.className = 'lilac-table-add-row-line';
                                rowControl.dataset.row = r.toString();
                                rowControl.title = `Add row ${r === 0 ? 'at top' : r === currentRows ? 'at bottom' : 'here'}`;
                                controlsDiv.appendChild(rowControl);
                            }
                            for (let c = 0; c <= currentCols; c++) {
                                const colControl = document.createElement('div');
                                colControl.className = 'lilac-table-add-col-line';
                                colControl.dataset.col = c.toString();
                                colControl.title = `Add column ${c === 0 ? 'at left' : c === currentCols ? 'at right' : 'here'}`;
                                controlsDiv.appendChild(colControl);
                            }

                            // Reposition controls and reattach event listeners
                            setTimeout(() => {
                                positionTableControls(wrapper, table);

                                // Reattach event listeners
                                wrapper.querySelectorAll('.lilac-table-add-row-line').forEach(btn => {
                                    btn.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        addRowToTable(table, parseInt((btn as HTMLElement).dataset.row || '0'));
                                    });
                                });

                                wrapper.querySelectorAll('.lilac-table-add-col-line').forEach(btn => {
                                    btn.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        addColumnToTable(table, parseInt((btn as HTMLElement).dataset.col || '0'));
                                    });
                                });
                            }, 10);
                        }
                    }
                };

                const generateTableHTML = (): string => {
                    const rows = parseInt(rowsInput.value) || 3;
                    const cols = parseInt(colsInput.value) || 3;
                    const hasHeader = headerCheck.checked;
                    const hasBorders = bordersCheck.checked;

                    let html = `<div class="lilac-table-wrapper">
                        <table class="lilac-table${hasBorders ? ' lilac-table-bordered' : ''}" data-rows="${rows}" data-cols="${cols}">`;

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

                    // Add row and column controls
                    html += '<div class="lilac-table-controls">';

                    // Add row controls (horizontal lines)
                    for (let r = 0; r <= rows; r++) {
                        html += `<div class="lilac-table-add-row-line" data-row="${r}" title="Add row ${r === 0 ? 'at top' : r === rows ? 'at bottom' : 'here'}"></div>`;
                    }

                    // Add column controls (vertical lines)
                    for (let c = 0; c <= cols; c++) {
                        html += `<div class="lilac-table-add-col-line" data-col="${c}" title="Add column ${c === 0 ? 'at left' : c === cols ? 'at right' : 'here'}"></div>`;
                    }

                    html += '</div></div>';

                    return html;
                };

                const updatePreview = () => {
                    previewContainer.innerHTML = generateTableHTML();

                    // Position the row and column controls based on actual table dimensions
                    const tableWrapper = previewContainer.querySelector('.lilac-table-wrapper') as HTMLElement;
                    const table = previewContainer.querySelector('.lilac-table') as HTMLElement;

                    if (tableWrapper && table) {
                        // Use setTimeout to ensure table is rendered
                        setTimeout(() => {
                            positionTableControls(tableWrapper, table);
                        }, 10);
                    }

                    // Add event listeners for add row/col controls
                    previewContainer.querySelectorAll('.lilac-table-add-row-line').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            const currentRows = parseInt(rowsInput.value);
                            rowsInput.value = (currentRows + 1).toString();
                            updatePreview();
                        });
                    });

                    previewContainer.querySelectorAll('.lilac-table-add-col-line').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            const currentCols = parseInt(colsInput.value);
                            colsInput.value = (currentCols + 1).toString();
                            updatePreview();
                        });
                    });
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

                    // After inserting, add event listeners to the inserted table
                    setTimeout(() => {
                        const insertedTables = context.element?.querySelectorAll('.lilac-table-wrapper');
                        if (insertedTables) {
                            insertedTables.forEach(wrapper => {
                                const table = wrapper.querySelector('.lilac-table') as HTMLElement;
                                if (table) {
                                    // Position controls for inserted table
                                    setTimeout(() => {
                                        positionTableControls(wrapper as HTMLElement, table);
                                    }, 50);

                                    // Add event listeners for controls
                                    wrapper.querySelectorAll('.lilac-table-add-row-line').forEach(btn => {
                                        // Remove existing listeners to prevent duplicates
                                        btn.replaceWith(btn.cloneNode(true));
                                        const newBtn = wrapper.querySelector(`[data-row="${(btn as HTMLElement).dataset.row}"]`);
                                        if (newBtn) {
                                            newBtn.addEventListener('click', (e) => {
                                                e.preventDefault();
                                                addRowToTable(table, parseInt((newBtn as HTMLElement).dataset.row || '0'));
                                            });
                                        }
                                    });

                                    wrapper.querySelectorAll('.lilac-table-add-col-line').forEach(btn => {
                                        // Remove existing listeners to prevent duplicates
                                        btn.replaceWith(btn.cloneNode(true));
                                        const newBtn = wrapper.querySelector(`[data-col="${(btn as HTMLElement).dataset.col}"]`);
                                        if (newBtn) {
                                            newBtn.addEventListener('click', (e) => {
                                                e.preventDefault();
                                                addColumnToTable(table, parseInt((newBtn as HTMLElement).dataset.col || '0'));
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }, 100);
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
            action: (_: EditorContext) => {
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
    
    /* Table wrapper and controls */
    .lilac-table-wrapper {
      position: relative;
      display: inline-block;
      margin: 16px 0;
    }
    
    .lilac-table-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    /* Row controls - horizontal lines */
    .lilac-table-add-row-line {
      position: absolute;
      left: -10px;
      right: -10px;
      height: 3px;
      background: transparent;
      cursor: pointer;
      pointer-events: auto;
      z-index: 10;
      transition: all 0.2s ease;
      border-radius: 2px;
    }
    
    .lilac-table-add-row-line:hover {
      background: var(--lilac-color-primary, #6366f1);
      height: 4px;
      box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
    }
    
    .lilac-table-add-row-line:hover::before {
      content: '+';
      position: absolute;
      left: -15px;
      top: -8px;
      background: var(--lilac-color-primary, #6366f1);
      color: white;
      padding: 2px 6px;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      line-height: 1;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Column controls - vertical lines */
    .lilac-table-add-col-line {
      position: absolute;
      top: -10px;
      bottom: -10px;
      width: 3px;
      background: transparent;
      cursor: pointer;
      pointer-events: auto;
      z-index: 10;
      transition: all 0.2s ease;
      border-radius: 2px;
    }
    
    .lilac-table-add-col-line:hover {
      background: var(--lilac-color-primary, #6366f1);
      width: 4px;
      box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
    }
    
    .lilac-table-add-col-line:hover::before {
      content: '+';
      position: absolute;
      top: -15px;
      left: -8px;
      background: var(--lilac-color-primary, #6366f1);
      color: white;
      padding: 2px 6px;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      line-height: 1;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Position the controls dynamically */
    .lilac-table-wrapper:hover .lilac-table-add-row-line,
    .lilac-table-wrapper:hover .lilac-table-add-col-line {
      opacity: 0.3;
      background: var(--lilac-color-primary, #6366f1);
    }
    
    .lilac-table-wrapper:hover .lilac-table-add-row-line:hover,
    .lilac-table-wrapper:hover .lilac-table-add-col-line:hover {
      opacity: 1;
      background: var(--lilac-color-primary, #6366f1);
    }
  `,

    // The context argument is required by the plugin interface, but not used here
    onInstall: (_context: EditorContext) => {
        console.log('Table Inserter plugin installed');
    },

    onUninstall: (_context: EditorContext) => {
        console.log('Table Inserter plugin uninstalled');
    },
};
