import React, { useState, useRef, useEffect } from 'react';
import { GameStage } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// 关键词库：包含 HTML 标签, Tailwind 类名, React 常用词, CSS 属性
const KEYWORDS = [
  // HTML Tags
  'div', 'p', 'h1', 'h2', 'h3', 'span', 'button', 'img', 'input', 'form', 'ul', 'li', 'section', 'header', 'footer', 'a', 'nav', 'main',
  // React / JS
  'import', 'export', 'return', 'const', 'function', 'default', 'useState', 'useEffect', 'console', 'log', 'map', 'onClick', 'onChange', 'onSubmit',
  // CSS Props (for style or general knowledge)
  'color', 'cursor', 'content', 'columns', 'clear', 'clip',
  'background', 'border', 'margin', 'padding', 'width', 'height', 'font-size', 'display', 'position', 'top', 'left', 'flex', 'grid',
  // Attributes
  'className', 'src', 'alt', 'href', 'type', 'placeholder', 'value', 'key', 'id',
  // Tailwind Common Classes
  'flex', 'items-center', 'justify-center', 'flex-col', 'grid', 'hidden', 'block',
  'bg-white', 'bg-black', 'bg-gray-100', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-indigo-600', 'bg-yellow-400',
  'text-white', 'text-black', 'text-gray-500', 'text-center', 'text-xl', 'text-2xl', 'text-sm', 'text-lg', 'font-bold',
  'p-2', 'p-4', 'p-6', 'p-8', 'px-4', 'py-2',
  'm-2', 'm-4', 'mb-4', 'mt-4', 'mx-auto',
  'rounded', 'rounded-lg', 'rounded-xl', 'rounded-full',
  'shadow', 'shadow-lg', 'shadow-md',
  'border', 'border-gray-300', 'w-full', 'h-screen', 'h-full'
];

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorXY, setCursorXY] = useState({ top: 0, left: 0 });
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // 同步滚动：让视觉层跟随输入层滚动
  const handleScroll = () => {
    if (visualRef.current && textareaRef.current) {
      visualRef.current.scrollTop = textareaRef.current.scrollTop;
      visualRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // 1. 光标位置修复 & 自动闭合标签
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[activeSuggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // 自动闭合标签逻辑: 当用户输入 '>' 时
    if (e.key === '>') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const codeBefore = code.substring(0, start);
      
      // 检查是否在输入一个标签，例如 <div 或 <P
      const match = codeBefore.match(/<([a-zA-Z0-9]+)$/);
      
      if (match) {
        // 找到了开始标签，准备插入闭合标签
        e.preventDefault();
        const tagName = match[1];
        // 插入 > 和 </tagName>
        const newCode = code.substring(0, start) + ">" + `</${tagName}>` + code.substring(start);
        
        onChange(newCode);
        
        // 移动光标到 > 后面
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = start + 1;
          }
        }, 0);
        return;
      }
    }
  };

  // 2. 代码联想逻辑
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    const textarea = e.target;
    const start = textarea.selectionStart;

    // 获取光标前的单词
    const textBeforeCursor = newVal.substring(0, start);
    // 匹配光标前的最后一个单词 (字母、数字、短横线)
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9-]+)$/);

    if (wordMatch) {
      const currentWord = wordMatch[1];
      // 过滤建议 (忽略大小写)
      const filtered = KEYWORDS.filter(k => 
        k.toLowerCase().startsWith(currentWord.toLowerCase()) && k !== currentWord
      ).slice(0, 8);

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSuggestions(true);
        setActiveSuggestionIndex(0);
        
        // 计算弹窗位置
        const lines = textBeforeCursor.split('\n');
        const currentLineIndex = lines.length - 1;
        const currentLineChars = lines[lines.length - 1].length;
        
        // 考虑滚动偏移量
        const scrollTop = textarea.scrollTop || 0;
        const scrollLeft = textarea.scrollLeft || 0;

        // 计算坐标:
        // Top = PaddingTop(16) + LineIndex * LineHeight(24) + LineHeight(24) - ScrollTop
        const top = 16 + (currentLineIndex + 1) * 24 - scrollTop; 
        
        // Left = PaddingLeft(64) + Chars * CharWidth(approx 8.5) - ScrollLeft
        // 64px = 16px(Padding) + 32px(LineNum) + 16px(Margin)
        const left = 64 + (currentLineChars * 8.5) - scrollLeft; 

        setCursorXY({ top, left });
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const textBeforeCursor = code.substring(0, start);
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9-]+)$/);

    if (wordMatch) {
      const currentWord = wordMatch[1];
      const insertText = suggestion.substring(currentWord.length);
      
      const newCode = code.substring(0, start) + insertText + code.substring(start);
      onChange(newCode);
      setShowSuggestions(false);

      // 移动光标
      setTimeout(() => {
        if(textareaRef.current) {
          const newPos = start + insertText.length;
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleBlur = () => {
    // 延迟关闭，以便点击建议项时能触发点击事件
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full h-full bg-editor-bg font-mono text-sm overflow-hidden flex flex-col">
       <div className="bg-[#252526] px-4 py-2 text-xs text-gray-400 border-b border-black flex items-center justify-between flex-shrink-0 select-none">
         <span>Mission_File.tsx</span>
         <span className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-yellow-500"></div> TSX
         </span>
       </div>
      
      <div className="relative flex-1 bg-editor-bg overflow-hidden">
        {/* 
            Visual Layer (Background) 
            布局必须严格匹配 Textarea。
            Container Padding: p-4 (16px)
            Line Number: w-8 (32px) + mr-4 (16px)
            Total Left Offset for Text = 16 + 32 + 16 = 64px.
        */}
        <div 
            ref={visualRef}
            className="absolute inset-0 w-full h-full p-4 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
             <div className="min-h-full">
                {code.split('\n').map((line, i) => (
                    <div key={i} className="leading-6 min-h-[1.5rem] flex whitespace-pre">
                        <span className="flex-shrink-0 w-8 mr-4 text-right text-gray-600 select-none text-xs border-r border-gray-700 pr-2 h-6 flex items-center justify-end">
                        {i + 1}
                        </span>
                        <span className="text-gray-300 font-mono">{line}</span>
                    </div>
                ))}
                {/* 底部缓冲空间 */}
                <div className="h-32"></div>
             </div>
        </div>

        {/* 
            Input Layer (Foreground)
            pl-16 (64px) to match the visual offset exactly.
        */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onScroll={handleScroll}
          disabled={disabled}
          className="absolute inset-0 w-full h-full p-4 pl-16 bg-transparent text-transparent caret-accent-pink z-10 resize-none focus:outline-none font-mono leading-6 whitespace-pre"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{ fontFamily: '"Fira Code", monospace', tabSize: 2 }} 
        />

        {/* Autocomplete Dropdown */}
        {showSuggestions && (
          <ul 
            className="absolute z-50 bg-[#252526] border border-gray-600 rounded shadow-2xl max-h-48 overflow-y-auto w-48 font-sans"
            style={{ 
                top: Math.max(0, cursorXY.top), 
                left: Math.max(0, cursorXY.left) 
            }}
          >
            {suggestions.map((s, idx) => (
              <li 
                key={s}
                onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }} 
                className={`px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2 ${idx === activeSuggestionIndex ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <span className="w-3 h-3 rounded-full bg-accent-cyan opacity-50 flex-shrink-0"></span>
                <span className="font-mono">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;