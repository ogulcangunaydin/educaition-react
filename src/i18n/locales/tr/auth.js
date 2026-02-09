/**
 * Turkish - Authentication Translations
 */

const auth = {
  auth: {
    login: "Giriş",
    logout: "Çıkış",
    register: "Kayıt Ol",
    forgotPassword: "Şifremi Unuttum",
    resetPassword: "Şifre Sıfırla",
    email: "E-posta",
    password: "Şifre",
    confirmPassword: "Şifre Tekrar",
    username: "Kullanıcı Adı",
    rememberMe: "Beni hatırla",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    signOut: "Çıkış Yap",

    // Standard login (educaition)
    educaition: {
      welcomeTitle: "Educaition'a Hoş Geldiniz",
      welcomeSubtitle: "Test yönetim paneline erişmek için giriş yapın",
      copyright: "© {{year}} Educaition - Test Yönetim Sistemi",
      halicRedirect: "Üniversiteden misiniz?",
    },

    // Halic login
    halic: {
      welcomeTitle: "Üniversite Karşılaştırma'ya Hoş Geldiniz",
      welcomeSubtitle: "Üniversite karşılaştırma aracına erişmek için giriş yapın",
      copyright: "© {{year}} Haliç Üniversitesi - Üniversite Karşılaştırma",
    },

    // Messages
    loginSuccess: "Giriş başarılı",
    loginError: "Geçersiz kullanıcı adı veya şifre",
    logoutSuccess: "Başarıyla çıkış yapıldı",
    sessionExpired: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
    unauthorized: "Bu sayfaya erişim yetkiniz yok",
    viewerNotAllowed: "Görüntüleyiciler yalnızca üniversite karşılaştırma portalından erişebilir.",
    studentNotAllowed:
      "Öğrenciler testlere öğretmenleri tarafından sağlanan linkler üzerinden erişmelidir.",
    accountCreated: "Hesap başarıyla oluşturuldu",
    passwordResetSent: "Şifre sıfırlama bağlantısı e-postanıza gönderildi",
    passwordResetSuccess: "Şifre başarıyla sıfırlandı",
    passwordMismatch: "Şifreler eşleşmiyor",
    invalidEmail: "Lütfen geçerli bir e-posta adresi girin",
    weakPassword: "Şifre en az 8 karakter olmalıdır",
    usernameRequired: "Kullanıcı adı gereklidir",
    passwordRequired: "Şifre gereklidir",
  },
};

export default auth;
