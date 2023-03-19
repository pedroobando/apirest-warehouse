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

import { Product } from './product.entity';

@Entity({ name: 'product_stocks' })
export class ProductStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.stocks, { onDelete: 'CASCADE' })
  product: Product;

  // @Index({ unique: false })
  // @Column({ type: 'uuid', nullable: false })
  // (storage) => storage.id,
  @ManyToOne(() => Storage, (storage) => storage.id, { cascade: ['recover'] })
  storage: Storage;
  // @JoinTable()
  // @Index({ unique: false })
  // @Column({ type: 'uuid', nullable: false })
  // storageId: string;

  @Column({ type: 'float', default: 0 })
  stock: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
