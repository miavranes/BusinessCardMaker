# Business Card Maker - Taskovi

## 1. Početna Stranica (Home Page)

- [x] Kreirati Home.jsx komponentu
- [x] Dodati hero sekciju sa opisom aplikacije
- [ ] Napraviti galeriju primera vizit karti
- [x] Kreirati prikaz šablona
- [x] Organizovati šablone po kategorijama (modern, elegantan, minimalistički, kreativni)
- [x] Dodati routing između Home i Editor stranica
- [x] Stilizovati Home page (Home.css)

## 2. Šabloni (Templates)

- [x] Kreirati templates.js fajl sa definicijama
- [ ] Napraviti minimum 4 šablona po kategoriji
- [x] Implementirati filtriranje po kategorijama
- [x] Dodati funkcionalnost učitavanja šablona u Editor
- [x] Stilizovati galeriju šablona

## 3. Napredne Opcije za Tekst

- [x] Dodati underline opciju
- [x] Implementirati poravnanje teksta (left, center, right)
- [x] Dodati bullet liste
- [x] Implementirati text shadow efekat
- [x] Dodati text stroke/outline
- [ ] Implementirati zakrivljeni tekst (curve text)

## 4. Slike i Logotipi

- [x] Dodati "Add Image" dugme
- [ ] Implementirati file upload za slike (PNG, JPG, JPEG, SVG)
- [ ] Dodati "Add Logo" dugme
- [x] Implementirati prikaz slika na Canvas-u
- [x] Dodati kontrole za resize slika
- [ ] Validacija formata fajlova

## 5. Grafički Elementi

- [x] Kreirati biblioteku grafičkih elemenata
- [x] Dodati "Graphics" dugme u Navbar
- [x] Implementirati dodavanje grafike na Canvas
- [x] Omogućiti promenu boje i veličine grafike

## 6. QR Kod

- [ ] Instalirati qrcode biblioteku
- [ ] Kreirati QRCodeModal komponentu
- [ ] Dodati formu za kontakt info (ime, telefon, email, website)
- [ ] Implementirati generisanje QR koda
- [ ] Dodati QR kod na Canvas kao sliku
- [ ] Omogućiti resize QR koda

## 7. Layering (Slojevi)

- [x] Dodati layer kontrole (Move Forward, Move Back, To Front, To Back)
- [x] Implementirati moveForward funkciju
- [x] Implementirati moveBackward funkciju
- [x] Implementirati bringToFront funkciju
- [x] Implementirati sendToBack funkciju
- [x] Ažurirati Canvas da poštuje z-index

## 8. Dupliciranje

- [ ] Dodati "Duplicate" dugme
- [ ] Implementirati kloniranje elementa
- [ ] Dodati offset za duplicirani element
- [ ] Automatski selektovati duplicirani element

## 9. Undo/Redo

- [ ] Implementirati history state (max 20 koraka)
- [ ] Dodati Undo dugme
- [ ] Dodati Redo dugme
- [ ] Implementirati Ctrl+Z i Ctrl+Y shortcuts
- [ ] Ažurirati history pri svakoj promeni

## 10. Animacije

- [ ] Dodati animation kontrole u editor
- [ ] Implementirati animation types (fade, slide, zoom, rotate)
- [ ] Dodati kontrole za duration i delay
- [ ] Čuvati animation properties u elementima
- [ ] Implementirati CSS animations za preview

## 11. Preview Mode

- [ ] Dodati "Preview" dugme
- [ ] Sakriti sve kontrole u preview mode-u
- [ ] Reprodukovati sve animacije
- [ ] Dodati "Exit Preview" dugme
- [ ] Prikazati Canvas u realnoj veličini

## 12. Čuvanje (Save)

- [ ] Implementirati čuvanje u localStorage
- [ ] Dodati "Save" dugme
- [ ] Dodati auto-save (svake 30 sekundi)
- [ ] Učitati poslednji dizajn pri otvaranju
- [ ] Dodati indikator "Saved" / "Unsaved"

## 13. Izvoz (Export)

- [ ] Dodati "Export" dugme
- [ ] Kreirati ExportModal sa opcijama formata
- [ ] Implementirati izvoz u PNG (300 DPI)
- [ ] Implementirati izvoz u JPG (300 DPI)
- [ ] Instalirati jsPDF biblioteku
- [ ] Implementirati izvoz u PDF
- [ ] Dodati download funkcionalnost

## 14. Responsivnost

- [x] Dodati media queries za mobilne (<768px)
- [x] Prilagoditi Navbar za mobilne (hamburger menu)
- [x] Dodati media queries za tablet (768px-1024px)
- [x] Prilagoditi Canvas za različite ekrane
- [ ] Testirati na mobilnim i tablet uređajima

## 15. Keyboard Accessibility

- [ ] Implementirati tab navigation
- [ ] Dodati keyboard shortcuts (Delete, Ctrl+D, Arrow keys)
- [ ] Dodati focus indicators
- [ ] Implementirati Escape za zatvaranje modala
- [ ] Dodati aria-labels

## 16. WCAG Compliance

- [ ] Proveriti kontrast boja (minimum 4.5:1)
- [ ] Ažurirati boje koje ne zadovoljavaju standarde
- [ ] Dodati alt text za slike
- [ ] Testirati sa screen reader-om

## 17. Poliranje

- [ ] Testirati sve funkcionalnosti
- [ ] Optimizovati Canvas renderovanje
- [ ] Popraviti bugove
- [ ] Dodati error handling za uploads
- [ ] Dodati loading indicators

## 18. Deployment

- [ ] Ažurirati README.md
- [ ] Dodati komentare u kod
- [ ] Kreirati production build
- [ ] Testirati build
- [ ] Deploy na Vercel/Netlify
