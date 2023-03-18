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
import { CategoriesService } from 'src/categories';
import { Category } from 'src/categories/entities';
import { StorageService } from 'src/storage';
import { DataSource, Repository } from 'typeorm';
import { PaginationProductDto } from './dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStock } from './entities';

@Injectable()
export class ProductsService {
  private defaultLimitPage: number;
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly ProductsRepository: Repository<Product>,

    @InjectRepository(ProductStock)
    private readonly ProductStocksRepository: Repository<ProductStock>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly categoryService: CategoriesService,
    private readonly storageService: StorageService,
  ) {
    this.defaultLimitPage = configService.get<number>('defaultLimitPage');
  }

  async create(createProductDto: CreateProductDto, user: User) {
    const { storage, stock, category, ...restProducts } = createProductDto;

    const theCategory = await this.checkCategory(category);
    const theStorage = await this.checkStorage(storage);

    try {
      const Product = this.ProductsRepository.create({
        ...restProducts,
        category,
        user: user.id,
        stocks: [this.ProductStocksRepository.create({ stock, storage })],
      });
      await this.ProductsRepository.save(Product);
      // Product.stocks[0].name = theStorage.name;
      const pepe = {
        ...Product,
        category: { ...theCategory },
        stocks: { name: theStorage.name, ...Product.stocks[0] },
      };
      return { ...pepe };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationProductDto: PaginationProductDto) {
    const { limit = this.defaultLimitPage, offset = 0, onlyActive = false } = paginationProductDto;
    let Products: Product[];

    let productBuilder = this.ProductsRepository.createQueryBuilder();

    if (onlyActive) {
      productBuilder = productBuilder.where('isActive');
    }

    productBuilder = productBuilder.skip(offset).take(limit).addOrderBy('name', 'ASC');

    Products = await productBuilder.getMany();

    return Products;
  }

  async findOne(term: string) {
    let Product: Product;
    if (isUUID(term, '4')) {
      Product = await this.ProductsRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.ProductsRepository.createQueryBuilder('prod');
      Product = await queryBuilder
        .where('LOWER(name) LIKE %:name%', {
          name: term.toLowerCase(),
        })
        .getOne();
    }
    // not found
    if (!Product) {
      throw new NotFoundException(`Product with term ${term.toString()} not found`);
    }
    return Product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const Product = await this.ProductsRepository.preload({
      id,
      ...updateProductDto,
      user: user.id,
    });
    if (!Product) throw new BadRequestException(`Product with id: ${id} not found`);
    try {
      return await this.ProductsRepository.save(Product);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async activated(id: string, user: User) {
    const Product = await this.ProductsRepository.preload({ id });
    if (!Product) throw new BadRequestException(`Product with id: ${id} not found`);
    Product.isActive = !Product.isActive;
    Product.user = user.id;
    try {
      return await this.ProductsRepository.save(Product);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const storage = await this.findOne(id);
    await this.ProductsRepository.remove(storage);
  }

  async deleteAll() {
    const queryDeleteAll = this.ProductsRepository.createQueryBuilder('prod');
    try {
      return await queryDeleteAll.delete().where({}).execute();
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  private async checkCategory(category: string) {
    const seekCategory = await this.categoryService.findOneWithError(category);
    if (!seekCategory) {
      throw new BadRequestException(`Category ${category} not found`, 'category_notfound');
    }
    if (!seekCategory.isActive) {
      throw new BadRequestException(`Category ${category} not active`, 'category_notactive');
    }
    return seekCategory;
  }

  private async checkStorage(storage: string) {
    const seekStorage = await this.storageService.findOneWithError(storage);
    if (!seekStorage) {
      throw new BadRequestException(`Storage ${storage} not found`, 'storage_notfound');
    }
    if (!seekStorage.isActive) {
      throw new BadRequestException(`Storage ${storage} not active`, 'storage_notactive');
    }
    return seekStorage;
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
