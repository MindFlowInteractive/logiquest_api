import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: Repository<Notification>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a notification', async () => {
      const dto = {
        userId: 'user-123',
        type: NotificationType.PUZZLE_SOLVED,
        message: 'Puzzle solved successfully!',
      };
      const savedNotif = { ...dto, id: 'uuid-123', isRead: false, createdAt: new Date() };

      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue(savedNotif);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(savedNotif);
    });
  });

  describe('findByUser', () => {
    it('should retrieve notifications ordered by isRead first and createdAt descending', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        { id: '1', userId, isRead: false, createdAt: new Date() },
        { id: '2', userId, isRead: true, createdAt: new Date() },
      ];

      mockRepo.find.mockResolvedValue(mockNotifications);

      const result = await service.findByUser(userId);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId },
        order: { isRead: 'ASC', createdAt: 'DESC' },
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark a single notification as read', async () => {
      const id = 'notif-123';
      const userId = 'user-123';

      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.markAsRead(id, userId);

      expect(mockRepo.update).toHaveBeenCalledWith({ id, userId }, { isRead: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications for a user as read', async () => {
      const userId = 'user-123';

      mockRepo.update.mockResolvedValue({ affected: 5 });

      await service.markAllAsRead(userId);

      expect(mockRepo.update).toHaveBeenCalledWith({ userId }, { isRead: true });
    });
  });

  describe('cleanupOld', () => {
    it('should soft-delete notifications older than 30 days', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: 3 });

      await service.cleanupOld();

      expect(mockRepo.softDelete).toHaveBeenCalledWith({
        createdAt: LessThan(expect.any(Date)),
      });
    });
  });
});
