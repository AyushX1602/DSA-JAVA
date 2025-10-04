import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Admin API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let regularUserId: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Clean database
    await prisma.activity.deleteMany();
    await prisma.place.deleteMany();
    await prisma.tripStop.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        city: 'Admin City',
        country: 'Admin Country',
      },
    });
    adminUserId = adminUser.id;

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await prisma.user.create({
      data: {
        name: 'Regular User',
        email: 'user@test.com',
        passwordHash: userPassword,
        role: 'USER',
        city: 'User City',
        country: 'User Country',
      },
    });
    regularUserId = regularUser.id;

    // Generate tokens
    adminToken = jwtService.sign({
      sub: adminUserId,
      email: adminUser.email,
      role: 'ADMIN',
    });

    userToken = jwtService.sign({
      sub: regularUserId,
      email: regularUser.email,
      role: 'USER',
    });

    // Create additional test users for analytics
    const testUsers = [
      {
        name: 'John Smith',
        email: 'john@test.com',
        city: 'New York',
        country: 'USA',
      },
      {
        name: 'Emma Wilson',
        email: 'emma@test.com',
        city: 'London',
        country: 'UK',
      },
      {
        name: 'Raj Patel',
        email: 'raj@test.com',
        city: 'Mumbai',
        country: 'India',
      },
    ];

    for (const userData of testUsers) {
      const password = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          ...userData,
          passwordHash: password,
          role: 'USER',
        },
      });
    }

    // Create some trips for analytics
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        description: 'Test trip for analytics',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        currency: 'USD',
        ownerId: regularUserId,
      },
    });

    // Create trip stop and place for activities
    const tripStop = await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        country: 'USA',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      },
    });

    const place = await prisma.place.create({
      data: {
        tripStopId: tripStop.id,
        name: 'Test Place',
        latitude: 40.7128,
        longitude: -74.006,
      },
    });

    // Create activity for expense analytics
    await prisma.activity.create({
      data: {
        placeId: place.id,
        title: 'Test Activity',
        description: 'Test activity for analytics',
        expense: 100.5,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T12:00:00Z'),
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication & Authorization', () => {
    it('should deny access to admin routes for unauthenticated users', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should deny access to admin routes for regular users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow access to admin routes for admin users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /users', () => {
    it('should return paginated list of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);

      // Check user data structure
      const user = response.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('passwordHash'); // Should be excluded
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(2);
    });

    it('should support search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.users[0].name).toContain('Admin');
    });
  });

  describe('GET /users/stats', () => {
    it('should return user statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalAdmins');
      expect(response.body).toHaveProperty('totalActiveUsers');
      expect(response.body).toHaveProperty('recentSignups');
      expect(response.body).toHaveProperty('usersByMonth');
      expect(response.body).toHaveProperty('usersByCountry');

      expect(typeof response.body.totalUsers).toBe('number');
      expect(Array.isArray(response.body.usersByMonth)).toBe(true);
      expect(Array.isArray(response.body.usersByCountry)).toBe(true);
    });
  });

  describe('GET /users/analytics/trips', () => {
    it('should return trip analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/analytics/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTrips');
      expect(response.body).toHaveProperty('averageTripsPerUser');
      expect(response.body).toHaveProperty('totalActivities');
      expect(response.body).toHaveProperty('totalExpenses');
      expect(response.body).toHaveProperty('tripsByMonth');

      expect(typeof response.body.totalTrips).toBe('number');
      expect(typeof response.body.totalActivities).toBe('number');
      expect(typeof response.body.totalExpenses).toBe('number');
      expect(Array.isArray(response.body.tripsByMonth)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New Test User',
        email: 'newuser@test.com',
        password: 'password123',
        city: 'Test City',
        country: 'Test Country',
        role: 'USER',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.role).toBe(newUser.role);
      expect(response.body).not.toHaveProperty('passwordHash');

      testUserId = response.body.id;
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: 'Invalid User',
        // missing email and password
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);
    });

    it('should prevent duplicate emails', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: 'admin@test.com', // Already exists
        password: 'password123',
        role: 'USER',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser)
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
      expect(response.body.name).toBe('New Test User');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user information', async () => {
      const updateData = {
        name: 'Updated User Name',
        city: 'Updated City',
        role: 'ADMIN',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.city).toBe(updateData.city);
      expect(response.body.role).toBe(updateData.role);
    });

    it('should prevent updating to duplicate email', async () => {
      const updateData = {
        email: 'admin@test.com', // Already exists
      };

      await request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app.getHttpServer())
        .put('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity when deleting users with trips', async () => {
      // Create user with trip
      const userWithTrip = await prisma.user.create({
        data: {
          name: 'User With Trip',
          email: 'userwithtrip@test.com',
          passwordHash: await bcrypt.hash('password', 10),
          role: 'USER',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'User Trip',
          description: 'Trip belonging to user',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-10'),
          currency: 'USD',
          ownerId: userWithTrip.id,
        },
      });

      // Delete user should cascade delete trips
      await request(app.getHttpServer())
        .delete(`/users/${userWithTrip.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify trip is also deleted (due to CASCADE)
      const deletedTrip = await prisma.trip.findUnique({
        where: { id: trip.id },
      });
      expect(deletedTrip).toBeNull();
    });
  });
});
