-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hash" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "multiplier" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetParticipant" (
    "id" SERIAL NOT NULL,
    "tookProfit" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "betId" INTEGER NOT NULL,

    CONSTRAINT "BetParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bet_participant" ON "BetParticipant"("betId", "userId");

-- AddForeignKey
ALTER TABLE "BetParticipant" ADD CONSTRAINT "BetParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetParticipant" ADD CONSTRAINT "BetParticipant_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
