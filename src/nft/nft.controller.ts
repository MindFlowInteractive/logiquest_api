import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NftService } from './nft.service';
import { MintNftDto } from './dto/mint-nft.dto';

@Controller('nft')
@UseGuards(JwtAuthGuard)
export class NftController {
  constructor(private readonly nftService: NftService) {}

  /** Trigger NFT minting for the authenticated user */
  @Post('mint')
  async mint(@Req() req: any, @Body() dto: MintNftDto) {
    const userId = req.user.id;
    return this.nftService.mintNFT(userId, dto.achievementId);
  }

  /** Get all NFTs minted for the authenticated user */
  @Get('me')
  async getMyNFTs(@Req() req: any) {
    const userId = req.user.id;
    return this.nftService.getUserNFTs(userId);
  }
}
