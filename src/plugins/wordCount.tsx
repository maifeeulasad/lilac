import { FileText } from 'lucide-react';
import React from 'react';
import { EditorContext, EditorPlugin } from '../types/plugin';

interface WordCountState {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    paragraphs: number;
}

const WordCountPanel: React.FC<{ context: EditorContext }> = ({ context }) => {
    const [stats, setStats] = React.useState<WordCountState>({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
    });

    const calculateStats = React.useCallback((content: string): WordCountState => {
        const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags

        return {
            words: text.trim() ? text.trim().split(/\s+/).length : 0,
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            paragraphs: text.trim() ? text.split(/\n\s*\n/).length : 0,
        };
    }, []);

    React.useEffect(() => {
        setStats(calculateStats(context.state.content));
    }, [context.state.content, calculateStats]);

    return (
        <div className="lilac-word-count-panel">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>Document Statistics</h3>
            <div className="lilac-word-count-stats">
                <div className="lilac-word-count-stat">
                    <span className="label">Words:</span>
                    <span className="value">{stats.words.toLocaleString()}</span>
                </div>
                <div className="lilac-word-count-stat">
                    <span className="label">Characters:</span>
                    <span className="value">{stats.characters.toLocaleString()}</span>
                </div>
                <div className="lilac-word-count-stat">
                    <span className="label">Characters (no spaces):</span>
                    <span className="value">{stats.charactersNoSpaces.toLocaleString()}</span>
                </div>
                <div className="lilac-word-count-stat">
                    <span className="label">Paragraphs:</span>
                    <span className="value">{stats.paragraphs.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export const wordCountPlugin: EditorPlugin = {
    id: 'word-count',
    name: 'Word Count',
    version: '1.0.0',
    description: 'Displays word count and document statistics',
    author: 'Lilac Editor',

    panels: [
        {
            id: 'word-count-panel',
            title: 'Word Count',
            icon: React.createElement(FileText, { size: 16 }),
            position: 'right',
            defaultOpen: false,
            component: WordCountPanel,
        },
    ],

    styles: `
    .lilac-word-count-panel {
      padding: 16px;
      font-family: var(--lilac-font-family);
      font-size: 13px;
      line-height: 1.4;
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
      border-bottom: 1px solid var(--lilac-color-border);
    }
    
    .lilac-word-count-stat:last-child {
      border-bottom: none;
    }
    
    .lilac-word-count-stat .label {
      color: var(--lilac-color-text-secondary);
      font-weight: 500;
    }
    
    .lilac-word-count-stat .value {
      font-weight: 600;
      color: var(--lilac-color-primary);
      font-variant-numeric: tabular-nums;
    }
  `,

    onInstall: (_: EditorContext) => {
        console.log('Word Count plugin installed');
    },

    onUninstall: (_: EditorContext) => {
        console.log('Word Count plugin uninstalled');
    },
};
