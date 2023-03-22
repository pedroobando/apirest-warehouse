import { Category } from 'src/categories/entities';
import {
  AfterInsert,
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
import { DocumentDetail } from './document-detail.entity';

export enum documentType {
  in_buy = 'in_buy',
  out_delivery = 'out_delivery',
  adj_doc = 'adj_doc',
  out_job = 'out_job',
}
//

@Entity({ name: 'document' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: false, default: () => 'CURRENT_TIMESTAMP(6)' })
  dateCreate: Date;

  @Column({ type: 'varchar', length: 10, nullable: false })
  numberDoc: string;

  @Column({ type: 'varchar', length: 150 })
  peopleName: string;

  @Index({ unique: false })
  @Column({ type: 'varchar', length: 20, nullable: false, default: 'income' })
  docType: documentType;

  @Column({ type: 'varchar', length: 500, default: '' })
  comentary: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, default: '' })
  comentaryCancel?: string;

  @Column({ type: 'uuid', nullable: false, default: '' })
  userCancel?: string;

  @OneToMany(() => DocumentDetail, (documentDetail) => documentDetail.document, {
    cascade: true,
    eager: true,
  })
  details?: DocumentDetail[];

  @Column({ type: 'uuid', nullable: false })
  user: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
