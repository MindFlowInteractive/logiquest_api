import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findByName(name: string): Promise<Role> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async findById(id: string): Promise<Role> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findWithPermissions(id: string): Promise<Role> {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.id = :id', { id })
      .getOne();
  }

  async findWithHierarchy(id: string): Promise<Role> {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.children', 'children')
      .leftJoinAndSelect('children.permissions', 'childPermissions')
      .where('role.id = :id', { id })
      .getOne();
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(id, roleData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findWithPermissions(roleId);
    const currentPermissionIds = role.permissions.map(p => p.id);
    
    // Add only new permissions
    const newPermissionIds = permissionIds.filter(id => !currentPermissionIds.includes(id));
    
    if (newPermissionIds.length > 0) {
      await this.roleRepository
        .createQueryBuilder()
        .relation(Role, 'permissions')
        .of(roleId)
        .add(newPermissionIds);
    }
    
    return this.findWithPermissions(roleId);
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<Role> {
    await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(roleId)
      .remove(permissionIds);
    
    return this.findWithPermissions(roleId);
  }
}