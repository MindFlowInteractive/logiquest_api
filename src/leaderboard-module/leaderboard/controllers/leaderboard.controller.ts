// src/leaderboard/controllers/leaderboard.controller.ts
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
    Req,
    HttpCode,
    HttpStatus,
    ValidationPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
  import { LeaderboardService } from '../services/leaderboard.service';
  import { CreateLeaderboardDto } from '../dtos/create-leaderboard.dto';
  import { UpdateLeaderboardDto } from '../dtos/update-leaderboard.dto';
  import { SubmitScoreDto } from '../dtos/submit-score.dto';
  import { QueryLeaderboardDto } from '../dtos/query-leaderboard.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  import { Request } from 'express';
  
  @ApiTags('leaderboards')
  @Controller('leaderboards')
  export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) {}
  
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new leaderboard' })
    @ApiResponse({ status: 201, description: 'Leaderboard created successfully' })
    @ApiBearerAuth()
    async createLeaderboard(@Body() createLeaderboardDto: CreateLeaderboardDto) {
      return this.leaderboardService.createLeaderboard(createLeaderboardDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all leaderboards with pagination and filters' })
    @ApiResponse({ status: 200, description: 'Returns paginated leaderboards' })
    async findAllLeaderboards(@Query() query: QueryLeaderboardDto) {
      return this.leaderboardService.findAllLeaderboards(query);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a specific leaderboard by ID' })
    @ApiResponse({ status: 200, description: 'Returns the leaderboard' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async findLeaderboard(@Param('id') id: string) {
      return this.leaderboardService.findLeaderboardById(id);
    }
  
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update a specific leaderboard' })
    @ApiResponse({ status: 200, description: 'Leaderboard updated successfully' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async updateLeaderboard(
      @Param('id') id: string,
      @Body() updateLeaderboardDto: UpdateLeaderboardDto,
    ) {
      return this.leaderboardService.updateLeaderboard(id, updateLeaderboardDto);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Soft delete a leaderboard' })
    @ApiResponse({ status: 204, description: 'Leaderboard deleted successfully' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteLeaderboard(@Param('id') id: string) {
      await this.leaderboardService.deleteLeaderboard(id);
    }
  
    @Delete(':id/hard')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Hard delete a leaderboard (admin only)' })
    @ApiResponse({ status: 204, description: 'Leaderboard permanently deleted' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async hardDeleteLeaderboard(@Param('id') id: string) {
      await this.leaderboardService.hardDeleteLeaderboard(id);
    }
  
    @Get(':id/rankings')
    @ApiOperation({ summary: 'Get paginated rankings for a leaderboard' })
    @ApiResponse({ status: 200, description: 'Returns paginated rankings' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async getLeaderboardRankings(
      @Param('id') id: string,
      @Query() query: QueryLeaderboardDto,
    ) {
      return this.leaderboardService.getLeaderboardRankings(id, query);
    }
  
    @Get(':id/rankings/top')
    @ApiOperation({ summary: 'Get top rankings for a leaderboard' })
    @ApiResponse({ status: 200, description: 'Returns top rankings' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top rankings to retrieve' })
    async getTopRankings(
      @Param('id') id: string,
      @Query('limit') limit: number = 10,
    ) {
      return this.leaderboardService.getTopRankings(id, limit);
    }
  
    @Get(':id/rankings/around-me')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get rankings around current user' })
    @ApiResponse({ status: 200, description: 'Returns rankings around user' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @ApiQuery({ name: 'range', required: false, type: Number, description: 'Number of entries above and below user' })
    async getRankingsAroundMe(
      @Param('id') id: string,
      @Query('range') range: number = 5,
      @Req() req: Request,
    ) {
      const userId = req.user['id'];
      return this.leaderboardService.getRankingsAroundUser(id, userId, range);
    }
  
    @Post(':id/scores')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Submit a new score to a leaderboard' })
    @ApiResponse({ status: 201, description: 'Score submitted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid score submission' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async submitScore(
      @Param('id') id: string,
      @Body() submitScoreDto: SubmitScoreDto,
      @Req() req: Request,
    ) {
      const userId = req.user['id'];
      const username = req.user['username'];
      return this.leaderboardService.submitScore(id, userId, username, submitScoreDto);
    }
  
    @Get(':id/history')
    @ApiOperation({ summary: 'Get historical data for a leaderboard' })
    @ApiResponse({ status: 200, description: 'Returns historical snapshots' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @ApiQuery({ name: 'type', required: false, enum: ['daily', 'weekly', 'monthly', 'manual'], description: 'Snapshot type' })
    async getLeaderboardHistory(
      @Param('id') id: string,
      @Query('type') type?: 'daily' | 'weekly' | 'monthly' | 'manual',
    ) {
      return this.leaderboardService.getLeaderboardHistory(id, type);
    }
  
    @Get('users/:userId/rankings')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get all rankings for a specific user' })
    @ApiResponse({ status: 200, description: 'Returns user rankings' })
    @ApiBearerAuth()
    @ApiParam({ name: 'userId', description: 'User ID' })
    async getUserRankings(@Param('userId') userId: string, @Req() req: Request) {
      // Check if user is requesting their own rankings or is an admin
      if (userId !== req.user['id'] && !req.user['roles'].includes('admin')) {
        userId = req.user['id']; // Force to use own ID if not admin
      }
      
      return this.leaderboardService.getUserRankings(userId);
    }
  
    @Post(':id/recalculate')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Trigger leaderboard recalculation' })
    @ApiResponse({ status: 204, description: 'Leaderboard recalculated successfully' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async recalculateLeaderboard(@Param('id') id: string) {
      await this.leaderboardService.recalculateLeaderboard(id);
    }
  
    @Get(':id/statistics')
    @ApiOperation({ summary: 'Get statistics about a leaderboard' })
    @ApiResponse({ status: 200, description: 'Returns leaderboard statistics' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async getLeaderboardStatistics(@Param('id') id: string) {
      return this.leaderboardService.getLeaderboardStatistics(id);
    }
  
    @Post(':id/reset')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Reset a leaderboard' })
    @ApiResponse({ status: 204, description: 'Leaderboard reset successfully' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async resetLeaderboard(@Param('id') id: string) {
      await this.leaderboardService.resetLeaderboard(id);
    }
  
    @Post(':id/snapshot')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create a manual snapshot of the leaderboard' })
    @ApiResponse({ status: 201, description: 'Snapshot created successfully' })
    @ApiResponse({ status: 404, description: 'Leaderboard not found' })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Leaderboard ID' })
    async createSnapshot(@Param('id') id: string) {
      return this.leaderboardService.createLeaderboardSnapshot(id, 'manual');
    }
  }
  
  