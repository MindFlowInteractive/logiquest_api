import { Injectable } from '@nestjs/common';
import { Puzzle } from '../interfaces/puzzle.interface';
import { PuzzleInstance } from '../models/puzzle-instance.model';
import { PuzzleFactory } from '../factories/puzzle.factory';
import { PuzzleSerializationService } from './puzzle-serialization.service';
import { RewardsService } from '../../rewards/rewards.service';

@Injectable()
export class PuzzleManagerService {
  constructor(
    private puzzleFactory: PuzzleFactory,
    private serializationService: PuzzleSerializationService,
    private rewardsService: RewardsService,
  ) {}
  private instances: Map<string, PuzzleInstance> = new Map();
  
  createPuzzle(type: string, data: any, metadata?: any): Puzzle {
    return this.puzzleFactory.createPuzzle(type, data, metadata);
  }
  
  createInstance(puzzle: Puzzle, userId?: string): PuzzleInstance {
    const instance = new PuzzleInstance(puzzle, userId);
    this.instances.set(instance.id, instance);
    return instance;
  }
  
  getInstance(instanceId: string): PuzzleInstance | undefined {
    return this.instances.get(instanceId);
  }
  
  async makeMove(instanceId: string, move: any): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }
    
    const success = instance.makeMove(move);
    if (success && instance.isCompleted) {
      // Grant reward asynchronously, ignore result for now
      this.rewardsService.grantReward(instance).catch(() => {});
    }
    return success;
  }
  
  checkSolution(puzzle: Puzzle, solution: any): boolean {
    return puzzle.validate(solution);
  }
  
  savePuzzle(puzzle: Puzzle): string {
    return this.serializationService.serializePuzzle(puzzle);
  }
  
  loadPuzzle(type: string, serialized: string): Puzzle {
    return this.puzzleFactory.deserializePuzzle(type, serialized);
  }
  
  saveInstance(instance: PuzzleInstance): string {
    return instance.serialize();
  }
  
  loadInstance(serialized: string): PuzzleInstance {
    const data = JSON.parse(serialized);
    const puzzle = this.loadPuzzle(data.puzzle.type, data.puzzle);
    
    const instance = new PuzzleInstance(puzzle, data.userId);
    instance.id = data.id;
    instance.currentState = data.currentState;
    instance.moves = data.moves;
    instance.startedAt = new Date(data.startedAt);
    instance.lastUpdatedAt = new Date(data.lastUpdatedAt);
    instance.isCompleted = data.isCompleted;
    
    if (data.completedAt) {
      instance.completedAt = new Date(data.completedAt);
    }
    
    this.instances.set(instance.id, instance);
    return instance;
  }
  
  removeInstance(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }
  
  getActiveInstancesForUser(userId: string): PuzzleInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.userId === userId && !instance.isCompleted);
  }
}