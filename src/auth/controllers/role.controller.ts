import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { Role } from '../entities/role.entity';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private roleRepository: RoleRepository) {}

  @Get()
  @RequirePermissions('roles:read')
  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.roleRepository.findById(id);
  }

  @Post()
  @RequirePermissions('roles:create')
  async create(@Body() roleData: Partial<Role>): Promise<Role> {
    return this.roleRepository.create(roleData);
  }

  @Put(':id')
  @RequirePermissions('roles:update')
  async update(@Param('id') id: string, @Body() roleData: Partial<Role>): Promise<Role> {
    return this.roleRepository.update(id, roleData);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.roleRepository.delete(id);
  }

  @Post(':id/permissions')
  @RequirePermissions('roles:update')
  async addPermissions(
    @Param('id') id: string,
    @Body() data: { permissionIds: string[] },
  ): Promise<Role> {
    return this.roleRepository.addPermissionsToRole(id, data.permissionIds);
  }

  @Delete(':id/permissions')
  @RequirePermissions('roles:update')
  async removePermissions(
    @Param('id') id: string,
    @Body() data: { permissionIds: string[] },
  ): Promise<Role> {
    return this.roleRepository.removePermissionsFromRole(id, data.permissionIds);
  }
}