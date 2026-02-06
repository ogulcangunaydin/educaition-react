/**
 * Turkish - Validation Translations
 */

const validation = {
  validation: {
    required: "Bu alan zorunludur",
    minLength: "En az {{min}} karakter olmalıdır",
    maxLength: "En fazla {{max}} karakter olmalıdır",
    email: "Lütfen geçerli bir e-posta adresi girin",
    phone: "Lütfen geçerli bir telefon numarası girin",
    url: "Lütfen geçerli bir URL girin",
    number: "Lütfen geçerli bir sayı girin",
    integer: "Lütfen tam sayı girin",
    positive: "Pozitif bir sayı olmalıdır",
    min: "En az {{min}} olmalıdır",
    max: "En fazla {{max}} olmalıdır",
    pattern: "Geçersiz format",
    match: "Alanlar eşleşmiyor",
    unique: "Bu değer zaten kullanılıyor",
    date: "Lütfen geçerli bir tarih girin",
    future: "Tarih gelecekte olmalıdır",
    past: "Tarih geçmişte olmalıdır",
    file: {
      required: "Lütfen bir dosya seçin",
      size: "Dosya boyutu {{size}}MB'den küçük olmalıdır",
      type: "Geçersiz dosya türü. İzin verilen: {{types}}",
    },
  },
};

export default validation;
