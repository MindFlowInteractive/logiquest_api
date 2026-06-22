import { Test, TestingModule } from '@nestjs/testing';
import { HintsController } from './hints.controller';
import { HintsService } from './hints.service';
import { SessionsService } from '../sessions/sessions.service';
import { ScoringService } from '../scoring/scoring.service';
import { AdminGuard } from '../auth/guards/admin.guard';

describe('HintsController', () => {
  let controller: HintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HintsController],
      providers: [
        HintsService,
        SessionsService,
        ScoringService,
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HintsController>(HintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
