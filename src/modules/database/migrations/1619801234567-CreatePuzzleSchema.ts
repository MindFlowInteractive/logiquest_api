import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePuzzleSchema1619801234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Categories table
    await queryRunner.query(`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tags table
    await queryRunner.query(`
      CREATE TABLE tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Difficulties table
    await queryRunner.query(`
      CREATE TABLE difficulties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        level INTEGER NOT NULL,
        description TEXT,
        UNIQUE(level)
      );
    `);

    // Puzzles table
    await queryRunner.query(`
      CREATE TABLE puzzles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id),
        difficulty_id INTEGER NOT NULL REFERENCES difficulties(id),
        is_active BOOLEAN DEFAULT TRUE,
        total_solves INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0,
        current_version INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_puzzles_category_active ON puzzles(category_id, is_active);
      CREATE INDEX idx_puzzles_difficulty_active ON puzzles(difficulty_id, is_active);
    `);

    // Puzzle Tags join table
    await queryRunner.query(`
      CREATE TABLE puzzle_tags (
        puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (puzzle_id, tag_id)
      );
    `);

    // Puzzle Versions table
    await queryRunner.query(`
      CREATE TABLE puzzle_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        change_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        UNIQUE(puzzle_id, version_number)
      );
      
      CREATE INDEX idx_puzzle_versions ON puzzle_versions(puzzle_id, version_number);
    `);

    // Puzzle Translations table
    await queryRunner.query(`
      CREATE TABLE puzzle_translations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        language_code VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        translator_id VARCHAR(255),
        UNIQUE(puzzle_id, language_code)
      );
      
      CREATE INDEX idx_puzzle_translations ON puzzle_translations(puzzle_id, language_code);
    `);

    // Solution Validations table
    await queryRunner.query(`
      CREATE TABLE solution_validations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        validation_type VARCHAR(20) NOT NULL,
        validation_data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_solution_validations ON solution_validations(puzzle_id);
    `);

    // User Puzzle Progress table
    await queryRunner.query(`
      CREATE TABLE user_puzzle_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        attempt_count INTEGER,
        current_progress JSONB,
        completed_at TIMESTAMP,
        user_rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, puzzle_id)
      );
      
      CREATE INDEX idx_user_puzzle_progress ON user_puzzle_progress(user_id, puzzle_id);
    `);

    // Insert default difficulties
    await queryRunner.query(`
      INSERT INTO difficulties (name, level, description) VALUES
      ('Beginner', 1, 'Simple puzzles suitable for newcomers'),
      ('Easy', 2, 'Straightforward puzzles with basic concepts'),
      ('Medium', 3, 'Moderately challenging puzzles'),
      ('Hard', 4, 'Difficult puzzles requiring advanced reasoning'),
      ('Expert', 5, 'Very challenging puzzles for experienced solvers');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_puzzle_progress;`);
    await queryRunner.query(`DROP TABLE IF EXISTS solution_validations;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puzzle_translations;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puzzle_versions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puzzle_tags;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puzzles;`);
    await queryRunner.query(`DROP TABLE IF EXISTS difficulties;`);
    await queryRunner.query(`DROP TABLE IF EXISTS tags;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories;`);
  }
}