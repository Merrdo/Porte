# Porte

Yetişkinler için müzik notası okuma ve tanıma alıştırma uygulaması. Tamamen istemci taraflı çalışan, kurulum gerektirmeyen bir PWA (Progressive Web App).

## Özellikler

- **Görsel tanıma**: Portede gösterilen notayı isimlendirme
- **Kulakla tanıma**: Web Audio API ile üretilen sesi dinleyip notayı tahmin etme
- **3 anahtar desteği**: Sol (Treble), Fa (Bass), Do (Alto & Tenor — ileri seviye)
- **6 seviyeli müfredat**: Kolaydan zora, sıralı kilit açma sistemi
- **İki pratik modu**: Sabit soru sayısı veya süreye karşı (60 sn)
- **İlerleme takibi**: Tarayıcıda localStorage ile (hesap gerekmez)
- **Açık/Koyu tema**
- **Offline çalışma**: Service worker ile ana ekrana eklenip internet olmadan kullanılabilir
- **Tamamen özgün arayüz**: Emoji yok, tüm ikonlar elle çizilmiş SVG; sistem dialogları yerine uygulama içi tasarlanmış bildirimler

## Kurulum yok, direkt kullanım

Bu proje herhangi bir build adımı veya bağımlılık gerektirmez. Saf HTML/CSS/JavaScript (ES modules) ile yazılmıştır.

### Yerelde çalıştırma

```bash
# Herhangi bir statik sunucu yeterli, örnek:
python3 -m http.server 8080
# veya
npx serve .
```

Sonra tarayıcıda `http://localhost:8080` adresini aç.

> **Not:** `file://` protokolüyle doğrudan açmak ES module ve service worker kısıtlamaları yüzünden çalışmaz — mutlaka bir HTTP sunucusu üzerinden açılmalı.

### GitHub Pages ile yayınlama

1. Bu repoyu GitHub'a push'la
2. Repo ayarlarından **Settings → Pages** kısmına git
3. **Source** olarak `main` branch / `/ (root)` seç
4. Birkaç dakika içinde `https://kullaniciadi.github.io/repo-adi/` üzerinden yayında olacak

Yayına alındıktan sonra telefon veya bilgisayarda tarayıcıdan açıp **"Ana Ekrana Ekle"** diyerek uygulama gibi kullanabilirsin.

## Proje yapısı

```
porte/
├── index.html            # Ana HTML iskeleti
├── manifest.json         # PWA manifest
├── sw.js                  # Service worker (offline destek)
├── css/
│   └── style.css         # Tüm stiller
├── js/
│   ├── app.js             # Ana uygulama mantığı, ekran yönetimi
│   ├── music-theory.js    # Nota/anahtar/frekans hesaplamaları
│   ├── staff-renderer.js  # Porte SVG çizim motoru
│   ├── audio-engine.js    # Web Audio ses üretimi
│   ├── progress.js        # localStorage ilerleme takibi
│   ├── icons.js           # Elle çizilmiş SVG ikon seti (emoji kullanılmaz)
│   └── notify.js          # Uygulama içi modal/toast bildirimleri (native dialog yerine)
└── icons/                 # PWA uygulama ikonları
```

## Yeni seviye/ders ekleme

`js/music-theory.js` içindeki `LEVELS` dizisine yeni bir obje eklemen yeterli:

```js
{
  id: 7,
  title: 'Yeni Ders Başlığı',
  description: 'Kısa açıklama',
  clefs: ['treble'],           // hangi anahtar(lar) kullanılacak
  positions: [0, 2, 4, 6, 8],  // hangi staffPosition değerleri sorulacak
}
```

## Yeni ikon ekleme

`js/icons.js` içindeki `ICONS` objesine 24x24 viewBox'lı bir SVG string ekle, sonra `icon('isim')` fonksiyonuyla kullan. Emoji veya sistem karakterleri kullanılmaz.

## Lisans

Kişisel/eğitim amaçlı kullanım için serbestçe değiştirilebilir.
