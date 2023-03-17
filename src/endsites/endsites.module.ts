import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth';
import { EndSitesService } from './endsites.service';
import { EndSitesController } from './endsites.controller';
import { EndSite } from './entities';

@Module({
  imports: [ConfigModule, AuthModule, TypeOrmModule.forFeature([EndSite])],
  controllers: [EndSitesController],
  providers: [EndSitesService],
  exports: [EndSitesService],
})
export class EndSitesModule {}
