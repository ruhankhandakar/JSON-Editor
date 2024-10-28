import { memo } from 'react';
import Editor from '@monaco-editor/react';

const JsonEditor = memo(
  ({
    value,
    onChange,
    height = '400px',
  }: {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
    height?: string;
  }) => {
    const handleEditorChange = (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    };

    return (
      <div className="space-y-2">
        <div className="border rounded-md">
          <Editor
            height={height}
            defaultLanguage="json"
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    );
  },
);

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
