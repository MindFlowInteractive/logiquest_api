import { Test, TestingModule } from '@nestjs/testing';
import { NftMetadataController } from './nft-metadata.controller';
import { NftMetadataService } from './nft-metadata.service';

describe('NftMetadataController', () => {
  let controller: NftMetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftMetadataController],
      providers: [NftMetadataService],
    }).compile();

    controller = module.get<NftMetadataController>(NftMetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
