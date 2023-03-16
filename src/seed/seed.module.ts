import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { AuthModule } from 'src/auth';
import { CommonModule } from 'src/common';
import { StorageModule } from 'src/storage';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [StorageModule, AuthModule, CommonModule],
})
export class SeedModule {}
