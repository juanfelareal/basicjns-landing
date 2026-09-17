# Landing Pack Jeans Mujer Denim 3 Unidades — BASIC JNS

Réplica en código de la landing que hoy vive en **GemPages** (page type `GP_PRODUCT`,
`theme_page_id=637200243590431559`). Mismo contenido, mismas imágenes, mismos videos,
mismos precios — sin la app ni su runtime.

**En vivo:** https://juanfelareal.github.io/basicjns-landing/

## Archivos

```
index.html          Toda la estructura (9 secciones + header y footer)
assets/styles.css   Diseño completo, responsive desde 360px
assets/app.js       Galería, tallas, carruseles, videos, carrito
assets/data.js      Datos reales traídos del catálogo Shopify
assets/video/       3 videos comprimidos + sus posters (2.3 MB en total)
```

Sin dependencias, sin build. La única carga externa es la fuente **Assistant**
(Google Fonts), que es la del tema de la tienda.

## Secciones (en orden, igual que el original)

1. Producto: galería + tallas + cantidad + carrito + garantías + 3 acordeones
2. Franja de medios de pago (marquee infinito)
3. "Ahorra Comprando el PACK DENIM (3 JEANS)" — 3 videos verticales 9:16
4. "Estos Jeans son asequibles…" — imagen + detalles del producto
5. Productos recomendados — carrusel de 10 packs, cada uno con su selector de talla
6. Reseñas — 4.8/5, carrusel de 6 opiniones, caja de confianza
7. Preguntas frecuentes — 5 acordeones
8. Producto (cierre) — con la fecha de hoy calculada en vivo
9. Garantías de pie de página

## Carrito

Los botones usan **permalinks de carrito de Shopify**, verificados contra la tienda:

| Acción | URL | Resultado |
|---|---|---|
| Agregar al carrito | `/cart/{variante}:{cantidad}?storefront=true` | Agrega y muestra el carrito |
| Pago Contra Entrega \| … | `/cart/{variante}:{cantidad}` | Va directo al checkout |

Por eso funciona igual servida como estática o pegada dentro del tema.

## Ver en local

```bash
cd ~/basicjns-landing
python3 -m http.server 8777
# http://localhost:8777
```

## Actualizar datos del catálogo

`assets/data.js` se armó con los endpoints públicos `/{handle}.js` de Shopify.
Para refrescar precios, tallas o imágenes:

```bash
curl -s https://basicjns.co/products/pack-jeans-mujer-denim-descuento-increible.js | python3 -m json.tool
```

## Videos

Los originales eran 3 archivos `.mov` de 1920×1080 en el CDN de Shopify: **61 MB en
total**, servidos como `video/quicktime` (poco fiable en Android). GemPages los
mostraba recortados a 9:16 con `object-fit: cover`.

Aquí se recortaron a 9:16 en origen y se recodificaron a MP4 540×960:

```bash
ffmpeg -i src.mov -vf "crop=608:1080:(iw-608)/2:0,scale=540:960" \
  -c:v libx264 -crf 28 -preset slow -profile:v main -pix_fmt yuv420p \
  -movflags +faststart -an video.mp4
```

Resultado: **61 MB → 2.3 MB**, mismo encuadre. Cada uno lleva `poster` (primer
fotograma) y `preload="none"`; se piden solo al entrar en pantalla. Si el navegador
bloquea el autoplay, queda el poster visible en vez de una caja negra.

En escritorio van los tres en fila. En móvil son un **carrusel horizontal** que se
desliza (82 % de ancho, el siguiente asoma) con puntos indicadores. Solo se reproduce
el video visible: el IntersectionObserver también cuenta el recorte horizontal del
carrusel, así que los otros dos no gastan datos.

## Guía de tallas

La tienda la publica como **una sola imagen** (tabla + ilustración de cómo medir), no
como texto — por eso al inspeccionar el acordeón parece vacío. Es el archivo real del
CDN de Shopify, `assets/guia-de-tallas.jpg` (952×761), copiado tal cual:

| Talla | Cintura (cm) | Cadera (cm) |
|---|---|---|
| 6 | 65 – 70 | 95 – 100 |
| 8 | 71 – 76 | 101 – 106 |
| 10 | 77 – 82 | 107 – 112 |
| 12 | 83 – 88 | 113 – 118 |
| 14 | 89 – 94 | 119 – 124 |
| 16 | 95 – 100 | 125 – 130 |

Esos valores están **solo** transcritos aquí como referencia y en el `alt` de la imagen
(para lectores de pantalla y buscadores). La página muestra la imagen original, sin
reescribir ningún dato. La imagen enlaza a su versión completa porque en pantallas
chicas la tabla incrustada queda pequeña.

## Verificado en móvil

- Sin desbordes horizontales a 360 px ni a 390 px
- Objetivos táctiles de 44 px en tallas, cantidad y flechas
- Las flechas de la galería se ocultan en táctil (antes capturaban el swipe)
- Tallas, cantidad, total, acordeones, FAQ y ambos carruseles probados

## Diferencias deliberadas frente al original

- **WhatsApp:** el botón flotante apunta a un número placeholder (`573000000000`).
- **Header y footer:** reconstruidos a partir del tema para que la página se vea
  completa servida sola. Si se monta dentro del tema de Shopify, se borran y el
  tema pone los suyos.
