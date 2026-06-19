export class Hint {
  id: string;
  puzzleId: string;
  order: number; // 1-3
  content: string;

  constructor(id: string, puzzleId: string, order: number, content: string) {
    this.id = id;
    this.puzzleId = puzzleId;
    this.order = order;
    this.content = content;
  }
}
