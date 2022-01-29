
# Knowledge Bomb :bomb:

An alternative to Wikipedia "random article", a vocabulary quiz game, an undercurrent idea generator, available in 300+ languages 🌍🌏🌎 https://www.knb.wiki

## Data mining from Wikipedia

The game content is data mined and analysed from Wikipedia articles and Wikidata items by multiple dimensions: languages clustering, hypernyms categorization, complexity scoring, etc. 

### Hypernym Hierarchy

All Wikidata items / Wikipedia articles are categorized in buckets. The design principle is: gameplay first, performance (query speed) second, academic last; coarsely classifying as a decision tree, instead of networking as an ontologically precise semantic graph. The tree branches are grown and pruned to achieve balanced number of items/articles per node.

The 64 top-level hypernyms of controlled vocabulary are presented for players to pick during the game by detonating 💣

Different views of the hypernym hierarchy:

- [Hilbert curve](docs/hypernym-hierarchy.md#Hilbert-curve)
- [Monospaced Hilbert curve](docs/hypernym-hierarchy.md#Monospaced-Hilbert-curve)
- [Compact tiles](docs/hypernym-hierarchy.md#Compact-tiles)
- [Tree path](docs/hypernym-hierarchy.md#Tree-path)
- [Monospaced tree path](docs/hypernym-hierarchy.md#Monospaced-tree-path)

### 2D language picker

The 🗺 [2D language picker](docs/lexi_map.PNG) keeps the constant position of each language no matter choosing which language to display. It solves the problem of one dimentional language pickers (re)ordering certain languages alphabetically at various positions that hard to find, e.g. *Deutsche* - _**A**leman_, _**I**naleman_, _**L**ialémani_, _**B**éésh bichʼahii_, _**C**eruman_, _**D**uits_, _**E**leman_, _**F**rangikos_, _**G**erman_, _**J**erman_, _**K**rzyżacki_, _**M**jymjecko_, _**Н**емецкий_, _**N**émet_, _**O**lmoni_, _**P**reisen_, _**R**ajchski_, _**S**aksa_, _**𐌸**𐌹𐌿𐌳𐌹𐍃𐌺𐌰𐍂𐌰𐌶𐌳𐌰_, _**Þ**ýska_, _**T**ysk_, _**U**budage_, _**V**ācu_, _**W**eimarische_, _**Y**oeraman_, _**Z**ėm_, etc.

[![a](docs/lexi_map_brain.PNG)](docs/lexi_map.PNG)

🗺 is also availble in game as a cheatsheet (hit top menubar ⌨ for hotkeys).

[Design considerations](docs/languages-cluster.md#Design-considerations)

### List of Wikipedias - Languages ranking table

Ranking is based on numbers of [qualified Wikidata items](#Qualified-Wikidata-items) per language.
(*wonder where's the swedish cebuano?*)

[Columns description](docs/languages-ranking.md)

| Rank | Language(Local) | Language | Wiki | Coverage% | Q60 :1st_place_medal: | Q50 :2nd_place_medal: | Q40 :3rd_place_medal: | Q30 :medal_sports: | Q20 :medal_military: | WSM | Articles | Solidness% | Speakers |
|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | English | English | en | 100.00% | 5265 | 7845 | 12532 | 20969 | 38482 | 9080.18 | 6424700 | 4.07% | 1348000 |
| 2 | Español | Spanish | es | 98.17% | 5254 | 7798 | 12383 | 20511 | 36588 | 8996.87 | 1738225 | 14.77% | 586000 |
| 3 | Français | French | fr | 97.96% | 5242 | 7787 | 12348 | 20427 | 36468 | 8987.09 | 2381920 | 10.76% | 274000 |
| 4 | Русский | Russian | ru | 97.59% | 5251 | 7805 | 12401 | 20385 | 35823 | 8970.06 | 1779001 | 14.35% | 258000 |
| 5 | Deutsch | German | de | 95.89% | 5150 | 7623 | 12080 | 19913 | 35258 | 8891.75 | 2643273 | 9.49% | 135000 |
| 6 | Українська | Ukrainian | uk | 95.52% | 5259 | 7827 | 12397 | 20009 | 33019 | 8874.50 | 1128056 | 22.15% | 40000 |
| 7 | Português | Portuguese | pt | 94.92% | 5174 | 7673 | 12136 | 19753 | 33533 | 8846.33 | 1078928 | 23.01% | 274000 |
| 8 | Italiano | Italian | it | 94.84% | 5155 | 7638 | 12053 | 19634 | 34073 | 8842.92 | 1730998 | 14.33% | 85000 |
| 9 | 中文 | Chinese | zh | 94.72% | 5250 | 7792 | 12276 | 19708 | 32463 | 8837.26 | 1245720 | 19.89% | 1120000 |
| 10 | 日本語 | Japanese | ja | 94.47% | 5230 | 7744 | 12165 | 19558 | 32699 | 8825.35 | 1305277 | 18.93% | 128000 |
| 11 | Nederlands | Dutch | nl | 93.65% | 5257 | 7742 | 12093 | 19339 | 31590 | 8787.27 | 2074259 | 11.81% | 30000 |
| 12 | العربية | Arabic | ar | 93.16% | 5262 | 7806 | 12150 | 19203 | 30778 | 8764.37 | 1149073 | 21.20% | 274000 |
| 13 | Polski | Polish | pl | 93.05% | 5141 | 7575 | 11937 | 19269 | 32035 | 8758.93 | 1500377 | 16.22% | 45000 |
| 14 | Català | Catalan | ca | 92.74% | 5214 | 7705 | 12050 | 19125 | 30748 | 8744.42 | 692111 | 35.05% | 10000 |
| 15 | فارسی | Persian | fa | 91.96% | 5263 | 7835 | 12141 | 18866 | 29321 | 8707.67 | 849228 | 28.32% | 74000 |
| 16 | 한국어 | Korean | ko | 90.98% | 5237 | 7721 | 11941 | 18585 | 28811 | 8661.02 | 569320 | 41.79% | 82000 |
| 17 | Svenska | Swedish | sv | 90.92% | 5132 | 7565 | 11820 | 18696 | 29433 | 8658.00 | 2820221 | 8.43% | 13000 |
| 18 | Čeština | Czech | cs | 88.35% | 5097 | 7488 | 11591 | 17926 | 27213 | 8534.71 | 493744 | 46.80% | 14000 |
| 19 | Suomi | Finnish | fi | 87.43% | 5071 | 7451 | 11493 | 17617 | 26438 | 8490.23 | 521190 | 43.87% | 6000 |
| 20 | Bahasa Indonesia | Indonesian | id | 86.51% | 5140 | 7513 | 11406 | 17079 | 25379 | 8445.50 | 608149 | 37.20% | 199000 |
| 21 | Türkçe | Turkish | tr | 85.73% | 5084 | 7428 | 11283 | 16989 | 24877 | 8407.55 | 461700 | 48.56% | 88000 |
| 22 | Norsk (Bokmål) | Norwegian (Bokmål) | no | 84.24% | 5022 | 7294 | 11088 | 16654 | 24082 | 8334.09 | 572167 | 38.51% | 5000 |
| 23 | עברית | Hebrew | he | 83.53% | 4965 | 7206 | 10871 | 16286 | 23866 | 8298.69 | 307833 | 70.97% | 9000 |
| 24 | Српски / Srpski | Serbian | sr | 81.16% | 5145 | 7432 | 10886 | 15200 | 20230 | 8180.39 | 652901 | 32.51% | 12000 |
| 25 | Esperanto | Esperanto | eo | 80.46% | 5074 | 7278 | 10668 | 14974 | 20333 | 8145.04 | 308208 | 68.28% | 180 |
|320 | [see 295 more...](docs/languages-ranking.md)  |   |   |   |   |   |   |   |   |   |   |   |   |


### Qualified Wikidata items

A qualified article ([examples](data/sample_titles.csv)) should be a general, universal, common concept or knowledge, which satisfies these criteria:

- With more than *20* languages versions.
- Not an onomatology (anthroponymy, toponymy, hydronym, taxon etc.), which is not a particular person, place, biota, chemical, astronomical object, company, product, publication, song, team, sport match, event, year, decade, day, unicode, etc.
- Not a disambiguation page item.
- Can be hypernyms of items above (any level of parents of `instance_of?/subclass_of*`). Hypernyms are legitimate to have less than 20 languages versions, being small quantity of abstract philosophical terms backboning the semantic network.
- Last but not least, every qualified item/article should have been passed through proofreading for quality check.
