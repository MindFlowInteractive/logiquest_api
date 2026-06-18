import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTRecord } from './entities/nft-record.entity';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { MockBlockchainProvider } from './providers/mock-blockchain.provider';

@Module({
  imports: [TypeOrmModule.forFeature([NFTRecord])],
  controllers: [NftController],
  providers: [
    NftService,
    {
      provide: 'BlockchainProvider',
      useClass: MockBlockchainProvider,
    },
  ],
  exports: [NftService],
})
export class NftModule {}
