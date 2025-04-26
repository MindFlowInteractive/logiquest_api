import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Param, 
  Body, 
  Query, 
  UseInterceptors, 
  Res,
  NotFoundException,
  HttpStatus
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Response } from 'express';
import { NFTMetadataService } from './nft-metadata.service';
import { MetadataQueryDto } from './dto/metadata-query.dto';
import { PreviewService } from './preview.service';
import { CreateMetadataDto } from './dto/create-nft-metadatum.dto';


@Controller('metadata')
export class NFTMetadataController {
  constructor(
    private readonly metadataService: NFTMetadataService,
    private readonly previewService: PreviewService,
  ) {}

  @Post()
  async createMetadata(@Body() createMetadataDto: CreateMetadataDto) {
    return this.metadataService.createMetadata(createMetadataDto);
  }

  @Put(':tokenId')
  async updateMetadata(
    @Param('tokenId') tokenId: string,
    @Body() updateMetadataDto: CreateMetadataDto,
  ) {
    return this.metadataService.updateMetadata(tokenId, updateMetadataDto);
  }

  @Get(':tokenId')
  @UseInterceptors(CacheInterceptor)
  async getMetadata(
    @Param('tokenId') tokenId: string,
    @Query() query: MetadataQueryDto,
    @Res() res: Response,
  ) {
    try {
      const metadata = await this.metadataService.getMetadata(tokenId, query.version);
      
      if (query.format === 'preview') {
        const previewImage = await this.previewService.generatePreviewImage(metadata);
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': previewImage.length,
        });
        return res.end(previewImage);
      }
      
      return res.json(metadata);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      }
      throw error;
    }
  }

  @Get(':tokenId/versions')
  async getVersionHistory(@Param('tokenId') tokenId: string) {
    return { versions: await this.metadataService.getVersionHistory(tokenId) };
  }

  @Get('achievement/:achievementId')
  async getMetadataByAchievementId(@Param('achievementId') achievementId: string) {
    return this.metadataService.getMetadataByAchievementId(achievementId);
  }

  @Get()
  async getAllMetadata(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.metadataService.getAllMetadata(page, limit);
  }
}