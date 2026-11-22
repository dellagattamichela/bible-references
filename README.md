# Riferimenti incrociati della Bibbia

Grafico interattivo a archi che mostra i collegamenti tra i capitoli della Bibbia (Antico e Nuovo Testamento), ispirato alla famosa visualizzazione di [Chris Harrison](https://www.chrisharrison.net/index.php/visualizations/BibleViz) e Christoph Römhild. A differenza dell’immagine statica, qui puoi **zoomare**, **spostarti** e **evidenziare** un collegamento passandoci sopra.

Ogni arco unisce due capitoli che si richiamano a vicenda. Il colore indica la distanza tra i capitoli: blu per i più vicini, rosso per i più lontani.

## Contenuto del progetto

| File | A cosa serve |
|---|---|
| `index.html` | Struttura della pagina: titolo, pulsanti, slider e area del grafico |
| `style.css` | Aspetto grafico, colori, tema chiaro e scuro, modalità schermo intero |
| `script.js` | Dati, disegno del grafico e interazioni |

Non servono installazioni né processi di build. Basta aprire `index.html` in un browser moderno (Chrome, Firefox, Safari, Edge), anche direttamente dal computer. Tutti i dati sono già dentro `script.js`, quindi la pagina non fa richieste a siti esterni.

## Come si usa

- **Zoom:** rotella del mouse, pulsanti **+** e **−**, oppure doppio clic.
- **Spostamento:** trascina il grafico con il mouse (o il dito).
- **Evidenziare un arco:** passaci sopra con il cursore. Compare il nome dei due capitoli, il numero di coppie di versetti che li collegano e i voti ricevuti.
- **Mantenere un arco evidenziato:** cliccalo. Per deselezionarlo, clicca in un punto qualsiasi che non sia un arco.
- **Tutti i collegamenti di un libro o di un capitolo:** passa il cursore sull’asse in basso. Con lo zoom compaiono i nomi dei libri e i numeri dei capitoli.
- **Filtro per tipo:** i tre pulsanti in alto scelgono quali collegamenti mostrare: tutti, solo Antico ↔ Nuovo Testamento, solo Antico Testamento ↔ Vangeli.
- **Slider dei voti:** nasconde i collegamenti con pochi voti, lasciando i più confermati. Con meno voti il grafico è più fitto, con più voti è più leggibile.
- **Schermo intero:** pulsante **⛶ Schermo intero**. Per uscire, **✕ Esci** o il tasto Esc.

## Cosa significano i numeri

I dati di partenza collegano **singoli versetti**. Per disegnare un arco tra due capitoli, tutti i collegamenti tra versetti di quei due capitoli sono raggruppati in uno solo.

- **Coppie di versetti:** quanti collegamenti tra versetti rappresenta l’arco.
- **Voti:** somma dei voti che gli utenti di OpenBible.info hanno dato a quei collegamenti. Più voti vuol dire che il legame è considerato più pertinente.

I voti misurano la pertinenza di un collegamento, non quanto riguardi Gesù.

Esempio: tra Isaia 61 e Luca 4 ci sono 7 coppie di versetti per un totale di 130 voti. Quella più votata è Isaia 61:1 ↔ Luca 4:18-19.

## I dati

- **Fonte:** [OpenBible.info – Cross References](https://www.openbible.info/labs/cross-references/), circa 340.000 riferimenti basati soprattutto sul *Treasury of Scripture Knowledge* (pubblico dominio), con voti degli utenti.
- **Licenza dei dati:** Creative Commons Attribution 4.0 ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). L’attribuzione a OpenBible.info va mantenuta se riutilizzi i dati.
- **Versione usata:** istantanea del 2016, ottenuta da un mirror su GitHub (`revans/bible_databases`, file `cross_references.txt`): 343.609 righe.
- **Differenza con il grafico originale:** il grafico di Harrison e Römhild usa un altro dataset (63.779 riferimenti), che non risulta scaricabile. I numeri e l’aspetto quindi non coincidono esattamente.

### Come sono stati preparati

1. Ogni riferimento ha un versetto di partenza e uno di arrivo (per esempio `Gen.1.1 → Isa.65.17`) più i voti. Nelle destinazioni con un intervallo (`Prov.8.22-Prov.8.30`) si usa il capitolo iniziale.
2. I riferimenti sono raggruppati per **coppia di capitoli**, senza distinguere la direzione. I collegamenti dentro lo stesso capitolo sono scartati.
3. Il risultato è di **141.763 archi**. Per ciascuno si conserva: capitolo A, capitolo B, somma dei voti, numero di coppie di versetti.
4. I capitoli sono numerati da 0 (Genesi 1) a 1188 (Apocalisse 22), nell’ordine canonico dei 66 libri.
5. I quattro valori di ogni arco sono salvati come numeri a 16 bit (little-endian) e codificati in base64, in una lunga stringa dentro `script.js`.

## Personalizzazioni utili

### Impostazioni di partenza

In `script.js`, cerca la riga lunga che inizia con `let W=0,H=0...` e modifica:

```js
scope=0,minV=20,
```

- `scope`: `0` = Tutti i riferimenti, `1` = Antico ↔ Nuovo Testamento, `2` = Antico Testamento ↔ Vangeli.
- `minV`: numero minimo di voti all’avvio.

In `index.html`, cerca lo slider (`id="rg"`) e imposta `value` allo stesso numero di `minV`, così il cursore parte nella posizione giusta. L’attributo `max` regola il valore massimo dello slider.

### Colori e tema

In `style.css` i colori sono variabili all’inizio del file (`--bg`, `--fg`, `--ot`, `--nt` e altre). Il tema scuro si attiva da solo se il dispositivo lo usa. Puoi forzarlo con `data-theme="dark"` o `data-theme="light"` sull’elemento `<html>`.

I colori degli archi sono calcolati in `script.js`, nella funzione `col`.

### Altezza degli archi

In `script.js`, la funzione `RY` calcola l’altezza di ogni arco in base alla distanza tra i capitoli. L’esponente `0.75` regola quanto gli archi lunghi si staccano da quelli corti.

## Come funziona il disegno

- Il grafico è disegnato su un elemento `<canvas>`: gli archi sono curve di Bézier, raggruppate in 12 fasce di colore.
- Quando passi il cursore, il programma controlla matematicamente quale arco è più vicino (non è disegnato nulla di nascosto). Per questo funziona anche con migliaia di archi.
- Zoom e spostamento ridisegnano il grafico, ma la selezione dei collegamenti da mostrare si ricalcola solo quando cambi filtro o slider.

## Limiti noti

- Con oltre ~20.000 archi (per esempio *Tutti i riferimenti* con pochi voti) lo spostamento può essere lento. Alza la soglia dei voti per alleggerire.
- I collegamenti sono tra capitoli, non tra versetti: l’asse non mostra il singolo versetto.
- I dati non indicano quali collegamenti riguardano Gesù. Il filtro "Antico Testamento ↔ Vangeli" è solo un’approssimazione.
- Dati fermi al 2016.
- Lo schermo intero vero non è disponibile su tutti i dispositivi (per esempio su iPhone). In quel caso la pagina occupa comunque tutta l’area visibile.

## Crediti

- Visualizzazione originale: Chris Harrison e Christoph Römhild, *Bible Cross-References*.
- Dati dei riferimenti: OpenBible.info (CC BY 4.0), basati sul *Treasury of Scripture Knowledge*.
- Codice: scegli la licenza che preferisci (per esempio MIT). I dati restano sotto CC BY 4.0.
