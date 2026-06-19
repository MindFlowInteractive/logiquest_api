import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { Puzzle } from '../puzzles/entities/puzzle.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((cat) => Promise.resolve({ id: 'cat-uuid', ...cat, createdAt: new Date() })),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockPuzzleRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Puzzle),
          useValue: mockPuzzleRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate a slug and save the category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      const dto = { name: 'Mind Games & Logic', description: 'Logic puzzles for testing' };
      const result = await service.create(dto);

      expect(result.id).toBe('cat-uuid');
      expect(result.name).toBe(dto.name);
      expect(result.slug).toBe('mind-games-logic');
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'mind-games-logic' } });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        slug: 'mind-games-logic',
      });
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({ id: 'existing-id', slug: 'logic' });

      const dto = { name: 'Logic', description: 'Another logic' };
      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('slug generation helper', () => {
    it('should sanitize special characters and replace spaces', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      const dto = { name: '  Test! @#$ Category-Name 123  ', description: 'Sanitization test' };
      const result = await service.create(dto);

      expect(result.slug).toBe('test-category-name-123');
    });
  });

  describe('findAllWithPuzzleCount', () => {
    it('should return categories with puzzle counts', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Logic',
          slug: 'logic',
          description: 'Logic puzzles',
          createdAt: new Date(),
          puzzles: [{ id: 'p1' }, { id: 'p2' }],
        },
        {
          id: 'cat-2',
          name: 'Math',
          slug: 'math',
          description: 'Math puzzles',
          createdAt: new Date(),
          puzzles: [],
        },
      ];
      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAllWithPuzzleCount();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'cat-1',
        name: 'Logic',
        slug: 'logic',
        description: 'Logic puzzles',
        createdAt: mockCategories[0].createdAt,
        puzzleCount: 2,
      });
      expect(result[1].puzzleCount).toBe(0);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({ relations: { puzzles: true } });
    });
  });

  describe('findPuzzlesBySlug', () => {
    it('should return paginated puzzles for a valid slug', async () => {
      const category = { id: 'cat-1', slug: 'logic' };
      const puzzles = [{ id: 'p1', title: 'Puzzle 1' }];
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockPuzzleRepository.findAndCount.mockResolvedValue([puzzles, 1]);

      const result = await service.findPuzzlesBySlug('logic', 1, 10);

      expect(result).toEqual({
        data: puzzles,
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'logic' } });
      expect(mockPuzzleRepository.findAndCount).toHaveBeenCalledWith({
        where: { category: { id: 'cat-1' } },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if category slug does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findPuzzlesBySlug('missing', 1, 10)).rejects.toThrow(NotFoundException);
      expect(mockPuzzleRepository.findAndCount).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update name, regenerate slug, and check slug uniqueness', async () => {
      const category = { id: 'cat-1', name: 'Old', slug: 'old', description: 'Old desc' };
      mockCategoryRepository.findOne
        .mockResolvedValueOnce(category) // find category to update
        .mockResolvedValueOnce(null); // find unique slug check

      const result = await service.update('cat-1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.slug).toBe('new-name');
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    });

    it('should throw ConflictException on update if slug conflicts with another category', async () => {
      const category = { id: 'cat-1', name: 'Old', slug: 'old' };
      const otherCategory = { id: 'cat-2', name: 'New Name', slug: 'new-name' };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(category) // find category to update
        .mockResolvedValueOnce(otherCategory); // find unique slug check - conflicts!

      await expect(service.update('cat-1', { name: 'New Name' })).rejects.toThrow(ConflictException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the category if it exists', async () => {
      const category = { id: 'cat-1' };
      mockCategoryRepository.findOne.mockResolvedValue(category);

      await service.remove('cat-1');

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw NotFoundException if category to remove does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });
  });
});
