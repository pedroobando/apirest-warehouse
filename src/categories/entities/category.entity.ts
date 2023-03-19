import { Product } from 'src/products/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: false })
  name: string;

  // {
  //   cascade: true,
  //   eager: true,
  // }

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', unique: false, nullable: false })
  userId: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
