// wallet.service.ts
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletConnection } from './entities/wallet-connection.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { VerifyWalletDto } from './dto/verify-wallet.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { StarknetService } from './starknet.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletConnection)
    private walletRepo: Repository<WalletConnection>,
    private readonly starknetService: StarknetService,

    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>
  ) {}

  
  async createWallet(user: any, dto: CreateWalletDto) {
    const wallet = this.walletRepo.create({ ...dto, user });
    return this.walletRepo.save(wallet);
  }

  async getUserWallets(userId: string) {
    return this.walletRepo.find({ where: { user: { id: userId } } });
  }

  async getWalletById(id: string) {
    const wallet = await this.walletRepo.findOne({ where: { id } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
  async connect(userId: string, dto: ConnectWalletDto) {
    const existing = await this.walletRepo.findOneBy({ address: dto.address });
    if (existing) throw new ConflictException('Wallet already connected.');
  
    const wallet = this.walletRepo.create({ ...dto, user: { id: userId } });
    return this.walletRepo.save(wallet);
  }
  
  async updateWallet(id: string, dto: UpdateWalletDto) {
    await this.walletRepo.update(id, dto);
    return this.getWalletById(id);
  }

  async deleteWallet(id: string) {
    const wallet = await this.getWalletById(id);
    return this.walletRepo.remove(wallet);
  }

  async verifyOwnership(id: string, dto: VerifyWalletDto) {
    // TODO: Implement signature verification using starknet.js
    return { verified: true, walletId: id };
  }

  async getWalletBalance(id: string) {
    // TODO: Integrate starknet.js balance query
    return { balance: '0.00', currency: 'ETH' };
  }

  async getTransactionsForWallet(id: string) {
    return this.txRepo.find({ where: { wallet: { id } } });
  }

  async submitTransaction(id: string, payload: any) {
    // TODO: Submit transaction via starknet.js
    const tx = this.txRepo.create({ ...payload, wallet: { id } });
    return this.txRepo.save(tx);
  }

  async getNFTsForWallet(id: string) {
    // TODO: Integrate with NFT API / Starknet calls
    return [{ name: 'Sample NFT', tokenId: '1234' }];
  }

  async requestSignature(id: string, message: string) {
    // TODO: Send message to wallet client for signing
    return { message, signature: 'signed-message-placeholder' };
  }

  async getSupportedNetworks() {
    return [
      { name: 'Starknet Mainnet', chainId: 'SN_MAIN' },
      { name: 'Starknet Testnet', chainId: 'SN_GOERLI' }
    ];
  }

  async verifySignature(
    address: string,
    signature: string[], 
    message: string,
  ): Promise<boolean> {
    const isValid = await this.starknetService.verifyMessage(
      message,
      signature,
      address,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
    return true;
  }
}
