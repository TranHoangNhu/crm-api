import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractStatusDto } from './dto/contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateContractStatusDto) {
    return this.contractsService.updateStatus(id, dto);
  }
}
