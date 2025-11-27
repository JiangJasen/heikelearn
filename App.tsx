
import React, { useState, useEffect } from 'react';
import { GameStage, LevelConfig } from './types';
import CodeEditor from './components/CodeEditor';
import PreviewWindow from './components/PreviewWindow';
import MentorChat from './components/MentorChat';
import { generateCodeReview } from './services/geminiService';
import { Terminal, Code, Play, CheckCircle, ChevronRight, Award, Lightbulb, HelpCircle, X } from 'lucide-react';

const LEVEL_CONFIGS: Record<GameStage, LevelConfig> = {
  [GameStage.INTRO]: {
    id: GameStage.INTRO,
    title: "第一章：骨架 (HTML)",
    description: "网页就像一个人，HTML 是它的骨架。我们需要修复这个页面的标题和简介，让它能够显示内容。",
    mission: "使用 <h1> 标签包裹 'Hello World'，使用 <p> 标签包裹 '我是新来的黑客'。",
    initialCode: `<div>
  <!-- 在这里写标题 -->
  
  <!-- 在这里写段落 -->
  
</div>`,
    solutionHint: `<h1>Hello World</h1>
<p>我是新来的黑客</p>`,
    explanation: `HTML 使用“标签”来包裹内容。
1. 找到注释 <!-- 在这里写标题 --> 的下方。
2. 输入 <h1>Hello World</h1>。
   - <h1> 代表 Heading 1（一级标题），通常用于页面主标题。
3. 找到注释 <!-- 在这里写段落 --> 的下方。
4. 输入 <p>我是新来的黑客</p>。
   - <p> 代表 Paragraph（段落），用于普通文本。`,
    validation: (code) => /<h1>.+<\/h1>/.test(code) && /<p>.+<\/p>/.test(code),
    successMessage: "骨架修复成功！系统识别到了内容结构。"
  },
  [GameStage.HTML_BASICS]: {
     // Re-using enum for simplicity
     id: GameStage.HTML_BASICS,
     title: "第一章：骨架 (HTML)",
     description: "同上...",
     mission: "同上...",
     initialCode: "", 
     solutionHint: "",
     explanation: "",
     validation: () => true,
     successMessage: ""
  },
  [GameStage.CSS_STYLING]: {
    id: GameStage.CSS_STYLING,
    title: "第二章：皮肤 (Tailwind CSS)",
    description: "骨架很丑陋。CSS 是衣服和化妆品。我们需要把这个按钮变得好看一点。使用 Tailwind 的类名来美化它。",
    mission: "给 <button> 标签添加 className。要求：蓝色背景 (bg-blue-500)，白色文字 (text-white)，圆角 (rounded-lg)，内边距 (p-2)。",
    initialCode: `<div className="flex items-center justify-center h-screen">
  <div className="bg-white p-6 shadow-xl rounded-2xl">
    <h2 className="text-2xl font-bold mb-4">个人资料</h2>
    
    <!-- 修改下面的按钮 -->
    <button className="">
      点击关注
    </button>
    
  </div>
</div>`,
    solutionHint: `<button className="bg-blue-500 text-white rounded-lg p-2">
  点击关注
</button>`,
    explanation: `我们需要在 button 标签的 className 属性中填入样式类名（用空格分隔）：
1. bg-blue-500: 设置背景颜色 (Background) 为蓝色 500 号。
2. text-white: 设置文字颜色 (Text) 为白色。
3. rounded-lg: 设置圆角 (Rounded) 为大号 (Large)。
4. p-2: 设置内边距 (Padding) 为 2 个单位。

将这些单词填入 className="" 的双引号中间即可。`,
    validation: (code) => {
        return code.includes('bg-blue-500') && code.includes('text-white') && code.includes('rounded-lg');
    },
    successMessage: "视觉模组加载成功！界面焕然一新。"
  },
  [GameStage.REACT_STATE]: {
    id: GameStage.REACT_STATE,
    title: "第三章：灵魂 (React State)",
    description: "现在页面是死的。JS/React 赋予它灵魂和交互。我们需要让计数器动起来。",
    mission: "1. 补充 useState(0)。 2. 在 onClick 中调用 setCount(count + 1)。",
    initialCode: `import React, { useState } from 'react';

function Counter() {
  // 任务1：在这里定义状态 count
  const [count, setCount] = 
  
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl mb-4">{count}</h1>
      <button 
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        // 任务2：在这里添加点击事件
        onClick={}
      >
        增加点赞
      </button>
    </div>
  );
}
`,
    solutionHint: `const [count, setCount] = useState(0);
// ...
onClick={() => setCount(count + 1)}`,
    explanation: `React 组件需要"状态"来记住数据：
1. 任务1：初始化状态。
   输入: useState(0)
   这行代码的意思是：创建一个变量 count，初始值是 0。setCount 是用来修改它的函数。

2. 任务2：处理点击。
   在 onClick={} 的花括号中输入一个箭头函数:
   () => setCount(count + 1)
   这行代码的意思是：当被点击时，调用 setCount，把新的值设置为 count + 1。`,
    validation: (code) => code.includes('useState(0)') && code.includes('setCount(count + 1)'),
    successMessage: "神经连接建立！交互逻辑运行正常。"
  },
  [GameStage.COMPLETED]: {
    id: GameStage.COMPLETED,
    title: "毕业：自由黑客",
    description: "你已经掌握了基础。HTML构建结构，CSS修饰外观，React处理逻辑。",
    mission: "你已毕业。你可以复制这些代码去创建真正的项目了。",
    initialCode: "// 恭喜！你已经完成了所有训练课程。\n// 下一步：安装 Node.js 和 VS Code，开始你的真实旅程。",
    solutionHint: "",
    explanation: "祝贺你！你已经迈出了全栈开发的第一步。",
    validation: () => false,
    successMessage: ""
  }
};

const STAGE_ORDER = [GameStage.INTRO, GameStage.CSS_STYLING, GameStage.REACT_STATE, GameStage.COMPLETED];

const App: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [code, setCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  
  const currentStage = STAGE_ORDER[currentStageIndex];
  const config = LEVEL_CONFIGS[currentStage];

  // Initialize code when stage changes
  useEffect(() => {
    setCode(config.initialCode);
    setIsSuccess(false);
    setAiFeedback("");
    setShowExplanation(false);
  }, [currentStage, config.initialCode]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (config.validation(newCode)) {
      if (!isSuccess) {
         setIsSuccess(true);
         // Ask AI for a celebratory review
         generateCodeReview(newCode, config.mission).then(setAiFeedback);
      }
    } else {
        setIsSuccess(false);
    }
  };

  const nextLevel = () => {
    if (currentStageIndex < STAGE_ORDER.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  if (currentStage === GameStage.COMPLETED) {
      return (
          <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
              <Award size={64} className="text-yellow-400 mb-6" />
              <h1 className="text-4xl font-bold mb-4">恭喜毕业！</h1>
              <p className="text-xl text-gray-400 max-w-lg text-center mb-8">
                  你已经完成了 H5 骇客学院的基础训练。你学会了：HTML标签、Tailwind样式类、以及React状态管理。
              </p>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full">
                  <h3 className="text-lg font-bold mb-4 text-accent-cyan">下一步建议：</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>下载 <strong>VS Code</strong> 编辑器。</li>
                      <li>安装 <strong>Node.js</strong> 环境。</li>
                      <li>在终端运行 <code className="bg-black px-2 py-1 rounded">npx create-react-app my-app</code>。</li>
                      <li>尝试复现刚才游戏中的计数器组件。</li>
                  </ul>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-200 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent-pink" />
          <span className="font-bold text-lg tracking-wider">H5 骇客代码学院</span>
          <span className="ml-4 text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">
             Level {currentStageIndex + 1} / {STAGE_ORDER.length - 1}
          </span>
        </div>
        <div>
           {isSuccess && (
               <button 
                 onClick={nextLevel}
                 className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-full font-bold transition-all animate-bounce"
               >
                 下一关 <ChevronRight size={16} />
               </button>
           )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Mission & Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
          
          {/* Mission Panel */}
          <div className="bg-gray-900 p-6 border-b border-gray-800 flex-shrink-0 relative">
             <div className="flex justify-between items-start mb-2">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Code className="text-accent-cyan" size={20}/> 
                    {config.title}
                 </h2>
                 <button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-xs text-accent-cyan hover:text-cyan-200 flex items-center gap-1 transition-colors"
                    title="查看任务解析与答案"
                 >
                    <Lightbulb size={16} className={showExplanation ? "fill-accent-cyan" : ""} /> 
                    {showExplanation ? "收起解析" : "任务解析"}
                 </button>
             </div>
             
             <p className="text-gray-400 text-sm mb-4 leading-relaxed">
               {config.description}
             </p>
             
             <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 relative">
               <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 flex items-center gap-2">
                 当前任务 MISSION
               </h3>
               <p className="text-accent-cyan font-mono text-sm">{config.mission}</p>
             </div>

             {/* Explanation Panel (Conditional) */}
             {showExplanation && (
                 <div className="mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 shadow-2xl">
                     <div className="flex justify-between items-center mb-2">
                         <h4 className="font-bold text-white text-sm flex items-center gap-2">
                             <HelpCircle size={14} className="text-yellow-400" /> 
                             解题思路
                         </h4>
                     </div>
                     <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mb-4 pl-2 border-l-2 border-gray-600">
                         {config.explanation}
                     </div>
                     <div className="bg-black/40 p-3 rounded border border-gray-700">
                         <p className="text-xs text-gray-500 mb-1">参考代码：</p>
                         <code className="text-green-400 font-mono text-xs whitespace-pre">{config.solutionHint}</code>
                     </div>
                 </div>
             )}

             {isSuccess && !showExplanation && (
                 <div className="mt-4 bg-green-900/30 border border-green-700 text-green-400 p-3 rounded flex items-start gap-2 text-sm animate-in fade-in">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">{config.successMessage}</p>
                        {aiFeedback && <p className="mt-1 text-gray-300 text-xs italic">" {aiFeedback} "</p>}
                    </div>
                 </div>
             )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 min-h-0 relative">
             <CodeEditor 
               code={code} 
               onChange={handleCodeChange} 
             />
             <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                {!isSuccess ? (
                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-900/80 px-3 py-1 rounded backdrop-blur border border-yellow-700/50 text-xs shadow-lg">
                        <Play size={12} /> 编辑代码实时生效
                    </div>
                ) : null}
             </div>
          </div>
        </div>

        {/* Right: Preview & Mentor */}
        <div className="w-[450px] flex flex-col min-w-0 bg-gray-100 border-l border-gray-800">
           {/* Preview (Top Half) */}
           <div className="h-1/2 border-b border-gray-300 relative">
              <PreviewWindow code={code} stage={currentStage} />
           </div>

           {/* AI Chat (Bottom Half) */}
           <div className="h-1/2 flex flex-col min-h-0">
              <MentorChat currentCode={code} stage={currentStage} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;
