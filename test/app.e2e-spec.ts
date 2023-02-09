import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto, LoginDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, UpdateBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: AuthDto = {
        email: 'khna@gmail.com',
        password: 'test123123',
        firstName: 'Khan',
      };
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if request body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });
    describe('Login', () => {
      const dto: LoginDto = {
        email: 'khna@gmail.com',
        password: 'test123123',
      };
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if request body is empty', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
      // it('should throw if invalid token', () => {
      //   return pactum
      //     .spec()
      //     .get('/users/me')
      //     .withHeaders({
      //       Authorization: 'Bearer $S{userAt}test',
      //     })
      //     .expectStatus(401);
      // });
      // it('should throw if no token', () => {
      //   return pactum.spec().get('/users/me').expectStatus(401);
      // });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        email: 'ozair@gmail.com',
        firstName: 'Ozair',
        lastName: 'Farahi',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectStatus(200)
          .expectBodyContains(dto.lastName)
          .expectStatus(200)
          .expectBodyContains(dto.email);
      });
    });
  });
  describe('Bookmarks', () => {
    const dto: CreateBookmarkDto = {
      title: 'test',
      description: 'description test',
      link: 'https://ozair.tech',
    };
    describe('Get empty bookmarks', () => {
      it('should get empty bookmark list', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmarks', () => {
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .stores('bookmarkId', 'id')
          .expectStatus(201);
      });
    });
    describe('Get self bookmarks', () => {
      it('should get self bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get self bookmark by id', () => {
      it('should get self bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit self bookmark by id', () => {
      const updateDto: UpdateBookmarkDto = {
        title: 'test updated',
      };
      it('should update self bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withBody(updateDto)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(updateDto.title);
      });
    });
    describe('Delete self bookmark by id', () => {
      it('should delete self bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
  });
});
