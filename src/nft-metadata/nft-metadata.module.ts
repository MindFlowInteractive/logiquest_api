import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTMetadataService } from './nft-metadata.service';
import { NFTMetadataController } from './nft-metadata.controller';
import { IPFSService } from './ipfs.service';
import { PreviewService } from './preview.service';
import ipfsConfig from './config/ipfs.config';
import { NFTMetadata } from './entities/nft-metadatum.entity';

@Module({
  imports: [
    ConfigModule.forFeature(ipfsConfig),
    CacheModule.register({
      ttl: 3600,
      max: 100,  
    }),
    TypeOrmModule.forFeature([NFTMetadata]),
  ],
  controllers: [NFTMetadataController],
  providers: [NFTMetadataService, IPFSService, PreviewService],
  exports: [NFTMetadataService],
})
export class NFTMetadataModule {}
