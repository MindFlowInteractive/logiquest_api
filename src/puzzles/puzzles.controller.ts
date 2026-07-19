import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { GetPuzzlesFilterDto } from './dto/get-puzzles-filter.dto';
import { SetPuzzleTagsDto } from './dto/set-puzzle-tags.dto';
import { UpsertPuzzleTranslationDto } from './dto/upsert-puzzle-translation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { resolveLocale } from '../config/locale.helper';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createPuzzleDto: CreatePuzzleDto, @Request() req) {
    const authorId = req.user.id;
    return this.puzzlesService.create(createPuzzleDto, authorId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submit(@Body() createPuzzleDto: CreatePuzzleDto, @Request() req) {
    const authorId = req.user.id;
    return this.puzzlesService.submitDraft(createPuzzleDto, authorId);
  }

  @Get('my-submissions')
  @UseGuards(JwtAuthGuard)
  findMySubmissions(@Request() req) {
    const authorId = req.user.id;
    return this.puzzlesService.findMySubmissions(authorId);
  }

  @Get()
  findAll(@Query() query: GetPuzzlesFilterDto) {
    return this.puzzlesService.findAll(query);
  }

  /**
   * GET /puzzles/:id
   * Returns puzzle content localised to the best-matching locale from the
   * Accept-Language header, falling back to English if no match is found.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ) {
    const locale = resolveLocale(acceptLanguage);
    return this.puzzlesService.findOneLocalised(id, locale);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    return this.puzzlesService.update(id, updatePuzzleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.puzzlesService.remove(id);
  }

  @Patch(':id/tags')
  @UseGuards(JwtAuthGuard)
  setTags(@Param('id') id: string, @Body() setPuzzleTagsDto: SetPuzzleTagsDto, @Request() req) {
    return this.puzzlesService.setTags(id, setPuzzleTagsDto.tagIds, req.user.id, req.user.role);
  }

  // ── Translation management (admin-only) ──────────────────────────────────

  /**
   * POST /puzzles/:id/translations
   * Upserts a translation for the puzzle. Validates locale against
   * SUPPORTED_LOCALES (400 if unsupported). Admin-only.
   */
  @Post(':id/translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertTranslation(
    @Param('id') puzzleId: string,
    @Body() dto: UpsertPuzzleTranslationDto,
  ) {
    return this.puzzlesService.upsertTranslation(puzzleId, dto);
  }

  /**
   * GET /puzzles/:id/translations
   * Returns all stored translation rows for the puzzle. Admin-only.
   */
  @Get(':id/translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllTranslations(@Param('id') puzzleId: string) {
    return this.puzzlesService.findAllTranslations(puzzleId);
  }
}
