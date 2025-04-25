import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WalletConnection } from "./wallet-connection.entity";

@Entity()
export class WalletActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WalletConnection, wallet => wallet.activities)
  wallet: WalletConnection;

  @Column()
  type: string;

  @Column()
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}
