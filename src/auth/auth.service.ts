import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { OAuthProvider, OAuthProviderType } from './entities/oauth-provider.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface OAuthProfile {
  provider: string;
  providerUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OAuthProvider)
    private oauthProviderRepository: Repository<OAuthProvider>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokenPair(user: User) {
    const payload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRY', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
    });
    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokenPair(user);
  }

  /**
   * Handle OAuth2 social login for both Google and GitHub.
   * - If a matching OAuthProvider record exists, return the linked user's tokens.
   * - If the OAuth email matches an existing account, link the provider and return tokens.
   * - Otherwise create a new user and link the provider.
   */
  async handleOAuthLogin(profile: OAuthProfile) {
    const providerType = profile.provider as OAuthProviderType;

    // 1. Check for existing OAuth provider link
    const existingProvider = await this.oauthProviderRepository.findOne({
      where: { provider: providerType, providerUserId: profile.providerUserId },
      relations: { user: true },
    });

    if (existingProvider) {
      // Sync profile data on every login
      existingProvider.displayName = profile.displayName;
      existingProvider.avatarUrl = profile.avatarUrl;
      await this.oauthProviderRepository.save(existingProvider);
      return this.generateTokenPair(existingProvider.user);
    }

    // 2. Try to link to an existing account by email
    let user = profile.email
      ? await this.userRepository.findOne({ where: { email: profile.email } })
      : null;

    if (!user) {
      // 3. Create a new user — derive username from displayName or provider ID
      const baseUsername = (
        profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
        `${profile.provider}_${profile.providerUserId}`
      ).slice(0, 30);

      const username = await this.ensureUniqueUsername(baseUsername);

      user = this.userRepository.create({
        username,
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });
      await this.userRepository.save(user);
    } else {
      // Sync profile data if missing
      if (!user.displayName) user.displayName = profile.displayName;
      if (!user.avatarUrl) user.avatarUrl = profile.avatarUrl;
      await this.userRepository.save(user);
    }

    // 4. Create the OAuthProvider link
    const oauthProvider = this.oauthProviderRepository.create({
      provider: providerType,
      providerUserId: profile.providerUserId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      userId: user.id,
    });
    await this.oauthProviderRepository.save(oauthProvider);

    return this.generateTokenPair(user);
  }

  private async ensureUniqueUsername(base: string): Promise<string> {
    let candidate = base;
    let suffix = 1;
    while (await this.userRepository.findOne({ where: { username: candidate } })) {
      candidate = `${base}${suffix++}`;
    }
    return candidate;
  }
}