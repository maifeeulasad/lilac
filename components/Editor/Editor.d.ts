import { EditorProps } from '../../types';
import { default as React } from 'react';
export interface EditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
    focus: () => void;
    blur: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}
export declare const Editor: React.ForwardRefExoticComponent<EditorProps & React.RefAttributes<EditorRef>>;
