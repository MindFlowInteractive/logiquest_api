// wallet.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { VerifyWalletDto } from './dto/verify-wallet.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(req.user, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req) {
    return this.walletService.getUserWallets(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.walletService.getWalletById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateWalletDto) {
    return this.walletService.updateWallet(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.walletService.deleteWallet(id);
    return { message: 'Wallet disconnected' };
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  async verifyOwnership(@Param('id') id: string, @Body() dto: VerifyWalletDto) {
    return this.walletService.verifyOwnership(id, dto);
  }

  @Get(':id/balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Param('id') id: string) {
    return this.walletService.getWalletBalance(id);
  }

  @Get(':id/transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Param('id') id: string) {
    return this.walletService.getTransactionsForWallet(id);
  }

  @Post(':id/transactions')
  @UseGuards(JwtAuthGuard)
  async submitTransaction(@Param('id') id: string, @Body() payload: any) {
    return this.walletService.submitTransaction(id, payload);
  }

  @Get(':id/nfts')
  @UseGuards(JwtAuthGuard)
  async getNFTs(@Param('id') id: string) {
    return this.walletService.getNFTsForWallet(id);
  }

  @Post(':id/sign')
  @UseGuards(JwtAuthGuard)
  async signMessage(@Param('id') id: string, @Body() { message }: { message: string }) {
    return this.walletService.requestSignature(id, message);
  }

  @Get('networks')
  @UseGuards(JwtAuthGuard)
  async getSupportedNetworks() {
    return this.walletService.getSupportedNetworks();
  }
}
