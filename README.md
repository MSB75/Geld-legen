# Geld legen – meine Geldtafel

Eigenständige Lernapp (PWA) für iPad, Tablet und Computer. Keine zusätzlichen Abhängigkeiten oder Serverprogramme.

## Auf GitHub Pages veröffentlichen

1. ZIP entpacken.
2. Die **Inhalte** des ZIP-Archivs (index.html, app.js, style.css, sw.js, manifest.webmanifest, .nojekyll sowie assets/ und icons/) in den Hauptordner eines GitHub-Repositorys hochladen.
3. Im Repository unter **Settings → Pages** die Veröffentlichung aus einem Branch einstellen, z. B. main, Ordner / (root). Änderungen speichern.
4. Die von GitHub Pages angezeigte HTTPS-Adresse öffnen.

Die Pfade sind relativ; die App funktioniert auch unter einem Repository-Unterpfad.

## Installation auf dem iPad und Offline-Nutzung

1. Die veröffentlichte HTTPS-Adresse in Safari öffnen.
2. Den ersten Ladevorgang abwarten; im Info-Fenster steht anschließend „Offline bereit“.
3. Im Teilen-Menü „Zum Home-Bildschirm“ wählen.
4. Die App über das neue Symbol starten.
5. Zum Testen den Flugmodus aktivieren und die App einmal neu öffnen. Die Tafeln und Geldbilder funktionieren ohne Internet. Die Sprachausgabe benötigt eine auf dem Gerät installierte deutsche Systemstimme; der Fragetext ist unabhängig davon immer sichtbar.

Tipp: Besonders im Querformat bleibt auf dem iPad die Geldtafel neben den Geldbildern sichtbar. In gemischten Stufen wird über die großen Euro-/Cent-Tasten zwischen beiden Tafeln gewechselt.

## Frei zählen – Zählhilfe ohne Zielbetrag

In jeder Niveaustufe stehen oben zwei Arbeitsweisen zur Auswahl:

- **Betrag wählen**: Wie bisher zuerst die Zahl in der Tafel auswählen, dann das Geld legen.
- **Frei zählen**: Direkt auf Geldstücke oder Scheine tippen. Die Zahlentafel wird aufsteigend abgedeckt und zeigt fortlaufend den gelegten Geldwert – ohne vorher einen Zielbetrag festzulegen.

Die verfügbaren Geldstücke, Stellenwert- und Übergangsregeln sowie die Tauschübungen bleiben von der gewählten Niveaustufe abhängig. Die Zahlenräume 20, 50 und 100 funktionieren auch im freien Zählmodus. „Neu zählen“ leert die Tafel. Beim Wechsel zwischen beiden Arbeitsweisen beginnt jeweils eine neue Übung.

## Tauschübung (Version 3)

- Stufe A, Zahlenraum 20, Ziel 5 Euro wählen.
- Zweimal auf die 1-Euro-Münze tippen. Die Tauschfrage erscheint automatisch und wird vorgelesen. Die zu tauschenden Felder sind gelb markiert.
- „Ja, ich versuche es“ öffnet die vergrößerte Auswahl aller verfügbaren Geldstücke.
- Die 2-Euro-Münze antippen: Sie ersetzt sofort beide 1-Euro-Münzen. Die Summe bleibt unverändert.
- Bei einer falschen Auswahl erscheint und erklingt „Das ist leider falsch. Versuche es nochmal!“. Nach dem dritten Fehler zeigt und übernimmt die App automatisch die richtige Lösung.
- Bei einem Austausch mit mehreren optimalen Geldstücken werden diese nacheinander gewählt und nach vollständiger Auswahl übernommen.
- „Später“ verschiebt eine Tauschfrage; sie bleibt über den gelben Lautsprecher aufrufbar. So kann z. B. auch die Darstellung mit fünf 1-Euro-Münzen ausprobiert werden.

Die App sucht in jeder zulässigen Stellenwertgruppe die Darstellung mit der minimalen Anzahl an Münzen und Scheinen. Die Übergangsregeln der gewählten Niveaustufe bleiben erhalten.

Nach einem Update auf GitHub die installierte App bei bestehender Internetverbindung vollständig schließen und erneut öffnen, damit der neue Offline-Cache aktiviert wird.

## Bildquelle und didaktische Vorlage

Geldabbildungen: Pictosearch-Suche. Stellenwertfarbgebung und Schwierigkeitsgrade der Tafeln: Gerhard Scheuriger, *Der sichere Umgang mit Geld*, Band 1, Persen Verlag.
