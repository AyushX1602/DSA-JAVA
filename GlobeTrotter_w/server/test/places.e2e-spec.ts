import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

describe('PlacesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;
  let tripId: string;
  let tripStopId: string;
  let placeId: string;

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
        email: `test-places-${timestamp}@example.com`,
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
        name: 'Test Trip for Places',
        description: 'Trip to test places functionality',
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
      data: createTripStopDto,
    });
    tripStopId = testTripStop.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.place.deleteMany({ where: { tripStopId } });
    await prisma.tripStop.deleteMany({ where: { tripId } });
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  describe('/trip-stops/:tripStopId/places (POST)', () => {
    it('should create a new place with coordinates', () => {
      return request(app.getHttpServer())
        .post(`/trip-stops/${tripStopId}/places`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Place',
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Place');
          expect(res.body.latitude).toBe(40.7128);
          expect(res.body.longitude).toBe(-74.006);
          placeId = res.body.id;
        });
    });

    it('should create a new place without coordinates (auto-generated)', () => {
      return request(app.getHttpServer())
        .post(`/trip-stops/${tripStopId}/places`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Eiffel Tower',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Eiffel Tower');
          // Coordinates may be null if geocoding fails or API key is not configured
          expect(res.body).toHaveProperty('latitude');
          expect(res.body).toHaveProperty('longitude');
        });
    });
  });

  describe('/trip-stops/:tripStopId/places (GET)', () => {
    it('should return all places for a trip stop', () => {
      return request(app.getHttpServer())
        .get(`/trip-stops/${tripStopId}/places`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('totalExpense');
          expect(res.body[0]).toHaveProperty('activities');
        });
    });
  });

  describe('/trip-stops/:tripStopId/places/:id (GET)', () => {
    it('should return a specific place', () => {
      return request(app.getHttpServer())
        .get(`/trip-stops/${tripStopId}/places/${placeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', placeId);
          expect(res.body).toHaveProperty('name', 'Test Place');
        });
    });
  });

  describe('/trip-stops/:tripStopId/places/:id (PATCH)', () => {
    it('should update a place', () => {
      return request(app.getHttpServer())
        .patch(`/trip-stops/${tripStopId}/places/${placeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Place',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Test Place');
        });
    });
  });

  describe('/trip-stops/:tripStopId/places/:id (DELETE)', () => {
    it('should delete a place', () => {
      return request(app.getHttpServer())
        .delete(`/trip-stops/${tripStopId}/places/${placeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
