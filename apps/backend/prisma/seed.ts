import { PrismaClient, ContractType, JobStatus, Locale, Role, EmailTemplateType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@geant.dz';
const ADMIN_PASSWORD = 'Admin@12345';

const servicesSeed = [
  {
    key: 'hr',
    email: 'hr@geant-dz.com',
    phone: '(+213)39 260 808',
    translations: {
      fr: 'Ressources Humaines (DRH)',
      en: 'Human Resources (HR)',
      ar: 'الموارد البشرية (DRH)'
    }
  },
  {
    key: 'it',
    email: 'dsi@geant-dz.com',
    phone: '(+213)39 260 000',
    translations: {
      fr: 'Informatique (DSI)',
      en: 'Information Technology (IT)',
      ar: 'تكنولوجيا المعلومات (DSI)'
    }
  },
  {
    key: 'qhse',
    email: 'qhse@geant-dz.com',
    phone: '(+213)39 260 909',
    translations: {
      fr: 'QHSE',
      en: 'QHSE',
      ar: 'الجودة والصحة والسلامة والبيئة'
    }
  },
  {
    key: 'finance',
    email: 'dfc@geant-dz.com',
    phone: '(+213)39 260 808',
    translations: {
      fr: 'Finance (DFC)',
      en: 'Finance (CFO Office)',
      ar: 'المالية (DFC)'
    }
  },
  {
    key: 'supply',
    email: 'supply@geant-dz.com',
    phone: '(+213)39 260 000',
    translations: {
      fr: 'Supply Chain',
      en: 'Supply Chain',
      ar: 'سلسلة الإمداد'
    }
  },
  {
    key: 'sav',
    email: 'sav@geant-dz.com',
    phone: '(+213)35 744 120',
    translations: {
      fr: 'Service Apres-Vente (SAV)',
      en: 'After-Sales Service',
      ar: 'خدمة ما بعد البيع (SAV)'
    }
  }
] as const;

type JobSeed = {
  serviceKey: (typeof servicesSeed)[number]['key'];
  contractType: ContractType;
  wilaya: string;
  city: string;
  experienceYears: number;
  translations: Record<Locale, { title: string; description: string }>;
};

const jobSeeds: JobSeed[] = [
  {
    serviceKey: 'it',
    contractType: ContractType.CDI,
    wilaya: 'Bordj Bou Arreridj',
    city: 'Bordj Bou Arreridj',
    experienceYears: 3,
    translations: {
      fr: {
        title: 'Developpeur Full Stack',
        description:
          '## Missions\n- Concevoir des applications internes de recrutement.\n- Collaborer avec RH et metiers.\n- Garantir la qualite et la securite logicielle.'
      },
      en: {
        title: 'Full Stack Developer',
        description:
          '## Responsibilities\n- Build internal recruitment applications.\n- Collaborate with HR and business teams.\n- Ensure software quality and security.'
      },
      ar: {
        title: 'مطور شامل Full Stack',
        description:
          '## المهام\n- تطوير تطبيقات التوظيف الداخلية.\n- التعاون مع فرق الموارد البشرية والفرق الوظيفية.\n- ضمان جودة البرمجيات وأمنها.'
      }
    }
  },
  {
    serviceKey: 'hr',
    contractType: ContractType.CDI,
    wilaya: 'Alger',
    city: 'Alger',
    experienceYears: 4,
    translations: {
      fr: {
        title: 'Charge(e) de recrutement',
        description:
          '## Missions\n- Gerer le cycle de recrutement complet.\n- Mener les entretiens et coordonner les managers.\n- Suivre les KPI RH.'
      },
      en: {
        title: 'Talent Acquisition Specialist',
        description:
          '## Responsibilities\n- Manage the full recruitment lifecycle.\n- Run interviews and coordinate with hiring managers.\n- Track HR recruiting KPIs.'
      },
      ar: {
        title: 'أخصائي استقطاب المواهب',
        description:
          '## المهام\n- إدارة دورة التوظيف كاملة.\n- إجراء المقابلات والتنسيق مع المديرين.\n- متابعة مؤشرات الأداء في التوظيف.'
      }
    }
  },
  {
    serviceKey: 'finance',
    contractType: ContractType.CDD,
    wilaya: 'Setif',
    city: 'Setif',
    experienceYears: 2,
    translations: {
      fr: {
        title: 'Analyste financier',
        description:
          '## Missions\n- Produire des analyses de rentabilite.\n- Participer a la preparation budgetaire.\n- Construire des tableaux de bord financiers.'
      },
      en: {
        title: 'Financial Analyst',
        description:
          '## Responsibilities\n- Deliver profitability analysis.\n- Support budget planning cycles.\n- Build finance dashboards for leadership.'
      },
      ar: {
        title: 'محلل مالي',
        description:
          '## المهام\n- إعداد تحليلات الربحية.\n- المساهمة في إعداد الميزانية.\n- بناء لوحات قيادة مالية للإدارة.'
      }
    }
  },
  {
    serviceKey: 'supply',
    contractType: ContractType.CDI,
    wilaya: 'Oran',
    city: 'Oran',
    experienceYears: 5,
    translations: {
      fr: {
        title: 'Responsable Supply Chain',
        description:
          '## Missions\n- Piloter les flux logistiques et approvisionnement.\n- Optimiser les stocks et delais.\n- Collaborer avec les usines et distributeurs.'
      },
      en: {
        title: 'Supply Chain Manager',
        description:
          '## Responsibilities\n- Lead logistics and procurement flows.\n- Optimize inventory and lead times.\n- Coordinate with factories and distributors.'
      },
      ar: {
        title: 'مسؤول سلسلة الإمداد',
        description:
          '## المهام\n- قيادة التدفقات اللوجستية والتموين.\n- تحسين المخزون وآجال التسليم.\n- التنسيق مع المصانع والموزعين.'
      }
    }
  },
  {
    serviceKey: 'qhse',
    contractType: ContractType.CDI,
    wilaya: 'Bordj Bou Arreridj',
    city: 'Bordj Bou Arreridj',
    experienceYears: 3,
    translations: {
      fr: {
        title: 'Ingenieur QHSE',
        description:
          '## Missions\n- Mettre en place les procedures QHSE.\n- Assurer les audits internes.\n- Former les equipes sur la conformite.'
      },
      en: {
        title: 'QHSE Engineer',
        description:
          '## Responsibilities\n- Implement QHSE procedures.\n- Run internal audits.\n- Train teams on compliance standards.'
      },
      ar: {
        title: 'مهندس QHSE',
        description:
          '## المهام\n- تطبيق إجراءات الجودة والصحة والسلامة.\n- إجراء التدقيقات الداخلية.\n- تكوين الفرق على معايير المطابقة.'
      }
    }
  },
  {
    serviceKey: 'sav',
    contractType: ContractType.CDD,
    wilaya: 'Constantine',
    city: 'Constantine',
    experienceYears: 1,
    translations: {
      fr: {
        title: 'Technicien SAV',
        description:
          '## Missions\n- Diagnostiquer les pannes produits.\n- Assurer la maintenance preventive.\n- Accompagner les clients en service apres-vente.'
      },
      en: {
        title: 'After-Sales Technician',
        description:
          '## Responsibilities\n- Diagnose product failures.\n- Perform preventive maintenance.\n- Support customers through after-sales service.'
      },
      ar: {
        title: 'تقني خدمة ما بعد البيع',
        description:
          '## المهام\n- تشخيص أعطال المنتجات.\n- تنفيذ الصيانة الوقائية.\n- مرافقة الزبائن في خدمة ما بعد البيع.'
      }
    }
  },
  {
    serviceKey: 'it',
    contractType: ContractType.STAGE,
    wilaya: 'Alger',
    city: 'Bab Ezzouar',
    experienceYears: 0,
    translations: {
      fr: {
        title: 'Stagiaire Data Analyst',
        description:
          '## Missions\n- Nettoyer et preparer les donnees RH.\n- Produire des visualisations KPI.\n- Participer aux analyses de performance recrutement.'
      },
      en: {
        title: 'Data Analyst Intern',
        description:
          '## Responsibilities\n- Clean and prepare HR datasets.\n- Produce KPI visualizations.\n- Contribute to recruitment performance analysis.'
      },
      ar: {
        title: 'متدرب محلل بيانات',
        description:
          '## المهام\n- تنظيف وتجهيز بيانات الموارد البشرية.\n- إعداد مرئيات لمؤشرات الأداء.\n- المساهمة في تحليل أداء التوظيف.'
      }
    }
  },
  {
    serviceKey: 'hr',
    contractType: ContractType.CDI,
    wilaya: 'Annaba',
    city: 'Annaba',
    experienceYears: 2,
    translations: {
      fr: {
        title: 'Coordinateur formation',
        description:
          '## Missions\n- Definir le plan annuel de formation.\n- Coordonner les sessions internes et externes.\n- Mesurer l\'impact des formations.'
      },
      en: {
        title: 'Training Coordinator',
        description:
          '## Responsibilities\n- Define annual training plans.\n- Coordinate internal and external sessions.\n- Measure training impact on performance.'
      },
      ar: {
        title: 'منسق التكوين',
        description:
          '## المهام\n- إعداد خطة التكوين السنوية.\n- تنسيق الدورات الداخلية والخارجية.\n- قياس أثر التكوين على الأداء.'
      }
    }
  }
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '(+213)39 260 808',
      preferredLocale: Locale.fr
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '(+213)39 260 808',
      preferredLocale: Locale.fr,
      address: 'Zone d\'activite N°94 LOT 161 Bordj Bou Arreridj, Algérie',
      city: 'Bordj Bou Arreridj',
      wilaya: 'Bordj Bou Arreridj'
    }
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      companyName: 'SARL LOTFI ELECTRONICS (Geant Electronics)',
      companyAddress: "Zone d'activite N°94 LOT 161 Bordj Bou Arreridj, Algérie",
      companyWebsite: 'https://geant.dz/',
      companyPhone: '(+213)39 260 808 / 909 ; (+213)39 260 000',
      companyEmail: 'info@geant-dz.com',
      savPhone: '(+213)35 744 120 ; (+213)35 744 122',
      savEmail: 'sav@geant-dz.com',
      notifyCandidateOnStatusChange: true
    },
    create: {
      id: 1,
      companyName: 'SARL LOTFI ELECTRONICS (Geant Electronics)',
      companyAddress: "Zone d'activite N°94 LOT 161 Bordj Bou Arreridj, Algérie",
      companyWebsite: 'https://geant.dz/',
      companyPhone: '(+213)39 260 808 / 909 ; (+213)39 260 000',
      companyEmail: 'info@geant-dz.com',
      savPhone: '(+213)35 744 120 ; (+213)35 744 122',
      savEmail: 'sav@geant-dz.com',
      notifyCandidateOnStatusChange: true
    }
  });

  await prisma.emailTemplate.upsert({
    where: {
      type_locale: {
        type: EmailTemplateType.APPLICATION_CONFIRMATION,
        locale: Locale.fr
      }
    },
    update: {
      subject: 'Candidature reçue',
      body: 'Bonjour {{name}}, votre candidature pour {{jobTitle}} a bien été reçue.'
    },
    create: {
      type: EmailTemplateType.APPLICATION_CONFIRMATION,
      locale: Locale.fr,
      subject: 'Candidature reçue',
      body: 'Bonjour {{name}}, votre candidature pour {{jobTitle}} a bien été reçue.'
    }
  });

  await prisma.emailTemplate.upsert({
    where: {
      type_locale: {
        type: EmailTemplateType.APPLICATION_CONFIRMATION,
        locale: Locale.en
      }
    },
    update: {
      subject: 'Application received',
      body: 'Hello {{name}}, your application for {{jobTitle}} has been received.'
    },
    create: {
      type: EmailTemplateType.APPLICATION_CONFIRMATION,
      locale: Locale.en,
      subject: 'Application received',
      body: 'Hello {{name}}, your application for {{jobTitle}} has been received.'
    }
  });

  await prisma.emailTemplate.upsert({
    where: {
      type_locale: {
        type: EmailTemplateType.APPLICATION_CONFIRMATION,
        locale: Locale.ar
      }
    },
    update: {
      subject: 'تم استلام طلب التوظيف',
      body: 'مرحباً {{name}}، تم استلام طلبك لمنصب {{jobTitle}}.'
    },
    create: {
      type: EmailTemplateType.APPLICATION_CONFIRMATION,
      locale: Locale.ar,
      subject: 'تم استلام طلب التوظيف',
      body: 'مرحباً {{name}}، تم استلام طلبك لمنصب {{jobTitle}}.'
    }
  });

  const serviceMap: Record<string, string> = {};

  for (const service of servicesSeed) {
    const existingService = await prisma.service.findFirst({
      where: {
        translations: {
          some: {
            locale: Locale.fr,
            name: service.translations.fr
          }
        }
      }
    });

    const ensuredService = existingService
      ? await prisma.service.update({
          where: { id: existingService.id },
          data: {
            email: service.email,
            phone: service.phone
          }
        })
      : await prisma.service.create({
          data: {
            email: service.email,
            phone: service.phone
          }
        });

    serviceMap[service.key] = ensuredService.id;

    for (const locale of [Locale.fr, Locale.en, Locale.ar] as const) {
      await prisma.serviceTranslation.upsert({
        where: {
          serviceId_locale: {
            serviceId: ensuredService.id,
            locale
          }
        },
        update: {
          name: service.translations[locale]
        },
        create: {
          serviceId: ensuredService.id,
          locale,
          name: service.translations[locale]
        }
      });
    }
  }

  for (const seed of jobSeeds) {
    const serviceId = serviceMap[seed.serviceKey];
    const existingJob = await prisma.job.findFirst({
      where: {
        serviceId,
        translations: {
          some: {
            locale: Locale.fr,
            title: seed.translations.fr.title
          }
        }
      }
    });

    const publishedAt = existingJob?.publishedAt ?? new Date();
    const ensuredJob = existingJob
      ? await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            serviceId,
            contractType: seed.contractType,
            wilaya: seed.wilaya,
            city: seed.city,
            experienceYears: seed.experienceYears,
            status: JobStatus.PUBLISHED,
            publishedAt,
            closingAt: null
          }
        })
      : await prisma.job.create({
          data: {
            serviceId,
            contractType: seed.contractType,
            wilaya: seed.wilaya,
            city: seed.city,
            experienceYears: seed.experienceYears,
            status: JobStatus.PUBLISHED,
            publishedAt,
            closingAt: null
          }
        });

    for (const locale of [Locale.fr, Locale.en, Locale.ar] as const) {
      await prisma.jobTranslation.upsert({
        where: {
          jobId_locale: {
            jobId: ensuredJob.id,
            locale
          }
        },
        update: {
          title: seed.translations[locale].title,
          description: seed.translations[locale].description
        },
        create: {
          jobId: ensuredJob.id,
          locale,
          title: seed.translations[locale].title,
          description: seed.translations[locale].description
        }
      });
    }
  }

  console.log('Seed completed.');
  console.log(`Admin account => ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
