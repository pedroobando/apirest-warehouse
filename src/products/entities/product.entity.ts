import { User } from 'src/auth/entities';
import { Category } from 'src/categories/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStock } from './product-stock.entity';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  name: string;

  // @OneToOne(() => Category, (category) => category.products)
  @Index({ unique: false })
  @Column({ type: 'uuid', nullable: false })
  category: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  slug: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: false })
  measure: string;

  // @ManyToOne(() => User, (user) => user.product, { eager: true })
  // user: User;

  @OneToMany(() => ProductStock, (productStock) => productStock.product, {
    cascade: true,
    eager: true,
  })
  stocks?: ProductStock[];

  @Column({ type: 'uuid', unique: false, nullable: false })
  user: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.name;
    }

    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }
}
