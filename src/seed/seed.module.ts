import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { AuthModule } from 'src/auth';
import { CommonModule } from 'src/common';
import { StorageModule } from 'src/storage';
import { EndSitesModule } from 'src/endsites';
import { CategoriesModule } from 'src/categories';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [StorageModule, EndSitesModule, CategoriesModule, AuthModule, CommonModule],
})
export class SeedModule {}
