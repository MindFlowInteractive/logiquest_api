import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Puzzle } from '../puzzles/entities/puzzle.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Puzzle)
    private readonly puzzleRepository: Repository<Puzzle>,
  ) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = this.slugify(dto.name);
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug,
    });
    return this.categoryRepository.save(category);
  }

  async findAllWithPuzzleCount(): Promise<any[]> {
    const categories = await this.categoryRepository.find({
      relations: { puzzles: true },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      createdAt: c.createdAt,
      puzzleCount: c.puzzles ? c.puzzles.length : 0,
    }));
  }

  async findPuzzlesBySlug(slug: string, page = 1, limit = 20) {
    const category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    const [data, total] = await this.puzzleRepository.findAndCount({
      where: { category: { id: category.id } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (dto.name) {
      const slug = this.slugify(dto.name);
      const existing = await this.categoryRepository.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category with slug "${slug}" already exists`);
      }
      category.slug = slug;
      category.name = dto.name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    await this.categoryRepository.remove(category);
  }
}
