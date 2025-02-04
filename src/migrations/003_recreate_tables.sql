-- Drop existing tables in correct order
DROP TABLE IF EXISTS "BatchStudent" CASCADE;
DROP TABLE IF EXISTS "Batch" CASCADE;
DROP TABLE IF EXISTS "StudentProfile" CASCADE;
DROP TABLE IF EXISTS "TrainerProfile" CASCADE;
DROP TABLE IF EXISTS "AdminProfile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile BIGINT NOT NULL,
    category VARCHAR(255) NOT NULL CHECK (category IN ('Admin', 'Trainer', 'Student')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create AdminProfile table
CREATE TABLE "AdminProfile" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL CHECK (role IN ('SuperAdmin', 'SubAdmin')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create TrainerProfile table
CREATE TABLE "TrainerProfile" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL CHECK (role IN ('SrTrainer', 'JrTrainer')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create StudentProfile table
CREATE TABLE "StudentProfile" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    "courseTitle" VARCHAR(255) NOT NULL,
    "learningMode" VARCHAR(255) NOT NULL CHECK ("learningMode" IN ('Online', 'Offline')),
    "feeDetail" VARCHAR(255) NOT NULL,
    "paymentMode" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create Batch table
CREATE TABLE "Batch" (
    id SERIAL PRIMARY KEY,
    "profileImage" VARCHAR(255),
    "trainerRole" VARCHAR(255) CHECK ("trainerRole" IN ('SrTrainer', 'JrTrainer')),
    "trainerName" VARCHAR(255) NOT NULL,
    "courseTitle" VARCHAR(255) NOT NULL,
    "studyMaterial" VARCHAR(255),
    "batchStartDate" TIMESTAMP NOT NULL,
    "batchEndDate" TIMESTAMP NOT NULL,
    "batchTimings" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create BatchStudent junction table
CREATE TABLE "BatchStudent" (
    id SERIAL PRIMARY KEY,
    "batchId" INTEGER REFERENCES "Batch"(id) ON DELETE CASCADE,
    "studentId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("batchId", "studentId")
); 