import { useState, useCallback, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const N8N_WEBHOOK_URL = "https://n8n-bud4.onrender.com/webhook/tarjous";
const TARJOUS_WEBHOOK_URL = "https://n8n-bud4.onrender.com/webhook/tarjous-generaattori";
const LS_KEY = "pl_tarjous_v2";

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Asiakastiedot" },
  { id: 2, label: "Kohdetiedot" },
  { id: 3, label: "Urakan sisältö" },
  { id: 4, label: "Työvaiheet" },
  { id: 5, label: "Materiaalit" },
  { id: 6, label: "Kuvat" },
];

// ─── TEMPLATE & AIKATAULU ────────────────────────────────────────────────────
const TEMPLATE_MAP = {
  1: "faaa39c618cc52d6c66c2619af4a5864ed1e2a2dd5e2c7f3cf202d7209257858",
  2: "f840d53e4d19538d28ce0b8f6df826703e785601625a085c098082ff3265c80c",
  3: "7b7347449c29b1a83371df309d8c50fa90d5c5f558591c2e50d7d68210753efd",
};

const AIKATAULU_MAP = {
  "3–5 pv": { p1: "Päivä 1", p2: "Päivä 2", p3: "Päivä 3", p4: "Päivä 4", p5: "Päivä 5" },
  "4–6 pv": { p1: "Päivä 1", p2: "Päivä 2", p3: "Päivä 3–4", p4: "Päivä 5", p5: "Päivä 6" },
  "5–7 pv": { p1: "Päivä 1", p2: "Päivä 2–3", p3: "Päivä 4–5", p4: "Päivä 6", p5: "Päivä 7" },
  "6–8 pv": { p1: "Päivä 1", p2: "Päivä 2–3", p3: "Päivä 4–5", p4: "Päivä 6–7", p5: "Päivä 8" },
  "7–9 pv": { p1: "Päivä 1–2", p2: "Päivä 3–4", p3: "Päivä 5–6", p4: "Päivä 7–8", p5: "Päivä 9" },
};

// ─── OPTIONS ─────────────────────────────────────────────────────────────────
const KESTO_OPTIONS = [
  { value: "", label: "— Valitse —" },
  { value: "3–5 pv", label: "3–5 pv" },
  { value: "4–6 pv", label: "4–6 pv" },
  { value: "5–7 pv", label: "5–7 pv" },
  { value: "6–8 pv", label: "6–8 pv" },
  { value: "7–9 pv", label: "7–9 pv" },
];

const TYO_OPTIONS = [
  { value: "Julkisivun maalaus", label: "Julkisivun maalaus" },
  { value: "Tiilikaton pinnoitus", label: "Tiilikaton pinnoitus" },
];

const POHJAMATERIAALI_OPTIONS = [
  { value: "akrylaatti", label: "Akrylaatti" },
  { value: "oljymaali", label: "Öljymaali" },
  { value: "kuullote", label: "Kuullote" },
  { value: "vapaa", label: "Vapaa teksti" },
];

const POHJAMATERIAALI_TARKENNUS = {
  akrylaatti: ["Tikkurilan Vinha", "Tikkurilan Ultra Classic", "Teknos Nordica Eko", "Tikkurila Ultra Matt"],
  oljymaali: ["Virtasen 4 Öljyn Laatumaali", "Teho Öljymaali"],
  kuullote: ["Valtti Plus Color", "Värisilmä Pilke", "Virtasen 3 Öljyn Kuullote", "Valtti Color"],
};

const KUNTO_OPTIONS = [
  { value: "A", label: "Normaali" },
  { value: "B", label: "Tyydyttävä" },
  { value: "C", label: "Heikko" },
];

const VAURIO_OPTIONS = [
  { value: "ei juuri lainkaan", label: "Ei juuri lainkaan" },
  { value: "paikoittain", label: "Paikoittain" },
  { value: "laajasti", label: "Laajasti" },
];

const KERROS_OPTIONS = [
  { value: "1", label: "1 pintakerros" },
  { value: "2", label: "2 pintakerrosta" },
];

const NOSTIN_OPTIONS = [
  { value: "ei", label: "Ei tarvetta" },
  { value: "kylla", label: "Kyllä" },
];

const MAASTO_OPTIONS = [
  { value: "helppo", label: "Helppo" },
  { value: "normaali", label: "Normaali" },
  { value: "haastava", label: "Haastava" },
];

const RAKENNUS_NIMI_OPTIONS = [
  { value: "paarakennus", label: "Päärakennus" },
  { value: "autotalli", label: "Autotalli" },
  { value: "saunarakennus", label: "Saunarakennus" },
  { value: "piharakennus", label: "Piharakennus" },
  { value: "roskakatos", label: "Roskakatos" },
  { value: "muu", label: "Muu" },
];

const OSITTAINEN_CHECKS = [
  "Eteläpääty", "Pohjoispääty", "Länsipääty", "Itäpääty",
  "Räystäät", "Tiiliverhoilun puupinnat",
];

const TIMPURI_CHECKS = ["Lahot laudat", "Halkeamat", "Rakenteelliset korjaukset"];


const MAALATAAN_OPTIONS = [
  "Seinäpinnat", "Räystäänaluset ja otsalaudat", "Alakatot",
  "Ovi- ja ikkunapielet", "Nurkkalaudat", "Kaiteet",
  "Aidat", "Terassi", "Sokkeli",
];

const OPTIO_OPTIONS = [
  "Seinäpinnat", "Räystäänaluset ja otsalaudat", "Alakatot",
  "Ovi- ja ikkunapielet", "Nurkkalaudat", "Kaiteet",
  "Aidat", "Terassi", "Sokkeli",
];

const EI_MAALATA_OPTIONS = [
  "Seinäpinnat", "Räystäänaluset ja otsalaudat", "Alakatot",
  "Ovi- ja ikkunapielet", "Nurkkalaudat", "Kaiteet",
  "Aidat", "Ikkunanpokat", "Terassit", "Pergola", "Sokkeli",
];

const PESUAINE_OPTIONS = [
  { value: "homepesu", label: "Homepesu — Tikkurilan Homeenpoisto" },
  { value: "virtanen", label: "Homepesu — Virtasen Homeentappaja" },
  { value: "ei", label: "Ei pesuainetta" },
];



// ─── TYÖVAIHEET ──────────────────────────────────────────────────────────────
const TYOVAIHEET = [
  { idx: 0, nimi: "Timpurin työt", conditional: true, alaotsikot: ["Kohteelle saapuminen", "Suojaukset", "Telineet ja nostin"] },
  { idx: 1, nimi: "Työmaan valmistelu", alaotsikot: ["Kohteelle saapuminen", "Suojaukset", "Telineet ja nostin"] },
  { idx: 2, nimi: "Julkisivun pesu", alaotsikot: ["Pesuaineen käyttö"] },
  { idx: 3, nimi: "Kaavinta", alaotsikot: ["Laajuus kohteessa"] },
  { idx: 4, nimi: "Pohjamaalaus", alaotsikot: ["Kuivuminen"] },
  { idx: 5, nimi: "Pintamaalaus", alaotsikot: ["Toinen pintamaalikerros"] },
  { idx: 6, nimi: "Viimeistely", alaotsikot: ["Tarkastettavat kohdat"] },
  { idx: 7, nimi: "Työmaan siivous", alaotsikot: ["Suojausten poisto", "Siivous", "Telineiden purku"] },
  { idx: 8, nimi: "Lopputarkastus", alaotsikot: ["Takuu"] },
];

const TV_KUVATEKSTI = ["Yleiskuva työnvaiheesta", "Yleiskuva kohteesta"];

// ─── MATERIAALIT ─────────────────────────────────────────────────────────────
const TUOTTEET = {
  vesiohenteinen: {
    label: "Vesiohenteinen",
    pohja: [
      { nimi: "Ohennettu Pintamaali (yleispohjustus)", kaytto: "Puupaljaiden kohtien pohjamaalaukseen ennen pintamaalausta.", kestavyys: "Parantaa tartuntaa ja tasaa alustan.", url: "" },
      { nimi: "Ultra Primer", kaytto: "Puupaljaiden kohtien pohjamaalaukseen ennen pintamaalausta.", kestavyys: "Parantaa tartuntaa ja tasaa alustan.", url: "https://tikkurila.fi/tuotteet/ultra-primer" },
      { nimi: "Teho Primer", kaytto: "Puupaljaiden kohtien pohjamaalaukseen ennen pintamaalausta.", kestavyys: "Parantaa tartuntaa ja tasaa alustan.", url: "https://tikkurila.fi/pro/tuotteet/teho-primer" },
    ],
    pinta: [
      { nimi: "Tikkurilan Vinha", kaytto: "Puolihimmeä julkisivumaali.", kestavyys: "10–15 vuotta.", url: "https://tikkurila.fi/tuotteet/vinha" },
      { nimi: "Tikkurilan Ultra Classic", kaytto: "Puolihimmeä julkisivumaali.", kestavyys: "10–15 vuotta.", url: "https://tikkurila.fi/tuotteet/ultra-classic" },
      { nimi: "Teknos Nordica Eko", kaytto: "Kiiltävä julkisivumaali.", kestavyys: "10–15 vuotta.", url: "https://www.teknos.com/fi-FI/tuotteet/nordica-eko/" },
      { nimi: "Tikkurila Ultra Matt", kaytto: "Täysin matta julkisivumaali.", kestavyys: "10–15 vuotta.", url: "https://tikkurila.fi/tuotteet/ultra-matt" },
    ],
  },
  oljymaali: {
    label: "Öljymaali",
    pohja: [
      { nimi: "Virtasen Ulko-Vernissa", kaytto: "Toimii 4 Öljyn Maalin ohenteena ja puupaljaiden kohtien pohjustuksena.", kestavyys: "Parantaa pintamaalin imeytymistä ja kestävyyttä.", url: "https://www.virtasenmaalitehdas.fi/tuote/pellavaoljyvernissa/" },
    ],
    pinta: [
      { nimi: "Virtasen 4 Öljyn Laatumaali", kaytto: "Pintamaalaus, toteutetaan täysin pensselityönä.", kestavyys: "n. 10–15 vuotta.", url: "https://www.virtasenmaalitehdas.fi/tuote/virtasen-4-oljyn-laatumaali/" },
      { nimi: "Teho Öljymaali", kaytto: "Pintamaalaus täysin pensselityönä.", kestavyys: "n. 10–15 vuotta.", url: "https://tikkurila.com/products/teho-oljymaali" },
    ],
  },
  kuullote: {
    label: "Kuullote",
    pohja: [
      { nimi: "Valtti Pohjuste", kaytto: "Puupaljaille pinnoille ennen kuullotetta.", kestavyys: "Imeytyvä puunsuoja, ehkäisee lahovaurioita.", url: "https://tikkurila.fi/tuotteet/valtti-pohjuste" },
      { nimi: "Valtti Plus Pohjuste", kaytto: "Vaativiin olosuhteisiin ennen kuullotetta.", kestavyys: "Tehostettu kosteuden- ja homeenkesto.", url: "https://tikkurila.fi/tuotteet/valtti-plus-pohjuste" },
    ],
    pinta: [
      { nimi: "Valtti Plus Color", kaytto: "Kuullote ulkopuupinnoille.", kestavyys: "n. 5–7 vuotta.", url: "https://tikkurila.fi/tuotteet/valtti-plus-color" },
      { nimi: "Värisilmä Pilke", kaytto: "Kuullote ulkopuupinnoille.", kestavyys: "n. 5–7 vuotta.", url: "https://www.varisilma.fi/kuullote-varisilma-pilke-pm3-18l" },
      { nimi: "Virtasen 3 Öljyn Kuullote", kaytto: "Kuultava öljykäsittely, levitetään pensselityönä.", kestavyys: "n. 5–7 vuotta.", url: "https://www.virtasenmaalitehdas.fi/tuote/virtasen-3-oljyn-kuullote/" },
      { nimi: "Valtti Color", kaytto: "Perinteinen öljypohjainen kuullote, levitetään pensselityönä.", kestavyys: "n. 5–7 vuotta.", url: "https://tikkurila.fi/tuotteet/valtti-color" },
    ],
  },
};

const MUUT_MATERIAALIT_OPTIONS = [
  "Metallimaali — Ferrex Combi",
  "Terassiöljy — Valtti Plus Terrace Oil",
  "Terassiöljy — Valtti Terrace Oil",
  "Sokkelimaali — Yki Sokkelimaali",
  "Ovimaali — Unica Akva",
  "Ovimaali — Unica Akva Lakka",
  "Ovimaali — Futura Aqua 20",
  "Kaidemaali — Aitamaali",
];

// ─── MAPPINGS ────────────────────────────────────────────────────────────────
const POHJAMATERIAALI_MAP = {
  akrylaatti: "Akrylaatti", oljymaali: "Öljymaali", kuullote: "Kuullote", vapaa: "Vapaa teksti",
};
const KUNTO_MAP = { A: "Normaali", B: "Tyydyttävä", C: "Heikko" };
const MAASTO_MAP = { helppo: "Helppo", normaali: "Normaali", haastava: "Haastava" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }

function getBuildingName(state, prefix) {
  const nimi = state[`${prefix}nimi`];
  if (!nimi) return prefix === "rak1_" ? "Päärakennus" : prefix === "rak2_" ? "Rakennus 2" : "Rakennus 3";
  if (nimi === "muu") return state[`${prefix}nimi_muu`] || (prefix === "rak1_" ? "Rakennus 1" : prefix === "rak2_" ? "Rakennus 2" : "Rakennus 3");
  const opt = RAKENNUS_NIMI_OPTIONS.find(o => o.value === nimi);
  return opt ? opt.label : nimi;
}

function buildingDefaults(prefix, extra = {}) {
  return {
    [`${prefix}osittainen`]: false,
    [`${prefix}osittainen_check`]: [],
    [`${prefix}osittainen_seinaa`]: "",
    [`${prefix}osittainen_muu`]: "",
    [`${prefix}rakennettu_v`]: "",
    [`${prefix}maalattu_v`]: "",
    [`${prefix}pohjamateriaali`]: "akrylaatti",
    [`${prefix}pohjamateriaali_tarkennus`]: "",
    [`${prefix}pohjamateriaali_tarkennus_muu`]: "",
    [`${prefix}kunto`]: "B",
    [`${prefix}hilseily`]: "paikoittain",
    [`${prefix}kerrokset`]: "1",
    [`${prefix}timpuri`]: false,
    [`${prefix}timpuri_check`]: [],
    [`${prefix}timpuri_muu`]: "",
    [`${prefix}nostin`]: "ei",
    [`${prefix}pintaala`]: "",
    [`${prefix}raystasmetrit`]: "",
    [`${prefix}pesuaine`]: "homepesu",
    [`${prefix}maali_tyyppi`]: "vesiohenteinen",
    [`${prefix}pohjamaali_idx`]: 0,
    [`${prefix}pohjamaali_varisavy`]: "",
    [`${prefix}pintamaali_idx`]: 0,
    [`${prefix}pintamaali_varisavy`]: "",
    ...extra,
  };
}

function defaultState() {
  const s = {
    // Page 1
    asiakas_nimi: "", tarjous_nro: "", osoite: "", postinumero: "", kaupunki: "",
    paivamaara: today(), arvioitu_kesto: "", tarjottava_tyo: "Julkisivun maalaus",
    // Page 2
    rakennuksia: 1,
    ...buildingDefaults("rak1_", { rak1_nimi: "paarakennus", rak1_nimi_muu: "" }),
    ...buildingDefaults("rak2_", { rak2_nimi: "autotalli", rak2_nimi_muu: "" }),
    ...buildingDefaults("rak3_", { rak3_nimi: "piharakennus", rak3_nimi_muu: "" }),
    maasto: "helppo", maasto2: "helppo", maasto3: "helppo",
    // Page 3 — Urakan sisältö (universal)
    maalataan_check: [], maalataan_muu: "",
    optio_active: false, optio_check: [], optio_muu: "",
    ei_maalata_check: [], ei_maalata_muu: "",
    // Page 4 — TV
    lisatyot_rannit: false,
    lisatyot_rannit_kuva1_url: "", lisatyot_rannit_kuva1_preview: "", lisatyot_rannit_kuva1_uploading: false,
    lisatyot_rannit_kuva2_url: "", lisatyot_rannit_kuva2_preview: "", lisatyot_rannit_kuva2_uploading: false,
    tv9_kuvateksti_1: "", tv9_kuvateksti_2: "",
    lisatyo2_tyyppi: "ei", lisatyo2_otsikko: "", lisatyo2_teksti: "",
    lisatyo2_kuva1_url: "", lisatyo2_kuva1_preview: "", lisatyo2_kuva1_uploading: false,
    lisatyo2_kuva2_url: "", lisatyo2_kuva2_preview: "", lisatyo2_kuva2_uploading: false,
    lisatyo2_kuvateksti_1: "", lisatyo2_kuvateksti_2: "",
    // Page 5
    muut_materiaalit: [],
    // Page 6
    kansikuva_url: "", kansikuva_preview: "", kansikuva_uploading: false,
    // Tarjousteksti
    kohde_konteksti: "",
    tarjousteksti: "",
    tarjousteksti_loading: false,
  };
  // TV fields (TV0–TV8)
  for (let i = 0; i <= 8; i++) {
    s[`tv${i}_lisatiedot`] = "";
    s[`tv${i}_kuva1_url`] = ""; s[`tv${i}_kuva1_preview`] = ""; s[`tv${i}_kuva1_uploading`] = false;
    s[`tv${i}_kuva2_url`] = ""; s[`tv${i}_kuva2_preview`] = ""; s[`tv${i}_kuva2_uploading`] = false;
    s[`tv${i}_kuvateksti_1`] = ""; s[`tv${i}_kuvateksti_2`] = "";
  }
  // Extra building images
  for (const pfx of ["rak2_", "rak3_"]) {
    for (let i = 1; i <= 6; i++) {
      s[`${pfx}img${i}_url`] = ""; s[`${pfx}img${i}_preview`] = ""; s[`${pfx}img${i}_uploading`] = false;
      s[`${pfx}img${i}_teksti`] = "";
    }
  }
  return s;
}

function initState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const clean = { ...defaultState(), ...parsed };
      Object.keys(clean).forEach(k => { if (k.endsWith("_uploading")) clean[k] = false; });
      return clean;
    }
  } catch {}
  return defaultState();
}

// ─── IMAGE CROP ─────────────────────────────────────────────────────────────
function cropImageToRatio(file, aspectRatio) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
      const currentRatio = img.width / img.height;

      if (currentRatio > aspectRatio) {
        srcW = img.height * aspectRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / aspectRatio;
        srcY = (img.height - srcH) / 2;
      }

      canvas.width = srcW;
      canvas.height = srcH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    };
    img.src = url;
  });
}

// ─── CLOUDINARY UPLOAD ───────────────────────────────────────────────────────
async function uploadToCloudinary(file) {
  const CLOUD_NAME = "dv0juhh4c";
  const UPLOAD_PRESET = "lwgiaqwn";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { url: data.secure_url };
}

// ─── FORM COMPONENTS ─────────────────────────────────────────────────────────
function Input({ label, required, ...props }) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="req">*</span>}</label>
      <input {...props} />
    </div>
  );
}

function Select({ label, required, options, ...props }) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="req">*</span>}</label>
      <select {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, required, ...props }) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="req">*</span>}</label>
      <textarea rows={3} {...props} />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="toggle-group">
        <button type="button" className={`toggle-btn ${!value ? "active" : ""}`} onClick={() => onChange(false)}>Ei</button>
        <button type="button" className={`toggle-btn ${value ? "active" : ""}`} onClick={() => onChange(true)}>Kyllä</button>
      </div>
    </div>
  );
}

function Checklist({ label, options, checked, onChange, extraValue, onExtraChange, extraPlaceholder }) {
  const toggle = (opt) => {
    if (checked.includes(opt)) onChange(checked.filter(c => c !== opt));
    else onChange([...checked, opt]);
  };
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className="checklist">
        {options.map(opt => (
          <label key={opt} className={`check-item ${checked.includes(opt) ? "checked" : ""}`}>
            <input type="checkbox" checked={checked.includes(opt)} onChange={() => toggle(opt)} />
            <span className="check-box">{checked.includes(opt) ? "✓" : ""}</span>
            {opt}
          </label>
        ))}
        {onExtraChange !== undefined && (
          <div className="check-extra">
            <input type="text" value={extraValue} onChange={e => onExtraChange(e.target.value)} placeholder={extraPlaceholder || "Muu..."} />
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUploadField({ label, previewUrl, isUploading, onFile, onRemove, kuvatekstiOptions, kuvatekstiValue, onKuvatekstiChange }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const handleFile = (e) => { if (e.target.files[0]) { onFile(e.target.files[0]); e.target.value = ""; } };
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className={`img-drop ${previewUrl ? "has-img" : ""} ${isUploading ? "uploading" : ""}`}>
        {isUploading ? (
          <div className="upload-loading"><span className="spinner">&#x27F3;</span><span>Ladataan...</span></div>
        ) : previewUrl ? (
          <div className="img-preview">
            <img src={previewUrl} alt={label} />
            <button type="button" className="img-remove" onClick={e => { e.stopPropagation(); onRemove(); }}>✕</button>
          </div>
        ) : (
          <div className="img-pick-buttons">
            <button type="button" className="img-pick-btn" onClick={() => cameraRef.current?.click()}>📷 Ota kuva</button>
            <button type="button" className="img-pick-btn" onClick={() => galleryRef.current?.click()}>🖼 Galleria</button>
          </div>
        )}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </div>
      {kuvatekstiOptions && onKuvatekstiChange && (() => {
        const isCustom = kuvatekstiValue !== "" && !kuvatekstiOptions.includes(kuvatekstiValue);
        const isMuuSelected = kuvatekstiValue === "__muu__" || isCustom;
        return (
          <div className="kuvateksti-row">
            <select value={isMuuSelected ? "__muu__" : kuvatekstiValue} onChange={e => { onKuvatekstiChange(e.target.value === "__muu__" ? "__muu__" : e.target.value); }}>
              <option value="">— Valitse kuvateksti —</option>
              {kuvatekstiOptions.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="__muu__">Oma teksti...</option>
            </select>
            {isMuuSelected && (
              <input type="text" value={kuvatekstiValue === "__muu__" ? "" : kuvatekstiValue} onChange={e => onKuvatekstiChange(e.target.value || "__muu__")} placeholder="Kirjoita kuvateksti..." />
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── BUILDING SECTION ────────────────────────────────────────────────────────
function BuildingContent({ prefix, state, update }) {
  return (
    <>
      {/* Building name */}
      <div className="grid-2">
        <Select label="Rakennuksen nimi" options={RAKENNUS_NIMI_OPTIONS} value={state[`${prefix}nimi`]} onChange={e => update(`${prefix}nimi`, e.target.value)} />
        {state[`${prefix}nimi`] === "muu" && (
          <Input label="Tarkenna nimi" value={state[`${prefix}nimi_muu`]} onChange={e => update(`${prefix}nimi_muu`, e.target.value)} placeholder="Esim. Varasto" />
        )}
      </div>

      {/* Osittainen maalaus */}
      <Toggle label="Osittainen maalaus" value={state[`${prefix}osittainen`]} onChange={v => update(`${prefix}osittainen`, v)} />
      {state[`${prefix}osittainen`] && (
        <div style={{ marginBottom: 16 }}>
          <Checklist options={OSITTAINEN_CHECKS} checked={state[`${prefix}osittainen_check`]} onChange={v => update(`${prefix}osittainen_check`, v)} />
          <div className="grid-2" style={{ marginTop: 8 }}>
            <Input label="X seinää (lukumäärä)" type="number" value={state[`${prefix}osittainen_seinaa`]} onChange={e => update(`${prefix}osittainen_seinaa`, e.target.value)} placeholder="Esim. 3" />
            <Input label="Muu" value={state[`${prefix}osittainen_muu`]} onChange={e => update(`${prefix}osittainen_muu`, e.target.value)} placeholder="Muu tarkennus..." />
          </div>
        </div>
      )}

      {/* Perustiedot */}
      <div className="grid-2">
        <Input label="Rakennettu vuonna" required type="number" value={state[`${prefix}rakennettu_v`]} onChange={e => update(`${prefix}rakennettu_v`, e.target.value)} placeholder="1985" />
        <Input label="Viimeksi maalattu" type="number" value={state[`${prefix}maalattu_v`]} onChange={e => update(`${prefix}maalattu_v`, e.target.value)} placeholder="2010" />
      </div>

      {/* Pohjamateriaali — toggle + optional tarkennus */}
      <div className="field">
        <label className="field-label">Pohjamateriaali <span className="required">*</span></label>
        <div className="toggle-group">
          {POHJAMATERIAALI_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              className={`toggle-btn ${state[`${prefix}pohjamateriaali`] === opt.value ? "active" : ""}`}
              onClick={() => { update(`${prefix}pohjamateriaali`, opt.value); update(`${prefix}pohjamateriaali_tarkennus`, ""); update(`${prefix}pohjamateriaali_tarkennus_muu`, ""); }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {state[`${prefix}pohjamateriaali`] === "vapaa" ? (
        <Input label="Tarkenna pohjamateriaali" value={state[`${prefix}pohjamateriaali_tarkennus`]} onChange={e => update(`${prefix}pohjamateriaali_tarkennus`, e.target.value)} placeholder="Kirjoita vapaamuotoinen kuvaus..." />
      ) : POHJAMATERIAALI_TARKENNUS[state[`${prefix}pohjamateriaali`]] && (
        <>
          <div className="field">
            <label className="field-label">Tarkenna maali (valinnainen)</label>
            <select value={state[`${prefix}pohjamateriaali_tarkennus`]} onChange={e => { update(`${prefix}pohjamateriaali_tarkennus`, e.target.value); if (e.target.value !== "__muu__") update(`${prefix}pohjamateriaali_tarkennus_muu`, ""); }}>
              <option value="">— Ei tarkennusta —</option>
              {POHJAMATERIAALI_TARKENNUS[state[`${prefix}pohjamateriaali`]].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__muu__">Muu...</option>
            </select>
          </div>
          {state[`${prefix}pohjamateriaali_tarkennus`] === "__muu__" && (
            <Input label="Kirjoita maali" value={state[`${prefix}pohjamateriaali_tarkennus_muu`]} onChange={e => update(`${prefix}pohjamateriaali_tarkennus_muu`, e.target.value)} placeholder="Esim. Teknos Woodex Aqua Classic" />
          )}
        </>
      )}
      <Select label="Pinnan kunto" required options={KUNTO_OPTIONS} value={state[`${prefix}kunto`]} onChange={e => update(`${prefix}kunto`, e.target.value)} />

      {/* Vauriot */}
      <label className="field-label" style={{ marginBottom: 8 }}>Vauriot</label>
      <div className="vauriot-grid">
        <Select label="Hilseilyä" required options={VAURIO_OPTIONS} value={state[`${prefix}hilseily`]} onChange={e => update(`${prefix}hilseily`, e.target.value)} />
      </div>

      {/* Pintakerrokset */}
      <Select label="Pintakerrokset" options={KERROS_OPTIONS} value={state[`${prefix}kerrokset`]} onChange={e => update(`${prefix}kerrokset`, e.target.value)} />

      {/* Timpuri */}
      <Toggle label="Timpurin työt" value={state[`${prefix}timpuri`]} onChange={v => update(`${prefix}timpuri`, v)} />
      {state[`${prefix}timpuri`] && (
        <Checklist options={TIMPURI_CHECKS} checked={state[`${prefix}timpuri_check`]} onChange={v => update(`${prefix}timpuri_check`, v)} extraValue={state[`${prefix}timpuri_muu`]} onExtraChange={v => update(`${prefix}timpuri_muu`, v)} extraPlaceholder="Muu timpurityö..." />
      )}

      {/* Nostin */}
      <Select label="Nostintarve" options={NOSTIN_OPTIONS} value={state[`${prefix}nostin`]} onChange={e => update(`${prefix}nostin`, e.target.value)} />

      {/* Maasto */}
      {prefix === "rak1_" && (
        <Select label="Maasto" options={MAASTO_OPTIONS} value={state.maasto} onChange={e => update("maasto", e.target.value)} />
      )}
      {prefix === "rak2_" && (
        <Select label="Maasto" options={MAASTO_OPTIONS} value={state.maasto2 || "helppo"} onChange={e => update("maasto2", e.target.value)} />
      )}
      {prefix === "rak3_" && (
        <Select label="Maasto" options={MAASTO_OPTIONS} value={state.maasto3 || "helppo"} onChange={e => update("maasto3", e.target.value)} />
      )}

      {/* Mittaukset */}
      <div className="grid-2">
        <Input label="Pinta-ala (m²)" required type="number" value={state[`${prefix}pintaala`]} onChange={e => update(`${prefix}pintaala`, e.target.value)} placeholder="250" />
        <Input label="Räystäsmetrit (jm)" type="number" value={state[`${prefix}raystasmetrit`]} onChange={e => update(`${prefix}raystasmetrit`, e.target.value)} placeholder="45" />
      </div>
    </>
  );
}

// ─── MATERIAL SECTION PER BUILDING ───────────────────────────────────────────
function MaterialSection({ prefix, state, update, title }) {
  const tyyppiKey = state[`${prefix}maali_tyyppi`] || "vesiohenteinen";
  const tyyppi = TUOTTEET[tyyppiKey] || TUOTTEET.vesiohenteinen;
  const pohjaOptions = tyyppi.pohja;
  const pintaOptions = tyyppi.pinta;
  const pohjaRaw = state[`${prefix}pohjamaali_idx`];
  const isSelvPohja = pohjaRaw === "selvityksessa";
  const pohjaIdx = isSelvPohja ? -1 : Math.min(Number(pohjaRaw) || 0, pohjaOptions.length - 1);
  const pintaRaw = state[`${prefix}pintamaali_idx`];
  const isSelvPinta = pintaRaw === "selvityksessa";
  const pintaIdx = isSelvPinta ? -1 : Math.min(Number(pintaRaw) || 0, pintaOptions.length - 1);

  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>

      <Select label="Pesuaine" options={PESUAINE_OPTIONS} value={state[`${prefix}pesuaine`]} onChange={e => update(`${prefix}pesuaine`, e.target.value)} />

      <div className="field">
        <label className="field-label">Maalityyppi</label>
        <div className="toggle-group">
          {Object.entries(TUOTTEET).map(([k, v]) => (
            <button key={k} type="button" className={`toggle-btn ${tyyppiKey === k ? "active" : ""}`}
              onClick={() => { update(`${prefix}maali_tyyppi`, k); update(`${prefix}pohjamaali_idx`, 0); update(`${prefix}pintamaali_idx`, 0); }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mat-section">
        <h4>Pohjamaali</h4>
        <div className="field">
          <label className="field-label">Tuote</label>
          <select value={isSelvPohja ? "selvityksessa" : pohjaIdx} onChange={e => { const v = e.target.value; update(`${prefix}pohjamaali_idx`, v === "selvityksessa" ? "selvityksessa" : Number(v)); }}>
            {pohjaOptions.map((p, i) => <option key={i} value={i}>{p.nimi}</option>)}
            <option value="selvityksessa">Selvityksessä</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Värisävy</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="text" value={state[`${prefix}pohjamaali_varisavy`]} onChange={e => update(`${prefix}pohjamaali_varisavy`, e.target.value)} placeholder="Esim. sävyyn taitettu" style={{ flex: 1 }} />
            <button type="button" className={`toggle-btn${state[`${prefix}pohjamaali_varisavy`] === "Selvityksessä" ? " active" : ""}`} style={{ whiteSpace: "nowrap", fontSize: 13 }}
              onClick={() => update(`${prefix}pohjamaali_varisavy`, state[`${prefix}pohjamaali_varisavy`] === "Selvityksessä" ? "" : "Selvityksessä")}>Selvityksessä</button>
          </div>
        </div>
      </div>

      <div className="mat-section">
        <h4>Pintamaali</h4>
        <div className="field">
          <label className="field-label">Tuote</label>
          <select value={isSelvPinta ? "selvityksessa" : pintaIdx} onChange={e => { const v = e.target.value; update(`${prefix}pintamaali_idx`, v === "selvityksessa" ? "selvityksessa" : Number(v)); }}>
            {pintaOptions.map((p, i) => <option key={i} value={i}>{p.nimi}</option>)}
            <option value="selvityksessa">Selvityksessä</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Värisävy <span className="required">*</span></label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="text" value={state[`${prefix}pintamaali_varisavy`]} onChange={e => update(`${prefix}pintamaali_varisavy`, e.target.value)} placeholder="Esim. Q616 / W222" style={{ flex: 1 }} />
            <button type="button" className={`toggle-btn${state[`${prefix}pintamaali_varisavy`] === "Selvityksessä" ? " active" : ""}`} style={{ whiteSpace: "nowrap", fontSize: 13 }}
              onClick={() => update(`${prefix}pintamaali_varisavy`, state[`${prefix}pintamaali_varisavy`] === "Selvityksessä" ? "" : "Selvityksessä")}>Selvityksessä</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 1 — ASIAKASTIEDOT ──────────────────────────────────────────────────
function Page1({ state, update }) {
  return (
    <div>
      <h2 className="page-title">Asiakastiedot</h2>
      <div className="card">
        <Input label="Asiakkaan nimi" required value={state.asiakas_nimi} onChange={e => update("asiakas_nimi", e.target.value)} placeholder="Etunimi Sukunimi" />
        <Input label="Tarjous nro" required value={state.tarjous_nro} onChange={e => update("tarjous_nro", e.target.value)} placeholder="2025-001" />
        <Input label="Osoite" required value={state.osoite} onChange={e => update("osoite", e.target.value)} placeholder="Katuosoite" />
        <div className="grid-2">
          <Input label="Postinumero" value={state.postinumero} onChange={e => update("postinumero", e.target.value)} placeholder="00100" />
          <Input label="Kaupunki" value={state.kaupunki} onChange={e => update("kaupunki", e.target.value)} placeholder="Helsinki" />
        </div>
        <Input label="Päivämäärä" required type="date" value={state.paivamaara} onChange={e => update("paivamaara", e.target.value)} />
        <div className="grid-2">
          <Select label="Arvioitu kesto" required options={KESTO_OPTIONS} value={state.arvioitu_kesto} onChange={e => update("arvioitu_kesto", e.target.value)} />
          <Select label="Tarjottava työ" required options={TYO_OPTIONS} value={state.tarjottava_tyo} onChange={e => update("tarjottava_tyo", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 2 — KOHTEEN PERUSTIEDOT ────────────────────────────────────────────
function Page2({ state, update, addBuilding }) {
  const [openSections, setOpenSections] = useState({ rak1: true, rak2: false, rak3: false });
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div>
      <h2 className="page-title">Kohteen perustiedot</h2>

      {/* Rakennus 1 */}
      <div className="collapse-card">
        <button type="button" className="collapse-toggle" onClick={() => toggleSection("rak1")}>
          <span className="collapse-title">{getBuildingName(state, "rak1_")}</span>
          <span className={`collapse-arrow ${openSections.rak1 ? "open" : ""}`}>▾</span>
        </button>
        {openSections.rak1 && (
          <div className="collapse-body">
            <BuildingContent prefix="rak1_" state={state} update={update} />
          </div>
        )}
      </div>

      {/* Rakennus 2 */}
      {state.rakennuksia >= 2 && (
        <div className="collapse-card">
          <button type="button" className="collapse-toggle" onClick={() => toggleSection("rak2")}>
            <span className="collapse-title">{getBuildingName(state, "rak2_")}</span>
            <span className={`collapse-arrow ${openSections.rak2 ? "open" : ""}`}>▾</span>
          </button>
          {openSections.rak2 && (
            <div className="collapse-body">
              <BuildingContent prefix="rak2_" state={state} update={update} />
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button type="button" className="btn-remove-big" onClick={() => update("rakennuksia", state.rakennuksia - 1)}>Poista rakennus</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rakennus 3 */}
      {state.rakennuksia >= 3 && (
        <div className="collapse-card">
          <button type="button" className="collapse-toggle" onClick={() => toggleSection("rak3")}>
            <span className="collapse-title">{getBuildingName(state, "rak3_")}</span>
            <span className={`collapse-arrow ${openSections.rak3 ? "open" : ""}`}>▾</span>
          </button>
          {openSections.rak3 && (
            <div className="collapse-body">
              <BuildingContent prefix="rak3_" state={state} update={update} />
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button type="button" className="btn-remove-big" onClick={() => update("rakennuksia", state.rakennuksia - 1)}>Poista rakennus</button>
              </div>
            </div>
          )}
        </div>
      )}

      {state.rakennuksia < 3 && (
        <button type="button" className="btn-add" onClick={addBuilding}>
          + Lisää rakennus
        </button>
      )}

    </div>
  );
}

// ─── PAGE 3 — URAKAN SISÄLTÖ ─────────────────────────────────────────────────
function Page3({ state, update }) {
  const [openSections, setOpenSections] = useState({ maalataan: true, optio: false, ei_maalata: false });
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const maalataanCount = (state.maalataan_check?.length || 0) + (state.maalataan_muu ? 1 : 0);
  const optioCount = state.optio_active ? (state.optio_check?.length || 0) + (state.optio_muu ? 1 : 0) : 0;
  const eiMaalataCount = (state.ei_maalata_check?.length || 0) + (state.ei_maalata_muu ? 1 : 0);

  return (
    <div>
      <h2 className="page-title">Urakan sisältö</h2>

      {/* Maalataan */}
      <div className="collapse-card">
        <button type="button" className="collapse-toggle" onClick={() => toggleSection("maalataan")}>
          <span className="collapse-title">
            Maalataan
            {maalataanCount > 0 && <span className="collapse-count">{maalataanCount}</span>}
          </span>
          <span className={`collapse-arrow ${openSections.maalataan ? "open" : ""}`}>▾</span>
        </button>
        {openSections.maalataan && (
          <div className="collapse-body">
            <Checklist
              options={MAALATAAN_OPTIONS}
              checked={state.maalataan_check || []}
              onChange={v => update("maalataan_check", v)}
              extraValue={state.maalataan_muu || ""}
              onExtraChange={v => update("maalataan_muu", v)}
              extraPlaceholder="Muu mikä..."
            />
          </div>
        )}
      </div>

      {/* Optiot */}
      <div className="collapse-card">
        <button type="button" className="collapse-toggle" onClick={() => toggleSection("optio")}>
          <span className="collapse-title">
            Optiot
            {optioCount > 0 && <span className="collapse-count">{optioCount}</span>}
          </span>
          <span className={`collapse-arrow ${openSections.optio ? "open" : ""}`}>▾</span>
        </button>
        {openSections.optio && (
          <div className="collapse-body">
            <Toggle label="Lisätäänkö optioita urakkaan?" value={state.optio_active || false} onChange={v => update("optio_active", v)} />
            {state.optio_active && (
              <Checklist
                options={OPTIO_OPTIONS}
                checked={state.optio_check || []}
                onChange={v => update("optio_check", v)}
                extraValue={state.optio_muu || ""}
                onExtraChange={v => update("optio_muu", v)}
                extraPlaceholder="Lisää optio..."
              />
            )}
          </div>
        )}
      </div>

      {/* Ei maalata */}
      <div className="collapse-card">
        <button type="button" className="collapse-toggle" onClick={() => toggleSection("ei_maalata")}>
          <span className="collapse-title">
            Ei maalata
            {eiMaalataCount > 0 && <span className="collapse-count">{eiMaalataCount}</span>}
          </span>
          <span className={`collapse-arrow ${openSections.ei_maalata ? "open" : ""}`}>▾</span>
        </button>
        {openSections.ei_maalata && (
          <div className="collapse-body">
            <Checklist
              options={EI_MAALATA_OPTIONS}
              checked={state.ei_maalata_check || []}
              onChange={v => update("ei_maalata_check", v)}
              extraValue={state.ei_maalata_muu || ""}
              onExtraChange={v => update("ei_maalata_muu", v)}
              extraPlaceholder="Muu..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE 4 — TYÖVAIHEET ─────────────────────────────────────────────────────
function Page4({ state, update, onImageUpload }) {
  const [open, setOpen] = useState({});
  const showTV0 = state.rak1_timpuri || state.rak2_timpuri || state.rak3_timpuri;

  const visiblePhases = TYOVAIHEET.filter(tv => {
    if (tv.conditional && !showTV0) return false;
    return true;
  });

  return (
    <div>
      <h2 className="page-title">Työvaiheet</h2>
      <p className="hint">Lisätiedot-kenttä vaikuttaa ChatGPT:n generoimaan tekstiin. Jätä tyhjäksi jos standardin mukainen.</p>

      {visiblePhases.map(tv => (
        <div key={tv.idx} className="phase-block">
          <button type="button" className="phase-toggle" onClick={() => setOpen(o => ({ ...o, [tv.idx]: !o[tv.idx] }))}>
            <span className="phase-num">{tv.idx}</span>
            <span className="phase-name">
              {tv.nimi}
              {tv.alaotsikot && tv.alaotsikot.length > 0 && (
                <span className="phase-subs">{tv.alaotsikot.join(" · ")}</span>
              )}
            </span>
            <span className="phase-arrow">{open[tv.idx] ? "▲" : "▼"}</span>
          </button>
          {open[tv.idx] && (
            <div className="phase-body">
              <Textarea label="Lisätiedot / poikkeamat" value={state[`tv${tv.idx}_lisatiedot`]} onChange={e => update(`tv${tv.idx}_lisatiedot`, e.target.value)} placeholder="Jätä tyhjäksi jos standardin mukainen..." />
              <div className="grid-2">
                <ImageUploadField label="Kuva 1" previewUrl={state[`tv${tv.idx}_kuva1_preview`]} isUploading={state[`tv${tv.idx}_kuva1_uploading`]}
                  onFile={file => onImageUpload(file, `tv${tv.idx}_kuva1`)}
                  onRemove={() => { update(`tv${tv.idx}_kuva1_url`, ""); update(`tv${tv.idx}_kuva1_preview`, ""); }}
                  kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state[`tv${tv.idx}_kuvateksti_1`]}
                  onKuvatekstiChange={v => update(`tv${tv.idx}_kuvateksti_1`, v)} />
                <ImageUploadField label="Kuva 2" previewUrl={state[`tv${tv.idx}_kuva2_preview`]} isUploading={state[`tv${tv.idx}_kuva2_uploading`]}
                  onFile={file => onImageUpload(file, `tv${tv.idx}_kuva2`)}
                  onRemove={() => { update(`tv${tv.idx}_kuva2_url`, ""); update(`tv${tv.idx}_kuva2_preview`, ""); }}
                  kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state[`tv${tv.idx}_kuvateksti_2`]}
                  onKuvatekstiChange={v => update(`tv${tv.idx}_kuvateksti_2`, v)} />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Lisätyöt */}
      <div className="lisatyot-section">
        <h3 className="section-title">Lisätyöt</h3>

        <div className="card">
          <h4 className="section-subtitle">Lisätyö 1 — Räystäskourujen ja syöksytorvien pesu</h4>
          <Toggle label="Sisältyykö urakkaan?" value={state.lisatyot_rannit} onChange={v => update("lisatyot_rannit", v)} />
          {state.lisatyot_rannit && (
            <div className="grid-2">
              <ImageUploadField label="Kuva 1" previewUrl={state.lisatyot_rannit_kuva1_preview} isUploading={state.lisatyot_rannit_kuva1_uploading}
                onFile={file => onImageUpload(file, "lisatyot_rannit_kuva1")}
                onRemove={() => { update("lisatyot_rannit_kuva1_url", ""); update("lisatyot_rannit_kuva1_preview", ""); }}
                kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state.tv9_kuvateksti_1}
                onKuvatekstiChange={v => update("tv9_kuvateksti_1", v)} />
              <ImageUploadField label="Kuva 2" previewUrl={state.lisatyot_rannit_kuva2_preview} isUploading={state.lisatyot_rannit_kuva2_uploading}
                onFile={file => onImageUpload(file, "lisatyot_rannit_kuva2")}
                onRemove={() => { update("lisatyot_rannit_kuva2_url", ""); update("lisatyot_rannit_kuva2_preview", ""); }}
                kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state.tv9_kuvateksti_2}
                onKuvatekstiChange={v => update("tv9_kuvateksti_2", v)} />
            </div>
          )}
        </div>

        <div className="card">
          <h4 className="section-subtitle">Lisätyö 2 — Vapaa lisätyö</h4>
          <div className="field">
            <label className="field-label">Tyyppi</label>
            <div className="toggle-group">
              {[{ value: "ei", label: "Ei" }, { value: "ikkunanpesu", label: "Ikkunoiden pesu" }, { value: "muu", label: "Muu lisätyö" }].map(opt => (
                <button key={opt.value} type="button"
                  className={`toggle-btn ${state.lisatyo2_tyyppi === opt.value ? "active" : ""}`}
                  onClick={() => { update("lisatyo2_tyyppi", opt.value); update("lisatyo2_otsikko", ""); update("lisatyo2_teksti", ""); }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {state.lisatyo2_tyyppi === "muu" && (
            <>
              <Input label="Otsikko" value={state.lisatyo2_otsikko} onChange={e => update("lisatyo2_otsikko", e.target.value)} placeholder="Lisätyön otsikko..." />
              <div className="grid-2">
                <ImageUploadField label="Kuva 1" previewUrl={state.lisatyo2_kuva1_preview} isUploading={state.lisatyo2_kuva1_uploading}
                  onFile={file => onImageUpload(file, "lisatyo2_kuva1")}
                  onRemove={() => { update("lisatyo2_kuva1_url", ""); update("lisatyo2_kuva1_preview", ""); }}
                  kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state.lisatyo2_kuvateksti_1}
                  onKuvatekstiChange={v => update("lisatyo2_kuvateksti_1", v)} />
                <ImageUploadField label="Kuva 2" previewUrl={state.lisatyo2_kuva2_preview} isUploading={state.lisatyo2_kuva2_uploading}
                  onFile={file => onImageUpload(file, "lisatyo2_kuva2")}
                  onRemove={() => { update("lisatyo2_kuva2_url", ""); update("lisatyo2_kuva2_preview", ""); }}
                  kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state.lisatyo2_kuvateksti_2}
                  onKuvatekstiChange={v => update("lisatyo2_kuvateksti_2", v)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 5 — MATERIAALIT ────────────────────────────────────────────────────
function Page5({ state, update }) {
  const toggleMuut = (item) => {
    const current = state.muut_materiaalit || [];
    if (current.includes(item)) {
      update("muut_materiaalit", current.filter(c => c !== item));
    } else if (current.length < 3) {
      update("muut_materiaalit", [...current, item]);
    }
  };

  return (
    <div>
      <h2 className="page-title">Materiaalit</h2>

      <MaterialSection prefix="rak1_" state={state} update={update} title={`${getBuildingName(state, "rak1_")} — Materiaalit`} />

      {state.rakennuksia >= 2 && (
        <MaterialSection prefix="rak2_" state={state} update={update} title={`${getBuildingName(state, "rak2_")} — Materiaalit`} />
      )}

      {state.rakennuksia >= 3 && (
        <MaterialSection prefix="rak3_" state={state} update={update} title={`${getBuildingName(state, "rak3_")} — Materiaalit`} />
      )}

      {/* Muut materiaalit */}
      <div className="card">
        <h3 className="section-title">Muut materiaalit</h3>
        <p className="multi-select-info">Valitse enintään 3</p>
        <div className="checklist">
          {MUUT_MATERIAALIT_OPTIONS.map(item => (
            <label key={item} className={`check-item ${(state.muut_materiaalit || []).includes(item) ? "checked" : ""}`}>
              <input type="checkbox" checked={(state.muut_materiaalit || []).includes(item)} onChange={() => toggleMuut(item)} />
              <span className="check-box">{(state.muut_materiaalit || []).includes(item) ? "✓" : ""}</span>
              {item}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 6 — KUVAT ─────────────────────────────────────────────────────────
function Page6({ state, update, onImageUpload, onGenerateTarjous }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <h2 className="page-title">Kuvat</h2>

      <div className="card">
        <h3 className="section-title">Kansikuva</h3>
        <ImageUploadField label="Kansikuva (etusivu) *" previewUrl={state.kansikuva_preview} isUploading={state.kansikuva_uploading}
          onFile={file => onImageUpload(file, "kansikuva")}
          onRemove={() => { update("kansikuva_url", ""); update("kansikuva_preview", ""); }} />
      </div>

      {state.rakennuksia >= 2 && (
        <div className="card">
          <h3 className="section-title">{getBuildingName(state, "rak2_")} — Kuvat</h3>
          <div className="grid-2">
            {Array.from({ length: 6 }, (_, i) => i + 1).map(n => (
              <ImageUploadField key={`rak2_img${n}`} label={`Kuva ${n}`}
                previewUrl={state[`rak2_img${n}_preview`]} isUploading={state[`rak2_img${n}_uploading`]}
                onFile={file => onImageUpload(file, `rak2_img${n}`)}
                onRemove={() => { update(`rak2_img${n}_url`, ""); update(`rak2_img${n}_preview`, ""); }}
                kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state[`rak2_img${n}_teksti`]}
                onKuvatekstiChange={v => update(`rak2_img${n}_teksti`, v)} />
            ))}
          </div>
        </div>
      )}

      {state.rakennuksia >= 3 && (
        <div className="card">
          <h3 className="section-title">{getBuildingName(state, "rak3_")} — Kuvat</h3>
          <div className="grid-2">
            {Array.from({ length: 6 }, (_, i) => i + 1).map(n => (
              <ImageUploadField key={`rak3_img${n}`} label={`Kuva ${n}`}
                previewUrl={state[`rak3_img${n}_preview`]} isUploading={state[`rak3_img${n}_uploading`]}
                onFile={file => onImageUpload(file, `rak3_img${n}`)}
                onRemove={() => { update(`rak3_img${n}_url`, ""); update(`rak3_img${n}_preview`, ""); }}
                kuvatekstiOptions={TV_KUVATEKSTI} kuvatekstiValue={state[`rak3_img${n}_teksti`]}
                onKuvatekstiChange={v => update(`rak3_img${n}_teksti`, v)} />
            ))}
          </div>
        </div>
      )}

      <hr className="section-divider" />
      <h2 className="page-title">Tarjousteksti</h2>

      <div className="card">
        <div className="field">
          <label className="field-label">Lisätieto kohteesta (valinnainen)</label>
          <textarea rows={3} value={state.kohde_konteksti} onChange={e => update("kohde_konteksti", e.target.value)} placeholder="Esim. asiakkaan erityistoiveet, kohteen erityispiirteet..." />
        </div>

        <button type="button" className="btn btn-primary" style={{ marginTop: 8 }} disabled={state.tarjousteksti_loading} onClick={onGenerateTarjous}>
          {state.tarjousteksti_loading ? "Generoidaan..." : "Generoi tarjousteksti"}
        </button>

        {state.tarjousteksti && (
          <div style={{ marginTop: 20 }}>
            <div className="field">
              <label className="field-label">Tarjousteksti</label>
              <textarea readOnly rows={20} value={state.tarjousteksti} />
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => {
              navigator.clipboard.writeText(state.tarjousteksti);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}>
              {copied ? "✓ Kopioitu!" : "📋 Kopioi teksti"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(initState);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // localStorage automaattitallennus
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const update = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const addBuilding = useCallback(() => {
    setState(prev => {
      const newCount = prev.rakennuksia + 1;
      const targetPrefix = newCount === 2 ? "rak2_" : "rak3_";
      const copy = {};
      for (const key of Object.keys(prev)) {
        if (key.startsWith("rak1_") && !key.endsWith("_nimi") && !key.endsWith("_nimi_muu")) {
          const suffix = key.slice(5); // remove "rak1_"
          copy[`${targetPrefix}${suffix}`] = prev[key];
        }
      }
      const maastoKey = newCount === 2 ? "maasto2" : "maasto3";
      copy[maastoKey] = prev.maasto;
      return { ...prev, ...copy, rakennuksia: newCount };
    });
  }, []);

  // Kuva-upload handler — Cloudinary
  const handleImageUpload = useCallback(async (file, fieldPrefix) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setState(prev => ({ ...prev, [`${fieldPrefix}_preview`]: e.target.result, [`${fieldPrefix}_uploading`]: true, [`${fieldPrefix}_url`]: "" }));
    };
    reader.readAsDataURL(file);
    try {
      let aspectRatio;
      if (fieldPrefix.includes('kansikuva') || fieldPrefix.includes('yleiskuva')) {
        aspectRatio = 14.96 / 19.05; // Portrait ~0.785
      } else {
        aspectRatio = 12.7 / 6.78; // Landscape ~1.873
      }
      const croppedFile = await cropImageToRatio(file, aspectRatio);
      const { url } = await uploadToCloudinary(croppedFile);
      setState(prev => ({ ...prev, [`${fieldPrefix}_url`]: url, [`${fieldPrefix}_uploading`]: false }));
    } catch (err) {
      setState(prev => ({ ...prev, [`${fieldPrefix}_uploading`]: false, [`${fieldPrefix}_preview`]: "", [`${fieldPrefix}_url`]: "" }));
      alert(`Kuvan lataus epäonnistui: ${err.message}`);
    }
  }, []);

  const handleGenerateTarjous = async () => {
    update("tarjousteksti_loading", true);
    update("tarjousteksti", "");
    try {
      const payload = buildPayload(state);
      const res = await fetch(TARJOUS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbone: payload.carbone,
          form: payload.form,
          konteksti: state.kohde_konteksti
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      update("tarjousteksti", data.teksti);
    } catch (e) {
      alert("Virhe tarjoustekstin generoinnissa: " + e.message);
    } finally {
      update("tarjousteksti_loading", false);
    }
  };

  const handleSubmit = async () => {
    const uploadingKeys = Object.keys(state).filter(k => k.endsWith("_uploading") && state[k]);
    if (uploadingKeys.length > 0) { alert("Odota — kuvia ladataan vielä pilvipalveluun..."); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const payload = buildPayload(state);
      const res = await fetch(N8N_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const errText = await res.text(); throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`); }
      const blob = await res.blob();
      if (blob.size < 1000) { const text = await blob.text(); throw new Error(`Palautettu tiedosto on liian pieni (${blob.size} B). n8n saattaa palauttaa virheen.`); }
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }));
      setDownloadUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toimintasuunnitelma-${state.asiakas_nimi || "tarjous"}-${state.tarjous_nro || "nro"}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus("success");
    } catch (e) {
      console.error("Virhe:", e);
      setErrorMsg(e.message);
      setStatus("error");
    }
  };

  const pages = [
    <Page1 state={state} update={update} />,
    <Page2 state={state} update={update} addBuilding={addBuilding} />,
    <Page3 state={state} update={update} />,
    <Page4 state={state} update={update} onImageUpload={handleImageUpload} />,
    <Page5 state={state} update={update} />,
    <Page6 state={state} update={update} onImageUpload={handleImageUpload} onGenerateTarjous={handleGenerateTarjous} />,
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PL</div>
          <div>
            <div className="brand-name">Pohjoisen</div>
            <div className="brand-name">Laatumaalaus</div>
          </div>
        </div>
        <nav className="steps-nav">
          {STEPS.map(s => (
            <button key={s.id} className={`nav-step ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`} onClick={() => setStep(s.id)} type="button">
              <span className="step-dot">{step > s.id ? "✓" : s.id}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
          <span className="progress-text">{step} / {STEPS.length}</span>
        </div>
      </aside>

      <main className="main">
        <div className="form-area">
          {status === "success" ? (
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <h2>Toimintasuunnitelma generoitu!</h2>
              <p>PPTX latautui automaattisesti. Tarkista tiedosto, viimeistele ja tallenna PDF:nä ennen asiakastapaamista.</p>
              {downloadUrl && (
                <a href={downloadUrl} download={`toimintasuunnitelma-${state.asiakas_nimi}.pptx`} className="btn-download">Lataa uudelleen</a>
              )}
              <br /><br />
              <button className="btn-secondary" onClick={() => {
                if (window.confirm("Tyhjennä lomake ja aloita uusi tarjous?")) {
                  setState(defaultState());
                  localStorage.removeItem(LS_KEY);
                  setStep(1);
                  setStatus("idle");
                  setDownloadUrl("");
                }
              }}>+ Uusi tarjous</button>
            </div>
          ) : (
            <>
              {pages[step - 1]}
              <div className="nav-buttons">
                {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(s => s - 1)}>Takaisin</button>}
                {step < STEPS.length ? (
                  <button type="button" className="btn-primary" onClick={() => setStep(s => s + 1)}>Seuraava</button>
                ) : (
                  <button type="button" className="btn-submit" onClick={handleSubmit} disabled={status === "loading"}>
                    {status === "loading" ? <span className="btn-loading">Generoidaan<span className="loading-dots"></span></span> : "Generoi esitys"}
                  </button>
                )}
              </div>
              {status === "error" && (
                <div className="error-box">{errorMsg}<br /><small>Avaa selaimen konsoli (F12) lisätietoja varten.</small></div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── PAYLOAD BUILDER ─────────────────────────────────────────────────────────
function buildPayload(s) {
  // Aikataulu mapping
  const aika = AIKATAULU_MAP[s.arvioitu_kesto] || { p1: "", p2: "", p3: "", p4: "", p5: "" };

  // Maalataan / optio / ei maalata arrays (universal)
  const bPrefixes = ["rak1_"];
  if (s.rakennuksia >= 2) bPrefixes.push("rak2_");
  if (s.rakennuksia >= 3) bPrefixes.push("rak3_");

  const maalataan_arr = [...(s.maalataan_check || []), ...(s.maalataan_muu ? [s.maalataan_muu] : [])].slice(0, 10);
  const optio_arr = s.optio_active ? [...(s.optio_check || []), ...(s.optio_muu ? [s.optio_muu] : [])].slice(0, 10) : [];
  const ei_maalata_arr = [...(s.ei_maalata_check || []), ...(s.ei_maalata_muu ? [s.ei_maalata_muu] : [])].slice(0, 8);

  // Materiaalit per rakennus helper
  function matData(prefix, carbonePrefix) {
    const tyyppiKey = s[`${prefix}maali_tyyppi`] || "vesiohenteinen";
    const tyyppi = TUOTTEET[tyyppiKey] || TUOTTEET.vesiohenteinen;
    const selvPlaceholder = { nimi: "Selvityksessä", kaytto: "—", kestavyys: "—", url: "" };
    const pohjaRaw = s[`${prefix}pohjamaali_idx`];
    const pohja = pohjaRaw === "selvityksessa" ? selvPlaceholder : tyyppi.pohja[Math.min(Number(pohjaRaw) || 0, tyyppi.pohja.length - 1)];
    const pintaRaw = s[`${prefix}pintamaali_idx`];
    const pinta = pintaRaw === "selvityksessa" ? selvPlaceholder : tyyppi.pinta[Math.min(Number(pintaRaw) || 0, tyyppi.pinta.length - 1)];
    return {
      [`${carbonePrefix}pohjamaali_nimi`]: pohja.nimi,
      [`${carbonePrefix}pohjamaali_kaytto`]: pohja.kaytto,
      [`${carbonePrefix}pohjamaali_ominaisuudet`]: pohja.kestavyys,
      [`${carbonePrefix}pohjamaali_varisavy`]: s[`${prefix}pohjamaali_varisavy`] || "—",
      [`${carbonePrefix}pohjamaali_url`]: pohja.nimi.startsWith("Ohennettu Pintamaali") ? (pinta.url || "") : (pohja.url || ""),
      [`${carbonePrefix}pintamaali_nimi`]: pinta.nimi,
      [`${carbonePrefix}pintamaali_kaytto`]: pinta.kaytto,
      [`${carbonePrefix}pintamaali_kestävyys`]: pinta.kestavyys,
      [`${carbonePrefix}pintamaali_varisavy`]: s[`${prefix}pintamaali_varisavy`] || "—",
      [`${carbonePrefix}pintamaali_url`]: pinta.url || "",
    };
  }

  // Resolve tarkennus: if "__muu__", use the custom text field
  function resolveTarkennus(prefix) {
    const val = s[`${prefix}pohjamateriaali_tarkennus`];
    if (val === "__muu__") return s[`${prefix}pohjamateriaali_tarkennus_muu`] || "";
    return val || "";
  }

  // Building carbone data helper
  function buildingCarbone(prefix, carbonePrefix) {
    return {
      [`${carbonePrefix}rakennettu_v`]: s[`${prefix}rakennettu_v`] || "—",
      [`${carbonePrefix}maalattu_v`]: s[`${prefix}maalattu_v`] || "—",
      [`${carbonePrefix}pohjamateriaali_v`]: resolveTarkennus(prefix)
        ? `${POHJAMATERIAALI_MAP[s[`${prefix}pohjamateriaali`]] || s[`${prefix}pohjamateriaali`]} — ${resolveTarkennus(prefix)}`
        : (POHJAMATERIAALI_MAP[s[`${prefix}pohjamateriaali`]] || s[`${prefix}pohjamateriaali`]),
      [`${carbonePrefix}kunto_v`]: KUNTO_MAP[s[`${prefix}kunto`]] || "",
      [`${carbonePrefix}maasto_v`]: MAASTO_MAP[s[prefix === "rak1_" ? "maasto" : "maasto2"]] || "—",
      [`${carbonePrefix}pintaala_v`]: s[`${prefix}pintaala`] || "—",
      [`${carbonePrefix}raystasmetrit_v`]: s[`${prefix}raystasmetrit`] || "—",
    };
  }

  // TV data
  const tvCarbone = {};
  for (let i = 0; i <= 8; i++) {
    tvCarbone[`tv${i}_kuva1`] = s[`tv${i}_kuva1_url`] || "";
    tvCarbone[`tv${i}_kuva2`] = s[`tv${i}_kuva2_url`] || "";
    tvCarbone[`tv${i}_kuvateksti_1`] = (s[`tv${i}_kuvateksti_1`] || "").replace("__muu__", "");
    tvCarbone[`tv${i}_kuvateksti_2`] = (s[`tv${i}_kuvateksti_2`] || "").replace("__muu__", "");
  }

  // TV form data
  const tvForm = {};
  for (let i = 0; i <= 8; i++) {
    tvForm[`tv${i}_lisatiedot`] = s[`tv${i}_lisatiedot`] || "";
  }

  // Homepesuaine-data pesuaineen mukaan
  const pesuaineData = {
    homepesu: {
      homepesuaine_nimi: "Tikkurilan Homeenpoisto",
      homepesuaine_kaytto: "Tappaa mikrobikasvuston, poistaa irtolian ja pölyn.",
      homepesuaine_ominaisuudet: "Tehokas pesu (1:3), varmistaa puhtaan ja tartuntavalmiin alustan.",
      homepesuaine_url: "https://tikkurila.fi/tuotteet/homeenpoisto",
    },
    virtanen: {
      homepesuaine_nimi: "Virtasen Homeentappaja",
      homepesuaine_kaytto: "Tappaa mikrobikasvuston, poistaa irtolian ja pölyn.",
      homepesuaine_ominaisuudet: "Monikäyttöinen tiiviste – pesu, suojaus tai huoltopesu.",
      homepesuaine_url: "https://www.virtasenmaalitehdas.fi/tuote/homeentappaja/",
    },
    ei: {
      homepesuaine_nimi: "—",
      homepesuaine_kaytto: "—",
      homepesuaine_ominaisuudet: "—",
      homepesuaine_url: "",
    },
  };
  const pesuaine = pesuaineData[s.rak1_pesuaine] || pesuaineData.homepesu;

  // Muut materiaalit
  const muut = s.muut_materiaalit || [];

  // Paivamaara formatting
  const pvmParts = (s.paivamaara || "").split("-");
  const pvmFormatted = pvmParts.length === 3 ? `${pvmParts[2]}.${pvmParts[1]}.${pvmParts[0]}` : s.paivamaara;

  // Osoite combined
  const osoiteFull = [s.osoite, [s.postinumero, s.kaupunki].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return {
    template_id: TEMPLATE_MAP[s.rakennuksia] || TEMPLATE_MAP[1],

    form: {
      asiakas_nimi: s.asiakas_nimi,
      tarjottava_tyo: s.tarjottava_tyo,
      arvioitu_kesto: s.arvioitu_kesto,
      rakennuksia: s.rakennuksia,
      // Rakennus 1
      rak1_nimi: getBuildingName(s, "rak1_"),
      rak1_kunto: s.rak1_kunto, rak1_pohjamateriaali: s.rak1_pohjamateriaali, rak1_pohjamateriaali_tarkennus: resolveTarkennus("rak1_"),
      rak1_hilseily: s.rak1_hilseily,
      rak1_kerrokset: s.rak1_kerrokset, rak1_timpuri: s.rak1_timpuri,
      rak1_timpuri_check: s.rak1_timpuri_check, rak1_nostin: s.rak1_nostin,
      rak1_osittainen: s.rak1_osittainen, rak1_osittainen_check: s.rak1_osittainen_check,
      // Rakennus 2
      ...(s.rakennuksia >= 2 ? {
        rak2_nimi: getBuildingName(s, "rak2_"),
        rak2_kunto: s.rak2_kunto, rak2_pohjamateriaali: s.rak2_pohjamateriaali, rak2_pohjamateriaali_tarkennus: resolveTarkennus("rak2_"),
        rak2_hilseily: s.rak2_hilseily,
        rak2_kerrokset: s.rak2_kerrokset, rak2_timpuri: s.rak2_timpuri,
        rak2_nostin: s.rak2_nostin, rak2_osittainen: s.rak2_osittainen,
      } : {}),
      // Rakennus 3
      ...(s.rakennuksia >= 3 ? {
        rak3_nimi: getBuildingName(s, "rak3_"),
        rak3_kunto: s.rak3_kunto, rak3_pohjamateriaali: s.rak3_pohjamateriaali, rak3_pohjamateriaali_tarkennus: resolveTarkennus("rak3_"),
        rak3_hilseily: s.rak3_hilseily,
        rak3_kerrokset: s.rak3_kerrokset, rak3_timpuri: s.rak3_timpuri,
        rak3_nostin: s.rak3_nostin, rak3_osittainen: s.rak3_osittainen,
      } : {}),
      // Olosuhteet
      maasto: s.maasto, maasto2: s.maasto2, maasto3: s.maasto3,
      // Urakan sisältö (universal)
      maalataan: maalataan_arr,
      optio_active: s.optio_active || false,
      optio: optio_arr,
      ei_maalata: ei_maalata_arr,
      // Työvaiheet
      ...tvForm,
    },

    carbone: {
      // Asiakastiedot
      asiakas_nimi: s.asiakas_nimi,
      osoite: osoiteFull,
      tarjous_nro: s.tarjous_nro,
      paivamaara: pvmFormatted,
      arvioitu_kesto: s.arvioitu_kesto,
      tarjottava_tyo: s.tarjottava_tyo,
      // Aikataulu
      paiva1_otsikko: aika.p1, paiva2_otsikko: aika.p2, paiva3_otsikko: aika.p3,
      paiva4_otsikko: aika.p4, paiva5_otsikko: aika.p5,
      // Rakennus 1
      kohde1_nimi: getBuildingName(s, "rak1_"),
      ...buildingCarbone("rak1_", ""),
      // Lisärakennukset
      ...(s.rakennuksia >= 2 ? {
        kohde2_nimi: getBuildingName(s, "rak2_"),
        rakennettu2_v: s.rak2_rakennettu_v || "—",
        maalattu2_v: s.rak2_maalattu_v || "—",
        pohjamateriaali2_v: resolveTarkennus("rak2_")
          ? `${POHJAMATERIAALI_MAP[s.rak2_pohjamateriaali] || s.rak2_pohjamateriaali} — ${resolveTarkennus("rak2_")}`
          : (POHJAMATERIAALI_MAP[s.rak2_pohjamateriaali] || s.rak2_pohjamateriaali),
        kunto2_v: KUNTO_MAP[s.rak2_kunto] || "",
        maasto2_v: MAASTO_MAP[s.maasto2] || "—",
        pintaala2_v: s.rak2_pintaala || "—",
        raystasmetrit2_v: s.rak2_raystasmetrit || "—",
      } : {}),
      ...(s.rakennuksia >= 3 ? {
        kohde3_nimi: getBuildingName(s, "rak3_"),
        rakennettu3_v: s.rak3_rakennettu_v || "—",
        maalattu3_v: s.rak3_maalattu_v || "—",
        pohjamateriaali3_v: resolveTarkennus("rak3_")
          ? `${POHJAMATERIAALI_MAP[s.rak3_pohjamateriaali] || s.rak3_pohjamateriaali} — ${resolveTarkennus("rak3_")}`
          : (POHJAMATERIAALI_MAP[s.rak3_pohjamateriaali] || s.rak3_pohjamateriaali),
        kunto3_v: KUNTO_MAP[s.rak3_kunto] || "",
        maasto3_v: MAASTO_MAP[s.maasto3] || "—",
        pintaala3_v: s.rak3_pintaala || "—",
        raystasmetrit3_v: s.rak3_raystasmetrit || "—",
      } : {}),
      // Maasto
      maasto_v: MAASTO_MAP[s.maasto] || s.maasto,
      // Urakan sisältö
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`maalataan_${i + 1}`, maalataan_arr[i] || ""])),
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`optio_${i + 1}`, optio_arr[i] || ""])),
      ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`ei_maalata_${i + 1}`, ei_maalata_arr[i] || ""])),
      // Työvaiheet kuvat
      ...tvCarbone,
      // Lisätyöt
      lisatyot_rannit: s.lisatyot_rannit,
      lisatyot_rannit_kuva1: s.lisatyot_rannit_kuva1_url || "",
      lisatyot_rannit_kuva2: s.lisatyot_rannit_kuva2_url || "",
      tv9_kuvateksti_1: (s.tv9_kuvateksti_1 || "").replace("__muu__", ""),
      tv9_kuvateksti_2: (s.tv9_kuvateksti_2 || "").replace("__muu__", ""),
      lisatyo2_tyyppi: s.lisatyo2_tyyppi,
      lisatyo2_otsikko: s.lisatyo2_tyyppi === "ikkunanpesu"
        ? "Ikkunoiden pesu"
        : s.lisatyo2_tyyppi === "muu"
        ? s.lisatyo2_otsikko || ""
        : "",
      lisatyo2_teksti: s.lisatyo2_tyyppi === "ikkunanpesu"
        ? "Ikkunat pestään ja puhdistetaan urakan yhteydessä kokonaisvaltaisen lopputuloksen varmistamiseksi."
        : s.lisatyo2_tyyppi === "muu"
        ? s.lisatyo2_teksti || ""
        : "",
      lisatyo2_kuva1: s.lisatyo2_kuva1_url || "",
      lisatyo2_kuva2: s.lisatyo2_kuva2_url || "",
      lisatyo2_kuvateksti_1: (s.lisatyo2_kuvateksti_1 || "").replace("__muu__", ""),
      lisatyo2_kuvateksti_2: (s.lisatyo2_kuvateksti_2 || "").replace("__muu__", ""),
      // Homepesuaine
      ...pesuaine,
      // Homepesuaine
      ...((() => {
        const pesuaineMap = {
          homepesu: {
            homepesuaine_nimi: "Tikkurilan Homeenpoisto",
            homepesuaine_kaytto: "Tappaa mikrobikasvuston sekä poistaa irtolian ja pölyn.",
            homepesuaine_ominaisuudet: "Varmistaa tehokkaan pesun ja puhtaan, tartuntavalmiin alustan.",
            homepesuaine_url: "https://tikkurila.fi/tuotteet/homeenpoisto",
          },
          virtanen: {
            homepesuaine_nimi: "Virtasen Homeentappaja",
            homepesuaine_kaytto: "Tappaa mikrobikasvuston sekä poistaa irtolian ja pölyn.",
            homepesuaine_ominaisuudet: "Varmistaa tehokkaan pesun ja puhtaan, tartuntavalmiin alustan.",
            homepesuaine_url: "https://www.virtasenmaalitehdas.fi/tuote/homeentappaja/",
          },
          ei: {
            homepesuaine_nimi: "—",
            homepesuaine_kaytto: "—",
            homepesuaine_ominaisuudet: "—",
            homepesuaine_url: "",
          },
        };
        return pesuaineMap[s.rak1_pesuaine] || pesuaineMap.homepesu;
      })()),
      // Materiaalit — päärakennus
      ...matData("rak1_", ""),
      // Materiaalit — rakennus 2
      ...(s.rakennuksia >= 2 ? matData("rak2_", "kohde2_") : {}),
      // Materiaalit — rakennus 3
      ...(s.rakennuksia >= 3 ? matData("rak3_", "kohde3_") : {}),
      // Muut materiaalit
      materiaali_1: muut[0] || "", materiaali_2: muut[1] || "", materiaali_3: muut[2] || "",
      // Nostin per rakennus
      rak1_nostin: s.rak1_nostin,
      rak2_nostin: s.rak2_nostin,
      rak3_nostin: s.rak3_nostin,
      // Kerrokset per rakennus
      rak1_kerrokset: s.rak1_kerrokset,
      rak2_kerrokset: s.rak2_kerrokset,
      rak3_kerrokset: s.rak3_kerrokset,
      // Kuvat
      kansikuva: s.kansikuva_url || "",
      ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`rak2_img${i + 1}`, s[`rak2_img${i + 1}_url`] || ""])),
      ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`rak2_img${i + 1}_teksti`, (s[`rak2_img${i + 1}_teksti`] || "").replace("__muu__", "")])),
      ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`rak3_img${i + 1}`, s[`rak3_img${i + 1}_url`] || ""])),
      ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`rak3_img${i + 1}_teksti`, (s[`rak3_img${i + 1}_teksti`] || "").replace("__muu__", "")])),
    },
  };
}