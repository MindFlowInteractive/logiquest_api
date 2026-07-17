import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { GetPuzzlesFilterDto } from './dto/get-puzzles-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(id);
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
}
