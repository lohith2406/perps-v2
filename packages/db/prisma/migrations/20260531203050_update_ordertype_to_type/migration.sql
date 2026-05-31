/*
  Warnings:

  - You are about to drop the column `orderType` on the `Order` table. All the data in the column will be lost.
  - Added the required column `type` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderType",
ADD COLUMN     "type" "OrderType" NOT NULL,
ALTER COLUMN "slippage" DROP NOT NULL;
