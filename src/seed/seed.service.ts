import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities';
import { CategoriesService } from 'src/categories';
import { BCryptAdapter } from 'src/common/adapter';
import { EndSitesService } from 'src/endsites';
import { StorageService } from 'src/storage';
import { Repository } from 'typeorm';

import { initialData } from './data/warehouse-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly storageService: StorageService,
    private readonly endSitesService: EndSitesService,
    private readonly categoriesService: CategoriesService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly bcryptService: BCryptAdapter,
  ) {}

  async runSeed() {
    await this.deleteTable();

    const user = await this.insertUsers();

    await this.insertNewStorage(user);
    await this.insertNewEndSite(user);
    await this.insertNewCategory(user);

    return { ok: 'RUNNING SEED' };
  }

  private async deleteTable() {
    await this.storageService.deleteAll();
    await this.endSitesService.deleteAll();
    await this.categoriesService.deleteAll();

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

  private async insertNewEndSite(user: User) {
    if (process.env.NODE_ENV !== 'dev') {
      throw new BadRequestException(`Esta accion solo puede ser ejecutada en desarrollo.`);
    }

    const endSites = initialData.endsites;
    const insertPromise = [];
    endSites.forEach((endSite) => {
      insertPromise.push(this.endSitesService.create(endSite, user));
    });

    await Promise.all(insertPromise);
  }

  private async insertNewCategory(user: User) {
    if (process.env.NODE_ENV !== 'dev') {
      throw new BadRequestException(`Esta accion solo puede ser ejecutada en desarrollo.`);
    }

    const categories = initialData.categories;
    const insertPromise = [];
    categories.forEach((category) => {
      insertPromise.push(this.categoriesService.create(category, user));
    });

    await Promise.all(insertPromise);
  }
}
