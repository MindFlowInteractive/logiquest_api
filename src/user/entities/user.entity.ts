import { BaseEntity } from 'src/common/base.entity';
import { WalletConnection } from 'src/wallet/entities/wallet-connection.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => WalletConnection, wallet => wallet.user)
  wallets: WalletConnection[];

}
