module.exports = {
  fileTitle: "Nexa vs Bitcoin and Ethereum",
  footer: "Nexa · 2026",

  title: {
    brand: "NEXA",
    headline: "Sound money at internet scale",
    sub: "What makes Nexa different from Bitcoin and Ethereum",
    place: "Norway · 2026",
    name: "Jørgen S. Notland",
    cred1: "Informatics and the School of Entrepreneurship, NTNU Norway",
    cred2: "Teaches Bitcoin and Nexa blockchain at the University of Exeter",
    notes: "Introduce yourself briefly: informatics and the School of Entrepreneurship at NTNU Norway in Trondheim, and you teach Bitcoin and Nexa blockchain at the University of Exeter. For this audience the NTNU Norway link matters: the environmental research on slide 6 comes from your own university. Opening. This deck is written for a sceptical audience. The first content slide concedes the criticism before answering it. Sources for every number are in the notes of each slide.",
  },

  critique: {
    title: "The critique of crypto is mostly right",
    cards: [
      { label: "Energy", desc: "Bitcoin burns about 140 TWh a year, roughly Norway's entire electricity consumption, to process around 7 transactions per second." },
      { label: "E-waste", desc: "Bitcoin ASICs do one job, are obsolete after about 1.3 years, and generate around 30,700 tonnes of electronic scrap a year." },
      { label: "Financialization", desc: "Premines, ICOs and staking yields hand the gains to insiders. NFT gas auctions turn a simple item into a speculative market." },
    ],
    tagline: "Nexa was designed from the start to avoid all three. Here is how.",
    notes: "Concede first. Energy: Cambridge CBECI live estimate 138 TWh/yr, Digiconomist ~204 TWh/yr; Norway's national consumption is about 140 TWh/yr. E-waste: de Vries & Stoll (2021), 30.7 kt/yr, ASIC lifespan 1.29 years, 272 g per transaction. Financialization: Ethereum's 72M ETH genesis allocation and stake-weighted rewards; NFT minting on Ethereum L1 historically cost tens of dollars in gas.",
  },

  perTx: {
    title: "At scale, Nexa is up to 13,000× more energy efficient than Bitcoin",
    stats: [
      { name: "BITCOIN", value: "580 kWh", label: "per transaction · two weeks of household electricity" },
      { name: "NEXA TODAY", value: "0.104 kWh", label: "at 42,000 TPS benchmarked · about 5,600× less" },
      { name: "NEXA + BLITZ", value: "0.044 kWh", label: "at 100,000 TPS projected · two phone charges" },
    ],
    points: [
      "Miners burn whatever the block reward pays for, whether the chain carries 10 or 10 million transactions. So energy per transaction is simply network electricity divided by throughput.",
      "Bitcoin: 138 TWh a year at 7.5 TPS gives 580 kWh each. The same electricity on Nexa at 42,000 TPS gives 0.104 kWh; at 100,000 TPS with Blitz, 0.044 kWh.",
      "Bitcoin's protocol caps out at 7 to 14 TPS. Even at its busiest day ever it needed 425 kWh per transaction. The gap can never shrink below about 1,000×.",
    ],
    notes: "Method from the Medium article 'Nexa is 13,000x more energy efficient than Bitcoin' (Sept 2026): kWh per tx = 4,376 / TPS at 138 TWh/yr. Bitcoin 7.5 TPS -> 580 kWh; busiest day 10.3 TPS -> 425 kWh. Nexa 42,000 TPS is a benchmark on today's hardware; 100,000 with Blitz is a projection. Be explicit that this is a like-for-like capacity comparison at equal network power. Sources: Cambridge CBECI, Digiconomist, Blockchair.",
  },

  chart: {
    title: "Same joules, different denominator",
    caption: "kWh per transaction = 4,376 \u00f7 TPS at 138 TWh/yr (Cambridge CBECI). Both chains get the same network electricity, so the lines differ only in throughput. Nexa's 42,000 TPS is benchmarked; 100,000 with Blitz is a projection.",
    notes: "Chart reproduced from the interactive artifact 'The Denominator Chart' (claude.ai/artifact/QTRwhPcMUUQ6PwhibYYbQ2), which also lets you toggle to Digiconomist's 204 TWh/yr. How to read it: one numerator, miners burn whatever the block reward pays for, so network electricity is the same for both lines. Bitcoin's denominator is stuck: throughput has sat near 7 TPS since 2010 and the protocol caps it at 7 to 14, so extra demand lengthens the queue instead of adding transactions. Nexa's denominator grows: the same joules divided by 42,000 TPS are 5,600x thinner than Bitcoin today, and 13,000x at 100,000 TPS with Blitz. That ratio does not depend on which electricity estimate you believe. Bitcoin's busiest day ever, 10.3 TPS, would sit at 425 kWh per transaction; its theoretical 14 TPS ceiling at 313. Sources: Cambridge CBECI, Digiconomist, Blockchair, 2026.",
  },

  absolute: {
    title: "Nexa can use as much electricity as Bitcoin if enough people mine. At scale, it is far more energy efficient",
    cols: [
      { name: "Bitcoin", head: "≈ 16 GW for about 7 TPS", desc: "Miners on any proof-of-work chain burn roughly what the block reward is worth, regardless of use. Cambridge's 2026 estimate is 16 GW, about Norway's average grid load, to carry 7 transactions per second." },
      { name: "Ethereum", head: "≈ 0.3 MW on proof of stake", desc: "About 0.0026 TWh a year since the Merge. Energy is genuinely solved on Ethereum. The trade-offs there are distribution and complexity, covered later in this deck." },
      { name: "Nexa", head: "Megawatts today, gigawatts if it wins", desc: "Nexa is proof of work too. Today about 5 to 15 MW of GPUs; valued like Bitcoin, its miners would spend like Bitcoin's. The difference: that electricity would carry 42,000 to 100,000 transactions per second, not 7." },
    ],
    notes: "Be upfront: proof-of-work energy follows the coin's value, not its usage, and that applies to Nexa as much as to Bitcoin. If Nexa were as valuable as Bitcoin, its miners would plausibly spend as much on electricity. The claim is not that Nexa is small, it is that the same electricity does thousands of times more work. Bitcoin: CBECI Aug 2026 estimate 16.09 GW / 141 TWh per year. Norway consumes ~140 TWh/yr = ~16 GW average. Ethereum: ethereum.org, ~0.0026 TWh/yr = ~0.3 MW average. Nexa today: network hashrate 2.5 to 4.8 TH/s (2Miners, Kryptex, 2026); an RTX 4090 does ~203 MH/s at ~306 W. 4.84 TH/s / 0.66 MH/W = ~7 MW; older cards are less efficient, hence 5 to 15 MW.",
  },

  ntnu: {
    title: "NTNU Norway research: the greenest kilowatt-hour is the one you never need",
    cards: [
      { label: "Clean power still costs nature", desc: "Borgelt et al., NTNU Norway (2026): building the wind, solar and grid Norway needs by 2050 could raise habitat loss by up to 28%. The most effective protection is “to lower electricity demand through energy efficiency measures”." },
      { label: "No kilowatt-hour is free", desc: "Hertwich, Gibon et al., NTNU Norway (PNAS 2014): the first global life-cycle assessment of renewable electricity. Hydro, wind and solar beat fossil fuels by far, but still carry land, material and emission footprints." },
      { label: "Efficiency is the “first fuel”", desc: "HighEFF, the SINTEF/NTNU Norway efficiency centre: Norway committed at COP28 to energy efficiency as the first fuel, “a conflict-free measure that frees energy to be used for other purposes”. A payment rail doing 13,000× more per kWh is exactly that." },
    ],
    citation: "Borgelt, Gilad, May & Verones, “Renewable energy growth amplifies land pressure on Norwegian biodiversity”, Cleaner Energy Systems 13 (2026) · Hertwich et al., “Integrated life-cycle assessment of electricity-supply scenarios”, PNAS (2014) · HighEFF at NTNU Norway Energy Transition Week (2024)",
    notes: "Why this slide: the organisers' objection is environmental, so the answer should come from Norwegian environmental research, not from crypto. Borgelt J., Gilad D., May R., Verones F. (2026), Cleaner Energy Systems vol. 13, NTNU Norway Industrial Ecology Programme: six scenarios for Norway's electricity build-out to 2050; habitat loss up to +28%; wind has the largest potential for new habitat loss, the transmission grid the second largest; quote from the NTNU Norway press release (May 2026): the most effective way to substantially reduce biodiversity impacts is to lower electricity demand through energy efficiency measures. Hertwich E.G., Gibon T. et al. (2014), PNAS 112(20): 6277-6282, published online Oct 2014, NTNU Norway: global LCA of electricity supply to 2050; low-carbon technologies have far lower impacts than fossil, but non-zero land, material and emission footprints. HighEFF (FME centre led by SINTEF Energy with NTNU Norway), NTNU Norway Energy Transition Week 2024: EU 'energy efficiency first' principle; Norway's COP28 pledge to put energy efficiency as the first fuel at the core of policymaking; director Petter Røkke's 'conflict-free measure' quote. Supporting: Sandberg et al. (SINTEF/NTNU Norway) estimate 12.7 TWh (2030) to 21.3 TWh (2050) of savings potential in Norwegian buildings; the Energy Commission (NOU 2023:3, 'Mer av alt – raskere') calls efficiency the fastest, cheapest and least nature-destructive way to close the power gap. The tie-in: at equal electricity, Nexa does thousands of times more payments than Bitcoin, which is exactly the kind of demand reduction per unit of value these researchers ask for.",
  },

  ewaste: {
    title: "No single-purpose hardware, no mountain of e-waste",
    cards: [
      { label: "Bitcoin: ASICs built to be scrapped", desc: "A Bitcoin ASIC computes SHA-256 and nothing else. It is obsolete after about 1.3 years: 30,700 tonnes of e-waste a year, 272 grams per transaction, about the weight of an iPhone." },
      { label: "Nexa: ordinary gaming GPUs", desc: "NexaPoW is GPU-friendly on NVIDIA and AMD cards. A card that stops mining goes back to gaming, AI or rendering. Nothing in the network is built to be thrown away." },
      { label: "Next: reprogrammable FPGAs", desc: "Blitz is an FPGA card that verifies signatures for the node. FPGAs are reprogrammed, not replaced, and NexaPoW's mining work is the same signature math the chain needs anyway." },
    ],
    notes: "E-waste figures: de Vries & Stoll, 'Bitcoin's growing e-waste problem', Resources, Conservation & Recycling (2021). NexaPoW mixes SHA-256 with Schnorr signature creation, deliberately so that any specialised hardware also accelerates signature validation (spec.nexa.org/mining/NexaPOW). Blitz: FPGA signature-verification engine announced Nov 2024, in development and testing through 2026 (Nexa July 2026 newsletter). Honest caveat: GPU mining still consumes hardware; the point is reuse, not zero footprint.",
  },

  fair: {
    title: "Fair launch: zero premine, zero ICO, zero venture capital",
    cols: [
      { name: "Bitcoin", head: "Fair in 2009, closed today", desc: "The first million coins were mined on ordinary PCs. A newcomer in 2026 competes with industrial ASIC farms on subsidised power. The door is open in theory only." },
      { name: "Ethereum", head: "72 million ETH created at genesis", desc: "Around 60% of today's supply existed before the network did, most of it sold in a 2014 ICO. Insiders were paid before the first block." },
      { name: "Nexa", head: "0 premine, 0 team coins, 0 VCs", desc: "Launched 21 June 2022. All of the 21 trillion supply is mined in public on GPUs, and the network is four years old, not seventeen. Latecomers are still early." },
    ],
    notes: "Nexa: nexa.org, 'Nexa was 100% fair launched, with no team coins, no premine, and no VCs, and 100% of its supply will be mined via Proof of Work.' Launch date 21 June 2022. Ethereum: 72M ETH at genesis (about 60M sold in the 2014 crowdsale, 12M to the foundation and early contributors); circulating supply ~120M ETH, so roughly 60%. Bitcoin: estimates of ~1M BTC mined by Satoshi in 2009-2010.",
  },

  scale: {
    title: "Scale: 42,000 transactions per second on today's hardware",
    stats: [
      { name: "BITCOIN", value: "≈ 7 TPS", label: "unchanged since 2010 · hard-capped by block size" },
      { name: "ETHEREUM L1", value: "≈ 26 TPS", label: "Q1 2026 daily average · users pushed to layer 2s" },
      { name: "NEXA", value: "42,000 TPS", label: "benchmarked · 100,000 projected with Blitz" },
    ],
    points: [
      "Bitcoin has carried about 7 TPS since 2010. Ethereum's base layer averaged 26 TPS in early 2026 and relies on layer 2 networks, each with its own bridge, fees and trust assumptions.",
      "Nexa is a UTXO chain: every transaction validates independently and in parallel, so throughput grows with hardware rather than with committee decisions.",
      "The two real bottlenecks, signature checks and UTXO lookups, move off the CPU onto Blitz FPGAs. The same boards later absorb post-quantum signatures, which are 10 to 40 times larger.",
    ],
    notes: "42,000 TPS is a Nexa benchmark; nexa.org states '>60,000 TPS'. 100,000 with Blitz is a projection. Ethereum: daily average mainnet TPS 25.78 in Q1 2026 (ethereum.org, 'Building on Ethereum in 2026'); gas limit 60M, with plans to raise it further. Post-quantum signature sizes from the article: Schnorr 64 bytes, Falcon 666, Dilithium 2,420.",
  },

  payments: {
    title: "Payments that feel like Vipps: under two seconds, about 3 NEXA (under $0.0001)",
    cards: [
      { label: "Instant", desc: "Zero-confirmation payments secured by double-spend proofs confirm in under two seconds. Blocks follow every two minutes, and after Hard Fork 2 Tailstorm adds a proof-of-work-backed sub-block every second." },
      { label: "Near-zero fees", desc: "A typical transaction pays about 3 NEXA in fees, roughly $0.000004 at today's price and a fraction of an øre. Compare fees measured in dollars on Bitcoin and gas auctions on Ethereum's base layer." },
      { label: "New kinds of payments", desc: "Micropayments, in-game economies and machine-to-machine payments that card networks, Bitcoin and Ethereum cannot price. Sound money that also works as cash." },
    ],
    notes: "Tailstorm (spec.nexa.org/blocks/tailstorm): after Hard Fork 2 each two-minute summary block is backed by 120 sub-blocks, one about every second, giving a probabilistic, energy-backed inclusion signal within a second and lower income variance for miners; the ledger itself is still settled by the two-minute summary chain. Fee figures from explorer.nexa.org on 15 Sept 2026: the network fee rate is 1 satoshi per byte and a simple transaction is 250 to 320 bytes, so it pays 2.5 to 3.2 NEXA (100 satoshis = 1 NEXA). At the explorer's rate of $0.0000013 per NEXA that is about $0.000004, or roughly 0.004 øre. Update the price before presenting. nexa.org: 'confirms in under two seconds with near-zero fees', 'under $0.0001 per transaction'. Zero-conf with double-spend proofs is Bitcoin Unlimited technology carried into Nexa. Vipps reference: Norway is close to cashless; the point is that the user experience Norwegians expect is already the baseline here.",
  },

  tokens: {
    title: "Tokens and NFTs are built into the protocol, not bolted on",
    cards: [
      { label: "Native, not a contract", desc: "Group tokens are a primitive of the chain itself. No smart contract means no contract bug to exploit, which is where most Ethereum token hacks come from." },
      { label: "A fraction of a cent to mint", desc: "Minting is an ordinary transaction that costs a few NEXA, with no gas auction, so an NFT does not need a speculative market to justify the cost of existing. It can simply be a ticket, a key or a game item." },
      { label: "Built for utility", desc: "Tickets, in-game items, certificates, identity: the item itself, transferable and verifiable by anyone, rather than a bet on the item." },
    ],
    notes: "spec.nexa.org/tokens/grouptokens: 'Groups implement native tokens; that is, the tokens are a fundamental primitive in the blockchain rather than implemented as a smart contract or in a layer 2 data-carrier protocol.' Address the NFT critique directly: the speculation the organisers describe is a product of scarcity plus high minting cost plus marketing. Nexa removes the cost and the contract risk; whether an item is speculative is then up to the game designer, not the chain.",
  },

  batons: {
    title: "Minting rights are coins too: authority batons",
    cards: [
      { label: "Authority lives in a UTXO", desc: "A token group's powers, MINT, MELT, SUBGROUP, RESCRIPT and BATON, are flags on a special output. Minting means spending a MINT authority in a transaction that creates the new tokens. There is no admin key inside a contract and no owner() function to hack." },
      { label: "Send a baton like any coin", desc: "BATON is the right to create new authorities. Split the baton into a pool of MINT-only authorities, hand one to a partner who may issue but never destroy, and keep the baton itself cold. Used as a read-only input, a baton grants its powers without being consumed." },
      { label: "Or hand it to a smart contract", desc: "Pay an authority into a script-template contract and the contract's rules decide when tokens are minted: mint-on-demand where the NFT is created only when the buyer pays, or a covenant that only lets the authority continue inside the same contract. Lose the authority output and you lose the mint." },
    ],
    notes: "Source: spec.nexa.org/tokens/grouptokens and the libnexakotlin token library. Authority outputs carry a negative sign-magnitude value in the quantity slot with flag bits AUTHORITY, MINT, MELT, BATON, RESCRIPT and SUBGROUP. Minting is spending a MINT authority; melting needs MELT; SUBGROUP creates child groups (NFTs and SFTs under a parent). BATON is the master right to create child authorities, so routine mints should spend a plain MINT authority and preserve the baton; wallets keep a pool of spare MINT authorities so concurrent mints do not contend for one UTXO. Authorities are ordinary outputs: pay one to another address to delegate, or to a contract's locking script so the contract governs issuance (mint-on-demand as a half-signed transaction the buyer funds). Read-only inputs (spec.nexa.org/script/read-only-inputs) let a BATON authority grant powers to a transaction without being spent. Contrast: ERC-20 minting is a privileged function guarded by an owner key inside the contract; on Nexa the right is a coin you can split, send, lock or destroy.",
  },

  capd: {
    title: "Open outcry trading over CAPD: shout an offer, anyone can take it",
    cards: [
      { label: "Shout the offer to the network", desc: "CAPD (Counterparty and Protocol Discovery) is a message bus carried by the same nodes that relay transactions. You broadcast a half-signed offer, say 100 tokens for 5,000 NEXA, and every node passes it on, like a trader calling out a price on the floor." },
      { label: "No exchange, no order-book server", desc: "Whoever wants the deal completes the half-signed transaction and broadcasts it. The swap settles on-chain in one atomic transaction, with no exchange, listing fee or matching server in between. Bitcoin has no such layer; on Ethereum it takes a DEX contract and gas per trade." },
      { label: "Proof of work instead of fees, then it disappears", desc: "Senders solve a small proof of work instead of paying a fee, which keeps spam out. Offers are ephemeral: they fade from relay in about ten minutes unless re-broadcast, can be withdrawn early, and never touch the blockchain until someone takes them." },
    ],
    notes: "CAPD is unique to Nexa: a decentralised, proof-of-work-rate-limited, ephemeral message bus on the P2P network (spec: spec.nexa.org/network/capd). Open outcry: the trading-floor model where offers are called out publicly and anyone can take them. Mechanics: the offer is a partially signed transaction; the advertised summary (which token for which) is only indicative, the half-signed transaction is authoritative, so a lying advertisement is harmless: the taker gets exactly what the transaction says or it is invalid. Messages carry a create time and an expiration, relay priority decays to zero after about 600 seconds, and a rescind hash lets the sender withdraw an offer early. Uses: token and NFT marketplaces without a marketplace operator, in-game item trading, atomic swaps, multisig wallet formation and signing rounds. Contrast: Bitcoin has no discovery layer, so trading means centralised exchanges; Ethereum needs an on-chain DEX contract and pays gas for every order and trade.",
  },

  secrets: {
    title: "Token Secrets: sell the secret together with the token",
    cards: [
      { label: "A token that carries a secret", desc: "The token commits to the public key of a secret, an elliptic-curve private key, at mint or inside the group id. Whoever holds the token holds the secret: a game key, a ticket, the key to encrypted content." },
      { label: "Revealed to the buyer, hidden from everyone else", desc: "The transfer transaction runs a Diffie-Hellman key exchange, so the secret is delivered to the buyer encrypted inside the transaction. The public chain leaks nothing, and the chain verifies that it is the real secret, so the seller cannot swap in a fake one." },
      { label: "Atomic exchange, not DRM", desc: "Token and secret change hands in the same transaction, with no trusted middleman. The seller still knows the secret afterwards, so this secures the exchange rather than copy protection. Bitcoin and Ethereum have no equivalent primitive." },
    ],
    notes: "Source: spec.nexa.org/tokensecret (Token Secrets, also called Atomic Secret Exchange, ASE, and the basis for private NFTs). Requirements the protocol meets: the transfer reveals the secret to the recipient at the same time as the token; the transaction reveals nothing to third parties even though it sits on a public chain; the recipient or the chain verifies that the communicated secret matches the one the token committed to. Mechanics: the secret must be an EC private key whose public key is committed in the mint or the group id; Alice and Bob build a half-transaction where Bob's input needs two signatures, one from the secret's key and one from a key only Bob has; an ECDH shared secret encrypts the private key for Bob. Caveat from the spec: after the transfer Alice still knows the key, so it suits selling access to content where perfect DRM is unrealistic; the value is verification against substitution during the trade.",
  },

  usecases: {
    title: "What you can build with it: practical use cases",
    cards: [
      { label: "Tokens and batons", desc: "A game studio mints its items as native tokens and keeps the baton cold. The in-game shop holds a MINT-only authority inside a mint-on-demand contract, so a sword exists only once a player has paid. A season pass is a subgroup melted when the season ends; a festival hands a partner venue a MINT authority for its own ticket allotment." },
      { label: "CAPD open outcry", desc: "A player-to-player item market with no marketplace operator: sellers broadcast half-signed offers, buyers take them, and the swap settles atomically. A ticket exchange where a covenant caps resale at face value. A local NEXA-for-tokens board at a meetup or a LAN party, running on nothing but the nodes." },
      { label: "Token Secrets", desc: "A game key delivered inside the purchase transaction: the buyer gets the token and the licence key in one step, and nobody else can read it. Encrypted DLC or a paywalled article where the token carries the decryption key. A concert ticket that carries the door code, revealed only to the holder." },
    ],
    notes: "These are design patterns, not products; each maps to a primitive from the previous slides. Tokens and batons: native group tokens (spec.nexa.org/tokens/grouptokens), MINT-only authorities split from the baton, mint-on-demand as a half-signed transaction the buyer funds, subgroups for seasons or editions, MELT to retire them. CAPD: half-signed offers broadcast on the message bus and completed by the taker (spec.nexa.org/network/capd); resale caps are a covenant in the token's script template. Token Secrets: the token commits to a secret's public key and the transfer reveals it to the buyer via ECDH (spec.nexa.org/tokensecret). This is the answer to the organisers' 'financialisation' worry: every example is a thing people use, priced in fractions of an øre, with no exchange, marketplace operator or gas market in between.",
  },

  contracts: {
    title: "Smart contracts without the EVM",
    cards: [
      { label: "Script templates", desc: "Contracts are small, deterministic scripts attached to coins and validated in parallel like any other transaction. There is no global state machine to congest." },
      { label: "No EVM overhead", desc: "No gas market, no reentrancy class of bugs, no fee spike for everyone when one app gets popular. Contracts run at the same 42,000 TPS as plain payments." },
      { label: "A full platform", desc: "Wallet login with on-chain identity, payment requests to the user's wallet and peer-to-peer messaging are part of the stack, with Kotlin and JavaScript libraries." },
    ],
    notes: "nexa.org: 'Native on-chain programmability without EVM complexity', 'No EVM overhead'. The developer stack: Wally wallet, TDPP payment protocol, nexid identity, CAPD messaging, NexaJS and libnexakotlin. Keep this slide short for a non-developer audience; expand only if asked.",
  },

  identity: {
    title: "Identity and payments live in the wallet, not on the merchant's server",
    cards: [
      { label: "Log in with the phone, no password (nexid)", desc: "The site shows a challenge in a QR code, the phone signs it with a key derived per site, and the answer goes straight from the phone to the server. The key never leaves the phone, every site gets its own identity, and lookalike domains fail. The BankID experience without a bank." },
      { label: "Prove ownership without spending", desc: "Challenge transactions: you sign a deliberately invalid transaction that is never broadcast. That proves control of coins, NFTs or a multisig under any script, and it is what makes token-gated access possible." },
      { label: "Subscriptions the wallet controls (DPP)", desc: "A merchant registers with your wallet and proposes limits per payment, day, week and month. The wallet decides whether a payment runs automatically or asks you; the merchant cannot force it, and you cancel everything in one place. The opposite of a card on file." },
    ],
    notes: "Sources: spec.nexa.org/nexid (Nexa Identity Protocol), spec.nexa.org/transactions/challengeTransaction, spec.nexa.org/dpp (Delegated Payment Protocol). nexid: the website presents a login offer with a random challenge via QR or browser plugin; the wallet derives a site-specific private key from the master key plus an optional site password, signs, and sends the signed message directly to the server, bypassing the untrusted computer; backup is the 12-word phrase. Challenge transactions: a transaction with the version high bit set is invalid forever; a single data output carries the challenger's identity and a random challenge; signing it proves control of the referenced UTXOs under any script, which ordinary message signing cannot do for multisig or contracts. DPP: the entity registers with proposed limits and sends signed payment requests; the wallet, not the merchant, decides automatic versus prompted execution. For a Norwegian audience: BankID for login, AvtaleGiro and card-on-file for payments are the familiar comparisons.",
  },

  norway: {
    title: "Why this matters in Norway",
    cards: [
      { label: "A clean grid under pressure", desc: "98% of Norway's electricity is hydro and wind, yet in 2025 the government froze new proof-of-work data centres to protect grid capacity. Nexa mining runs on ordinary GPUs and does not depend on data centres." },
      { label: "Bitcoin ≈ Norway", desc: "Bitcoin's roughly 140 TWh a year equals Norway's entire electricity consumption, for 7 transactions per second. The same electricity on Nexa would carry thousands of times more payments." },
      { label: "A cashless country", desc: "Norwegians already pay by phone in seconds. A sound-money rail that settles in two seconds for a fraction of an øre fits how people here already live." },
    ],
    notes: "SSB: 98% of Norway's electricity from hydro and wind (late 2025); normal annual production ~157 TWh, consumption ~140 TWh. June 2025: the government announced a temporary ban on new proof-of-work mining data centres, with a mandatory data-centre registry; officials have hinted it may become permanent. Be honest: the ban applies to PoW mining generally, so a Nexa farm would be covered too. The point is that Nexa's network does not depend on farms anywhere.",
  },

  table: {
    title: "Comparison overview",
    header: ["Concern", "Bitcoin", "Ethereum", "Nexa"],
    rows: [
      ["Energy and hardware",
       "≈ 16 GW. Single-purpose ASICs, 30,700 t of e-waste a year.",
       "≈ 0.3 MW on proof of stake. Commodity servers.",
       "Proof of work too, so power follows price. Reusable GPUs, and at scale up to 13,000× more transactions per kWh than Bitcoin."],
      ["Who gets the new coins",
       "Fair launch in 2009; today only industrial farms can mine.",
       "72M ETH premined. Rewards proportional to stake held.",
       "No premine, no ICO, no VCs. 100% mined in public since 2022, open to anyone with a GPU."],
      ["Tokens and NFTs",
       "Not native. Inscriptions compete for scarce block space.",
       "Smart-contract tokens: gas auctions and contract exploits.",
       "Protocol-native, a fraction of a cent to mint. Designed as tickets, items and identity, not a market."],
      ["Finding a counterparty",
       "No native layer. Trading means a centralised exchange.",
       "On-chain DEX contracts, gas for every order and trade.",
       "CAPD open outcry: broadcast the offer off-chain, settle on-chain, no exchange in between."],
    ],
    notes: "One-slide answer to the organisers' three themes: energy and e-waste, who benefits, and NFT speculation. Every figure appears earlier in the deck with its source.",
  },

  closing: {
    title: "Three things to remember",
    cards: [
      { label: "Energy", desc: "Proof of work costs what miners are paid, on any chain. At scale, Nexa gets up to 13,000× more transactions out of every kilowatt-hour than Bitcoin, on reusable GPUs, not throw-away ASICs." },
      { label: "Fairness", desc: "No premine, no ICO, no venture capital. 100% of the supply mined in public since 2022, open to anyone with a graphics card." },
      { label: "Utility", desc: "Two-second, sub-cent payments, protocol-native tokens for games, tickets and identity, and open outcry trading over CAPD. Built for use, not for speculation." },
    ],
    sources: "Sources: Cambridge CBECI (2026) · de Vries & Stoll, Bitcoin's growing e-waste problem (2021) · ethereum.org · nexa.org and spec.nexa.org · Statistics Norway (SSB) · Norwegian government data-centre regulation (June 2025) · NTNU Norway: Borgelt et al. (2026), Hertwich et al. (2014), HighEFF (2024) · jqrgen.medium.com (Sept 2026)",
    notes: "Close on the three answers to the three concerns. If challenged on the 13,000x figure: it is a capacity comparison at equal network power, 5,600x on today's benchmark and 13,000x with Blitz; the floor is 1,000x because Bitcoin cannot exceed ~14 TPS.",
  },
};
