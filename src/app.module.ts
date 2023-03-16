import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvConfiguration, JoiValidationSchema } from './config';
import { CommonModule } from './common/common.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { Storage } from './storage/entities';

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
  ],
})
export class AppModule {}
