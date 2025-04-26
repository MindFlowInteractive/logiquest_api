import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { NFTMetadata } from './entities/nft-metadatum.entity';
import { IPFSService } from './ipfs.service';
import { NFTMetadata as NFTMetadataInterface } from './interfaces/nft-metadata.interface'; 
import { CreateMetadataDto } from './dto/create-nft-metadatum.dto';

@Injectable()
export class NFTMetadataService {
  private readonly logger = new Logger(NFTMetadataService.name);

  constructor(
    @InjectRepository(NFTMetadata)
    private readonly metadataRepository: Repository<NFTMetadata>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly ipfsService: IPFSService,
  ) {}

  private getCacheKey(tokenId: string, version?: number): string {
    return `metadata_${tokenId}_${version || 'latest'}`;
  }

  async createMetadata(createMetadataDto: CreateMetadataDto): Promise<NFTMetadata> {
    try {
      const tokenId = uuidv4();

      const metadataObj: NFTMetadataInterface = {
        name: createMetadataDto.name,
        description: createMetadataDto.description,
        image: createMetadataDto.imageUrl,
        external_url: createMetadataDto.externalUrl,
        attributes: createMetadataDto.attributes || [],
        background_color: createMetadataDto.backgroundColor?.replace('#', ''),
        animation_url: createMetadataDto.animationUrl,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const ipfsHash = await this.ipfsService.uploadJSON(metadataObj);

      const metadata = this.metadataRepository.create({
        tokenId,
        achievementId: createMetadataDto.achievementId,
        name: createMetadataDto.name,
        description: createMetadataDto.description,
        image: createMetadataDto.imageUrl,
        externalUrl: createMetadataDto.externalUrl,
        backgroundColor: createMetadataDto.backgroundColor,
        animationUrl: createMetadataDto.animationUrl,
        attributes: createMetadataDto.attributes || [],
        ipfsHash,
        versionHistory: [{
          version: 1,
          metadata: metadataObj,
          timestamp: new Date(),
        }],
        currentVersion: 1,
      });

      const savedMetadata = await this.metadataRepository.save(metadata);

      await this.cacheManager.set(this.getCacheKey(tokenId), metadataObj, 3600);

      return savedMetadata;
    } catch (error) {
      this.logger.error(`Failed to create metadata: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateMetadata(tokenId: string, updateDto: CreateMetadataDto): Promise<NFTMetadata> {
    try {
      const metadata = await this.metadataRepository.findOne({ where: { tokenId } });

      if (!metadata) {
        throw new NotFoundException(`Metadata with token ID ${tokenId} not found`);
      }

      const newVersion = metadata.currentVersion + 1;

      metadata.name = updateDto.name;
      metadata.description = updateDto.description;
      metadata.image = updateDto.imageUrl || metadata.image;
      metadata.externalUrl = updateDto.externalUrl;
      metadata.backgroundColor = updateDto.backgroundColor;
      metadata.animationUrl = updateDto.animationUrl;
      metadata.attributes = updateDto.attributes || metadata.attributes;
      metadata.currentVersion = newVersion;
      metadata.updatedAt = new Date();

      const metadataObj: NFTMetadataInterface = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        external_url: metadata.externalUrl,
        attributes: metadata.attributes,
        background_color: metadata.backgroundColor?.replace('#', ''),
        animation_url: metadata.animationUrl,
        version: newVersion,
        created_at: metadata.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      const ipfsHash = await this.ipfsService.uploadJSON(metadataObj);
      metadata.ipfsHash = ipfsHash;

      metadata.versionHistory.push({
        version: newVersion,
        metadata: metadataObj,
        timestamp: new Date(),
      });

      const updatedMetadata = await this.metadataRepository.save(metadata);

      await this.cacheManager.set(this.getCacheKey(tokenId), metadataObj, 3600);
      await this.cacheManager.set(this.getCacheKey(tokenId, newVersion), metadataObj, 3600);

      return updatedMetadata;
    } catch (error) {
      this.logger.error(`Failed to update metadata: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMetadata(tokenId: string, version?: number): Promise<NFTMetadataInterface> {
    try {
      const cacheKey = this.getCacheKey(tokenId, version);
      const cachedMetadata = await this.cacheManager.get<NFTMetadataInterface>(cacheKey);

      if (cachedMetadata) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cachedMetadata;
      }

      const metadata = await this.metadataRepository.findOne({ where: { tokenId } });

      if (!metadata) {
        throw new NotFoundException(`Metadata with token ID ${tokenId} not found`);
      }

      let result: NFTMetadataInterface;

      if (version) {
        const versionEntry = metadata.versionHistory.find(v => v.version === version);
        if (!versionEntry) {
          throw new NotFoundException(`Version ${version} not found for token ID ${tokenId}`);
        }
        result = versionEntry.metadata;
      } else {
        const latestVersion = metadata.versionHistory.find(v => v.version === metadata.currentVersion);
        result = latestVersion.metadata;
      }

      await this.cacheManager.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      this.logger.error(`Failed to get metadata: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMetadataByAchievementId(achievementId: string): Promise<NFTMetadata[]> {
    return this.metadataRepository.find({ where: { achievementId } });
  }

  async getVersionHistory(tokenId: string): Promise<number[]> {
    const metadata = await this.metadataRepository.findOne({ where: { tokenId } });

    if (!metadata) {
      throw new NotFoundException(`Metadata with token ID ${tokenId} not found`);
    }

    return metadata.versionHistory.map(version => version.version);
  }

  async getAllMetadata(page = 1, limit = 10): Promise<{ data: NFTMetadata[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.metadataRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      lastPage,
    };
  }
}
