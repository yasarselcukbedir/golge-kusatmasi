# Gölge Kuşatması

> **Anadolu beylikleri sürümü (Kasım 2026):** Taraflar artık Osmanoğulları, Aydınoğulları, Candaroğulları, Germiyanoğulları, Dulkadiroğulları ve Karamanoğulları; kahramanlar bu beyliklerin tarihî beyleri. Kaynaklar Akçe ve Kut olarak adlandırıldı, Çiftlik ile Ağıl gelir yapılarıdır. Taraf kimlikleri `osman, aydin, candar, germiyan, dulkadir, karaman` oldu. `docs/` altındaki raporlar ve bu belgenin aşağıdaki bazı örnekleri önceki adlandırmayı (sedef, filiz, köz, pus, yel, prizma) kullanır.

Altı özgün sancağın gerçek zamanlı strateji oyunu. Bir merkezden başlayıp ekonomi kurar, tabur eğitir, kahraman çağırır, karakolları ele geçirir ve karşı takımın merkezlerini kuşatırsın. Açılı Three.js kamerasıyla üç boyutlu savaş alanı; dokunmatik telefonlar ve fare/klavyeli bilgisayarlar için tasarlanmıştır.

Altı tarafın her birinde 5 tabur türü, 3 kahraman, kahraman başına 2 yetenek ve bir sürekli liderlik aurası, 4 güç, 8 yapı ve 4 araştırma bulunur. Taburlar savaşla 5. seviyeye kadar gelişir. Dört haritada dokuz takım düzeni (1’e 1’den 3’e 3’e, asimetrik düzenler dahil), müttefik yapay zekâ ve Kolay / Normal / Zor seçenekleri vardır. Üç bölümlük sefer sırasıyla merkez yıkma, karakol tutma ve kervana eşlik etme amaçlarını kullanır.

Toplam 18 liderlik aurası bulunur. Taraflar yalnız görünüşleriyle ayrılmaz: Filiz’in uzun menzilli hafif yaycıları, Köz’ün ağır kuşatması, Pus’un kalabalık ve çevik taburları, Yel’in hızlı süvarileri ve Prizma’nın yetenek odağı farklı ordular kurmayı gerektirir. Merkez/kule profilleri, kahraman kitleri, araştırma katsayıları ve güçlerin ek etkileri de taraflara göre değişir. Kurulum ekranı menzil, hız ve merkez canını katalogdan gösterir.

## Klasörler

Bu belgenin bulunduğu ana teslim ağacı:

```text
deliverable/
  README.md
  game/                         # Yayımlanacak statik kök
    index.html
    manifest.webmanifest
    sw.js
    icons/                      # Kodla üretilmiş özgün PNG simgeler
    src/client/                 # Çizim, girdi, arayüz, ses, kayıt
    src/sim/                    # W1'in değişmeden korunan kuralları
    tools/sim-cli.mjs
    tests/run-tests.mjs
    package.json
  docs/
    TASARIM.md                  # Kadrolar, kurallar, ad dönüşümleri, API
    GORSEL_DIL.md               # 18 kahraman, taraf siluetleri ve mimari
    SES_VE_DIZILIS.md           # Ses tasarımı ve sim saf API’si
    ISTEMCI_SES_VE_SAFLAR.md     # Ana döngüye gerçek bağlantı ve testler
    GERIBILDIRIM.md             # Görünür ölüm olayları ve doğru bildirimler
    audio-preview.wav           # Aynı beste verisinden PCM önizlemesi
    ENTEGRASYON.md
    balance-report.json         # W1'in 120 maçlık denge raporu
    catalog.json
    ...                         # W1'in test ve CLI kayıtları
  verification/                 # W2 denetim betikleri ve sonuçları
  deliverable/
    README.md                   # Sözleşmedeki çift önekli yolun kopyası
    game/                       # Aynı oyunun normal dosya kopyası
    docs/                       # Aynı tasarım belgeleri
```

Sözleşmede geçen tek ve çift `deliverable/` önekli yolları karşılamak için iki ağaç aynı içerikle sunulur. Oynamak veya yayımlamak için **yalnız bir `game/` klasörü** yeterlidir. Sembolik bağ yoktur. Kaynak zip değiştirilmemiştir.

## Yerelde çalıştırma

Kurulum, paket indirme veya derleme yok. Python 3 ile, `deliverable/` klasörünü içeren dizinden:

```sh
python3 -m http.server 8080 --bind 0.0.0.0 --directory deliverable/game
```

Bilgisayarda `http://localhost:8080/` adresini aç. Aynı ağdaki telefonda bilgisayarın yerel IP adresini kullanabilirsin. HTTP üzerinden LAN erişiminde oyun çalışabilir; PWA kurulumu ve çevrimdışı önbellek için **HTTPS veya localhost** gerekir. Bu ortamda port ayrıca dışarı açılmak zorundaysa ortamının port yönlendirmesini kullan.

`game/` klasörünün içindeysen aynı işlem:

```sh
python3 -m http.server 8080
```

**`file://` desteklenmez.** `index.html` dosyasına çift tıklamak ES modüllerini ve servis çalışanını engeller. Güncel Chrome, Edge, Firefox veya Safari ve etkin WebGL gerekir. WebGL ya da çizim bileşeni yüklenemezse Türkçe hata ekranı görünür.

İlk açılışta internet gerekir: tek uzak bağımlılık, tam **Three.js 0.160.0** sürümüne sabitlenmiş `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` modülüdür. Yazı tipleri sistemden gelir; diğer bütün dosyalar yereldir.

## GitHub Pages ile yayımlama

1. Yeni bir GitHub deposu oluştur. Seçtiğin `game/` klasörünün **içeriğini**, `index.html` depo kökünde olacak şekilde depoya kopyala. `src/`, `icons/`, `sw.js` ve manifesti birlikte koru. `docs/` tasarım belgelerini yayımlamak zorunda değilsin.
2. Dosyaları GitHub’a gönder. Deponun **Settings → Pages → Build and deployment** bölümünde **Deploy from a branch**, kendi ana dalın ve **/(root)** klasörünü seç; kaydet.
3. GitHub Pages’in verdiği HTTPS adresi hazır olduğunda aç. Bütün yerel başvurular göreli olduğu için proje alt yolu da çalışır.
4. Alternatif olarak `game/` içeriğini depodaki `docs/` klasörüne koyup Pages kaynağı olarak **/docs** seçebilirsin. Oyun dosyalarını farklı klasörlere dağıtma.
5. Bir sürüm güncellerken `sw.js` içindeki `gk-shell-v1.4.0` adının sürümünü artır; yeni kaynak eklediysen `PRECACHE` listesini de güncelle. Yeni servis çalışanı kurulduktan sonra sayfayı yenile. Eski oyun önbellekleri etkinleştirmede temizlenir.

Bu teslim kapsamında yayın veya dağıtım yapılmamıştır; yukarıdaki adımları depo sahibi uygular.

## Oynanış

Ana menüde **Çarpışma**, **Sefer**, **Devam et**, **Ayarlar** ve **Nasıl oynanır** bulunur. Çarpışma hazırlığında iki takımın boyutlarını ayrı seç; kendi, müttefik ve rakip yuvalarının taraflarını belirle. İlk yuvadaki komutan sensin, diğerleri yapay zekâdır. Takım arkadaşları görüş paylaşır. Üç sefer görevi sırayla açılır; tamamlanan bölümler yeniden oynanabilir. Yeni bir oyun, tek otomatik kayıt yuvasını kullanır.

- **Akçe** altın karşılığıdır; yapılar, taburlar, kahramanlar ve araştırmalar bu kaynağı harcar. Başlangıç geliri saniyede 3 akçedir; Çiftlik (+2,5) ve Ağıl (+3,2) geliri artırır. Her tamamlanmış Hasatlık saniyede 2,5 öz ekler. **Uyum** güç kaynağıdır; zamanla ve hasar vererek birikir. Üst çubukta her ikisini ve nüfusu görürsün.
- **İnşa:** Yapı kartını seç, merkezinin çevresindeki 100 birimlik halkada bir konuma tıkla/dokun. Yapılar arasında en az 16 birim aralık gerekir. Yeşil/kırmızı yerleştirme önizlemesi yardımcıdır; son kararı simülasyon verir. İnşaat görünür biçimde yükselir; tamamlanmadan üretim yapılamaz.
- **Üretim:** Saf Ocağı piyade ve uzman; Atış Meydanı menzilli; Binek Avlusu süvari; Kuşatma İşliği kuşatma üretir. Tamamlanan yapıyı seç, kartlarına bas. Kuyruk en fazla 5 öğe tutar; sıradaki taburlar da nüfus ayırır. Üretim kartları tekrar basılarak kuyruğa eklenir. İptal/iade işlemi yoktur.
- **Toplanma:** Bir bina seçip sağ tıkla veya **Toplan** düğmesinden bir yer hedefle. Yeni eğitilen birlikler o noktaya saldırarak ilerler. Bayrak etkisi ve bildirim hedefi onaylar.
- **Karşıtlık:** Piyade süvariye; süvari menzilliye; menzilli piyadeye üstün gelir. Kuşatma yapılara büyük hasar verir; normal saldırılar yapılara karşı zayıftır. Tek tür tabura yaslanmak yerine rakibe göre ordu kur.
- **Kahramanlar:** Merkezden veya Kahraman sekmesinden çağrılır. Her kahramandan aynı anda bir tane olabilir; yenilirse tekrar eğitilebilir. Savaş deneyimi canı ve hasarı artırır. İlk yetenek 1., ikinci yetenek 3. seviyede açılır. Kahramanı seç, yetenek kartını veya Q/E’yi kullan, menzil içindeki görünür bir alanı hedefle.
- **Liderlik auraları:** Her kahraman, yaşayan dost tabur ve kahramanlara yarıçap ve rol koşuluyla sürekli destek verir. İyileşme, hasar, zırh, menzil, hız, görüş veya yetenek temposu sağlar. Kahraman kendini etkilemez; aynı türde en güçlü aura işler. Lider ölür veya uzaklaşırsa destek biter. Kahramanı seçince etki halkası, adı, kapsamı ve rol filtresi görünür. Birlik bilgi kartı simülasyondan gelen etkin desteği ve güncel istatistikleri gösterir.
- **Araştırma:** Gelişim Evi’ni kurup seç. Keskinlik saldırıyı, Katman canı, Akış geliri, Adım hızı geliştirir. Aynı anda bir araştırma yapılır; tamamlanmış geliştirme bütün ilgili birlikleri etkiler.
- **Karakollar:** En az bir kalıcı tabur veya kahramanı 35 birim yakınında 10 saniye tut. Rakip de yakınsa ele geçirme ilerlemez. Ele geçirilen her karakol sahibine saniyede 2 öz verir. **Kamplar** nöbetçileri yenilince bir defalık öz ve deneyim sağlar.
- **Güçler:** Güçler sekmesindeki dört kart veya Z/X/C/V kullanılır. Ekonomi gücü anında öz ve tarafına özel ek destek verir; diğerleri görünür alan hedefi ister. Karttaki **ⓘ** düğmesi savaşı duraklatıp tam etkiyi açıklar. Örneğin Sedef’in karakol primi, Filiz’in geçici gelir artışı, Köz’ün üretim hızlanması, Pus’un öldürme ödülü, Yel’in baskın geliri ve Prizma’nın yetenek beklemesi azaltması farklıdır. Alan güçleri de onarım, zehir, itme, süvari desteği, yansıtma veya koruma silme gibi farklı etkiler taşır; çağrılan roller de değişir. Kartlarda uyum maliyeti ve bekleme süresi yazılıdır. Seviye/kaynak/bekleme kilitleri gösterilir, geçersiz emirlerin Türkçe nedeni bildirilir.
- **Saflar:** Toplu hareket, saldırı ve geri çekilme emirlerinde taburlar hedef çevresinde ayrı, rol öncelikli saflara yerleşir; piyade önde, menzilli ve kuşatma arkada kalır. Birimler kalabalıkta yumuşak biçimde birbirinden ayrılır. Figürler rolüne göre saf, kademe, kama veya halka oluşturur; can azaldıkça daha az asker görünür. Taburun hasarı figür sayısına bağlı değildir.
- **Geri çekil:** Seçili taburları merkeze döndürür. Birlikler savaş dışında üs yakınında iyileşir. Hareket emri yol boyunca savaşmak yerine ilerler; **Saldır** emri yakındaki düşmanlarla savaşarak ilerler.
- **Savaş geri bildirimi:** Görünür düşman ve kamp nöbetçisi kayıpları, model kaldırıldıktan sonra da ölüm halkası ve konumsal ses üretir. Gizli ölümler gösterilmez. Seviye halkası görünür rakip ve müttefiklerde de bulunur; kişisel seviye bildirimi yalnız kendi birliğin içindir. Aynı anda birden çok seviye atlayan birliğin ulaştığı son seviye bildirilir.
- **Görüş:** Keşfedilmemiş arazi koyu, keşfedilmiş ama görüş dışındaki arazi loştur. Düşmanlar görüş dışına çıktığında çizilmez. Mini harita aynı sis verisini kullanır; üzerine tıklayarak kamerayı taşırsın.
- **Zafer:** Çarpışmada karşı takımın **bütün merkezlerini** yık. Kendi merkezin düşerse emir veremezsin; müttefiklerin savaşı sürdürebilir. Seferde açık görev panelindeki özel amaç ve süre geçerlidir. Sonuç ekranında üretim, yenilen varlıklar, kayıp, hasar ve gelir gösterilir.

## Fare ve klavye

| Girdi | İşlev |
| --- | --- |
| Sol tık | Kendi birliğini veya binanı seç; boş alanda seçimi kaldır |
| Sol düğmeyle sürükle | Kutu içinde tabur ve kahraman seç |
| Shift + tık / kutu | Seçime ekle; seçili birliğe Shift + tıkla çıkar |
| Aynı tür birliğe çift tık | O türden bütün kendi birliklerini seç |
| Sağ tık | Seçili birliklere yürü; görünür düşmana saldır; seçili binadan toplanma noktası belirle |
| Tekerlek | Kamerayı yakınlaştır / uzaklaştır |
| WASD / yön tuşları | Kamerayı kaydır |
| Orta düğmeyle sürükle / Space + sol sürükle | Kamerayı sürükle |
| Ekranın açık kenarına fareyi götür | Kamerayı o yöne kaydır |
| T veya Ctrl+A | Bütün kendi tabur ve kahramanlarını seç |
| Ctrl+1…9 / 1…9 | Kontrol grubu ata / grubu seç ve kamerayı götür |
| B / H / F / U | İnşa / Kahraman / Güçler / Seçim sekmesi |
| B, ardından 1…8 | Sırayla Çiftlik, Ağıl, Yaya Ocağı, Okmeydanı, Tavla, Cebehane, Demirci Ocağı, Gözcü Kulesi seç; ardından haritaya yerleştir |
| M / G | Yürü / saldırarak ilerle; ardından hedef tıkla |
| R | Seçili birlikleri geri çek |
| Y | Seçili bina için toplanma hedefi seç |
| Q / E | İlk seçili kahramanın birinci / ikinci yeteneği; ardından hedefle |
| Z / X / C / V | Tarafın dört gücü; ekonomi gücü anında, diğerleri hedefli |
| Home | Kamerayı merkeze götür |
| Esc | Önce hedeflemeyi iptal et; hedef yoksa duraklat / devam et; alt menüden geri dön |
| P / üstteki Ⅱ | Duraklat / devam et |
| Mini haritaya tık / sürükle | Kamerayı o konuma taşı |

Hedefleme sırasında sağ tık da hedefi iptal eder. Shift ile yerleştirme aynı yapıdan art arda kurmaya devam eder. İnşa sekmesindeyken düz rakamlar yapı seçer; gruba dönmek için U ile Seçim sekmesine geç.

## Dokunmatik

| Hareket / düğme | İşlev |
| --- | --- |
| Kendi birliğine / binasına dokun | Seç ve komut kartlarını aç |
| Seçim varken boş alana dokun | Birlikleri yürüt; bina seçiliyse toplanma noktası koy |
| Seçim varken görünür düşmana dokun | Seçili birliklerle saldır |
| Birliğe çift dokun | O türden bütün kendi birliklerini seç |
| Boş alandan tek parmak sürükle | Kamerayı kaydır |
| Seçili birliğin üstünden hedefe sürükle | Yürü / görünür düşmana saldır emri ver |
| **Kutu** → sürükle | Çoklu birlik seç; Kutu’ya yeniden dokunarak serbest komutaya dön |
| **Kamera** → sürükle | Seçimden bağımsız kamera kaydır; yeniden dokunarak serbest komutaya dön |
| İki parmağı sıkıştır / aç | Yakınlaştır / uzaklaştır |
| İki parmağı birlikte kaydır | Kamerayı taşı |
| Mini haritaya dokun / sürükle | Kamerayı taşı |
| Mini haritanın + / − / Üs düğmeleri | Yakınlaş / uzaklaş / merkeze dön |
| Alt sıradaki 1…4’e basılı tut | Seçimi o kontrol grubuna kaydet |
| Grup numarasına dokun | Grubu seç ve kamerayı götür |
| **Tümü / Yürü / Saldır / Çekil / Toplan** | Klavyesiz temel ordu emirleri; hedef isteyenlerde ardından haritaya dokun |
| İnşa / yetenek / güç kartına dokun | Kartı seç; gerekiyorsa haritada görünür bir hedef belirle |
| Hedef şeridindeki **İptal** | Geçerli hedefleme işlemini bırak |
| **Görevler** başlığı | Amaç panelini aç / kapat |

Alt kart sırası yatay kayar. Dikey ve yatay düzen, ekran kesikleri ve güvenli kenar boşlukları dikkate alınarak düzenlenir. Küçük yatay ekranda rehber kartı kendi içinde kaydırılabilir. Telefon tek elle mini harita, alt komutlar ve yakınlaşma düğmeleriyle de yönetilebilir.

## Kayıt, ses ve kurulum

Ayarlar (efekt sesi, müzik, titreşim, kalite ve rehber), son kurulum, sefer ilerlemesi ve **bir** otomatik kayıt `localStorage` içinde aynı tarayıcı ve adrese bağlıdır. Gizli gezinme veya kapalı depolama kaydı engelleyebilir; otomatik kayıt yazılamazsa bildirim çıkar. Tarayıcı verisini silmek kayıtları siler. Kayıt 15 saniyede bir, duraklatırken, menüye dönerken ve sayfa gizlenirken alınır. **Devam et**, `restore()` API’siyle bütün maç durumunu yükler; kamera, seçim ve kontrol grupları da geri gelir. Dönüşte savaş düğmeyle sürdürülür. Bitmiş maçın otomatik kaydı kaldırılır; sefer başarısı ayrıca saklanır.

Sesler WebAudio ile koddan üretilir. Özgün 76 BPM La minör tema; çift osilatörlü akor pedleri, hafif detune, alçak geçiren filtre, yazılı melodi, bas ve süzülmüş geri beslemeli yankı içerir. Gerçek çatışmada çift kalp vuruşu eklenir. Altı tarafın darbe/nida tınıları, süvari yürüyüşü, kılıç/ok/inşa/kuşatma gürültüleri farklıdır; ses kameradan uzaklıkla kısılır ve sağa/sola kayar. İlk dokunuş/tıklama hem AudioContext’i hem iOS için sessiz satır içi medya öğesini açar. Duraklatma ve arka plan sesi keser. **Ayarlar** içindeki efekt ve müzik kaydırıcıları ayrı ses gruplarını yönetir. En çok 72 etkin kaynak ve kompresör ses kalabalığını sınırlar. Titreşim yalnız tarayıcı destekliyorsa çalışır. İlk yeni maç rehber teklif eder; Ayarlar’dan sonraki maç için yeniden açılabilir. Ayrıntılar [ses ve saf bağlantısı belgesinde](docs/ISTEMCI_SES_VE_SAFLAR.md) bulunur.

PWA için HTTPS/localhost üzerinden ilk yüklemeyi internet varken tamamla. Servis çalışanı giriş sayfasını, bütün `src/` modüllerini, CSS’yi, simgeleri ve sabit Three.js modülünü birlikte önbelleğe alır. Kurulum başarılı olduktan sonra çevrimdışı yeniden açılabilir; ilk açılış çevrimdışı olamaz. Ana menüde **Uygulamayı yükle** düğmesini kullan; desteklenmiyorsa tarayıcının kurulum menüsü, iOS Safari’de **Paylaş → Ana Ekrana Ekle** yolunu izle. Dosya indirip yerel uygulamaya paketleme gerekmez.

## Testler ve komut satırı

Aşağıdaki komutlar, `deliverable/` klasörünü içeren dizinden **Node 22** ile çalışır; npm kurulumu gerekmez. Betikler başka çalışma dizinlerinden mutlak dosya yollarıyla da çalışır. Çıktı yolları CLI’de `--output` verilmişse çağrıldığı dizine göredir.

```sh
# W1: gerçek kuralların testleri
node deliverable/game/tests/run-tests.mjs

# Tam içerik kataloğu (JSON)
node deliverable/game/tools/sim-cli.mjs catalog

# Yapay zekâ maçı; bu araçta bütün yuvalar yapay zekâdır
node deliverable/game/tools/sim-cli.mjs match --seed 17 --map catal --mode 3v2 --factions sedef,filiz,koz,pus,yel --difficulty normal --max-seconds 2400 --snapshot-at 300

# Piyade / süvari karşıtlık düellosu
node deliverable/game/tools/sim-cli.mjs duel --faction sedef --a sedef_infantry --b sedef_cavalry --seed 1

# Yeni denge raporu; W1'in mühürlü raporunu değiştirmez
node deliverable/game/tools/sim-cli.mjs balance --seed 1 --max-seconds 2400 --output deliverable/verification/balance-new.json

# W2: dosya başvuruları, JavaScript, manifest, simgeler, önbellek ve ad denetimi
node deliverable/verification/audit-client.mjs

# W2: gerçek sim API'siyle istemci akışları ve girdi; çizim/DOM taklitleri kullanır
node --experimental-vm-modules deliverable/verification/client-flows.mjs

# W2: gerçek çizici metotları, dört harita ve değişmez doku depolama regresyonu
node --experimental-vm-modules deliverable/verification/fog-regression.mjs

# W2: 96 prosedürel model, renksiz siluetler ve gerçek çizici bağlantısı
node --experimental-vm-modules deliverable/verification/visual-regression.mjs

# W2: gerçek ses motorunun sayısal ayar, kamera, olay ve yaşam döngüsü bağlantısı
node deliverable/verification/audio-client-regression.mjs

# W2: görünür ölüm, sahiplik, gerçek efekt/ses bağlantısı ve tam tohumlu maç
node --experimental-vm-modules deliverable/verification/feedback-regression.mjs
```

İstemci akışlarında 25, sis regresyonunda 13, model regresyonunda 29, ses adaptörü regresyonunda 12 ve savaş geri bildiriminde 14 denetim bulunur; güncel W1 çekirdeğinin ses ve saf kuralları dahil 284 testi vardır. Sis regresyonu gerçek `setMap`, `setView` ve shader bağlama metotlarını çalıştırır; GPU yerine Three.js r160/WebGL2’nin değişmez doku boyutu koşulunu zorlayan bir denetleyici kullanır. Eski canlı yeniden boyutlandırmanın bu denetimde reddedildiği de sınanır.

Geri bildirim denetimi, tam tohumlu bir maçta görülen 9 düşman/tarafsız ölümün 9’unun ve 19 kendi kaybının 19’unun istemciye ulaştığını, 2 gizli ölümün gösterilmediğini doğrular. Gerçek ölüm halkası ve ses metotları, sahiplik ve bildirim bağlantısı ayrıca sınanır. Mühürlü simülasyon değiştirilmeden kullanılan olay adaptörünün ayrıntıları [GERIBILDIRIM.md](docs/GERIBILDIRIM.md) içindedir.

Gerçek GPU denetimi için teslim kökünü servis et:

```sh
python3 -m http.server 8081 --directory deliverable
```

`http://localhost:8081/verification/fog-browser.html` adresinde düğmeye bas. Bu sayfa gerçek oyun çizicisini ve Three.js 0.160.0’ı kullanır; Çatal Ufuk → Sessiz Havza → Bakır Teraslar → Ayna Geçidi → Çatal Ufuk geçişinde ilk yükleme ve hareket sonrası bütün RGBA piksellerini GPU’dan okuyup simülasyonla karşılaştırır, WebGL hata kodlarını da denetler. Bu sayfanın sonucu ancak gerçek bir tarayıcıda çalıştırıldığında oluşur; VM’de çalıştırılmış gibi sunulmaz.

`http://localhost:8081/verification/model-browser.html` gerçek oyun çizicisiyle 18 kahraman, 30 tabur ve 48 yapının taraf, bakış yönü ve kalite seçenekleriyle incelenmesini sağlar. Büyük silahlar, başlıklar, binekler, sancaklar ve mimari taşıyıcılar farklıdır. `verification/hero-models.png`, `hero-silhouettes.png`, `troop-models.png` ve `building-models.png` oyundaki aynı üçgenlerin CPU projeksiyonlarıdır; **GPU ekran görüntüsü değildir**. Tasarım ve yeniden üretim komutları [GORSEL_DIL.md](docs/GORSEL_DIL.md) içindedir. Model regresyonu gerçek `soldier()`, birleştirilmiş yapı ve `draw()` metotlarını kayıt tutan grafik ilkelleriyle çalıştırır; GPU veya kare hızı ölçmez.

`http://localhost:8081/verification/audio-browser.html` gerçek istemci motoruyla besteyi, altı taraf tınısını, süvari yürüyüşünü ve uzaklık/kaydırmayı dinletir. Bu sayfa Three.js veya ses paketi indirmez. `docs/audio-preview.wav`, aynı beste verisinden üretilen 18 saniyelik PCM örneğidir; tarayıcı/hoparlör kaydı değildir. Ses grafiği ve olay bağlantısı otomatik denetlenmiştir; gerçek ses ve iOS sessiz anahtar davranışı bu VM’de ölçülmemiştir.

`match` seçenekleri: `--seed`, `--map`, `--mode`, `--factions`, `--difficulty`, `--max-seconds`, `--snapshot-at`. `difficulty`, tek değer veya iki takım için `zor,kolay` gibi iki değer alır. `duel`: `--faction`, `--a`, `--b`, `--seed`. `balance`: `--output`, `--max-seconds`, `--seed`. Haritalar `catal`, `havza`, `teras`, `ayna`; taraflar `sedef`, `filiz`, `koz`, `pus`, `yel`, `prizma`. Nüfus birimi figür değil taburdur. CLI zaman sınırında bitmeyen maçta `winner_team: null` raporlar; istemcinin çarpışmasında bu CLI sınırı uygulanmaz.

W1'in mevcut raporu normal zorlukta dört haritada bütün sıralı taraf eşleşmelerini kapsayan 120 deterministik yapay zekâ maçıdır. Rapordaki taraf galibiyetleri %40–65 aralığındadır. Bu, aynı kaynak kurallarında ölçülen bir göstergedir; bütün insan stratejilerinin veya asimetrik takım boyutlarının eşit olduğu anlamına gelmez. Ayrıntılar `docs/TASARIM.md` ve `docs/balance-report.json` içindedir.

## Teknik seçimler ve sınırlar

HTML5, derlemesiz ES modülleri ve Three.js **0.160.0** kullanılır. Güncel W1 1.2 tesliminin DOM’suz, bağımlılıksız, tohumlu ve yarım saniyelik sabit adımlı simülasyonu **bayt düzeyinde değiştirilmeden kopyalanmıştır**. Böylece onarılmış aura, taraf kadrosu, güç, saf ve ayırma kuralları istemcide yeniden yazılmaz. W1’in ses motoru da değiştirilmeden korunur; `soundscape.js` sayısal kaydırıcıları, olayları, kamerayı ve duraklatmayı bu motora bağlar. İstemci görünür takım sorgularını çizer; bütün maç emirleri `issueCommand()` üzerinden geçer. Kurallar istemcide uygulanmaz; yerleştirme halkası yalnız önizlemedir. Üç boyutlu figürler tabur varlıklarının görsel dizilişidir.

Dünya sisi, W1’in RGBA sis çerçevesini kullanan bir `DataTexture` üzerinden çizilir. Harita ızgarası boyut değiştirirse yeni doku oluşturulur, bütün shader’ların ortak uniform bağı yeni dokuya yöneltilir ve eskisi serbest bırakılır. Aynı boyutta yalnız piksel verisi güncellenir; yüklenmiş dokunun boyutları değiştirilmez. Dört harita sırasıyla 32×21, 34×23, 30×22 ve 33×20 hücredir. `unpackAlignment=1`, `flipY=false`, en yakın komşu örnekleme ve dünya y → doku v eşlemesi kullanılır.

Her kahraman katalog kimliğine bağlı ayrı silah, başlık, gövde oranı ve sırt donanımı taşır; Azyel atlı, Avelis yükselen duruştadır. Menzilli kahramanların yay, arbalet, top kolluğu veya odak asaları gerçek katalog menziline uyar. Tarafların taburları zırh, pelerin, silah ve binek yapısıyla ayrılır. Altı merkez mimarisi kabuk burçları, canlı ağaç, dökümhane, kervan çadırı, rüzgâr kulesi ve asılı kristal olarak tasarlanmıştır. Ayrıntılar [görsel dil belgesinde](docs/GORSEL_DIL.md) bulunur.

Yükü azaltmak için asker parçaları ortak şekillerin `InstancedMesh` kümelerinde çizilir; kapasite altı tam ordu ve çağrılara göre bir kez hesaplanır. Binalar katalog kimliği başına tepe renkli tek geometride birleştirilir. Geometri/malzeme paylaşılır, efektler havuzlanır, görüntü oranı sınırlandırılır, simülasyon görüntüsü kare başına kopyalanmaz. Düşük kalite daha az figür ve bitki, Orta dengeli yoğunluk, Yüksek ek gölge kullanır. Bunlar aynı simülasyonu oynatır; düşük kalite tabur gücünü azaltmaz.

Bu VM dinleme soketi açmayı da engellediğinden yerel HTTP sunucusu burada başlatılamadı; dosya yolları ve Python MIME türleri statik olarak denetlendi.

Bu VM’de tarayıcı ve GPU bulunmadığı için **gerçek tarayıcıda görüntü, iOS jestleri, kurulum ve kare hızı ölçülmedi**. Çizim ve uyumluluk kod incelemesiyle; simülasyon otomatik testlerle; istemci komut akışları taklit DOM/çizim üstünde doğrulanmıştır. İlk gerçek cihaz denemesinde portre/yatay düzen, çoklu dokunma, CDN erişimi ve çevrimdışı yeniden açılma ayrıca denenmelidir. Bu bir ölçülmüş performans garantisi değildir.

Hareket düzlem üzerindedir; taburlar yumuşak biçimde birbirinden ayrılır, arazi yavaşlatır fakat yapılar ve ağaçlar katı çarpışma engeli oluşturmaz. Duvar, kapı veya karmaşık yol bulma yoktur; bu W1'in belgeli tasarım tercihidir. Sis dışında düşman için son konum hayaleti gösterilmez. Çevrimdışı erişim tarayıcının önbelleği korumasına bağlıdır. Ağ üzerinde çok oyunculu, hesap, sunucu, bulut kaydı, reklam ve izleme yoktur.

Çalışma ticari amaç taşımayan bir hobi projesidir. Oyun içeriğinin bütün adları, geometrileri, simgeleri ve sesleri özgün/prosedüreldir; üçüncü taraf görsel veya ses paketi içermez. Three.js kendi MIT lisanslı çizim kütüphanesidir ve CDN’den yüklenir. Kaynak esinlenmelerdeki adlar yalnız W1'in tasarım belgesinin tarihsel dönüşüm tablosunda bulunur, yayımlanan oyun içeriğine taşınmamıştır.
