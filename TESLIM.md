# Beylikler Çağı (eski adıyla Gölge Kuşatması) — W2 teslimi

Statik Three.js istemcisi `game/` altında; Türkçe kullanım ve yayın kılavuzu [README.md](README.md) içindedir. Sözleşmedeki çift önekli yollar için aynı dosyalar ayrıca `deliverable/game/` ve `deliverable/README.md` altında bulunur. İki oyun klasörü bağımsız servis edilebilir; birini yayımlamak yeterlidir.

İstemci, W1'in `src/sim/index.js` API'sini doğrudan kullanır. Güncel W1 1.2 el değiştirmesinin oyun dosyaları ve belgeleri değiştirilmeden kopyalanmıştır; önceki çekirdeğin yerine onarılmış sürüm kullanılır. Girdi zipine dokunulmamıştır.

Onarımda dünya sisi CanvasTexture yeniden boyutlandırması yerine boyut değişiminde yenilenen RGBA DataTexture kullanır; shader uniform bağı ortak tutulur. Onarılmış W1’in 18 aurası ve özgün taraf/güç mekanikleri istemciye bağlandı. Liderlik kartı, yarıçap halkası, etkin aura göstergesi, kurulum istatistikleri ve güç ayrıntısı düğmesi eklendi. Servis çalışanı önbelleği `gk-shell-v1.4.0` oldu.

Korunan görsel onarımda 18 kahramana ayrı gövde oranı, başlık, silah ve sırt donanımı verildi; İlven dahil menzilli kahramanlar katalog menziline uygun donanım taşır. Altı tarafın tabur siluetleri, binekleri, kuşatma araçları ve 48 yapısı ayrı görsel dillere bağlandı. Yapılar kimlik başına tek geometride birleştirilir; figürler ortak örnek kümelerini kullanır. Küme kapasiteleri altı tam ordu ve çağrılara göre hesaplanır. Model yüksekliğine uyan can çubukları ve seçim odağı eklendi. Ayrıntılar [GORSEL_DIL.md](docs/GORSEL_DIL.md) içindedir.

Ses ve saf onarımında W1’in özgün katmanlı beste, filtreli gürültü, altı taraf tınısı, nida/nal, yankı ve konumsal ses motoru değiştirilmeden alındı. `soundscape.js` sayısal efekt/müzik kaydırıcılarını, iOS medya açılışını, duraklatmayı, gerçek olayları ve kamerayı bağlar. Ana döngü görünür olayları bir kez boşaltıp ses ve görsele aynı diziyi verir. Rol öncelikli hedef safları ve birim ayırma gerçek simülasyonda işler; çizici simülasyonun figür konumu/yön/can sorgusunu kullanır. [ISTEMCI_SES_VE_SAFLAR.md](docs/ISTEMCI_SES_VE_SAFLAR.md) ayrıntıları ve korunan prototip özelliklerini açıklar.

Savaş geri bildirimi onarımında, mühürlü simülasyon değiştirilmeden tam olay API’sini bir kez boşaltan ve takım görüşüne göre süzen `FeedbackFeed` eklendi. Görünür düşman/tarafsız ölümler model kaldırıldıktan sonra da halka ve ses üretir. Seviye olaylarının sahibi çözümlenir; rakip/müttefik seviye atlaması kişisel mesaj çıkarmaz. [GERIBILDIRIM.md](docs/GERIBILDIRIM.md) bağlantıyı ve gizli olayların korunmasını açıklar.

Üretilen istemci: prosedürel üç boyutlu arazi ve taraf modelleri, açılı RTS kamerası, takım görüş sisi, mini harita, dokunmatik ve masaüstü komutları, kontrol grupları, inşaat ve üretim kuyrukları, araştırma, kahraman ve hedefli yetenek/güç kullanımı, dokuz takım düzeni için kurulum, kilit açmalı üç bölümlük sefer, sonuç istatistikleri, rehber, ayarlar, WebAudio ses/müzik, otomatik kayıt/devam, PWA manifesti, özgün PNG simgeler ve sürümlü servis çalışanı.

Doğrulama kayıtları:

- `verification/simulation-tests.txt`: W1'in ses ve saf testleri dahil 284 testi geçti, 0 hata.
- `verification/client-flows.txt`: gerçek simülasyonla 25 istemci/arayüz/girdi/kayıt senaryosu geçti, 0 hata. DOM ve çizim katmanı taklittir.
- `verification/integrity.json`: 26 JavaScript/ES modülü sözdizimi, bütün yerel kaynak ve modül başvuruları, tek sabit CDN sürümü, özgün adlar, manifest simgelerinin PNG boyutları ve 28 önbellek girdisi denetlendi.
- `verification/cli-static-smoke.json`: katalog, düello ve 3v2 CLI örneği başka çalışma dizininden doğrulandı; statik dosya/MIME bilgileri kayıtlıdır.
- `verification/fog-regression.json`: gerçek çizici metotları ve değişmez doku depolama denetleyicisi ile 13 regresyon geçti; bütün haritalar, hareket güncellemesi, shader bağları ve kaynak temizliği sınandı. Gerçek GPU testi değildir.
- `verification/fog-browser.html`: gerçek WebGL2 üzerinde dünya çizimi, GPU hata kodları ve sis RGBA geri okumasını sınayan ek denetim sayfası; bu VM’de çalıştırılamadı.
- `verification/visual-regression.json`: 29 denetim geçti; 18 kahramanın renksiz silueti, menzile uygun silahları, gerçek çizicideki örnek dönüşleri, 48 birleştirilmiş yapı, can çubukları ve altı tam ordu kapasitesi sınandı. GPU kullanılmadı.
- `verification/hero-models.png`, `hero-silhouettes.png`, `troop-models.png`, `faction-models.png`, `building-models.png`: üretim kodundaki üçgenlerden ortak kamera/ölçek ile üretilen CPU projeksiyonları; GPU ekran görüntüsü değildir.
- `verification/model-browser.html`: gerçek oyun çizicisiyle taraf, model, bakış yönü ve kalite seçerek inceleme; bu VM’de çalıştırılamadı.
- `verification/audio-client-regression.json`: gerçek ses motoru ve adaptörüyle 12 denetim geçti; sayısal kaydırıcılar, iOS medya/bağlam açılışı, askıya alma, gerçek inşa ve süvari, konum, kahraman menzili ve kalp ritmi sınandı. Grafik düğümleri kaydedilen taklitlerdir, hoparlör testi değildir.
- `verification/audio-browser.html`: gerçek motorla altı tarafı, müziği ve konumu dinleme sayfası; cihazda çalıştırılmadı. `docs/audio-preview.wav` aynı beste verisinden üretilen PCM önizlemesidir.
- `verification/feedback-regression.json`: 14 denetim geçti; gerçek ölüm halkası/sesi, gizli ölümler, karşılıklı ölüm, seviye sahipliği ve efekt havuzu sınandı. Tam tohumlu maçta görülen 9 düşman/tarafsız ölümün 9’u ve 19 kendi kaybının 19’u ulaştı; 2 gizli ölüm gösterilmedi.
- `verification/package-check.json`: iki teslim ağacının eşitliği ve W1 kaynaklarıyla bayt karşılaştırması.

Çizim bağımlılığı Three.js **0.160.0** sürümüdür. Tarayıcı, GPU ve dış ağ kullanılamadığından gerçek görsel/iOS/PWA testi yapılmadı. VM dinleme soketi açmayı da engelledi; HTTP sunucusu denemesi `PermissionError` ile sonlandı. Bu sınırlar README'de açıklanmıştır. Oyun için harici dosya indirilmedi, paket kurulmadı, yayın yapılmadı.
