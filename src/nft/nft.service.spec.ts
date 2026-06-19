import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NftService } from './nft.service';
import { NFTRecord } from './entities/nft-record.entity';
import { ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('NftService', () => {
  let service: NftService;
  let mockRepository: any;
  let mockBlockchainProvider: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((record) => Promise.resolve({ id: 'uuid-123', ...record, mintedAt: new Date() })),
      find: jest.fn(),
    };

    mockBlockchainProvider = {
      mintNFT: jest.fn().mockResolvedValue({
        mintId: 'mock-mint-id',
        txHash: 'mock-tx-hash',
        chain: 'sepolia',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: getRepositoryToken(NFTRecord),
          useValue: mockRepository,
        },
        {
          provide: 'BlockchainProvider',
          useValue: mockBlockchainProvider,
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mintNFT', () => {
    it('should successfully mint an NFT for a qualifying unlocked achievement', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.mintNFT('user-1', 'first_win');

      expect(result).toBeDefined();
      expect(result.userId).toBe('user-1');
      expect(result.achievementId).toBe('first_win');
      expect(result.mintId).toBe('mock-mint-id');
      expect(result.txHash).toBe('mock-tx-hash');
      expect(mockBlockchainProvider.mintNFT).toHaveBeenCalledWith('user-1', 'first_win');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if achievement is not qualifying', async () => {
      await expect(service.mintNFT('user-1', 'invalid_achievement')).rejects.toThrow(BadRequestException);
      expect(mockBlockchainProvider.mintNFT).not.toHaveBeenCalled();
    });

    it('should enforce idempotency by throwing ConflictException if achievement was already minted', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(service.mintNFT('user-1', 'first_win')).rejects.toThrow(ConflictException);
      expect(mockBlockchainProvider.mintNFT).not.toHaveBeenCalled();
    });

    it('should log error details and throw InternalServerErrorException if blockchain minting fails', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockBlockchainProvider.mintNFT.mockRejectedValue(new Error('Network loss'));

      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      await expect(service.mintNFT('user-1', 'first_win')).rejects.toThrow(InternalServerErrorException);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('getUserNFTs', () => {
    it('should return all NFTs minted for the user', async () => {
      const mockNfts = [{ id: '1', userId: 'user-1', achievementId: 'first_win' }];
      mockRepository.find.mockResolvedValue(mockNfts);

      const result = await service.getUserNFTs('user-1');

      expect(result).toEqual(mockNfts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { mintedAt: 'DESC' },
      });
    });
  });
});
