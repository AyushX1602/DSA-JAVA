import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

describe('TripStopsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;
  let tripId: string;
  let tripStopId: string;

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

    // Create a test user and get auth token with unique email
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${timestamp}@example.com`,
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
        name: 'Test Trip for Stops',
        description: 'Trip to test stop functionality',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-10'),
        budget: 0,
        owner: {
          connect: { id: userId },
        },
      },
    });
    tripId = testTrip.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.tripStop.deleteMany({ where: { tripId } });
    await prisma.trip.delete({ where: { id: tripId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('/trips/:tripId/stops (POST)', () => {
    it('should create a trip stop successfully', async () => {
      const createTripStopDto = {
        city: 'Tokyo',
        startDate: '2025-09-02T00:00:00.000Z',
        endDate: '2025-09-04T00:00:00.000Z',
        notes: 'Visit Tokyo and explore the city',
      };

      const response = await request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tripId');
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');

      // Store the created trip stop ID for subsequent tests
      const createdTripStop = await prisma.tripStop.findFirst({
        where: {
          tripId,
          city: createTripStopDto.city,
        },
        orderBy: { createdAt: 'desc' },
      });
      tripStopId = createdTripStop.id;
    });

    it('should create a trip stop with cityId', () => {
      const createTripStopDto = {
        cityId: 1,
        startDate: '2025-09-05T00:00:00.000Z',
        endDate: '2025-09-07T00:00:00.000Z',
        notes: 'Visit Kyoto temples',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should create a trip stop with minimal required fields', () => {
      const createTripStopDto = {
        startDate: '2025-09-08T00:00:00.000Z',
        endDate: '2025-09-09T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should reject trip stop with endDate before startDate', () => {
      const createTripStopDto = {
        city: 'Invalid Stop',
        startDate: '2025-09-04T00:00:00.000Z',
        endDate: '2025-09-02T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop with same start and end date', () => {
      const createTripStopDto = {
        city: 'Same Date Stop',
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-03T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop without startDate', () => {
      const createTripStopDto = {
        city: 'No Start Date',
        endDate: '2025-09-04T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop without endDate', () => {
      const createTripStopDto = {
        city: 'No End Date',
        startDate: '2025-09-03T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop with city longer than 100 characters', () => {
      const createTripStopDto = {
        city: 'A'.repeat(101),
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-04T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop with notes longer than 500 characters', () => {
      const createTripStopDto = {
        city: 'Long Notes',
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-04T00:00:00.000Z',
        notes: 'A'.repeat(501),
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(400);
    });

    it('should reject trip stop without authorization', () => {
      const createTripStopDto = {
        city: 'Unauthorized Stop',
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-04T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${tripId}/stops`)
        .send(createTripStopDto)
        .expect(401);
    });

    it('should reject trip stop for non-existent trip', () => {
      const fakeTripId = 'fake-trip-id-12345';
      const createTripStopDto = {
        city: 'Fake Trip Stop',
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-04T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${fakeTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(404);
    });
  });

  describe('/trips/:tripId/stops (GET)', () => {
    it('should return all trip stops for a trip', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('tripId');
          expect(res.body[0]).toHaveProperty('startDate');
          expect(res.body[0]).toHaveProperty('endDate');
        });
    });

    it('should reject request without authorization', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops`)
        .expect(401);
    });

    it('should reject request for non-existent trip', () => {
      const fakeTripId = 'fake-trip-id-12345';
      return request(app.getHttpServer())
        .get(`/trips/${fakeTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/trips/:tripId/stops/:id (GET)', () => {
    it('should return trip stop details', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(tripStopId);
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('cityId');
          expect(res.body).toHaveProperty('city');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
          expect(res.body).toHaveProperty('notes');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent trip stop', () => {
      const fakeId = 'fake-stop-id-12345';
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Stop not found');
        });
    });

    it('should reject request without authorization', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops/${tripStopId}`)
        .expect(401);
    });
  });

  describe('/trips/:tripId/stops/:id (PATCH)', () => {
    it('should update trip stop city', () => {
      const updateDto = {
        city: 'Updated City',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should update trip stop dates', () => {
      const updateDto = {
        startDate: '2025-09-03T00:00:00.000Z',
        endDate: '2025-09-05T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should update trip stop notes', () => {
      const updateDto = {
        notes: 'Updated notes for this stop',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should update multiple fields', () => {
      const updateDto = {
        city: 'Final City',
        notes: 'Final notes',
        cityId: 2,
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('tripId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
        });
    });

    it('should reject update with invalid dates', () => {
      const updateDto = {
        startDate: '2025-09-05T00:00:00.000Z',
        endDate: '2025-09-03T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject update with city longer than 100 characters', () => {
      const updateDto = {
        city: 'A'.repeat(101),
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject update with notes longer than 500 characters', () => {
      const updateDto = {
        notes: 'A'.repeat(501),
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject update of non-existent trip stop', () => {
      const fakeId = 'fake-stop-id-12345';
      const updateDto = { city: 'Updated City' };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });

    it('should reject request without authorization', () => {
      const updateDto = { city: 'Unauthorized Update' };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}/stops/${tripStopId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('/trips/:tripId/stops/:id (DELETE)', () => {
    it('should delete trip stop successfully', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 when trying to get deleted trip stop', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}/stops/${tripStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Stop not found');
        });
    });

    it('should reject delete of non-existent trip stop', () => {
      const fakeId = 'fake-stop-id-12345';
      return request(app.getHttpServer())
        .delete(`/trips/${tripId}/stops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject delete request without authorization', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${tripId}/stops/${tripStopId}`)
        .expect(401);
    });
  });

  describe('Authorization and Access Control', () => {
    let otherUserTripId: string;
    let otherUserStopId: string;
    let otherUserId: string;

    beforeAll(async () => {
      // Create another test user with unique email
      const timestamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: `other-${timestamp}@example.com`,
          passwordHash: 'hashedpassword',
          role: 'USER',
        },
      });

      // Create a trip for the other user
      const otherUserTrip = await prisma.trip.create({
        data: {
          name: 'Other User Trip',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-10'),
          budget: 0,
          owner: {
            connect: { id: otherUser.id },
          },
        },
      });
      otherUserTripId = otherUserTrip.id;
      otherUserId = otherUser.id;

      // Create a trip stop for the other user
      const otherUserStop = await prisma.tripStop.create({
        data: {
          tripId: otherUserTripId,
          city: 'Other User Stop',
          startDate: new Date('2025-10-02'),
          endDate: new Date('2025-10-04'),
        },
      });
      otherUserStopId = otherUserStop.id;
    });

    afterAll(async () => {
      // Clean up other user data
      await prisma.tripStop.delete({ where: { id: otherUserStopId } });
      await prisma.trip.delete({ where: { id: otherUserTripId } });
      // Note: We can't easily get the email here, so we'll delete by ID
      await prisma.user.delete({ where: { id: otherUserId } });
    });

    it('should reject access to other user trip stops list', () => {
      return request(app.getHttpServer())
        .get(`/trips/${otherUserTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Access denied');
        });
    });

    it('should reject access to other user trip stop', () => {
      return request(app.getHttpServer())
        .get(`/trips/${otherUserTripId}/stops/${otherUserStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Access denied');
        });
    });

    it('should reject update of other user trip stop', () => {
      const updateDto = { city: 'Unauthorized Update' };

      return request(app.getHttpServer())
        .patch(`/trips/${otherUserTripId}/stops/${otherUserStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should reject delete of other user trip stop', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${otherUserTripId}/stops/${otherUserStopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should reject creation of trip stop in other user trip', () => {
      const createTripStopDto = {
        city: 'Unauthorized Creation',
        startDate: '2025-10-03T00:00:00.000Z',
        endDate: '2025-10-05T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post(`/trips/${otherUserTripId}/stops`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripStopDto)
        .expect(403);
    });
  });
});
