import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "qrcode";
import { Platform, Alert } from "react-native";

import type { UserProfile } from "@/src/utils/profile";

const pad2 = (n: number) => String(n).padStart(2, "0");

function formatNow(): string {
  const n = new Date();
  return `${pad2(n.getDate())}.${pad2(n.getMonth() + 1)}.${n.getFullYear()}, ${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
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
 * Будує повний HTML-документ "Військово-обліковий документ" зі строгим 2-колонковим layout.
 * Дані повністю динамічні з UserProfile (AsyncStorage).
 */
function buildHtml(profile: UserProfile, qrDataUrl: string): string {
  const fullName = `${profile.surname} ${profile.name} ${profile.patronymic}`
    .replace(/\s+/g, " ")
    .trim();
  const now = formatNow();

  const photoBlock = profile.photoBase64
    ? `<div class="photo"><img src="${profile.photoBase64}" alt="photo"/></div>`
    : `<div class="photo placeholder"><span>Фото</span></div>`;

  const qrBlock = qrDataUrl
    ? `<img class="qr-img" src="${qrDataUrl}" alt="qr"/>`
    : `<div class="qr-img placeholder"></div>`;

  // 2-колонковий рядок: label зліва, value справа
  const row = (label: string, value: string | null | undefined) => `
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
  .page { padding: 22px 26px 26px; }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 2px solid #1a1a1a;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-logo {
    width: 38px; height: 38px;
    background: #1a1a1a; color: #fff;
    font-weight: 800; font-size: 22px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; letter-spacing: -1px;
  }
  .brand-text { font-size: 18px; font-weight: 700; }
  .header-center { flex: 1; text-align: center; padding: 0 16px; }
  .doc-title { font-size: 17px; font-weight: 700; margin: 0 0 2px; }
  .doc-meta { font-size: 9.5px; color: #4a4a4a; }
  .ministry {
    text-align: right;
    font-size: 9.5px;
    line-height: 1.3;
    font-weight: 600;
    max-width: 130px;
  }

  /* TOP IDENTITY BLOCK — 3 колонки: фото | ПІБ+статус | QR */
  .identity {
    display: grid;
    grid-template-columns: 120px 1fr 130px;
    gap: 14px;
    align-items: flex-start;
    margin-top: 14px;
  }
  .photo {
    width: 120px; height: 150px;
    border: 1px solid #b6b6b6;
    border-radius: 6px;
    overflow: hidden;
    background: #f3f3ee;
    display: flex; align-items: center; justify-content: center;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .photo.placeholder span { color: #888; font-size: 10px; }

  .identity-main { padding-top: 2px; }
  .status-badge {
    display: inline-block;
    background: #FFF3D6; color: #6B5421;
    border: 1px solid #C9A451;
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.4px;
  }
  .full-name {
    font-size: 17px; font-weight: 800;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
    line-height: 1.15;
  }

  .qr-box { text-align: center; }
  .qr-img {
    width: 130px; height: 130px;
    border: 1px solid #b6b6b6;
    border-radius: 6px;
    padding: 4px;
    background: #fff;
  }
  .qr-img.placeholder { background: #eee; }
  .qr-caption { font-size: 9px; color: #666; margin-top: 4px; }

  /* SECTION TITLES */
  .section-title {
    margin-top: 18px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #1a1a1a;
    padding-bottom: 4px;
    border-bottom: 1px solid #b6b6b6;
  }

  /* СУВОРИЙ 2-КОЛОНКОВИЙ GRID */
  .grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 22px;
  }
  .col { display: flex; flex-direction: column; }

  /* ROW */
  .row {
    display: grid;
    grid-template-columns: 45% 55%;
    padding: 5px 0;
    border-bottom: 1px dashed #d8d8d8;
    align-items: flex-start;
    gap: 6px;
  }
  .row-label {
    color: #55544B;
    font-size: 10px;
  }
  .row-value {
    color: #1a1a1a;
    font-size: 10.5px;
    font-weight: 600;
    word-break: break-word;
  }

  /* FULL WIDTH сегмент (адреса, ПІБ-блок) */
  .full-row { grid-column: 1 / -1; }

  /* FOOTER */
  .footer {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #b6b6b6;
    font-size: 8.5px;
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

  <!-- IDENTITY: photo | name+status | QR -->
  <div class="identity">
    ${photoBlock}
    <div class="identity-main">
      <div class="status-badge">${escapeHtml(profile.status)}</div>
      <div class="full-name">${escapeHtml(fullName)}</div>
      <div class="row">
        <div class="row-label">Дата народження</div>
        <div class="row-value">${escapeHtml(profile.birthDate)}</div>
      </div>
      <div class="row">
        <div class="row-label">Дійсний до*</div>
        <div class="row-value">${escapeHtml(profile.validUntil)}</div>
      </div>
      <div class="row">
        <div class="row-label">РНОКПП</div>
        <div class="row-value">${escapeHtml(profile.rnokpp)}</div>
      </div>
    </div>
    <div class="qr-box">
      ${qrBlock}
      <div class="qr-caption">QR-код документа</div>
    </div>
  </div>

  <!-- ВІЙСЬКОВА ІНФОРМАЦІЯ — 2 колонки -->
  <div class="section-title">Військова інформація</div>
  <div class="grid-2col">
    <div class="col">
      ${row("Категорія обліку", profile.category)}
      ${row("Звання", profile.rank)}
      ${row("ВОС", profile.vos)}
      ${row("Тип відстрочки", profile.deferralType)}
    </div>
    <div class="col">
      ${row("ТЦК та СП", profile.tck)}
      ${row("Номер в реєстрі Оберіг", profile.registryNumber)}
      ${row("Відстрочка до", profile.deferralUntil)}
      ${row("Примітка", profile.note)}
    </div>
  </div>

  <!-- АДРЕСА ТА КОНТАКТИ — 2 колонки -->
  <div class="section-title">Адреса та контакти</div>
  <div class="grid-2col">
    <div class="col">
      ${row("Телефон", profile.phone)}
      ${row("Email", profile.email)}
    </div>
    <div class="col">
      ${row("Адреса проживання", profile.address)}
      ${row("Дата уточнення даних", profile.dataUpdateDate)}
    </div>
  </div>

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
 * Приймає повний UserProfile (з AsyncStorage). Жодних дефолтних мокованих даних.
 */
export async function generateAndShareMilitaryPdf(profile: UserProfile): Promise<void> {
  try {
    const qrPayload = JSON.stringify({
      s: profile.surname,
      n: profile.name,
      p: profile.patronymic,
      b: profile.birthDate,
      r: profile.rnokpp,
      reg: profile.registryNumber,
      v: profile.validUntil,
      t: Date.now(),
    });
    const qrDataUrl = await generateQrDataUrl(qrPayload);
    const html = buildHtml(profile, qrDataUrl);

    if (Platform.OS === "web") {
      const w = window.open("", "_blank");
      if (!w) {
        Alert.alert("Не вдалося відкрити вікно", "Дозвольте спливаючі вікна та спробуйте ще раз.");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
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

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const safeName =
      `${profile.surname}_${profile.name}`.replace(/[^A-Za-zА-Яа-яЁёЇїІіЄєҐґ0-9_-]/g, "") ||
      "rezerv_plus";
    const fileName = `eVOD_${safeName}.pdf`;

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Зберегти або поділитися документом",
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert("PDF створено", `Файл збережено: ${fileName}\nШлях: ${uri}`);
    }
  } catch (e) {
    console.error("PDF generation failed", e);
    Alert.alert("Помилка створення PDF", "Не вдалося згенерувати документ. Спробуйте ще раз.");
  }
}
