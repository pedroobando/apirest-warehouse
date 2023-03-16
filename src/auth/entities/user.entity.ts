import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column('varchar', { nullable: false, select: false })
  password: string;

  @Column('varchar', { nullable: false })
  fullName: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('varchar', { default: '["user"]' })
  roles: string;

  // @OneToMany(() => Product, (product) => product.user)
  // product: Product;

  @BeforeInsert()
  checkFieldBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.fullName = this.fullName.trim();
  }

  @BeforeUpdate()
  checkFieldBeforeUpdate() {
    this.checkFieldBeforeInsert();
  }
}
