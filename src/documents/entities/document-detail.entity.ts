import { Product, ProductStock } from 'src/products/entities';
import { Storage } from 'src/storage/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity({ name: 'document_details' })
export class DocumentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, (document) => document.details)
  document: Document;

  @OneToOne(() => Product, (product) => product.id, { cascade: ['recover'] })
  product: Product;

  @ManyToOne(() => ProductStock, (stock) => stock.id, { cascade: ['recover'] })
  stock: ProductStock;

  @Column({ type: 'varchar' })
  productName: string;

  @Column({ type: 'varchar' })
  productMeasure: string;

  @Column({ type: 'float', default: 0 })
  quantity: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
