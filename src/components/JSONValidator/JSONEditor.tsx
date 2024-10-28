import { memo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { ValidationError } from '@/types';

const findErrorPosition = (
  json: string,
  path: string,
): { line: number; column: number } | null => {
  try {
    const lines = json.split('\n');
    const pathParts = path.split('.').filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Look for the last part of the path
      if (
        pathParts.length > 0 &&
        trimmedLine.includes(`"${pathParts[pathParts.length - 1]}"`)
      ) {
        return {
          line: i + 1, // Monaco editor lines are 1-based
          column: line.indexOf(`"${pathParts[pathParts.length - 1]}"`) + 1,
        };
      }
    }

    return null;
  } catch (e) {
    return null;
  }
};

const JsonEditor = memo(
  ({
    value,
    onChange,
    height = '400px',
    validationErrors = null,
    readOnly = false,
  }: {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
    height?: string;
    validationErrors?: ValidationError | null;
    readOnly?: boolean;
  }) => {
    const handleEditorChange = (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    };

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
      // Set up JSON validation
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [],
      });
    };

    const getMarkers = useCallback((): monaco.editor.IMarkerData[] => {
      if (!validationErrors) return [];

      const markers: monaco.editor.IMarkerData[] = [];
      Object.entries(validationErrors).forEach(([path, message]) => {
        const position = findErrorPosition(value, path);
        if (position) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: typeof message === 'string' ? message : 'Invalid value',
            startLineNumber: position.line,
            startColumn: position.column,
            endLineNumber: position.line,
            endColumn: position.column + 20,
          });
        }
      });
      return markers;
    }, [validationErrors, value]);

    return (
      <div className="space-y-2">
        <div className="border rounded-md">
          <Editor
            height={height}
            defaultLanguage="json"
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
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
              tabSize: 2,
              readOnly,
              renderValidationDecorations: 'on',
              folding: true,
              foldingHighlight: true,
              foldingStrategy: 'auto',
              showFoldingControls: 'always',
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
            }}
            markers={getMarkers()}
          />
        </div>
      </div>
    );
  },
);

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
