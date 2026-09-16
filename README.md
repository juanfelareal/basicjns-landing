# Landing Pack Jeans Mujer Denim 3 Unidades — BASIC JNS

Réplica en código de la landing que hoy vive en **GemPages** (page type `GP_PRODUCT`,
`theme_page_id=637200243590431559`). Mismo contenido, mismas imágenes, mismos videos,
mismos precios — sin la app ni su runtime.

## Archivos

```
index.html          Toda la estructura (9 secciones + header y footer)
assets/styles.css   Diseño completo, responsive desde 375px
assets/app.js       Galería, tallas, carruseles, videos, carrito
assets/data.js      Datos reales traídos del catálogo Shopify
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

## Diferencias deliberadas frente al original

- **Guía de tallas:** en GemPages ese acordeón abre vacío. Aquí lleva una tabla de
  medidas de referencia — hay que reemplazarla por las medidas reales de BASIC JNS.
- **WhatsApp:** el botón flotante apunta a un número placeholder (`573000000000`).
- **Header y footer:** reconstruidos a partir del tema para que la página se vea
  completa servida sola. Si se monta dentro del tema de Shopify, se borran y el
  tema pone los suyos.
