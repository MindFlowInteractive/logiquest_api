import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PuzzleManagerService } from '../puzzle-engine/services/puzzle-manager.service';
import { CreatePuzzleDto } from '../puzzle-engine/dto/create-puzzle.dto';
import { SolvePuzzleDto } from '../puzzle-engine/dto/solve-puzzle.dto';

@Controller('puzzles')
export class PuzzleApiController {
  constructor(private puzzleManager: PuzzleManagerService) {}
  
  @Post()
  createPuzzle(@Body() createPuzzleDto: CreatePuzzleDto) {
    try {
      const puzzle = this.puzzleManager.createPuzzle(
        createPuzzleDto.type,
        createPuzzleDto.data,
        createPuzzleDto.metadata,
      );
      
      return {
        id: puzzle.id,
        type: puzzle.type,
        difficulty: puzzle.difficulty,
        difficultyLabel: puzzle.getDifficultyLabel(),
        metadata: puzzle.metadata,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Post(':id/instance')
  createInstance(@Param('id') puzzleId: string, @Body() body: { userId?: string }) {
    try {
      const puzzle = this.puzzleManager.getPuzzle(puzzleId);
      if (!puzzle) {
        throw new HttpException('Puzzle not found', HttpStatus.NOT_FOUND);
      }
      
      const instance = this.puzzleManager.createInstance(puzzle, body.userId);
      
      return {
        id: instance.id,
        puzzleId: instance.puzzleId,
        currentState: instance.currentState,
        startedAt: instance.startedAt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Post(':id/solve')
  solvePuzzle(@Param('id') puzzleId: string, @Body() solvePuzzleDto: SolvePuzzleDto) {
    try {
      const puzzle = this.puzzleManager.getPuzzle(puzzleId);
      if (!puzzle) {
        throw new HttpException('Puzzle not found', HttpStatus.NOT_FOUND);
      }
      
      const isCorrect = this.puzzleManager.checkSolution(puzzle, solvePuzzleDto.solution);
      
      return {
        correct: isCorrect,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Post('instances/:id/move')
  makeMove(@Param('id') instanceId: string, @Body() body: { move: any }) {
    try {
      const success = this.puzzleManager.makeMove(instanceId, body.move);
      
      if (!success) {
        return {
          success: false,
          message: 'Invalid move',
        };
      }
      
      const instance = this.puzzleManager.getInstance(instanceId);
      
      return {
        success: true,
        currentState: instance.currentState,
        isCompleted: instance.isCompleted,
        lastUpdatedAt: instance.lastUpdatedAt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get('types')
  getPuzzleTypes() {
    const puzzleTypes = this.puzzleManager.getAllPuzzleTypes();
    
    return puzzleTypes.map(type => ({
      type: type.type,
      displayName: type.displayName,
      description: type.description,
    }));
  }
}