import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService =
    app.get(ConfigService);

  app.use(helmet());
  
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion:'1'
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

   
      forbidNonWhitelisted: true,

      transform: true,

      exceptionFactory: (errors) => {
        return new BadRequestException({
          message: 'Validation failed',

          errors: errors.map((error) => ({
            field: error.property,

            message: Object.values(
              error.constraints ?? {},
            ).join(', '),
          })),
        });
      },
    }),
  );



  app.enableCors({
    origin: configService.getOrThrow<string>(
      'FRONTEND_URL',
    ),
    credentials: true,
  });
  
  app.use(cookieParser())

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();