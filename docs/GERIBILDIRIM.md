# Görünür savaş olayları ve doğru bildirimler

W2 1.4, ölüm geri bildirimini ve kişisel bildirimlerin sahiplik denetimini onarır. Önceki model, sis, ses, diziliş ve performans onarımları korunur. W1’in mühürlü dosyaları değiştirilmemiştir.

## Olayların istemciye ulaşması

W1’in `drainEvents(match,team)` filtresi olayın canlı varlığını arar. Ölümde kurban artık canlı olmadığı için görünür düşman ve kamp nöbetçisi ölümleri bu filtreden geçmiyordu. `level` olayı ise oyuncu alanı taşımadığından istemci görünür bir rakibin seviye atlamasını kendi birliği gibi bildiriyordu.

`src/client/feedback.js` içindeki `FeedbackFeed`, simülasyon API’sinin **tam olay dizisini bir kez** `drainEvents(match)` ile alır. Simülasyonun tam durum sorgusu yalnız olay sahibini, tarafı, rolü ve ölmüş varlığın kimliğini çözmek için özel olarak kullanılır. Bu tam durum çiziciye, sese veya arayüze verilmez. Yalnız izin verilen sunum olayları ve alanları dışarı çıkar; üretim kuyruğu ve gizli oyuncu kaynakları aktarılmaz.

Takım olayları korunur. Düşman ve tarafsız olayların konumu, `getVisibility` ve `fogCell` verisiyle sınanır. Yaşayan varlıkların kesin görünür kimlikleri hücre sınırındaki seviye/üretim olaylarını da kapsar. Ölümde canlı varlık aramak yerine kurbanın olayda kayıtlı konumu kullanılır. Böylece çizicinin son görünür durumunda model artık bulunmasa da ölüm halkası ve konumsal ölüm sesi üretilebilir.

Son dost gözlemcinin de aynı adımda ölmesi halinde, en fazla bir sabit adımlık önceki görüş yalnız o kısa ölüm geri bildirimi için kullanılır. Daha eski görüş geçmişi kabul edilmez. Bu, aynı anda yenilen iki birliğin son görülen ölüm etkisini korur; uzaktaki veya sonradan gerçekleşen gizli ölümleri açığa çıkarmaz. Gizli bir zehir ölümü, hasar kaynağı oyuncuya ait olsa bile kurban konumu görünmüyorsa sese ve çizime gitmez.

Ana döngü bu süzülmüş, sahipliği tamamlanmış **aynı diziyi** hem `Battlefield.handleEvents()` hem `Soundscape.handleEvents()` metoduna verir. Olaylar ikinci kez boşaltılmaz. Yeni maçta ve devam etmede görüş geçmişi yeniden kurulur; kayıt yüklenirken eski bekleyen olaylar temizlenir.

## Kişisel bildirimler

`personalNotices(events,player)` yalnız ilgili oyuncuya ait seviye, karakol, kamp ve araştırma mesajlarını üretir. Müttefik ve görünür rakip seviye olayları dünya halkasını ve sesini korur; “Birliğin … seviyeye ulaştı” mesajı çıkarmaz. Sahibi çözülemeyen olaydan kişisel mesaj oluşturulmaz. Aynı birliğin tek olay dizisinde birden çok seviye atlaması yalnız ulaştığı en yüksek seviyeyi bildirir.

Ölüm halkasının 0,8 saniyelik süresi, 48 etkin efekt sınırı, geometri/malzeme paylaşımı ve efekt havuzunun yeniden kullanımı korunmuştur. Ses düzeyi, konumsal kısılma, taraf tınısı, iOS açılışı ve ses kaynak sınırı değişmemiştir.

## Doğrulama

```sh
node --experimental-vm-modules deliverable/verification/feedback-regression.mjs
node --experimental-vm-modules deliverable/verification/client-flows.mjs
```

14 geri bildirim denetimi gerçek simülasyonda düşman ve tarafsız öldürme, görünmeyen zehir ölümü, karşılıklı yansıtma ölümü, eski görüşün reddi, kendi/rakip/müttefik seviye olayları, kişisel bildirimler ve olay tekrarını sınar. Üretimdeki gerçek halka oluşturma/havuz metotları ve gerçek ses motoru kayıt tutan grafik/ses ilkelleriyle çalıştırılır. 25 istemci akışı ayrıca gerçek ana döngünün ölü modeli kaldırdıktan sonra aynı olay dizisini iki tüketiciye verdiğini ve doğru kişisel mesajı çıkardığını denetler.

Tam, tohumlu 1’e 1 maç denetiminde (`seed=17`, Sedef/Filiz, normal yapay zekâ) takım 0’ın o anda gördüğü **8 düşman ve 1 tarafsız ölümün 9’u da** teslim edildi; eski takım filtresi bunların **0’ını** teslim ediyordu. **19 kendi kaybının 19’u** korundu; **2 gizli ölüm** gösterilmedi. Ayrıntılı kayıt `verification/feedback-regression.json` içindedir.

Bu denetimler GPU pikselleri veya hoparlör kaydı değildir. VM’de gerçek tarayıcı/GPU/iOS cihazı bulunmadığından bu cihaz denemeleri yapılmamıştır. Diğer doğrulamalar ve çalıştırma/yayın adımları README’de bulunur.
