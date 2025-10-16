-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "openToRemote" BOOLEAN NOT NULL DEFAULT true,
    "openToRelocation" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "resumeFileName" TEXT,
    "resumeUploadedAt" TIMESTAMP(3),
    "currentRole" TEXT,
    "yearsOfExperience" INTEGER,
    "experienceSummary" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primarySkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "degree" TEXT,
    "school" TEXT,
    "graduationYear" INTEGER,
    "desiredRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "desiredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "employmentTypes" "EmploymentType"[] DEFAULT ARRAY[]::"EmploymentType"[],
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "completionScore" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isSearchable" BOOLEAN NOT NULL DEFAULT true,
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "personalWebsite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_isSearchable_idx" ON "UserProfile"("isSearchable");

-- CreateIndex
CREATE INDEX "UserProfile_completionScore_idx" ON "UserProfile"("completionScore");

-- CreateIndex
CREATE INDEX "UserProfile_location_idx" ON "UserProfile"("location");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
