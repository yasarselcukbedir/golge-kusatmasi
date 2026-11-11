# Ses ve tabur dizilişi — onarım ve istemci bağlantısı

Bu onarım ses özelliğini basitleştirilmiş bir bip veya kısa sinüs döngüsüyle değiştirmez. `game/src/client/audio.js`, özgün olarak yazılmış, bütün sesleri kodla üreten bir Web Audio motorudur. Dış ses dosyası, örnek ses paketi, konuşma kaydı veya ağ isteği kullanmaz. Kendi kendine yeterli olduğundan mevcut `audio.js` önbellek yoluna yeni bir çalışma zamanı bağımlılığı eklemez. `score.js` yalnız önizleme araçlarının kullandığı yeniden dışa aktarım dosyasıdır.

## Ses tasarımı

76 BPM’de özgün La minör tema, sekiz akor bölümü ve 32 vuruşluk yazılı melodi içerir. Çift osilatörlü, hafif ayrıştırılmış akor pedleri alçak geçiren filtreden geçer; ayrı bas, seyrek melodi ve savaş yoğunluğunda çift kalp vuruşu eklenir. Melodi ve büyülerin yankısı 0,337 saniyelik gecikme, 1900 Hz alçak geçiren filtre ve 0,23 geri beslemeyle yumuşar. Kompresör, ana ses düzeyi ve müzik/efekt alt grupları ses taşmasını sınırlar.

Sedef berrak üçgen/metal, Filiz ince nefesli, Köz alçak metal/teker, Pus pürüzlü/tıkırtılı, Yel boru ve nal, Prizma cam/ışıltı tınılarını kullanır. Kılıç, ok, inşa, ölüm ve kuşatma için bant geçiren filtreli gürültü katmanları vardır. Nidalar iki armonik kaynak ile üç biçimlendirici frekans filtresinden oluşur; kelime veya kayıt içermez. Süvari yürürken tarafına özgü hafif nal, ağır üçlü yürüyüş, teker, hızlı tıkırtı veya cam vuruşları duyulur.

Ses merkezinden uzaklık, ses düzeyini sürekli azaltır; 420 birimden sonra olay duyulmaz. Sağ/sol kaydırma kameranın ekran sağı yönüne bağlanır. Olay ve nida tekrar aralıkları ile en çok 72 etkin kaynak, 3v3 savaşta ses kalabalığını ve düğüm sayısını sınırlar. Olaylar ses saatini kullanır; simülasyon rastlantı akışını tüketmez.

## Tarayıcı bağlantısı

`audio.js` varsayılan olarak `AudioSystem` sınıfını verir. Aynı sınıf `AudioEngine`, `GameAudio`, `AudioManager` adlarıyla da dışa aktarılır. `createAudio(options)` fabrikası vardır. Var olan istemci bu adlardan biriyle dosyayı kullanıyorsa import yolu korunabilir; aşağıdaki sözleşme ses olaylarını ve kamera konumunu bağlar.

```js
import {AudioEngine} from './src/client/audio.js';
import {
  getState, drainEvents, getBattalionLayout
} from './src/sim/index.js';

const audio = new AudioEngine({
  volume: 0.65, music: true, sfx: true
});
// Motor pointerdown/touchend/keydown hareketinde otomatik açılmayı da dener.
startButton.addEventListener('pointerdown', () => audio.unlock());

function updateAudio(deltaSeconds) {
  const view = getState(match, playerTeam);
  // Dünya y düzlemi çizimde z'ye karşılık gelebilir.
  const listener = {
    x: cameraTarget.x, y: cameraTarget.z,
    facing: 0, // Ekran sağının dünya düzlemindeki açısı.
    radius: 420
  };
  audio.handleEvents(drainEvents(match, playerTeam), view, listener);
  audio.update(deltaSeconds, view, listener);
}

// Ayarlar menüsü:
audio.configure({volume: 0.5, music: true, sfx: true});
// Duraklatma view.paused alanından da izlenir:
audio.setPaused(true);
// Menüye dönüşte veya istemci kapanırken:
await audio.dispose();
```

`unlock()` bir kullanıcı hareketinde hem AudioContext.resume hem yerel, geçerli PCM sessizlik içeren playsinline HTMLAudioElement.play çağrısını başlatır. Bu, iOS sessiz anahtar davranışı için medya kanalını da açar. Otomatik oynatma engellenirse hata yutulur ve sonraki kullanıcı hareketinde yeniden denenebilir. Kullanıcının ses/müzik ayarları korunur. Sessiz medya öğesi döngüdedir; dispose öğeyi ve zamanlayıcıyı temizler.

`play(event,state)` tek olayı, `handleEvents(events,state,listener)` bir olay grubunu işler. `play('tap')` ve eski kısa olay adları da desteklenir. Sim olayları artık saldıranın tarafını, rolünü ve sourceX/sourceY konumunu; ölüm olayları da birim kaybolsa bile tarafını ve konumunu taşır. Böylece uzaktaki veya görünmeyen olayın sesini yanlış yere koymak gerekmez. Mevcut efekt tüketicisi olayları zaten boşaltıyorsa ikinci kez drainEvents çağırmayın; aynı olay dizisini ses ve görsele dağıtın.

## Diziliş ve yumuşak ayırma

Grup hareket, nöbet, saldırı ve geri çekilme emirleri 16 birim aralıklı, en çok dört sütunlu hedef safları oluşturur. Piyade ön, menzilli ve kuşatma arka sırayı alır. Seçimdeki id sırasını değiştirmek dizilişi değiştirmez. Tek tabur emri eski davranışı korur. Saldırı emri yakın düşmanı görünce savaşır; diziliş savaş hedefini zorla kilitlemez.

Her sabit adımda üç mekânsal ayırma geçişi dost tabur merkezlerini 14, düşmanları 8 birim ayırmaya çalışır. Tam aynı konumdaki taburlar da deterministik yönde ayrılır; yeni rastlantı kullanılmaz. Sersemletilen birim sabit engel gibi ele alınır. Bu, kalabalık geçişleri yumuşatan bir düzeltmedir; duvar, sert yapı çarpışması veya yeni yol bulma sistemi değildir.

Her varlığın `facing` değeri yürürken ve saldırırken güncellenir. İstemci görsel figürleri kendi uydurduğu konumlara dağıtmak yerine aşağıdaki sorguyu kullanabilir:

```js
const slots = getBattalionLayout(match, battalion.id, playerTeam);
for (const slot of slots) {
  const figure = soldierMeshes[slot.index];
  figure.position.set(slot.x, terrainHeight, slot.y);
  figure.rotation.y = -slot.heading;
}
// soldierMeshes içindeki fazla figürleri gizleyin.
```

Piyade safları, menzilli kademeleri, süvari kaması, kuşatma grubu ve uzman halkası farklıdır. Can oranı figür sayısını azaltır; taburun toplam saldırı hasarı görsel figür sayısına bağlanmaz. Team parametresi görünmez düşmanın asker konumlarını da gizler. Emir yuvaları ve yön kayıtta saklanır; JSON geri yükleme sonrası diziliş ve ayırma aynı sonucu verir. Asker modelleri ve bu sorgunun çizime bağlanması W2 render döngüsündedir.

## Doğrulama ve teslim sınırı

Ana test çalıştırıcısı Web Audio düğüm bağlantılarını, filtreleri, ses gruplarını, yankı döngüsünü, altı tınıyı, nal ve nidayı, uzaklık/kaydırmayı, sessize almayı, duraklatmayı, mobil medya açılışını ve kaynak sınırını doğrular. Aynı beste verisinden üretilen PCM'in sessiz olmadığını, sonlu olduğunu ve taşmadığını ayrıca sınar. Bunlar gerçek tarayıcı hoparlör veya iOS cihaz testi değildir; VM'de tarayıcı yoktur.

`node game/tools/render-audio-preview.mjs` 18 saniyelik özgün `docs/audio-preview.wav` üretir. `audio-preview-report.json` süre, RMS, tepe ve taşan örnek sayısını verir. Dosya, motorun kullandığı aynı nota/envelop/filtre verileriyle çevrimdışı sentezlenir; Web Audio çıkışının cihaz kaydı değildir.

Bu W1 çalışma alanında W2'nin önceki ses dosyası veya ana çizim döngüsü bulunmuyordu. Onarım artık gerçek audio.js modülünü ve simülasyon dizilişini içerir; bütün web arayüzünü yeniden yazmaz. W2 birleştirmesinde ses modülü bu yola alınmalı, yukarıdaki olay/kamera ve figür bağlantıları korunmalı, servis çalışanının sürümü güncellenmelidir. Simülasyonun mevcut giriş/yardımcı dosya yolları korunmuştur; ayırma için yeni bir çalışma zamanı modülü bağımlılığı eklenmemiştir.
