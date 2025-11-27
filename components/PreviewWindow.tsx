import React, { useState } from 'react';
import { GameStage } from '../types';

interface PreviewWindowProps {
  code: string;
  stage: GameStage;
}

const PreviewWindow: React.FC<PreviewWindowProps> = ({ code, stage }) => {
  // A simplified runner. In a real scenario, we might use an iframe or a more robust parser.
  // For this game, we will simulate the rendering by parsing specific expected structures 
  // or simply rendering a predetermined component if the code matches regexes, 
  // OR we can try to render it if it's safe content.
  
  // Since we are teaching React/HTML, we can try to "Extract" the content from the string
  // and render it. To keep it safe and simple for this "0-basis" game, 
  // we will interpret the user's intent.

  const renderContent = () => {
    // Parser for Stage 1 (HTML Basics)
    // Looking for <h1>Content</h1>, <p>Content</p>
    if (stage === GameStage.HTML_BASICS) {
       const h1Match = code.match(/<h1>(.*?)<\/h1>/);
       const pMatch = code.match(/<p>(.*?)<\/p>/);
       
       return (
         <div className="p-8 bg-white h-full text-black">
           {h1Match ? <h1 className="text-4xl font-bold mb-4">{h1Match[1]}</h1> : <div className="border-2 border-dashed border-red-300 p-2 text-red-400 mb-4">在此处添加标题...</div>}
           {pMatch ? <p className="text-lg text-gray-700">{pMatch[1]}</p> : <div className="border-2 border-dashed border-red-300 p-2 text-red-400">在此处添加段落...</div>}
         </div>
       )
    }

    // Parser for Stage 2 (CSS/Tailwind)
    // Looking for className="..."
    if (stage === GameStage.CSS_STYLING) {
        const btnMatch = code.match(/<button className="(.*?)">(.*?)<\/button>/);
        const containerMatch = code.match(/<div className="(.*?)">/);
        
        const containerClass = containerMatch ? containerMatch[1] : "";
        const btnClass = btnMatch ? btnMatch[1] : "";
        const btnText = btnMatch ? btnMatch[2] : "Button";

        return (
            <div className={`h-full bg-slate-100 p-4 transition-all duration-500 ${containerClass}`}>
                 <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">个人名片</h2>
                    <p className="text-gray-600 mb-4">高级前端工程师</p>
                    {btnMatch ? (
                        <button className={btnClass}>{btnText}</button>
                    ) : (
                        <div className="text-red-500 border border-red-300 p-2">按钮代码缺失</div>
                    )}
                 </div>
            </div>
        );
    }

    // Parser for Stage 3 (React State)
    // This is hard to eval safely. We will simulate the "count" functionality visually
    // if the user typed the correct logic keywords.
    if (stage === GameStage.REACT_STATE) {
        const hasOnClick = code.includes('onClick');
        const hasSetCount = code.includes('setCount');
        const hasState = code.includes('useState');

        // Internal simulation state
        const [count, setCount] = useState(0);

        return (
             <div className="flex flex-col items-center justify-center h-full bg-indigo-50 text-indigo-900">
                <div className="text-6xl font-bold mb-8">{count}</div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => hasOnClick && hasSetCount ? setCount(c => c + 1) : alert("代码逻辑尚未完善！你需要添加 onClick 事件处理。")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg transition-transform active:scale-95"
                    >
                        点赞 (+1)
                    </button>
                    <button 
                         onClick={() => setCount(0)}
                         className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
                    >
                        重置
                    </button>
                </div>
                {!hasState && <p className="mt-8 text-red-500 bg-red-100 px-4 py-2 rounded">缺少 useState 定义</p>}
                {!hasOnClick && <p className="mt-2 text-red-500 bg-red-100 px-4 py-2 rounded">缺少 onClick 事件</p>}
             </div>
        );
    }
    
    // Default / Completed
    return (
        <div className="flex items-center justify-center h-full bg-green-50 text-green-800">
            <div className="text-center">
                <h1 className="text-3xl font-bold">系统重构完成</h1>
                <p>等待下一个任务...</p>
            </div>
        </div>
    )
  };

  return (
    <div className="h-full w-full bg-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 z-10 opacity-50 group-hover:opacity-100">
            Live Preview
        </div>
        {renderContent()}
    </div>
  );
};

export default PreviewWindow;