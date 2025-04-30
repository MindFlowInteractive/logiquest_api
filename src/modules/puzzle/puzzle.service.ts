import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Puzzle } from '../../entities/puzzle.entity';
import { PuzzleVersion } from '../../entities/puzzle-version.entity';
import { SolutionValidation } from '../../entities/solution-validation.entity';
import { PuzzleTranslation } from '../../entities/puzzle-translation.entity';

@Injectable()
export class PuzzleService {
  constructor(
    @InjectRepository(Puzzle)
    private puzzleRepository: Repository<Puzzle>,
    @InjectRepository(PuzzleVersion)
    private puzzleVersionRepository: Repository<PuzzleVersion>,
    @InjectRepository(SolutionValidation)
    private solutionValidationRepository: Repository<SolutionValidation>,
    @InjectRepository(PuzzleTranslation)
    private puzzleTranslationRepository: Repository<PuzzleTranslation>,
  ) {}

  async createPuzzle(puzzleData: any): Promise<Puzzle> {
    const puzzle = this.puzzleRepository.create(puzzleData);
    const savedPuzzle = await this.puzzleRepository.save(puzzle);
    
    // Create initial version
    const initialVersion = this.puzzleVersionRepository.create({
      puzzleId: savedPuzzle.id,
      versionNumber: 1,
      title: savedPuzzle.title,
      content: savedPuzzle.content,
      changeNotes: 'Initial version',
    });
    await this.puzzleVersionRepository.save(initialVersion);
    
    // Update puzzle with current version
    savedPuzzle.currentVersion = 1;
    return this.puzzleRepository.save(savedPuzzle);
  }

  async createNewVersion(puzzleId: string, versionData: any): Promise<PuzzleVersion> {
    const puzzle = await this.puzzleRepository.findOne({ where: { id: puzzleId } });
    if (!puzzle) {
      throw new Error('Puzzle not found');
    }
    
    const newVersionNumber = puzzle.currentVersion + 1;
    
    // Create new version
    const newVersion = this.puzzleVersionRepository.create({
      ...versionData,
      puzzleId,
      versionNumber: newVersionNumber,
    });
    
    const savedVersion = await this.puzzleVersionRepository.save(newVersion);
    
    // Update puzzle with current version and content
    puzzle.currentVersion = newVersionNumber;
    puzzle.title = versionData.title;
    puzzle.content = versionData.content;
    await this.puzzleRepository.save(puzzle);
    
    return savedVersion;
  }

  async addTranslation(puzzleId: string, translationData: any): Promise<PuzzleTranslation> {
    const translation = this.puzzleTranslationRepository.create({
      ...translationData,
      puzzleId,
    });
    return this.puzzleTranslationRepository.save(translation);
  }

  async setSolutionValidation(puzzleId: string, validationData: any): Promise<SolutionValidation> {
    // Check if validation already exists
    const existingValidation = await this.solutionValidationRepository.findOne({
      where: { puzzleId, isActive: true },
    });
    
    if (existingValidation) {
      // Deactivate existing validation
      existingValidation.isActive = false;
      await this.solutionValidationRepository.save(existingValidation);
    }
    
    // Create new validation
    const validation = this.solutionValidationRepository.create({
      puzzleId,
      ...validationData,
    });
    
    return this.solutionValidationRepository.save(validation);
  }

  async findPuzzles(filters: FindOptionsWhere<Puzzle>): Promise<Puzzle[]> {
    return this.puzzleRepository.find({
      where: filters,
      relations: ['category', 'tags', 'difficulty'],
    });
  }

  async getPuzzleWithTranslation(puzzleId: string, languageCode: string): Promise<any> {
    const puzzle = await this.puzzleRepository.findOne({
      where: { id: puzzleId },
      relations: ['category', 'tags', 'difficulty'],
    });
    
    if (!puzzle) {
      throw new Error('Puzzle not found');
    }
    
    const translation = await this.puzzleTranslationRepository.findOne({
      where: { puzzleId, languageCode, isApproved: true },
    });
    
    return {
      ...puzzle,
      translatedTitle: translation?.title || puzzle.title,
      translatedContent: translation?.content || puzzle.content,
      hasTranslation: !!translation,
    };
  }
}
