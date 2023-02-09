import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  getUserInfo(userInfo: User) {
    return userInfo;
  }

  async editUserInf(userId: number, editDto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...editDto },
    });
    delete user.hash;
    return user;
  }
}
