/*
  Warnings:

  - You are about to drop the column `expectedDate` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `receivedDate` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `containerId` on the `items_containers` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `items_containers` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseIndex` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[container_id,item_id]` on the table `items_containers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `container_id` to the `items_containers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `items_containers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouse_index` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_name` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "items_containers" DROP CONSTRAINT "items_containers_containerId_fkey";

-- DropForeignKey
ALTER TABLE "items_containers" DROP CONSTRAINT "items_containers_itemId_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_userId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropIndex
DROP INDEX "items_containers_containerId_itemId_key";

-- AlterTable
ALTER TABLE "containers" DROP COLUMN "expectedDate",
DROP COLUMN "receivedDate",
ADD COLUMN     "expected_date" TIMESTAMP(3),
ADD COLUMN     "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "items_containers" DROP COLUMN "containerId",
DROP COLUMN "itemId",
ADD COLUMN     "container_id" INTEGER NOT NULL,
ADD COLUMN     "item_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "warehouseId",
DROP COLUMN "warehouseIndex",
ADD COLUMN     "warehouse_id" TEXT NOT NULL DEFAULT '024',
ADD COLUMN     "warehouse_index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "userId",
ADD COLUMN     "entity_id" INTEGER NOT NULL,
ADD COLUMN     "entity_name" TEXT NOT NULL,
ADD COLUMN     "entity_type" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "items_containers_container_id_item_id_key" ON "items_containers"("container_id", "item_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_containers" ADD CONSTRAINT "items_containers_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_containers" ADD CONSTRAINT "items_containers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
