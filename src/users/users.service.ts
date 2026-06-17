import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      username: dto.username,
      email: dto.email,
      passwordHash: hash,
      role: UserRole.PLAYER,
    });
    return this.repo.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole): Promise<User> {
    if (id !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot edit other users');
    }
    const user = await this.findOne(id);
    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      (dto as any).passwordHash = passwordHash;
      delete (dto as any).password;
    }
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
