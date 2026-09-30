import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '../../common/security/password/password.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser =
      await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const hashedPassword =
      await this.passwordService.hash(dto.password);

    const user = await this.usersRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return user;
  }

  async signin(dto: SigninDto) {
    const user = await this.validateCredentials(dto);

    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
    });

    return {
      user,
      accessToken,
    };
  }

  async getCurrentUser(userId: string) {
  const user = await this.usersRepository.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

  private async validateCredentials(dto: SigninDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user =
      await this.usersRepository.findByEmailWithPassword(
        normalizedEmail,
      );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid =
      await this.passwordService.verify(
        user.password,
        dto.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}