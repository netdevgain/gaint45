import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  ApplicationStatus,
  JobStatus,
  Locale,
  Prisma,
  Role
} from '@prisma/client';
import { stringify } from 'csv-stringify/sync';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AdminListApplicationsQueryDto } from './dto/admin-list-applications-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AddApplicationNoteDto } from './dto/add-application-note.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  private getUploadDir(): string {
    return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  }

  private resolveJobTranslation(
    translations: Array<{ locale: Locale; title: string; description: string }>,
    locale: Locale
  ): { title: string; description: string } {
    return (
      translations.find((item) => item.locale === locale) ??
      translations.find((item) => item.locale === Locale.fr) ??
      translations[0] ??
      { title: '', description: '' }
    );
  }

  private statusLabel(status: ApplicationStatus, locale: Locale): string {
    const map: Record<Locale, Record<ApplicationStatus, string>> = {
      fr: {
        RECEIVED: 'Reçue',
        IN_REVIEW: 'En cours d\'étude',
        SHORTLISTED: 'Présélectionnée',
        REJECTED: 'Refusée',
        INTERVIEW_SCHEDULED: 'Entretien planifié',
        HIRED: 'Embauché'
      },
      en: {
        RECEIVED: 'Received',
        IN_REVIEW: 'In review',
        SHORTLISTED: 'Shortlisted',
        REJECTED: 'Rejected',
        INTERVIEW_SCHEDULED: 'Interview scheduled',
        HIRED: 'Hired'
      },
      ar: {
        RECEIVED: 'تم الاستلام',
        IN_REVIEW: 'قيد المراجعة',
        SHORTLISTED: 'ضمن القائمة المختصرة',
        REJECTED: 'مرفوض',
        INTERVIEW_SCHEDULED: 'تمت برمجة المقابلة',
        HIRED: 'تم التوظيف'
      }
    };

    return map[locale][status];
  }

  private buildCandidateEmail(
    locale: Locale,
    candidateName: string,
    jobTitle: string,
    status?: ApplicationStatus
  ): { subject: string; html: string } {
    if (status) {
      const label = this.statusLabel(status, locale);
      if (locale === Locale.ar) {
        return {
          subject: 'تحديث حالة الترشح',
          html: `<p>مرحباً ${candidateName}</p><p>تم تحديث حالة طلبك لمنصب ${jobTitle}: <strong>${label}</strong></p>`
        };
      }

      if (locale === Locale.en) {
        return {
          subject: 'Application status update',
          html: `<p>Hello ${candidateName},</p><p>Your application for ${jobTitle} is now: <strong>${label}</strong>.</p>`
        };
      }

      return {
        subject: 'Mise à jour de votre candidature',
        html: `<p>Bonjour ${candidateName},</p><p>Le statut de votre candidature pour ${jobTitle} est maintenant: <strong>${label}</strong>.</p>`
      };
    }

    if (locale === Locale.ar) {
      return {
        subject: 'تم استلام طلب التوظيف',
        html: `<p>مرحباً ${candidateName}</p><p>تم استلام طلبك لمنصب ${jobTitle} بنجاح.</p>`
      };
    }

    if (locale === Locale.en) {
      return {
        subject: 'Application received',
        html: `<p>Hello ${candidateName},</p><p>Your application for ${jobTitle} has been received successfully.</p>`
      };
    }

    return {
      subject: 'Candidature reçue',
      html: `<p>Bonjour ${candidateName},</p><p>Votre candidature pour ${jobTitle} a bien été reçue.</p>`
    };
  }

  private buildAdminEmail(locale: Locale, candidateName: string, jobTitle: string): { subject: string; html: string } {
    if (locale === Locale.ar) {
      return {
        subject: 'طلب توظيف جديد',
        html: `<p>تم إرسال طلب جديد من ${candidateName} لمنصب ${jobTitle}.</p>`
      };
    }

    if (locale === Locale.en) {
      return {
        subject: 'New job application',
        html: `<p>A new application was submitted by ${candidateName} for ${jobTitle}.</p>`
      };
    }

    return {
      subject: 'Nouvelle candidature',
      html: `<p>Une nouvelle candidature de ${candidateName} a été soumise pour ${jobTitle}.</p>`
    };
  }

  async apply(
    userId: string,
    dto: CreateApplicationDto,
    file: Express.Multer.File
  ): Promise<unknown> {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email.toLowerCase() !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email.toLowerCase(),
          id: { not: userId }
        }
      });
      if (existing) {
        throw new BadRequestException('Email already used by another account');
      }
    }

    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      include: {
        translations: true,
        service: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job not available');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email.toLowerCase(),
            phone: dto.phone,
            birthDate: new Date(dto.birthDate),
            address: dto.address,
            city: dto.city,
            wilaya: dto.wilaya,
            preferredLocale: dto.preferredLocale ?? user.preferredLocale
          }
        });

        const application = await tx.application.create({
          data: {
            userId,
            jobId: dto.jobId,
            status: ApplicationStatus.RECEIVED,
            coverLetter: dto.coverLetter,
            cvFilePath: file.filename,
            cvOriginalName: file.originalname,
            cvMimeType: file.mimetype,
            cvSize: file.size
          }
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: application.id,
            fromStatus: null,
            toStatus: ApplicationStatus.RECEIVED,
            changedByUserId: userId,
            note: 'Application submitted'
          }
        });

        return {
          application,
          user: updatedUser
        };
      });

      const locale = dto.preferredLocale ?? user.preferredLocale ?? Locale.fr;
      const translatedJob = this.resolveJobTranslation(job.translations, locale);
      const fullName = `${dto.firstName} ${dto.lastName}`;

      const candidateEmail = this.buildCandidateEmail(locale, fullName, translatedJob.title);
      await this.mailService.sendMail({
        to: dto.email.toLowerCase(),
        subject: candidateEmail.subject,
        html: candidateEmail.html
      });

      const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
      const notificationAddress = job.service.email || setting?.companyEmail || 'info@geant-dz.com';
      const adminEmail = this.buildAdminEmail(locale, fullName, translatedJob.title);
      await this.mailService.sendMail({
        to: notificationAddress,
        subject: adminEmail.subject,
        html: adminEmail.html
      });

      return {
        id: result.application.id,
        status: result.application.status,
        createdAt: result.application.createdAt
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('You already applied to this job');
      }
      throw error;
    }
  }

  async listMine(userId: string, locale: Locale): Promise<unknown[]> {
    const rows = await this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            translations: true,
            service: {
              include: {
                translations: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return rows.map((application) => {
      const translated = this.resolveJobTranslation(application.job.translations, locale);
      return {
        id: application.id,
        jobId: application.jobId,
        jobTitle: translated.title,
        submittedAt: application.createdAt,
        status: application.status,
        statusLabel: this.statusLabel(application.status, locale)
      };
    });
  }

  async getMineById(userId: string, applicationId: string, locale: Locale): Promise<unknown> {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
      include: {
        job: {
          include: {
            translations: true,
            service: { include: { translations: true } }
          }
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const translated = this.resolveJobTranslation(application.job.translations, locale);

    return {
      id: application.id,
      status: application.status,
      statusLabel: this.statusLabel(application.status, locale),
      coverLetter: application.coverLetter,
      submittedAt: application.createdAt,
      job: {
        id: application.job.id,
        title: translated.title,
        contractType: application.job.contractType,
        wilaya: application.job.wilaya,
        city: application.job.city
      },
      history: application.statusHistory
    };
  }

  private ensureCvAccess(
    application: { userId: string },
    requesterId: string,
    requesterRole: Role
  ): void {
    if (requesterRole === Role.ADMIN || requesterRole === Role.HR_MANAGER) {
      return;
    }

    if (application.userId !== requesterId) {
      throw new ForbiddenException('Access denied');
    }
  }

  async getCvFile(
    applicationId: string,
    requesterId: string,
    requesterRole: Role
  ): Promise<{ absolutePath: string; originalName: string; mimeType: string }> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
        cvFilePath: true,
        cvOriginalName: true,
        cvMimeType: true
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    this.ensureCvAccess(application, requesterId, requesterRole);

    const uploadDir = this.getUploadDir();
    const absolutePath = resolve(uploadDir, application.cvFilePath);

    if (!absolutePath.startsWith(resolve(uploadDir))) {
      throw new ForbiddenException('Invalid file path');
    }

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('CV file not found');
    }

    return {
      absolutePath,
      originalName: application.cvOriginalName,
      mimeType: application.cvMimeType
    };
  }

  private buildAdminWhere(query: AdminListApplicationsQueryDto): Prisma.ApplicationWhereInput {
    return {
      jobId: query.jobId,
      status: query.status,
      createdAt:
        query.startDate || query.endDate
          ? {
              gte: query.startDate ? new Date(query.startDate) : undefined,
              lte: query.endDate ? new Date(query.endDate) : undefined
            }
          : undefined,
      job: {
        serviceId: query.serviceId,
        wilaya: query.wilaya,
        city: query.city,
        translations: query.search
          ? {
              some: {
                title: { contains: query.search }
              }
            }
          : undefined
      },
      user: {
        OR: query.search
          ? [
              { firstName: { contains: query.search } },
              { lastName: { contains: query.search } },
              { email: { contains: query.search } }
            ]
          : undefined
      }
    };
  }

  async adminList(query: AdminListApplicationsQueryDto): Promise<{ items: unknown[]; total: number; page: number; pageSize: number }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = this.buildAdminWhere(query);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              city: true,
              wilaya: true
            }
          },
          job: {
            include: {
              translations: true,
              service: { include: { translations: true } }
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: rows,
      total,
      page,
      pageSize
    };
  }

  async adminGetById(applicationId: string): Promise<unknown> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        job: {
          include: {
            translations: true,
            service: {
              include: {
                translations: true
              }
            }
          }
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async changeStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
    actorUserId: string
  ): Promise<unknown> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        job: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: dto.toStatus
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: dto.toStatus,
          changedByUserId: actorUserId,
          note: dto.note
        }
      });

      return next;
    });

    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    if (setting?.notifyCandidateOnStatusChange) {
      const locale = application.user.preferredLocale ?? Locale.fr;
      const translation = this.resolveJobTranslation(application.job.translations, locale);
      const candidateName = `${application.user.firstName} ${application.user.lastName}`;
      const message = this.buildCandidateEmail(locale, candidateName, translation.title, dto.toStatus);
      await this.mailService.sendMail({
        to: application.user.email,
        subject: message.subject,
        html: message.html
      });
    }

    return updated;
  }

  async addNote(
    applicationId: string,
    dto: AddApplicationNoteDto,
    actorUserId: string
  ): Promise<unknown> {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: application.status,
        changedByUserId: actorUserId,
        note: dto.note
      }
    });
  }

  async exportCsv(query: AdminListApplicationsQueryDto): Promise<string> {
    const where = this.buildAdminWhere(query);
    const rows = await this.prisma.application.findMany({
      where,
      include: {
        user: true,
        job: {
          include: {
            translations: true,
            service: {
              include: {
                translations: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const records = rows.map((application) => ({
      applicationId: application.id,
      candidate: `${application.user.firstName} ${application.user.lastName}`,
      candidateEmail: application.user.email,
      candidatePhone: application.user.phone ?? '',
      jobTitleFr:
        application.job.translations.find((translation) => translation.locale === Locale.fr)?.title ??
        application.job.translations[0]?.title ??
        '',
      service:
        application.job.service.translations.find((translation) => translation.locale === Locale.fr)?.name ??
        application.job.service.translations[0]?.name ??
        '',
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      wilaya: application.user.wilaya ?? application.job.wilaya,
      city: application.user.city ?? application.job.city
    }));

    return stringify(records, { header: true });
  }

  async analytics(): Promise<unknown> {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const [totalJobs, publishedJobs, totalApplications, monthApplications, byStatus] =
      await this.prisma.$transaction([
        this.prisma.job.count(),
        this.prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
        this.prisma.application.count(),
        this.prisma.application.count({ where: { createdAt: { gte: start } } }),
        this.prisma.application.groupBy({
          by: ['status'],
          _count: { _all: true },
          orderBy: { status: 'asc' }
        })
      ]);

    const monthlyRows = await this.prisma.$queryRaw<Array<{ month: string; total: bigint }>>`
      SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS total
      FROM Application
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    const monthly = monthlyRows
      .map((row) => ({ month: row.month, total: Number(row.total) }))
      .reverse();

    return {
      cards: {
        totalJobs,
        publishedJobs,
        totalApplications,
        applicationsThisMonth: monthApplications
      },
      byStatus,
      monthly
    };
  }
}

