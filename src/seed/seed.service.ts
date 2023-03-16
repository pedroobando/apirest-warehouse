import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities';
import { BCryptAdapter } from 'src/common/adapter';
import { StorageService } from 'src/storage';
import { Repository } from 'typeorm';

import { initialData } from './data/warehouse-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly storageService: StorageService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly bcryptService: BCryptAdapter,
  ) {}

  async runSeed() {
    await this.deleteTable();

    const user = await this.insertUsers();

    await this.insertNewStorage(user);
    return { ok: 'RUNNING SEED' };
  }

  private async deleteTable() {
    await this.storageService.deleteAllStorages();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUser = initialData.users;

    const users: User[] = [];

    seedUser.forEach((user) => {
      user.password = this.bcryptService.hash(user.password.trim());
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUser);

    return dbUsers[0];
  }

  private async insertNewStorage(user: User) {
    if (process.env.NODE_ENV !== 'dev') {
      throw new BadRequestException(`Esta accion solo puede ser ejecutada en desarrollo.`);
    }

    const storages = initialData.storages;
    const insertPromise = [];
    storages.forEach((storage) => {
      insertPromise.push(this.storageService.create(storage));
    });

    await Promise.all(insertPromise);
  }
}
