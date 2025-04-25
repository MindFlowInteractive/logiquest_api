import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletService } from "./wallet.service";
import { Module } from "@nestjs/common";
import { WalletController } from "./wallet.controller";
import { WalletConnection } from "./entities/wallet-connection.entity";
import { TransactionAlreadyStartedError } from "typeorm";
import { WalletActivity } from "./entities/wallet-activity.entity";
import { Transaction } from "./entities/transaction.entity";
import { StarknetService } from "./starknet.service";

@Module({
  imports: [TypeOrmModule.forFeature([WalletConnection, TransactionAlreadyStartedError, WalletActivity, Transaction])],
  controllers: [WalletController],
  providers: [
    WalletService,  
    StarknetService,  // service goes here in the `providers` array
  ],
  exports: [
    StarknetService,  // export if needed in other modules
    WalletService,
  ],
})
export class WalletModule {}
