import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      // We will inject ConfigService here.
    }),
  ],
  exports: [
    MongooseModule,
  ],
})
export class DatabaseModule {}