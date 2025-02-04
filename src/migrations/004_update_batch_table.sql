-- Drop existing tables
DROP TABLE IF EXISTS "BatchStudent" CASCADE;
DROP TABLE IF EXISTS "Batch" CASCADE;

-- Create updated Batch table
CREATE TABLE "Batch" (
    id SERIAL PRIMARY KEY,
    "profileImage" VARCHAR(255),
    "trainerId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "courseTitle" VARCHAR(255) NOT NULL,
    "studyMaterial" VARCHAR(255),
    "batchStartDate" TIMESTAMP NOT NULL,
    "batchEndDate" TIMESTAMP NOT NULL,
    "batchTimings" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Recreate BatchStudent junction table
CREATE TABLE "BatchStudent" (
    id SERIAL PRIMARY KEY,
    "batchId" INTEGER REFERENCES "Batch"(id) ON DELETE CASCADE,
    "studentId" INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("batchId", "studentId")
); 