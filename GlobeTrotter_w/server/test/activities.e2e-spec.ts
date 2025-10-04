import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

describe('ActivitiesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;
  let tripId: string;
  let tripStopId: string;
  let placeId: string;
  let activityId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create a test user and get auth token with unique email
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-activities-${timestamp}@example.com`,
        passwordHash: 'hashedpassword',
        role: 'USER',
      },
    });
    userId = testUser.id;

    // Create JWT token
    authToken = jwtService.sign({
      sub: userId,
      email: testUser.email,
      role: testUser.role,
    });

    // Create a test trip for the user
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Trip for Activities',
        description: 'Trip to test activities functionality',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-10'),
        budget: 0,
        owner: {
          connect: { id: userId },
        },
      },
    });
    tripId = testTrip.id;

    // Create a test trip stop
    const createTripStopDto = {
      city: 'Test City',
      startDate: '2025-09-02T00:00:00.000Z',
      endDate: '2025-09-04T00:00:00.000Z',
      notes: 'Test stop notes',
    };
    const testTripStop = await prisma.tripStop.create({
      data: {
        tripId: tripId,
        ...createTripStopDto,
      },
    });
    tripStopId = testTripStop.id;

    // Create a test place
    const testPlace = await prisma.place.create({
      data: {
        tripStopId: tripStopId,
        name: 'Test Place for Activities',
        latitude: 40.7128,
        longitude: -74.006,
      },
    });
    placeId = testPlace.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.activity.deleteMany({ where: { placeId } });
    await prisma.place.deleteMany({ where: { tripStopId } });
    await prisma.tripStop.deleteMany({ where: { tripId } });
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  describe('/places/:placeId/activities (POST)', () => {
    it('should create a new activity', () => {
      return request(app.getHttpServer())
        .post(`/places/${placeId}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Activity',
          description: 'Test activity description',
          expense: 25.5,
          startTime: '2025-09-02T10:00:00.000Z',
          endTime: '2025-09-02T12:00:00.000Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Activity');
          expect(res.body.expense).toBe(25.5);
          expect(res.body.startTime).toBe('2025-09-02T10:00:00.000Z');
          expect(res.body.endTime).toBe('2025-09-02T12:00:00.000Z');
          activityId = res.body.id;
        });
    });

    it('should reject overlapping activity times', () => {
      return request(app.getHttpServer())
        .post(`/places/${placeId}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Overlapping Activity',
          description: 'This should fail due to time conflict',
          expense: 15.0,
          startTime: '2025-09-02T11:00:00.000Z', // Overlaps with previous activity
          endTime: '2025-09-02T13:00:00.000Z',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('time conflicts');
        });
    });
  });

  describe('/places/:placeId/activities (GET)', () => {
    it('should return all activities for a place', () => {
      return request(app.getHttpServer())
        .get(`/places/${placeId}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('expense');
        });
    });
  });

  describe('/places/:placeId/activities/:id (GET)', () => {
    it('should return a specific activity', () => {
      return request(app.getHttpServer())
        .get(`/places/${placeId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', activityId);
          expect(res.body).toHaveProperty('title', 'Test Activity');
        });
    });
  });

  describe('/places/:placeId/activities/:id (PATCH)', () => {
    it('should update an activity', () => {
      return request(app.getHttpServer())
        .patch(`/places/${placeId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Activity',
          expense: 30.0,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Test Activity');
          expect(res.body.expense).toBe(30.0);
        });
    });
  });

  describe('/places/:placeId/activities/:id (DELETE)', () => {
    it('should delete an activity', () => {
      return request(app.getHttpServer())
        .delete(`/places/${placeId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
