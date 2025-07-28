'use client';

import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
  height?: string;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  theme = 'dark',
  height = '100%' 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const getPlaceholder = () => {
    switch (language) {
      case 'javascript':
        return `// Write your JavaScript code here
function solution() {
  // Your implementation
  return result;
}`;
      case 'python':
        return `# Write your Python code here
def solution():
    # Your implementation
    return result`;
      case 'java':
        return `// Write your Java code here
public class Solution {
    public static void main(String[] args) {
        // Your implementation
    }
}`;
      case 'sql':
        return `-- Write your SQL query here
SELECT * FROM table_name
WHERE condition;`;
      case 'html':
        return `<!-- Write your HTML code here -->
<!DOCTYPE html>
<html>
<head>
    <title>Your Title</title>
</head>
<body>
    <!-- Your content -->
</body>
</html>`;
      case 'css':
        return `/* Write your CSS code here */
.container {
    /* Your styles */
}`;
      default:
        return `// Write your ${language} code here`;
    }
  };

  return (
    <div className="relative h-full bg-[#1A1A1A] border border-gray-600">
      {/* Line Numbers */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0F0F0F] border-r border-gray-700 flex flex-col text-xs text-gray-500 pt-4">
        {value.split('\n').map((_, index) => (
          <div key={index} className="h-6 flex items-center justify-end pr-2">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code Editor */}
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full h-full bg-transparent text-white font-mono text-sm pl-16 pr-4 py-4 resize-none outline-none leading-6"
        style={{
          minHeight: height,
          tabSize: 2,
        }}
        spellCheck={false}
      />

      {/* Language indicator */}
      <div className="absolute top-2 right-2 bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded text-xs font-medium">
        {language.toUpperCase()}
      </div>
    </div>
  );
}