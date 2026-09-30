
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { UserMapper } from '../../users/mappers/user.mapper.js';
import { SignupDto } from '../dto/signup.dto.js';
import { SigninDto } from '../dto/signin.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { AuthService } from '../services/auth.service.js';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @Post('signup')
  @ApiOperation({ summary: 'Create an account' })
  @ApiCreatedResponse({ description: 'Account created; password is never returned.' })
  @ApiBadRequestResponse({ description: 'Invalid signup data or unknown fields.' })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);

    return {
      message: 'User registered successfully',
      user: UserMapper.toResponse(user),
    };
  }

  @Throttle({
  default: {
    limit: 5,
    ttl: 60_000,
  },
    })
  @Post('signin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in and set the access-token cookie' })
  @ApiOkResponse({ description: 'Signed in. Sets an HttpOnly access_token cookie.' })
  @ApiBadRequestResponse({ description: 'Invalid request data.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signin(dto);

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return {
      message: 'Signed in successfully',
      user: UserMapper.toResponse(result.user),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiOkResponse({ description: 'Current user profile.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access-token cookie.' })
  async me(@Req() request: Request) {
    const authUser = request.user as {
        userId: string;
    };

    const user = await this.authService.getCurrentUser(
      authUser.userId,
    );

    return {
      user: UserMapper.toResponse(user),
    };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear the access-token cookie' })
  @ApiOkResponse({ description: 'Clears the access_token cookie in this client.' })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
