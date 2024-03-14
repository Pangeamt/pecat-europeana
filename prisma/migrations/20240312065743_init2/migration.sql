/*
  Warnings:

  - You are about to alter the column `hash` on the `tus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `tus` MODIFY `hash` INTEGER NOT NULL;
