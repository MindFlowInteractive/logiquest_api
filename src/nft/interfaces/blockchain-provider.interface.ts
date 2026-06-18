export interface BlockchainProvider {
  mintNFT(userId: string, achievementId: string): Promise<{ mintId: string; txHash: string; chain: string }>;
}
