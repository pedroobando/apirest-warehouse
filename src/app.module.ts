import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvConfiguration, JoiValidationSchema } from './config';
import { CommonModule } from './common';
import { StorageModule } from './storage';
import { AuthModule } from './auth';
import { Storage } from './storage/entities';
import { SeedModule } from './seed';
import { EndSitesModule } from './endsites';
import { CategoriesModule } from './categories';
import { ProductsModule } from './products';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: ['.env.development'], Tambien se puede especificar el nombre del archivo
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Storage],
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    CommonModule,
    StorageModule,
    AuthModule,
    SeedModule,
    EndSitesModule,
    CategoriesModule,
    ProductsModule,
    DocumentsModule,
  ],
})
export class AppModule {}
