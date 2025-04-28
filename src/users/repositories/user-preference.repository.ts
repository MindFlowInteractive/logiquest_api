import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UserPreference } from '../entities/user-preference.entity';

@Injectable()
export class UserPreferenceRepository {
  constructor(
    @InjectRepository(UserPreference)
    private preferenceRepository: Repository<UserPreference>,
  ) {}

  async create(preference: Partial<UserPreference>): Promise<UserPreference> {
    const newPreference = this.preferenceRepository.create(preference);
    return this.preferenceRepository.save(newPreference);
  }

  async findOne(where: FindOptionsWhere<UserPreference>): Promise<UserPreference | undefined> {
    return this.preferenceRepository.findOne({ where });
  }

  async findByUserAndKey(userId: string, key: string): Promise<UserPreference | undefined> {
    return this.preferenceRepository.findOne({
      where: { 
        user: { id: userId },
        key 
      }
    });
  }

  async findAllByUser(userId: string): Promise<UserPreference[]> {
    return this.preferenceRepository.find({
      where: { user: { id: userId } }
    });
  }

  async update(id: string, data: Partial<UserPreference>): Promise<UserPreference> {
    await this.preferenceRepository.update(id, data);
    return this.preferenceRepository.findOne({ where: { id } });
  }

  async updateOrCreate(userId: string, key: string, value: any): Promise<UserPreference> {
    const existing = await this.findByUserAndKey(userId, key);
    
    if (existing) {
      existing.value = value;
      return this.preferenceRepository.save(existing);
    } else {
      const newPreference = this.preferenceRepository.create({
        key,
        value,
        user: { id: userId }
      });
      return this.preferenceRepository.save(newPreference);
    }
  }

  async remove(id: string): Promise<void> {
    await this.preferenceRepository.delete(id);
  }

  async removeAllByUser(userId: string): Promise<void> {
    await this.preferenceRepository.delete({ user: { id: userId } });
  }
}
