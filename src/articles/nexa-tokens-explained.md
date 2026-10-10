# Nexa tokens explained: groups, authorities and the token description document

*By jQrgen (Jørgen S. Notland), 10 Oct 2026*

---

This is a developer tutorial on Nexa's native tokens ("groups"). I checked the claims against the spec pages and source code listed below. Anything I could not confirm is marked **[UNVERIFIED]**, and there is a list of open points at the end.

## Sources

| Short name | Source |
|---|---|
| SPEC-GROUP | https://spec.nexa.org/tokens/grouptokens/ |
| SPEC-TDD | https://spec.nexa.org/tokens/tokenDescription/ |
| SPEC-NFT | https://spec.nexa.org/tokens/nft/ |
| SPEC-TMPL | https://spec.nexa.org/addresses/scriptTemplates/ |
| SPEC-UTXO | https://spec.nexa.org/addresses/Script-Template-Examples/how-tokens-are-stored-inside-a-utxo/ |
| LNK | libnexakotlin at commit `0d06593d`: [libnexakotlin/src/commonMain/kotlin/](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/) on gitlab.com/nexa/libnexakotlin |
| WALLY | Wally wallet at commit `4934ac4d`: [shared/src/commonMain/kotlin/assets.kt](https://gitlab.com/wallywallet/wallet/-/blob/4934ac4d534fcd9cf6687af094dea15e49e543d3/shared/src/commonMain/kotlin/assets.kt) on gitlab.com/wallywallet/wallet |

File:line references such as `token.kt:249-253` point into those directories at those commits. The main libnexakotlin files are [token.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/token.kt), [wallet.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/wallet.kt), [iWallet.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/iWallet.kt), [script.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/script.kt), [primitives.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/primitives.kt) and [blockchainFactory.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonMain/kotlin/blockchainFactory.kt); the test referenced is [groupTokenTests.kt](https://gitlab.com/nexa/libnexakotlin/-/blob/0d06593d03be0d890de7b9208621214e7ae0f932/libnexakotlin/src/commonTest/kotlin/groupTokenTests.kt).

---

## 1. What is a Nexa token?

Nexa has **native, consensus-level tokens** called *Group Tokenization*. Miners validate token amounts the same way they validate NEX. Tokens do not depend on a smart contract or on a layer-2 data-carrier protocol (SPEC-GROUP, "Introduction").

- **Where the token lives:** it is stored in the output's locking script. In Nexa, groups exist **only in TEMPLATE-type outputs** (script templates). The locking script fields are `[group id, group amount, template hash, hidden-args hash, visible args…]` (SPEC-TMPL "Locking Script"; SPEC-UTXO). If the first field is `OP_0`, the output has no group, and the amount field is left out.
- **OP_GROUP:** this is **not** an opcode in Nexa. SPEC-GROUP says: *"Any references to adding 'OP_GROUP' to other outputs refers to the proposal to add this functionality to Bitcoin Cash and should be ignored."* The group is simply the first data push of a template output.
- **Amount:** this is a separate field in each output. It is a **2-, 4- or 8-byte unsigned little-endian** quantity (SPEC-GROUP "For all outputs"). See also `OP.groupAmount` in LNK `script.kt:1397-1411` and the parse check in `script.kt:2210-2213`. The NEX satoshi `amount` of the output is a separate value. Each token output still carries some NEX (dust): `txOutputFor(...)` uses `coinAmount ?: dust(cs)` (`blockchainFactory.kt:163-180`).
- **Real example from SPEC-UTXO:**
  `20 <32-byte groupid …0000> 08 <00046bf414000000> 51 14 <20-byte args hash>`
  This is the group id, an 8-byte amount, well-known template 1 (P2PKT), and the hidden-args hash.
- **Consensus rule:** for every group, the inputs must equal the outputs, unless an input in that group can mint or melt (SPEC-GROUP "Transaction Validation algorithm").

**Comparison with other token systems**

| | Nexa groups | Colored coins (OP_RETURN protocols, e.g. SLP) | ERC-20 | BCH CashTokens |
|---|---|---|---|---|
| Validated by miners | Yes | No (indexers/wallets) | Yes, but via contract code | Yes |
| Where the amount lives | UTXO script template field | Off-chain interpretation of OP_RETURN | Contract storage mapping | UTXO token prefix |
| Issuance control | Authority UTXOs (MINT/MELT/…) | Protocol-specific | Arbitrary contract code | Minting/mutable NFT capabilities |
| Metadata | Genesis OP_RETURN + signed off-chain TDD | Protocol-specific | Contract `name()`/`symbol()` etc. | Off-chain BCMR registries |

The CashTokens and ERC-20 columns are general background knowledge. I did not check them against primary sources for this article **[UNVERIFIED for those columns]**.

---

## 2. What a token is made of, field by field

### 2.1 Group ID
- **Size:** at least 32 bytes and at most 520 bytes (the stack element limit). See `GroupId.GROUP_ID_MIN_SIZE = 32` and `GROUP_ID_MAX_SIZE = 520` in LNK `primitives.kt:213-214`. SPEC-TMPL defines Group ID as *"a data string of 32 bytes or more"*. One older part of SPEC-GROUP says "20 or 32 bytes". That text comes from the BCH-era draft and conflicts with SPEC-TMPL, SPEC-UTXO and the code. The code accepts 32–520 bytes.
- **Derivation (wallet side, LNK `wallet.kt:7053-7073` `findGroupId`):**
  1. Serialize the **first input's outpoint**.
  2. If there is a genesis OP_RETURN, append it as a variable-sized byte vector.
  3. Append a uint64 `nonce`. Its top authority bits are replaced by the requested authority flags: `(nonce and ALL_AUTHORITIES.inv()) or authorityFlags`.
  4. Compute `hash = hash256(...)` (double SHA-256).
  5. Increment the nonce until the **last two bytes of the hash** (`hash[30]<<8 | hash[31]`) equal the requested **GroupIdFlags**.

  The genesis authority output then carries `authorityFlags or nonce` as its amount (`wallet.kt:7088-7090`). This explains why "normal" group IDs end in `…0000`, e.g. NiftyArt `cacf…b90000` (SPEC-TDD test vector).
  I did not find a primary spec page that states the consensus check for this derivation. The description above comes from the code **[consensus rule UNVERIFIED in spec]**.
- **Group ID flags** are stored in the last byte of the 32-byte ID (LNK `primitives.kt:201-206, 268-286`):
  - `COVENANT = 1`: *"output script template must match input"* (`isCovenanted()`).
  - `HOLDS_NEX = 2`: a "fenced" group. The NEX in group inputs and outputs must add up, and the token quantity field **must be 0**. The output's NEX amount is used as the quantity (`isFenced()`, and `script.kt:2216-2220`).
- **Addresses:** a group ID can also be written as a Nexa address. The spec says it uses cashaddr type 2 (SPEC-GROUP "Definitions"; e.g. `nexa:tr9v70…`). `GroupId(String)` accepts either the address form or hex (`primitives.kt:228-241`).

### 2.2 Quantity
- This is a signed 64-bit value in the code. A **negative value (top bit set) means the output is an authority**, and the token quantity is then 0 (`script.kt:2209-2215`). Normal token outputs therefore hold up to 2^63−1 units.

### 2.3 Subgroups
- A subgroup ID is `parentGroupId (32 bytes) + extra bytes` (`GroupId.subgroup()` at `primitives.kt:263-266`; `isSubgroup()`, `parentGroup()` and `subgroupData()` at `primitives.kt:255-261`).
- **Maximum extra data:** 520 − 32 = **488 bytes**. This follows from `GROUP_ID_MAX_SIZE` in the code. I did not find an explicit spec statement of this limit.
- Subgroups are how Nexa does NFTs and SFTs (see §5). A subgroup is created by a holder of the parent's **SUBGROUP** authority (see §4).

### 2.4 Authority outputs and flags
Authority flags are stored in the 64-bit amount field (LNK `primitives.kt:332-345`):

| Flag | Bit value | Meaning |
|---|---|---|
| `AUTHORITY` | `0x8000000000000000` | Marks this output as an authority, not a token amount |
| `MINT` | `0x4000000000000000` | Can create tokens |
| `MELT` | `0x2000000000000000` | Can destroy tokens |
| `BATON` | `0x1000000000000000` | Can create **new authority outputs** (pass on or copy authority) |
| `RESCRIPT` | `0x0800000000000000` | Can move tokens/authorities to a different script (relevant for covenanted groups) |
| `SUBGROUP` | `0x0400000000000000` | Can create subgroups |
| `ALL_AUTHORITIES` | OR of all the above | |

The lower bits of the authority amount hold the genesis **nonce** (`wallet.kt:7089`). `GroupInfo.isAuthority()` is at `primitives.kt:376`.
The per-flag meanings above come from the code (names, comments, and how `txCompleter` uses them at `wallet.kt:3738-3890`). spec.nexa.org does not have a normative page listing these bits **[exact consensus semantics of RESCRIPT/BATON UNVERIFIED in spec]**.

### 2.5 Token genesis info (on-chain)
This is an `OP_RETURN` output in the genesis transaction (SPEC-TDD "Token Genesis Information"). Each field is a separate push. `OP_FALSE` means the field is empty.
```
OP_RETURN 88888888 <ticker> <name> <uri> <32-byte doc hash> [decimal_places]
```
- `88888888` is the type identifier.
- Ticker and name are UTF-8. If they differ from the TDD, **the on-chain value wins**.
- `decimal_places` is a script number, for display only. Clients should support 0–18 decimal places. If the field is missing, decimals = 0.
- In the code, see `SatoshiScript.makeTokenDesc()` at `script.kt:2466-2480` and `GroupDescriptor.buildGenesisData()` at `token.kt:454-477`.
- The OP_RETURN is part of the group ID hash preimage (`wallet.kt:7060`). **You cannot change it after genesis.**

### 2.6 Token Description Document (off-chain)
This is a signed JSON file hosted at `<uri>`. The genesis commits to it with a SHA-256 hash. Details are in §3.

---

## 3. The Token Description Document (TDD) in detail

### 3.1 Exact format (SPEC-TDD)
The file is an I-JSON **array** with two elements: a dictionary, then a base64 signature string.
```json
[{
  "ticker": "string, required",
  "name": "string, optional",
  "summary": "string, optional",
  "description": "string, optional",
  "legal": "string, optional",
  "creator": "string, optional",
  "contact": { "method": "string, optional", "method2": "string, optional" },
  "icon": "string, optional, URI.",
  "category":"string, optional"
 },
"<signature>"]
```
- **ticker:** should be 6 characters or fewer.
- **legal:** put the full contract text here, not a link.
- **contact:** defined methods are `address`, `email`, `phone`, `twitter.com` and `facebook.com`. You can add your own; use a domain name or a protocol name with its colon.
- **icon:** a relative URI resolves against the TDD's domain. The icon is **not hash-committed**, so it can change after genesis. *"You MUST NOT repurpose this field to store an NFT image."*
- **category:** e.g. `coin`, `NFT`, `ticket`, `coupon`, `security`, `item`. Subcategories are dot-separated, e.g. `coin.wrapped fiat`.
- *"Authors may add additional fields not defined in this document to the initial dictionary."*

libnexakotlin parses the file into `TokenDesc` (`token.kt:76-101`). It parses with `ignoreUnknownKeys = true` (`token.kt:231-233`), so it keeps only `ticker, name, summary, description, legal, creator, category, contact, icon` plus the NFT extensions `nftId` and `nftUrl` (`token.kt:87-89`). `nftId`/`nftUrl` are libnexakotlin extensions. I did not find them on the SPEC-TDD page.

### 3.2 What is hashed, and how
- **Hash input:** the exact bytes of the dictionary, *from `{` to the matching `}` inclusive*. Do not re-serialize or reformat it. SPEC-TDD: *"Do not change spacing or parse to JSON and then encode back to a string."*
- **Algorithm:** single **SHA-256**. SPEC-TDD: "SHA256 of dictionary"; NiftyArt example `sha256sum nifty.json`. Code: `td.tddHash = libnexa.sha256(signedSlice)`, where `signedSlice = s.slice(s.indexOf("{") .. s.lastIndexOf("}"))` (`token.kt:249-253`).
  - Note that the code slices from the **first `{` to the last `}`** in the whole file. If your signature string or trailing text contains braces, the slice will be wrong.
- **Trailing newline:** remove it when you build the file. The spec says to `truncate -s -1`.
- **On-chain byte order:** in the NiftyArt genesis tx in SPEC-TDD, the OP_RETURN pushes `0b4abe…91fab0`. That is the **byte-reversed** form of the `sha256sum` output `b0fa91…4a0b`. Rostrum's `document_hash` shows the non-reversed form. libnexakotlin's `makeTokenDesc` takes a `Hash256` and pushes `.hash`, which is Hash256's internal byte order (`script.kt:2466-2474`). `GroupDescriptor.buildGenesisData()` pushes the raw `sha256` bytes (`token.kt:473`). **[UNVERIFIED]** Whether these two code paths produce the same byte order is not confirmed. Test against the NiftyArt vector before you mint.

### 3.3 Signature
- **Who signs:** the address that the **genesis authority output is locked to**. Use a pubkey-recoverable script such as P2PKT or P2PKH. Sign the genesis tx with SIGHASH ALL so nobody can malleate the OP_RETURN (SPEC-TDD "Token Genesis Transaction Recommendations").
- **Algorithm:** the Satoshi `signmessage` algorithm: double-SHA-256 of `"Bitcoin Signed Message:\n"+msg`, a recoverable ECDSA signature, then base64.
- **In the code:**
  - Signing: `wallet.signMessage(tdd.signedSlice, genesisAddr)` → `Codec.encode64`, then the final string `"[" + doc + ",\n\"" + sig + "\"\n]"` (`token.kt:479-491`; also `makeTokenDescriptionDoc` at `token.kt:177-184`).
  - Verification: `libnexa.recoverPubkeyFromSignedMessage(signedSlice, sig)` (`token.kt:264`), then `signedBy(address)` compares the recovered pubkey against a P2PKT/template args hash or a P2PKH hash160 (`token.kt:192-216`).
  - `decodeTokenDescDoc(grpId, doc, genesisTx)` finds the genesis authority output's address (`token.kt:280-299`).
- **Why the signature matters:** without it, anyone can create a new group that points at your URL and impersonate your token (SPEC-TDD).

### 3.4 How a wallet fetches and verifies the TDD (libnexakotlin `getTokenInfo`, `token.kt:303-440`)
1. Ask a P2P full node for token info (`get1TokenInfo`). If none supports it, ask Rostrum: `getTokenGenesisInfo` (`token.kt:338-401`).
2. Fetch the URI with `Url(uri).readText(5000 ms timeout)` (`token.kt:361`, `token.kt:414`).
3. Parse the document, recover the pubkey, and check that the signer is the genesis authority's address. If so, set `tddAddr` (`token.kt:374-375`, `418`).
4. **Hash check is done by Wally, not by `getTokenInfo`:** WALLY `assets.kt:1019-1020` caches the TDD only if `tg.document_hash == td.tddHash.toHex()`. If it doesn't match, the TDD is still returned but not cached as good (`assets.kt:1026-1029`). Wally does not reject the document, so check your own UI logic.

### 3.5 Can the URL be IPFS?
- **Spec:** *"The `<uri>` field supports http and https protocols"* (SPEC-TDD, "URI"). IPFS is not mentioned.
- **libnexakotlin:**
  - **Full-node path:** only fetches if the URI starts with `http:` or `https:` (`token.kt:357`). An `ipfs://` URI is silently skipped, and you get only the ticker and name from genesis.
  - **Rostrum path:** rejects blank, non-absolute, local and `file:` URLs, except on regtest (`token.kt:412`). It does not explicitly reject `ipfs://`, but it then calls the HTTP-client `Url.readText`. **[UNVERIFIED]** I expect that call to fail on a non-HTTP scheme, which would surface as an exception or a `TokenDataException`.
  - `grep -i ipfs` finds **no matches** in libnexakotlin `commonMain` or in Wally `shared/src`.
- **What works:** an **HTTPS IPFS gateway URL** (e.g. `https://<gateway>/ipfs/<CID>/token.json`) is an ordinary https URL, so it works. The hash plus signature protects integrity even if the gateway is untrusted. The gateway's availability is still your dependency. Also, NFT lookups derive `/raw/<id>` and `/public/<id>` paths from the TDD URL's host (WALLY `assets.kt:896-912`). A public gateway host won't serve those paths, so Wally falls back to niftyart.cash and nexa.space.
- **What doesn't work:** `ipfs://` URIs.

---

## 4. "Is it like a JSON object I can put any data string I want into?"

**Short answer: partly.** The on-chain token is **not** a free-form JSON object. It is a fixed binary structure: a group ID, an amount, and template fields. Free-form data can go in a few specific places:

| Place | Free-form? | Limits / rules |
|---|---|---|
| Group ID (32 bytes) | **No.** It is a hash of outpoint + OP_RETURN + nonce, with flag bits | Exactly 32 bytes for the parent group |
| Amount | **No.** It is a number or authority flags | 2/4/8 bytes |
| **Subgroup bytes** | **Yes, arbitrary bytes** | Up to 488 bytes (520 − 32, from the code). For spec-conforming NFTs these bytes MUST be the double SHA-256 of the NFT zip (SPEC-NFT) |
| Genesis OP_RETURN | Fixed field order and meaning. The values are free UTF-8 text | Ticker, name and URI strings, a 32-byte hash, decimals. Max OP_RETURN size **[UNVERIFIED]**: I did not find Nexa's standardness limit in the sources I checked. The data is also immutable |
| NFT OP_RETURN `88888889` | Fixed fields: title, hash, URL, optional public-zip hash | Same as above |
| **TDD JSON dictionary** | **Yes.** Defined fields, *plus any additional fields you add* | Hash-committed and signed, so it is immutable once genesis is mined. Stays off-chain. Wally/libnexakotlin ignore unknown keys |
| **NFT zip `info.json`** | **Yes.** `data: {…}` is explicitly "application-specific", and `bindata` is hex | Zip ≤ 50 MB recommended. `cardf`/`cardb` ≤ 2 MB each. Never re-zip the file |

So the off-chain TDD and the NFT `info.json` are the "JSON objects you can put anything in". The chain commits only to their hash.

---

## 5. Authorities and lifecycle walkthrough

- **Creating authorities:** the genesis tx creates one authority output, with `ALL_AUTHORITIES` by default (`iWallet.kt:699`).
- **Passing authority on (BATON):** an authority input that has BATON can create new authority outputs for the same group. In libnexakotlin, `txCompleter` brings the authority back to the wallet when BATON is set (`wallet.kt:3828`, `3889`). It also has a `NO_BATON_AUTHORITIES` flag (`wallet.kt:3775`).
- **Destroying authorities:** spend the authority output without recreating it. For example, send its NEX to a plain, ungrouped output.
- **Fixed supply:** mint the full supply, then destroy *every* authority output that carries MINT. Do not forget copies made with BATON. Keeping MELT allows only burns. The rule that nothing can mint without a MINT authority follows from the inputs-equal-outputs rule in SPEC-GROUP.

**Walkthrough with nexa-cli (SPEC-GROUP RPCs)**
1. Create the token: `token new [address] NIFTY NiftyArt https://…/nifty.json <sha256>`. It returns the `groupIdentifier`, the tx and `tokenDescriptorSigningAddress`.
2. Sign the TDD: `signmessage <signingAddr> "$(cat nifty.json)"`. Then wrap it as `[dict, "sig"]` and host it.
3. Mint: `token mint <group> <addr> 100000`
4. Transfer: `token send <group> <addr> 42`
5. Melt: `token melt <group> <addr> 100`
6. Renew or delegate authority: build a tx that spends a BATON authority and outputs new authority outputs. I did not confirm a dedicated `token authority create` RPC on spec.nexa.org **[UNVERIFIED]**.
7. Create an NFT: spend a SUBGROUP authority and output to `parent+hash256(zip)` with quantity 1 (see the Kotlin code below).

---

## 6. NFTs on Nexa

- **An NFT is a subgroup** whose extra bytes are the **double SHA-256 of a `.zip` file** (SPEC-NFT "As a subgroup").
- **Zip contents:**
  - `info.json`, with fields `niftyVer` ("2"), `title`, `author`, `keywords`, `info`, `license` (all mandatory) and `series`, `appuri`, `category`, `bindata`, `data` (optional)
  - `cardf.<ext>`, `cardb.<ext>`, `public.<ext>` and `owner.<ext>`
  - Supported image and video formats are listed in SPEC-NFT.
- **Optional genesis OP_RETURN:** `88888889 <title> <hash256(zip)> <url> [hash256(public zip)]`.
- **Marketplace routes:** `/token/{id}`, `/raw/{id}?chalby=…` and `/public/{id}`. Note that a `/public` file's hash will *not* match the group ID.
- **How Wally finds and displays an NFT** (WALLY):
  1. It tries `td.nftUrl` first.
  2. Then it tries `<TDD host>/raw/<id>` and `/public/<id>`.
  3. Then it falls back to `niftyart.cash` and `nexa.space` (`assets.kt:94-105`, `896-912`, `1066-1067`).
  4. It checks `hash256(zip) == subgroupData()`. It also accepts plain `sha256` as a "nonstandard" fallback (`assets.kt` ~1089-1101).
  5. It shows the `cardf*` file as the front, `cardb*` as the back, and reads `info.json` (`assets.kt:485-568`).
  6. Fungible tokens show the ticker, name and icon from the TDD (or from genesis if no TDD is available).

---

## 7. Kotlin examples (libnexakotlin)

These APIs exist in the code at the cited lines. Wallet setup is omitted.

```kotlin
// 1. Build genesis OP_RETURN with a TDD commitment            (token.kt:443-477)
val tddDict = """{"ticker":"DEMO","name":"Demo Token","summary":"test"}"""  // exact bytes!
val gd = GroupDescriptor(ticker = "DEMO", name = "Demo Token",
                         docUri = "https://example.com/demo.json", doc = tddDict, decimals = 2)
val opRet: SatoshiScript = gd.buildGenesisData()

// 2. Create the group; returns unsent tx + GroupId           (iWallet.kt:699, wallet.kt:7083-7093)
val authAddr = wallet.getnewaddress()
val (genesisTx, gid) = wallet.newToken(authAddr, opRet, GroupIdFlags.NONE.v)  // default ALL_AUTHORITIES
wallet.send(genesisTx)

// 3. Signed TDD to host at docUri, signed by the genesis address  (token.kt:479-491)
val tddFile: String? = gd.buildTokenDescriptionDoc(wallet, authAddr)

// 4. Mint                                                    (iWallet.kt:712, wallet.kt:7096-7101)
wallet.send(wallet.mintTokens(wallet.getnewaddress(), gid, 1_000_000L))

// 5. Transfer tokens                                         (iWallet.kt:551-557)
wallet.send(42L, PayAddress("nexa:..."), gid)

// 6. NFT as a subgroup                                       (primitives.kt:263, iWallet.kt:1156)
val zip: ByteArray = /* your .nft zip bytes */ byteArrayOf()
val nftGid = gid.subgroup(libnexa.hash256(zip))
wallet.send(wallet.createSubgroup(wallet.getnewaddress(), nftGid, 1UL, null))

// 7. Inspect an output                                       (script.kt:2192, primitives.kt:350, 376)
val gi = someOutput.script.groupInfo(someOutput.amount)
if (gi?.isAuthority() == true) println(GroupAuthorityFlags.toString(gi.authorityFlags))

// 8. Fetch + verify a TDD                                    (token.kt:303)
val td = getTokenInfo(gid, { /* ElectrumClient */ TODO() }, null)
val ok = td.tddHash?.toHex() == td.genesisInfo?.document_hash && td.tddAddr != null
```

```kotlin
// PSEUDOCODE (no dedicated melt / authority-renew helper found in libnexakotlin)
// melt: tx inputs = tokens + MELT authority; outputs = fewer tokens (+ authority back if BATON)
// renew: input = authority with BATON; outputs = N new authority outputs with chosen flag subsets
// burn mint: spend every MINT authority to ungrouped outputs only
```

`wallet.send(tx)` is in `iWallet.kt:654`. Note that `wallet.getnewaddress()` is used in `groupTokenTests.kt:206`.

---

## 8. Pitfalls and security notes

1. **The TDD hash breaks on whitespace.** A trailing newline, editor reformatting, or re-encoding the JSON will all break it. libnexakotlin slices from the first `{` to the last `}`.
2. **Genesis data is permanent.** The ticker, name, URI, hash and decimals are part of the group ID preimage. If they are wrong, you must create a new group (SPEC-TDD).
3. **Lock the genesis authority to a P2PKT/P2PKH address,** otherwise TDD signature verification is impossible. Sign the genesis tx with SIGHASH ALL.
4. **Wally does not hard-fail on a hash mismatch.** It only skips caching (WALLY `assets.kt:1020-1029`). Show unverified metadata as untrusted in your UI.
5. **Use http(s) only; `ipfs://` is not fetched.** Use https rather than http, to prevent man-in-the-middle attacks on the domain binding.
6. **The `icon` URL is not committed.** It can change at any time, so never use it as NFT content.
7. **Wallets should not show reserved tickers** (NEX, ISO-4217 currency codes, stock tickers); SPEC-TDD recommends showing `???` instead.
8. **BATON copies authority.** For a provably fixed supply, audit *every* authority UTXO.
9. **HOLDS_NEX groups need a 0 token quantity.** COVENANT groups need the same script template on output as on input (RESCRIPT is needed to change it).
10. **Never re-zip an NFT.** Its hash is its identity.
11. **Each token output needs dust NEX.** Fees are paid in NEX.

---

## Not verified
- The consensus-level rules for the group ID / nonce / flags derivation, and the exact consensus meaning of the BATON and RESCRIPT bits. These come from the code only.
- The maximum OP_RETURN size for genesis data.
- Whether `makeTokenDesc` and `GroupDescriptor.buildGenesisData` push the hash in the same byte order.
- How `Url.readText` behaves with `ipfs://` (likely failure).
- An RPC for renewing authorities.
- The ERC-20 and CashTokens comparison details.
