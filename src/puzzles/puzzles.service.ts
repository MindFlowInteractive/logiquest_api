import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Puzzle } from './entities/puzzle.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { GetPuzzlesFilterDto } from './dto/get-puzzles-filter.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PuzzlesService {
  constructor(
    @InjectRepository(Puzzle)
    private readonly puzzleRepository: Repository<Puzzle>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
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
      .leftJoinAndSelect('puzzle.category', 'category')
      .leftJoinAndSelect('puzzle.tags', 'tags');

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

    if (filter.tags) {
      const tagSlugs = filter.tags
        .split(',')
        .map((slug) => slug.trim())
        .filter(Boolean);

      if (tagSlugs.length > 0) {
        queryBuilder.innerJoin('puzzle.tags', 'filterTags', 'filterTags.slug IN (:...tagSlugs)', { tagSlugs });
      }
    }

    if (filter.search) {
      queryBuilder
        .leftJoin('puzzle.tags', 'searchTags')
        .andWhere('(puzzle.title ILIKE :search OR puzzle.description ILIKE :search OR searchTags.name ILIKE :search)', {
          search: `%${filter.search.trim()}%`,
        });
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
      relations: { category: true, tags: true },
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

  async setTags(id: string, tagIds: string[], userId: string, userRole: Role): Promise<Puzzle> {
    const puzzle = await this.puzzleRepository.findOne({
      where: { id },
      relations: { category: true, tags: true },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID "${id}" not found`);
    }

    if (userRole !== Role.ADMIN && puzzle.authorId !== userId) {
      throw new ForbiddenException('Only the puzzle author or an admin can update tags');
    }

    const uniqueTagIds = [...new Set(tagIds)];
    const tags = uniqueTagIds.length > 0 ? await this.tagRepository.find({ where: { id: In(uniqueTagIds) } }) : [];

    if (tags.length !== uniqueTagIds.length) {
      const foundIds = new Set(tags.map((tag) => tag.id));
      const missingIds = uniqueTagIds.filter((tagId) => !foundIds.has(tagId));
      throw new NotFoundException(`Tag(s) not found: ${missingIds.join(', ')}`);
    }

    puzzle.tags = tags;
    return this.puzzleRepository.save(puzzle);
  }
}
