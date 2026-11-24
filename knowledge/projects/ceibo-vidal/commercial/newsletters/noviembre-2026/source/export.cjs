// Regenera ../ceibo-vidal-newsletter-noviembre-2026-final-v4.jpg (800x1500) desde index.html.
// Uso: node export.cjs   (requiere Google Chrome y sharp del node_modules de la raíz)
const {execFileSync}=require('child_process');const path=require('path');
const sharp=require(path.resolve(__dirname,'../../../../../../../node_modules/sharp'));
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out=path.resolve(__dirname,'../ceibo-vidal-newsletter-noviembre-2026-final-v4.jpg');
(async()=>{const png='/tmp/ceibo-vidal-newsletter-noviembre-2026-final-v4.png';
 execFileSync(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files','--force-device-scale-factor=1','--window-size=800,1500','--virtual-time-budget=3000',`--screenshot=${png}`,'file://'+path.resolve(__dirname,'index.html')],{stdio:'ignore'});
 await sharp(png).resize(800,1500,{fit:'cover',position:'top'}).flatten({background:'#101210'}).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(out);
 const m=await sharp(out).metadata();console.log(path.basename(out),m.width+'x'+m.height);})();
