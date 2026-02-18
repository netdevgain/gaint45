import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveName(
    translations: Array<{ locale: Locale; name: string }>,
    locale: Locale
  ): string {
    return (
      translations.find((item) => item.locale === locale)?.name ??
      translations.find((item) => item.locale === Locale.fr)?.name ??
      translations[0]?.name ??
      ''
    );
  }

  async getPublic(locale: Locale): Promise<unknown[]> {
    const services = await this.prisma.service.findMany({
      include: { translations: true },
      orderBy: { createdAt: 'asc' }
    });

    return services.map((service) => ({
      id: service.id,
      name: this.resolveName(service.translations, locale),
      email: service.email,
      phone: service.phone
    }));
  }

  async adminList(): Promise<unknown[]> {
    return this.prisma.service.findMany({
      include: { translations: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async create(dto: CreateServiceDto): Promise<unknown> {
    return this.prisma.service.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        translations: {
          create: dto.translations.map((translation) => ({
            locale: translation.locale,
            name: translation.name
          }))
        }
      },
      include: { translations: true }
    });
  }

  async update(id: string, dto: UpdateServiceDto): Promise<unknown> {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        email: dto.email,
        phone: dto.phone,
        translations: dto.translations
          ? {
              deleteMany: {},
              create: dto.translations.map((translation) => ({
                locale: translation.locale,
                name: translation.name
              }))
            }
          : undefined
      },
      include: { translations: true }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.service.delete({ where: { id } });
  }
}
