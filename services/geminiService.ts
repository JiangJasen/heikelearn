import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

// 安全获取 API Key，兼容 Vite (import.meta.env) 和 Node 环境
// 注意：在 Vercel 部署时，请在环境变量中设置 VITE_API_KEY
const getApiKey = (): string => {
  try {
    // @ts-ignore: Vite injects import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });
const modelId = "gemini-2.5-flash";

export const getMentorResponse = async (
  history: ChatMessage[], 
  currentCode: string, 
  stage: string
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "错误：未检测到 API Key。请在 Vercel 环境变量中设置 VITE_API_KEY。";
    }

    const systemPrompt = `
      你是一款名为 "H5 骇客学院" 游戏中的 AI 导师（代号：Oracle）。
      用户的目标是学习 HTML5, Tailwind CSS 和 React 基础。
      
      当前阶段: ${stage}
      用户当前代码:
      \`\`\`tsx
      ${currentCode}
      \`\`\`

      你的职责：
      1. 极其简短地回答用户关于代码的问题。
      2. 如果用户卡住了，给出温和的提示，但不要直接给出完整答案，除非用户明确要求。
      3. 保持语气鼓励、带一点赛博朋克风格的幽默。
      4. 解释概念时使用简单的比喻。
      
      请用中文回复。
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }, // Pre-seed context as user prompt for stateless feel or use proper history
        ...history.map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      ],
      config: {
        systemInstruction: "你是一个友好的编程导师，帮助初学者学习Web开发。",
        temperature: 0.7,
      }
    });

    return response.text || "系统连接不稳定，请重试...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "与 AI 导师的连接中断。请检查 API Key 配置。";
  }
};

export const generateCodeReview = async (code: string, mission: string): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "API Key 未配置。";

        const response = await ai.models.generateContent({
            model: modelId,
            contents: `
                任务: ${mission}
                代码: ${code}
                
                请用50字以内评价这段代码是否完成了任务，并指出一个优点。
            `
        });
        return response.text || "代码分析完成。";
    } catch (e) {
        return "代码分析模块离线。";
    }
}