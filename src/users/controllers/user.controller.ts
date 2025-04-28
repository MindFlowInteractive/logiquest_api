import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import { UserPreferenceDto } from '../dto/user-preference.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() searchDto: UserSearchDto) {
    return this.userService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/game-profile')
  updateGameProfile(@Param('id') id: string, @Body() gameProfile: any) {
    return this.userService.updateGameProfile(id, gameProfile);
  }

  @Post(':id/preferences')
  setPreference(@Param('id') id: string, @Body() preferenceDto: UserPreferenceDto) {
    return this.userService.setPreference(id, preferenceDto);
  }

  @Get(':id/preferences')
  getPreferences(@Param('id') id: string) {
    return this.userService.getPreferences(id);
  }

  @Get(':id/preferences/:key')
  getPreference(@Param('id') id: string, @Param('key') key: string) {
    return this.userService.getPreference(id, key);
  }

  @Delete(':id/preferences/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePreference(@Param('id') id: string, @Param('key') key: string) {
    return this.userService.removePreference(id, key);
  }

  // GDPR Endpoints
  @Post(':id/request-data-export')
  @HttpCode(HttpStatus.ACCEPTED)
  requestDataExport(@Param('id') id: string) {
    return this.userService.requestDataExport(id);
  }
  
  @Get(':id/data-export')
  generateDataExport(@Param('id') id: string) {
    return this.userService.generateDataExport(id);
  }
  
  @Post(':id/request-data-deletion')
  @HttpCode(HttpStatus.ACCEPTED)
  requestDataDeletion(@Param('id') id: string) {
    return this.userService.requestDataDeletion(id);
  }
}
