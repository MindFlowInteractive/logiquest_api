import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateWalletDto {
    @IsOptional()
    @IsString()
    displayName?: string;
  
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }