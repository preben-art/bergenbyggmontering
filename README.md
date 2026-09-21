# Bergen Byggmontering AS

Nettside for [Bergen Byggmontering AS](https://bergenbyggmontering.no/) – boligrettet rehabilitering og totalrenovering i Bergen og omegn.

Dette repoet er en import av den live Hostinger-siden (`papayawhip-mandrill-438149.hostingersite.com`) som et kjørbart Vite-prosjekt, slik at videre utvikling skjer her.

All kundetekst er på norsk.

## Sider

| Side | Fil |
| --- | --- |
| Forside | `index.html` |
| Faginnsikt | `faginnsikt.html` |
| Totalrenovering | `tjeneste-totalrenovering.html` |
| Bad og våtrom | `tjeneste-bad.html` |
| Tømrer | `tjeneste-tomrer.html` |
| Rørlegger | `tjeneste-ror.html` |
| Tak | `tjeneste-tak.html` |
| Fasade | `tjeneste-fasade.html` |
| Tilbygg | `tjeneste-tilbygg.html` |
| Borettslag / sameier | `tjeneste-brl.html` |
| Personvern | `personvern.html` |

## Komme i gang

Krever Node.js 20+.

```bash
npm install
npm run dev
```

Utviklingsserveren kjører på [http://127.0.0.1:43147](http://127.0.0.1:43147).

```bash
npm run build    # produksjonsbygg til dist/
npm run preview  # server det bygde resultatet på samme port
```

## Struktur

```
├── index.html              # forside + øvrige HTML-sider i rot
├── src/                    # CSS og JS som videreutvikles
│   ├── index.css
│   └── index.js
├── public/
│   ├── bilder/             # foto og logo
│   ├── video/              # hero-video
│   ├── favicons/
│   ├── index.css           # servers /index.css (samme som live)
│   ├── index.js            # servers /index.js
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
├── package.json
└── vite.config.js
```

Tailwind lastes fortsatt fra CDN, som på live-siden. Egendefinert design ligger i `index.css`.

Kontaktskjemaet bruker EmailJS med nøkler fra live-siten. Bygg-Assistenten hadde ikke en publisert `askAI`-funksjon på live; her ligger en lokal, norsk fallback i `index.js`.

## Merkevare (kort)

- **Firma:** Bergen Byggmontering AS · org.nr 934 686 283
- **Adresse:** Torget 1, 5014 Bergen
- **Telefon:** +47 917 27 100
- **E-post:** post@bergenbyggmontering.no
