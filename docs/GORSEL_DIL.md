# Altı sancağın görsel dili

W2 1.2, yalnız sunum katmanını değiştirir. Simülasyonun kadrosu, menzilleri, yetenekleri, auraları ve güçleri W1’den aynen okunur. `src/client/visuals.js`, her katalog kimliğini kendi prosedürel modeline bağlar. `figures.js` figürleri, `architecture.js` yapıları, `geometry.js` ortak üçgenleri üretir. Renk değiştirerek aynı modeli çoğaltma yerine gövde oranı, başlık, silah, binek, sırt donanımı ve mimari kütleler birlikte ayrılır.

## Taraflar

| Taraf | Ordu silueti | Binek ve kuşatma | Merkez ve yapılar |
| --- | --- | --- | --- |
| Sedef Birliği | Kabuk omuzluk, yelpaze başlık, yuvarlak kalkan, üç çatallı kargı | Kabuk zırhlı binek; tekne gövdeli mancınık | Üç dairesel burç, geniş kabuk kubbe, kemerli giriş; yuvarlak salonlar ve su hazneleri |
| Filiz Meclisi | Yaprak kapüşon, ince gövde, yaprak pelerin ve kalkan | Boynuzlu binek; dallı yay ve iri tohum fırlatıcı | Kök payandalı canlı gövde ve geniş yaprak taç; açık köşkler, örgülü gözcü dalları |
| Köz Ocakları | Geniş plaka zırh, düz siperlik, ağır çekiç ve kule kalkanı | İki tekerli savaş arabası; zırhlı basınç topu | Basamaklı dökümhane, farklı yükseklikte bacalar; testere dişli havalandırma ve top namlulu kule |
| Pus Kervanları | Yüz örtüsü, çapraz kuşak, çift kıvrık bıçak ve şeritler | Yelkenli kum kızağı; üç ayaklı havan | Kızak raylarına oturan iki ayrı çadır, gergi direkleri, sarkıt fenerler; örtülü bahçeler |
| Yel Sancağı | Kanatlı miğfer, çift etek, uzun sancak ve mızrak | Sarkan kuyruk sancağı olan binek; açık yaylı balista | Ayaklar üzerinde açık kule, iki büyük rüzgâr yelkeni ve dört kanatlı çark; açık A çerçeveli salonlar |
| Prizma Divanı | Kristal gövde ve omuzluk, çatallı odaklar, halkalar | Köşeli kristal binek; üç dikit arasında asılı mercek | Çapraz ayna kaidesi üzerinde yüzen kristal, üç dikit ve iki eksenli halka; asılı çokyüzlü çatılar |

Hasatlık ve Gözcü Kulesi her taraf için ayrıca modellenir. Üretim binalarındaki kalkan rafı, hedef tahtası, çit, işlik donanımı ve ocak, işlevi de okumayı sağlar. Filiz ile Yel’in merkezleri ve salonları farklı taşıyıcı sistemler kullanır; Sedef ile Yel’in asker başlıkları da farklıdır.

## On sekiz kahraman

Her satır, oyun kataloğundaki ayrı bir kimliktir. Aynı tarafın üç kahramanı aynı modelin renk varyantı değildir. Oranlar, silahlar ve büyük donanımlar düşük kalite dahil bütün kalite seçeneklerinde korunur.

| Taraf | Kahraman | Ayırt edici donanım ve duruş |
| --- | --- | --- |
| Sedef | Seyra Köpükiz | Geniş gövde, iri kabuk kalkanı ve yelpaze miğfer; üç çatallı kargı |
| Sedef | Tavren Kıyıbek | Uzun gövde, arkasında iki yüksek sancak; tepeli miğfer ve kılıç |
| Sedef | İlven Denizkor | İnce uzun cüppe, baş halkası ve inci omuzluk; dalga çatallı menzilli asa |
| Filiz | Neris Yaprakiz | Uzun yay, yaprak kapüşon, ok sadağı ve iki yapraklı pelerin |
| Filiz | Ovara Çiydil | Büyük dallı boynuzlar, kök omuzluk ve dal biçimli yakın dövüş bıçağı |
| Filiz | Kelmor Kökusta | Geniş cüppe, yaprak yakalık, iki tohum feneri ve tohum kafesli asa |
| Köz | Davra Kordamar | Alçak ve geniş zırh, iki egzoz, önlük ve büyük iki elli çekiç |
| Köz | Beyren Tavusta | İri plaka kalkanı, örs başlığı, yüksek ocak sancağı ve kısa tokmak |
| Köz | Ulsan Cürufiz | Gözlük, basınç tankı ve ileri uzanan büyük top kolluğu |
| Pus | Zevra Tüliz | İnce gövde, iki uzun şerit, iki atış diski ve fırlatma iğneleri |
| Pus | Masren Yolses | Sarıklı başlık, yüksek kervan sancağı ve sarkıt fenerler; kıvrık kılıç |
| Pus | Pirva Sisörgü | Hilal kenarlı başlık, cüppe, tül kuyruğu ve kitap; küre kafesli asa |
| Yel | Azyel Ufukiz | Binek üzerinde, kanatlı miğfer ve uzun sancaklı mızrak |
| Yel | Tirsa Esintiyol | Arbalet, gözlük ve arkada yatay kanatlı rüzgâr göstergesi |
| Yel | Veyran Sancakçı | Uzun gövde, yüksek yel sancağı ve iki ayrı yakın dövüş kılıcı |
| Prizma | Avelis Işıkiz | Zeminden yükselen duruş, ayak halkası, üçlü baş halkası ve iki yörünge küresi |
| Prizma | Ruvna Eksenbil | En ince uzun gövde, arkada iki farklı boyda rezonatör; uzun çift çatallı asa |
| Prizma | Solven Yankıses | Geniş kristal omuzluk, üç parçalı taç ve büyük halka mercekli asa |

Kahraman oluşturulurken katalog menzili de okunur. Menzili 18’den büyük olan kahramanlarda menzilli donanım doğrulanır. Örneğin İlven’in gerçek menzili 39’dur; kalkan ve mızrak yerine dalga asası taşır. Model, asker çizicisinin genel bir kahraman dalıyla değiştirilmez; gerçek `soldier()` metodu doğrudan bu kimliğin parçalarını işler.

## Çizim ve yük yönetimi

Figür parçaları ortak geometri türlerine göre `InstancedMesh` kümelerine girer. Dönüşler model başına bir kez hazırlanır; silahların ve gövdenin dönüşleri birlikte uygulanır. Kümeler, altı oyuncunun tam nüfusunu, kahramanları ve aynı anda yapılabilen çağrıları karşılayacak şekilde bir kez boyutlanır. Yalnız kullanılan örnekler çizilir. Yapı parçaları katalog kimliği başına tepe renkleri olan tek geometride birleştirilir; aynı yapı türünün yeni örneği bu geometriyi paylaşır. İnşaat iskelesi ayrı görünürlük kontrolünü korur.

Can çubukları modelin gerçek üst sınırından yukarı yerleştirilir; uzun sancaklar, bacalar veya atlı kahramanların içinde kaybolmaz. Kahraman seçim yüksekliği de model sınırına uyar. Sis shader’ı ortak figür ve yapı malzemelerinde çalışmayı sürdürür. Seçim/aura halkaları, mini harita, sesler, görsel efekt havuzu ve kaliteye göre figür sayısı korunmuştur.

## İnceleme ve kanıt

Teslim kökünü servis edip `verification/model-browser.html` adresini açınca gerçek Three.js çizicisiyle taraf, kahraman/tabur/yapı, bakış yönü ve kalite seçilebilir. Bu sayfa kayıt yazmaz. Gerçek tarayıcı/GPU sonucu ancak sayfa o cihazda çalıştırılınca oluşur.

`verification/hero-models.png`, `hero-silhouettes.png`, `troop-models.png`, `faction-models.png` ve `building-models.png`, **oyundaki aynı üçgenlerin CPU projeksiyonlarıdır; GPU ekran görüntüsü değildir**. Her paftada kamera ve ölçek bütün modeller için aynıdır. Renksiz pafta, kahraman ayrımının renge dayanmadığını görsel olarak incelemeyi sağlar. Yeniden üretmek için:

```sh
node deliverable/verification/export-visuals.mjs > deliverable/verification/visuals.json
python3 deliverable/verification/render-visuals.py
node --experimental-vm-modules deliverable/verification/visual-regression.mjs
```

29 görsel regresyon denetimi; bütün katalog modellerinin geçerliliğini, gerçek çizicinin model seçimini, dönüşlerini, menzilli donanımı, birleştirilmiş yapıları, can çubuğunu ve her rolde tam 3’e 3 ordu kapasitesini sınar. Her tarafın üç kahramanı ön, çapraz ve arka yönden renksiz olarak karşılaştırılır. En benzer çiftin dolu piksel kesişim/birleşim oranı yaklaşık 0,78’dir; birebir aynı siluet 1 olurdu. Bu ölçüm gerçek cihazda okunabilirlik veya kare hızı garantisi olarak sunulmaz. VM’de tarayıcı ve GPU yoktur.

Saflar artık simülasyonun `getBattalionLayout` sorgusundan gelir; figürler kayıtlı yöne ve cana uyar. Ana döngü bağlantısı ve yerel figür aralığı ölçekleri [ISTEMCI_SES_VE_SAFLAR.md](ISTEMCI_SES_VE_SAFLAR.md) içinde açıklanmıştır.
