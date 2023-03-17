import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Storage } from './entities';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AuthModule } from 'src/auth';

@Module({
  imports: [ConfigModule, AuthModule, TypeOrmModule.forFeature([Storage])],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
