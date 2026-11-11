# Gölge Kuşatması — nihai oyun tasarımı

Sürüm 1.2 · Türkçe. Bu belge, tarayıcıdaki üç boyutlu strateji oyununun içeriğini, kurallarını, kullanıcı akışını ve bağımsız simülasyon API’sini birlikte tanımlar. Statik HTML/Three.js istemcisi ile Node üzerinde doğrulanan oyun çekirdeği aynı içerik kataloğunu kullanır. Tasarım, bir çalışma biriminin eksik dosya listesi olarak okunmamalıdır.

## 1. Vizyon ve temel döngü

Oyuncu öz toplar, bir merkez çevresinde üs kurar, taburları sıraya koyar, karşı birlikleri seçer, kahraman çağırır, karakolları tutar ve rakip merkezleri kuşatır. Her tabur bir simülasyon varlığıdır; `soldiers` görsel diziliş sayısıdır. Can azalması tabur hasarını azaltmaz. Özgün altı taraf farklı hareket, menzil, dayanıklılık, liderlik ve ikmal tercihlerine sahiptir.

Gerçek zamanlı kurallar 0,5 saniyelik sabit adımla işler. Dokuz düzen: 1v1, 1v2, 1v3, 2v1, 2v2, 2v3, 3v1, 3v2, 3v3. Yuvalar önce takım 0, sonra takım 1 sırasındadır. İnsan ve müttefik yapay zekâ ortak görüş kullanır. Rakibin bütün merkezleri yıkılınca takım kazanır; tek müttefik merkezinin düşmesi yenilgi değildir. Merkezini kaybeden oyuncu yeni komut veremez; mevcut ordusu önceki emirlerini, mevcut üretim kuyruğu üretimini sürdürebilir.

## 2. Prototipten değişiklikler ve gerekçeler

Altı taraf, taburlar, üçlü karşıtlık, seviye, kahraman çağırma, geliştirme ocağı, güçler, karakollar, kamplar ve dokuz takım düzeni korunur. Tüm içerik adları özgünleştirilir. Kadrolar kuşatma ve uzmanla, kahramanlar iki seviyeli yetenekle genişler. Dört harita, üç farklı sefer amacı, görüş sisi ve tam kayıt dönüşümü eklenir.

Prototipteki yedi kahraman aurası korunacak bir oyun özelliğidir. Yeni sürüm bunları kaldırmak yerine her kahramana bir tane olmak üzere 18 özgün ve yerel liderlik aurasına genişletir: iyileştirme, hasar, zırh, süvari hızı, menzil, görüş ve yetenek temposu. Etkileri menzil, rol ve canlı lider koşuluna bağlıdır; lider uzaklaşınca veya ölünce biter. Kadro tabloları kapsamı ve sayıları gösterir.

İlk çekirdekteki ortak birim/hero/güç şablonları nihai asimetriyi yeterince taşımıyordu. Bu sürümde her tarafın beş taburu ayrı sayılarla yazılmıştır; örneğin uzun menzilli hafif Filiz yaycıları, zırhlı kısa menzilli Köz atıcıları ve hızlı Yel süvarileri farklı cepheler ister. Kahraman canı, saldırı menzili, hızı ve yetenek kitleri taraflar arasında değişir. Ortak kurallar yalnız karşıtlık gibi öğrenilebilir temelleri korur. Güçlerin taraflara özel yan etkileri, farklı çağrı kadroları, merkez/kule profilleri ve araştırma katsayıları oyuna gerçek tercih getirir.

Kurallar çizimden ayrılır; tek rastlantı akışı ve sabit adım, aynı maçın tekrar üretimini sağlar. Sert engel ve duvar yerine yavaşlatıcı arazi vardır; yapılar hareketi kapatmaz. Bu sade hareket tabur seçimini ve telefonda takibi kolaylaştırır. Çizim, ses, kamera ve seçim yerel istemci sorumlulukları; hasar, görüş, komut kabulü ve görev sonucu ortak simülasyon sorumluluklarıdır.

Ses özelliği prototipten sade bip dizisine indirgenmez. Yeni, özgün La minör tema 76 BPM’de akor pedleri, hafif detune, alçak geçiren filtre, melodi, bas ve 0,337 saniyelik süzülmüş geri beslemeli yankı kullanır. Çatışmada çift vuruşlu kalp ritmi katılır. Altı tarafın darbe/nida tınısı, süvari yürüyüş sesleri, bant geçiren gürültü darbeleri ve kameraya göre uzaklık/kaydırma korunur ve genişletilir. Sentezlenmiş nidalar kelime veya ses kaydı içermez; müzik ve efektler özgündür. Kullanıcı hareketinde bağlamı ve satır içi sessiz medya öğesini birlikte açma, mobil sessiz anahtar uyumluluğu için kullanılır. Ses/müzik ayrı denetlenir; polifoni sınırı ve kompresör kalabalık savaşta taşmayı önler.

Taburların aynı hedef noktasında birleşmesi yerine grup emirleri rol öncelikli, 16 birim aralıklı ve en çok dört sütunlu saflara ayrılır. Piyade önde, kuşatma arkada kalır; hedef yönü dizilişi döndürür. Her sabit adımda üç ayırma geçişi dost tabur merkezlerini 14, düşmanları 8 birim uzak tutmaya çalışır. Tam çakışma da tohum tüketmeden çözülür, sersemletilmişler itilmez ve harita sınırları korunur. Kalabalık geçişte bu yumuşak ayırmadır, sert duvar veya yol bulma eklemez. Her tabur için ayrı asker dizilişi sorgusu piyade safları, menzilli kademeleri, süvari kaması ve uzman halkasını üretir.

## 3. Eski adlardan özgün adlara dönüşüm

Aşağıdaki eski adlar yalnızca kaynak prototip ile eşleme içindir; oyun kataloğunda ve çalıştırılan simülasyon dosyalarında kullanılmaz. Kaynak dosya değiştirilmemiştir. Prototipin yetenek adları da izlenebilirlik için eşlenmiştir.

| Prototip adı | Yeni özgün ad | Tür |
| --- | --- | --- |
| Batı İnsanları | Sedef Birliği | Taraf |
| Gondor Askeri | Kıyı Kargıcıları | Tabur |
| Gondor Okçusu | İnci Yaycıları | Tabur |
| Rohirrim | Dalga Süvarileri | Tabur |
| Gandalf | Seyra Köpükiz | Kahraman |
| Beyaz Işık | Köpük Halkası | Yetenek |
| Aragorn | Tavren Kıyıbek | Kahraman |
| Ölüler Ordusu | Dalgakıran | Yetenek |
| Theoden | İlven Denizkor | Kahraman |
| Rohirrim Hücumu | Tuz Merhemi | Yetenek |
| Elfler | Filiz Meclisi | Taraf |
| Elf Kılıççısı | Kök Nöbetçileri | Tabur |
| Elf Okçusu | Çiy Atıcıları | Tabur |
| Elf Atlısı | Ceylan Akıncıları | Tabur |
| Legolas | Neris Yaprakiz | Kahraman |
| Ok Yağmuru | Çiy Çemberi | Yetenek |
| Thranduil | Ovara Çiydil | Kahraman |
| Kralın Öfkesi | Tohum Nöbeti | Yetenek |
| Elrond | Kelmor Kökusta | Kahraman |
| Vilya | Özsu Akışı | Yetenek |
| Cüceler | Köz Ocakları | Taraf |
| Cüce Muhafızı | Cüruf Bekçileri | Tabur |
| Balta Fırlatıcı | Kıvılcım Atıcıları | Tabur |
| Savaş Arabası | Kor Tekerleri | Tabur |
| Gimli | Davra Kordamar | Kahraman |
| Balta Fırtınası | Kor Patlaması | Yetenek |
| Dain Demirayak | Beyren Tavusta | Kahraman |
| Demir Ayak | Ocak Sarsımı | Yetenek |
| Gloin | Ulsan Cürufiz | Kahraman |
| Yıkıcı Darbe | Kül Merhemi | Yetenek |
| Goblinler | Pus Kervanları | Taraf |
| Goblin Savaşçısı | Sis Bıçakları | Tabur |
| Goblin Okçusu | Tül Nişancıları | Tabur |
| Örümcek Binicisi | Kum Kayacıları | Tabur |
| Gorkil | Zevra Tüliz | Kahraman |
| Zehirli Diş | Sis Zehri | Yetenek |
| Shelob | Masren Yolses | Kahraman |
| Dehşet | Yol Çağrısı | Yetenek |
| Rogash | Pirva Sisörgü | Kahraman |
| Ezip Geç | Gece Merhemi | Yetenek |
| Isengard | Yel Sancağı | Taraf |
| Uruk-hai | Mızrak Çemberi | Tabur |
| Uruk Okçusu | Islık Yaycıları | Tabur |
| Varg Binicisi | Fırtına Binicileri | Tabur |
| Saruman | Azyel Ufukiz | Kahraman |
| Karanlık Söz | Bora Çarpması | Yetenek |
| Lurtz | Tirsa Esintiyol | Kahraman |
| Sakatlayıcı Ok | Ufuk Birliği | Yetenek |
| Sharku | Veyran Sancakçı | Kahraman |
| Varg Sürüsü | Yel Merhemi | Yetenek |
| Mordor | Prizma Divanı | Taraf |
| Ork Sürüsü | Kristal Safları | Tabur |
| Haradrim Okçusu | Işın Örücüleri | Tabur |
| Haradrim Atlısı | Yansı Atlıları | Tabur |
| Cadı Kral | Avelis Işıkiz | Kahraman |
| Angmar Dehşeti | Eksen Patlaması | Yetenek |
| Gothmog | Ruvna Eksenbil | Kahraman |
| Ork Komutası | Çınlama Kilidi | Yetenek |
| Nazgûl | Solven Yankıses | Kahraman |
| Kara Nefes | Işık Onarımı | Yetenek |

## 4. Taraflar ve eksiksiz kadrolar

Para birimi **öz**, güç kaynağı **uyum**. Tablo değerleri seviye 1, araştırmasız tabandır; hasar vuruş başınadır, saldırı aralığı 1,5 saniyedir. İlk vuruş beklemesi tohumlu 0–1 saniyedir. Kalıcı tabur ve kahraman birer nüfus yuvası kullanır; kuyruklar da yer ayırır. Süreli çağrılar yuva kullanmaz. Aura aynı istatistikte üst üste çarpılmaz; en güçlü oran uygulanır. Kahraman kendi aurasını almaz; bina ve kızak aura almaz.

### Sedef Birliği (`sedef`)

Dost yapıların çevresinde dayanıklı savunma ve dengeli taburlar. **Yuva Disiplini:** Kendi yapısına 65 birimden yakın tabur ve kahraman gelen hasarın 0,86 katını alır. Uzman vuruşunda kendine 2 saniye 0,55 koruma uygular. Nüfus: 18.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kıyı Kargıcıları | sedef_infantry | Piyade | 130 | 520 | 30 | 7 | 12 | 14 | 8 |
| İnci Yaycıları | sedef_ranged | Menzilli | 130 | 360 | 27 | 43 | 12 | 14 | 8 |
| Dalga Süvarileri | sedef_cavalry | Süvari | 150 | 500 | 31 | 8 | 21 | 17 | 6 |
| Gelgit Mancınığı | sedef_siege | Kuşatma | 240 | 450 | 43 | 57 | 8 | 23 | 3 |
| Kalkan Şarkıcıları | sedef_special | Uzman | 190 | 560 | 32 | 23 | 13 | 20 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Seyra Köpükiz | sedef_hero_0 | 420 | 850 | 40 | 9 | 16 | 115 |
| Tavren Kıyıbek | sedef_hero_1 | 470 | 1050 | 34 | 9 | 14 | 115 |
| İlven Denizkor | sedef_hero_2 | 480 | 760 | 30 | 39 | 16 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Seyra Köpükiz | Kıyı Soluğu | sedef_aura_0 | Can yenileme oranı/sn | 0.005 | 52 | Tüm savaşçılar |
| Tavren Kıyıbek | Saf Uyumu | sedef_aura_1 | Hasar | 1.08 | 48 | Tüm savaşçılar |
| İlven Denizkor | Kabuk Düzeni | sedef_aura_2 | Gelen hasar | 0.94 | 50 | Tüm savaşçılar |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Seyra Köpükiz | Köpük Halkası | sedef_ability_0_0 | Alan hasarı | 1 | 26 | 82 | 42 | 7 | 145 hasar; bina ×0,4 |
| Seyra Köpükiz | Siper Ezgisi | sedef_ability_0_1 | Koruma | 3 | 26 | 82 | 42 | 7 | gelen hasar ×0.55 |
| Tavren Kıyıbek | Dalgakıran | sedef_ability_1_0 | Teşvik | 1 | 28 | 82 | 45 | 8 | hasar ×1.3, hız ×1.15 |
| Tavren Kıyıbek | Ufuk Çağrısı | sedef_ability_1_1 | Çağırma | 3 | 28 | 82 | 45 | 8 | Piyade, Piyade |
| İlven Denizkor | Tuz Merhemi | sedef_ability_2_0 | İyileştirme | 1 | 30 | 82 | 48 | 9 | 210 can |
| İlven Denizkor | Akıntı Mührü | sedef_ability_2_1 | Sersemletme | 3 | 30 | 82 | 48 | 9 | Hareket ve saldırı durur |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Kabuk Siperi | sedef_power_0 | 25 | 64 | 54 | 12 | 12 saniye gelen hasar ×0.6; dost yapılar 160 can onarılır. |
| Sahil Bereketi | sedef_power_1 | 20 | 66 | 54 | 12 | 160 öz; karakol başına 70 ek öz. |
| Derinlik Darbesi | sedef_power_2 | 40 | 68 | 54 | 12 | 200 alan hasarı; bina çarpanı 0.4; savaşçıları 22 birim iter. |
| Gelgit Çağrısı | sedef_power_3 | 35 | 70 | 54 | 14 | piyade, menzilli; 14 saniye kalır. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sedef Merkez | sedef_keep | Merkez | 0 | 6500 | 0 | 0 | 24 | 58 |
| Sedef Hasatlığı | sedef_field | Ekonomi | 100 | 850 | 12 | 2.5 | 0 | 0 |
| Sedef Saf Ocağı | sedef_barracks | Üretim | 150 | 1200 | 16 | 0 | 0 | 0 |
| Sedef Atış Meydanı | sedef_range | Üretim | 150 | 1000 | 16 | 0 | 0 | 0 |
| Sedef Binek Avlusu | sedef_stable | Üretim | 180 | 1200 | 18 | 0 | 0 | 0 |
| Sedef Kuşatma İşliği | sedef_workshop | Üretim | 220 | 1100 | 20 | 0 | 0 | 0 |
| Sedef Gelişim Evi | sedef_forge | Araştırma | 170 | 1000 | 18 | 0 | 0 | 0 |
| Sedef Gözcü Kulesi | sedef_tower | Savunma | 180 | 1500 | 17 | 0 | 35 | 65 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Sedef Keskinlik | sedef_edge | Hasar | 1.2 | 220 | 30 |
| Sedef Katman | sedef_plate | Can | 1.22 | 220 | 30 |
| Sedef Akış | sedef_logistics | Gelir | 1.25 | 220 | 30 |
| Sedef Adım | sedef_stride | Hız | 1.12 | 220 | 30 |

### Filiz Meclisi (`filiz`)

Savaştan uzak taburlar kendini onarır; özel birlikler zehir salar. **Canlı Doku:** Son darbeden 8 saniye sonra tabur ve kahraman saniyede azami canının %0,6’sını yeniler. Uzman vuruşu 4 saniye saniyede 6 zehir hasarı ekler. Nüfus: 18.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kök Nöbetçileri | filiz_infantry | Piyade | 130 | 500 | 29 | 7 | 13 | 14 | 8 |
| Çiy Atıcıları | filiz_ranged | Menzilli | 145 | 310 | 25 | 55 | 16 | 14 | 8 |
| Ceylan Akıncıları | filiz_cavalry | Süvari | 160 | 450 | 31 | 8 | 24 | 17 | 6 |
| Diken Fırlatacı | filiz_siege | Kuşatma | 240 | 400 | 43 | 60 | 9 | 23 | 3 |
| Sarmaşık Dokuyucuları | filiz_special | Uzman | 190 | 490 | 27 | 32 | 14 | 20 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Neris Yaprakiz | filiz_hero_0 | 430 | 740 | 32 | 44 | 18 | 115 |
| Ovara Çiydil | filiz_hero_1 | 450 | 810 | 35 | 12 | 19 | 115 |
| Kelmor Kökusta | filiz_hero_2 | 490 | 900 | 30 | 36 | 15 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Neris Yaprakiz | Özsu Nefesi | filiz_aura_0 | Can yenileme oranı/sn | 0.008 | 52 | Tüm savaşçılar |
| Ovara Çiydil | Çiy Gözü | filiz_aura_1 | Menzil | 1.1 | 50 | Menzilli |
| Kelmor Kökusta | Kök Adımı | filiz_aura_2 | Hız | 1.08 | 50 | Tüm savaşçılar |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Neris Yaprakiz | Çiy Çemberi | filiz_ability_0_0 | İyileştirme | 1 | 27 | 85 | 44 | 7 | 220 can |
| Neris Yaprakiz | Diken Örgüsü | filiz_ability_0_1 | Zehir | 3 | 27 | 85 | 44 | 7 | 17 hasar/sn |
| Ovara Çiydil | Tohum Nöbeti | filiz_ability_1_0 | Çağırma | 1 | 29 | 85 | 47 | 8 | Piyade, Piyade |
| Ovara Çiydil | Kök Düğümü | filiz_ability_1_1 | Sersemletme | 3 | 29 | 85 | 47 | 8 | Hareket ve saldırı durur |
| Kelmor Kökusta | Özsu Akışı | filiz_ability_2_0 | Koruma | 1 | 31 | 85 | 50 | 9 | gelen hasar ×0.575 |
| Kelmor Kökusta | Yaprak Coşkusu | filiz_ability_2_1 | Teşvik | 3 | 31 | 85 | 50 | 9 | hasar ×1.32, hız ×1.17 |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Yeşil Soluk | filiz_power_0 | 27 | 67 | 56 | 14 | 14 saniye gelen hasar ×0.8; saniyede 14 can. |
| Tomurcuk Hasadı | filiz_power_1 | 22 | 69 | 56 | 25 | 140 öz; 25 saniye gelir ×1.2. |
| Diken Sağanağı | filiz_power_2 | 42 | 71 | 56 | 12 | 160 alan hasarı; bina çarpanı 0.4; 7 saniye saniyede 9 zehir. |
| Kök Yoldaşları | filiz_power_3 | 37 | 73 | 56 | 10 | uzman, uzman; 10 saniye kalır. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Filiz Merkez | filiz_keep | Merkez | 0 | 6000 | 0 | 0 | 22 | 62 |
| Filiz Hasatlığı | filiz_field | Ekonomi | 100 | 850 | 12 | 2.5 | 0 | 0 |
| Filiz Saf Ocağı | filiz_barracks | Üretim | 150 | 1200 | 16 | 0 | 0 | 0 |
| Filiz Atış Meydanı | filiz_range | Üretim | 150 | 1000 | 16 | 0 | 0 | 0 |
| Filiz Binek Avlusu | filiz_stable | Üretim | 180 | 1200 | 18 | 0 | 0 | 0 |
| Filiz Kuşatma İşliği | filiz_workshop | Üretim | 220 | 1100 | 20 | 0 | 0 | 0 |
| Filiz Gelişim Evi | filiz_forge | Araştırma | 170 | 1000 | 18 | 0 | 0 | 0 |
| Filiz Gözcü Kulesi | filiz_tower | Savunma | 180 | 1500 | 17 | 0 | 30 | 72 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Filiz Keskinlik | filiz_edge | Hasar | 1.18 | 220 | 30 |
| Filiz Katman | filiz_plate | Can | 1.16 | 220 | 30 |
| Filiz Akış | filiz_logistics | Gelir | 1.24 | 220 | 30 |
| Filiz Adım | filiz_stride | Hız | 1.18 | 220 | 30 |

### Köz Ocakları (`koz`)

Ağır ve yavaş taburlar; özel birlikler yapılara ek hasar verir. **Yoğun Döküm:** Ağır ve yavaş kadro; uzman yapılara normal 0,22 direnci yerine 1,4 çarpanı kullanır. Nüfus: 18.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cüruf Bekçileri | koz_infantry | Piyade | 130 | 624 | 30 | 7 | 11.28 | 14 | 8 |
| Kıvılcım Atıcıları | koz_ranged | Menzilli | 130 | 450 | 29 | 35 | 10 | 14 | 8 |
| Kor Tekerleri | koz_cavalry | Süvari | 150 | 600 | 31 | 8 | 19 | 17 | 6 |
| Basınç Topu | koz_siege | Kuşatma | 275 | 650 | 48 | 63 | 6.7 | 23 | 3 |
| Ocak Kırıcıları | koz_special | Uzman | 190 | 720 | 36 | 16 | 10 | 20 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Davra Kordamar | koz_hero_0 | 450 | 1150 | 48 | 8 | 12 | 115 |
| Beyren Tavusta | koz_hero_1 | 480 | 1250 | 38 | 8 | 11 | 115 |
| Ulsan Cürufiz | koz_hero_2 | 500 | 1000 | 42 | 26 | 12 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Davra Kordamar | Ocak Çeperi | koz_aura_0 | Gelen hasar | 0.92 | 42 | Tüm savaşçılar |
| Beyren Tavusta | Tav Ritmi | koz_aura_1 | Hasar | 1.1 | 42 | Tüm savaşçılar |
| Ulsan Cürufiz | İşlik Ufku | koz_aura_2 | Menzil | 1.1 | 48 | Kuşatma |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Davra Kordamar | Kor Patlaması | koz_ability_0_0 | Alan hasarı | 1 | 28 | 88 | 46 | 7 | 161 hasar; bina ×0,4 |
| Davra Kordamar | Tav Zırhı | koz_ability_0_1 | Koruma | 3 | 28 | 88 | 46 | 7 | gelen hasar ×0.6 |
| Beyren Tavusta | Ocak Sarsımı | koz_ability_1_0 | Sersemletme | 1 | 30 | 88 | 49 | 8 | Hareket ve saldırı durur |
| Beyren Tavusta | İşlik Çağrısı | koz_ability_1_1 | Teşvik | 3 | 30 | 88 | 49 | 8 | hasar ×1.34, hız ×1.19 |
| Ulsan Cürufiz | Kül Merhemi | koz_ability_2_0 | İyileştirme | 1 | 32 | 88 | 52 | 9 | 230 can |
| Ulsan Cürufiz | Çekiç Ritmi | koz_ability_2_1 | Alan hasarı | 3 | 32 | 88 | 52 | 9 | 185 hasar; bina ×0,4 |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Cüruf Kubbesi | koz_power_0 | 29 | 70 | 58 | 12 | yalnız dost binalar; 12 saniye gelen hasar ×0.65; dost yapılar 300 can onarılır. |
| Ocak Payı | koz_power_1 | 24 | 72 | 58 | 22 | 140 öz; 22 saniye eğitim hızı ×1.4. |
| Kızgın Yarık | koz_power_2 | 44 | 74 | 58 | 12 | 210 alan hasarı; bina çarpanı 1.5. |
| Kor Muhafızları | koz_power_3 | 39 | 76 | 58 | 16 | kuşatma; 16 saniye kalır; gelen hasar ×0.7. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Köz Merkez | koz_keep | Merkez | 0 | 7600 | 2 | 0 | 26 | 55 |
| Köz Hasatlığı | koz_field | Ekonomi | 100 | 1050 | 14 | 2.5 | 0 | 0 |
| Köz Saf Ocağı | koz_barracks | Üretim | 150 | 1400 | 18 | 0 | 0 | 0 |
| Köz Atış Meydanı | koz_range | Üretim | 150 | 1200 | 18 | 0 | 0 | 0 |
| Köz Binek Avlusu | koz_stable | Üretim | 180 | 1400 | 20 | 0 | 0 | 0 |
| Köz Kuşatma İşliği | koz_workshop | Üretim | 220 | 1300 | 22 | 0 | 0 | 0 |
| Köz Gelişim Evi | koz_forge | Araştırma | 170 | 1200 | 20 | 0 | 0 | 0 |
| Köz Gözcü Kulesi | koz_tower | Savunma | 180 | 1700 | 19 | 0 | 38 | 60 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Köz Keskinlik | koz_edge | Hasar | 1.24 | 220 | 30 |
| Köz Katman | koz_plate | Can | 1.25 | 220 | 30 |
| Köz Akış | koz_logistics | Gelir | 1.2 | 220 | 30 |
| Köz Adım | koz_stride | Hız | 1.08 | 220 | 30 |

### Pus Kervanları (`pus`)

Ucuz ve çabuk yetişen taburlar, daha geniş nüfus; zehirli uzmanlar. **Kalabalık Düzen:** Ucuz ve kısa eğitimli kadro, 20 nüfus; uzman vuruşu 4 saniye saniyede 6 zehir ekler. Nüfus: 20.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sis Bıçakları | pus_infantry | Piyade | 120 | 468 | 30 | 7 | 13 | 13.3 | 8 |
| Tül Nişancıları | pus_ranged | Menzilli | 120 | 324 | 24 | 39 | 14 | 13.3 | 8 |
| Kum Kayacıları | pus_cavalry | Süvari | 138 | 450 | 29 | 8 | 23 | 16.15 | 6 |
| Duman Havani | pus_siege | Kuşatma | 221 | 405 | 40 | 53 | 8 | 21.85 | 3 |
| Gölge İğnecileri | pus_special | Uzman | 175 | 504 | 29 | 23 | 15 | 19 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Zevra Tüliz | pus_hero_0 | 380 | 680 | 34 | 27 | 20 | 115 |
| Masren Yolses | pus_hero_1 | 430 | 780 | 40 | 9 | 21 | 115 |
| Pirva Sisörgü | pus_hero_2 | 470 | 740 | 31 | 40 | 18 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Zevra Tüliz | Kervan Yürüyüşü | pus_aura_0 | Hız | 1.1 | 45 | Tüm savaşçılar |
| Masren Yolses | Tül Cesareti | pus_aura_1 | Hasar | 1.08 | 45 | Piyade |
| Pirva Sisörgü | Sis Gözü | pus_aura_2 | Görüş | 1.12 | 50 | Tüm savaşçılar |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Zevra Tüliz | Sis Zehri | pus_ability_0_0 | Zehir | 1 | 29 | 91 | 48 | 7 | 19 hasar/sn |
| Zevra Tüliz | Tül Siperi | pus_ability_0_1 | Koruma | 3 | 29 | 91 | 48 | 7 | gelen hasar ×0.625 |
| Masren Yolses | Yol Çağrısı | pus_ability_1_0 | Çağırma | 1 | 31 | 91 | 51 | 8 | Piyade, Piyade |
| Masren Yolses | Serap Darbesi | pus_ability_1_1 | Alan hasarı | 3 | 31 | 91 | 51 | 8 | 181 hasar; bina ×0,4 |
| Pirva Sisörgü | Gece Merhemi | pus_ability_2_0 | İyileştirme | 1 | 33 | 91 | 54 | 9 | 240 can |
| Pirva Sisörgü | Kervan İvmesi | pus_ability_2_1 | Teşvik | 3 | 33 | 91 | 54 | 9 | hasar ×1.36, hız ×1.21 |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Sis Örtüsü | pus_power_0 | 25 | 73 | 60 | 12 | 12 saniye gelen hasar ×0.85; hız ×1.4. |
| Kervan Kazancı | pus_power_1 | 20 | 75 | 60 | 25 | 140 öz; 25 saniye öldürme başına 45 öz. |
| Serap Kırılması | pus_power_2 | 40 | 77 | 60 | 12 | 135 alan hasarı; bina çarpanı 0.4; 6 saniye saniyede 12 zehir. |
| Tül Birliği | pus_power_3 | 35 | 79 | 60 | 13 | piyade, piyade, piyade; 13 saniye kalır; can ×0.7. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pus Merkez | pus_keep | Merkez | 0 | 5800 | 0 | 0 | 21 | 60 |
| Pus Hasatlığı | pus_field | Ekonomi | 100 | 850 | 10 | 2.5 | 0 | 0 |
| Pus Saf Ocağı | pus_barracks | Üretim | 150 | 1200 | 14 | 0 | 0 | 0 |
| Pus Atış Meydanı | pus_range | Üretim | 150 | 1000 | 14 | 0 | 0 | 0 |
| Pus Binek Avlusu | pus_stable | Üretim | 180 | 1200 | 16 | 0 | 0 | 0 |
| Pus Kuşatma İşliği | pus_workshop | Üretim | 220 | 1100 | 18 | 0 | 0 | 0 |
| Pus Gelişim Evi | pus_forge | Araştırma | 170 | 1000 | 16 | 0 | 0 | 0 |
| Pus Gözcü Kulesi | pus_tower | Savunma | 180 | 1500 | 15 | 0 | 28 | 68 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Pus Keskinlik | pus_edge | Hasar | 1.17 | 220 | 30 |
| Pus Katman | pus_plate | Can | 1.17 | 220 | 30 |
| Pus Akış | pus_logistics | Gelir | 1.3 | 220 | 30 |
| Pus Adım | pus_stride | Hız | 1.16 | 220 | 30 |

### Yel Sancağı (`yel`)

Hızlı süvarinin ilk darbesi güçlüdür; uzmanlar düşmanı yavaşlatır. **İlk Atılım:** Süvarinin ilk vuruşu ve son saldırısından 5 saniyeden fazla sonra gelen vuruşu 1,6 hasar çarpanı alır. Uzman her vuruşta 1 saniye sersemletir. Nüfus: 18.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mızrak Çemberi | yel_infantry | Piyade | 130 | 500 | 31 | 7 | 14 | 14 | 8 |
| Islık Yaycıları | yel_ranged | Menzilli | 130 | 340 | 25 | 40 | 15 | 14 | 8 |
| Fırtına Binicileri | yel_cavalry | Süvari | 160 | 540 | 33 | 8 | 25 | 17 | 6 |
| Rüzgâr Balistası | yel_siege | Kuşatma | 240 | 420 | 41 | 59 | 10 | 23 | 3 |
| Savrul Bekçileri | yel_special | Uzman | 190 | 520 | 30 | 19 | 17 | 20 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Azyel Ufukiz | yel_hero_0 | 440 | 820 | 42 | 9 | 23 | 115 |
| Tirsa Esintiyol | yel_hero_1 | 460 | 880 | 38 | 36 | 20 | 115 |
| Veyran Sancakçı | yel_hero_2 | 480 | 900 | 36 | 9 | 22 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Azyel Ufukiz | Binek Rüzgârı | yel_aura_0 | Hız | 1.12 | 65 | Süvari |
| Tirsa Esintiyol | Sancak Andı | yel_aura_1 | Hasar | 1.1 | 60 | Süvari |
| Veyran Sancakçı | Ufuk Soluğu | yel_aura_2 | Can yenileme oranı/sn | 0.005 | 50 | Tüm savaşçılar |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Azyel Ufukiz | Bora Çarpması | yel_ability_0_0 | Alan hasarı | 1 | 30 | 94 | 50 | 7 | 177 hasar; bina ×0,4 |
| Azyel Ufukiz | Esinti Ritmi | yel_ability_0_1 | Teşvik | 3 | 30 | 94 | 50 | 7 | hasar ×1.38, hız ×1.23 |
| Tirsa Esintiyol | Ufuk Birliği | yel_ability_1_0 | Çağırma | 1 | 32 | 94 | 53 | 8 | Piyade, Piyade |
| Tirsa Esintiyol | Hava Kilidi | yel_ability_1_1 | Sersemletme | 3 | 32 | 94 | 53 | 8 | Hareket ve saldırı durur |
| Veyran Sancakçı | Yel Merhemi | yel_ability_2_0 | İyileştirme | 1 | 34 | 94 | 56 | 9 | 250 can |
| Veyran Sancakçı | Sancak Siperi | yel_ability_2_1 | Koruma | 3 | 34 | 94 | 56 | 9 | gelen hasar ×0.65 |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Bora Siperi | yel_power_0 | 27 | 76 | 62 | 12 | yalnız süvari; 12 saniye gelen hasar ×0.8; hız ×1.4; hasar ×1.25. |
| Ufuk Vergisi | yel_power_1 | 22 | 78 | 62 | 25 | 140 öz; 25 saniye verilen hasarın %4.5 kadarı öz. |
| Gök Yarılması | yel_power_2 | 42 | 80 | 62 | 12 | 180 alan hasarı; bina çarpanı 0.4; 2 saniye sersemletme. |
| Esinti Akıncıları | yel_power_3 | 37 | 82 | 62 | 9 | süvari, süvari; 9 saniye kalır. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yel Merkez | yel_keep | Merkez | 0 | 6200 | 0 | 0 | 23 | 60 |
| Yel Hasatlığı | yel_field | Ekonomi | 100 | 850 | 12 | 2.5 | 0 | 0 |
| Yel Saf Ocağı | yel_barracks | Üretim | 150 | 1200 | 16 | 0 | 0 | 0 |
| Yel Atış Meydanı | yel_range | Üretim | 150 | 1000 | 16 | 0 | 0 | 0 |
| Yel Binek Avlusu | yel_stable | Üretim | 180 | 1200 | 18 | 0 | 0 | 0 |
| Yel Kuşatma İşliği | yel_workshop | Üretim | 220 | 1100 | 20 | 0 | 0 | 0 |
| Yel Gelişim Evi | yel_forge | Araştırma | 170 | 1000 | 18 | 0 | 0 | 0 |
| Yel Gözcü Kulesi | yel_tower | Savunma | 180 | 1500 | 17 | 0 | 32 | 70 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Yel Keskinlik | yel_edge | Hasar | 1.2 | 220 | 30 |
| Yel Katman | yel_plate | Can | 1.18 | 220 | 30 |
| Yel Akış | yel_logistics | Gelir | 1.22 | 220 | 30 |
| Yel Adım | yel_stride | Hız | 1.22 | 220 | 30 |

### Prizma Divanı (`prizma`)

Yetenekler daha sık kullanılır; uzmanlar kalkan kıran darbeler vurur. **Yankı Çekirdeği:** Kahraman yetenek beklemeleri 0,72 çarpanı alır. Uzman, hedef korumasını kendi vuruş hasarından sonra kaldırır. Nüfus: 18.

| Tabur | id | Rol | Öz | Can | Hasar | Menzil | Hız | Eğitim/sn | Figür |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kristal Safları | prizma_infantry | Piyade | 130 | 445 | 32 | 7 | 12 | 14 | 8 |
| Işın Örücüleri | prizma_ranged | Menzilli | 130 | 300 | 27 | 47 | 11 | 14 | 8 |
| Yansı Atlıları | prizma_cavalry | Süvari | 150 | 450 | 31 | 8 | 20 | 17 | 6 |
| Odak Merceği | prizma_siege | Kuşatma | 260 | 375 | 46 | 61 | 7 | 23 | 3 |
| Yankı Ustaları | prizma_special | Uzman | 190 | 450 | 32 | 30 | 12 | 20 | 5 |

| Kahraman | id | Öz | Can | Hasar | Menzil | Hız | Görüş |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Avelis Işıkiz | prizma_hero_0 | 430 | 710 | 42 | 47 | 15 | 115 |
| Ruvna Eksenbil | prizma_hero_1 | 470 | 820 | 35 | 32 | 16 | 115 |
| Solven Yankıses | prizma_hero_2 | 510 | 780 | 37 | 43 | 14 | 115 |

Kahraman eğitimi 24 saniye. Aura etkileri aşağıdaki gibidir; `heal` değeri azami can oranı/sn, diğerleri çarpandır. Aynı takımın uygun roldeki diğer tabur ve kahramanlarına işler.

| Kahraman | Aura adı | id | İstatistik | Değer | Yarıçap | Rol |
| --- | --- | --- | --- | --- | --- | --- |
| Avelis Işıkiz | Eksen Uyumu | prizma_aura_0 | Yetenek bekleme | 0.9 | 48 | Tüm savaşçılar |
| Ruvna Eksenbil | Kırınım Gözü | prizma_aura_1 | Görüş | 1.15 | 52 | Tüm savaşçılar |
| Solven Yankıses | Yankı Odağı | prizma_aura_2 | Hasar | 1.08 | 50 | Menzilli |

| Kahraman | Yetenek | id | Tür | Seviye | Bekleme/sn | Hedef menzili | Yarıçap | Süre/sn | Etki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Avelis Işıkiz | Eksen Patlaması | prizma_ability_0_0 | Alan hasarı | 1 | 31 | 97 | 52 | 7 | 142 hasar; bina ×0,4 |
| Avelis Işıkiz | Yansı Siperi | prizma_ability_0_1 | Koruma | 3 | 31 | 97 | 52 | 7 | gelen hasar ×0.675 |
| Ruvna Eksenbil | Çınlama Kilidi | prizma_ability_1_0 | Sersemletme | 1 | 33 | 97 | 55 | 8 | Hareket ve saldırı durur |
| Ruvna Eksenbil | Kırınım Çağrısı | prizma_ability_1_1 | Çağırma | 3 | 33 | 97 | 55 | 8 | Piyade, Piyade |
| Solven Yankıses | Işık Onarımı | prizma_ability_2_0 | İyileştirme | 1 | 35 | 97 | 58 | 9 | 260 can |
| Solven Yankıses | Uyum Dalgası | prizma_ability_2_1 | Teşvik | 3 | 35 | 97 | 58 | 9 | hasar ×1.4, hız ×1.25 |

| Güç | id | Uyum | Bekleme/sn | Yarıçap | Süre/sn | Gerçek mekanik |
| --- | --- | --- | --- | --- | --- | --- |
| Ayna Kubbesi | prizma_power_0 | 29 | 79 | 64 | 12 | 12 saniye gelen hasar ×0.85; alınan hasarın %20 kadarı saldırana yansır. |
| Kristal Payı | prizma_power_1 | 24 | 81 | 64 | 12 | 160 öz; kahraman yetenek beklemeleri 8 saniye azalır. |
| Odak Fırtınası | prizma_power_2 | 44 | 83 | 64 | 12 | önce düşman koruma, teşvik, yenilenme ve yansıtması silinir; 220 alan hasarı; bina çarpanı 0.4. |
| Yankı Kopyaları | prizma_power_3 | 39 | 85 | 64 | 14 | en yakın kalıcı dost taburun rolünde kopya; tabur yoksa uzman; 14 saniye kalır. |

| Yapı | id | Rol | Öz | Can | Kurulum/sn | Gelir/sn | Hasar | Menzil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Prizma Merkez | prizma_keep | Merkez | 0 | 6100 | 0 | 0 | 27 | 65 |
| Prizma Hasatlığı | prizma_field | Ekonomi | 100 | 850 | 12 | 2.5 | 0 | 0 |
| Prizma Saf Ocağı | prizma_barracks | Üretim | 150 | 1200 | 16 | 0 | 0 | 0 |
| Prizma Atış Meydanı | prizma_range | Üretim | 150 | 1000 | 16 | 0 | 0 | 0 |
| Prizma Binek Avlusu | prizma_stable | Üretim | 180 | 1200 | 18 | 0 | 0 | 0 |
| Prizma Kuşatma İşliği | prizma_workshop | Üretim | 220 | 1100 | 20 | 0 | 0 | 0 |
| Prizma Gelişim Evi | prizma_forge | Araştırma | 170 | 1000 | 18 | 0 | 0 | 0 |
| Prizma Gözcü Kulesi | prizma_tower | Savunma | 180 | 1500 | 17 | 0 | 37 | 67 |

| Araştırma | id | İstatistik | Çarpan | Öz | Süre/sn |
| --- | --- | --- | --- | --- | --- |
| Prizma Keskinlik | prizma_edge | Hasar | 1.26 | 220 | 30 |
| Prizma Katman | prizma_plate | Can | 1.15 | 220 | 30 |
| Prizma Akış | prizma_logistics | Gelir | 1.25 | 220 | 30 |
| Prizma Adım | prizma_stride | Hız | 1.13 | 220 | 30 |

## 5. Ekonomi, inşa, kuyruk ve araştırma

Başlangıçta ücretsiz merkez ve bir piyade vardır. Başlangıç özü 650 artı tohumlu 0–99 tam sayı, uyum 10’dur. Temel gelir 3 öz/sn; tamamlanmış Hasatlık 2,5 ve karakol 2 öz/sn ekler. Gelir araştırması toplamı kendi katalog çarpanıyla artırır; Filiz ikmal gücü ayrıca süreli çarpan uygular. Merkez kaybında gelir, araştırma ve AI kararları durur.

İnşa noktası harita içinde, başlangıç merkezinden en fazla 100 birimde ve her canlı yapıdan en az 16 birim uzakta olmalıdır. Bina tam canla doğar, kurulum bitene kadar gelir, saldırı ve üretim sağlamaz. Kabul edilen komut tam bedeli hemen öder. Üretim binası en fazla 5 sipariş tutar; bütün canlı kalıcı birlikler ve bütün siparişler ortak nüfus sınırına dahildir. Bedel veya nüfus yetmezse durum değişmeden komut reddedilir. Ölüm yuva açar, geçici çağrılar nüfus sayılmaz.

Saf Ocağı piyade/uzman; Atış Meydanı menzilli; Binek Avlusu süvari; Kuşatma İşliği kuşatma üretir. Merkez kahraman yetiştirir. Canlı veya sırada olan aynı kahraman yeniden alınamaz; öldüyse tam bedelle geri çağrılır. Toplanma noktası yeni tabura saldırarak yürüme emri verir. Köz ikmal gücü kuyruk ilerlemesini hızlandırır; araştırmayı hızlandırmaz.

Tamamlanmış Gelişim Evi gerekir. Bir oyuncu aynı anda tek araştırma yapar ve her araştırmayı bir kez alır. Hasar, can ve hız bütün o oyuncunun tabur/kahramanlarına, gelir oyuncunun toplam gelirine işler. Can gelişimi hem mevcut hem azami canı aynı katsayıyla artırır; yeni doğanlar da gelişmiş canla doğar. Araştırma binası yıkılırsa işlem ve ödenen öz kaybolur. Bina saldırısı/canı araştırmalarla artmaz.

## 6. Savaş, hareket, karşıtlık ve liderlik

Piyade süvariye, süvari menzilliye, menzilli piyadeye 3,5 kat hasar verir. Kuşatma yapılara 3,2, diğer birimler 0,22 çarpanı alır; Köz uzmanı 1,4 istisnasıdır. Kuşatma tabur veya kahramana 0,55 çarpanı alır. Vuruş menzil toleransı bina için 10, diğer hedef için 3 birimdir. Merkez ve kule otomatik ateş eder; hasarı sıfır olan ekonomi/üretim binaları saldırmaz.

Taburlar 75, kamp nöbetçileri 55 birim içinde düşman arar. Kuşatma dışı birimler hedef seçiminde yapıya 20 mesafe puanı ekler. Açık saldırı hedefi yaklaşınca önceliklidir; saldırarak yürüme yakın düşmanla savaşır. Normal yürüme ve geri çekilme sırasında otomatik saldırılmaz, noktaya varınca nöbet başlar. Geri çekilen merkezine gider. Merkeze 65 birim içinde ve son 5 saniye darbe almayan savaşçı, saniyede azami canının %2’sini yeniler. Arazi daireleri hız çarpanları uygular; katı engel yoktur.

Aura anlık olarak canlı liderin mesafesi ve rol filtresinden hesaplanır. Lider ölürse veya menzil dışına çıkarsa bonus hemen kalkar; aynı türde en güçlü aura seçilir. Aura iyileştirmesi savaş sırasında da işler. Zırh aurası, taraf özelliği ve etkin koruma hasara ayrı çarpan olarak uygulanır. Birden fazla korumadan en düşük hasar katsayısı seçilir; teşviklerden ilk etkin olan uygulanır. Zehirler birikebilir. Yansıtılan hasar tekrar yansıtılmaz. Güçle silme, geçici korumayı kaldırır; auraları veya kalıcı araştırmayı silmez.

## 7. XP, seviyeler, yetenekler ve güçler

Tabur ve kahraman en fazla 5. seviye. Toplam XP eşikleri 100, 200, 300, 400. Verilen gerçek hasar/12 XP, öldürme ayrıca normal hedefte 40, kahramanda 85, yapıda 60 XP verir. Her seviye taban can ve hasarı %12 artırır; can farkı ve yeni azami canın %10’u iyileşir. Çağrılar ve nöbetçiler XP kazanmaz. Birinci yetenek seviye 1, ikinci seviye 3’te açılır. Yetenek başına ayrı bekleme vardır; Prizma özelliği ve bekleme aurası çarpanları uygulanır.

Yetenek merkez noktası kahramanın katalog menzilinde ve takım görüşünde olmalıdır; görünen ama menzil dışındaki nokta da reddedilir. Güç noktası takım görüşünde olmalıdır. İyileştirme azami canı aşmaz; alan hasarı yetenekleri yapılara 0,4 çarpanı uygular. Sersemleme hareket/saldırıyı durdurur. Zehir katalogdaki hasar/sn değerini süresince uygular. Çağrılar belirtilen rol kadrosundan doğar, süre bitince silinir. Kadro tabloları her yeteneğin süre, yarıçap ve katsayısını ayrı verir.

Uyum en fazla 100. Canlı merkez saniyede 0,09 uyum sağlar, verilen gerçek hasar/100 ayrıca eklenir. Güç, maliyetini etkiyi uygulamadan önce öder; hasar gücü sonrasında hasardan uyum geri kazanabilir. Yetersiz uyumda güç hiçbir etki yapmaz. Güç başına bekleme ayrıdır. İkmal, ödül ve baskın kazancı istatistikte gelire de yazılır. Süreli ikmal avantajı yalnız belirtilen süre içinde işler. Geçici çağrı kaybolması düşmana öldürme ödülü vermez.

## 8. Görüş sisi, karakollar ve kamplar

Izgara 20 birimdir. Normal tabur görüşü 95, menzilli 110, kahraman 115; bina/kızak/nöbetçi varsayılanı 95. Görüş aurası bu değeri artırabilir. Takımın canlı varlıklarının daireleri birleşir. Keşif belleği iki takım için ayrıdır; her 2 saniyede kalıcılaştırılır, sorguda şu an görünenler de keşfedilmiş sayılır. Noktasal düşman görünürlüğü hücre yuvarlamasından bağımsız daire testi kullanır.

Takım sorgusu gizli düşmanları, düşman kaynaklarını, kuyruklarını, emirlerini, rastlantı durumunu ve diğer takımın keşfini çıkarır. Görünmez düşmanın son konumu ayrıca saklanmaz. Görülmeyen karakol sahibi ve kamp durumu açıklanmaz. `getVisibility` değişken cols/rows ile dünya boyutlarını verir. `getFogTexture` satır başına cols×4 bayt RGBA ve `unpackAlignment:1` üretir. 34, 30 veya 33 sütunlu haritalarda tek kanallı dokunun varsayılan 4 bayt satır hizalaması kullanılmamalıdır. RGBA verisi bu taşmayı önler; `fogCell` dünya koordinatını doğru satır ve hücre merkez UV’sine çevirir. Doku boyutu sabit haritadan kopyalanmaz.

Karakola 35 birimde tek takımın kalıcı tabur/kahramanı 10 saniye durursa sahiplik geçer; çekişmede ilerleme sıfırlanır. Aynı takımdan en küçük oyuncu id’si gelir sahibidir. Çağrılar ele geçiremez. Her kampta iki 320 canlık nöbetçi vardır; 70 birim kamp çevresini savunup sonra dönerler. Son nöbetçi ölünce 95 birim içindeki en yakın canlı oyuncu varlığı bir kez 180 öz ve 90 XP alır. Gerçek altın bakiyesi artar; yalnız istatistik kaydı değildir. Yakında oyuncu yoksa ödül yoktur. Kamp yeniden doğmaz.

## 9. Haritalar ve sefer

| Harita | id | Boyut | Karakollar | Yavaş arazi |
| --- | --- | --- | --- | --- |
| Çatal Ufuk | catal | 640×420 | 250,100; 320,210; 390,320 | 320,100; r=35; hız×0.7; 320,320; r=35; hız×0.7 |
| Sessiz Havza | havza | 680×460 | 280,110; 340,230; 400,350 | 340,230; r=48; hız×0.65 |
| Bakır Teraslar | teras | 600×440 | 250,90; 300,220; 350,350 | 300,120; r=45; hız×0.8; 300,320; r=45; hız×0.8 |
| Ayna Geçidi | ayna | 660×400 | 270,85; 330,200; 390,315 | Yok |

Batı merkezleri x=65, doğu merkezleri genişlik−65’te; takım yuvaları yükseklik boyunca eşit dağılır. Her haritada iki kamp; kesin koordinatlar katalogdadır. Harita sabittir, tohum maç tercihlerini değiştirir.

| Görev | id | Amaç | Harita | Süre sınırı/sn | Brifing |
| --- | --- | --- | --- | --- | --- |
| İlk Kıvılcım | ilk-isik | destroy | Çatal Ufuk | 1800 | Sedef Birliği yeni kıyıda bir üs kuruyor. Hasatlık ve Saf Ocağı inşa et; düşman merkezini yık. Kendi merkezini kaybedersen sefer biter. |
| Üç Mührün Nöbeti | uc-muhur | hold | Sessiz Havza | 900 | Filiz Meclisi havzanın ikmal mühürlerini istiyor. En az iki karakolu kesintisiz 90 saniye elinde tut. Merkezini kaybetme; 900 saniyelik süren var. |
| Son Kervanın Yolu | son-kervan | escort | Bakır Teraslar | 900 | Yel Sancağı korumasındaki ikmal kızağını doğu çıkışına ulaştır. Kızak ancak yakınında dost savaşçı varsa ilerler. Kızak ya da merkez düşerse veya 900 saniye dolarsa görev başarısız olur. |

İlk Kıvılcım düşman merkezini yıkınca kazanılır; inşa tavsiyesi ek zafer kilidi değildir. Üç Mührün Nöbeti en az iki karakolu kesintisiz 90 saniye tutmayı ister, kontrol kaybında sayaç sıfırlanır. Son Kervanın Yolu 1800 canlık kızağı çıkışa ulaştırır; 70 birimde dost kalıcı savaşçı varsa kızak 4 birim/sn yürür, çıkışa 10 birim yakınken kazanılır. Kızak saldırmaz veya emir almaz; yıkılırsa görev kaybedilir. Her görevde merkez kaybı ve zaman sınırı yenilgidir. Tutma/refakat görevlerinde rakip merkezi yıkmak tek başına zafer değildir. Aynı adımda kendi merkezinin kaybı önceliklidir.

## 10. Yapay zekâ ve zorluk

| id | Ad | AI gelir | AI eğitim süresi | Karar/sn | Saldırı sayısı | Geri çekilme oranı |
| --- | --- | --- | --- | --- | --- | --- |
| kolay | Kolay | 0.65 | 1.35 | 7 | 7 | 0.2 |
| normal | Normal | 1 | 1 | 4 | 6 | 0.28 |
| zor | Zor | 1.65 | 0.7 | 2 | 5 | 0.36 |

İnsana zorluk kaynak bonusu uygulanmaz. Her AI aynı gerçek komutları verir ve maliyet öder. İki Hasatlık, dört üretim binası, Gelişim Evi, kule ve üçüncü Hasatlık planlar; binaları deterministik açı dizisiyle yerleştirir. 125 saniye sonrası araştırma, 145 sonrası ilk kahraman, 300 sonrası ikinci kahraman için kaynak ayırır. Kahramana para biriktirirken eğitim ve araştırmayı erteleyebilir.

Gördüğü baskın düşman rolünün karşı üretim binasını diğer normal üreticilerin önüne sıralar; gerekli kuşatma binası ilk önceliktir. Büyük orduda karşı olmayan rolleri %40 olasılıkla erteleyebilir. En az iki, daha sonra ordunun yaklaşık dörtte biri kadar kuşatma hedefler. Kuşatma bütçesi kendi tarafının gerçek kuşatma maliyetine göre saklanır. Bu öncelik üç zorlukta da gerçek kuyruk sonucu ile test edilir.

Bir gözcü karakol arar; ilk 400 saniye boyunca uygun karakola ilerler. Yeterli ordu veya 210 saniye sonrası en yakın düşman merkezine saldırılır; öncesinde uygun kamp temizlenebilir. Eve 130 birim yaklaşan düşmanda savunmaya döner. Eşik altı canla geri çekilir, %80 cana kadar toparlanır. Kahraman hasarlı dostta iyileştirme, yakın düşmanda saldırı/teşvik ve uygun olduğunda çağrı kullanır. Ekonomi gücü evde; savaş gücü cephede; yalnız bina onaran güç hasarlı dost binada; süvari gücü süvari cephede kullanılır. Görüş, kilit ve maliyetler AI için de geçerlidir. Kazananı zorla seçen kural yoktur.

## 11. Simülasyon mimarisi ve halka açık API

Giriş: `game/src/sim/index.js`. `data.js` tek içerik kaynağıdır; `rng.js` durum taşıyan xorshift32 ve kararlı FNV-1a özetini sağlar. Çekirdekte DOM, çizim motoru, ağ, dış paket ve duvar saati yoktur. ES2022 modülleri tarayıcı ve Node 22 üzerinde aynen çalışır.

| İşlev | Sözleşme |
| --- | --- |
| `getCatalog()` | JSON kopyası: factions, maps, missions, modes, difficulties, rules. |
| `createMatch(config)` | Match nesnesi üretir. seed tamsayı; map ve mode id; factions takım 0 sonra takım 1; difficulty tek id veya takım başına iki id; ai her yuva için boolean dizisi; mission isteğe bağlı görev id. |
| `createSkirmish(config)` | Görev olmadan maç başlatır. |
| `createMission(id, config)` | Görev varsayılan harita ve taraflarıyla başlatır; config bunları değiştirebilir. Görevler 1v1’dir. |
| `step(match, seconds=0.5)` | Süreyi biriktirir, tam sabit adımları işler; Match nesnesini döndürür. Tek çağrı en çok 86400 saniye olabilir. Duraklatmada birikim eklenmez. |
| `issueCommand(match, command)` | Senkron `{ok:true, id?}` veya `{ok:false, reason}`; reason Türkçedir. |
| `getState(match, team?)` / `queryState` | Derin JSON kopyası. team verilmezse tam durum, 0 veya 1 verilirse görüşe göre süzülmüş durum. |
| `getVisibility(match, team)` / `queryVisibility` | team, cellSize, cols, rows, visible ve explored (0/1 düz diziler), entityIds, worldWidth, worldHeight, unpackAlignment. Hücre indeksi y×cols+x. |
| `isVisible(match, team, id)` | Varlığın şu an takımca görülüp görülmediği. |
| `drainEvents(match, team?)` | Olayları bir kez döndürüp ortak kuyruğu boşaltır; takım verilirse görünür/dost olaylar ve bitiş olayı süzülür. |
| `serialize(match)` / `restore(json)` | JSON metni; restore metin veya ayrıştırılmış nesne alır, yeni Match döndürür. |
| `hashState(match)` | Olay kuyruğu hariç durumun 8 karakterlik deterministik özeti. |
| `getCombatStats(match,id)` / `damageAgainst(match,a,b)` | Güncel saldırı, hız, menzil, azami can, görüş; hedefe karşı koruma öncesi kural hasarı. |
| `runDuel({faction,a,b,seed})` | Aynı gerçek savaş koduyla iki araştırmasız seviye 1 taburun düellosu; winner ve duration_s. |

`Match` üzerinde `.step(seconds)`, `.command(command)`, `.query(team)`, `.visibility(team)`, `.drainEvents()`, `.serialize()` kolaylık metotları ve `.ended` bulunur. `.state` yönetici/araç alanıdır; istemci seçiminde takım sorgusu kullanılmalıdır. Tüm varlık id’leri maç içinde artan sayıdır, oyuncu id’leri sıfırdan başlar. Konum düzlemi x/y’dir; çizim bu düzlemi yatay dünya eksenlerine taşır.

| Komut type | Alanlar | Davranış |
| --- | --- | --- |
| `move`, `guard` | player, ids: sayı[], x, y | Hareket veya nöbet noktası; move hedefte nöbete dönüşür. |
| `attack` | player, ids, target: varlık id veya x,y | Görünür düşmanı hedefle veya konuma saldırarak yürü. |
| `retreat` | player, ids | Merkeze çekil; normal ev iyileşmesi uygulanır. |
| `build` | player, building: katalog id veya bina type, x,y | Bedel ödenir, tamamlanma zamanı taşıyan yapı döner. |
| `produce` | player, building: varlık id, unit: katalog id | Uygun binanın kuyruğuna tabur ekler. |
| `setRally` / `set_rally` | player, building: varlık id, x,y | Üretim toplanma noktası. |
| `research` / `researchUpgrade` / `research_upgrade` | player, upgrade: katalog id | Tamamlanmış Gelişim Evi ile araştır. |
| `recruitHero` / `recruit_hero` | player, hero: katalog id, building? | Varsayılan olarak merkez kuyruğuna kahraman. |
| `ability` / `useAbility` / `use_ability` | player, hero: varlık id, ability: katalog id, x?,y? | Konum yoksa kahramanın bulunduğu yer. |
| `power` / `castPower` / `cast_power` | player, power: katalog id, x?,y? | Konum yoksa başlangıç merkezi. |
| `pause` | paused: boolean | Maç saatini durdurur veya sürdürür. |

Örnek tarayıcı kullanımı:

```js
import {createMatch, step, issueCommand, getState} from "./src/sim/index.js";
const match = createMatch({seed: 42, map: "catal", mode: "1v1",
  factions: ["sedef", "pus"], difficulty: "normal", ai: [false, true]});
issueCommand(match, {player: 0, type: "build", building: "sedef_field", x: 100, y: 210});
step(match, 0.5);
const frame = getState(match, 0);
```

Olay tipleri: `order`, `spawn`, `construction`, `queued`, `produced`, `upgrade`, `attack`, `death`, `expire`, `level`, `ability`, `power`, `capture`, `camp`, `gameover`. Her olay simülasyon tick’ini taşır; tipe göre id, player, target, x/y veya içerik id’si eklenir. Kuyruk son 256 olayla sınırlıdır; istemci düzenli boşaltır. Olaylar oyun kuralının girdisi değildir. Maç bittiğinde kullanılmamış zaman birikimi sıfırlanır; sonuç çağıranın adım büyüklüğünden etkilenmez. Tek yerel istemci akışı için kuyruk bir kez boşaltılmalıdır. `drainEvents(team)` özel bir kalıcı olay günlüğü oluşturmaz. Maç istatistikleri oyuncu başına gelir, harcama, öldürme, kayıp, inşa, üretim, hasar, yetenek, güç ve ele geçirme toplamlarını içerir.

Diziliş API’si: `getBattalionLayout(match,id,team?)` yaşayan tabur, kahraman veya nöbetçi için `{index,x,y,heading}` asker konumları döndürür. Team verilirse görünmez düşman sorgusu boş döner. Can oranı görsel asker sayısını azaltır; taburun toplam saldırı hasarı bu görsel sayıdan türetilmez. `facing` ve grup `formationSlot` alanları kayıt içinde saklanır. Düzenli hareket ve yumuşak ayırma istemcide tekrar hesaplanmaz.

Ek API: `getAuraModifiers(match,id)` güncel yerel liderlik katsayılarını döndürür. `getFogTexture(match,team)` RGBA Uint8Array, width, height, format, unpackAlignment, flipY, worldWidth, worldHeight verir. `fogCell(visibility,x,y)` `{col,row,index,u,v}` döndürür. Bunlar çizim motoruna bağımlı değildir. WebGL doku için `RGBAFormat`, `UnsignedByteType`, `unpackAlignment=1`, `flipY=false`, en yakın komşu örnekleme kullanılmalıdır. Dünya x/y’si oyun alanının x/z’sine taşınıyorsa doku v ekseni aynı yönde tutulmalıdır.

## 12. Determinizm ve kayıt

Bütün rastlantı durumdaki xorshift32 akışından gelir. Güvenli tamsayı tohum 32 bite çevrilir; sıfır için kilitlenmeyen sabit durum kullanılır. Tick sırası AI → gelir/araştırma/üretim → savaş/hareket → karakol/kamp → görev/zafer → gerekiyorsa keşif. Tam kayıt sürüm, config, rng, tick, zaman birikimi, varlık, kuyruk, bekleme, geçici buff, süreli ikmal avantajı, keşif ve görev sayaçlarını içerir. Auralar canlı liderlerden yeniden hesaplanır, kayıt dışı rastlantı kullanmaz.

`serialize` JSON metni; `restore` metin veya ayrıştırılmış gövdeyle yeni Match üretir. Desteklenmeyen sürüm ve bozuk sayısal gövde reddedilir. Olay kuyruğu da korunur; istemci yüklemede eski efektleri boşaltabilir. Olay boşaltmak oyunun geleceğini değiştirmez. Özet olayları hariç tutar; maç sonunda kullanılmayan zaman birikimi sıfırlanır, çağıranın adım boyu sonucu değiştirmez. Özet kriptografik amaçlı değildir.

## 13. Test, değişiklik duyarlılığı ve denge

Node 22, paket kurma ve derleme yoktur. Komutlar `deliverable/` içeren dizinden; mutlak betik yolu başka çalışma dizininden de çalışır. CLI her seferde yalnız bir JSON nesnesi basar, geçersiz argümanda hata JSON’u ve başarısız çıkış kodu verir.

```sh
node deliverable/game/tools/sim-cli.mjs catalog
node deliverable/game/tools/sim-cli.mjs match --seed 1 --map catal --mode 1v1 --factions sedef,filiz --difficulty normal --snapshot-at 300
node deliverable/game/tools/sim-cli.mjs duel --faction sedef --a sedef_infantry --b sedef_cavalry --seed 1
node deliverable/game/tools/sim-cli.mjs balance --output deliverable/docs/balance-report.json
node deliverable/game/tests/run-tests.mjs
bash deliverable/game/tests/check-cli.sh
bash deliverable/game/tests/check-mutations.sh
```

Maç sonucu seed, map, mode, factions, difficulty, max_seconds, winner_team, duration_s, final_hash içerir. Varsayılan sınır 2400 saniye; son tam yarım saniyeye kadar ilerler, zaman aşımında kazanan null olur. `--snapshot-at` tam JSON gidiş dönüşü ile taze maç nesnesine geçer. `--difficulty zor,kolay` takım başına zorluktur. `balance` 6×5×4=120 sıralı eşleşmeyi normal seviyede oynar. Tohum varsayılan 1’den artar; `--seed`, `--max-seconds`, `--output` desteklenir. Varsayılan rapor konumu betiğin kardeş docs dizinidir.

Testler API üzerinden gerçek altın ödemesini, yetersiz parayı, canlı ve sıradaki ortak nüfus tavanını, harcanan uyumu, görünür fakat yetenek menzili dışındaki hedefi ve kampın gerçek altın ödülünü doğrular. İstatistik artışı ödemenin yerine geçmez. Ayrı mutasyon kontrolü bu beş kuralı kopya çekirdeklerde tek tek kaldırır; testler bunları yakalamadan kontrol başarılı sayılmaz. Mutasyon sonuçları mutation-report.json içindedir.

Gelir/karakol, üretim, karşıtlık, kuşatma/direnç, kule ateşi, bütün araştırma katsayıları, XP kilidi, her yetenek/güç ve her aura test edilir. Özel güç yan etkileri onarım, süreli gelir/üretim, öldürme ödülü, baskın geliri, itme, zehir, süvari filtresi, yansıtma, bekleme azaltma, silme ve farklı çağrı rollerini gerçek sonuçla ölçer. Her görevin zaferi, merkez kaybı, süre yenilgisi; refakat ölüm/bekleme ve tutma sıfırlanması; keşif, kayıt, tohum, duraklatma ve dokuz düzen sınanır. Dört haritanın bütün sis hücreleri ve RGBA satırları ayrıca doğrulanır. Son test satırı `TESTS passed=<n> failed=<m>`; başarısız testte süreç sıfırdan farklı çıkar.

Denge raporu CLI’nin gerçek maç çıktısıdır; elle sonuç düzeltilmez. Zaman aşımı iki tarafa da galibiyet sayılmaz. Hedef %35–65; en çok %10 zaman aşımı; medyan 240–1500 saniye. Denge kadro can/hasar/menzil, kaynak bedeli, kahraman kitleri ve gerçek AI bütçesi üzerinden ayarlanır. Bu, insan rekabetini garanti eden bir ölçüm değildir.

| Taraf | Galibiyet oranı | Maç |
| --- | --- | --- |
| Sedef Birliği | 0.5 | 40 |
| Filiz Meclisi | 0.65 | 40 |
| Köz Ocakları | 0.425 | 40 |
| Pus Kervanları | 0.4 | 40 |
| Yel Sancağı | 0.55 | 40 |
| Prizma Divanı | 0.475 | 40 |

Rapor: 120 maç; 0 zaman aşımı; medyan 354.75 saniye. İlk üç ve son kayıt alanlarıyla CLI’de aynen tekrar üretilir.

## 14. Web istemcisi, kullanıcı akışı ve dağıtım

Nihai statik dağıtım giriş sayfası, istemci modülleri, simülasyon, manifest ve servis çalışanını birlikte sunar. Menü harita, taraf, dokuz takım düzeni, zorluk ve sefer seçimini katalogdan besler. Masaüstü fare/klavye ve telefon dokunması aynı hareket, saldırı, inşa, üretim, araştırma, kahraman ve güç komutlarına dönüşür. Üstten eğimli kamera, seçim/kontrol grupları, mini harita, duraklatma, öğretici, ayarlar, maç istatistikleri ve prosedürel ses/görsel geri bildirim bu kuralları görünür kılar.

Prosedürel ses girişi `game/src/client/audio.js` kendi kendine yeterlidir: `AudioSystem` / `AudioEngine` / `GameAudio` / `AudioManager`, `unlock`, `configure`, `handleEvents`, `update`, `setListener`, `setPaused`, `dispose` sunar. Pointer/tuş hareketi ses açılışını tetikler; olaylar taraf, rol ve kaynak konumuyla işlenir. Uzak olaylar sessizleşir, sağ/sol kaydırma kamera eksenine bağlanır. Müzik saati ses bağlamını kullanır; oyun RNG’si veya kuralları etkilenmez. Ses tek seferde en çok 72 kaynak tutar; menüden ayrılırken dispose zamanlayıcı, medya ve düğümleri temizler. Ayrıntılı bağlantı ve doğrulama SES_VE_DIZILIS.md içindedir.

Dünya sisi ve mini harita aynı takım görünürlüğünü kullanır; gizli düşman çizilmez. Kamera/ışık sis hesabını değiştirmez. Kuyruk kalan süresi, yapı readyAt, araştırma remaining, kahraman abilityReady ve oyuncu powerReady arayüz göstergeleridir; aura adı, yarıçapı ve rol filtresi kahraman bilgi paneline aktarılabilir. Olay akışı yalnız efekt/ses içindir, oyun kuralı istemciye taşınmaz.

Ayarlar, son kurulum, seferde kazanılan görev kimlikleri ve bir otomatik maç kaydı yerel tarayıcı depolamasında tutulur. Kayıt devamı restore kullanır; çevrimiçi hesap/sunucu yoktur. PWA manifestosu ve servis çalışanı statik kabuğu sağlar; tek sürüme sabitlenmiş çizim motoru CDN bağımlılığı ve ilk çevrimiçi yükleme gereksinimi README’de açıklanır. Bu belgede dağıtım/hosting yapılması istenmez; yayımlamayı Operator yapar. W1/W2 ayrımı üretim iş bölümüdür, oyun tasarımından özellik çıkarılması değildir.
