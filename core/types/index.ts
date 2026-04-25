export interface EditorState {
  content: string;
  selection: SelectionRange | null;
  history: HistoryState;
  isReadOnly: boolean;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export interface HistoryState {
  undoStack: string[];
  redoStack: string[];
  maxHistorySize: number;
}

export interface EditorConfig {
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export interface ToolbarConfig {
  show?: boolean;
  tools?: ToolbarTool[];
  position?: 'top' | 'bottom' | 'floating';
}

export type ToolbarTool =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'separator';

export interface EditorProps extends EditorConfig {
  container: HTMLElement;
  initialContent?: string;
  onChange?: (content: string) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  toolbar?: ToolbarConfig;
  plugins?: EditorPlugin[];
}

// Plugin types
export interface EditorContext {
  state: EditorState;
  setState: (state: Partial<EditorState>) => void;
  element: HTMLElement | null;
  focus: () => void;
  blur: () => void;
  insertContent: (content: string) => void;
  formatSelection: (command: string, value?: string) => void;
  getSelectedText: () => string;
}

export interface ToolbarButton {
  id: string;
  icon: string; // SVG string
  label: string;
  tooltip?: string;
  onClick: (context: EditorContext) => void;
  isActive?: (context: EditorContext) => boolean;
  shortcut?: string;
  group?: string;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string; // SVG string
  onClick: (context: EditorContext) => void;
  separator?: boolean;
  visible?: (context: EditorContext) => boolean;
}

export interface EditorPanel {
  id: string;
  title: string;
  icon?: string; // SVG string
  position: 'left' | 'right' | 'bottom';
  defaultOpen?: boolean;
  render: (context: EditorContext, container: HTMLElement) => void;
  destroy?: () => void;
}

export interface ContentTransformer {
  id: string;
  name: string;
  transform: (content: string, context: EditorContext) => string;
  reverse?: (content: string, context: EditorContext) => string;
}

export interface EditorPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  onInstall?: (context: EditorContext) => void;
  onUninstall?: (context: EditorContext) => void;
  onEditorMount?: (context: EditorContext) => void;
  onEditorUnmount?: (context: EditorContext) => void;
  onContentChange?: (content: string, context: EditorContext) => void;
  onSelectionChange?: (selection: SelectionRange | null, context: EditorContext) => void;
  toolbarButtons?: ToolbarButton[];
  contextMenuItems?: ContextMenuItem[];
  panels?: EditorPanel[];
  keyboardShortcuts?: KeyboardShortcut[];
  contentTransformers?: ContentTransformer[];
  styles?: string;
  config?: Record<string, unknown>;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: (context: EditorContext) => void;
  preventDefault?: boolean;
}

export interface FormatCommand {
  command: string;
  value?: string | boolean;
}
