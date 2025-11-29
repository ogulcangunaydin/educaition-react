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
              seçin (2022-2025)
            </Typography>
            <Typography variant="body2">
              <strong>2. Program Seçimi:</strong> Haliç Üniversitesi'nden
              karşılaştırmak istediğiniz programı seçin (alfabetik sırada)
            </Typography>
            <Typography variant="body2">
              <strong>3. Kriter Seçimi:</strong> Karşılaştırma kriterini
              belirleyin:
              <br />• <strong>Başarı Sıralaması:</strong> Taban ve tavan
              sıralamalarına göre karşılaştırma
              <br />• <strong>Puan:</strong> Taban ve tavan puanlarına göre
              karşılaştırma
            </Typography>
            <Typography variant="body2">
              <strong>4. Aralık Genişletme:</strong> Grafik üzerindeki
              yukarı/aşağı ok butonları ile karşılaştırma aralığını
              genişletebilirsiniz. Adım değerini ayarlayarak istediğiniz kadar
              genişletin.
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
              <strong>Üniversite Türü:</strong> Vakıf, Devlet veya Tümü seçeneği
              ile üniversite türüne göre filtreleyin
            </Typography>
            <Typography variant="body2">
              <strong>En Çok Tercih Edilen Şehirler:</strong> Programınıza
              yerleşen öğrencilerin en az X kez tercih ettiği şehirlerdeki
              programları gösterin (0 = tüm şehirler)
            </Typography>
            <Typography variant="body2">
              <strong>Min. Üniversite Tercihi:</strong> Programınıza yerleşen
              öğrencilerin en az X kez tercih ettiği üniversiteleri gösterin (0
              = tüm üniversiteler)
            </Typography>
            <Typography variant="body2">
              <strong>Min. Program Tercihi:</strong> Programınıza yerleşen
              öğrencilerin en az X kez tercih ettiği program tiplerini gösterin
              (0 = tüm program tipleri)
            </Typography>
            <Typography variant="body2">
              <strong>Min. Doluluk Oranı:</strong> Kontenjanın en az %X'ini
              dolduran programları gösterin (0 = tüm doluluk oranları)
            </Typography>
            <Typography variant="body2">
              <strong>Grafikteki Kayıt Sayısı:</strong> Grafikte gösterilecek
              maksimum program sayısını belirleyin (10-30 arası)
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
            <Typography variant="body2" fontWeight="bold">
              Grafik Kullanımı:
            </Typography>
            <Typography variant="body2">
              • <strong>Renk Geçişleri:</strong> Her barın koyu kısmı dolu
              kontenjanı, açık kısmı boş kontenjanı gösterir
              <br />• <strong>İkili Y Ekseni:</strong> Sol eksen sıralama/puan,
              sağ eksen yıllık ücret gösterir
              <br />• <strong>Sıralama:</strong> Grafikteki programları aralık
              büyüklüğü, ücret, doluluk oranı veya min/max değerlere göre
              sıralayabilirsiniz
              <br />• <strong>Aralık Genişletme:</strong> Yukarı ok daha iyi
              sıralama/puan, aşağı ok daha düşük sıralama/puan aralığına doğru
              genişletir
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              Program Listesi:
            </Typography>
            <Typography variant="body2">
              • <strong>Program Seçimi:</strong> Onay kutularını işaretleyin
              veya satıra tıklayın
              <br />• <strong>Sıralama:</strong> Tablo başlıklarına tıklayarak
              kolon bazında sıralayın
              <br />• <strong>Tümünü Seç/Kaldır:</strong> Sol üstteki buton ile
              toplu işlem yapın
              <br />• <strong>Burs ve Ücret:</strong> Her programın burs yüzdesi
              ve yıllık ücreti görüntülenir
              <br />• <strong>※ İşareti:</strong> Kontenjan dolmayan
              programlarda taban değerin yerine tavan değeri gösterildiğini
              belirtir
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              Seçili Programlarla Ne Yapabilirsiniz?
            </Typography>
            <Typography variant="body2">
              <strong>🎓 Lise Analizi:</strong> Seçili programlara yerleşen
              öğrencilerin hangi liselerden geldiğini görün
              <br />
              • Lise adı, şehir, yerleşen sayısı ve lise türü
              <br />• Burs yüzdeleri ile program detayları, CSV indirme
            </Typography>
            <Typography variant="body2">
              <strong>🏆 Üniversite Rakip Analizi:</strong> Üniversite bazında
              ortalama tercih istatistikleri
              <br />
              • Program sayısı, ortalama tercih ve yerleşme sırası
              <br />• Marka etkinlik değeri, CSV indirme
            </Typography>
            <Typography variant="body2">
              <strong>📊 Program Rakip Analizi:</strong> Her program için ayrı
              tercih istatistikleri
              <br />• Program bazında detaylı analiz, CSV indirme
            </Typography>
            <Typography variant="body2">
              <strong>🗑️ Sepeti Temizle:</strong> Seçili programların yanındaki
              kırmızı X butonu ile sepeti temizleyin
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default InstructionsPanel;
