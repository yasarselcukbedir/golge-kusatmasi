// Keep the error surface independent of the rendering dependency.
const message = document.getElementById('boot-message');
let ready = false;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); window.__gkInstallPrompt = event; });
const fail = () => {
  if (ready) return;
  message.textContent = 'Oyun açılamadı. WebGL’i etkinleştirin; internet bağlantınızı ve tarayıcınızı denetleyip sayfayı yenileyin. İlk yüklemede çizim bileşenine erişilmesi gerekir.';
  document.getElementById('boot').classList.add('boot-error');
};
if (location.protocol === 'file:') {
  message.textContent = 'Bu oyun dosyaya çift tıklayarak açılmaz. Klasörü bir HTTP sunucusuyla çalıştırın. Kurulum adımları README.md dosyasındadır.';
} else {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!gl) {
    message.textContent = 'Tarayıcınız WebGL çizimini başlatamadı. Donanım hızlandırmasını açın veya güncel bir tarayıcı deneyin.';
  } else {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const timer = setTimeout(fail, 20000);
    import('./app.js').then(({start}) => start()).then(() => {
      ready = true;
      clearTimeout(timer);
      document.getElementById('boot').remove();
      if ('serviceWorker' in navigator) {
        // Yeni sürüm devraldığında: açılışın ilk saniyelerindeyse sayfayı yenile, maç sırasında yalnız haber ver.
        const hadController = !!navigator.serviceWorker.controller;
        let handled = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (handled || !hadController) return;
          handled = true;
          if (performance.now() < 20000) { location.reload(); return; }
          const note = document.createElement('button');
          note.type = 'button';
          note.textContent = 'Yeni sürüm hazır · dokun, yenile';
          note.style.cssText = 'position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:999;background:#e3c77e;color:#101f26;border:0;border-radius:10px;padding:9px 14px;font:600 13px system-ui,sans-serif';
          note.onclick = () => location.reload();
          document.body.appendChild(note);
        });
        navigator.serviceWorker.register('./sw.js').then(reg => reg.update().catch(() => {})).catch(() => {});
      }
    }).catch(error => {
      clearTimeout(timer);
      console.error('Başlatma hatası', error);
      fail();
    });
  }
}
