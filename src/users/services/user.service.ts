import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserPreferenceRepository } from '../repositories/user-preference.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import { UserPreferenceDto } from '../dto/user-preference.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly preferenceRepository: UserPreferenceRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with hashed password
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async findAll(searchDto: UserSearchDto): Promise<{ users: any[], totalCount: number }> {
    const [users, totalCount] = await this.userRepository.search(searchDto);
    
    // Remove passwords from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userData } = user;
      return userData;
    });
    
    return { users: sanitizedUsers, totalCount };
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    
    // Remove password from response
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.userRepository.remove(id);
  }

  async updateGameProfile(id: string, gameProfile: any): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const updatedUser = await this.userRepository.update(id, { gameProfile });
    const { password, ...result } = updatedUser;
    return result;
  }

  async setPreference(userId: string, preferenceDto: UserPreferenceDto): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.preferenceRepository.updateOrCreate(userId, preferenceDto.key, preferenceDto.value);
  }

  async getPreferences(userId: string): Promise<any[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.preferenceRepository.findAllByUser(userId);
  }

  async getPreference(userId: string, key: string): Promise<any> {
    const preference = await this.preferenceRepository.findByUserAndKey(userId, key);
    if (!preference) {
      throw new NotFoundException('Preference not found');
    }
    
    return preference;
  }

  async removePreference(userId: string, key: string): Promise<void> {
    const preference = await this.preferenceRepository.findByUserAndKey(userId, key);
    if (!preference) {
      throw new NotFoundException('Preference not found');
    }
    
    await this.preferenceRepository.remove(preference.id);
  }

  // GDPR-related operations
  async requestDataExport(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.userRepository.update(userId, { dataExportRequested: new Date() });
  }

  async generateDataExport(userId: string): Promise<any> {
    const userData = await this.userRepository.getDataForGdprExport(userId);
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    
    // Reset export request date after export is generated
    await this.userRepository.update(userId, { dataExportRequested: null });
    
    return userData;
  }

  async requestDataDeletion(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.userRepository.update(userId, { dataDeletionRequested: new Date() });
  }

  async processDeletionRequest(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    if (!user.dataDeletionRequested) {
      throw new BadRequestException('No deletion request found for this user');
    }
    
    // Anonymize user data instead of deleting completely for data integrity
    await this.userRepository.update(userId, {
      email: `deleted_${userId}@anonymized.com`,
      firstName: 'Deleted',
      lastName: 'User',
      password: await bcrypt.hash(Math.random().toString(36), 10),
      avatar: null,
      gameProfile: null,
      isActive: false,
      dataDeletionRequested: null
    });
    
    // Delete all preferences
    await this.preferenceRepository.removeAllByUser(userId);
  }
}
