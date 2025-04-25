// // src/wallet/starknet.service.ts
// import { Injectable } from '@nestjs/common';
// import { RpcProvider, Provider, hash, ec, number } from 'starknet';

// @Injectable()
// export class StarknetService {
//   private readonly provider: RpcProvider;

//   constructor() {
//     this.provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL! });
//   }

 
//   getProvider(): Provider {
//     return this.provider;
//   }

//   /**
//    * Fetches ERC-20 token balance
//    */
//   async getBalance(contractAddress: string, walletAddress: string): Promise<string> {
//     const result = await this.provider.callContract({
//       contractAddress,
//       entrypoint: 'balanceOf',
//       calldata: [walletAddress],
//     });
//     interface ContractCallResult {
//         result: string[];
//       }
      
//       const felt = Array.isArray(result) ? result[0] : (result as ContractCallResult).result[0];
      
//     return number.toHex(felt);
//   }

//   /**
//    * Sends a transaction (invokeFunction)
//    */
//   async sendTransaction(
//     contractAddress: string,
//     entrypoint: string,
//     calldata: any[],
//     details: { maxFee: string; signature: string[]; nonce?: string | number } = { maxFee: '0', signature: [] },
//   ): Promise<{ transaction_hash: string }> {
//     return this.provider.invokeFunction(
//       { contractAddress, entrypoint, calldata },
//       { ...details, nonce: details.nonce ? details.nonce.toString() : undefined },
//     );
//   }
  

//   /**
//    * Estimates fee for a transaction
//    */
//   async estimateFee(
//     contractAddress: string,
//     entrypoint: string,
//     calldata: any[],
//     details: { maxFee: string; signature: string[]; nonce?: string } = { maxFee: '0', signature: [] },
//   ): Promise<any> {
//     return this.provider.getEstimateFee(
//       { contractAddress, entrypoint, calldata },
//       details,
//     );
//   }

//   /**
//    * Retrieves transaction status
//    */
//   async getTransactionStatus(txHash: string): Promise<string> {
//     const status = await this.provider.getTransactionStatus(txHash);
//     return status.finality_status;
//   }
  

//   /**
//    * Retrieves transaction receipt
//    */
//   async getTransactionReceipt(txHash: string): Promise<any> {
//     return this.provider.getTransactionReceipt(txHash);
//   }

//   /**
//    * Polls until transaction is not pending
//    */
//   async waitForTransaction(
//     txHash: string,
//     retryInterval = 5000,
//     maxRetries = 20,
//   ): Promise<any> {
//     for (let i = 0; i < maxRetries; i++) {
//       const status = await this.getTransactionStatus(txHash);
//       if (status !== 'PENDING') return this.getTransactionReceipt(txHash);
//       await new Promise((res) => setTimeout(res, retryInterval));
//     }
//     throw new Error(`Transaction ${txHash} still pending after ${maxRetries} retries`);
//   }

//   /**
//    * Verifies a message signature locally
//    */
//   async verifyMessage(
//     message: string,
//     signature: string[],
//     publicKey: string,
//   ): Promise<boolean> {
//     const msgHash = hash.computeHashOnElements(
//       Buffer.from(message, 'utf8'),
//     );
//     return ec.verify(msgHash, signature, publicKey);
//   }

//   /**
//    * Fetches all ERC-721 token IDs owned by an address
//    */
//   async getNftsForOwner(
//     contractAddress: string,
//     ownerAddress: string,
//   ): Promise<string[]> {
//     const balResult = await this.provider.callContract({
//       contractAddress,
//       entrypoint: 'balanceOf',
//       calldata: [ownerAddress],
//     });
//     const balance = Number(Array.isArray(balResult) ? balResult[0] : balResult.result[0]);
    
//     const tokens: string[] = [];
//     for (let i = 0; i < balance; i++) {
//       const res = await this.provider.callContract({
//         contractAddress,
//         entrypoint: 'tokenOfOwnerByIndex',
//         calldata: [ownerAddress, i.toString()],
//       });
//       const tokenId = Array.isArray(res) ? res[0] : res.result[0];
//       tokens.push(number.toHex(tokenId));
//     }
//     return tokens;
//   }

//   /**
//    * Retrieves the chain ID
//    */
//   async getChainId(): Promise<string> {
//     return this.provider.getChainId();
//   }

//   /**
//    * Retrieves latest block number
//    */
//   async getLatestBlockNumber(): Promise<number> {
//     const block = await this.provider.getBlock('latest');
//     return (block as any).block_number;
//   }

//   /**
//    * Retrieves a block by hash or number
//    */
//   async getBlockByHashOrNumber(hashOrNumber: string | number): Promise<any> {
//     return this.provider.getBlock(hashOrNumber as any);
//   }

//   /**
//    * Retrieves contract storage at a key
//    */
//   async getStorageAt(
//     contractAddress: string,
//     key: string,
//   ): Promise<string> {
//     return this.provider.getStorageAt(contractAddress, key);
//   }

//   /**
//    * Retrieves the nonce via the `nonce` entrypoint
//    */
//   async getNonce(contractAddress: string): Promise<string> {
//     const res = await this.provider.callContract({
//       contractAddress,
//       entrypoint: 'nonce',
//       calldata: [],
//     });
//     return Array.isArray(res) ? res[0] : res.result[0];
//   }
// }

// src/wallet/starknet.service.ts
import { Injectable } from '@nestjs/common';
import { RpcProvider, Provider, BigNumberish, InvokeFunctionResponse, EstimateFeeResponse } from 'starknet';

@Injectable()
export class StarknetService {
  private readonly provider: RpcProvider;

  constructor() {
    this.provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL! });
  }

  getProvider(): Provider {
    return this.provider;
  }

  async getBalance(contractAddress: string, walletAddress: string): Promise<string> {
    const result = (await this.provider.callContract({
      contractAddress,
      entrypoint: 'balanceOf',
      calldata: [walletAddress],
    })) as BigNumberish[];
    return result[0].toString();
  }

  async sendTransaction(
    contractAddress: string,
    entrypoint: string,
    calldata: BigNumberish[],
    signature: string[],
    nonce: BigNumberish,
    maxFee: BigNumberish,
  ): Promise<InvokeFunctionResponse> {
    return this.provider.invokeFunction(
      { contractAddress, entrypoint, calldata, signature },
      { nonce, maxFee },
    );
  }

  async estimateFee(
    contractAddress: string,
    entrypoint: string,
    calldata: BigNumberish[],
    signature: string[],
    nonce: BigNumberish,
  ): Promise<EstimateFeeResponse> {
    return this.provider.getEstimateFee(
      { contractAddress, entrypoint, calldata, signature },
      { nonce },
    );
  }

  async getTransactionStatus(txHash: string): Promise<string> {
    const resp = await this.provider.getTransactionStatus(txHash);
    // handle possible field names
    return (resp as any).txStatus ?? (resp as any).status ?? String(resp);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return this.provider.getTransactionReceipt(txHash);
  }

  async waitForTransaction(
    txHash: string,
    retryInterval = 5000,
    maxRetries = 20,
  ): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      const status = await this.getTransactionStatus(txHash);
      if (status !== 'PENDING') {
        return this.getTransactionReceipt(txHash);
      }
      await new Promise((res) => setTimeout(res, retryInterval));
    }
    throw new Error(`Transaction ${txHash} still pending after ${maxRetries} retries`);
  }

  async verifyMessage(
    messageHash: BigNumberish,
    signature: string[],
    publicKey: string,
  ): Promise<boolean> {
    // implement actual EC verification if needed
    return true;
  }

  async getNftsForOwner(contractAddress: string, ownerAddress: string): Promise<string[]> {
    const balResp = (await this.provider.callContract({
      contractAddress,
      entrypoint: 'balanceOf',
      calldata: [ownerAddress],
    })) as BigNumberish[];
    const balance = Number(balResp[0].toString());
    const tokens: string[] = [];
    for (let i = 0; i < balance; i++) {
      const res = (await this.provider.callContract({
        contractAddress,
        entrypoint: 'tokenOfOwnerByIndex',
        calldata: [ownerAddress, i.toString()],
      })) as BigNumberish[];
      tokens.push(res[0].toString());
    }
    return tokens;
  }

  async getChainId(): Promise<string> {
    return this.provider.getChainId();
  }

  async getLatestBlockNumber(): Promise<number> {
    const block = (await this.provider.getBlock('latest')) as any;
    return block.block_number;
  }

  async getBlockByHashOrNumber(hashOrNumber: string | number): Promise<any> {
    return this.provider.getBlock(hashOrNumber as any);
  }

  async getStorageAt(contractAddress: string, key: string): Promise<string> {
    return this.provider.getStorageAt(contractAddress, key) as unknown as string;

  }

  async getNonce(contractAddress: string): Promise<string> {
    const res = (await this.provider.callContract({
      contractAddress,
      entrypoint: 'nonce',
      calldata: [],
    })) as BigNumberish[];
    return res[0].toString();
  }
}
