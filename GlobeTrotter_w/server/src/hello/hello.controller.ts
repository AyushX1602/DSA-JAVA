import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  hello() {
    return {
      data: 'Hello, World!',
      message: 'Hello endpoint called successfully',
      success: true,
    };
  }
}
