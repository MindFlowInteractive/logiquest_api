import { Test, TestingModule } from '@nestjs/testing';
import { NftMetadataService } from './nft-metadata.service';

describe('NftMetadataService', () => {
  let service: NftMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftMetadataService],
    }).compile();

    service = module.get<NftMetadataService>(NftMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
