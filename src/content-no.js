module.exports = {
  fileTitle: "Nexa mot Bitcoin og Ethereum",
  footer: "Nexa · 2026",

  title: {
    brand: "NEXA",
    headline: "Energieffektive penger i internettskala",
    sub: "Hva som skiller Nexa fra Bitcoin og Ethereum",
    place: "Norge · 2026",
    name: "Jørgen S. Notland",
    cred1: "Informatikk og NTNUs Entreprenørskole, NTNU",
    cred2: "Underviser i Bitcoin og Nexa blokkjede ved University of Exeter",
    notes: "Presenter deg kort: informatikk og NTNUs Entreprenørskole i Trondheim, og at du underviser i Bitcoin og Nexa blokkjede ved University of Exeter. For dette publikummet betyr NTNU-koblingen noe: miljøforskningen på slide 6 kommer fra ditt eget universitet. Åpning. Presentasjonen er skrevet for et skeptisk publikum. Den første innholdssliden innrømmer kritikken før den besvares. Kilder for hvert tall ligger i notatene til hver slide.",
  },

  critique: {
    title: "Kritikken av krypto er stort sett riktig",
    cards: [
      { label: "Energi", desc: "Bitcoin brenner rundt 140 TWh i året, omtrent hele Norges strømforbruk, for å behandle rundt 7 transaksjoner i sekundet." },
      { label: "E-avfall", desc: "Bitcoin-ASIC-er gjør én jobb, er utdaterte etter omtrent 1,3 år og skaper rundt 30 700 tonn elektronisk avfall i året." },
      { label: "Finansialisering", desc: "Premine, ICO-er og staking-avkastning gir gevinsten til innsidere. NFT-gassauksjoner gjør en enkel gjenstand til et spekulasjonsmarked." },
    ],
    tagline: "Nexa ble designet fra starten for å unngå alle tre. Slik.",
    notes: "Innrøm først. Energi: Cambridge CBECI live-anslag 138 TWh/år, Digiconomist ~204 TWh/år; Norges nasjonale forbruk er rundt 140 TWh/år. E-avfall: de Vries & Stoll (2021), 30,7 kt/år, ASIC-levetid 1,29 år, 272 g per transaksjon. Finansialisering: Ethereums 72M ETH ved genesis og innsatsvektet belønning; NFT-utstedelse på Ethereum L1 har historisk kostet titalls dollar i gass.",
  },

  perTx: {
    title: "I stor skala er Nexa inntil 13 000× mer energieffektiv enn Bitcoin",
    stats: [
      { name: "BITCOIN", value: "580 kWh", label: "per transaksjon · to ukers strømforbruk for en husholdning" },
      { name: "NEXA I DAG", value: "0,104 kWh", label: "ved 42 000 TPS målt · rundt 5 600× mindre" },
      { name: "NEXA + BLITZ", value: "0,044 kWh", label: "ved 100 000 TPS anslått · to mobilladinger" },
    ],
    points: [
      "Minerne brenner det blokkbelønningen betaler for, enten kjeden bærer 10 eller 10 millioner transaksjoner. Energi per transaksjon er derfor rett og slett nettverkets strømforbruk delt på gjennomstrømningen.",
      "Bitcoin: 138 TWh i året ved 7,5 TPS gir 580 kWh per transaksjon. Samme strøm på Nexa ved 42 000 TPS gir 0,104 kWh; ved 100 000 TPS med Blitz, 0,044 kWh.",
      "Bitcoins protokoll stopper ved 7 til 14 TPS. Selv på sin travleste dag noensinne trengte den 425 kWh per transaksjon. Gapet kan aldri bli mindre enn rundt 1 000×.",
    ],
    notes: "Metode fra Medium-artikkelen «Nexa is 13,000x more energy efficient than Bitcoin» (sept. 2026): kWh per transaksjon = 4 376 / TPS ved 138 TWh/år. Bitcoin 7,5 TPS -> 580 kWh; travleste dag 10,3 TPS -> 425 kWh. Nexa 42 000 TPS er en benchmark på dagens maskinvare; 100 000 med Blitz er et anslag. Vær tydelig på at dette er en kapasitetssammenligning ved lik nettverkseffekt. Kilder: Cambridge CBECI, Digiconomist, Blockchair.",
  },

  chart: {
    title: "Samme joule, ulik nevner",
    caption: "kWh per transaksjon = 4 376 \u00f7 TPS ved 138 TWh/år (Cambridge CBECI). Begge kjedene får samme nettverksstrøm, så linjene skiller seg bare i gjennomstrømning. Nexas 42 000 TPS er målt; 100 000 med Blitz er et anslag.",
    notes: "Grafen er gjenskapt fra det interaktive artefaktet «The Denominator Chart» (claude.ai/artifact/QTRwhPcMUUQ6PwhibYYbQ2), der du også kan bytte til Digiconomists 204 TWh/år. Slik leses den: én teller, minerne brenner det blokkbelønningen betaler for, så nettverksstrømmen er den samme for begge linjene. Bitcoins nevner står fast: gjennomstrømningen har ligget nær 7 TPS siden 2010 og protokollen begrenser den til 7 til 14, så mer etterspørsel gir lengre kø, ikke flere transaksjoner. Nexas nevner vokser: samme joule delt på 42 000 TPS blir 5 600× tynnere enn Bitcoin i dag, og 13 000× ved 100 000 TPS med Blitz. Forholdet avhenger ikke av hvilket strømanslag du tror på. Bitcoins travleste dag noensinne, 10,3 TPS, ville ligget på 425 kWh per transaksjon; det teoretiske taket på 14 TPS på 313. Kilder: Cambridge CBECI, Digiconomist, Blockchair, 2026.",
  },

  absolute: {
    title: "Nexa kan bruke like mye strøm som Bitcoin hvis mange nok miner. I stor skala er den langt mer energieffektiv",
    cols: [
      { name: "Bitcoin", head: "≈ 16 GW for rundt 7 TPS", desc: "Minerne på enhver proof-of-work-kjede brenner omtrent det blokkbelønningen er verdt, uavhengig av bruk. Cambridges anslag for 2026 er 16 GW, omtrent Norges gjennomsnittlige nettlast, for å bære 7 transaksjoner i sekundet." },
      { name: "Ethereum", head: "≈ 0,3 MW med proof of stake", desc: "Rundt 0,0026 TWh i året siden The Merge. Energi er reelt løst på Ethereum. Avveiningene der handler om fordeling og kompleksitet, som dekkes senere i presentasjonen." },
      { name: "Nexa", head: "Megawatt i dag, gigawatt hvis den vinner", desc: "Nexa er også proof of work. I dag rundt 5 til 15 MW med GPU-er; verdsatt som Bitcoin ville minerne brukt like mye som Bitcoins. Forskjellen: den strømmen ville båret 42 000 til 100 000 transaksjoner i sekundet, ikke 7." },
    ],
    notes: "Vær ærlig: proof-of-work-energi følger myntens verdi, ikke bruken, og det gjelder Nexa like mye som Bitcoin. Var Nexa like verdifull som Bitcoin, ville minerne trolig brukt like mye på strøm. Påstanden er ikke at Nexa er liten, men at samme strøm gjør tusenvis av ganger mer arbeid. Bitcoin: CBECI-anslag aug. 2026 16,09 GW / 141 TWh per år. Norge bruker ~140 TWh/år = ~16 GW i snitt. Ethereum: ethereum.org, ~0,0026 TWh/år = ~0,3 MW i snitt. Nexa i dag: nettverkshashrate 2,5 til 4,8 TH/s (2Miners, Kryptex, 2026); et RTX 4090 gjør ~203 MH/s ved ~306 W. 4,84 TH/s / 0,66 MH/W = ~7 MW; eldre kort er mindre effektive, derav 5 til 15 MW.",
  },

  ntnu: {
    title: "NTNU-forskning: den grønneste kilowattimen er den du aldri trenger",
    cards: [
      { label: "Ren kraft koster fortsatt natur", desc: "Borgelt m.fl., NTNU (2026): utbyggingen av vind, sol og nett som Norge trenger innen 2050 kan øke habitattapet med inntil 28 %. Det mest effektive vernet er «å redusere strømetterspørselen gjennom energieffektivisering»." },
      { label: "Ingen kilowattime er gratis", desc: "Hertwich, Gibon m.fl., NTNU (PNAS 2014): den første globale livsløpsanalysen av fornybar kraft. Vann, vind og sol slår fossilt med god margin, men har fortsatt areal-, material- og utslippsavtrykk." },
      { label: "Effektivisering er «det første drivstoffet»", desc: "HighEFF, SINTEF/NTNUs senter for energieffektivisering: Norge forpliktet seg på COP28 til energieffektivisering som «first fuel», «et konfliktfritt tiltak som frigjør energi til andre formål». En betalingsrail som gjør 13 000× mer per kWh er nettopp det." },
    ],
    citation: "Borgelt, Gilad, May & Verones, «Renewable energy growth amplifies land pressure on Norwegian biodiversity», Cleaner Energy Systems 13 (2026) · Hertwich m.fl., «Integrated life-cycle assessment of electricity-supply scenarios», PNAS (2014) · HighEFF på NTNU Energy Transition Week (2024)",
    notes: "Hvorfor denne sliden: arrangørenes innvending er miljømessig, så svaret bør komme fra norsk miljøforskning, ikke fra kryptomiljøet. Borgelt J., Gilad D., May R., Verones F. (2026), Cleaner Energy Systems vol. 13, NTNU Industrial Ecology Programme: seks scenarioer for Norges kraftutbygging mot 2050; habitattap inntil +28 %; vind har størst potensial for nytt habitattap, overføringsnettet nest størst; sitat fra NTNUs pressemelding (mai 2026): den mest effektive måten å redusere naturtap vesentlig på er å senke strømetterspørselen gjennom energieffektivisering. Hertwich E.G., Gibon T. m.fl. (2014), PNAS 112(20): 6277-6282, publisert på nett okt. 2014, NTNU: global LCA av kraftforsyning mot 2050; lavkarbonteknologier har langt lavere påvirkning enn fossilt, men ikke null areal-, material- og utslippsavtrykk. HighEFF (FME-senter ledet av SINTEF Energi med NTNU), NTNU Energy Transition Week 2024: EUs «energy efficiency first»-prinsipp; Norges COP28-løfte om å sette energieffektivisering som «first fuel» i kjernen av politikkutforming; direktør Petter Røkkes sitat om «konfliktfritt tiltak». Støtte: Sandberg m.fl. (SINTEF/NTNU) anslår 12,7 TWh (2030) til 21,3 TWh (2050) sparepotensial i norske bygg; Energikommisjonen (NOU 2023:3, «Mer av alt – raskere») kaller effektivisering den raskeste, billigste og minst naturødeleggende måten å tette kraftgapet på. Koblingen: ved lik strøm gjør Nexa tusenvis av ganger flere betalinger enn Bitcoin, som er nettopp den typen reduksjon i etterspørsel per enhet verdi disse forskerne ber om.",
  },

  ewaste: {
    title: "Ingen spesialbygd maskinvare, ingen fjell av e-avfall",
    cards: [
      { label: "Bitcoin: ASIC-er bygget for å kastes", desc: "En Bitcoin-ASIC regner SHA-256 og ingenting annet. Den er utdatert etter omtrent 1,3 år: 30 700 tonn e-avfall i året, 272 gram per transaksjon, omtrent vekten av en iPhone." },
      { label: "Nexa: vanlige skjermkort", desc: "NexaPoW er GPU-vennlig på NVIDIA- og AMD-kort. Et kort som slutter å mine går tilbake til spilling, KI eller rendering. Ingenting i nettverket er bygget for å kastes." },
      { label: "Neste: omprogrammerbare FPGA-er", desc: "Blitz er et FPGA-kort som verifiserer signaturer for noden. FPGA-er omprogrammeres, de byttes ikke ut, og NexaPoWs mining-arbeid er den samme signaturmatematikken kjeden uansett trenger." },
    ],
    notes: "E-avfallstall: de Vries & Stoll, «Bitcoin's growing e-waste problem», Resources, Conservation & Recycling (2021). NexaPoW kombinerer SHA-256 med Schnorr-signering, bevisst, slik at spesialisert maskinvare også akselererer signaturvalidering (spec.nexa.org/mining/NexaPOW). Blitz: FPGA-motor for signaturverifisering annonsert nov. 2024, under utvikling og testing gjennom 2026 (Nexas nyhetsbrev juli 2026). Ærlig forbehold: GPU-mining bruker fortsatt maskinvare; poenget er gjenbruk, ikke null fotavtrykk.",
  },

  fair: {
    title: "Rettferdig start: null premine, null ICO, null venturekapital",
    cols: [
      { name: "Bitcoin", head: "Rettferdig i 2009, stengt i dag", desc: "Den første millionen mynter ble utvunnet på vanlige PC-er. En nykommer i 2026 konkurrerer med industrielle ASIC-farmer på subsidiert kraft. Døren er bare åpen i teorien." },
      { name: "Ethereum", head: "72 millioner ETH skapt ved genesis", desc: "Rundt 60 % av dagens tilbud fantes før nettverket gjorde det, det meste solgt i en ICO i 2014. Innsiderne fikk betalt før første blokk." },
      { name: "Nexa", head: "0 premine, 0 teammynter, 0 VC-er", desc: "Lansert 21. juni 2022. Hele tilbudet på 21 billioner utvinnes offentlig på GPU-er, og nettverket er fire år gammelt, ikke sytten. Sene deltakere er fortsatt tidlig ute." },
    ],
    notes: "Nexa: nexa.org, «Nexa was 100% fair launched, with no team coins, no premine, and no VCs, and 100% of its supply will be mined via Proof of Work.» Lansert 21. juni 2022. Ethereum: 72M ETH ved genesis (rundt 60M solgt i crowdsale i 2014, 12M til stiftelsen og tidlige bidragsytere); sirkulerende tilbud ~120M ETH, altså omtrent 60 %. Bitcoin: anslag på ~1M BTC utvunnet av Satoshi i 2009-2010. Merk: engelsk «21 trillion» = 21 billioner på norsk.",
  },

  scale: {
    title: "Skala: 42 000 transaksjoner i sekundet på dagens maskinvare",
    stats: [
      { name: "BITCOIN", value: "≈ 7 TPS", label: "uendret siden 2010 · hardt begrenset av blokkstørrelsen" },
      { name: "ETHEREUM L1", value: "≈ 26 TPS", label: "daglig snitt 1. kvartal 2026 · brukerne skyves til lag 2" },
      { name: "NEXA", value: "42 000 TPS", label: "målt · 100 000 anslått med Blitz" },
    ],
    points: [
      "Bitcoin har båret rundt 7 TPS siden 2010. Ethereums grunnlag lå på 26 TPS i snitt tidlig i 2026 og lener seg på lag 2-nettverk, hvert med egen bro, egne gebyrer og egne tillitsforutsetninger.",
      "Nexa er en UTXO-kjede: hver transaksjon valideres uavhengig og parallelt, så gjennomstrømningen vokser med maskinvaren, ikke med komitévedtak.",
      "De to reelle flaskehalsene, signatursjekk og UTXO-oppslag, flyttes fra CPU-en til Blitz-FPGA-er. De samme kortene tar senere unna postkvante-signaturer, som er 10 til 40 ganger større.",
    ],
    notes: "42 000 TPS er en Nexa-benchmark; nexa.org oppgir «>60,000 TPS». 100 000 med Blitz er et anslag. Ethereum: daglig snitt på mainnet 25,78 TPS i 1. kvartal 2026 (ethereum.org, «Building on Ethereum in 2026»); gassgrense 60M, med planer om å heve den videre. Postkvante-signaturstørrelser fra artikkelen: Schnorr 64 byte, Falcon 666, Dilithium 2 420.",
  },

  payments: {
    title: "Betalinger som føles som Vipps: under to sekunder, rundt 3 NEXA (under 0,0001 dollar)",
    cards: [
      { label: "Umiddelbart", desc: "Nullbekreftelses-betalinger sikret med bevis mot dobbeltforbruk bekreftes på under to sekunder. Blokker kommer hvert andre minutt, og etter Hard Fork 2 gir Tailstorm en proof-of-work-støttet underblokk hvert sekund." },
      { label: "Nesten null gebyr", desc: "En vanlig transaksjon betaler rundt 3 NEXA i gebyr, omtrent 0,000004 dollar med dagens kurs og en brøkdel av et øre. Sammenlign med gebyrer målt i dollar på Bitcoin og gassauksjoner på Ethereums grunnlag." },
      { label: "Nye typer betalinger", desc: "Mikrobetalinger, økonomier i spill og maskin-til-maskin-betalinger som kortnettverk, Bitcoin og Ethereum ikke kan prise. Energieffektive penger som også fungerer som kontanter." },
    ],
    notes: "Tailstorm (spec.nexa.org/blocks/tailstorm): etter Hard Fork 2 støttes hver to-minutters oppsummeringsblokk av 120 underblokker, omtrent én i sekundet, som gir et sannsynlig, energistøttet signal om inkludering innen ett sekund og jevnere inntekt for minere; selve hovedboken gjøres fortsatt opp av to-minutters-kjeden. Gebyrtall fra explorer.nexa.org 15. sept. 2026: nettverkets gebyrsats er 1 satoshi per byte, og en enkel transaksjon er 250 til 320 byte, altså 2,5 til 3,2 NEXA (100 satoshi = 1 NEXA). Med explorerens kurs på 0,0000013 dollar per NEXA blir det rundt 0,000004 dollar, omtrent 0,004 øre. Oppdater kursen før du presenterer. nexa.org: «confirms in under two seconds with near-zero fees», «under $0.0001 per transaction». Nullbekreftelse med bevis mot dobbeltforbruk er Bitcoin Unlimited-teknologi videreført i Nexa. Vipps-referansen: Norge er nesten kontantløst; poenget er at brukeropplevelsen nordmenn forventer allerede er grunnlinjen her.",
  },

  tokens: {
    title: "Tokens og NFT-er er bygget inn i protokollen, ikke skrudd på utenpå",
    cards: [
      { label: "Innebygd, ikke en kontrakt", desc: "Gruppetokens er en primitiv i selve kjeden. Ingen smartkontrakt betyr ingen kontraktfeil å utnytte, som er der de fleste Ethereum-tokenhack kommer fra." },
      { label: "En brøkdel av et øre å utstede", desc: "Utstedelse er en vanlig transaksjon som koster noen få NEXA, uten gassauksjon, så en NFT trenger ikke et spekulasjonsmarked for å rettferdiggjøre at den finnes. Den kan rett og slett være en billett, en nøkkel eller en gjenstand i et spill." },
      { label: "Bygget for nytte", desc: "Billetter, gjenstander i spill, sertifikater, identitet: selve gjenstanden, overførbar og verifiserbar for alle, i stedet for et veddemål på gjenstanden." },
    ],
    notes: "spec.nexa.org/tokens/grouptokens: «Groups implement native tokens; that is, the tokens are a fundamental primitive in the blockchain rather than implemented as a smart contract or in a layer 2 data-carrier protocol.» Møt NFT-kritikken direkte: spekulasjonen arrangørene beskriver er et produkt av knapphet pluss høy utstedelseskostnad pluss markedsføring. Nexa fjerner kostnaden og kontraktrisikoen; om en gjenstand blir spekulativ er da opp til spilldesigneren, ikke kjeden.",
  },

  batons: {
    title: "Utstedelsesretten er også en mynt: autoritetsbatonger",
    cards: [
      { label: "Autoriteten ligger i en UTXO", desc: "En tokengruppes rettigheter, MINT, MELT, SUBGROUP, RESCRIPT og BATON, er flagg på et eget output. Å utstede tokens betyr å bruke en MINT-autoritet i en transaksjon som skaper de nye tokenene. Ingen admin-nøkkel inne i en kontrakt, ingen owner()-funksjon å hacke." },
      { label: "Send batongen som en hvilken som helst mynt", desc: "BATON er retten til å lage nye autoriteter. Del batongen i en pool av rene MINT-autoriteter, gi en partner én som kan utstede men aldri destruere, og hold selve batongen kald. Brukt som read-only input gir en batong rettighetene sine uten å bli brukt opp." },
      { label: "Eller gi den til en smartkontrakt", desc: "Betal en autoritet inn i en skriptmal-kontrakt, så bestemmer kontraktens regler når tokens utstedes: mint-on-demand der NFT-en først skapes når kjøperen betaler, eller en covenant som bare lar autoriteten fortsette inne i samme kontrakt. Mister du kontrollen over et autoritets-output, mister du utstedelsen." },
    ],
    notes: "Kilde: spec.nexa.org/tokens/grouptokens og token-biblioteket i libnexakotlin. Autoritets-outputs bærer en negativ fortegn-og-størrelse-verdi i mengdefeltet med flaggbitene AUTHORITY, MINT, MELT, BATON, RESCRIPT og SUBGROUP. Utstedelse er å bruke en MINT-autoritet; destruksjon krever MELT; SUBGROUP lager undergrupper (NFT-er og SFT-er under en forelder). BATON er hovedretten til å lage nye autoriteter, så rutinemessig utstedelse bør bruke en ren MINT-autoritet og bevare batongen; lommebøker holder en pool av ledige MINT-autoriteter så samtidige utstedelser ikke slåss om én UTXO. Autoriteter er vanlige outputs: betal én til en annen adresse for å delegere, eller til en kontrakts låseskript så kontrakten styrer utstedelsen (mint-on-demand som en halvsignert transaksjon kjøperen finansierer). Read-only inputs (spec.nexa.org/script/read-only-inputs) lar en BATON-autoritet gi rettigheter til en transaksjon uten å bli brukt. Kontrast: ERC-20-utstedelse er en privilegert funksjon beskyttet av en eiernøkkel inne i kontrakten; på Nexa er retten en mynt du kan dele, sende, låse eller destruere.",
  },

  capd: {
    title: "Open outcry-handel over CAPD: rop ut et tilbud, hvem som helst kan ta det",
    cards: [
      { label: "Rop tilbudet ut til nettverket", desc: "CAPD (Counterparty and Protocol Discovery) er en meldingsbuss som bæres av de samme nodene som videresender transaksjoner. Du kringkaster et halvsignert tilbud, si 100 tokens for 5\u00a0000 NEXA, og alle noder sender det videre, som en megler som roper ut en pris på gulvet." },
      { label: "Ingen børs, ingen ordrebok-server", desc: "Den som vil ha handelen, fullfører den halvsignerte transaksjonen og kringkaster den. Byttet gjøres opp på kjeden i én atomisk transaksjon, uten børs, noteringsgebyr eller matchingserver imellom. Bitcoin har ikke noe slikt lag; på Ethereum krever det en DEX-kontrakt og gass per handel." },
      { label: "Proof of work i stedet for gebyr, så forsvinner det", desc: "Avsenderen løser et lite proof of work i stedet for å betale gebyr, og det holder spam ute. Tilbud er flyktige: de faller ut av videresendingen etter rundt ti minutter om de ikke sendes på nytt, kan trekkes tilbake tidlig, og rører aldri blokkjeden før noen tar dem." },
    ],
    notes: "CAPD er unikt for Nexa: en desentralisert, proof-of-work-begrenset, flyktig meldingsbuss på P2P-nettverket (spesifikasjon: spec.nexa.org/network/capd). Open outcry: børsgulv-modellen der tilbud ropes ut offentlig og hvem som helst kan ta dem. Mekanikk: tilbudet er en delvis signert transaksjon; det annonserte sammendraget (hvilken token for hvilken) er bare veiledende, den halvsignerte transaksjonen er det som gjelder, så en løgnaktig annonse er ufarlig: den som tar tilbudet får nøyaktig det transaksjonen sier, ellers er den ugyldig. Meldinger har opprettelsestid og utløp, videresendingsprioriteten faller til null etter rundt 600 sekunder, og en tilbakekallingshash lar avsenderen trekke tilbudet tidlig. Bruk: token- og NFT-markedsplasser uten markedsplassoperatør, handel med gjenstander i spill, atomiske bytter, oppretting av multisig-lommebøker og signeringsrunder. Kontrast: Bitcoin har ikke noe oppdagelseslag, så handel betyr sentraliserte børser; Ethereum trenger en DEX-kontrakt på kjeden og betaler gass for hver ordre og handel.",
  },

  secrets: {
    title: "Token Secrets: selg hemmeligheten sammen med tokenet",
    cards: [
      { label: "En token som bærer en hemmelighet", desc: "Tokenet forplikter seg til den offentlige nøkkelen til en hemmelighet, en privat EC-nøkkel, ved utstedelse eller i selve gruppe-ID-en. Den som holder tokenet, holder hemmeligheten: en spillnøkkel, en billett, nøkkelen til kryptert innhold." },
      { label: "Avslørt for kjøperen, skjult for alle andre", desc: "Overføringstransaksjonen gjør en Diffie-Hellman-nøkkelutveksling, så hemmeligheten leveres kryptert til kjøperen inne i transaksjonen. Den offentlige kjeden lekker ingenting, og kjeden verifiserer at det er den ekte hemmeligheten, så selgeren kan ikke bytte den ut med en falsk." },
      { label: "Atomisk bytte, ikke DRM", desc: "Token og hemmelighet skifter eier i samme transaksjon, uten en betrodd mellommann. Selgeren kjenner fortsatt hemmeligheten etterpå, så dette sikrer byttet, ikke kopibeskyttelsen. Bitcoin og Ethereum har ingen tilsvarende primitiv." },
    ],
    notes: "Kilde: spec.nexa.org/tokensecret (Token Secrets, også kalt Atomic Secret Exchange, ASE, og grunnlaget for private NFT-er). Kravene protokollen oppfyller: overføringen avslører hemmeligheten for mottakeren samtidig med tokenet; transaksjonen avslører ingenting for tredjeparter selv om den ligger på en offentlig kjede; mottakeren eller kjeden verifiserer at den kommuniserte hemmeligheten stemmer med den tokenet forpliktet seg til. Mekanikk: hemmeligheten må være en privat EC-nøkkel med offentlig nøkkel forpliktet i utstedelsen eller gruppe-ID-en; Alice og Bob bygger en halvtransaksjon der Bobs input krever to signaturer, én fra hemmelighetens nøkkel og én fra en nøkkel bare Bob har; en ECDH-delt hemmelighet krypterer den private nøkkelen til Bob. Forbehold fra spesifikasjonen: etter overføringen kjenner Alice fortsatt nøkkelen, så dette passer for salg av tilgang til innhold der perfekt DRM er urealistisk; verdien er verifisering mot utbytting under handelen.",
  },

  usecases: {
    title: "Hva du kan bygge med det: praktiske bruksområder",
    cards: [
      { label: "Tokens og batonger", desc: "Et spillstudio utsteder gjenstandene sine som native tokens og holder batongen kald. Butikken i spillet holder en ren MINT-autoritet i en mint-on-demand-kontrakt, så sverdet finnes først når spilleren har betalt. Et sesongpass er en undergruppe som destrueres etter sesongen; en festival gir et partnersted en MINT-autoritet for sin egen billettkvote." },
      { label: "CAPD open outcry", desc: "Et spiller-til-spiller-marked for gjenstander uten markedsplassoperatør: selgere kringkaster halvsignerte tilbud, kjøpere tar dem, og byttet gjøres opp atomisk. En billettbørs der en covenant setter tak på videresalg til pålydende. En lokal tavle for NEXA mot tokens på en meetup eller et LAN, som bare trenger nodene." },
      { label: "Token Secrets", desc: "En spillnøkkel levert inne i kjøpstransaksjonen: kjøperen får tokenet og lisensnøkkelen i ett steg, og ingen andre kan lese den. Kryptert DLC eller en artikkel bak betalingsmur der tokenet bærer dekrypteringsnøkkelen. En konsertbillett som bærer dørkoden, avslørt bare for innehaveren." },
    ],
    notes: "Dette er designmønstre, ikke produkter; hvert av dem bygger på en primitiv fra de forrige slidene. Tokens og batonger: native gruppetokens (spec.nexa.org/tokens/grouptokens), rene MINT-autoriteter delt fra batongen, mint-on-demand som en halvsignert transaksjon kjøperen finansierer, undergrupper for sesonger eller utgaver, MELT for å avvikle dem. CAPD: halvsignerte tilbud kringkastet på meldingsbussen og fullført av den som tar dem (spec.nexa.org/network/capd); tak på videresalg er en covenant i tokenets skriptmal. Token Secrets: tokenet forplikter seg til en hemmelighets offentlige nøkkel, og overføringen avslører den for kjøperen via ECDH (spec.nexa.org/tokensecret). Dette er svaret på arrangørenes bekymring for finansialisering: hvert eksempel er noe folk bruker, priset i brøkdeler av et øre, uten børs, markedsplassoperatør eller gassmarked imellom.",
  },

  contracts: {
    title: "Smartkontrakter uten EVM",
    cards: [
      { label: "Skriptmaler", desc: "Kontrakter er små, deterministiske skript knyttet til mynter og valideres parallelt som enhver annen transaksjon. Det finnes ingen global tilstandsmaskin å tette igjen." },
      { label: "Ingen EVM-overhead", desc: "Intet gassmarked, ingen reentrancy-feilklasse, ingen gebyrhopp for alle når én app blir populær. Kontrakter kjører i de samme 42 000 TPS som vanlige betalinger." },
      { label: "En hel plattform", desc: "Lommebokinnlogging med identitet på kjeden, betalingsforespørsler til brukerens lommebok og peer-to-peer-meldinger er del av stacken, med Kotlin- og JavaScript-biblioteker." },
    ],
    notes: "nexa.org: «Native on-chain programmability without EVM complexity», «No EVM overhead». Utviklerstacken: Wally-lommebok, TDPP-betalingsprotokoll, nexid-identitet, CAPD-meldinger, NexaJS og libnexakotlin. Hold denne sliden kort for et ikke-teknisk publikum; utdyp bare hvis noen spør.",
  },

  identity: {
    title: "Identitet og betalinger bor i lommeboken, ikke hos butikken",
    cards: [
      { label: "Logg inn med mobilen, uten passord (nexid)", desc: "Nettstedet viser en utfordring i en QR-kode, mobilen signerer den med en nøkkel avledet per nettsted, og svaret går rett fra mobilen til serveren. Nøkkelen forlater aldri telefonen, hvert nettsted får sin egen identitet, og lookalike-domener feiler. BankID-opplevelsen uten bank." },
      { label: "Bevis eierskap uten å bruke noe", desc: "Challenge transactions: du signerer en bevisst ugyldig transaksjon som aldri sendes. Det beviser kontroll over mynter, NFT-er eller en multisig under et hvilket som helst skript, og er det som gjør tokenstyrt tilgang mulig." },
      { label: "Abonnement som lommeboken styrer (DPP)", desc: "Butikken registrerer seg hos lommeboken din og foreslår grenser per betaling, dag, uke og måned. Lommeboken bestemmer om en betaling går automatisk eller spør deg; butikken kan ikke tvinge den gjennom, og du sier opp alt ett sted. Det motsatte av kort på fil." },
    ],
    notes: "Kilder: spec.nexa.org/nexid (Nexa Identity Protocol), spec.nexa.org/transactions/challengeTransaction, spec.nexa.org/dpp (Delegated Payment Protocol). nexid: nettstedet presenterer et innloggingstilbud med en tilfeldig utfordring via QR eller nettleserutvidelse; lommeboken avleder en nettstedsspesifikk privat nøkkel fra hovednøkkelen pluss et valgfritt nettstedspassord, signerer og sender den signerte meldingen direkte til serveren utenom den ubetrodde datamaskinen; sikkerhetskopi er de 12 ordene. Challenge transactions: en transaksjon med høyeste bit i versjonsfeltet satt er ugyldig for alltid; ett data-output bærer utfordrerens identitet og en tilfeldig utfordring; å signere den beviser kontroll over de refererte UTXO-ene under et hvilket som helst skript, noe vanlig meldingssignering ikke kan for multisig eller kontrakter. DPP: aktøren registrerer seg med foreslåtte grenser og sender signerte betalingsforespørsler; lommeboken, ikke butikken, avgjør automatisk eller godkjent utførelse. For et norsk publikum: BankID for innlogging, AvtaleGiro og kort på fil for betalinger er de kjente sammenligningene.",
  },

  norway: {
    title: "Hvorfor dette betyr noe i Norge",
    cards: [
      { label: "Et rent nett under press", desc: "98 % av Norges strøm er vann og vind, likevel stanset regjeringen i 2025 nye proof-of-work-datasentre for å verne nettkapasiteten. Nexa-mining kjører på vanlige GPU-er og er ikke avhengig av datasentre." },
      { label: "Bitcoin ≈ Norge", desc: "Bitcoins rundt 140 TWh i året tilsvarer hele Norges strømforbruk, for 7 transaksjoner i sekundet. Samme strøm på Nexa ville båret tusenvis av ganger flere betalinger." },
      { label: "Et kontantløst land", desc: "Nordmenn betaler allerede med mobilen på sekunder. En rail for energieffektive penger som gjør opp på to sekunder for en brøkdel av et øre passer slik folk her allerede lever." },
    ],
    notes: "SSB: 98 % av Norges strøm fra vann og vind (sent 2025); normal årsproduksjon ~157 TWh, forbruk ~140 TWh. Juni 2025: regjeringen varslet et midlertidig forbud mot nye proof-of-work-datasentre for mining, med obligatorisk datasenterregister; myndighetene har antydet at det kan bli permanent. Vær ærlig: forbudet gjelder PoW-mining generelt, så en Nexa-farm ville også vært omfattet. Poenget er at Nexas nettverk ikke er avhengig av farmer noe sted.",
  },

  table: {
    title: "Sammenligning i oversikt",
    header: ["Bekymring", "Bitcoin", "Ethereum", "Nexa"],
    rows: [
      ["Energi og maskinvare",
       "≈ 16 GW. Spesialbygde ASIC-er, 30 700 t e-avfall i året.",
       "≈ 0,3 MW med proof of stake. Standardservere.",
       "Også proof of work, så effekten følger prisen. Gjenbrukbare GPU-er, og i stor skala inntil 13 000× flere transaksjoner per kWh enn Bitcoin."],
      ["Hvem får de nye myntene",
       "Rettferdig start i 2009; i dag kan bare industrielle farmer mine.",
       "72M ETH premined. Belønning proporsjonal med innsatsen man eier.",
       "Ingen premine, ingen ICO, ingen VC-er. 100 % utvunnet offentlig siden 2022, åpent for alle med en GPU."],
      ["Tokens og NFT-er",
       "Ikke innebygd. Inskripsjoner konkurrerer om knapp blokkplass.",
       "Smartkontrakt-tokens: gassauksjoner og kontraktutnyttelser.",
       "Innebygd i protokollen, en brøkdel av et øre å utstede. Designet som billetter, gjenstander og identitet, ikke et marked."],
      ["Å finne en motpart",
       "Ikke noe innebygd lag. Handel betyr en sentralisert børs.",
       "DEX-kontrakter på kjeden, gass for hver ordre og handel.",
       "CAPD open outcry: kringkast tilbudet utenfor kjeden, gjør opp på kjeden, ingen børs imellom."],
    ],
    notes: "Ett-slides svar på arrangørenes tre temaer: energi og e-avfall, hvem som tjener på det, og NFT-spekulasjon. Hvert tall står tidligere i presentasjonen med kilde.",
  },

  closing: {
    title: "Tre ting å huske",
    cards: [
      { label: "Energi", desc: "Proof of work koster det minerne får betalt, på enhver kjede. I stor skala får Nexa inntil 13 000× flere transaksjoner ut av hver kilowattime enn Bitcoin, på gjenbrukbare GPU-er, ikke ASIC-er som kastes." },
      { label: "Rettferdighet", desc: "Ingen premine, ingen ICO, ingen venturekapital. 100 % av tilbudet utvunnet offentlig siden 2022, åpent for alle med et skjermkort." },
      { label: "Nytte", desc: "Betalinger på to sekunder for under et øre, protokoll-innebygde tokens for spill, billetter og identitet, og open outcry-handel over CAPD. Bygget for bruk, ikke for spekulasjon." },
    ],
    sources: "Kilder: Cambridge CBECI (2026) · de Vries & Stoll, Bitcoin's growing e-waste problem (2021) · ethereum.org · nexa.org og spec.nexa.org · Statistisk sentralbyrå (SSB) · Regjeringens datasenterregulering (juni 2025) · NTNU: Borgelt m.fl. (2026), Hertwich m.fl. (2014), HighEFF (2024) · jqrgen.medium.com (sept. 2026)",
    notes: "Avslutt med de tre svarene på de tre bekymringene. Hvis 13 000×-tallet utfordres: det er en kapasitetssammenligning ved lik nettverkseffekt, 5 600× på dagens benchmark og 13 000× med Blitz; gulvet er 1 000× fordi Bitcoin ikke kan overstige ~14 TPS.",
  },
};
