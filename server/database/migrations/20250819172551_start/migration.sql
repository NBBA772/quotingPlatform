/*
  Warnings:

  - You are about to drop the column `coverImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Ad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdImpression` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Books` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chapters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CrossReference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Devotional` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Friendship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupPhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupVideo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HighlightedVerse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikedGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiveStream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lobby` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LobbyParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Place` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Polemics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrayerJournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuranAyah` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuranSurah` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuranTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WordTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GameTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdImpression" DROP CONSTRAINT "AdImpression_adId_fkey";

-- DropForeignKey
ALTER TABLE "AdImpression" DROP CONSTRAINT "AdImpression_gameId_fkey";

-- DropForeignKey
ALTER TABLE "AdImpression" DROP CONSTRAINT "AdImpression_userId_fkey";

-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_translationId_fkey";

-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_bookId_fkey";

-- DropForeignKey
ALTER TABLE "CrossReference" DROP CONSTRAINT "CrossReference_fromVerseId_fkey";

-- DropForeignKey
ALTER TABLE "CrossReference" DROP CONSTRAINT "CrossReference_toVerseId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_adId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_adminId_fkey";

-- DropForeignKey
ALTER TABLE "GroupComment" DROP CONSTRAINT "GroupComment_groupPostId_fkey";

-- DropForeignKey
ALTER TABLE "GroupComment" DROP CONSTRAINT "GroupComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupPhoto" DROP CONSTRAINT "GroupPhoto_groupPostId_fkey";

-- DropForeignKey
ALTER TABLE "GroupPhoto" DROP CONSTRAINT "GroupPhoto_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupPost" DROP CONSTRAINT "GroupPost_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupPost" DROP CONSTRAINT "GroupPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupReaction" DROP CONSTRAINT "GroupReaction_groupPostId_fkey";

-- DropForeignKey
ALTER TABLE "GroupReaction" DROP CONSTRAINT "GroupReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupVideo" DROP CONSTRAINT "GroupVideo_groupPostId_fkey";

-- DropForeignKey
ALTER TABLE "GroupVideo" DROP CONSTRAINT "GroupVideo_userId_fkey";

-- DropForeignKey
ALTER TABLE "HighlightedVerse" DROP CONSTRAINT "HighlightedVerse_userId_fkey";

-- DropForeignKey
ALTER TABLE "HighlightedVerse" DROP CONSTRAINT "HighlightedVerse_verseId_fkey";

-- DropForeignKey
ALTER TABLE "LikedGame" DROP CONSTRAINT "LikedGame_gameId_fkey";

-- DropForeignKey
ALTER TABLE "LikedGame" DROP CONSTRAINT "LikedGame_userId_fkey";

-- DropForeignKey
ALTER TABLE "LiveStream" DROP CONSTRAINT "LiveStream_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lobby" DROP CONSTRAINT "Lobby_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "LobbyParticipant" DROP CONSTRAINT "LobbyParticipant_lobbyId_fkey";

-- DropForeignKey
ALTER TABLE "LobbyParticipant" DROP CONSTRAINT "LobbyParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_verseId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_postId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_userId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_userId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_verseId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerJournalEntry" DROP CONSTRAINT "PrayerJournalEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuranAyah" DROP CONSTRAINT "QuranAyah_surahId_fkey";

-- DropForeignKey
ALTER TABLE "QuranAyah" DROP CONSTRAINT "QuranAyah_translationId_fkey";

-- DropForeignKey
ALTER TABLE "QuranSurah" DROP CONSTRAINT "QuranSurah_translationId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verses" DROP CONSTRAINT "Verses_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Verses" DROP CONSTRAINT "Verses_translationId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_userId_fkey";

-- DropForeignKey
ALTER TABLE "_GameTags" DROP CONSTRAINT "_GameTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameTags" DROP CONSTRAINT "_GameTags_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "coverImage";

-- DropTable
DROP TABLE "Ad";

-- DropTable
DROP TABLE "AdImpression";

-- DropTable
DROP TABLE "Books";

-- DropTable
DROP TABLE "Chapters";

-- DropTable
DROP TABLE "CrossReference";

-- DropTable
DROP TABLE "Devotional";

-- DropTable
DROP TABLE "Friendship";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupComment";

-- DropTable
DROP TABLE "GroupMember";

-- DropTable
DROP TABLE "GroupPhoto";

-- DropTable
DROP TABLE "GroupPost";

-- DropTable
DROP TABLE "GroupReaction";

-- DropTable
DROP TABLE "GroupVideo";

-- DropTable
DROP TABLE "HighlightedVerse";

-- DropTable
DROP TABLE "LikedGame";

-- DropTable
DROP TABLE "LiveStream";

-- DropTable
DROP TABLE "Lobby";

-- DropTable
DROP TABLE "LobbyParticipant";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "Photo";

-- DropTable
DROP TABLE "Place";

-- DropTable
DROP TABLE "Polemics";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PrayerJournalEntry";

-- DropTable
DROP TABLE "QuranAyah";

-- DropTable
DROP TABLE "QuranSurah";

-- DropTable
DROP TABLE "QuranTranslation";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "Translation";

-- DropTable
DROP TABLE "Verses";

-- DropTable
DROP TABLE "Video";

-- DropTable
DROP TABLE "WordTranslation";

-- DropTable
DROP TABLE "Workflow";

-- DropTable
DROP TABLE "_GameTags";
