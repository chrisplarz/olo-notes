# Guided ritual imagery

Generated on October 31, 2026 with the built-in image-generation tool, using four separate calls. Matched the app screenshot’s warm paper and pine palette and the repository’s existing `assets/welcome-landscape.webp` misty forest/lake reference. The existing brand image was inspected and left unchanged; no user screenshot or journal content was embedded in generated assets or source files.

The cards retain 52 × 52px thumbnails with 14px corners. Each image is a 208 × 208px JPEG (four-times display resolution), exported with macOS `sips`, quality 83. Originals remain in the image-generation library. The project consumes only these local assets, without external image URLs or runtime dependencies:

- `assets/rituals/mindful-reset.jpg`
- `assets/rituals/first-dip.jpg`
- `assets/rituals/nordic-contrast.jpg`
- `assets/rituals/pure-sauna.jpg`

The image `alt` text is empty because the neighboring title and description identify the ritual. Existing activity and timer icons elsewhere are retained. The new service-worker asset list includes all four photos; the user subsequently authorized shell release 59 preparation, testing and publication.

Exact prompt set: concatenate this common prefix with each subject below, without additional text.

```
Use case: photorealistic-natural. Create a square editorial photograph for a 52px rounded ritual thumbnail in Ølo Notes, a calm Scandinavian spa journal. The four thumbnails form one visually coherent series. Style: quiet Nordic nature photography with soft film grain, tactile natural surfaces, restrained detail and slight atmospheric softness, like misty pine forests reflected in still water. Muted dark pine green, sage, stone gray, warm ivory and weathered wood; low saturation, gentle daylight, natural contrast. Compose one clear scene that remains legible when small; subject centered and fills the frame, edge-to-edge image. No people, faces, text, symbols, icons, logos, lettering, phone frames, borders or collage. No dramatic lighting, neon, icy sports imagery or luxury hotel styling. 
```

### mindful-reset

```
Subject: a tranquil Nordic forest lakeshore in early morning, a few dark pine branches framing soft mist above still sage-green water and smooth shoreline stones. Peaceful reflection, soft warm ivory haze. The water and low forest silhouette are the main simple shapes.
```

### first-dip

```
Subject: close view of broad weathered pale-wood bathing steps leading gently into calm clear green-gray lake water at a Nordic spa. Rounded shore stones visible in the shallows, soft pine reflections. Inviting and gentle, no ice or plunging person. Simple readable wood-to-water composition.
```

### nordic-contrast

```
Subject: a small dark timber lakeside sauna cabin with a soft amber window, framed closely beside still pine-green lake water and a low veil of morning mist. Warm timber and cool water balanced in one quiet scene; cabin large enough to recognize at thumbnail size, no distant tiny buildings.
```

### pure-sauna

```
Subject: a quiet Scandinavian sauna interior, close view of warm pale cedar benches and a small pile of smooth dark sauna stones at the side. Soft diffused daylight through a small window, a subtle veil of steam. Tactile wood grain, unoccupied, simple clean composition, warm natural beige balanced with muted pine shadows.
```

Image content was inspected during asset creation. Subsequent release validation passed 57 Node and 125 browser checks, with isolated phone/desktop visual review. Deployment/archive status is tracked in the release record. The deferred Guided Rituals browser cases now serve the actual local thumbnails and check their loading and fixed geometry. Figma’s preset-tile pattern should adopt these images once access and design review are available; no Figma write or parity claim is made.

