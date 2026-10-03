# Not Exchange HFT: Building Automated Trading Products on Nexa

*By jQrgen (Jørgen S. Notland), 3 Oct 2026*

---

Let's get the honest part out of the way. Real high-frequency trading runs on co-located servers next to an exchange's matching engine, where speed is measured far below a second. No proof-of-work blockchain, Nexa included, works at that speed.

So this post isn't about that. It's about a narrower idea I find more useful: **fast, cheap, on-chain settlement for automated and algorithmic trading products.** That covers order matching that settles on-chain, market-making bots, token swaps, and trades that settle at payment speed. If that's what you're building, here is what Nexa gives you today, what changes with Tailstorm, and where the limits are.

## What I mean by "high-frequency-style"

In this post, "high-frequency-style" means a product that makes many small, automated trades and cares about settlement in seconds to minutes, not fractions of a second. Think of a bot that re-quotes a token pair, a swap service, or a point-of-sale app that converts on the fly. If your edge depends on being first by a fraction of a second, this isn't your venue.

## Settlement speed today and with Tailstorm

**Today**, Nexa mainnet produces ordinary blocks about every 2 minutes.

**Tailstorm** is implemented in the node software, not active on mainnet or testnet; part of the planned Hard Fork 2, with no activation date set yet. The Hard Fork 2 overview in the source tree says the fork is "still under active development. Feature scope and activation times may change before release." Both the released and the development code use a far-future placeholder activation time, and an earlier date still shown on the spec site is out of date. Treat any date as provisional.

Tailstorm comes from peer-reviewed research by Keller, Glickenhaus, Bissias and Griffith (AFT 2023). Its focus is fast, reliable confirmations and fair mining. The paper also notes that putting transactions in every subblock improves throughput. In Nexa, though, capacity is still set by the block size rules (see Capacity), so don't read Tailstorm as a transactions-per-second upgrade. Nexa's implementation also differs from the paper: it doesn't use the paper's reward discounting, so the paper's fairness results don't carry over directly.

Here's the part that matters for trading. With Tailstorm, each 2-minute block, on average, is built from many smaller proof-of-work pieces, called subblocks. A transaction can show up in a subblock within seconds. That is a strong early signal, but not final: until the next summary block, a conflicting double spend can still win. For full security the paper recommends waiting one more summary block after the one that includes the transaction.

The current development code sets k = 120, about one subblock a second. That's a design target, not a measurement. That isn't a final mainnet value; one forum post cited about 40. Subblock transactions also don't change chain state on their own. Only the summary block does.

The Tailstorm paper suggests a few subblock confirmations can be enough for small, time-sensitive amounts. That argument depends on the paper's depth-based reward discount. Nexa's current code splits rewards by a score instead, so it's still an open question whether Nexa keeps that property. For a trading product, that suggests tiers. Use subblock confirmations to update your UI or risk view quickly. Treat them as enough only for small amounts, and only as the paper's suggestion, not a Nexa guarantee. Settle anything that matters after a summary block, and wait one more summary block for full security.

## Unconfirmed transactions (0-conf)

An unconfirmed transaction is only a promise that a node has seen it. It can still be double-spent until it is in a block: a conflicting transaction can be mined instead. It is reasonable for small, low-risk payments, but it does not guarantee settlement.

The Nexa node includes double-spend proofs, and they are on by default. When a node sees a second spend of the same coin from a standard single-key address, it rejects the conflicting transaction and announces a compact proof to its peers, rate-limited. What gets relayed is the proof announcement, not the double-spend transaction itself. That helps you *detect* a conflict sooner; it doesn't prevent one. By default, a node keeps the first version it sees and rejects a transaction that conflicts with one already in its mempool. But that's each node's policy, not a network-wide guarantee.

## Fees

Fees are set by policy, not by an auction you can bid in real time. By default, a node relays transactions paying at least 1,000 satoshis per 1,000 bytes. Amounts are counted in satoshis, the base unit; 1 NEX = 100 satoshis, so that's 10 NEX per kB. This is node policy that each operator can change (the `relay.minRelayTxFee` setting), not a consensus rule, and miners choose what they include. The default dust threshold is 546 satoshis per output.

What a trade costs depends on its size in bytes. I'm not quoting a per-trade figure, because we haven't measured a typical token-swap transaction yet.

## Capacity

These numbers come from the spec and node code, not marketing. Nexa's maximum block size adapts: it's 10 times the larger of the 90-day and 365-day median block sizes, with a 2 MB minimum on mainnet today and a 1,000 MB hard cap. Under Hard Fork 2, that minimum would rise to k × 100 KB, which is 12 MB at k = 120. The default maximum standard transaction size is 100,000 bytes. A higher limit means room to grow, not demonstrated throughput. I'm not quoting a transactions-per-second figure.

## Building blocks for trading products

This is where Nexa is interesting for developers. Each of these is in the spec or the code:

- **Native tokens (Group Tokens).** Tokens are enforced by consensus as part of the transaction outputs, not by a smart contract you have to audit.
- **Partially signed transactions.** Nexa's signature hash types let a signer commit to only the first N inputs or outputs, or to specific outputs. Another party can then add their side of a trade without asking the first signer to re-sign. This is the building block for offers and swaps. A "retargetable" range type, planned for Hard Fork 2, would let signed outputs be moved within a transaction.
- **Introspection.** Scripts can read the transaction's own inputs and outputs (for example, output values and output scripts). That lets a contract check "this trade pays me at least X of token Y". There is also `OP_PUSH_TX_STATE` for data the node computes during validation.
- **Read-only inputs.** A transaction can reference a coin (UTXO) without spending it, for example to read published data.
- **Counterparty discovery (CAPD).** CAPD is a best-effort, proof-of-work-protected peer-to-peer message pool built into the node; messages aren't stored on-chain. Its spec explicitly lists trades and atomic swaps as uses, so you can publish and find offers without a central server.

Put together, you can sketch an order book where offers are partially signed transactions advertised over CAPD. A taker completes a trade by adding their inputs and outputs, and settlement is a single on-chain transaction. That's a design you could build: no public reference implementation exists yet.

## MEV: what Nexa does and doesn't protect against

Does Tailstorm fix MEV? No, and I won't claim it does. Nexa already removes one kind of MEV without it: transactions inside a block are sorted by transaction ID, so a miner can't sell or exploit position within a block. And because Nexa uses UTXOs, a fully signed trade is tied to the exact coins it spends, so a front-runner can make it fail but can't force it through at a worse price.

Tailstorm is implemented but not active on mainnet or testnet, with no activation date. If it were active, my reasoning (not a measured result) is that faster subblocks and blocks built by many miners might make censorship by a single miner harder. The Tailstorm paper doesn't study MEV, though. The mempool stays public, miners still choose and add transactions, and front-running across blocks remains possible.

## What Nexa doesn't do well for trading

- **Latency.** An exchange matches orders far faster than any blockchain can settle. Subblocks would take seconds, and full settlement takes minutes.
- **Public mempool.** Your transaction is visible to the network before it's confirmed. Others can see your order and try to get ahead of it in an earlier block, the front-running risk (part of what's called MEV) that every public chain has. Canonical ordering doesn't stop that, and Tailstorm wouldn't either (see MEV above).
- **No co-location, and inclusion is the miner's choice.** Canonical ordering already removes reordering within a block: transactions are sorted by transaction ID, so you can't buy a position in the block. But whoever builds the block still decides which transactions go in and which wait, and can add their own, so front-running across blocks remains possible. There's no matching engine to sit next to.
- **Global network variance.** Propagation delays differ by region and connection. The Tailstorm paper itself notes that its analysis assumes equal delays for all miners, and that real networks aren't like that.
- **Status risk.** Tailstorm isn't active on mainnet or testnet, and has no activation date. If your product depends on subblock speed, plan for it to arrive with Hard Fork 2, not before.

None of this is financial advice, and nothing here is a promise of returns.

## Start building

If that fits your product, start here:

- Spec: https://spec.nexa.org (Tailstorm, CAPD, signature hash types, Group Tokens)
- Source: https://gitlab.com/nexa/nexa

I'm especially keen to hear from teams in Scandinavia working on swaps, market-making tooling or payment-speed settlement.
