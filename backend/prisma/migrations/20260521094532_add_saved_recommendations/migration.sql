-- CreateTable
CREATE TABLE "saved_recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "saved_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_recommendations_user_id_department_id_key" ON "saved_recommendations"("user_id", "department_id");

-- AddForeignKey
ALTER TABLE "saved_recommendations" ADD CONSTRAINT "saved_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_recommendations" ADD CONSTRAINT "saved_recommendations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
