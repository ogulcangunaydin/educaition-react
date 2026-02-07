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

    thankYou: "Testi tamamladığınız için teşekkür ederiz!",
    answerAllQuestions: "Lütfen tüm soruları cevaplayın",
    submissionFailed: "Gönderim başarısız oldu",

    // Participant info
    participantInfo: {
      title: "Katılımcı Bilgileri",
      name: "Ad Soyad",
      email: "E-posta (isteğe bağlı)",
      studentId: "Öğrenci Numarası",
      studentNumber: "Öğrenci No",
      department: "Bölüm",
      continue: "Devam Et",
      nameRequired: "Ad Soyad zorunludur",
      studentIdRequired: "Öğrenci Numarası zorunludur",
      studentIdMustBeNumber: "Öğrenci Numarası sadece rakam içermelidir",
      alreadyCompleted: "Bu testi bu cihazdan zaten tamamladınız.",
      registrationFailed: "Kayıt başarısız oldu",
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
      description:
        "Kariyerin için eğlenceli bir keşif yolculuğuna çık! Yaşına, kişilik özelliklerine ve burcuna göre en uygun meslekleri beyin fırtınası yaparak eğlenceli bir plan oluşturacağız! Unutma, sonuçlar ilham vericidir ama kesin değildir!",
      instructions: "Lütfen aşağıdaki soruları dürüstçe cevaplayın.",
      jobRecommendation: "Kariyer Önerisi",
      viewRecommendation: "Kariyer Önerinizi Görüntüleyin",
      // Step labels
      steps: {
        welcome: "Hoş Geldiniz",
        personalInfo: "Kişisel Bilgiler",
        taxiQuestions: "Taksi Soruları",
        processing: "İşleniyor",
        verification: "Doğrulama",
        complete: "Tamamlandı",
      },
      // Step 0: Welcome
      welcome: {
        taxiProblemQuestion: "İstanbul'daki taksi sorununu ne kadar önemli buluyorsunuz?",
      },
      // Step 1: Personal Information
      personalInfo: {
        title: "Kişisel Bilgiler",
        fullName: "Ad Soyad",
        studentNumber: "Öğrenci Numarası",
        age: "Yaşınız:",
        gender: "Cinsiyetiniz:",
        education: "Eğitim durumunuz:",
        starSign: "Burcunuz:",
        risingSign: "Yükselen burcunuz:",
        workload: "Beni motive eden iş temposu:",
        workloadMin: "Rahat",
        workloadMax: "Yoğun",
        careerStart: "Kariyerim nasıl başlamalı:",
        careerStartMin: "Kolay",
        careerStartMax: "Zorlu",
        flexibility: "Mesleğim ne kadar esnek olmalı:",
        flexibilityMin: "Katı",
        flexibilityMax: "Esnek",
      },
      // Step 2: Taxi questions
      taxiQuestions: {
        title: "Taksi Hizmeti Soruları",
        comfortQuestion:
          "İstanbul'daki taksi hizmeti (taksi bulma kolaylığı, yolculuk konforu, şoför davranışı vb.) beklentilerinizi ne ölçüde karşılıyor?",
        fareQuestion:
          "Sizce İstanbul'daki taksi hizmetinin kalitesi ile ücret dengesi ne kadar uyumlu?",
      },
      // Step 3: Processing
      processingStep: {
        thankYou: "Katılımınız için teşekkürler!",
        averageResults: "Ortalama Sonuçlar:",
        taxiComfortAverage: "Taksi Hizmeti Konforu",
        taxiFaresAverage: "Taksi Ücret Dengesi",
        votes: "oy",
        saving: "Cevaplarınız kaydediliyor, lütfen bekleyin...",
      },
      // Step 4: Verification (fake error + re-ask)
      verificationStep: {
        errorTitle: "HTTP Error 504: Gateway Timeout",
        errorMessage: "Sunucu ilk cevabınızı kaydedemedi. Lütfen tekrar cevaplayınız.",
        answerAgain: "Lütfen Tekrar Cevaplayın",
        average: "Ortalama",
      },
      // Step 5: Complete
      completeStep: {
        success: "Cevaplarınız doğru şekilde kaydedildi.",
        thankYou: "Bu bilişsel uyumsuzluk çalışmasına katıldığınız için teşekkür ederiz.",
        nextStep: "Kişilik testini çözmek için tıklayın",
      },
      roomDetail: {
        pageTitle: "Bilişsel Uyumsuzluk Test Odası",
        sentiment: "Duygu",
        comfortFirst: "Konfor (1.)",
        fareFirst: "Ücret (1.)",
        comfortSecond: "Konfor (2.)",
        fareSecond: "Ücret (2.)",
        comfortAvg: "Konfor Ort.",
        fareAvg: "Ücret Ort.",
        resultsTitle: "Uyumsuzluk Testi Sonuçları",
        firstRound: "İlk Tur Cevapları",
        secondRound: "İkinci Tur Cevapları",
        displayedAverages: "Gösterilen Ortalamalar",
        dissonanceAnalysis: "Uyumsuzluk Analizi",
        compatibilityAnalysis: "Burç Uyumluluk Analizi",
      },
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
