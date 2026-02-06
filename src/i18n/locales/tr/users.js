/**
 * Turkish - Users Translations
 */

const users = {
  users: {
    title: "Kullanıcı Yönetimi",
    subtitle: "Sistem kullanıcılarını ve yetkilerini yönetin",

    // Actions
    createUser: "Kullanıcı Oluştur",
    editUser: "Kullanıcıyı Düzenle",
    deleteUser: "Kullanıcıyı Sil",

    // Table headers
    username: "Kullanıcı Adı",
    email: "E-posta",
    role: "Rol",
    university: "Üniversite",
    status: "Durum",
    createdAt: "Oluşturulma Tarihi",
    actions: "İşlemler",

    // Form
    form: {
      title: {
        create: "Yeni Kullanıcı Oluştur",
        edit: "Kullanıcıyı Düzenle",
      },
      username: "Kullanıcı Adı",
      usernamePlaceholder: "Kullanıcı adı girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresi girin",
      password: "Şifre",
      passwordPlaceholder: "Şifre girin",
      passwordHint: "Mevcut şifreyi korumak için boş bırakın",
      role: "Rol",
      selectRole: "Rol seçin",
      university: "Üniversite",
      selectUniversity: "Üniversite seçin",
    },

    // Roles
    roles: {
      admin: "Yönetici",
      teacher: "Öğretmen",
      viewer: "İzleyici",
      student: "Öğrenci",
    },

    // Status
    active: "Aktif",
    inactive: "Pasif",

    // Messages
    messages: {
      createSuccess: "Kullanıcı başarıyla oluşturuldu",
      updateSuccess: "Kullanıcı başarıyla güncellendi",
      deleteSuccess: "Kullanıcı başarıyla silindi",
      deleteConfirm: "Bu kullanıcıyı silmek istediğinizden emin misiniz?",
      deleteWarning: "Bu işlem geri alınamaz.",
      fetchError: "Kullanıcılar getirilemedi",
      createError: "Kullanıcı oluşturulamadı",
      updateError: "Kullanıcı güncellenemedi",
      deleteError: "Kullanıcı silinemedi",
    },

    // Empty state
    noUsers: "Kullanıcı bulunamadı",
    noUsersDescription: "Başlamak için ilk kullanıcınızı oluşturun",
  },
};

export default users;
