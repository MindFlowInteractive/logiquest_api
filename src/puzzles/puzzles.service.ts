import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Puzzle } from './entities/puzzle.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { GetPuzzlesFilterDto } from './dto/get-puzzles-filter.dto';

@Injectable()
export class PuzzlesService {
  constructor(
    @InjectRepository(Puzzle)
    private readonly puzzleRepository: Repository<Puzzle>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreatePuzzleDto, authorId: string): Promise<Puzzle> {
    let category: Category | null = null;

    if (dto.categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
      }
    }

    const puzzle = this.puzzleRepository.create({
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      conditions: dto.conditions,
      effects: dto.effects,
      category,
      authorId,
    });

    return this.puzzleRepository.save(puzzle);
  }

  async submitDraft(dto: CreatePuzzleDto, authorId: string): Promise<Puzzle> {
    let category: Category | null = null;
    if (dto.categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
      }
    }

    const puzzle = this.puzzleRepository.create({
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      conditions: dto.conditions,
      effects: dto.effects,
      category,
      authorId,
      submissionStatus: 'pending' as any,
    });

    return this.puzzleRepository.save(puzzle);
  }

  async findMySubmissions(authorId: string): Promise<Puzzle[]> {
    return this.puzzleRepository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
      relations: { category: true },
    });
  }


  async findAll(filter: GetPuzzlesFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const queryBuilder = this.puzzleRepository
      .createQueryBuilder('puzzle')
      .leftJoinAndSelect('puzzle.category', 'category');

    if (filter.difficulty) {
      queryBuilder.andWhere('puzzle.difficulty = :difficulty', { difficulty: filter.difficulty });
    }

    if (filter.category) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.category);
      if (isUuid) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId: filter.category });
      } else {
        queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: filter.category });
      }
    }

    queryBuilder
      .orderBy('puzzle.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Puzzle> {
    const puzzle = await this.puzzleRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID "${id}" not found`);
    }

    return puzzle;
  }

  async update(id: string, dto: UpdatePuzzleDto): Promise<Puzzle> {
    const puzzle = await this.puzzleRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID "${id}" not found`);
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        puzzle.category = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
        if (!category) {
          throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
        }
        puzzle.category = category;
      }
    }

    if (dto.title !== undefined) puzzle.title = dto.title;
    if (dto.description !== undefined) puzzle.description = dto.description;
    if (dto.difficulty !== undefined) puzzle.difficulty = dto.difficulty;
    if (dto.conditions !== undefined) puzzle.conditions = dto.conditions;
    if (dto.effects !== undefined) puzzle.effects = dto.effects;

    return this.puzzleRepository.save(puzzle);
  }

  async remove(id: string): Promise<void> {
    const puzzle = await this.puzzleRepository.findOne({ where: { id } });
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID "${id}" not found`);
    }
    await this.puzzleRepository.remove(puzzle);
  }
}
