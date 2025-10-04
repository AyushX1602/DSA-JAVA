import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

describe('TripsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;
  let tripId: string;

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

    // Create a test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
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

    // Create a test trip that will be available for all tests
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Trip for All Tests',
        description: 'A trip created in beforeAll for testing',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-10'),
        budget: 0,
        isPublic: false, // Explicitly set as private
        owner: { connect: { id: userId } },
      },
    });
    tripId = testTrip.id;
  });

  afterAll(async () => {
    // Clean up test data
    await app.close();
  });

  describe('/trips (POST)', () => {
    it('should create a trip successfully', async () => {
      const createTripDto = {
        name: 'Japan 2025',
        description: 'Amazing trip to Japan',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
        budget: 0,
      };

      const response = await request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(201);

      expect(response.body.message).toBe('Trip created successfully');
      expect(response.body.success).toBe(true);

      // Verify the trip was created (tripId is already set in beforeAll)
      expect(response.body.id).toBeDefined();
    });

    it('should create a public trip successfully', async () => {
      const createTripDto = {
        name: 'Public Japan Adventure',
        description: 'A public trip to share with everyone',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
        budget: 0,
        isPublic: true,
      };

      const response = await request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(201);

      expect(response.body.message).toBe('Trip created successfully');
      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();

      // Verify the trip was created as public
      const createdTrip = await prisma.trip.findUnique({
        where: { id: response.body.id },
      });
      expect(createdTrip.isPublic).toBe(true);

      // Clean up
      await prisma.trip.delete({ where: { id: response.body.id } });
    });

    it('should create a private trip by default', async () => {
      const createTripDto = {
        name: 'Private Trip Test',
        description: 'A trip without isPublic flag',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
        budget: 0,
      };

      const response = await request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(201);

      expect(response.body.message).toBe('Trip created successfully');
      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();

      // Verify the trip was created as private (default)
      const createdTrip = await prisma.trip.findUnique({
        where: { id: response.body.id },
      });
      expect(createdTrip.isPublic).toBe(false);

      // Clean up
      await prisma.trip.delete({ where: { id: response.body.id } });
    });

    it('should reject trip with endDate before startDate', () => {
      const createTripDto = {
        name: 'Invalid Trip',
        startDate: '2025-09-10T00:00:00.000Z',
        endDate: '2025-09-01T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Start date must be before end date');
        });
    });

    it('should reject trip with same start and end date', () => {
      const createTripDto = {
        name: 'Same Date Trip',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-01T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Start date must be before end date');
        });
    });

    it('should reject trip without name', () => {
      const createTripDto = {
        description: 'Trip without name',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(400);
    });

    it('should reject trip with name longer than 120 characters', () => {
      const createTripDto = {
        name: 'A'.repeat(121),
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(400);
    });

    it('should reject trip without authorization', () => {
      const createTripDto = {
        name: 'Unauthorized Trip',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/trips')
        .send(createTripDto)
        .expect(401);
    });

    it('should create trip with default budget of 0', async () => {
      const createTripDto = {
        name: 'Default Budget Test Trip',
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTripDto)
        .expect(201);

      expect(response.body.message).toBe('Trip created successfully');
      expect(response.body.success).toBe(true);

      // Verify the trip was created with budget = 0
      const createdTrip = await prisma.trip.findFirst({
        where: {
          name: createTripDto.name,
          ownerId: userId,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(createdTrip).toBeTruthy();
      expect(Number(createdTrip.budget)).toBe(0);

      // Clean up
      await prisma.trip.delete({ where: { id: createdTrip.id } });
    });

    it('should automatically update trip budget when activities are added', async () => {
      // Create a test trip specifically for this test
      const testTrip = await prisma.trip.create({
        data: {
          name: 'Budget Test Trip',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 0,
          owner: { connect: { id: userId } },
        },
      });

      try {
        // Create a trip stop first
        const tripStop = await prisma.tripStop.create({
          data: {
            tripId: testTrip.id,
            city: 'Test City',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-10'),
          },
        });

        // Create a place
        const place = await prisma.place.create({
          data: {
            tripStopId: tripStop.id,
            name: 'Test Place',
          },
        });

        // Create an activity with expense using the API
        const createActivityDto = {
          title: 'Test Activity',
          description: 'Test activity description',
          expense: 100.5,
          startTime: '2025-09-02T10:00:00.000Z',
          endTime: '2025-09-02T12:00:00.000Z',
        };

        await request(app.getHttpServer())
          .post(`/places/${place.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createActivityDto)
          .expect(201);

        // Check that trip budget was updated
        const updatedTrip = await prisma.trip.findUnique({
          where: { id: testTrip.id },
        });

        expect(Number(updatedTrip.budget)).toBe(100.5);

        // Clean up
        await prisma.place.delete({ where: { id: place.id } });
        await prisma.tripStop.delete({ where: { id: tripStop.id } });
      } finally {
        // Clean up the test trip
        await prisma.trip.delete({ where: { id: testTrip.id } });
      }
    });

    it('should update trip budget when multiple activities are added', async () => {
      // Create a test trip specifically for this test
      const testTrip = await prisma.trip.create({
        data: {
          name: 'Multiple Activities Test Trip',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 0,
          owner: { connect: { id: userId } },
        },
      });

      try {
        // Create a trip stop first
        const tripStop = await prisma.tripStop.create({
          data: {
            tripId: testTrip.id,
            city: 'Test City',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-10'),
          },
        });

        // Create a place
        const place = await prisma.place.create({
          data: {
            tripStopId: tripStop.id,
            name: 'Test Place',
          },
        });

        // Create first activity
        const activity1Dto = {
          title: 'Activity 1',
          description: 'First activity',
          expense: 50.0,
          startTime: '2025-09-02T10:00:00.000Z',
          endTime: '2025-09-02T11:00:00.000Z',
        };

        await request(app.getHttpServer())
          .post(`/places/${place.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(activity1Dto)
          .expect(201);

        // Create second activity
        const activity2Dto = {
          title: 'Activity 2',
          description: 'Second activity',
          expense: 75.25,
          startTime: '2025-09-02T14:00:00.000Z',
          endTime: '2025-09-02T16:00:00.000Z',
        };

        await request(app.getHttpServer())
          .post(`/places/${place.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(activity2Dto)
          .expect(201);

        // Check that trip budget was updated to sum of both activities
        const updatedTrip = await prisma.trip.findUnique({
          where: { id: testTrip.id },
        });

        expect(Number(updatedTrip.budget)).toBe(125.25); // 50.00 + 75.25

        // Clean up
        await prisma.place.delete({ where: { id: place.id } });
        await prisma.tripStop.delete({ where: { id: tripStop.id } });
      } finally {
        // Clean up the test trip
        await prisma.trip.delete({ where: { id: testTrip.id } });
      }
    });

    it('should update trip budget when activity expense is updated', async () => {
      // Create a test trip specifically for this test
      const testTrip = await prisma.trip.create({
        data: {
          name: 'Activity Update Test Trip',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 0,
          owner: { connect: { id: userId } },
        },
      });

      try {
        // Create a trip stop first
        const tripStop = await prisma.tripStop.create({
          data: {
            tripId: testTrip.id,
            city: 'Test City',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-10'),
          },
        });

        // Create a place
        const place = await prisma.place.create({
          data: {
            tripStopId: tripStop.id,
            name: 'Test Place',
          },
        });

        // Create an activity with initial expense
        const createActivityDto = {
          title: 'Test Activity',
          description: 'Test activity description',
          expense: 100.0,
          startTime: '2025-09-02T10:00:00.000Z',
          endTime: '2025-09-02T12:00:00.000Z',
        };

        const response = await request(app.getHttpServer())
          .post(`/places/${place.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createActivityDto)
          .expect(201);

        const activityId = response.body.id;

        // Update the activity expense
        const updateActivityDto = {
          expense: 150.0,
        };

        await request(app.getHttpServer())
          .patch(`/places/${place.id}/activities/${activityId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateActivityDto)
          .expect(200);

        // Check that trip budget was updated to new expense amount
        const updatedTrip = await prisma.trip.findUnique({
          where: { id: testTrip.id },
        });

        expect(Number(updatedTrip.budget)).toBe(150.0);

        // Clean up
        await prisma.place.delete({ where: { id: place.id } });
        await prisma.tripStop.delete({ where: { id: tripStop.id } });
      } finally {
        // Clean up the test trip
        await prisma.trip.delete({ where: { id: testTrip.id } });
      }
    });

    it('should update trip budget when activity is deleted', async () => {
      // Create a test trip specifically for this test
      const testTrip = await prisma.trip.create({
        data: {
          name: 'Activity Delete Test Trip',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 0,
          owner: { connect: { id: userId } },
        },
      });

      try {
        // Create a trip stop first
        const tripStop = await prisma.tripStop.create({
          data: {
            tripId: testTrip.id,
            city: 'Test City',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-10'),
          },
        });

        // Create a place
        const place = await prisma.place.create({
          data: {
            tripStopId: tripStop.id,
            name: 'Test Place',
          },
        });

        // Create an activity with expense
        const createActivityDto = {
          title: 'Test Activity',
          description: 'Test activity description',
          expense: 200.0,
          startTime: '2025-09-02T10:00:00.000Z',
          endTime: '2025-09-02T12:00:00.000Z',
        };

        const response = await request(app.getHttpServer())
          .post(`/places/${place.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createActivityDto)
          .expect(201);

        const activityId = response.body.id;

        // Verify budget was updated
        let updatedTrip = await prisma.trip.findUnique({
          where: { id: testTrip.id },
        });
        expect(Number(updatedTrip.budget)).toBe(200.0);

        // Delete the activity
        await request(app.getHttpServer())
          .delete(`/places/${place.id}/activities/${activityId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Check that trip budget was reset to 0
        updatedTrip = await prisma.trip.findUnique({
          where: { id: testTrip.id },
        });
        expect(Number(updatedTrip.budget)).toBe(0);

        // Clean up
        await prisma.place.delete({ where: { id: place.id } });
        await prisma.tripStop.delete({ where: { id: tripStop.id } });
      } finally {
        // Clean up the test trip
        await prisma.trip.delete({ where: { id: testTrip.id } });
      }
    });
  });

  describe('/trips (GET)', () => {
    it('should return user trips with pagination', () => {
      return request(app.getHttpServer())
        .get('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('trips');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.trips)).toBe(true);
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(20);
          expect(res.body.pagination.total).toBeGreaterThanOrEqual(0);
          expect(res.body.pagination.pages).toBeGreaterThanOrEqual(0);
        });
    });

    it('should return trips with custom pagination', () => {
      return request(app.getHttpServer())
        .get('/trips?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
          expect(res.body.trips.length).toBeLessThanOrEqual(5);
        });
    });

    it('should return empty trips for non-existent page', () => {
      return request(app.getHttpServer())
        .get('/trips?page=999&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.trips.length).toBe(0);
          expect(res.body.pagination.page).toBe(999);
        });
    });

    it('should filter trips by name', async () => {
      // Create a trip with a specific name for testing
      const testTrip = await prisma.trip.create({
        data: {
          name: 'Unique Test Trip Name',
          startDate: new Date('2025-11-01'),
          endDate: new Date('2025-11-10'),
          budget: 0,
          owner: { connect: { id: userId } },
        },
      });

      try {
        const response = await request(app.getHttpServer())
          .get('/trips?name=Unique Test')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.trips.length).toBeGreaterThan(0);
        expect(
          response.body.trips.some((trip) => trip.name.includes('Unique Test')),
        ).toBe(true);
      } finally {
        // Clean up test trip
        await prisma.trip.delete({ where: { id: testTrip.id } });
      }
    });

    it('should filter trips by start date', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?startDate=2025-01-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should have start date >= 2025-01-01
      response.body.trips.forEach((trip) => {
        expect(new Date(trip.startDate).getTime()).toBeGreaterThanOrEqual(
          new Date('2025-01-01').getTime(),
        );
      });
    });

    it('should filter trips by end date', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?endDate=2025-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should have end date <= 2025-12-31
      response.body.trips.forEach((trip) => {
        expect(new Date(trip.endDate).getTime()).toBeLessThanOrEqual(
          new Date('2025-12-31').getTime(),
        );
      });
    });

    it('should filter trips by budget range', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?minBudget=1000&maxBudget=50000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should have budget within the specified range
      response.body.trips.forEach((trip) => {
        if (trip.budget) {
          const budget = parseFloat(trip.budget);
          expect(budget).toBeGreaterThanOrEqual(1000);
          expect(budget).toBeLessThanOrEqual(50000);
        }
      });
    });

    it('should filter trips by minimum budget', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?minBudget=1000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should have budget >= 1000
      response.body.trips.forEach((trip) => {
        if (trip.budget) {
          expect(parseFloat(trip.budget)).toBeGreaterThanOrEqual(1000);
        }
      });
    });

    it('should filter trips by maximum budget', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?maxBudget=50000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should have budget <= 50000
      response.body.trips.forEach((trip) => {
        if (trip.budget) {
          expect(parseFloat(trip.budget)).toBeLessThanOrEqual(50000);
        }
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips?minBudget=1000&startDate=2025-01-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned trips should match both filters
      response.body.trips.forEach((trip) => {
        if (trip.budget) {
          expect(parseFloat(trip.budget)).toBeGreaterThanOrEqual(1000);
        }
        expect(new Date(trip.startDate).getTime()).toBeGreaterThanOrEqual(
          new Date('2025-01-01').getTime(),
        );
      });
    });

    it('should reject request without authorization', () => {
      return request(app.getHttpServer()).get('/trips').expect(401);
    });
  });

  describe('/trips/:id (GET)', () => {
    it('should return trip details', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(tripId);
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('description');
          expect(res.body.data).toHaveProperty('startDate');
          expect(res.body.data).toHaveProperty('endDate');
          expect(res.body.data).toHaveProperty('budget');
          expect(res.body.data).toHaveProperty('ownerId');
          expect(res.body.data).toHaveProperty('createdAt');
          expect(res.body.data).toHaveProperty('updatedAt');
          expect(res.body.message).toBe('Trip retrieved successfully');
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 404 for non-existent trip', () => {
      const fakeId = 'fake-trip-id-12345';
      return request(app.getHttpServer())
        .get(`/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Trip not found');
        });
    });

    it('should reject access to private trips without authorization', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Access denied');
        });
    });

    it('should allow access to public trips without authorization', async () => {
      // Create a public trip for this test
      const publicTrip = await prisma.trip.create({
        data: {
          name: 'Public Test Trip',
          description: 'A public trip for testing',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 0,
          isPublic: true,
          owner: { connect: { id: userId } },
        },
      });

      try {
        const response = await request(app.getHttpServer())
          .get(`/trips/${publicTrip.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Public Test Trip');
        expect(response.body.data.isOwned).toBe(false);
      } finally {
        // Clean up
        await prisma.trip.delete({ where: { id: publicTrip.id } });
      }
    });
  });

  describe('/trips/:id (PATCH)', () => {
    it('should update trip name', () => {
      const updateDto = {
        name: 'Updated Summer Vacation 2025',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Trip updated successfully');
          expect(res.body.success).toBe(true);
        });
    });

    it('should update trip budget', () => {
      const updateDto = {
        budget: 7500,
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Trip updated successfully');
          expect(res.body.success).toBe(true);
        });
    });

    it('should update multiple fields', () => {
      const updateDto = {
        name: 'Final Summer Vacation',
        description: 'Updated description',
        budget: 8000,
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Trip updated successfully');
          expect(res.body.success).toBe(true);
        });
    });

    it('should update trip visibility to public', async () => {
      const updateDto = {
        isPublic: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.message).toBe('Trip updated successfully');
      expect(response.body.success).toBe(true);

      // Verify the trip was updated to public
      const updatedTrip = await prisma.trip.findUnique({
        where: { id: tripId },
      });
      expect(updatedTrip.isPublic).toBe(true);
    });

    it('should update trip visibility to private', async () => {
      const updateDto = {
        isPublic: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.message).toBe('Trip updated successfully');
      expect(response.body.success).toBe(true);

      // Verify the trip was updated to private
      const updatedTrip = await prisma.trip.findUnique({
        where: { id: tripId },
      });
      expect(updatedTrip.isPublic).toBe(false);
    });

    it('should reject update with invalid dates', () => {
      const updateDto = {
        startDate: '2025-09-15T00:00:00.000Z',
        endDate: '2025-09-10T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Start date must be before end date');
        });
    });

    it('should reject update of non-existent trip', () => {
      const fakeId = 'fake-trip-id-12345';
      const updateDto = { name: 'Updated Name' };

      return request(app.getHttpServer())
        .patch(`/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });

    it('should reject request without authorization', () => {
      const updateDto = { name: 'Unauthorized Update' };

      return request(app.getHttpServer())
        .patch(`/trips/${tripId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('Authorization and Access Control', () => {
    let otherUserTripId: string;

    beforeAll(async () => {
      // Create another test user
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: 'other@example.com',
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
          isPublic: false, // Explicitly set as private
          owner: {
            connect: { id: otherUser.id },
          },
        },
      });
      otherUserTripId = otherUserTrip.id;
    });

    afterAll(async () => {
      // Clean up other user data
      await prisma.trip.delete({ where: { id: otherUserTripId } });
      await prisma.user.delete({ where: { email: 'other@example.com' } });
    });

    it('should reject access to other user private trip', () => {
      return request(app.getHttpServer())
        .get(`/trips/${otherUserTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Access denied');
        });
    });

    it('should allow access to other user public trip', async () => {
      // Create a public trip by the other user
      const otherUser = await prisma.user.findUnique({
        where: { email: 'other@example.com' },
      });

      const publicTrip = await prisma.trip.create({
        data: {
          name: 'Other User Public Trip',
          description: 'A public trip by another user',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-10'),
          budget: 0,
          isPublic: true,
          owner: { connect: { id: otherUser.id } },
        },
      });

      try {
        const response = await request(app.getHttpServer())
          .get(`/trips/${publicTrip.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Other User Public Trip');
        expect(response.body.data.isOwned).toBe(false);
        expect(response.body.data.ownerName).toBe('Other User');
      } finally {
        // Clean up
        await prisma.trip.delete({ where: { id: publicTrip.id } });
      }
    });

    it('should reject update of other user trip', () => {
      const updateDto = { name: 'Unauthorized Update' };

      return request(app.getHttpServer())
        .patch(`/trips/${otherUserTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should reject delete of other user trip', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${otherUserTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('/trips/:id (DELETE)', () => {
    it('should delete trip successfully', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Trip deleted successfully');
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeNull();
        });
    });

    it('should return 404 when trying to get deleted trip', () => {
      return request(app.getHttpServer())
        .get(`/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Trip not found');
        });
    });

    it('should reject delete of non-existent trip', () => {
      const fakeId = 'fake-trip-id-12345';
      return request(app.getHttpServer())
        .delete(`/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject delete request without authorization', () => {
      return request(app.getHttpServer())
        .delete(`/trips/${tripId}`)
        .expect(401);
    });
  });

  describe('/trips/public (GET)', () => {
    let publicTripId: string;
    let privateTripId: string;
    let anotherUserPublicTripId: string;
    let anotherUserId: string;

    beforeAll(async () => {
      // Create another user for testing cross-user public trips
      const anotherUser = await prisma.user.create({
        data: {
          name: 'Another User for Public Tests',
          email: 'another@example.com',
          passwordHash: 'hashedpassword',
          role: 'USER',
        },
      });
      anotherUserId = anotherUser.id;

      // Create a public trip by the main test user
      const publicTrip = await prisma.trip.create({
        data: {
          name: 'Public Test Trip',
          description: 'This is a public trip for testing',
          startDate: new Date('2025-08-01'),
          endDate: new Date('2025-08-10'),
          budget: 0,
          isPublic: true,
          owner: { connect: { id: userId } },
        },
      });
      publicTripId = publicTrip.id;

      // Create a private trip by the main test user
      const privateTrip = await prisma.trip.create({
        data: {
          name: 'Private Test Trip',
          description: 'This is a private trip for testing',
          startDate: new Date('2025-08-01'),
          endDate: new Date('2025-08-10'),
          budget: 0,
          isPublic: false,
          owner: { connect: { id: userId } },
        },
      });
      privateTripId = privateTrip.id;

      // Create a public trip by another user
      const anotherUserPublicTrip = await prisma.trip.create({
        data: {
          name: 'Another User Public Trip',
          description: 'Public trip by another user',
          startDate: new Date('2025-08-15'),
          endDate: new Date('2025-08-20'),
          budget: 0,
          isPublic: true,
          owner: { connect: { id: anotherUserId } },
        },
      });
      anotherUserPublicTripId = anotherUserPublicTrip.id;
    });

    afterAll(async () => {
      // Clean up test trips and user
      await prisma.trip.deleteMany({
        where: {
          id: {
            in: [publicTripId, privateTripId, anotherUserPublicTripId],
          },
        },
      });
      await prisma.user.delete({ where: { id: anotherUserId } });
    });

    it('should return public trips without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .expect(200);

      expect(response.body).toHaveProperty('trips');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.trips)).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2); // At least our 2 public trips

      // Verify all returned trips are public
      response.body.trips.forEach((trip) => {
        expect(trip.isPublic).toBe(true);
      });
    });

    it('should return public trips from all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .expect(200);

      const tripNames = response.body.trips.map((trip) => trip.name);
      expect(tripNames).toContain('Public Test Trip');
      expect(tripNames).toContain('Another User Public Trip');
    });

    it('should not return private trips in public endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .expect(200);

      const tripNames = response.body.trips.map((trip) => trip.name);
      expect(tripNames).not.toContain('Private Test Trip');
    });

    it('should include owner information in public trips', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .expect(200);

      const publicTrip = response.body.trips.find(
        (trip) => trip.id === publicTripId,
      );
      expect(publicTrip).toBeDefined();
      expect(publicTrip.ownerName).toBe('Test User');
    });

    it('should support pagination for public trips', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.trips.length).toBeLessThanOrEqual(5);
    });

    it('should filter public trips by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?name=Public Test')
        .expect(200);

      expect(response.body.trips.length).toBeGreaterThan(0);
      response.body.trips.forEach((trip) => {
        expect(trip.name.toLowerCase()).toContain('public test');
      });
    });

    it('should filter public trips by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?startDate=2025-08-01&endDate=2025-08-31')
        .expect(200);

      response.body.trips.forEach((trip) => {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        expect(startDate.getTime()).toBeGreaterThanOrEqual(
          new Date('2025-08-01').getTime(),
        );
        expect(endDate.getTime()).toBeLessThanOrEqual(
          new Date('2025-08-31').getTime(),
        );
      });
    });

    it('should filter public trips by budget range', async () => {
      // Create a public trip with a specific budget for testing
      const budgetTrip = await prisma.trip.create({
        data: {
          name: 'Budget Test Public Trip',
          description: 'Public trip with budget',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-10'),
          budget: 5000,
          isPublic: true,
          owner: { connect: { id: userId } },
        },
      });

      try {
        const response = await request(app.getHttpServer())
          .get('/trips/public?minBudget=1000&maxBudget=10000')
          .expect(200);

        response.body.trips.forEach((trip) => {
          if (trip.budget) {
            const budget = parseFloat(trip.budget);
            expect(budget).toBeGreaterThanOrEqual(1000);
            expect(budget).toBeLessThanOrEqual(10000);
          }
        });
      } finally {
        // Clean up test trip
        await prisma.trip.delete({ where: { id: budgetTrip.id } });
      }
    });

    it('should return empty results for filters with no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?name=NonExistentTripName123456')
        .expect(200);

      expect(response.body.trips.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return public trips ordered by creation date (newest first)', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?limit=10')
        .expect(200);

      if (response.body.trips.length > 1) {
        for (let i = 0; i < response.body.trips.length - 1; i++) {
          const currentTrip = response.body.trips[i];
          const nextTrip = response.body.trips[i + 1];
          expect(
            new Date(currentTrip.createdAt).getTime(),
          ).toBeGreaterThanOrEqual(new Date(nextTrip.createdAt).getTime());
        }
      }
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public?page=999&limit=10')
        .expect(200);

      expect(response.body.trips.length).toBe(0);
      expect(response.body.pagination.page).toBe(999);
    });

    it('should include all required trip fields in public trips', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .expect(200);

      if (response.body.trips.length > 0) {
        const trip = response.body.trips[0];
        expect(trip).toHaveProperty('id');
        expect(trip).toHaveProperty('name');
        expect(trip).toHaveProperty('description');
        expect(trip).toHaveProperty('startDate');
        expect(trip).toHaveProperty('endDate');
        expect(trip).toHaveProperty('budget');
        expect(trip).toHaveProperty('isPublic');
        expect(trip).toHaveProperty('createdAt');
        expect(trip).toHaveProperty('ownerName');
      }
    });

    it('should work with authentication (but not require it)', async () => {
      // Test that the endpoint works with authentication header
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trips');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should work with invalid authentication token', async () => {
      // Test that the endpoint works even with invalid auth token
      const response = await request(app.getHttpServer())
        .get('/trips/public')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body).toHaveProperty('trips');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  afterAll(async () => {
    // Final cleanup of all test data
    await prisma.trip.deleteMany({ where: { ownerId: userId } });
    await prisma.user.delete({ where: { id: userId } });
  });
});
