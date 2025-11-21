import React from "react";
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";

const InstructionsPanel = () => {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        bgcolor: "primary.light",
        color: "primary.contrastText",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <InfoIcon />
        <Typography variant="h6">Nasıl Kullanılır?</Typography>
      </Box>

      <Accordion
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          mb: 1,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            🎯 Temel Kullanım (4 Adım)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2">
              <strong>1. Yıl Seçimi:</strong> Önce analiz etmek istediğiniz yılı
              seçin (2022, 2023 veya 2024)
            </Typography>
            <Typography variant="body2">
              <strong>2. Program Seçimi:</strong> Haliç Üniversitesi'nden
              karşılaştırmak istediğiniz programı seçin (alfabetik sırada)
            </Typography>
            <Typography variant="body2">
              <strong>3. Kriter Seçimi:</strong> Karşılaştırma kriterini
              belirleyin:
              <br />• <strong>Başarı Sıralaması:</strong> Öğrenci sıralamalarına
              göre
              <br />• <strong>Puan:</strong> Üniversite giriş puanlarına göre
            </Typography>
            <Typography variant="body2">
              <strong>4. Buffer (Tolerans):</strong> Karşılaştırma aralığını
              ayarlayın. %0 en fazla seçtiğiniz bölümün aralığı kadar olanlar
              sıralanır. Eğer bu aralığı arttırırsanız, daha geniş bir yelpazede
              benzer programlar gösterilir.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          mb: 1,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            🔍 Gelişmiş Filtreler
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2">
              <strong>Üniversite Türü:</strong> Vakıf, Devlet veya tüm
              üniversiteleri gösterin
            </Typography>
            <Typography variant="body2">
              <strong>En Çok Tercih Edilen Şehirler:</strong> Programınıza
              başvuranların en çok tercih ettiği ilk N şehirdeki üniversiteleri
              filtreleyin
            </Typography>
            <Typography variant="body2">
              <strong>Min. Üniversite Tercihi:</strong> Programınıza başvuranlar
              tarafından en az X kez tercih edilen üniversiteleri gösterin
            </Typography>
            <Typography variant="body2">
              <strong>Min. Program Tercihi:</strong> Programınıza başvuranlar
              tarafından en az X kez tercih edilen program isimlerini
              filtreleyin
            </Typography>
            <Typography variant="body2">
              <strong>Grafikteki Kayıt Sayısı:</strong> Grafikte gösterilecek
              maksimum departman sayısını belirleyin (10-20 arası)
              <br />
              <Chip
                label="💡 İpucu: Liste her zaman filtrelere uyan tüm sonuçları gösterir"
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          mb: 1,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            📊 Sonuçları Kullanma
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2">
              <strong>Program Seçimi:</strong> Listeden ilginizi çeken
              programların yanındaki onay kutularını işaretleyin veya satıra
              tıklayın
            </Typography>
            <Typography variant="body2">
              <strong>Sıralama:</strong> Kolon başlıklarına tıklayarak
              üniversite, şehir, puan veya sıralamaya göre sıralayın
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              Seçili Programlarla Ne Yapabilirsiniz?
            </Typography>
            <Typography variant="body2">
              <strong>🎓 Lise Analizi:</strong> Seçili programlara yerleşen
              öğrencilerin hangi liselerden geldiğini görün
              <br />
              • Lise adı, şehir, yerleşen sayısı
              <br />
              • Lise türü (Özel, Fen, Anadolu, Açık Öğretim)
              <br />• CSV olarak indirme seçeneği
            </Typography>
            <Typography variant="body2">
              <strong>🏆 Rakip Analizi:</strong> Seçili programların üniversite
              bazında tercih istatistiklerini görün
              <br />
              • Ortalama tercih edilme sırası
              <br />
              • Ortalama yerleşen tercih sırası
              <br />
              • Marka etkinlik değeri (yüksek = daha çok tercih ediliyor)
              <br />• CSV olarak indirme seçeneği
            </Typography>
            <Typography variant="body2">
              <strong>🗑️ Tümünü Kaldır:</strong> Seçtiğiniz tüm programları tek
              tıkla kaldırın
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            ⌨️ Klavye Kısayolları
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              <strong>→ Sağa Ok:</strong> Slider değerini 1 artır
            </Typography>
            <Typography variant="body2">
              <strong>← Sola Ok:</strong> Slider değerini 1 azalt
            </Typography>
            <Typography variant="body2">
              <Chip
                label="💡 Slider'a tıkladıktan sonra ok tuşlarını kullanabilirsiniz"
                size="small"
              />
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "rgba(255, 255, 255, 0.15)",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          ⚠️ Önemli Notlar:
        </Typography>
        <Typography variant="body2">
          • Program değiştirdiğinizde sepet otomatik olarak temizlenir
          <br />
          • Filtreler gerçek zamanlı olarak uygulanır
          <br />• Analiz sayfaları seçtiğiniz yıla göre filtrelenir
        </Typography>
      </Box>
    </Paper>
  );
};

export default InstructionsPanel;
