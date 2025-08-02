import type { ToolbarTool } from '@/types';
import type { ToolbarButton } from '@/types/plugin';
import { cn } from '@/utils';
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    Minus,
    Quote,
    Strikethrough,
    Type,
    Underline
} from 'lucide-react';
import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
    tools?: ToolbarTool[];
    onToolClick: (tool: ToolbarTool) => void;
    activeTools?: Set<ToolbarTool>;
    disabled?: boolean;
    className?: string;
    pluginButtons?: ToolbarButton[];
    editorContext?: any; // We'll type this properly later
}

const toolIcons: Record<ToolbarTool, React.ReactNode> = {
    bold: <Bold size={16} />,
    italic: <Italic size={16} />,
    underline: <Underline size={16} />,
    strikethrough: <Strikethrough size={16} />,
    heading1: <Heading1 size={16} />,
    heading2: <Heading2 size={16} />,
    heading3: <Heading3 size={16} />,
    paragraph: <Type size={16} />,
    bulletList: <List size={16} />,
    orderedList: <ListOrdered size={16} />,
    blockquote: <Quote size={16} />,
    codeBlock: <Code size={16} />,
    link: <Link size={16} />,
    image: <Image size={16} />,
    separator: <Minus size={16} />,
};

const toolLabels: Record<ToolbarTool, string> = {
    bold: 'Bold (Ctrl+B)',
    italic: 'Italic (Ctrl+I)',
    underline: 'Underline (Ctrl+U)',
    strikethrough: 'Strikethrough',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    paragraph: 'Paragraph',
    bulletList: 'Bullet List',
    orderedList: 'Numbered List',
    blockquote: 'Quote',
    codeBlock: 'Code Block',
    link: 'Link (Ctrl+K)',
    image: 'Image',
    separator: 'Separator',
};

const defaultTools: ToolbarTool[] = [
    'bold',
    'italic',
    'underline',
    'separator',
    'heading1',
    'heading2',
    'heading3',
    'paragraph',
    'separator',
    'bulletList',
    'orderedList',
    'blockquote',
    'separator',
    'link',
    'codeBlock',
];

export const Toolbar: React.FC<ToolbarProps> = ({
    tools = defaultTools,
    onToolClick,
    activeTools = new Set(),
    disabled = false,
    className,
    pluginButtons = [],
    editorContext,
}) => {
    const handleToolClick = (tool: ToolbarTool) => {
        if (disabled || tool === 'separator') return;
        onToolClick(tool);
    };

    return (
        <div className={cn('lilac-toolbar', { 'lilac-toolbar--disabled': disabled }, className)}>
            {tools.map((tool, index) => {
                if (tool === 'separator') {
                    return (
                        <div
                            key={`separator-${index}`}
                            className="lilac-toolbar__separator"
                            aria-hidden="true"
                        />
                    );
                }

                const isActive = activeTools.has(tool);

                return (
                    <button
                        key={tool}
                        type="button"
                        className={cn(
                            'lilac-toolbar__button',
                            {
                                'lilac-toolbar__button--active': isActive,
                                'lilac-toolbar__button--disabled': disabled,
                            }
                        )}
                        onClick={() => handleToolClick(tool)}
                        disabled={disabled}
                        title={toolLabels[tool]}
                        aria-label={toolLabels[tool]}
                        aria-pressed={isActive}
                    >
                        {toolIcons[tool]}
                    </button>
                );
            })}

            {/* Plugin buttons */}
            {pluginButtons.length > 0 && (
                <>
                    <div className="lilac-toolbar__separator" aria-hidden="true" />
                    {pluginButtons.map((button) => (
                        <button
                            key={button.id}
                            type="button"
                            className={cn(
                                'lilac-toolbar__button',
                                'lilac-toolbar__button--plugin',
                                {
                                    'lilac-toolbar__button--active': button.isActive?.(editorContext),
                                    'lilac-toolbar__button--disabled': disabled,
                                }
                            )}
                            onClick={() => !disabled && button.onClick(editorContext)}
                            disabled={disabled}
                            title={button.tooltip || button.label}
                            aria-label={button.label}
                            data-tooltip={button.tooltip}
                        >
                            {button.icon}
                        </button>
                    ))}
                </>
            )}
        </div>
    );
};
