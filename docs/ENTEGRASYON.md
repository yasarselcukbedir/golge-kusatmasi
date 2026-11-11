# W1 → W2 bağlantı notları

Çalışan kurallar `game/src/sim/index.js` içindedir. Node 22 ve tarayıcı aynı ES modüllerini kullanır; derleme veya paket kurulumu gerekmez. İçerik için `getCatalog()` kullanın. Ayrıntılı Türkçe kural ve API sözleşmesi [TASARIM.md](TASARIM.md) içindedir.

```js
import {
  createMatch, step, issueCommand, getState, getVisibility,
  drainEvents, serialize, restore, getCatalog
} from './src/sim/index.js';

let match = createMatch({
  seed: 42, mode: '2v2', map: 'catal',
  factions: ['sedef', 'filiz', 'koz', 'pus'],
  difficulty: 'normal', ai: [false, true, true, true]
});
const result = issueCommand(match, {
  player: 0, type: 'build', building: 'sedef_field', x: 100, y: 140
});
// İstemci kendi kare süresini saniye olarak verir; çekirdek 0,5 sn adımlar biriktirir.
step(match, 1 / 60);
const view = getState(match, 0);
const fog = getVisibility(match, 0);
const effects = drainEvents(match, 0);
const save = serialize(match);
match = restore(save);
```

- Oyuncu `id` değeri sıfırdan başlar; önce takım 0 yuvaları, sonra takım 1 yuvaları gelir. `mode` dokuz düzeni destekler. `difficulty` tek id veya `zor,kolay` gibi iki takım id’sidir.
- Yapı `building` alanı inşada katalog id’si veya `field` gibi tiptir. Üretim, toplanma ve kahraman kuyruğu komutlarında bina alanı sayısal varlık id’sidir. Kahraman çağrısı bina verilmezse merkezi kullanır.
- Konum düzlemi `x/y`; genişlik ve yükseklik harita kataloğundadır. Üs çevresinde en fazla 100 birim inşa mesafesi ve 16 birim yapı aralığı gerekir.
- Komut kabulü `{ok:true,id?}`, ret `{ok:false,reason}` döndürür. Türkçe ret nedeni arayüzde gösterilebilir. Bütün komut alanları TASARIM.md tablosundadır; camelCase ve belirtilen alt çizgili adlar desteklenir.
- Görüş için takım sorgusu kullanın. `getState(match)` tam yönetici durumudur. Takım sorgusu gizli düşmanları ve kaynaklarını çıkarır. `getVisibility` satır sıralı 0/1 dizileri ve görünür varlık id’lerini verir.
- Varlık `kind`: `building`, `unit`, `hero`, `neutral`, `escort`. Ölüler kısa süre tam durumda kalabilir; `hp>0` ile seçin. `type` katalog id’si, `role` savaş rolüdür. Tarafsızların oyuncu/takımı −1’dir.
- `readyAt` yapı bitiş anıdır. Kuyruk `remaining/duration`, araştırma `remaining`, yetenek `abilityReady[id]`, güç `powerReady[id]` kullanır. Bekleme değerleri mutlak simülasyon saniyesidir.
- Kahramanlar katalogda `heroes` listesindedir; her varlığın `level`, `xp`, `hp`, `maxHp` alanları vardır. `getCombatStats()` arayüz için etkiler uygulanmış saldırı ve hızı döndürür.
- `events` kayıt içinde en fazla 256 öğe tutar. Her istemci karesinde yalnız bir kez boşaltın. `attack`, `ability`, `power`, `level`, `death`, `capture`, `camp`, `gameover` ses ve efektleri tetikleyebilir.
- Görev başlatırken `{mission:'ilk-isik',ai:[false,true]}` yeterlidir; varsayılan harita ve taraflar görevden gelir. Görev durumu `mission.status` (`active/won/lost`), `reason`, tutma sayacı veya kızak id’si içerir.
- Duraklatma: `{type:'pause',paused:true}`. Seçim, kontrol grupları, kamera, ses, ayarlar, öğretici ve yerel sefer ilerlemesi istemciye aittir. Bu alanları simülasyon durumuna eklemeyin.
- Kayıt: `serialize()` JSON metnini istemci depolamasına yazın. `restore()` yeni maç döndürür. Olayları boşaltmak oyun özetini veya geleceği değiştirmez.

Doğrulama: `node game/tests/run-tests.mjs`. CLI: `node game/tools/sim-cli.mjs catalog`. Betikler herhangi bir çalışma dizininden mutlak yol ile çağrılabilir.

W1, web istemcisinin dosyalarını oluşturmaz; W2 bunları mevcut `game/` dizinine ekleyebilir. Giriş modülü ve veri şeması bu teslimin API’sidir.

## Sürüm 1.1 onarımı: liderlik ve farklı güçler

Her kahramanın `aura` alanı `{id,name,stat,value,radius,role?}` içerir. Etki yaşayan liderin çevresindeki takım savaşçılarına işler; aynı tür auralar birikmez ve lider kendini etkilemez. İstatistik panelinde `getCombatStats` ve `getAuraModifiers` kullanın. Tarafların birim ve kahraman değerleri artık ayrı yazılmıştır; arayüzde sabit değer kullanmayın.

Güçler aynı temel `kind` değerleriyle uyumludur; ek alanlar simülasyonca uygulanır. İnşa onarma, karakol primi, itme, can yenileme, süreli gelir/üretim, öldürme ve baskın geliri, süvari filtresi, yansıtma, yetenek beklemesi azaltma, koruma silme ve farklı çağrı rolleri vardır. İstemcinin etkileri tekrar hesaplaması gerekmez. `players[].boosts` geçici ikmal etkilerinin kalan süresi için sorgulanabilir. Süreli etkiler kayıt içinde korunur.

## Bütün haritalarda dünya sisi

Dört haritanın sis sütunları 32, 34, 30, 33'tür. Tek kanallı WebGL dokusunu varsayılan dört bayt satır hizalamasıyla yüklemek son üç haritada satırları bozar. Bu nedenle sabit doku boyutunu veya varsayılan satır hizalamasını kullanmayın. Çekirdeğin yeni yardımcı API'si bütün haritaları otomatik eşler:

```js
import {getFogTexture, getVisibility, fogCell} from './src/sim/index.js';
const frame = getFogTexture(match, 0);
const texture = new THREE.DataTexture(
  frame.data, frame.width, frame.height,
  THREE.RGBAFormat, THREE.UnsignedByteType
);
texture.unpackAlignment = 1;
texture.flipY = false;
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.needsUpdate = true;
// Yenilemede aynı harita için texture.image.data.set(frame.data) ve needsUpdate=true.
// Yeni haritada width/height değişirse dokuyu yeniden oluşturun.
```

`frame.data` görünür hücrede alfa 0, keşfedilmişte 145, bilinmeyende 245 taşır. RGBA satırları cols×4 bayttır. Yatay sis düzlemi dünya genişlik/yüksekliğine eşlenmeli, hücre UV'si için `fogCell(getVisibility(match,team),x,y)` kullanılmalıdır. Doku `flipY=false` olduğundan dünya y yönünü UV v yönüyle eşleyin; Three.js düzleminin döndürülmesinden doğan v tersliğini geometride düzeltin. Alfa dokusu için malzemede `transparent:true` gerekir. Ayrı fog canvas veya tek kanallı doku korunacaksa onun da her haritada güncel cols/rows ve `unpackAlignment=1` kullandığı doğrulanmalıdır.

W1 onarım alanında W2'nin `index.html` veya `src/client/**` dosyaları bulunmadığından mevcut tarayıcı çizicisine doğrudan düzenleme uygulanamamıştır. Yukarıdaki bağlantı noktası ve dört haritanın bütün texel/koordinat testleri, dünya sisi düzeltmesinin W2 tarafındaki somut uygulama sözleşmesidir. Nihai tasarım belgesi artık ürünün tamamını anlatır; istemci dosyalarının teslimde bulunmadığını söylemez.

## Ses ve tabur dizilişi onarımı

`src/client/audio.js` artık bu çalışma birimi tarafından sağlanan bağımsız bir ses modülüdür; `AudioEngine` / `AudioSystem` ve diğer sınıf adlarıyla kullanılabilir. Özgün beste, filtreli gürültü, taraf sesleri, yankı, nal/nida, konumsal seviye ve mobil açılış içerir. Grup emirleri ve birim ayırma simülasyonda uygulanır. Çizici `getBattalionLayout(match,id,team)` ile bireysel figür konumlarını kullanabilir. Olay/kamera ve figür bağlantısının tam örnekleri SES_VE_DIZILIS.md içindedir. Tam W2 ana çizim döngüsü burada bulunmadığından bu bağlantı mevcut W2 döngüsünde korunmalıdır; yeni ses modülü bu dosya yoluna birleştirilmelidir.
