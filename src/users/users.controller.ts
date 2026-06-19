import { Controller, Get, Param, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserDto> {
    const user = await this.service.findOne(id);
    const { passwordHash, ...rest } = user as any;
    return rest as any;
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req): Promise<UserDto> {
    const updated = await this.service.update(id, dto, req.user.id, req.user.role);
    const { passwordHash, ...rest } = updated as any;
    return rest as any;
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteUser(@Param('id') id: string, @Request() req): Promise<void> {
    await this.service.remove(id, req.user.role);
  }
}
