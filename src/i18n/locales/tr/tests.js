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
        registration: "Kayıt",
        personalInfo: "Kişisel Bilgiler",
        taxiQuestions: "Taksi Soruları",
        processing: "İşleniyor",
        verification: "Doğrulama",
        complete: "Tamamlandı",
      },
      // Step 0: Welcome
      welcome: {
        taxiProblemQuestion: "İstanbul'daki taksi sorununu ne kadar önemli buluyorsunuz?",
        veryImportant: "Çok önemli buluyorum",
        notImportant: "Çok önemli bulmuyorum",
      },
      // Step 1: Personal Information
      personalInfo: {
        title: "Kişisel Bilgiler",
        fullName: "Ad Soyad",
        studentNumber: "Öğrenci Numarası",
        classYear: "Sınıfınız:",
        gender: "Cinsiyetiniz:",
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
        thankYou: "Bu çalışmaya katıldığınız için teşekkür ederiz.",
      },
      roomDetail: {
        pageTitle: "Bilişsel Uyumsuzluk Test Odası",
        classYear: "Sınıf",
        comfortFirst: "Konfor",
        fareFirst: "Ücret",
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
      cooperate: "İşbirliği Yap",
      defect: "İhanet Et",
      round: "Tur",
      rounds: "Turlar",
      totalRounds: "Toplam Tur",
      yourMove: "Sizin Hamleniz",
      opponentMove: "Rakibin Hamlesi",
      player: "Oyuncu",
      tactic: "Taktik",

      // Game Rooms page (teacher)
      gameRooms: {
        title: "Oyun Odaları",
        subtitle: "Mahkum İkilemi oyun odalarınızı yönetin",
        noRoomsTitle: "Henüz Oda Yok",
        noRoomsMessage: "Başlamak için ilk oyun odanızı oluşturun.",
        createTitle: "Yeni Oda Oluştur",
        roomName: "Oda Adı",
        roomNamePlaceholder: "Oda adı girin",
      },

      // Room Detail page (teacher)
      roomDetail: {
        pageTitle: "Mahkum İkilemi Odası",
        functionName: "Fonksiyon Adı",
        shortTactic: "Kısa Taktik",
        ready: "Hazır",
        notReady: "Hazır Değil",
        resultsTitle: "Oyuncu Detayları",
        jobRecommendation: "Kariyer Önerisi",
        tacticReason: "Strateji Motivasyonu",
      },

      // Playground page (teacher)
      playgroundPage: {
        show: "Göster",
        hide: "Gizle",
        start: "Başlat",
        sessions: "Oturumlar",
        showQRCode: "QR Kodu Göster",
        startNewSession: "Yeni Oturum Başlat",
        sessionName: "Oturum Adı",
        deleteParticipant: "Katılımcıyı Sil",
        deleteConfirm: "Bu katılımcıyı silmek istediğinizden emin misiniz?",
        deleteNotReadyAndStart: "Hazır Olmayanları Sil ve Başlat",
        personalityTraits: "Kişilik Özellikleri",
      },

      // Leaderboard page (teacher)
      leaderboardPage: {
        backToPlayground: "Odaya Dön",
        gameInProgress: "Oyun devam ediyor. Lütfen bekleyin...",
        scoreboardTitle: "Skor Tablosu",
        scoreboardDescription:
          "Tüm oyuncuların tüm turlarda kazandıkları toplam puanlara göre sıralanmış nihai skorları.",
        resultsMatrix: "Sonuç Matrisi",
        matrixDescription:
          "Her oyuncu çifti arasındaki karşılıklı skorlar. Satırlar, satır oyuncusunun her rakibe karşı kazandığı puanları gösterir.",
        participantsDescription: "Her katılımcının detaylı profili ve kişilik özellikleri.",
      },

      // Tactic Preparation page
      tacticPage: {
        title: "Taktik Hazırlığı",
        subtitle: "Mahkum İkilemi oyunu için stratejinizi hazırlayın",
        yourStrategy: "Stratejiniz",
        describeTactic: "Taktiğinizi Tanımlayın",
        tacticPlaceholder:
          "Nasıl bir yaklaşım izleyeceksiniz? Farklı durumlara nasıl tepki vereceksiniz?",
        saveTactic: "Taktiğimi Kaydet",
      },

      // Public page (QR-scanned by students)
      publicPage: {
        steps: {
          join: "Katıl",
          prepareTactic: "Strateji",
          selectReason: "Analiz",
          results: "Sonuçlar",
        },
        welcome: {
          title: "Mahkum İkilemi Oyunu",
          description: "Klasik oyun teorisi deneyine katılın! Başlamak için adınızı girin.",
          room: "Oda: {{name}}",
        },
        registration: {
          nameLabel: "Adınızı girin",
          namePlaceholder: "Görüntülenecek adınız",
          joinButton: "Oyuna Katıl",
        },
        gameExplanation: {
          title: "Stratejinizi Hazırlayın",
          intro:
            "Oyun teorisinin en ünlü deneylerinden biri olan Mahkum İkilemi'ne hoş geldiniz! Bu oyunda birden fazla turda diğer oyuncularla eşleştirileceksiniz.",
          conceptTitle: "Temel Kavram",
          conceptDescription:
            "Her turda siz ve rakibiniz aynı anda iki eylemden birini seçersiniz: **İşbirliği** ya da **İhanet**. Hiçbir oyuncu, diğerinin seçimini her ikisi de karar verene kadar bilmez. Seçimlerinizin kombinasyonu her iki oyuncunun da puanını belirler.",
          payoffTitle: "Puanlama Sistemi",
          payoffDescription: "Her turun puanları seçimlerin kombinasyonuna bağlıdır:",
          payoffBothCooperate:
            "🤝 İkisi de İşbirliği → **Her birine 3 puan** — Karşılıklı güven kazandırır!",
          payoffBothDefect:
            "⚔️ İkisi de İhanet → **Her birine 1 puan** — Karşılıklı şüphe, minimum kazanç.",
          payoffYouCoopTheyDefect:
            "😔 Sen İşbirliği, Rakip İhanet → **Sana 0 puan, rakibe 5 puan** — Sömürüldün!",
          payoffYouDefectTheyCoop:
            "😈 Sen İhanet, Rakip İşbirliği → **Sana 5 puan, rakibe 0 puan** — Rakibi sömürdün!",
          dilemmaTitle: "İkilem",
          dilemmaDescription:
            "İşte kilit gerilim: **İhanet bireysel olarak her zaman daha iyi görünür** (işbirliği yaparlarsa 5 > 3, ihanet ederlerse 1 > 0), ama **herkes böyle düşünürse herkes düşük puan alır** (her birine 1 puan). En iyi karşılıklı sonuç işbirliğinden gelir (her birine 3), ama bu güven gerektirir.",
          strategyTitle: "Göreviniz: Stratejinizi Tanımlayın",
          strategyDescription:
            "Birden fazla turda nasıl oynayacağınızı açıklayın. Stratejiniz otomatik olarak oyunu sizin yerinize oynayan bir koda dönüştürülecektir. Düşünmeniz gerekenler:",
          strategyPoints: [
            "İlk turda ne yapacaksınız?",
            "Rakibiniz işbirliği yaparsa nasıl cevap vereceksiniz?",
            "Rakibiniz ihanet ederse nasıl cevap vereceksiniz?",
            "Önceki turların geçmişini dikkate alacak mısınız?",
            "Affetmeyi, misilleme yapmayı ya da adapte olmayı mı tercih edeceksiniz?",
          ],
          examplesTitle: "Örnek Stratejiler",
          exampleAlwaysCoop:
            "**Her Zaman İşbirliği**: Koşulsuz güven — ne olursa olsun her turda işbirliği yap.",
          exampleAlwaysDefect:
            "**Her Zaman İhanet**: Kendi çıkarını maksimize et — ne olursa olsun her turda ihanet et.",
          exampleTitForTat:
            "**Kısasa Kısas**: İşbirliği yaparak başla, sonra rakibin son hamlesini tekrarla.",
          exampleGrimTrigger:
            "**Acımasız Tetik**: Bir kez ihanete uğrayana kadar işbirliği yap, sonra sonsuza kadar ihanet et.",
          exampleRandom: "**Rastgele**: Rastgele işbirliği veya ihanet et — tahmin edilmez ol!",
          creativityNote:
            "💡 Yaratıcı olun! Kendi özgün stratejinizi icat edebilirsiniz. Ne kadar detaylı olursanız, stratejiniz o kadar iyi uygulanır.",
          tacticLabel: "Stratejinizi açıklayın",
          tacticPlaceholder:
            "Örnek: İşbirliği yaparak başlayacağım. Rakibim işbirliği yaparsa işbirliğine devam edeceğim. İhanet ederse onu cezalandırmak için 2 tur ihanet edeceğim, sonra tekrar bir şans vermek için işbirliğine döneceğim...",
          saveButton: "Stratejiyi Gönder",
          processing: "Stratejiniz analiz ediliyor...",
          processingSubtext: "Stratejiniz oyun koduna dönüştürülüyor. Bu biraz zaman alabilir.",
        },
        reasons: {
          title: "Bu Stratejiyi Neden Seçtiniz?",
          description:
            "Stratejinize dayanarak bazı olası motivasyonlar belirledik. Yaklaşımınızı en iyi tanımlayan nedeni seçin:",
          loading: "Stratejiniz analiz ediliyor...",
          loadingSubtext: "Stratejinize dayalı olası motivasyonlar oluşturuluyor...",
          selectPrompt: "Sizinle en çok örtüşen nedeni seçin:",
          submitButton: "Devam Et",
          otherReason: "Diğer (benim nedenim farklı)",
        },
        result: {
          title: "Kariyer Analiziniz",
          description:
            "Stratejiniz ve motivasyonunuza dayanarak kişilik özelliklerinize uyan kariyer önerileri:",
          loading: "Kişiselleştirilmiş kariyer analiziniz oluşturuluyor...",
          jobRecommendation: "Kariyer Önerisi",
        },
        waiting: {
          title: "Hazırsınız, {{name}}!",
          message: "Diğer oyuncular bekleniyor...",
          gameMasterNote: "Tüm oyuncular hazır olduğunda oyun yöneticisi bir oturum başlatacaktır.",
          canClosePage:
            "Bu sayfayı kapatabilirsiniz - oynama zamanı geldiğinde bilgilendirileceksiniz.",
        },
      },

      // Instructions component
      instructions: {
        welcomeTitle: "Mahkum İkilemi Oyununa Hoş Geldiniz!",
        intro:
          "Bu oyunda siz ve diğer oyuncu tekrar tekrar işbirliği yapmayı veya ihanet etmeyi seçeceksiniz. Seçimleriniz hem sizin hem de diğer oyuncunun sonuçlarını etkileyecektir. İşte taktiğinizi nasıl tanımlayabileceğiniz:",
        choicesTitle: "Seçimleri Anlamak:",
        cooperateDesc:
          "İşbirliği yapmayı seçerseniz, diğer oyuncuya güveniyorsunuz ve potansiyel olarak daha iyi bir karşılıklı sonuç için birlikte çalışıyorsunuz.",
        defectDesc:
          "İhanet etmeyi seçerseniz, kendi çıkarınız doğrultusunda hareket ediyorsunuz, bu daha iyi bir bireysel sonuç sağlayabilir ancak diğer oyuncuya zarar verebilir.",
        scoringTitle: "Puanlama Sistemi:",
        scoringIntro:
          "Her turda siz ve rakibiniz seçimlerinize göre puan alacaksınız. Her olası seçim kombinasyonu için kazanımlar şu şekildedir:",
        bothCooperate: "İkisi de İşbirliği: Her iki oyuncu da 3 puan alır.",
        youCooperateTheyDefect:
          "Siz İşbirliği, Rakip İhanet: 0 puan alırsınız (Enayi'nin getirisi), rakibiniz 5 puan alır (Ayartma).",
        youDefectTheyCooperate:
          "Siz İhanet, Rakip İşbirliği: 5 puan alırsınız (Ayartma), rakibiniz 0 puan alır (Enayi'nin getirisi).",
        bothDefect: "İkisi de İhanet: Her iki oyuncu da 1 puan alır (Ceza).",
        scoringGoal:
          "Amaç, birçok turda puanlarınızı maksimize etmek ve liderlik tablosunun en üstünde bitirmektir.",
        taskTitle: "Göreviniz:",
        taskDesc:
          "Oyunda kullanmak istediğiniz strateji veya taktiği açıklamanız gerekiyor. Bu taktik, önceki turlara göre bir sonraki hamlenizi belirlemek için kullanılacaktır.",
        howToDescribeTitle: "Taktiğinizi Nasıl Tanımlarsınız:",
        beSpecific:
          "Ne zaman işbirliği yapmayı ve ne zaman ihanet etmeyi seçeceğinizi açıkça belirtin.",
        considerScenarios: "Farklı Senaryoları Düşünün:",
        scenario1: "Son turda siz ve rakibiniz işbirliği yaptıysanız ne yaparsınız?",
        scenario2: "Siz işbirliği yaptınız ve rakip ihanet ettiyse ne yaparsınız?",
        scenario3: "Siz ihanet ettiniz ve rakip işbirliği yaptıysa ne yaparsınız?",
        scenario4: "Son turda siz ve rakibiniz ihanet ettiyseniz ne yaparsınız?",
        thinkPatterns:
          "Birkaç turda kalıplar hakkında da düşünebilirsiniz. Örneğin, rakip son üç turda işbirliği yaptıysa işbirliği yapabilir veya arka arkaya iki kez ihanet ettiyse ihanet edebilirsiniz.",
        examplesTitle: "Örnek Taktikler:",
        alwaysCooperate:
          "Her Zaman İşbirliği: Rakibin önceki hamlelerinden bağımsız olarak her zaman işbirliği yapmayı seçin.",
        alwaysDefect:
          "Her Zaman İhanet: Rakibin önceki hamlelerinden bağımsız olarak her zaman ihanet etmeyi seçin.",
        titForTat:
          "Kısasa Kısas: İşbirliği yaparak başlayın, ardından her turda rakibin önceki turda ne yaptıysa onu yapın.",
        grimTrigger:
          "Grim Tetik: İşbirliği yaparak başlayın, ancak rakip bir kez bile ihanet ederse oyunun geri kalanında ihanet edin.",
        yourTacticTitle: "Taktiğiniz:",
        yourTacticDesc:
          "Şimdi sıra sizde! Taktiğinizi ayrıntılı olarak açıklayın. Unutmayın, ne kadar spesifik olursanız, stratejiniz oyunda o kadar iyi uygulanacaktır.",
        leaderboardTitle: "Liderlik Tablosu:",
        leaderboardDesc:
          "Oyunun sonunda toplam puanlarınız liderlik tablosundaki konumunuzu belirleyecektir. Puanlarınızı maksimize eden ve zirveye tırmanmanıza yardımcı olan bir strateji geliştirmeyi hedefleyin!",
        questions:
          "Daha fazla bilgiye ihtiyacınız varsa veya sorularınız varsa sormaktan çekinmeyin!",
      },
    },

    // Program Suggestion Test
    programSuggestion: {
      title: "Program Öneri Testi",
      subtitle: "Üniversite Program Öneri Sistemi",
      description:
        "Kişisel bilgileriniz, eğitim durumunuz ve RIASEC kariyer testine göre size en uygun üniversite programlarını öneriyoruz.",
      startRiasec: "RIASEC Testine Başla",
      steps: {
        personalInfo: "Kişisel Bilgiler",
        educationInfo: "Eğitim Bilgileri",
        scoreExpectation: "Puan Beklentisi",
        preferences: "Tercihler",
        riasecTest: "RIASEC Testi",
      },
      personalInfo: {
        name: "Ad Soyad",
        namePlaceholder: "Adınızı ve soyadınızı giriniz",
        birthYear: "Doğum Yılı",
        birthYearPlaceholder: "Doğum yılınızı giriniz",
        gender: "Cinsiyet",
        male: "Erkek",
        female: "Kadın",
        notSpecified: "Belirtmek İstemiyorum",
      },
      educationInfo: {
        classYear: "Sınıf",
        willTakeExam: "Üniversite sınavına girecek misiniz?",
        averageGrade: "Ortalama Başarı Notu (Opsiyonel)",
        averageGradeHelp: "0-100 arası not ortalamanız",
        area: "Alan Seçimi",
      },
      scoreExpectation: {
        expectedRange: "Beklediğiniz Puan Aralığı ({{area}})",
        estimatedRanking: "Tahmini Sıralama (Orta puan: {{score}})",
        rankingNote:
          "Bu sıralama, geçen yılın verilerine göre seçtiğiniz puan aralığının ortasına denk gelen tahmini sıralamadır.",
        alternativeAreaQuestion: "Alternatif bir alanda tercih yapmak ister misiniz?",
        alternativeRange: "Alternatif Alan Puan Aralığı ({{area}})",
      },
      preferences: {
        language: "Tercih ettiğiniz eğitim dili",
        universities: "Tercih ettiğiniz üniversiteler (Opsiyonel)",
        universitiesPlaceholder: "Üniversite ara...",
        cities: "Tercih ettiğiniz şehirler",
      },
      riasec: {
        title: "RIASEC Kariyer Testi",
        stronglyLike: "Çok Severim",
        like: "Severim",
        unsure: "Kararsızım",
        dislike: "Sevmem",
        stronglyDislike: "Hiç Sevmem",
      },
      errors: {
        initFailed: "Test başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.",
        saveFailed: "Veriler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        submitFailed: "Sonuçlar gönderilirken bir hata oluştu.",
        resultLoadFailed: "Sonuçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.",
      },
      result: {
        pageTitle: "Test Sonuçlarınız",
        pageSubtitle: "RIASEC kariyer testi ve tercihlerinize göre size özel öneriler",
        disclaimer:
          "Bu öneriler RIASEC kariyer testi ve tercihlerinize göre oluşturulmuştur. Son kararı verirken aileniz ve danışmanlarınızla görüşmenizi öneririz.",
        scoreRanking: {
          title: "Puan ve Sıralama Tahmini",
          subtitle: "Belirlediğiniz puan aralığına göre tahmini sıralamanız",
          mainArea: "Ana Alan",
          alternativeArea: "Alternatif Alan",
          scoreRange: "Puan Aralığı",
          midScore: "Orta Puan",
          estimatedRanking: "Tahmini Sıralama",
          disclaimer: "Tahmini sıralama, 2025 yılının verilerine göre hesaplanmıştır.",
        },
        riasecProfile: {
          title: "RIASEC Profili",
          subtitle: "Kişilik profilinize göre puanlarınız",
          types: {
            R: {
              name: "Realistic (Gerçekçi)",
              description: "Pratik, fiziksel aktiviteler, el işleri, mekanik",
            },
            I: {
              name: "Investigative (Araştırmacı)",
              description: "Analitik düşünme, araştırma, bilim",
            },
            A: { name: "Artistic (Sanatsal)", description: "Yaratıcılık, sanat, ifade özgürlüğü" },
            S: { name: "Social (Sosyal)", description: "İnsanlarla çalışma, yardım etme, öğretme" },
            E: { name: "Enterprising (Girişimci)", description: "Liderlik, ikna, iş yönetimi" },
            C: {
              name: "Conventional (Geleneksel)",
              description: "Organizasyon, veri işleme, detay odaklı",
            },
          },
        },
        suggestedJobs: {
          title: "Önerilen Meslekler",
          subtitle: "RIASEC profilinize en uygun meslekler",
          compatibility: "Uyumluluk",
          code: "Kod",
          jobProfile: "Meslek RIASEC Profili",
        },
        suggestedPrograms: {
          title: "Önerilen Programlar",
          subtitle: "Profilinize ve tercihlerinize uygun üniversite programları",
          noResults: "Program önerileri hesaplanıyor veya kriterlere uygun program bulunamadı.",
          baseScore: "Taban",
        },
      },
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
