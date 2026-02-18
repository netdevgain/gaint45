import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, JobStatus, Locale } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  private pickJobTranslation(
    translations: Array<{ locale: Locale; title: string; description: string }>,
    locale: Locale
  ): { title: string; description: string } {
    const fallback = translations[0] ?? { title: '', description: '' };
    return (
      translations.find((translation) => translation.locale === locale) ??
      translations.find((translation) => translation.locale === Locale.fr) ??
      fallback
    );
  }

  private pickServiceName(translations: Array<{ locale: Locale; name: string }>, locale: Locale): string {
    return (
      translations.find((translation) => translation.locale === locale)?.name ??
      translations.find((translation) => translation.locale === Locale.fr)?.name ??
      translations[0]?.name ??
      ''
    );
  }

  private mapJob(job: Job & {
    translations: Array<{ locale: Locale; title: string; description: string }>;
    service: { id: string; translations: Array<{ locale: Locale; name: string }>; email: string | null; phone: string | null };
  }, locale: Locale): unknown {
    const translated = this.pickJobTranslation(job.translations, locale);

    return {
      id: job.id,
      title: translated.title,
      description: translated.description,
      contractType: job.contractType,
      wilaya: job.wilaya,
      city: job.city,
      experienceYears: job.experienceYears,
      status: job.status,
      publishedAt: job.publishedAt,
      closingAt: job.closingAt,
      createdAt: job.createdAt,
      service: {
        id: job.service.id,
        name: this.pickServiceName(job.service.translations, locale),
        email: job.service.email,
        phone: job.service.phone
      },
      translations: job.translations
    };
  }

  async listPublic(query: ListJobsQueryDto): Promise<{ items: unknown[]; total: number; page: number; pageSize: number }> {
    const locale = query.locale ?? Locale.fr;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 9;

    const where = {
      status: JobStatus.PUBLISHED,
      serviceId: query.serviceId,
      contractType: query.contractType,
      wilaya: query.wilaya,
      city: query.city,
      experienceYears: query.experienceYears,
      translations: query.search
        ? {
            some: {
              locale,
              title: { contains: query.search }
            }
          }
        : undefined
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: {
          translations: true,
          service: {
            include: {
              translations: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
      })
    ]);

    return {
      items: rows.map((row) => this.mapJob(row, locale)),
      total,
      page,
      pageSize
    };
  }

  async getPublicById(id: string, locale: Locale): Promise<unknown> {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        status: JobStatus.PUBLISHED
      },
      include: {
        translations: true,
        service: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.mapJob(job, locale);
  }

  async adminList(query: ListJobsQueryDto): Promise<{ items: unknown[]; total: number; page: number; pageSize: number }> {
    const locale = query.locale ?? Locale.fr;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const where = {
      status: query.status,
      serviceId: query.serviceId,
      contractType: query.contractType,
      wilaya: query.wilaya,
      city: query.city,
      translations: query.search
        ? {
            some: {
              title: { contains: query.search }
            }
          }
        : undefined
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: {
          translations: true,
          service: {
            include: {
              translations: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: rows.map((row) => this.mapJob(row, locale)),
      total,
      page,
      pageSize
    };
  }

  async adminGetById(id: string, locale: Locale): Promise<unknown> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        translations: true,
        service: {
          include: { translations: true }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.mapJob(job, locale);
  }

  async create(dto: CreateJobDto): Promise<unknown> {
    return this.prisma.job.create({
      data: {
        serviceId: dto.serviceId,
        contractType: dto.contractType,
        wilaya: dto.wilaya,
        city: dto.city,
        experienceYears: dto.experienceYears,
        status: dto.status ?? JobStatus.DRAFT,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        closingAt: dto.closingAt ? new Date(dto.closingAt) : undefined,
        translations: {
          create: dto.translations.map((translation) => ({
            locale: translation.locale,
            title: translation.title,
            description: translation.description
          }))
        }
      },
      include: { translations: true, service: { include: { translations: true } } }
    });
  }

  async update(id: string, dto: UpdateJobDto): Promise<unknown> {
    const existing = await this.prisma.job.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        serviceId: dto.serviceId,
        contractType: dto.contractType,
        wilaya: dto.wilaya,
        city: dto.city,
        experienceYears: dto.experienceYears,
        status: dto.status,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        closingAt: dto.closingAt ? new Date(dto.closingAt) : undefined,
        translations: dto.translations
          ? {
              deleteMany: {},
              create: dto.translations.map((translation) => ({
                locale: translation.locale,
                title: translation.title,
                description: translation.description
              }))
            }
          : undefined
      },
      include: { translations: true, service: { include: { translations: true } } }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.job.delete({ where: { id } });
  }
}
