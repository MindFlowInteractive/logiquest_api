import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Transaction } from "./transaction.entity";
import { WalletActivity } from "./wallet-activity.entity";

@Entity()
export class WalletConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.wallets)
  user: User;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ nullable: true })
  walletType: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  address:string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, tx => tx.wallet)
  transactions: Transaction[];

  @OneToMany(() => WalletActivity, wa => wa.wallet)
  activities: WalletActivity[];
}