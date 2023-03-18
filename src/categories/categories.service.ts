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
import { User } from 'src/auth/entities';
import { DataSource, Repository } from 'typeorm';
import { PaginationCategoryDto } from './dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities';

@Injectable()
export class CategoriesService {
  private defaultLimitPage: number;
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimitPage = configService.get<number>('defaultLimitPage');
  }

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    // const { images = [], ...productDetails } = createStorageDto;
    try {
      const Category = this.categoriesRepository.create({
        ...createCategoryDto,
        userId: user.id,
      });
      await this.categoriesRepository.save(Category);
      return { ...Category };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationCategoryDto: PaginationCategoryDto) {
    const { limit = this.defaultLimitPage, offset = 0, onlyActive = false } = paginationCategoryDto;
    let Categories: Category[];

    let storageBuilder = this.categoriesRepository.createQueryBuilder();

    if (onlyActive) {
      storageBuilder = storageBuilder.where('isActive');
    }

    storageBuilder = storageBuilder.skip(offset).take(limit).addOrderBy('name', 'ASC');

    Categories = await storageBuilder.getMany();

    return Categories;
  }

  async findOne(term: string) {
    let Category: Category = await this.findOneWithError(term);
    if (!Category) {
      throw new NotFoundException(`Category ${term.toString()} not found`, 'category_notfound');
    }
    return Category;
  }

  async findOneWithError(term: string) {
    let Category: Category;
    if (isUUID(term, '4')) {
      Category = await this.categoriesRepository.findOneBy({ id: term });
    }
    return Category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: User) {
    const Category = await this.categoriesRepository.preload({
      id,
      ...updateCategoryDto,
      userId: user.id,
    });
    if (!Category) throw new BadRequestException(`Category with id: ${id} not found`);
    try {
      return await this.categoriesRepository.save(Category);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async activated(id: string, user: User) {
    console.log(user);
    const Category = await this.categoriesRepository.preload({ id });
    if (!Category) throw new BadRequestException(`Category with id: ${id} not found`);
    Category.isActive = !Category.isActive;
    Category.userId = user.id;
    try {
      return await this.categoriesRepository.save(Category);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const storage = await this.findOne(id);
    await this.categoriesRepository.remove(storage);
  }

  async deleteAll() {
    const queryDeleteAll = this.categoriesRepository.createQueryBuilder('cate');

    try {
      return await queryDeleteAll.delete().where({}).execute();
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  private handleDBExeptions(error: any): never {
    // console.log(error);

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    // if (error.code === '23505') {
    //   throw new BadRequestException(error.detail);
    // }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
