import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "qrcode";
import { Platform, Alert } from "react-native";

/**
 * Профіль користувача, який відображається в додатку Резерв ID.
 */
export type PdfProfile = {
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string;
  deferralUntil: string;
  photoBase64: string | null;
};

/**
 * Додаткові поля документа.
 * У майбутньому ці дані надходитимуть з адмін-панелі / бекенду.
 * Зараз — значення-замовчування, що відповідають референсному PDF.
 */
export type MilitaryDocData = {
  // Особиста інформація
  validUntil: string; // Дійсний до*
  rnokpp: string; // РНОКПП
  status: string; // напр. "Військовозобов'язаний"

  // Військова інформація
  category: string; // Категорія обліку
  exclusionReason?: string; // Підстава зняття/виключення
  tck: string; // ТЦК та СП
  rank: string; // Звання
  registryNumber: string; // Номер в реєстрі Оберіг
  vos: string; // ВОС (BOC)
  note: string; // напр. "Потребує проходження базової загальновійськової підготовки,Солдат резерву"
  deferralType: string; // Тип відстрочки
  deferralUntilEnd?: string; // Відстрочка до завершення мобілізації
  policeReason?: string;
  policeDate?: string;
  vlkDecision?: string;
  vlkDate?: string;
  disabilityGroup?: string;
  disabilityValidUntil?: string;
  disabilityReason?: string;

  // Адреса та контакти
  address: string;
  email: string;
  phone: string;
  dataUpdateDate: string; // Дата уточнення даних
};

export const DEFAULT_MILITARY_DATA: MilitaryDocData = {
  validUntil: "30.05.2027",
  rnokpp: "3411511010",
  status: "Військовозобов'язаний",
  category: "Військовозобов'язаний",
  exclusionReason: "",
  tck: "Білоцерківський районний територіальний центр комплектування та соціальної підтримки",
  rank: "Солдат",
  registryNumber: "250220231362300200481",
  vos: "999097",
  note: "Потребує проходження базової загальновійськової підготовки, Солдат резерву",
  deferralType: "п.4 ч.1 ст.23",
  deferralUntilEnd: "",
  policeReason: "",
  policeDate: "",
  vlkDecision: "",
  vlkDate: "",
  disabilityGroup: "",
  disabilityValidUntil: "",
  disabilityReason: "",
  address: "Україна, Київська область, м Біла Церква, Фастівська, б. 2",
  email: "shillclub.dao@gmail.com",
  phone: "380952067447",
  dataUpdateDate: "21.05.2026",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function formatNow(): string {
  const n = new Date();
  return `${pad2(n.getDate())}.${pad2(n.getMonth() + 1)}.${n.getFullYear()}, ${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function generateQrDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 400,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  } catch (e) {
    console.warn("QR generation failed", e);
    return "";
  }
}

/**
 * Будує повний HTML-документ "Військово-обліковий документ".
 */
function buildHtml(
  profile: PdfProfile,
  data: MilitaryDocData,
  qrDataUrl: string,
): string {
  const fullName = `${profile.surname} ${profile.name} ${profile.patronymic}`.trim();
  const now = formatNow();

  const photoBlock = profile.photoBase64
    ? `<div class="photo"><img src="${profile.photoBase64}" alt="photo"/></div>`
    : `<div class="photo placeholder"><span>Фото</span></div>`;

  const qrBlock = qrDataUrl
    ? `<img class="qr-img" src="${qrDataUrl}" alt="qr"/>`
    : `<div class="qr-img placeholder"></div>`;

  const row = (label: string, value: string) => `
    <div class="row">
      <div class="row-label">${escapeHtml(label)}</div>
      <div class="row-value">${escapeHtml(value || "—")}</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8"/>
<title>Військово-обліковий документ</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, "Helvetica Neue", "Roboto", "Segoe UI", Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    font-size: 11px;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    padding: 24px 28px 28px;
  }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 2px solid #1a1a1a;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-logo {
    width: 36px; height: 36px;
    background: #1a1a1a;
    color: #fff;
    font-weight: 800;
    font-size: 22px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    letter-spacing: -1px;
  }
  .brand-text {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
  }
  .header-center {
    flex: 1;
    text-align: center;
    padding: 0 16px;
  }
  .doc-title {
    font-size: 18px;
    font-weight: 700;
    margin: 2px 0;
  }
  .doc-meta {
    font-size: 10px;
    color: #4a4a4a;
  }
  .ministry {
    text-align: right;
    font-size: 10px;
    color: #1a1a1a;
    line-height: 1.3;
    font-weight: 600;
    max-width: 130px;
  }

  /* SECTIONS */
  .section-title {
    margin-top: 18px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #1a1a1a;
    padding-bottom: 4px;
    border-bottom: 1px solid #b6b6b6;
  }

  /* TOP BLOCK: photo + main info + QR */
  .top-block {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .photo {
    width: 110px;
    height: 140px;
    border: 1px solid #b6b6b6;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f3ee;
    display: flex; align-items: center; justify-content: center;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .photo.placeholder span { color: #888; font-size: 10px; }
  .main-info {
    flex: 1;
  }
  .status-badge {
    display: inline-block;
    background: #FFF3D6;
    color: #6B5421;
    border: 1px solid #C9A451;
    border-radius: 4px;
    padding: 2px 10px;
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.4px;
  }
  .full-name {
    font-size: 17px;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .qr-box {
    width: 130px;
    flex-shrink: 0;
    text-align: center;
  }
  .qr-img {
    width: 130px;
    height: 130px;
    border: 1px solid #b6b6b6;
    border-radius: 6px;
    padding: 4px;
    background: #fff;
  }
  .qr-img.placeholder { background: #eee; }
  .qr-caption {
    font-size: 9px;
    color: #666;
    margin-top: 4px;
  }

  /* ROWS */
  .row {
    display: flex;
    padding: 5px 0;
    border-bottom: 1px dashed #d8d8d8;
    align-items: flex-start;
  }
  .row:last-child { border-bottom: none; }
  .row-label {
    flex: 0 0 42%;
    color: #55544B;
    font-size: 10.5px;
    padding-right: 8px;
  }
  .row-value {
    flex: 1;
    color: #1a1a1a;
    font-size: 11px;
    font-weight: 600;
    word-break: break-word;
  }

  /* FOOTER */
  .footer {
    margin-top: 22px;
    padding-top: 10px;
    border-top: 1px solid #b6b6b6;
    font-size: 9px;
    color: #4a4a4a;
    line-height: 1.5;
    text-align: justify;
  }
  .footer .star { color: #1a1a1a; font-weight: 700; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <div class="brand-logo">Р+</div>
      <div class="brand-text">Резерв+</div>
    </div>
    <div class="header-center">
      <div class="doc-title">Військово-обліковий документ</div>
      <div class="doc-meta">Сформовано: ${escapeHtml(now)}</div>
    </div>
    <div class="ministry">Міністерство<br/>оборони України</div>
  </div>

  <!-- ОСОБИСТА ІНФОРМАЦІЯ -->
  <div class="section-title">Особиста інформація</div>

  <div class="top-block">
    ${photoBlock}
    <div class="main-info">
      <div class="status-badge">${escapeHtml(data.status)}</div>
      <div class="full-name">${escapeHtml(fullName)}</div>
      ${row("Дата народження", profile.birthDate)}
      ${row("Дійсний до*", data.validUntil)}
      ${row("РНОКПП", data.rnokpp)}
    </div>
    <div class="qr-box">
      ${qrBlock}
      <div class="qr-caption">QR-код документа</div>
    </div>
  </div>

  <!-- ВІЙСЬКОВА ІНФОРМАЦІЯ -->
  <div class="section-title">Військова інформація</div>
  ${row("Категорія обліку", data.category)}
  ${row("Підстава зняття/виключення", data.exclusionReason || "")}
  ${row("ТЦК та СП", data.tck)}
  ${row("Звання", data.rank)}
  ${row("Номер в реєстрі Оберіг", data.registryNumber)}
  ${row("ВОС", data.vos)}
  ${row("", data.note)}
  ${row("Тип відстрочки", data.deferralType)}
  ${row("Відстрочка до", profile.deferralUntil || "")}
  ${row("Відстрочка до завершення мобілізації", data.deferralUntilEnd || "")}
  ${row("Причина звернення до Нацполіції", data.policeReason || "")}
  ${row("Дата звернення", data.policeDate || "")}
  ${row("Постанова ВЛК", data.vlkDecision || "")}
  ${row("Дата ВЛК", data.vlkDate || "")}
  ${row("Група інвалідності", data.disabilityGroup || "")}
  ${row("Діє до", data.disabilityValidUntil || "")}
  ${row("Причина інвалідності", data.disabilityReason || "")}

  <!-- АДРЕСА ТА КОНТАКТИ -->
  <div class="section-title">Адреса та контакти</div>
  ${row("Адреса проживання", data.address)}
  ${row("Email", data.email)}
  ${row("Телефон", data.phone)}
  ${row("Дата уточнення даних", data.dataUpdateDate)}

  <!-- FOOTER -->
  <div class="footer">
    <span class="star">*</span> Документ дійсний до зазначеної на ньому дати.
    Якщо вказані в ньому дані змінюються в Єдиному державному реєстрі призовників,
    військовозобов&apos;язаних і резервістів «Оберіг», документ втрачає чинність.
    Завантажуйте мобільний застосунок Резерв+ та користуйтеся завжди актуальним електронним документом.
  </div>

</div>
</body>
</html>`;
}

/**
 * Згенерувати та поділитися PDF "Військово-обліковий документ".
 * — На native: створюється локальний файл через expo-print і відкривається Share Sheet.
 * — На web: відкривається діалог друку / завантаження PDF.
 */
export async function generateAndShareMilitaryPdf(
  profile: PdfProfile,
  data: MilitaryDocData = DEFAULT_MILITARY_DATA,
): Promise<void> {
  try {
    // 1) Готуємо QR як data-URL
    const qrPayload = JSON.stringify({
      s: profile.surname,
      n: profile.name,
      p: profile.patronymic,
      b: profile.birthDate,
      r: data.rnokpp,
      reg: data.registryNumber,
      v: data.validUntil,
      t: Date.now(),
    });
    const qrDataUrl = await generateQrDataUrl(qrPayload);

    // 2) HTML
    const html = buildHtml(profile, data, qrDataUrl);

    if (Platform.OS === "web") {
      // На web — друк через невидимий iframe (дозволяє "Зберегти як PDF")
      const w = window.open("", "_blank");
      if (!w) {
        Alert.alert("Не вдалося відкрити вікно", "Дозвольте спливаючі вікна та спробуйте ще раз.");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      // невелика пауза, щоб контент відрендерився
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch {
          /* ignore */
        }
      }, 500);
      return;
    }

    // 3) Native: створюємо PDF-файл
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const safeName =
      `${profile.surname}_${profile.name}`.replace(/[^A-Za-zА-Яа-яЁёЇїІіЄєҐґ0-9_-]/g, "") ||
      "rezerv_plus";
    const fileName = `eVOD_${safeName}.pdf`;

    // 4) Шарінг (зберегти / надіслати)
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Зберегти або поділитися документом",
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert(
        "PDF створено",
        `Файл збережено: ${fileName}\nШлях: ${uri}`,
      );
    }
  } catch (e) {
    console.error("PDF generation failed", e);
    Alert.alert(
      "Помилка створення PDF",
      "Не вдалося згенерувати документ. Спробуйте ще раз.",
    );
  }
}
