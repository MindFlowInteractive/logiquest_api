import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFTRecord } from './entities/nft-record.entity';
import { BlockchainProvider } from './interfaces/blockchain-provider.interface';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  // Statically defined qualifying achievements
  private readonly qualifyingAchievements = new Set(['first_win', 'speed_demon', 'highscore_hero']);

  constructor(
    @InjectRepository(NFTRecord)
    private readonly nftRepo: Repository<NFTRecord>,
    @Inject('BlockchainProvider')
    private readonly blockchainProvider: BlockchainProvider,
  ) {}

  /** Mint an NFT for an unlocked qualifying achievement */
  async mintNFT(userId: string, achievementId: string): Promise<NFTRecord> {
    // 1. Verify achievement qualification
    if (!this.qualifyingAchievements.has(achievementId)) {
      throw new BadRequestException(`Achievement "${achievementId}" is not qualifying for NFT minting.`);
    }

    // 2. Enforce idempotency (user cannot mint the same achievement twice)
    const existingRecord = await this.nftRepo.findOne({
      where: { userId, achievementId },
    });
    if (existingRecord) {
      throw new ConflictException(`Achievement "${achievementId}" has already been minted for this user.`);
    }

    // 3. Trigger blockchain minting
    try {
      const mintResult = await this.blockchainProvider.mintNFT(userId, achievementId);

      // 4. Save and return the record
      const newRecord = this.nftRepo.create({
        mintId: mintResult.mintId,
        userId,
        achievementId,
        txHash: mintResult.txHash,
        chain: mintResult.chain,
      });

      return await this.nftRepo.save(newRecord);
    } catch (error: any) {
      // Failed minting attempts are logged with error details
      this.logger.error(
        `Failed to mint NFT for user "${userId}" and achievement "${achievementId}": ${error.message || error}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `NFT minting failed: ${error.message || 'Unknown blockchain error'}`,
      );
    }
  }

  /** Get all NFTs minted for the user */
  async getUserNFTs(userId: string): Promise<NFTRecord[]> {
    return this.nftRepo.find({
      where: { userId },
      order: { mintedAt: 'DESC' },
    });
  }
}
