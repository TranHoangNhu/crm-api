import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateMilestoneLogDto,
  CreateDesignDto,
  UpdateDesignDto,
  CreateFeedbackDto,
  UpsertHandoverDto,
  UpdateHandoverStatusDto,
} from './dto/delivery.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  // ============ READ — All delivery data ============

  @Get()
  async getAll(@Query('contractId') contractId: string) {
    const data = await this.deliveryService.getAll(contractId);
    return ApiResponse.ok(data);
  }

  // ============ MILESTONES ============

  @Get('milestones')
  async getMilestones(@Query('contractId') contractId: string) {
    const data = await this.deliveryService.getMilestones(contractId);
    return ApiResponse.ok(data);
  }

  @Post('milestones')
  async createMilestone(@Body() dto: CreateMilestoneDto) {
    const data = await this.deliveryService.createMilestone(dto);
    return ApiResponse.created(data);
  }

  @Patch('milestones/:id')
  async updateMilestone(
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    await this.deliveryService.updateMilestone(id, dto);
    return ApiResponse.success('Cập nhật milestone thành công');
  }

  @Delete('milestones/:id')
  async deleteMilestone(@Param('id') id: string) {
    await this.deliveryService.deleteMilestone(id);
    return ApiResponse.success('Xóa milestone thành công');
  }

  // ============ MILESTONE LOGS ============

  @Post('milestone-logs')
  async createLog(@Body() dto: CreateMilestoneLogDto) {
    const data = await this.deliveryService.createMilestoneLog(dto);
    return ApiResponse.created(data);
  }

  // ============ DESIGN VERSIONS ============

  @Get('designs')
  async getDesigns(@Query('contractId') contractId: string) {
    const data = await this.deliveryService.getDesigns(contractId);
    return ApiResponse.ok(data);
  }

  @Post('designs')
  async createDesign(@Body() dto: CreateDesignDto) {
    const data = await this.deliveryService.createDesign(dto);
    return ApiResponse.created(data);
  }

  @Patch('designs/:id')
  async updateDesign(
    @Param('id') id: string,
    @Body() dto: UpdateDesignDto,
  ) {
    await this.deliveryService.updateDesign(id, dto);
    return ApiResponse.success('Cập nhật design thành công');
  }

  // ============ DESIGN FEEDBACKS ============

  @Post('feedbacks')
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    const data = await this.deliveryService.createFeedback(dto);
    return ApiResponse.created(data);
  }

  // ============ HANDOVERS ============

  @Get('handover')
  async getHandover(@Query('contractId') contractId: string) {
    const data = await this.deliveryService.getHandover(contractId);
    return ApiResponse.ok(data);
  }

  @Post('handover')
  async upsertHandover(@Body() dto: UpsertHandoverDto) {
    await this.deliveryService.upsertHandover(dto);
    return ApiResponse.success('Lưu thông tin bàn giao thành công');
  }

  @Patch('handover/:id/status')
  async updateHandoverStatus(
    @Param('id') id: string,
    @Body() dto: UpdateHandoverStatusDto,
  ) {
    await this.deliveryService.updateHandoverStatus(id, dto);
    return ApiResponse.success('Cập nhật trạng thái bàn giao thành công');
  }

  // ============ PUBLIC — Portal endpoints (no auth) ============

  @Public()
  @Get('portal')
  async getPortalData(@Query('contractId') contractId: string) {
    const data = await this.deliveryService.getAll(contractId);
    return ApiResponse.ok(data);
  }
}
