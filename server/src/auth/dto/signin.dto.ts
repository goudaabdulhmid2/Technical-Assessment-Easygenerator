import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SigninDto {
  @ApiProperty({ format: 'email', example: 'alex@example.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 1, example: 'StrongPass1!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
