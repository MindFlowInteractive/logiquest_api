export interface Puzzle {
    id: string;
    type: string;
    data: any; // Puzzle-specific data structure
    difficulty: number;
    metadata: PuzzleMetadata;
    
    // Methods
    validate(solution: any): boolean;
    calculateDifficulty(): number;
    serialize(): string;
    getInitialState(): any;
  }
  
  export interface PuzzleMetadata {
    name?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    authorId?: string;
  }