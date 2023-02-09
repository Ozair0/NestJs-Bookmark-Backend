import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() req: User) {
    return this.userService.getUserInfo(req);
  }

  @Patch()
  editUser(@GetUser() req: User, @Body() dto: EditUserDto) {
    return this.userService.editUserInf(req.id, dto);
  }
}
