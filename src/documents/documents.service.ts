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
import { doc } from 'prettier';

import { User } from 'src/auth/entities';
import { ProductStock } from 'src/products/entities';
// import { CategoriesService } from 'src/categories';

// import { StorageService } from 'src/storage';
import { DataSource, Repository } from 'typeorm';
import { CancelDocumentDto, PaginationDocumentDto, CreateDocumentDto } from './dto';
import { Document, DocumentDetail, documentType } from './entities';

interface IDocumentStock {
  product: { id: string };
  productMeasure: string;
  productName: string;
  quantity: number;
}

@Injectable()
export class DocumentsService {
  private defaultLimitPage: number;
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private readonly DocumentsRepository: Repository<Document>,

    @InjectRepository(DocumentDetail)
    private readonly DocumentDetailsRepository: Repository<DocumentDetail>,

    @InjectRepository(ProductStock)
    private readonly ProductSocksRepository: Repository<ProductStock>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimitPage = configService.get<number>('defaultLimitPage');
  }

  async create(createDocumentDto: CreateDocumentDto, user: User) {
    const { details, docType, ...restProducts } = createDocumentDto;

    const resultFindProduct = await Promise.all(
      details.map(async (item) =>
        this.ProductSocksRepository.findOne({
          relations: { product: true },
          where: { id: item.productStockId },
        }),
      ),
    );

    const createDetails: IDocumentStock[] = [];
    resultFindProduct.forEach((item: ProductStock, idx) => {
      if (!item) {
        throw new BadRequestException(
          `Product stock Id ${details[idx].productStockId} not found`,
          'create_stocknotfound',
        );
      } else {
        createDetails.push({
          product: { id: item.product.id },
          productMeasure: item.product.measure,
          productName: item.product.name,
          quantity: details[idx].quantity,
        });
      }
    });

    try {
      const product = this.DocumentsRepository.create({
        ...restProducts,
        docType: documentType[docType],
        userCancel: undefined,
        user: user.id,
        details: createDetails.map((item) => this.DocumentDetailsRepository.create({ ...item })),
      });

      await this.DocumentsRepository.save(product);

      return { ...product };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationDocumentDto: PaginationDocumentDto) {
    const { limit = this.defaultLimitPage, offset = 0, onlyActive = false } = paginationDocumentDto;
    let Documents: Document[];

    let productBuilder = this.DocumentsRepository.createQueryBuilder('doc');

    if (onlyActive) {
      productBuilder = productBuilder.where('isActive');
    }

    productBuilder = productBuilder.skip(offset).take(limit).addOrderBy('doc.dateCreate', 'ASC');
    Documents = await productBuilder.getMany();
    return Documents;
  }

  async findOne(term: string) {
    let document: Document;
    if (isUUID(term, '4')) {
      document = await this.DocumentsRepository.findOne({
        // relations: { category: true, stocks: { storage: true } },
        where: { id: term },
      });
      // const queryBuilder = this.ProductsRepository.createQueryBuilder('prod')
      //   .leftJoinAndSelect('prod.category', 'category')
      //   .leftJoinAndSelect('prod.stocks', 'productstock')
      //   .where('prod.id = :term', { term });
      // Product = await queryBuilder.getOne();
    } else {
      document = await this.DocumentsRepository.findOne({
        // relations: { category: true, stocks: { storage: true } },
        where: { numberDoc: term.trim() },
      });
    }

    if (!document) {
      throw new NotFoundException(
        `Product with term ${term.toString()} not found`,
        'product_notfound',
      );
    }
    return document;
  }

  async cancel(id: string, cancelDocumentDto: CancelDocumentDto, user: User) {
    const { comentaryCancel } = cancelDocumentDto;

    let document = await this.DocumentsRepository.findOneBy({ id });
    if (!document)
      throw new BadRequestException(`Document with id ${id} not found`, 'document_notfound');

    if (!document.isActive)
      throw new BadRequestException(`Document id ${id} is not actived`, 'document_cancel');

    document.isActive = false;
    document.comentaryCancel = comentaryCancel;
    document.userCancel = user.id;

    try {
      return await this.DocumentsRepository.save(document);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    await this.DocumentsRepository.remove(document);
  }

  async deleteAll() {
    const queryDeleteAll = this.DocumentsRepository.createQueryBuilder('prod');
    try {
      return await queryDeleteAll.delete().where({}).execute();
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
