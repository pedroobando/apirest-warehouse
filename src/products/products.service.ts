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

import { StorageService } from 'src/storage';
import { DataSource, Repository } from 'typeorm';
import { PaginationProductDto, StockProductDto } from './dto';
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
    const { storageId, stock, categoryId, ...restProducts } = createProductDto;

    const theCategory = await this.checkCategory(categoryId);
    const theStorage = await this.checkStorage(storageId);

    try {
      const product = this.ProductsRepository.create({
        ...restProducts,
        category: { id: categoryId },
        user: user.id,
        stocks: [this.ProductStocksRepository.create({ stock, storage: { id: storageId } })],
      });
      await this.ProductsRepository.save(product);

      const retProduct = {
        ...product,
        category: { ...theCategory },
        stocks: { name: theStorage.name, ...product.stocks[0] },
      };
      return { ...retProduct };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationProductDto: PaginationProductDto) {
    const { limit = this.defaultLimitPage, offset = 0, onlyActive = false } = paginationProductDto;
    let Products: Product[];

    let productBuilder = this.ProductsRepository.createQueryBuilder('prod').leftJoinAndSelect(
      'prod.category',
      'category',
    );

    if (onlyActive) {
      productBuilder = productBuilder.where('isActive');
    }

    productBuilder = productBuilder.skip(offset).take(limit).addOrderBy('prod.name', 'ASC');
    Products = await productBuilder.getMany();
    return Products;
  }

  async findOne(term: string) {
    let Product: Product;
    if (isUUID(term, '4')) {
      Product = await this.ProductsRepository.findOne({
        relations: { category: true, stocks: { storage: true } },
        where: { id: term },
      });
      // const queryBuilder = this.ProductsRepository.createQueryBuilder('prod')
      //   .leftJoinAndSelect('prod.category', 'category')
      //   .leftJoinAndSelect('prod.stocks', 'productstock')
      //   .where('prod.id = :term', { term });
      // Product = await queryBuilder.getOne();
    } else {
      Product = await this.ProductsRepository.findOne({
        relations: { category: true, stocks: { storage: true } },
        where: { slug: term },
      });
    }

    if (!Product) {
      throw new NotFoundException(
        `Product with term ${term.toString()} not found`,
        'product_notfound',
      );
    }
    return Product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { storageId, ...restUpdProd } = updateProductDto;
    const theCategory = await this.checkCategory(restUpdProd.categoryId);
    const Product = await this.ProductsRepository.preload({
      id,
      ...restUpdProd,
      user: user.id,
    });
    if (!Product)
      throw new BadRequestException(`Product with id ${id} not found`, 'product_notfound');
    try {
      return await this.ProductsRepository.save(Product);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async updateStock(id: string, stockProductDto: StockProductDto) {
    const { stocks } = stockProductDto;
    const product = await this.findOne(id);
    let productStock: ProductStock;

    try {
      stocks.forEach(async (item) => {
        productStock = await this.ProductStocksRepository.findOne({
          where: { storage: { id: item.storageId }, product: { id: id } },
        });
        if (productStock) {
          productStock.stock += item.stock;
        } else {
          productStock = this.ProductStocksRepository.create({
            product: { id },
            stock: item.stock,
            storage: { id: item.storageId },
          });
        }
        await this.ProductStocksRepository.save(productStock);
      });
      return { affected: stocks.length };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async removeStock(id: string, stockProductDto: StockProductDto) {
    const { stocks } = stockProductDto;
    const product = await this.findOne(id);
    let counter = 0;
    try {
      stocks.forEach(async (item) => {
        const isRemove = await this.ProductStocksRepository.delete({
          product: { id },
          storage: { id: item.storageId },
        });
        if (isRemove.affected == 1) counter++;
      });
      return { affected: counter };
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
    const product = await this.findOne(id);
    await this.ProductsRepository.remove(product);
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
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
