import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { User } from 'src/auth/entities';
import { EndSite } from './entities';

import { CreateEndSiteDto } from './dto/create-endsite.dto';
import { UpdateEndSiteDto } from './dto/update-endsite.dto';
import { PaginationEndSiteDto } from './dto';
import { isUUID } from 'class-validator';

@Injectable()
export class EndSitesService {
  private defaultLimitPage: number;
  private readonly logger = new Logger(EndSitesService.name);

  constructor(
    @InjectRepository(EndSite)
    private readonly endSitesRepository: Repository<EndSite>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimitPage = configService.get<number>('defaultLimitPage');
  }

  async create(createEndSiteDto: CreateEndSiteDto, user: User) {
    // const { images = [], ...productDetails } = createStorageDto;
    try {
      const endSite = this.endSitesRepository.create({
        ...createEndSiteDto,
      });
      await this.endSitesRepository.save(endSite);
      return { ...endSite };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationEndSiteDto: PaginationEndSiteDto) {
    const { limit = this.defaultLimitPage, offset = 0, onlyActive = false } = paginationEndSiteDto;
    let endSites: EndSite[];

    let storageBuilder = this.endSitesRepository.createQueryBuilder();

    if (onlyActive) {
      storageBuilder = storageBuilder.where('isActive');
    }

    storageBuilder = storageBuilder.skip(offset).take(limit).addOrderBy('name', 'ASC');

    endSites = await storageBuilder.getMany();

    return endSites;
  }

  async findOne(term: string) {
    let endSite: EndSite;
    if (isUUID(term, '4')) {
      endSite = await this.endSitesRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.endSitesRepository.createQueryBuilder('endsite');
      endSite = await queryBuilder
        .where('LOWER(name) LIKE %:name%', {
          name: term.toLowerCase(),
        })
        .getOne();
    }
    // not found
    if (!endSite) {
      throw new NotFoundException(`EndSite with term ${term.toString()} not found`);
    }
    return endSite;
  }

  async update(id: string, updateEndSiteDto: UpdateEndSiteDto) {
    const endSite = await this.endSitesRepository.preload({ id, ...updateEndSiteDto });
    if (!endSite) throw new BadRequestException(`EndSite with id: ${id} not found`);
    try {
      return await this.endSitesRepository.save(endSite);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async activated(id: string) {
    const endSite = await this.endSitesRepository.preload({ id });
    if (!endSite) throw new BadRequestException(`EndSite with id: ${id} not found`);
    endSite.isActive = !endSite.isActive;
    try {
      return await this.endSitesRepository.save(endSite);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const storage = await this.findOne(id);
    await this.endSitesRepository.remove(storage);
  }

  async deleteAll() {
    const queryDelete = this.endSitesRepository.createQueryBuilder('site');

    try {
      return await queryDelete.delete().where({}).execute();
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
