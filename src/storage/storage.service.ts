import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto';
import { DataSource, Repository } from 'typeorm';
import { CreateStorageDto, PaginationStorageDto, UpdateStorageDto } from './dto';
import { Storage } from './entities';

@Injectable()
export class StorageService {
  private defaultLimit: number;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(Storage)
    private readonly storageRepository: Repository<Storage>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimitPage');
  }

  async create(createStorageDto: CreateStorageDto) {
    // const { images = [], ...productDetails } = createStorageDto;
    try {
      const storage = this.storageRepository.create({
        ...createStorageDto,
      });
      await this.storageRepository.save(storage);
      return { ...storage };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationStorageDto: PaginationStorageDto) {
    const { limit = this.defaultLimit, offset = 0, onlyActive = false } = paginationStorageDto;
    let storages: Storage[];

    let storageBuilder = this.storageRepository.createQueryBuilder();

    if (onlyActive) {
      storageBuilder = storageBuilder.where('isActive');
    }

    // if (gender) {
    //   productBuilder = productBuilder.andWhere('gender =:gender', { gender: gender.toLowerCase() });
    // }

    storageBuilder = storageBuilder.skip(offset).take(limit).addOrderBy('name', 'ASC');

    storages = await storageBuilder.getMany();

    // if (!products) {
    // storages = await this.storageRepository.find({
    //   skip: offset,
    //   take: limit,
    //   order: { name: 1 },
    //   select: { id: true, name: true, active: true },
    // });
    // }

    return storages;
    // return storages.map(({ ...rest }) => ({
    //   ...rest,
    // }));
  }

  async findOne(term: string) {
    let storage: Storage = await this.findOneWithError(term);
    // not found
    if (!storage) {
      throw new NotFoundException(`Storage ${term.toString()} not found`, 'storage_notfound');
    }
    return storage;
  }

  async findOneWithError(term: string) {
    let storage: Storage;
    if (isUUID(term, '4')) {
      storage = await this.storageRepository.findOneBy({ id: term });
    }
    return storage;
  }

  async update(id: string, updateStorageDto: UpdateStorageDto) {
    const storage = await this.storageRepository.preload({ id, ...updateStorageDto });
    if (!storage) throw new BadRequestException(`Storage with id: ${id} not found`);
    try {
      return await this.storageRepository.save(storage);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async activated(id: string) {
    const storage = await this.storageRepository.preload({ id });
    if (!storage) throw new BadRequestException(`Storage with id: ${id} not found`);
    storage.isActive = !storage.isActive;
    try {
      return await this.storageRepository.save(storage);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const storage = await this.findOne(id);
    await this.storageRepository.remove(storage);
  }

  async deleteAll() {
    const queryStorage = this.storageRepository.createQueryBuilder('storage');

    try {
      return await queryStorage.delete().where({}).execute();
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  private handleDBExeptions(error: any): never {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
