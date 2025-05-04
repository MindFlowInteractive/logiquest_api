import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findByName(name: string): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  async findAllByNames(names: string[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({ name: { $in: names } });
  }

  async findWithHierarchy(id: string): Promise<Permission> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.children', 'children')
      .where('permission.id = :id', { id })
      .getOne();
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }

  async update(id: string, permissionData: Partial<Permission>): Promise<Permission> {
    await this.permissionRepository.update(id, permissionData);
    return this.permissionRepository.findOneBy({ id });
  }

  async delete(id: string): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}