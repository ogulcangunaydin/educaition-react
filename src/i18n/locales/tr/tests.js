/**
 * Turkish - Tests Translations
 *
 * Translations for all test types: Personality, Dissonance, Prisoner's Dilemma
 */

const tests = {
  tests: {
    // Common test terms
    room: "Oda",
    rooms: "Odalar",
    participant: "Katılımcı",
    participants: "Katılımcılar",
    joinRoom: "Odaya Katıl",
    createRoom: "Oda Oluştur",
    roomCode: "Oda Kodu",
    enterRoomCode: "Oda kodunu girin",
    startTest: "Testi Başlat",
    submitTest: "Testi Gönder",
    completeTest: "Testi Tamamla",
    testCompleted: "Test Tamamlandı",
    testInProgress: "Test Devam Ediyor",
    question: "Soru",
    questionOf: "Soru {{current}} / {{total}}",
    answer: "Cevap",
    result: "Sonuç",
    results: "Sonuçlar",
    score: "Puan",
    totalScore: "Toplam Puan",
    averageScore: "Ortalama Puan",
    viewResults: "Sonuçları Görüntüle",
    downloadResults: "Sonuçları İndir",
    exportResults: "Sonuçları Dışa Aktar",

    // Participant info
    participantInfo: {
      title: "Katılımcı Bilgileri",
      name: "Ad Soyad",
      email: "E-posta (isteğe bağlı)",
      studentId: "Öğrenci Numarası (isteğe bağlı)",
      studentNumber: "Öğrenci No",
      department: "Bölüm",
      continue: "Devam Et",
    },

    // Personality Test
    personality: {
      title: "Kişilik Testi",
      subtitle: "Beş Faktör Kişilik Değerlendirmesi",
      description:
        "Bu test kişilik özelliklerinizi beş boyutta ölçer: Deneyime Açıklık, Sorumluluk, Dışa Dönüklük, Uyumluluk ve Duygusal Dengesizlik.",
      instructions: "Lütfen her ifadenin sizi ne kadar doğru tanımladığını değerlendirin.",
      scale: {
        stronglyDisagree: "Kesinlikle Katılmıyorum",
        disagree: "Katılmıyorum",
        neutral: "Kararsızım",
        agree: "Katılıyorum",
        stronglyAgree: "Kesinlikle Katılıyorum",
      },
      traits: {
        openness: "Deneyime Açıklık",
        conscientiousness: "Sorumluluk",
        extraversion: "Dışa Dönüklük",
        agreeableness: "Uyumluluk",
        neuroticism: "Duygusal Dengesizlik",
      },
      resultsReady: "Kişilik analiziniz hazır!",
      roomDetail: {
        pageTitle: "Kişilik Testi Odası",
        traitsLabel: "Kişilik Özellikleri",
        resultsTitle: "Kişilik Testi Sonuçları",
        jobRecommendations: "Meslek Tavsiyeleri",
      },
    },

    // Dissonance Test
    dissonance: {
      title: "Bilişsel Uyumsuzluk Testi",
      subtitle: "Karar Verme Değerlendirmesi",
      description: "Bu test karar verme kalıplarınızı ve bilişsel tutarlılığınızı değerlendirir.",
      instructions: "Lütfen aşağıdaki soruları dürüstçe cevaplayın.",
      jobRecommendation: "Kariyer Önerisi",
      viewRecommendation: "Kariyer Önerinizi Görüntüleyin",
    },

    // Prisoner's Dilemma
    prisonersDilemma: {
      title: "Mahkum İkilemi",
      subtitle: "Oyun Teorisi Deneyi",
      description:
        "Diğer oyuncularla rekabet etmek için stratejiler geliştirdiğiniz bir oyun teorisi deneyi.",
      instructions: "Oyun için stratejinizi tanımlayın",
      cooperate: "İşbirliği Yap",
      defect: "İhanet Et",
      round: "Tur",
      rounds: "Turlar",
      totalRounds: "Toplam Tur",
      yourMove: "Sizin Hamleniz",
      opponentMove: "Rakibin Hamlesi",
      leaderboard: "Liderlik Tablosu",
      rank: "Sıra",
      player: "Oyuncu",
      strategy: "Strateji",
      defineStrategy: "Stratejinizi Belirleyin",
      strategyDescription: "Oyunu nasıl oynamak istediğinizi açıklayın",
      playground: "Oyun Alanı",
      gameRoom: "Oyun Odası",
      waitingForPlayers: "Diğer oyuncular bekleniyor...",
      gameStarting: "Oyun başlıyor...",
      gameEnded: "Oyun sona erdi",
    },

    // Room status
    status: {
      active: "Aktif",
      inactive: "Pasif",
      completed: "Tamamlandı",
      inProgress: "Devam Ediyor",
      pending: "Beklemede",
      open: "Açık",
      closed: "Kapalı",
    },

    // Room statistics
    stats: {
      totalParticipants: "Toplam Katılımcı",
      completedCount: "Tamamlayan",
      inProgressCount: "Devam Eden",
      completionRate: "Tamamlama Oranı",
    },

    // Empty state
    noParticipantsYet: "Henüz katılımcı yok",
    shareQRDescription: "QR kodu paylaşarak öğrencilerinizin teste katılmasını sağlayın.",
  },
};

export default tests;
