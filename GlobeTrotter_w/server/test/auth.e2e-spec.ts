import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Clean DB
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/signup should create a user and return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        phoneNumber: '1234567890',
        city: 'Test City',
        country: 'Test Country',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.success).toBe(true);
  });

  it('POST /auth/login should return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.message).toBe('Login successful');
    expect(res.body.success).toBe(true);
  });

  it('GET /auth/me should return current user with JWT', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' })
      .expect(201);

    const token = login.body.accessToken;

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.email).toBe('user@example.com');
    expect(me.body.role).toBe('USER');
  });

  it('GET /auth/admin should be forbidden for USER and allowed for ADMIN', async () => {
    // user token
    const loginUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' })
      .expect(201);

    const tokenUser = loginUser.body.accessToken;

    await request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${tokenUser}`)
      .expect(403);

    // create admin directly in DB with a valid bcrypt hash
    const adminPassword = 'AdminPass123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'ADMIN',
      },
    });

    // login as admin and access admin route
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: adminPassword })
      .expect(201);

    const tokenAdmin = adminLogin.body.accessToken;

    await request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
  });

  it('PUT /auth/profile should update user profile', async () => {
    // Create a fresh user for this test
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Profile Test User',
        email: 'profile-test@example.com',
        phoneNumber: '1234567890',
        city: 'Test City',
        country: 'Test Country',
        password: 'Password123!',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'profile-test@example.com', password: 'Password123!' })
      .expect(201);

    const token = login.body.accessToken;

    const updateRes = await request(app.getHttpServer())
      .put('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Test User',
        phoneNumber: '9876543210',
        city: 'Updated City',
        country: 'Updated Country',
      })
      .expect(200);

    expect(updateRes.body.message).toBe('Profile updated successfully');
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.user.name).toBe('Updated Test User');
    expect(updateRes.body.user.phoneNumber).toBe('9876543210');
    expect(updateRes.body.user.city).toBe('Updated City');
    expect(updateRes.body.user.country).toBe('Updated Country');

    // Verify the update persisted by checking /auth/me
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.name).toBe('Updated Test User');
    expect(me.body.phoneNumber).toBe('9876543210');
    expect(me.body.city).toBe('Updated City');
    expect(me.body.country).toBe('Updated Country');
  });
});
