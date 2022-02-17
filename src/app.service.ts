import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import { MeterNotFoundException } from './exceptions/MeterNotFoundException';
import { PurchaseElectricityDto } from './meters/dto/PurchaseDto';
import { MetersService } from './meters/meters.service';
import { PrismaService } from './prisma.service';
import { CreateTokenDto } from './tokens/dto/create-token.dto';
import { TokensService } from './tokens/tokens.service';

@Injectable()
export class AppService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly meterService: MetersService,
        private readonly tokenService: TokensService,
    ) {}

    async purchaseElectricity(purchaseDto: PurchaseElectricityDto) {
        // validate meter validity
        if (purchaseDto.meterNumber.toString.length != 6)
            throw new BadRequestException(
                'invalid meter, only 6 digits accepted',
            );

        let meter;

        try {
            meter = this.tokenService.findByMeterNumber(
                purchaseDto.meterNumber,
            );
        } catch (error) {
            throw new MeterNotFoundException(' Unkown meter ');
        }

        const tokenGenerated = randomInt(100000, 999999);

        const tokenInput = new CreateTokenDto();

        tokenInput.generatedAt = new Date();
        tokenInput.meterId = purchaseDto.meterNumber;
        tokenInput.price = purchaseDto.price;
        tokenInput.loadedDays = Math.ceil(purchaseDto.price / 100);

        return await this.tokenService.create(tokenInput);
    }

    getUsers() {
        return null;
    }
}