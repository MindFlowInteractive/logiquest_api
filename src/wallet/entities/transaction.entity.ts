import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { WalletConnection } from "./wallet-connection.entity";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WalletConnection, wallet => wallet.transactions)
  wallet: WalletConnection;

  @Column()
  txHash: string;

  @Column()
  status: 'pending' | 'confirmed' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
