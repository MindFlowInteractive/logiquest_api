import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateWalletDto {
    @IsString()
    walletAddress: string;
  
    @IsOptional()
    @IsString()
    walletType?: string;
  
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
  }