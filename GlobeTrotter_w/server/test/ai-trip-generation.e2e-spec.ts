import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

describe('AiTripGenerationController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;

  // Increase timeout for AI operations
  jest.setTimeout(30000);

  beforeAll(async () => {
    // Skip tests if no Google AI API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log(
        '⚠️  Skipping AI trip generation tests - no GOOGLE_AI_API_KEY configured',
      );
      return;
    }

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
        email: `test-ai-trip-${timestamp}@example.com`,
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
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.activity.deleteMany({
      where: {
        place: {
          tripStop: {
            trip: {
              ownerId: userId,
            },
          },
        },
      },
    });
    await prisma.place.deleteMany({
      where: {
        tripStop: {
          trip: {
            ownerId: userId,
          },
        },
      },
    });
    await prisma.tripStop.deleteMany({
      where: {
        trip: {
          ownerId: userId,
        },
      },
    });
    await prisma.trip.deleteMany({
      where: {
        ownerId: userId,
      },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await app.close();
  });

  describe('/ai-trip-generation/generate (POST)', () => {
    // Skip all tests if no API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      it('should skip tests - no API key configured', () => {
        expect(true).toBe(true);
      });
      return;
    }

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/ai-trip-generation/generate')
        .send({
          city: 'Paris',
          duration: 3,
          budget: '1000 USD',
          interests: ['Museums', 'Food'],
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/ai-trip-generation/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          duration: 3,
          budget: '1000 USD',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'City, duration, and budget are required fields',
          );
        });
    });

    it('should validate duration range', () => {
      return request(app.getHttpServer())
        .post('/ai-trip-generation/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          city: 'Paris',
          duration: 31,
          budget: '1000 USD',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Duration must be between 1 and 30 days',
          );
        });
    });

    it('should accept valid request', () => {
      return request(app.getHttpServer())
        .post('/ai-trip-generation/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          city: 'Paris',
          duration: 3,
          budget: '1000 USD',
          interests: ['Museums', 'Food', 'Architecture'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('tripId');
          expect(res.body.message).toBe(
            'AI-generated trip created successfully',
          );
          expect(res.body.success).toBe(true);
        });
    }, 25000); // 25 second timeout for AI generation
  });
});
