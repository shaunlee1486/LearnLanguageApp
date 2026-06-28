declare module 'hanzi-writer' {
  export interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    radicalColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    drawingWidth?: number;
    showCharacter?: boolean;
  }

  export default class HanziWriter {
    static create(element: string | HTMLElement, character: string, options?: HanziWriterOptions): HanziWriter;
    animateCharacter(): void;
    quiz(options?: any): void;
    cancelQuiz(): void;
    setCharacter(char: string): void;
    hideCharacter(): void;
    showCharacter(): void;
    updateColor(colorName: string, colorValue: string, options?: any): void;
    destroy(): void;
  }
}
