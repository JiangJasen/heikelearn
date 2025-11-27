
export enum GameStage {
  INTRO = 'INTRO',
  HTML_BASICS = 'HTML_BASICS',
  CSS_STYLING = 'CSS_STYLING',
  REACT_STATE = 'REACT_STATE',
  COMPLETED = 'COMPLETED'
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface LevelConfig {
  id: GameStage;
  title: string;
  description: string;
  mission: string;
  initialCode: string;
  solutionHint: string;
  explanation: string;
  validation: (code: string) => boolean;
  successMessage: string;
}

export interface PreviewProps {
  code: string;
  stage: GameStage;
}
