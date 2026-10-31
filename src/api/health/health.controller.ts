import { AmqpService } from "@/crawler/amqp/amqp.service";
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly amqpService: AmqpService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        amqp: { type: "string", enum: ["connected", "retrying"] },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  check() {
    return {
      status: "ok",
      amqp: this.amqpService.status,
      timestamp: new Date().toISOString(),
    };
  }
}
