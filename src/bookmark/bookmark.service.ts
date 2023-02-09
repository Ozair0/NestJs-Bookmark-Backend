import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async create(createBookmarkDto: CreateBookmarkDto, userId: number) {
    const bookmark = await this.prisma.bookmark.create({
      data: { ...createBookmarkDto, userId },
    });
    return bookmark;
  }

  async findAll(userId: number) {
    const bookmarks = this.prisma.bookmark.findMany({ where: { userId } });
    return bookmarks;
  }

  async findOne(id: number, userId: number) {
    const bookmarks = this.prisma.bookmark.findFirst({ where: { id, userId } });
    return bookmarks;
  }

  async update(
    id: number,
    updateBookmarkDto: UpdateBookmarkDto,
    userId: number,
  ) {
    const bookmarkUpdated = await this.prisma.bookmark.findUnique({
      where: { id },
    });
    if (!bookmarkUpdated || bookmarkUpdated.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    return this.prisma.bookmark.update({
      where: { id },
      data: { ...updateBookmarkDto },
    });
  }

  async remove(id: number, userId: number) {
    const deletedBookmark = await this.prisma.bookmark.findUnique({
      where: { id },
    });
    if (!deletedBookmark || deletedBookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    return this.prisma.bookmark.delete({
      where: { id },
    });
  }
}
