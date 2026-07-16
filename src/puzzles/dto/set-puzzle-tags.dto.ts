import { IsArray, IsUUID } from 'class-validator';

export class SetPuzzleTagsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds!: string[];
}
