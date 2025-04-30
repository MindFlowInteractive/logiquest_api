// File: src/quiz/services/quiz.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, In } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizVersion } from '../entities/quiz-version.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { QuizFilterDto } from '../dto/quiz-filter.dto';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { QuizRepository } from '../repositories/quiz.repository';
import { User } from '../../users/entities/user.entity';
import { PagedResponse } from '../../common/interfaces/paged-response.interface';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizRepository)
    private quizRepository: QuizRepository,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(QuizVersion)
    private quizVersionRepository: Repository<QuizVersion>,
    private connection: Connection,
  ) {}

  async create(createQuizDto: CreateQuizDto, user: User): Promise<Quiz> {
    const { categoryIds, questions, ...quizData } = createQuizDto;

    // Start a transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create quiz entity
      const quiz = this.quizRepository.create({
        ...quizData,
        creator: user,
      });

      // Add categories if provided
      if (categoryIds && categoryIds.length > 0) {
        const categories = await this.categoryRepository.find({
          where: { id: In(categoryIds) },
        });
        
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('Some categories were not found');
        }
        
        quiz.categories = categories;
      }

      // Save quiz first
      await queryRunner.manager.save(quiz);

      // Add questions if provided
      if (questions && questions.length > 0) {
        await this.createQuestions(quiz, questions, queryRunner.manager);
      }

      // Create initial version
      await this.createQuizVersion(quiz, user, queryRunner.manager);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return the fully populated quiz
      return this.findOne(quiz.id);
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll(filterDto: QuizFilterDto): Promise<PagedResponse<Quiz>> {
    const { page = 1, limit = 10 } = filterDto;
    
    const query = this.quizRepository.createFilterQuery(filterDto);
    
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne(id, {
      relations: ['questions', 'questions.answers', 'categories', 'creator'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID "${id}" not found`);
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto, user: User): Promise<Quiz> {
    const { categoryIds, questions, ...quizData } = updateQuizDto;
    
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Get the existing quiz with relations
      const quiz = await queryRunner.manager
        .createQueryBuilder(Quiz, 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.answers', 'answers')
        .leftJoinAndSelect('quiz.categories', 'categories')
        .where('quiz.id = :id', { id })
        .getOne();
      
      if (!quiz) {
        throw new NotFoundException(`Quiz with ID "${id}" not found`);
      }
      
      // Check permissions
      if (quiz.creatorId !== user.id && !this.hasAdminPermission(user)) {
        throw new ForbiddenException('You do not have permission to update this quiz');
      }
      
      // Update quiz fields
      Object.assign(quiz, quizData);
      
      // Update categories if provided
      if (categoryIds) {
        const categories = await this.categoryRepository.find({
          where: { id: In(categoryIds) },
        });
        
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('Some categories were not found');
        }
        
        quiz.categories = categories;
      }
      
      // Save quiz first to update version
      await queryRunner.manager.save(quiz);
      
      // Update questions if provided
      if (questions) {
        // Remove existing questions
        await queryRunner.manager.delete(QuizQuestion, { quizId: quiz.id });
        
        // Create new questions
        await this.createQuestions(quiz, questions, queryRunner.manager);
      }
      
      // Create new version entry
      await this.createQuizVersion(quiz, user, queryRunner.manager);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return the updated quiz
      return this.findOne(id);
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async remove(id: string, user: User, hardDelete = false): Promise<void> {
    const quiz = await this.findOne(id);
    
    // Check permissions
    if (quiz.creatorId !== user.id && !this.hasAdminPermission(user)) {
      throw new ForbiddenException('You do not have permission to delete this quiz');
    }
    
    if (hardDelete && this.hasAdminPermission(user)) {
      await this.quizRepository.delete(id);
    } else {
      // Soft delete
      await this.quizRepository.softDelete(id);
    }
  }
  
  async search(query: string, limit = 10): Promise<Quiz[]> {
    return this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('quiz.categories', 'categories')
      .where('quiz.title ILIKE :query OR quiz.description ILIKE :query', {
        query: `%${query}%`,
      })
      .andWhere('quiz.isPublic = :isPublic', { isPublic: true })
      .take(limit)
      .getMany();
  }
  
  async addQuestion(quizId: string, questionDto: CreateQuizQuestionDto, user: User): Promise<Quiz> {
    const quiz = await this.findOne(quizId);
    
    // Check permissions
    if (quiz.creatorId !== user.id && !this.hasAdminPermission(user)) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }
    
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Create and save the question with answers
      await this.createQuestions(quiz, [questionDto], queryRunner.manager);
      
      // Create new version entry
      await this.createQuizVersion(quiz, user, queryRunner.manager);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return updated quiz
      return this.findOne(quizId);
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  
  async updateQuestion(
    quizId: string,
    questionId: string,
    updateDto: UpdateQuizQuestionDto,
    user: User,
  ): Promise<Quiz> {
    const quiz = await this.findOne(quizId);
    
    // Check permissions
    if (quiz.creatorId !== user.id && !this.hasAdminPermission(user)) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }
    
    // Find the question
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID "${questionId}" not found in quiz`);
    }
    
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const { answers, ...questionData } = updateDto;
      
      // Update question fields
      Object.assign(question, questionData);
      await queryRunner.manager.save(question);
      
      // Update answers if provided
      if (answers) {
        // Remove existing answers
        await queryRunner.manager.delete(QuizAnswer, { questionId });
        
        // Create new answers
        const quizAnswers = answers.map(answerDto => {
          const answer = new QuizAnswer();
          Object.assign(answer, answerDto);
          answer.question = question;
          return answer;
        });
        
        await queryRunner.manager.save(quizAnswers);
      }
      
      // Create new version entry
      await this.createQuizVersion(quiz, user, queryRunner.manager);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return updated quiz
      return this.findOne(quizId);
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  
  async removeQuestion(quizId: string, questionId: string, user: User): Promise<Quiz> {
    const quiz = await this.findOne(quizId);
    
    // Check permissions
    if (quiz.creatorId !== user.id && !this.hasAdminPermission(user)) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }
    
    // Find the question
    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      throw new NotFoundException(`Question with ID "${questionId}" not found in quiz`);
    }
    
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Delete the question and its answers (cascade)
      await queryRunner.manager.delete(QuizQuestion, { id: questionId });
      
      // Create new version entry
      await this.createQuizVersion(quiz, user, queryRunner.manager);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Return updated quiz
      return this.findOne(quizId);
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  
  async getVersions(quizId: string): Promise<QuizVersion[]> {
    const quiz = await this.findOne(quizId);
    
    return this.quizVersionRepository.find({
      where: { quizId },
      relations: ['modifiedBy'],
      order: { versionNumber: 'DESC' },
    });
  }
  
  async getVersion(quizId: string, versionId: string): Promise<QuizVersion> {
    const version = await this.quizVersionRepository.findOne(versionId, {
      where: { quizId },
      relations: ['modifiedBy'],
    });
    
    if (!version) {
      throw new NotFoundException(`Version with ID "${versionId}" not found for quiz`);
    }
    
    return version;
  }
  
  // Helper methods
  private async createQuestions(
    quiz: Quiz,
    questionsDto: CreateQuizQuestionDto[],
    manager: any,
  ): Promise<void> {
    for (const questionDto of questionsDto) {
      const { answers, ...questionData } = questionDto;
      
      // Create question entity
      const question = new QuizQuestion();
      Object.assign(question, questionData);
      question.quiz = quiz;
      
      // Save question
      await manager.save(question);
      
      // Create and save answers
      const quizAnswers = answers.map(answerDto => {
        const answer = new QuizAnswer();
        Object.assign(answer, answerDto);
        answer.question = question;
        return answer;
      });
      
      await manager.save(quizAnswers);
    }