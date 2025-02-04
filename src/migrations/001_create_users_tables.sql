-- Create ENUMs
CREATE TYPE user_category AS ENUM ('Admin', 'Trainer', 'Student');
CREATE TYPE admin_role AS ENUM ('SuperAdmin', 'SubAdmin');
CREATE TYPE trainer_role AS ENUM ('SrTrainer', 'JrTrainer');
CREATE TYPE learning_mode AS ENUM ('Online', 'Offline');

-- Base users table with common fields
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile BIGINT NOT NULL,
    category user_category NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin-specific profile table
CREATE TABLE admin_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role admin_role NOT NULL
);

-- Trainer-specific profile table
CREATE TABLE trainer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role trainer_role NOT NULL
);

-- Student-specific profile table
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    learning_mode learning_mode NOT NULL,
    fee_detail VARCHAR(255) NOT NULL,
    payment_mode VARCHAR(255) NOT NULL
);

-- Create junction table for Batch-Student relationship
CREATE TABLE batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, student_id)
);