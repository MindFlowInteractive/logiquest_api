import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { NFTAttribute } from '../interfaces/nft-attribute.interface';

export class NFTAttributeDto implements NFTAttribute {
  @IsNotEmpty()
  @IsString()
  trait_type: string;

  @IsNotEmpty()
  @ValidateIf((o) => typeof o.value === 'string')
  @IsString()
  value: string | number;

  @IsOptional()
  @IsString()
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}
