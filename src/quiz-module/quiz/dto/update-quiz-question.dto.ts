// File: src/quiz/dto/update-quiz-question.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {}
