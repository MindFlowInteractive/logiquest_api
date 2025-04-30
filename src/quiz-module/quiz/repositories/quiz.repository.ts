// File: src/quiz/repositories/quiz.repository.ts
import { Repository, EntityRepository, SelectQueryBuilder } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { QuizFilterDto } from '../dto/quiz-filter.dto';

@EntityRepository(Quiz)
export class QuizRepository extends Repository<Quiz> {
  createFilterQuery(filterDto: QuizFilterDto): SelectQueryBuilder<Quiz> {
    const { categoryIds, difficultyLevel, status, isPublic, search, creatorId } = filterDto;
    
    const query = this.createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('questions.answers', 'answers')
      .leftJoinAndSelect('quiz.categories', 'categories');
    
    if (categoryIds && categoryIds.length > 0) {
      query.innerJoin('quiz.categories', 'category', 'category.id IN (:...categoryIds)', {
        categoryIds,
      });
    }
    
    if (difficultyLevel) {
      query.andWhere('quiz.difficultyLevel = :difficultyLevel', { difficultyLevel });
    }
    
    if (status) {
      query.andWhere('quiz.status = :status', { status });
    }
    
    if (isPublic !== undefined) {
      query.andWhere('quiz.isPublic = :isPublic', { isPublic });
    }
    
    if (creatorId) {
      query.andWhere('quiz.creatorId = :creatorId', { creatorId });
    }
    
    if (search) {
      query.andWhere(
        '(quiz.title ILIKE :search OR quiz.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    
    return query;
  }
}