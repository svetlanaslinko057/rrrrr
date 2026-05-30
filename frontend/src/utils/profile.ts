// Єдиний джерело правди для профілю користувача "Резерв ID".
// Зберігається локально в AsyncStorage за ключем PROFILE_KEY.

import { storage } from "@/src/utils/storage";

export const PROFILE_KEY = "rezerv_profile_v1";

export type UserProfile = {
  // --- Картка Резерв ID ---
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string; // ДД.ММ.РРРР
  deferralUntil: string;
  customTicker: string;
  photoBase64: string | null;
  noPhoto?: boolean;

  // --- PDF: Особиста інформація ---
  validUntil: string; // Дійсний до*
  rnokpp: string; // РНОКПП
  status: string; // Статус

  // --- PDF: Військова інформація ---
  category: string; // Категорія обліку
  tck: string; // ТЦК та СП
  rank: string; // Звання
  registryNumber: string; // Номер в реєстрі Оберіг
  vos: string; // ВОС
  note: string; // Примітка
  deferralType: string; // Тип відстрочки

  // --- PDF: Адреса та контакти ---
  address: string;
  email: string;
  phone: string;
  dataUpdateDate: string;
};

export const DEFAULT_PROFILE: UserProfile = {
  surname: "ІВАНОВ",
  name: "ІВАН",
  patronymic: "Іванович",
  birthDate: "11.11.1111",
  deferralUntil: "08.01.2027",
  customTicker: "",
  photoBase64: null,

  validUntil: "30.05.2027",
  rnokpp: "3411511010",
  status: "Військовозобов'язаний",

  category: "Військовозобов'язаний",
  tck: "Білоцерківський районний територіальний центр комплектування та соціальної підтримки",
  rank: "Солдат",
  registryNumber: "250220231362300200481",
  vos: "999097",
  note: "Потребує проходження базової загальновійськової підготовки, Солдат резерву",
  deferralType: "п.4 ч.1 ст.23",

  address: "Україна, Київська область, м Біла Церква, Фастівська, б. 2",
  email: "shillclub.dao@gmail.com",
  phone: "380952067447",
  dataUpdateDate: "21.05.2026",
};

export async function loadProfile(): Promise<UserProfile> {
  try {
    const raw = await storage.getItem<string>(PROFILE_KEY, "");
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(p: UserProfile): Promise<boolean> {
  return storage.setItem(PROFILE_KEY, JSON.stringify(p));
}
