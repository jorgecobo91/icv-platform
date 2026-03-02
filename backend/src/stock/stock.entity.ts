import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Material } from '../materials/material.entity';

@Entity()
export class Stock {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  almacen: string; // Alm.

  @Column()
  tipo: string; // Tp.

  @Column()
  ubicacion: string;

  @Column({ nullable: true })
  lote: string;

  @Column('float')
  stockDisponible: number;

  @ManyToOne(() => Material, (material) => material.stocks)
  material: Material;
}