import { IsString } from "class-validator";

// src/wallet/dto/connect-wallet.dto.ts
export class ConnectWalletDto {
    @IsString()
    address: string;

    @IsString()
    network: string;
  }
  

 