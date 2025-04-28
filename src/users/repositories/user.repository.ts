import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSearchDto } from '../dto/user-search.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findOne(where: FindOptionsWhere<User>): Promise<User | undefined> {
    return this.userRepository.findOne({ where, relations: ['preferences'] });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['preferences']
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['preferences']
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async search(searchDto: UserSearchDto): Promise<[User[], number]> {
    const { email, firstName, lastName, isActive, sort, order, page = 1, limit = 10 } = searchDto;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.preferences', 'preferences');
    
    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }
    
    if (firstName) {
      queryBuilder.andWhere('user.firstName LIKE :firstName', { firstName: `%${firstName}%` });
    }
    
    if (lastName) {
      queryBuilder.andWhere('user.lastName LIKE :lastName', { lastName: `%${lastName}%` });
    }
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }
    
    if (sort && order) {
      queryBuilder.orderBy(`user.${sort}`, order);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }
    
    queryBuilder.skip((page - 1) * limit).take(limit);
    
    return queryBuilder.getManyAndCount();
  }

  async getDataForGdprExport(userId: string): Promise<any> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }
    
    // Remove sensitive data for GDPR export
    const { password, ...userDataWithoutPassword } = user;
    return userDataWithoutPassword;
  }
}
