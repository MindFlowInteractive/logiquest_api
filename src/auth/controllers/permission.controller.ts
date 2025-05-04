import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../entities/permission.entity';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private permissionRepository: PermissionRepository) {}

  @Get()
  @RequirePermissions('permissions:read')
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  async findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionRepository.findWithHierarchy(id);
  }

  @Post()
  @RequirePermissions('permissions:create')
  async create(@Body() permissionData: Partial<Permission>): Promise<Permission> {
    return this.permissionRepository.create(permissionData);
  }

  @Put(':id')
  @RequirePermissions('permissions:update')
  async update(@Param('id') id: string, @Body() permissionData: Partial<Permission>): Promise<Permission> {
    return this.permissionRepository.update(id, permissionData);
  }

  @Delete(':id')
  @RequirePermissions('permissions:delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.permissionRepository.delete(id);
  }
}