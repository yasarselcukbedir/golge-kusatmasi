# Ses ve safların gerçek istemciye bağlanması

W2 1.4, W1’in ses/diziliş onarımını oyunun ana döngüsünde kullanır. W1 1.2’nin `src/sim/**`, `src/client/audio.js`, `src/client/score.js`, araç, test ve belge dosyaları değiştirilmeden kopyalanmıştır. Buradaki not, [SES_VE_DIZILIS.md](SES_VE_DIZILIS.md) bağlantı sözleşmesinin teslim edilen istemcide nasıl uygulandığını açıklar.

## Korunan ve genişletilen özellikler

| Prototipteki özellik | Teslim edilen karşılık |
| --- | --- |
| Yazılı minör tema, hafif ayrıştırılmış akorlar, bas ve melodi | Yeni özgün La minör beste: 76 BPM, sekiz akor bölümü, 32 vuruşluk melodi, çift osilatörlü akor pedleri ve ayrı bas |
| Alçak geçiren filtre ve geri beslemeli yankı | Ped filtreleri, 0,337 saniyelik gecikme, 1900 Hz yankı filtresi ve 0,23 geri besleme; ayrıca ana kompresör |
| Çatışmada kalp vuruşu | Gerçek saldırı olayından sonra kısa süreli çift kalp vuruşu ve hafif gürültü ritmi; maçın açık olması tek başına çatışma sayılmaz |
| Tarafa özgü darbe, nida ve süvari yürüyüşü | Altı özgün profil; biçimlendirici filtreli iki katmanlı nidalar, nal, hafif adım, teker, hızlı tıkırtı ve cam vuruşları |
| Kılıç, ok, inşa ve patlama gürültüleri | Rol ve tarafa göre bant geçiren gürültü; inşada zamanlanmış darbeler, menzillide hava kesişi ve kuşatmada düşük basınç darbesi |
| Kameradan uzaklığa göre ses | Kameranın hedef konumuna göre sürekli kısılma, 420 birim dışında kesilme ve ekran sağına göre stereo kaydırma |
| iOS sessiz medya açılışı | Aynı kullanıcı hareketinde `AudioContext.resume()` ve yerel PCM sessizliği içeren döngülü `playsinline` medya öğesi |
| Taburların hedef çevresinde yayılması ve birim ayırma | Simülasyonda rol öncelikli 16 birimlik hedef safları; her adımda üç mekânsal ayırma geçişi; tam çakışmanın deterministik çözümü |

Müzik ve sesler örnek paketi veya konuşma kaydı kullanmaz. Önceki kısa sinüs döngüsü değiştirilmiştir; bu sürüm prototipteki katmanları koruyan yeni özgün besteyi kullanır. Hiçbir içerik adı veya varlık kaynak esinlenmeden alınmaz.

## Olay, kamera ve yaşam döngüsü

`app.js` olayları dört Hz’lik görünür durum yenilemesinde `FeedbackFeed` aracılığıyla alır. Adaptör, `drainEvents(match)` ile tam olay dizisini **bir kez** boşaltır; takım görüşüne göre süzer ve eksik sahiplik/konum alanlarını tamamlar. Bu, canlı varlık arayan W1 takım filtresinin düşürdüğü görünür ölümleri de korur. Ayrıntılar [GERIBILDIRIM.md](GERIBILDIRIM.md) içindedir. Aynı olay dizisi hem `Battlefield.handleEvents()` hem `Soundscape.handleEvents()` metoduna gider. Çizici artık olay türünden genel bir bip üretmez. Ses, saldıranın tarafını, rolünü ve `sourceX/sourceY` konumunu alır. İnşa gibi yalnız varlık kimliği taşıyan olaylar görünür durumdan çözümlenir; karakol ve kamp konumları da görünür sorgudan bulunur. Sonuç ekranı tek zafer/yenilgi melodisi çalar. Komut, seçim, araştırma ve hata bildirimlerinin sesleri korunur.

`soundscape.js`, mühürlü `AudioSystem` üstünde ince bir arayüz/yaşam döngüsü adaptörüdür. Ayarlar ekranındaki **sayısal** efekt ve müzik kaydırıcılarını ayrı ses gruplarına uygular. Bütün sesler, yankı dahil, ana kompresör ve ses düzeyinden geçer. Her karede kamera hedefi dinleyiciye ve saniye cinsinden kare süresi motora aktarılır. Görünür durum yalnız hareket eden süvarilerin yürüyüşünü tetikler; statik birlikler sürekli nal çalmaz. En çok 72 etkin kaynak ve olay tekrar aralıkları kalabalık savaşı sınırlar. Ses kendi rastlantı akışını kullanır; simülasyon tohumunu tüketmez.

Duraklatma veya sekmenin gizlenmesi her iki ses grubunu keser, AudioContext’i askıya alır ve sessiz medya döngüsünü durdurur. Devam etme kullanıcı hareketinde bağlam ve medya kanalını yeniden açar. Eski bir kare durumu bu duraklatmayı bozamaz. Yeni maçta yeniden kullanılan varlık kimlikleri, eski yürüyüş izleri ve çatışma efektleri temizlenir. WebAudio yoksa veya tarayıcı açılışı reddederse oyun sessiz biçimde sürer; sonraki hareket tekrar deneyebilir.

## Grup emirleri ve görünen figürler

Hareket, saldırı, nöbet ve geri çekilme saflarını W1 belirler; istemci seçili birliklere kendi hedeflerini dağıtmaz. Yakın dövüş safları öne, menzilli ve kuşatma arkaya sıralanır. Dost ve düşman tabur merkezleri yumuşak biçimde ayrılır; sersemletilmişler itilemez. Bu, sert duvar çarpışması veya yeni yol bulma değildir. Saf hedefi, yön ve ayırma kayıt içinde korunur.

İstemci, takım görünür durumundaki taburlar için `getBattalionLayout(match,id)` sorgusunu alıp çiziciye verir. Gizli düşman kimlikleri bu listede bulunmaz. Görüş önceden uygulandığından isteğe bağlı takım parametresini her taburda yeniden kullanıp bütün görüşü hesaplatmak gerekmez. Çizici, bağımsız model inceleme sayfasında aynı simülasyonun saf yardımcısını kullanır.

Piyade safları, menzilli kademeleri, süvari kaması ve uzman halkaları çizime taşınır. Model yerel +Z yönüne baktığı için simülasyonun +X yönü `π/2 − heading` dönüşüyle eşlenir; saldırı ve bekleyişte yön korunur. Model genişliğine uyması için yalnız **tabur merkezine göre figür aralığı** görsel ölçekte büyütülür: süvari 1,5, uzman 1,3, diğerleri 1,8. Bu, taburun gerçek konumunu, menzilini, saf hedefini veya ayırma hesabını değiştirmez.

Can azaldıkça sorgudaki figür sayısı düşer. Düşük/Orta/Yüksek kalitede en çok 3/5/8 asker gösterilir; kahraman ve ikmal kızağı tek figür, kuşatma taburu tek büyük makineyle temsil edilir. Kuşatma makinesinin sayısı görsel bir tercihtir; tabur gücü değişmez. Asker parçaları yine ortak `InstancedMesh` kümelerine girer; yapıların birleştirilmiş geometrileri, özgün kahraman modelleri, sis, can çubukları ve efekt havuzu korunmuştur.

## Doğrulama

```sh
node deliverable/game/tests/run-tests.mjs
node deliverable/verification/audio-client-regression.mjs
node --experimental-vm-modules deliverable/verification/client-flows.mjs
node --experimental-vm-modules deliverable/verification/visual-regression.mjs
```

W1’in 284 testi, ses grafiği ve çekirdek safları dahil kuralları sınar. Ek 12 adaptör denetimi kaydırıcı, konum, gerçek inşa ve yürüyüş olayları, kalp ritmi ve mobil medya açılışını; 25 istemci akışı gerçek ana döngünün olay/kamera/saf bağlantısını ve kayıt dönüşünü; 29 model denetimi gerçek örnek dönüşlerini, sorgu tüketimini ve yaralı asker sayısını doğrular. WebAudio düğümleri kaydedilen ilkellerdir; gerçek hoparlör veya iOS testi değildir.

Teslim kökü HTTP(S) ile servis edildiğinde `verification/audio-browser.html` gerçek motorla besteyi, altı tınıyı, olayları ve konumsal kısılmayı dinletir. [audio-preview.wav](audio-preview.wav) aynı beste verisinden üretilen 18 saniyelik çevrimdışı PCM örneğidir; cihaz kaydı değildir. Raporda tepe yaklaşık 0,154, RMS 0,039 ve taşan örnek 0’dır. VM’de tarayıcı, hoparlör ve iOS cihazı bulunmadığından bu cihaz doğrulamaları yapılmamıştır.

Servis çalışanı önbelleği `gk-shell-v1.4.0` olmuştur; ses adaptörü ve beste modülü diğer bütün kaynaklarla birlikte önbelleğe alınır. Yayın yapılmamıştır.
