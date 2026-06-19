import { Injectable } from '@nestjs/common';
import { BlockchainProvider } from '../interfaces/blockchain-provider.interface';

@Injectable()
export class MockBlockchainProvider implements BlockchainProvider {
  async mintNFT(userId: string, achievementId: string): Promise<{ mintId: string; txHash: string; chain: string }> {
    // Simulate connection or processing failures for tests
    if (achievementId === 'fail_mint') {
      throw new Error('Simulated blockchain transaction failure');
    }
    
    // Generate mock details for a successful mint
    const randomHex = () => Math.random().toString(16).substring(2, 10);
    const mockMintId = `mint-${randomHex()}-${randomHex()}`;
    const mockTxHash = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
    const mockChain = 'sepolia';

    return {
      mintId: mockMintId,
      txHash: mockTxHash,
      chain: mockChain,
    };
  }
}
