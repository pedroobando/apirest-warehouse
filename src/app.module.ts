import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EnvConfiguration, JoiValidationSchema } from './config';
import { StorageModule } from './storage/storage.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: ['.env.development'], Tambien se puede especificar el nombre del archivo
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    StorageModule,

    CommonModule,
  ],
})
export class AppModule {}
