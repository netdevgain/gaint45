'use client';

import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/select';
import {
  getLocalizedCommuneOptions,
  getLocalizedWilayaOptions,
  isValidCommuneForWilaya,
  resolveCommuneForWilaya,
  resolveWilaya
} from '@/lib/algeria-locations';

interface AlgeriaLocationSelectsProps {
  locale: string;
  wilayaName?: string;
  cityName?: string;
  defaultWilaya?: string | null;
  defaultCity?: string | null;
  wilayaPlaceholder: string;
  cityPlaceholder: string;
  required?: boolean;
  className?: string;
}

export function AlgeriaLocationSelects({
  locale,
  wilayaName = 'wilaya',
  cityName = 'city',
  defaultWilaya,
  defaultCity,
  wilayaPlaceholder,
  cityPlaceholder,
  required = false,
  className = 'contents'
}: AlgeriaLocationSelectsProps): React.JSX.Element {
  const [selectedWilaya, setSelectedWilaya] = useState(() => resolveWilaya(defaultWilaya)?.name ?? '');
  const [selectedCity, setSelectedCity] = useState(() => {
    const wilaya = resolveWilaya(defaultWilaya);
    if (!wilaya) {
      return '';
    }
    return resolveCommuneForWilaya(wilaya.name, defaultCity)?.name ?? '';
  });

  useEffect(() => {
    const wilaya = resolveWilaya(defaultWilaya);
    setSelectedWilaya(wilaya?.name ?? '');
  }, [defaultWilaya]);

  useEffect(() => {
    const wilaya = resolveWilaya(defaultWilaya);
    if (!wilaya) {
      setSelectedCity('');
      return;
    }
    setSelectedCity(resolveCommuneForWilaya(wilaya.name, defaultCity)?.name ?? '');
  }, [defaultCity, defaultWilaya]);

  const wilayaOptions = useMemo(() => getLocalizedWilayaOptions(locale), [locale]);
  const cityOptions = useMemo(() => getLocalizedCommuneOptions(selectedWilaya, locale), [selectedWilaya, locale]);

  useEffect(() => {
    if (!selectedCity) {
      return;
    }

    if (!isValidCommuneForWilaya(selectedWilaya, selectedCity)) {
      setSelectedCity('');
    }
  }, [selectedWilaya, selectedCity]);

  return (
    <div className={className}>
      <Select
        name={wilayaName}
        value={selectedWilaya}
        onChange={(event) => setSelectedWilaya(event.target.value)}
        required={required}
      >
        <option value="">{wilayaPlaceholder}</option>
        {wilayaOptions.map((wilaya) => (
          <option key={wilaya.id} value={wilaya.value}>
            {wilaya.label}
          </option>
        ))}
      </Select>

      <Select
        name={cityName}
        value={selectedCity}
        onChange={(event) => setSelectedCity(event.target.value)}
        required={required}
        disabled={!selectedWilaya}
      >
        <option value="">{cityPlaceholder}</option>
        {cityOptions.map((city) => (
          <option key={city.id} value={city.value}>
            {city.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
