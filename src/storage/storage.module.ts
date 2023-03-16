import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Storage } from './entities';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Storage])],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
