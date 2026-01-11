import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto';
import { FirebaseAuthGuard } from '../common';

@Controller('locations')
@UseGuards(FirebaseAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get(':locationId/participants')
  async getParticipants(@Param('locationId') locationId: string) {
    return this.locationsService.getParticipants(locationId);
  }
}
