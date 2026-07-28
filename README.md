# Noxx Time Keeper

Erstelle aus den angehängten Dateien eine vollständig neue, funktionsfähige Web-App mit dem Namen „NOXX Time Tracker“.

WICHTIG:

Analysiere zuerst vollständig die angehängte ZIP-Datei, die HTML-Datei und den optionalen Design-Screenshot. Diese Dateien sind die verbindliche visuelle Vorlage für das Projekt.

Übernimm das Design so originalgetreu wie möglich, insbesondere:

- Farben und Farbübergänge

- Hintergrundgestaltung

- Typografie

- Karten und Container

- Buttons und Eingabefelder

- Abstände und Größenverhältnisse

- Navigation

- Icons

- Schatten, Rahmen und visuelle Effekte

- Desktop- und Mobile-Darstellung

Das angehängte Design darf nicht lediglich als HTML-Seite eingebettet, über ein iframe angezeigt oder unverändert kopiert werden. Rekonstruiere es als saubere, bearbeitbare und responsive Lovable-Anwendung mit sinnvoll getrennten Komponenten.

PROJEKTZIEL:

Der NOXX Time Tracker ist eine moderne Arbeitszeiterfassungs-App für Nutzer zwischen 18 und 40 Jahren. Die Anwendung soll professionell, intuitiv, hochwertig und einfach bedienbar wirken.

IMPLEMENTIERE FOLGENDE FUNKTIONEN:

1. Stoppuhr

- Arbeitszeiterfassung starten

- pausieren

- fortsetzen

- beenden und speichern

- große laufende Zeitanzeige im Format Stunden, Minuten und Sekunden

- optionale Beschreibung der aktuellen Tätigkeit

- laufende Zeiterfassung muss auch nach einem Neuladen der Seite korrekt weitergeführt werden

2. Manuelle Zeiterfassung

- Datum auswählen

- Startzeit eintragen

- Endzeit eintragen

- Pausenzeit eintragen

- Tätigkeit oder Beschreibung hinzufügen

- tatsächliche Arbeitszeit automatisch berechnen

- Eingaben validieren und ungültige Zeiten verständlich kennzeichnen

3. Zeitübersichten

- Arbeitszeit für heute

- Arbeitszeit für die aktuelle Woche

- Arbeitszeit für den aktuellen Monat

- Werte automatisch aus den gespeicherten Einträgen berechnen

4. Kalender

- übersichtliche Kalenderdarstellung

- Tage mit vorhandenen Einträgen markieren

- nach Auswahl eines Tages alle dazugehörigen Zeiteinträge anzeigen

- Navigation zwischen Zeiträumen ermöglichen

5. Zeiteinträge

- alle gespeicherten Einträge anzeigen

- Datum, Tätigkeit, Startzeit, Endzeit, Pause und Gesamtdauer darstellen

- Einträge bearbeiten

- Einträge löschen

- vor dem Löschen eine Bestätigung verlangen

- sinnvollen leeren Zustand anzeigen, wenn noch keine Einträge existieren

6. CSV-Export

- alle gespeicherten Arbeitszeiteinträge als funktionierende CSV-Datei exportieren

- verständliche Spaltenbezeichnungen verwenden

- Datum, Startzeit, Endzeit, Pause, Tätigkeit und Gesamtdauer exportieren

DATENSPEICHERUNG:

Erstelle zunächst eine Version ohne Benutzerkonto und ohne kostenpflichtige externe Dienste.

Speichere die Daten lokal und dauerhaft im Browser, sodass sie nach dem Schließen oder Neuladen der Seite weiterhin vorhanden sind. Strukturiere den Code trotzdem so, dass später eine Datenbank und ein Benutzerkonto ergänzt werden können.

TECHNISCHE UND QUALITATIVE ANFORDERUNGEN:

- vollständig responsive für Desktop, Tablet und Smartphone

- gut lesbare Texte und ausreichende Kontraste

- konsistente wiederverwendbare Komponenten

- verständliche Fehlermeldungen

- keine funktionslosen Buttons

- keine Platzhalterfunktionen

- keine unnötigen Beispiel- oder Testdaten

- bestehende Gestaltung aus den angehängten Dateien nicht eigenmächtig durch ein anderes Design ersetzen

- Animationen nur dezent einsetzen

- saubere und wartbare Projektstruktur

- keine sichtbaren Fehler in der Browser-Konsole

Erstelle zunächst die vollständige App auf Grundlage des angehängten Designs. Prüfe danach selbstständig alle zentralen Abläufe und korrigiere auftretende Fehler, bevor du die Umsetzung als abgeschlossen betrachtest.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://noxx-time-scribe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b90abd6f-5b78-46a0-b774-6d8c4376fb3e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
