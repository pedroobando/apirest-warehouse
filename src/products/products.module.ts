import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth';
import { CategoriesModule } from 'src/categories';
import { StorageModule } from 'src/storage';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductStock } from './entities';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CategoriesModule,
    StorageModule,
    TypeOrmModule.forFeature([Product, ProductStock]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
