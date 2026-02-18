import { getAllCommunes, getAllWilayas, type Commune, type Wilaya } from 'algerian-geo';

interface WilayaRecord {
  id: string;
  code: string;
  name: string;
  arName: string;
}

interface CommuneRecord {
  id: string;
  wilayaId: string;
  name: string;
  arName: string;
}

export interface LocalizedOption {
  id: string;
  value: string;
  label: string;
}

const normalize = (value: string): string => value.trim().toLocaleLowerCase('fr-FR');

const isArabicLocale = (locale: string): boolean => locale === 'ar';

const localizedLabel = (name: string, arName: string, locale: string): string =>
  isArabicLocale(locale) && arName ? arName : name;

const WILAYAS: WilayaRecord[] = getAllWilayas().map((item: Wilaya) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  arName: item.ar_name
}));

const COMMUNES: CommuneRecord[] = getAllCommunes().map((item: Commune) => ({
  id: item.id,
  wilayaId: item.wilaya_id,
  name: item.name,
  arName: item.ar_name
}));

const COMMUNES_BY_WILAYA = COMMUNES.reduce<Map<string, CommuneRecord[]>>((acc, commune) => {
  const bucket = acc.get(commune.wilayaId);
  if (bucket) {
    bucket.push(commune);
  } else {
    acc.set(commune.wilayaId, [commune]);
  }
  return acc;
}, new Map<string, CommuneRecord[]>());

export const resolveWilaya = (value: string | null | undefined): WilayaRecord | null => {
  const normalized = normalize(value ?? '');
  if (!normalized) {
    return null;
  }

  return (
    WILAYAS.find((wilaya) => {
      return (
        normalize(wilaya.id) === normalized ||
        normalize(wilaya.code) === normalized ||
        normalize(wilaya.name) === normalized ||
        normalize(wilaya.arName) === normalized
      );
    }) ?? null
  );
};

export const getLocalizedWilayaOptions = (locale: string): LocalizedOption[] =>
  WILAYAS.map((wilaya) => {
    const label = localizedLabel(wilaya.name, wilaya.arName, locale);
    return {
      id: wilaya.id,
      value: wilaya.name,
      label
    };
  });

export const getLocalizedCommuneOptions = (wilayaValue: string | null | undefined, locale: string): LocalizedOption[] => {
  const wilaya = resolveWilaya(wilayaValue);
  if (!wilaya) {
    return [];
  }

  const communes = COMMUNES_BY_WILAYA.get(wilaya.id) ?? [];
  return communes.map((commune) => {
    const label = localizedLabel(commune.name, commune.arName, locale);
    return {
      id: commune.id,
      value: commune.name,
      label
    };
  });
};

export const resolveCommuneForWilaya = (
  wilayaValue: string | null | undefined,
  communeValue: string | null | undefined
): CommuneRecord | null => {
  const normalized = normalize(communeValue ?? '');
  if (!normalized) {
    return null;
  }

  const wilaya = resolveWilaya(wilayaValue);
  if (!wilaya) {
    return null;
  }

  return (
    (COMMUNES_BY_WILAYA.get(wilaya.id) ?? []).find((commune) => {
      return (
        normalize(commune.id) === normalized ||
        normalize(commune.name) === normalized ||
        normalize(commune.arName) === normalized
      );
    }) ?? null
  );
};

export const isValidCommuneForWilaya = (
  wilayaValue: string | null | undefined,
  communeValue: string | null | undefined
): boolean => {
  const normalized = normalize(communeValue ?? '');
  if (!normalized) {
    return false;
  }

  const wilaya = resolveWilaya(wilayaValue);
  if (!wilaya) {
    return false;
  }

  return resolveCommuneForWilaya(wilaya.name, communeValue) !== null;
};
