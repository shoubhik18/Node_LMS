-- Drop the existing Batch table if it exists
DROP TABLE IF EXISTS "BatchStudent";
DROP TABLE IF EXISTS "Batch";

-- Recreate the Batch table with correct schema
CREATE TABLE "Batch" (
    id SERIAL PRIMARY KEY,
    "profileImage" VARCHAR(255),
    "trainerRole" VARCHAR(255),
    "trainerName" VARCHAR(255) NOT NULL,
    "courseTitle" VARCHAR(255) NOT NULL,
    "studyMaterial" VARCHAR(255),
    "batchStartDate" TIMESTAMP NOT NULL,
    "batchEndDate" TIMESTAMP NOT NULL,
    "batchTimings" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Recreate the junction table
CREATE TABLE "BatchStudent" (
    id SERIAL PRIMARY KEY,
    "batchId" INTEGER REFERENCES "Batch"(id) ON DELETE CASCADE,
    "studentId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("batchId", "studentId")
); 