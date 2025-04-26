import { PartialType } from '@nestjs/mapped-types';
import { CreateMetadataDto} from './create-nft-metadatum.dto';

export class UpdateNftMetadatumDto extends PartialType(CreateMetadataDto) {}
