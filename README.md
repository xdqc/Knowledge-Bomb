
# Knowledge Bomb :bomb:

A "random wiki roamer" minigame, a "vocabulary test" tool, a "quiz generator" vis-à-vis Wikipedia, available in 300+ languages 🌍🌏🌎 https://www.knb.wiki

## Data mining from Wikipedia

### Qualified Wikidata items

A qualified article ([examples](data/sample_titles.csv)) should be a general, universal, common concept or knowledge, which satisfies these criteria:

- With more than *20* languages versions.
- Not a Onomatology (Anthroponymy, Taxon, Toponomastics, Hydronym, etc.), which is not a particular person, place, biota, event, chemical, astronomical object, company, product, publication, team, sport match, song, year, decade, day, unicode, etc.
- Can be Hypernym of (`instance_of?/subclass_of*`) items above.
- Not a disambiguation page.

### Hypernym Hierarchy

All Wikidata items / Wikipedia articles are categorized in the following buckets. The design principle is to achieve balanced number of items/articles per node for gameplay, classifying as a decision tree, instead of networking as an ontologically precise semantic graph.

```
Node          Path                                                                 Monospaced
-----------------------------------------------------------------------------------------------
151885        /Concept                                                             道
.17737        /Concept/Theory                                                      ├─論
..41719       /Concept/Theory/Hypothesis                                           │ └─設
.468777       /Concept/Existence                                                   ├─有
..12827256    /Concept/Existence/Myth                                              │ ├─神
..7257        /Concept/Existence/Ideology                                          │ └─意
...9174       /Concept/Existence/Ideology/Religion                                 │   └─教
.395          /Concept/Mathematics                                                 ├─學
..17736       /Concept/Mathematics/Axiom                                           │ ├─理
..65943       /Concept/Mathematics/Theorem                                         │ ├─則
..207961      /Concept/Mathematics/Shape                                           │ └─形
.35120        /Concept/Entity                                                      └─實
..11471       /Concept/Entity/Time                                                   ├─時
...483247     /Concept/Entity/Time/Phenomenon                                        │ ├─象
...309        /Concept/Entity/Time/History                                           │ ├─史
...4026292    /Concept/Entity/Time/Action                                            │ ├─為
....9332      /Concept/Entity/Time/Action/Behavior                                   │ │ ├─行
.....11042    /Concept/Entity/Time/Action/Behavior/Culture                           │ │ │ ├─文
.....349      /Concept/Entity/Time/Action/Behavior/Sport                             │ │ │ ├─健
.....11410    /Concept/Entity/Time/Action/Behavior/Game                              │ │ │ ├─戲
.....735      /Concept/Entity/Time/Action/Behavior/Art                               │ │ │ └─藝
......483394  /Concept/Entity/Time/Action/Behavior/Art/Genre                         │ │ │   └─風
....2695280   /Concept/Entity/Time/Action/Technique                                  │ │ └─技
...1150070    /Concept/Entity/Time/Change                                            │ └─變
....12136     /Concept/Entity/Time/Change/Disease                                    │   └─疾
..7239        /Concept/Entity/Organism                                               ├─生
...514        /Concept/Entity/Organism/Anatomy                                       │ └─解
..6671777     /Concept/Entity/Structure                                              ├─構
...58778      /Concept/Entity/Structure/System                                       │ └─系
....16887380  /Concept/Entity/Structure/System/Group                                 │   └─群
.....43229    /Concept/Entity/Structure/System/Group/Organization                    │     ├─組
.....41710    /Concept/Entity/Structure/System/Group/Ethnic_group                    │     └─族
..937228      /Concept/Entity/Property                                               ├─性
...1207505    /Concept/Entity/Property/Quality                                       │ ├─品
....315       /Concept/Entity/Property/Quality/Language                              │ │ └─語
...47574      /Concept/Entity/Property/Unit_of_measurement                           │ ├─衡
...4373292    /Concept/Entity/Property/Physical_property                             │ └─質
....2221906   /Concept/Entity/Property/Physical_property/Location                    │   └─輿
..488383      /Concept/Entity/Object                                                 └─彼
...187931     /Concept/Entity/Object/Phrase                                            ├─言
...11028      /Concept/Entity/Object/Information                                       ├─信
....3695082   /Concept/Entity/Object/Information/Sign                                  │ ├─記
....49848     /Concept/Entity/Object/Information/Document                              │ ├─書
....9081      /Concept/Entity/Object/Information/Knowledge                             │ └─知
.....80083    /Concept/Entity/Object/Information/Knowledge/Humanities                  │   ├─伦
.....336      /Concept/Entity/Object/Information/Knowledge/Science                     │   └─格
......11016   /Concept/Entity/Object/Information/Knowledge/Science/Technology          │     ├─工
......21198   /Concept/Entity/Object/Information/Knowledge/Science/Computer_science    │     └─計
...223557     /Concept/Entity/Object/Physical_object                                   └─物
....35758     /Concept/Entity/Object/Physical_object/Matter                              ├─粒
....79529     /Concept/Entity/Object/Physical_object/Chemical_substance                  ├─素
....6999      /Concept/Entity/Object/Physical_object/Astronomical_object                 ├─星
....28877     /Concept/Entity/Object/Physical_object/Goods                               └─貨
.....121359   /Concept/Entity/Object/Physical_object/Goods/Infrastructure                  ├─建
.....39546    /Concept/Entity/Object/Physical_object/Goods/Tool                            ├─具
......11019   /Concept/Entity/Object/Physical_object/Goods/Tool/Machine                    │ ├─械
......34379   /Concept/Entity/Object/Physical_object/Goods/Tool/Instrument                 │ └─器
.....11460    /Concept/Entity/Object/Physical_object/Goods/Clothing                        ├─衣
.....2095     /Concept/Entity/Object/Physical_object/Goods/Food                            └─食
......40050   /Concept/Entity/Object/Physical_object/Goods/Food/Drink                        └─飲
```

### 2D Language picker based on lexical distance map

This 🗺 [2D language picker](docs/lexi_map.PNG) keeps the constant position of each language no matter showing in which language setting. It solves the problem of one dimentional language pickers (re)ordering languages alphabetically (even non alphabetical writing system) on various positions that hard to find: **A**leman, **I**naleman, **L**ialémani, **B**ich'ahii, **C**eruman, **D**uits, **E**leman, **F**rangikos, **G**erman,  **J**erman, **K**rzyżacki, **M**jymjecko, **Н**емецкий, **N**émet, **O**lmon, **P**reisen, **R**ajch, **S**aksa, **𐌸**𐌹𐌿𐌳𐌹𐍃𐌺𐌰𐍂𐌰𐌶𐌳𐌰, **Þ**ýska, **T**ysk, **U**budage, **V**ācu, **W**eimar, **Y**oeraman, **Z**ėm, **独**逸, **德**意志 ...

Design principles:

  1. Easy to pick - align to grid
  2. Based on lexical distance - Afrikaans, ייִדיש are placed at West Germanic of Indo-European
  5. Major languages on top or bottom of their blobs that quick to be found
  3. Respect relative geolocation and culture similarity within blob
  6. Extinct languages next to major languages - Classical Chinese, Sanskrit, Aramaic, Latin, Gothic, Ænglisc
  4. Isolated languages look isolated - Basque, Greek, Albanian, Armenian, Chuvash, etc.
  7. Screen real estate - no overlapping in most languages on 1300px minimum width
  8. Background image is only for decoration

### List of languages ranking table

Ranking is based on numbers of [qualified Wikidata items](#Qualified-Wikidata-items) per language.

  - **`Q60`** is the number of qualified wikipedia articles with more than *60* language versions, so as `Q50` `Q40` `Q30` `Q20`.
  - **`WSM`**, weighted sum model, is square root of sum of squares of language_versions_count of qualified articles of the language.
  - **`Coverage%`** is the language WSM to English WSM ratio.
  - **`Articles`** is total [number of Wikipedia articles by language](https://meta.wikimedia.org/wiki/List_of_Wikipedias).
  - **`Solidness%`** is WSM to article ratio, using simple_english as 100% benchmark. Higher solidness means less proportion of trivial articles of that language.
  - **`Speakers`** is L1+L2 speakers of the language in thousand (source: wikipedia of each language).

| Rank |                     Language(Local) | Language                  | Wiki         | Coverage% |  Q60 :1st_place_medal: |  Q50 :2nd_place_medal: | Q40 :3rd_place_medal: | Q30 :medal_sports: | Q20 :medal_military: |     WSM | Articles | Solidness% | Speakers |
|-----:|------------------------------------:|---------------------------|--------------|----------:|--------:|------------:|---------:|-----------:|-----------:|---------:|---------:|-----------:|---------:|
| 1 | English | English | en | 100.00% | 5253 | 7826 | 12496 | 20943 | 38487 | 9070.02 | 6424700 | 4.07% | 1348000 |
| 2 | Español | Spanish | es | 98.20% | 5244 | 7780 | 12347 | 20484 | 36586 | 8988.16 | 1738225 | 14.77% | 586000 |
| 3 | Français | French | fr | 98.02% | 5232 | 7771 | 12316 | 20405 | 36486 | 8979.64 | 2381920 | 10.75% | 274000 |
| 4 | Русский | Russian | ru | 97.65% | 5239 | 7786 | 12367 | 20362 | 35836 | 8962.79 | 1779001 | 14.35% | 258000 |
| 5 | Deutsch | German | de | 95.85% | 5136 | 7601 | 12038 | 19882 | 35221 | 8879.89 | 2643273 | 9.48% | 135000 |
| 6 | Українська | Ukrainian | uk | 95.60% | 5248 | 7809 | 12366 | 19990 | 33032 | 8868.23 | 1128056 | 22.15% | 40000 |
| 7 | Português | Portuguese | pt | 94.99% | 5163 | 7654 | 12103 | 19732 | 33548 | 8839.95 | 1078928 | 23.01% | 274000 |
| 8 | Italiano | Italian | it | 94.91% | 5145 | 7623 | 12022 | 19616 | 34073 | 8836.39 | 1730998 | 14.33% | 85000 |
| 9 | 中文 | Chinese | zh | 94.74% | 5235 | 7770 | 12237 | 19680 | 32449 | 8828.36 | 1245720 | 19.88% | 1120000 |
| 10 | 日本語 | Japanese | ja | 94.48% | 5216 | 7725 | 12128 | 19529 | 32653 | 8816.06 | 1305277 | 18.92% | 128000 |
| 11 | Nederlands | Dutch | nl | 93.68% | 5245 | 7724 | 12063 | 19309 | 31552 | 8778.74 | 2074259 | 11.80% | 30000 |
| 12 | العربية | Arabic | ar | 93.19% | 5250 | 7789 | 12114 | 19174 | 30753 | 8755.94 | 1149073 | 21.20% | 274000 |
| 13 | Polski | Polish | pl | 93.13% | 5129 | 7555 | 11906 | 19247 | 32036 | 8752.76 | 1500377 | 16.22% | 45000 |
| 14 | Català | Catalan | ca | 92.78% | 5201 | 7686 | 12013 | 19099 | 30716 | 8736.38 | 692111 | 35.03% | 10000 |
| 15 | فارسی | Persian | fa | 92.02% | 5251 | 7818 | 12106 | 18846 | 29311 | 8700.49 | 849228 | 28.32% | 74000 |
| 16 | Svenska | Swedish | sv | 90.99% | 5120 | 7550 | 11788 | 18681 | 29417 | 8651.85 | 2820221 | 8.43% | 13000 |
| 17 | 한국어 | Korean | ko | 90.98% | 5225 | 7700 | 11896 | 18545 | 28753 | 8651.40 | 569320 | 41.77% | 82000 |
| 18 | Čeština | Czech | cs | 88.43% | 5084 | 7471 | 11564 | 17900 | 27194 | 8529.15 | 493744 | 46.81% | 14000 |
| 19 | Suomi | Finnish | fi | 87.50% | 5060 | 7431 | 11462 | 17589 | 26427 | 8484.01 | 521190 | 43.87% | 6000 |
| 20 | Bahasa Indonesia | Indonesian | id | 86.52% | 5126 | 7491 | 11367 | 17030 | 25330 | 8436.50 | 608149 | 37.18% | 199000 |
| 21 | Türkçe | Turkish | tr | 85.80% | 5072 | 7410 | 11250 | 16958 | 24860 | 8401.21 | 461700 | 48.57% | 88000 |
| 22 | Norsk (Bokmål) | Norwegian (Bokmål) | no | 84.35% | 5013 | 7278 | 11060 | 16640 | 24083 | 8330.02 | 572167 | 38.53% | 5000 |
| 23 | עברית | Hebrew | he | 83.60% | 4957 | 7191 | 10838 | 16267 | 23846 | 8292.81 | 307833 | 70.97% | 9000 |
| 24 | Српски / Srpski | Serbian | sr | 81.29% | 5133 | 7416 | 10864 | 15192 | 20257 | 8177.55 | 652901 | 32.54% | 12000 |
| 25 | Esperanto | Esperanto | eo | 80.48% | 5059 | 7257 | 10626 | 14927 | 20294 | 8136.94 | 308208 | 68.25% | 180 |
| 26 | Tiếng Việt | Vietnamese | vi | 79.39% | 5028 | 7136 | 10252 | 14451 | 20036 | 8081.41 | 1269556 | 16.34% | 77000 |
| 27 | Български | Bulgarian | bg | 78.38% | 5005 | 7179 | 10390 | 14357 | 18795 | 8030.12 | 277631 | 73.79% | 8000 |
| 28 | Euskara | Basque | eu | 77.76% | 5028 | 7139 | 10193 | 13944 | 18195 | 7997.98 | 384549 | 52.85% | 1000 |
| 29 | Dansk | Danish | da | 77.65% | 4826 | 6886 | 10097 | 14361 | 19453 | 7992.35 | 271149 | 74.84% | 6000 |
| 30 | Română | Romanian | ro | 77.12% | 4914 | 6964 | 10043 | 13944 | 18519 | 7965.05 | 425577 | 47.36% | 29000 |
| 31 | Simple English | Simple English | simple | 76.57% | 4926 | 6993 | 9964 | 13685 | 18023 | 7936.62 | 200113 | 100.00% |      |
| 32 | Eesti | Estonian | et | 75.10% | 4796 | 6757 | 9667 | 13361 | 17607 | 7859.89 | 223711 | 87.73% | 1000 |
| 33 | Magyar | Hungarian | hu | 74.35% | 4600 | 6488 | 9435 | 13399 | 18617 | 7820.69 | 496492 | 39.14% | 13000 |
| 34 | Hrvatski | Croatian | hr | 73.08% | 4812 | 6691 | 9349 | 12512 | 15993 | 7753.74 | 209767 | 91.05% | 6000 |
| 35 | Ελληνικά | Greek | el | 70.98% | 4615 | 6388 | 8871 | 11947 | 15492 | 7641.37 | 201936 | 91.86% | 14000 |
| 36 | Srpskohrvatski / Српскохрватски | Serbo-Croatian | sh | 70.67% | 4699 | 6425 | 8875 | 11690 | 14885 | 7624.78 | 455943 | 40.51% | 21000 |
| 37 | Galego | Galician | gl | 69.65% | 4664 | 6316 | 8650 | 11297 | 14399 | 7569.40 | 178381 | 102.04% | 2000 |
| 38 | Lietuvių | Lithuanian | lt | 69.59% | 4586 | 6296 | 8675 | 11508 | 14690 | 7566.43 | 200957 | 90.51% | 3000 |
| 39 | Slovenčina | Slovak | sk | 69.07% | 4482 | 6220 | 8663 | 11603 | 14853 | 7537.97 | 238430 | 75.71% | 5000 |
| 40 | Հայերեն | Armenian | hy | 68.00% | 4400 | 6024 | 8326 | 11318 | 14722 | 7479.24 | 289507 | 61.38% | 7000 |
| 41 | ไทย | Thai | th | 66.85% | 4394 | 5910 | 8023 | 10690 | 13865 | 7415.58 | 144431 | 120.96% | 61000 |
| 42 | 粵語 | Cantonese | zh-yue | 66.09% | 4640 | 6047 | 7774 | 9783 | 12168 | 7373.79 | 121421 | 142.26% | 85000 |
| 43 | Bahasa Melayu | Malay | ms | 65.92% | 4397 | 5904 | 7862 | 10322 | 13040 | 7364.22 | 355532 | 48.46% | 200000 |
| 44 | Slovenščina | Slovenian | sl | 65.42% | 4210 | 5782 | 7955 | 10557 | 13562 | 7335.99 | 174487 | 97.98% | 2000 |
| 45 | Беларуская | Belarusian | be | 65.05% | 4383 | 5778 | 7706 | 9970 | 12635 | 7315.06 | 212460 | 80.01% | 11000 |
| 46 | Azərbaycanca | Azerbaijani | az | 63.53% | 4223 | 5654 | 7608 | 9758 | 12259 | 7229.61 | 180871 | 91.80% | 23000 |
| 47 | Nynorsk | Norwegian (Nynorsk) | nn | 62.87% | 4168 | 5499 | 7372 | 9515 | 11822 | 7191.50 | 160808 | 102.17% | 5000 |
| 48 | हिन्दी | Hindi | hi | 62.05% | 4117 | 5477 | 7270 | 9369 | 11723 | 7144.47 | 151384 | 107.12% | 600000 |
| 49 | தமிழ் | Tamil | ta | 61.74% | 4169 | 5446 | 7072 | 8961 | 11147 | 7127.01 | 142992 | 112.85% | 85000 |
| 50 | Latviešu | Latvian | lv | 61.71% | 4550 | 5628 | 6870 | 8130 | 9367 | 7124.99 | 110030 | 146.58% | 2000 |
| 51 | 吴语 | Wu | wuu | 61.13% | 5177 | 6108 | 6623 | 7180 | 7744 | 7091.67 | 42662 | 374.51% | 82000 |
| 52 | Македонски | Macedonian | mk | 58.66% | 3921 | 5143 | 6691 | 8389 | 10186 | 6946.57 | 121484 | 126.19% | 2000 |
| 53 | Қазақша | Kazakh | kk | 57.98% | 3779 | 5038 | 6699 | 8585 | 10676 | 6906.61 | 230349 | 65.79% | 19000 |
| 54 | Latina | Latin | la | 56.61% | 3890 | 4825 | 6029 | 7404 | 8992 | 6824.49 | 136494 | 108.40% |      |
| 55 | Asturianu | Asturian | ast | 56.49% | 3885 | 4990 | 6204 | 7447 | 8748 | 6817.19 | 128538 | 114.86% | 1000 |
| 56 | বাংলা | Bengali | bn | 55.77% | 3678 | 4756 | 6147 | 7635 | 9414 | 6773.53 | 115782 | 125.89% | 268000 |
| 57 | ქართული | Georgian | ka | 54.60% | 3599 | 4685 | 6007 | 7650 | 9365 | 6701.74 | 158012 | 90.30% | 4000 |
| 58 | Afrikaans | Afrikaans | af | 54.29% | 3693 | 4633 | 5808 | 6951 | 8116 | 6682.85 | 101322 | 140.03% | 17500 |
| 59 | اردو | Urdu | ur | 52.90% | 3533 | 4369 | 5459 | 6671 | 8079 | 6596.79 | 166424 | 83.07% | 230000 |
| 60 | Íslenska | Icelandic | is | 52.46% | 3515 | 4387 | 5414 | 6504 | 7539 | 6569.09 | 53583 | 255.85% | 314 |
| 61 | Bosanski | Bosnian | bs | 51.65% | 3439 | 4352 | 5401 | 6585 | 7749 | 6518.55 | 88754 | 152.10% | 2500 |
| 62 | മലയാളം | Malayalam | ml | 50.99% | 3374 | 4201 | 5246 | 6424 | 7718 | 6476.77 | 76873 | 173.36% | 35000 |
| 63 | Gaeilge | Irish | ga | 49.26% | 3320 | 4129 | 5119 | 6080 | 6967 | 6365.81 | 55923 | 230.21% | 658 |
| 64 | Cymraeg | Welsh | cy | 48.22% | 3216 | 3880 | 4646 | 5465 | 6216 | 6298.03 | 134076 | 93.99% | 1000 |
| 65 | Tagalog | Tagalog | tl | 47.03% | 3074 | 3723 | 4510 | 5346 | 6189 | 6219.96 | 42899 | 286.50% | 65000 |
| 66 | O‘zbek | Uzbek | uz | 46.68% | 3047 | 3810 | 4746 | 5733 | 6693 | 6196.88 | 138472 | 88.10% | 34000 |
| 67 | Беларуская (тарашкевіца) | Belarusian (Taraškievica) | be-tarask | 46.56% | 3039 | 3635 | 4394 | 5210 | 6016 | 6189.04 | 76740 | 158.57% | 11000 |
| 68 | Occitan | Occitan | oc | 45.75% | 3024 | 3609 | 4295 | 4918 | 5502 | 6134.83 | 87055 | 137.35% | 1000 |
| 69 | Shqip | Albanian | sq | 44.52% | 2842 | 3489 | 4201 | 4921 | 5729 | 6051.55 | 84194 | 138.18% | 7000 |
| 70 | Bân-lâm-gú | Min Nan | zh-min-nan | 43.17% | 2723 | 3225 | 3795 | 4351 | 4949 | 5959.39 | 430979 | 26.18% | 49000 |
| 71 | Кыргызча | Kirghiz | ky | 41.15% | 2609 | 3261 | 4063 | 4924 | 5704 | 5817.94 | 81207 | 132.42% | 4000 |
| 72 | ਪੰਜਾਬੀ | Punjabi | pa | 41.12% | 2606 | 3046 | 3532 | 4052 | 4624 | 5816.12 | 36868 | 291.49% | 52000 |
| 73 | Brezhoneg | Breton | br | 40.87% | 2460 | 2971 | 3692 | 4426 | 5321 | 5798.53 | 70418 | 151.69% | 230 |
| 74 | Kiswahili | Swahili | sw | 40.43% | 2512 | 2884 | 3289 | 3652 | 4067 | 5766.95 | 68649 | 153.91% | 69000 |
| 75 | Soranî / کوردی | Sorani | ckb | 40.34% | 2508 | 2981 | 3526 | 4058 | 4605 | 5760.43 | 35243 | 299.12% | 8000 |
| 76 | Basa Jawa | Javanese | jv | 38.52% | 2310 | 2765 | 3287 | 3947 | 4880 | 5629.41 | 64600 | 155.85% | 68000 |
| 77 | Ido | Ido | io | 38.18% | 2346 | 2847 | 3470 | 4128 | 4773 | 5604.55 | 30957 | 322.35% | 3 |
| 78 | Winaray | Waray-Waray | war | 37.74% | 2379 | 2598 | 2773 | 2969 | 3118 | 5572.13 | 1265603 | 7.79% | 4000 |
| 79 | شاہ مکھی پنجابی (Shāhmukhī Pañjābī) | Western Punjabi | pnb | 37.14% | 2164 | 2489 | 2854 | 3306 | 3826 | 5527.39 | 64173 | 151.25% | 65000 |
| 80 | मराठी | Marathi | mr | 36.27% | 2159 | 2487 | 2836 | 3202 | 3646 | 5462.72 | 82156 | 115.39% | 99000 |
| 81 | ಕನ್ನಡ | Kannada | kn | 36.00% | 2219 | 2671 | 3132 | 3620 | 4204 | 5441.65 | 27613 | 340.68% | 59000 |
| 82 | Frysk | West Frisian | fy | 35.95% | 2143 | 2576 | 3119 | 3677 | 4317 | 5438.36 | 47265 | 198.79% | 470 |
| 83 | Aragonés | Aragonese | an | 34.51% | 1940 | 2209 | 2518 | 2823 | 3125 | 5328.45 | 40795 | 221.10% | 60 |
| 84 | Scots | Scots | sco | 34.14% | 2144 | 2521 | 2752 | 2916 | 3104 | 5299.93 | 40484 | 220.43% | 1541 |
| 85 | తెలుగు | Telugu | te | 33.67% | 2004 | 2348 | 2741 | 3142 | 3629 | 5262.81 | 74243 | 118.52% | 96000 |
| 86 | Tatarça / Татарча | Tatar | tt | 33.48% | 1936 | 2234 | 2595 | 2964 | 3346 | 5247.73 | 321086 | 27.25% | 5000 |
| 87 | ייִדיש | Yiddish | yi | 33.18% | 1862 | 2069 | 2282 | 2493 | 2688 | 5224.82 | 15306 | 566.61% | 1500 |
| 88 | Interlingua | Interlingua | ia | 32.68% | 1887 | 2159 | 2463 | 2722 | 2976 | 5184.98 | 23403 | 364.94% | 2 |
| 89 | Чăваш | Chuvash | cv | 32.30% | 1924 | 2263 | 2682 | 3134 | 3581 | 5154.69 | 47284 | 178.52% | 1000 |
| 90 | Тоҷикӣ | Tajik | tg | 31.71% | 1837 | 2181 | 2536 | 2915 | 3312 | 5107.43 | 105232 | 78.75% | 8000 |
| 91 | မြန်မာဘာသာ | Burmese | my | 31.69% | 1827 | 2104 | 2445 | 2763 | 3122 | 5106.13 | 102843 | 80.54% | 43000 |
| 92 | Kurdî / كوردی | Kurdish | ku | 31.26% | 1800 | 2042 | 2301 | 2548 | 2786 | 5071.16 | 50261 | 162.55% | 30000 |
| 93 | Alemannisch | Alemannic | als | 31.15% | 1697 | 1954 | 2288 | 2569 | 2904 | 5062.52 | 28194 | 288.79% | 7000 |
| 94 | Sicilianu | Sicilian | scn | 30.94% | 1772 | 2006 | 2321 | 2590 | 2862 | 5045.11 | 26199 | 308.65% | 5000 |
| 95 | Башҡорт | Bashkir | ba | 30.55% | 1637 | 1867 | 2091 | 2351 | 2648 | 5012.86 | 59055 | 135.18% | 1000 |
| 96 | Lëtzebuergesch | Luxembourgish | lb | 29.42% | 1678 | 2041 | 2493 | 3006 | 3562 | 4919.42 | 60393 | 127.30% | 1000 |
| 97 | مصرى (Maṣri) | Egyptian Arabic | arz | 28.94% | 1638 | 1954 | 2283 | 2675 | 3214 | 4879.57 | 1475069 | 5.13% | 70000 |
| 98 | Runa Simi | Quechua | qu | 28.90% | 1578 | 1715 | 1827 | 1920 | 1988 | 4875.69 | 22943 | 329.17% | 15000 |
| 99 | Монгол | Mongolian | mn | 28.14% | 1547 | 1801 | 2055 | 2317 | 2568 | 4811.30 | 20934 | 351.30% | 5000 |
| 100 | Limburgs | Limburgish | li | 27.67% | 1472 | 1630 | 1789 | 1988 | 2147 | 4770.87 | 13553 | 533.54% | 1300 |
| 101 | नेपाली | Nepali | ne | 27.51% | 1492 | 1689 | 1929 | 2175 | 2472 | 4756.92 | 31970 | 224.86% | 16000 |
| 102 | تۆرکجه | South Azerbaijani | azb | 27.36% | 1481 | 1685 | 1903 | 2092 | 2288 | 4744.24 | 241109 | 29.66% | 13000 |
| 103 | සිංහල | Sinhalese | si | 27.16% | 1585 | 1874 | 2173 | 2510 | 2911 | 4727.22 | 17565 | 404.17% | 20000 |
| 104 | Basa Sunda | Sundanese | su | 26.75% | 1468 | 1666 | 1879 | 2093 | 2311 | 4690.71 | 61028 | 114.54% | 42000 |
| 105 | Lumbaart | Lombard | lmo | 26.66% | 1383 | 1636 | 1979 | 2331 | 2706 | 4683.57 | 50088 | 139.13% | 4000 |
| 106 | Krèyol ayisyen | Haitian | ht | 25.02% | 1369 | 1564 | 1749 | 1919 | 2049 | 4536.76 | 63671 | 102.70% | 10000 |
| 107 | მარგალური | Mingrelian | xmf | 24.14% | 1279 | 1417 | 1548 | 1675 | 1776 | 4456.38 | 18698 | 337.42% | 340 |
| 108 | Žemaitėška | Samogitian | bat-smg | 23.39% | 1063 | 1142 | 1239 | 1315 | 1416 | 4386.26 | 16967 | 360.24% | 400 |
| 109 | Malagasy | Malagasy | mg | 23.21% | 1135 | 1268 | 1428 | 1606 | 1823 | 4369.55 | 94457 | 64.22% | 25000 |
| 110 | Vèneto | Venetian | vec | 23.07% | 1114 | 1266 | 1458 | 1667 | 1891 | 4356.30 | 68877 | 87.53% | 3900 |
| 111 | سندھی ، सिन्ध | Sindhi | sd | 22.72% | 1193 | 1349 | 1522 | 1716 | 1930 | 4323.18 | 14840 | 400.11% | 32000 |
| 112 | Zazaki | Zazaki | diq | 22.44% | 1132 | 1283 | 1456 | 1637 | 1772 | 4296.09 | 40083 | 146.28% | 1340 |
| 113 | Gàidhlig | Scottish Gaelic | gd | 22.35% | 1109 | 1217 | 1333 | 1433 | 1532 | 4288.07 | 15546 | 375.76% | 150 |
| 114 | Plattdüütsch | Low Saxon | nds | 22.22% | 1158 | 1339 | 1563 | 1790 | 2069 | 4275.66 | 82929 | 70.03% | 10000 |
| 115 | Русиньскый | Rusyn | rue | 22.03% | 1030 | 1125 | 1212 | 1289 | 1359 | 4256.68 | 8256 | 697.23% | 630 |
| 116 | Саха тыла | Sakha | sah | 22.02% | 1054 | 1149 | 1249 | 1324 | 1430 | 4255.70 | 13511 | 425.85% | 450 |
| 117 | Walon | Walloon | wa | 21.78% | 1107 | 1253 | 1406 | 1548 | 1702 | 4232.45 | 11324 | 502.56% | 900 |
| 118 | Boarisch | Bavarian | bar | 21.68% | 1101 | 1259 | 1452 | 1669 | 1946 | 4223.57 | 31769 | 178.39% | 14000 |
| 119 | नेपाल भाषा | Newar | new | 21.48% | 991 | 1062 | 1170 | 1276 | 1398 | 4204.00 | 72356 | 77.60% | 860 |
| 120 | پښتو | Pashto | ps | 21.41% | 1059 | 1177 | 1322 | 1462 | 1602 | 4197.03 | 12838 | 435.90% | 50000 |
| 121 | Soomaali | Somali | so | 21.36% | 1031 | 1159 | 1273 | 1378 | 1495 | 4191.52 | 7319 | 762.60% | 22000 |
| 122 | አማርኛ | Amharic | am | 20.89% | 880 | 961 | 1024 | 1111 | 1197 | 4145.36 | 15012 | 363.65% | 57000 |
| 123 | Hak-kâ-fa / 客家話 | Hakka | hak | 19.84% | 890 | 950 | 1032 | 1124 | 1216 | 4039.77 | 9424 | 550.15% | 44000 |
| 124 | Lingua franca nova | Lingua Franca Nova | lfn | 19.69% | 1051 | 1191 | 1341 | 1508 | 1691 | 4024.98 | 4147 | 1,241.07% | 1 |
| 125 | Ilokano | Ilokano | ilo | 19.46% | 757 | 788 | 831 | 873 | 939 | 4000.78 | 15348 | 331.32% | 10000 |
| 126 | অসমীয়া | Assamese | as | 19.46% | 917 | 1002 | 1106 | 1209 | 1363 | 4000.67 | 9831 | 517.22% | 15000 |
| 127 | Nordfriisk | North Frisian | frr | 19.45% | 932 | 1023 | 1108 | 1184 | 1251 | 4000.35 | 14542 | 349.60% | 10 |
| 128 |  Mìng-dĕ̤ng-ngṳ̄ | Min Dong | cdo | 18.94% | 850 | 913 | 988 | 1065 | 1152 | 3946.99 | 15512 | 319.06% | 10000 |
| 129 | Нохчийн | Chechen | ce | 18.88% | 826 | 914 | 998 | 1082 | 1171 | 3941.36 | 453922 | 10.87% | 2000 |
| 130 | भोजपुरी | Bhojpuri | bh | 18.31% | 823 | 937 | 1053 | 1170 | 1295 | 3881.12 | 7610 | 628.83% | 52000 |
| 131 | Avañeʼẽ | Guarani | gn | 18.00% | 743 | 808 | 861 | 897 | 919 | 3848.54 | 4614 | 1,019.81% | 7000 |
| 132 | Võro | Võro | fiu-vro | 17.63% | 720 | 754 | 793 | 833 | 870 | 3807.91 | 5984 | 769.82% | 87 |
| 133 | Føroyskt | Faroese | fo | 17.29% | 777 | 835 | 882 | 934 | 970 | 3771.11 | 13647 | 331.06% | 72 |
| 134 | 古文 / 文言文 | Classical Chinese | zh-classical | 17.28% | 826 | 950 | 1098 | 1246 | 1434 | 3770.06 | 11120 | 406.06% |      |
| 135 | Piemontèis | Piedmontese | pms | 17.19% | 874 | 974 | 1117 | 1259 | 1420 | 3760.99 | 65885 | 68.21% | 2000 |
| 136 | Kriyòl Gwiyannen | Guianan Creole | gcr | 16.91% | 702 | 729 | 744 | 754 | 762 | 3729.89 | 1048 | 4,217.30% | 300 |
| 137 | chiShona | Shona | sn | 16.58% | 762 | 829 | 882 | 943 | 979 | 3692.77 | 7448 | 581.66% | 15000 |
| 138 | ગુજરાતી | Gujarati | gu | 16.36% | 825 | 914 | 1022 | 1153 | 1304 | 3668.15 | 29745 | 143.71% | 62000 |
| 139 | Fiji Hindi | Fiji Hindi | hif | 16.09% | 639 | 658 | 674 | 687 | 703 | 3638.43 | 10148 | 414.43% | 460 |
| 140 | Буряад | Buryat | bxr | 16.08% | 600 | 636 | 684 | 719 | 746 | 3636.76 | 2741 | 1,532.93% | 590 |
| 141 | Taqbaylit | Kabyle | kab | 15.93% | 724 | 796 | 851 | 919 | 966 | 3619.82 | 6244 | 666.68% | 6000 |
| 142 | Jumiekan Kryuol | Jamaican Patois | jam | 15.89% | 703 | 731 | 745 | 763 | 775 | 3616.08 | 1680 | 2,472.69% | 3200 |
| 143 | Nedersaksisch | Dutch Low Saxon | nds-nl | 15.80% | 661 | 740 | 846 | 956 | 1068 | 3605.06 | 7524 | 548.76% |      |
| 144 | Sinugboanong Binisaya | Cebuano | ceb | 15.48% | 605 | 652 | 718 | 808 | 905 | 3569.11 | 6076093 | 0.67% | 28000 |
| 145 | ᱥᱟᱱᱛᱟᱲᱤ | Santali | sat | 15.48% | 685 | 747 | 804 | 860 | 920 | 3568.54 | 7273 | 556.25% | 7600 |
| 146 | Yorùbá | Yoruba | yo | 15.28% | 651 | 692 | 741 | 796 | 889 | 3545.00 | 33493 | 119.20% | 43000 |
| 147 | Sardu | Sardinian | sc | 15.19% | 635 | 710 | 783 | 853 | 933 | 3535.47 | 7188 | 552.45% | 1300 |
| 148 | 贛語 | Gan | gan | 15.09% | 607 | 642 | 676 | 709 | 747 | 3523.86 | 6465 | 610.20% | 22000 |
| 149 | Gaelg | Manx | gv | 14.90% | 604 | 658 | 719 | 763 | 814 | 3501.45 | 5076 | 767.32% | 2 |
| 150 |  བོད་སྐད | Tibetan | bo | 14.70% | 672 | 757 | 839 | 926 | 1023 | 3477.46 | 5968 | 643.72% | 1200 |
| 151 | Lingala | Lingala | ln | 14.66% | 617 | 658 | 695 | 731 | 774 | 3473.03 | 3256 | 1,176.89% | 25000 |
| 152 | ئۇيغۇر تىلى | Uyghur | ug | 14.20% | 630 | 679 | 719 | 778 | 849 | 3417.44 | 5136 | 722.41% | 10000 |
| 153 | Bikol | Central Bicolano | bcl | 14.17% | 560 | 607 | 656 | 708 | 772 | 3414.25 | 11592 | 319.47% | 2500 |
| 154 | Vepsän | Vepsian | vep | 14.10% | 526 | 560 | 602 | 642 | 681 | 3405.81 | 6688 | 551.00% | 4 |
| 155 | ລາວ | Lao | lo | 14.08% | 550 | 602 | 654 | 704 | 745 | 3403.40 | 3883 | 947.68% | 30000 |
| 156 | Estremeñu | Extremaduran | ext | 14.06% | 483 | 513 | 545 | 589 | 629 | 3401.17 | 3310 | 1,110.28% | 200 |
| 157 |    संस्कृतम् | Sanskrit | sa | 14.00% | 562 | 607 | 664 | 736 | 850 | 3393.21 | 11605 | 315.20% |      |
| 158 |  ଓଡ଼ିଆ | Oriya | or | 13.90% | 670 | 797 | 977 | 1209 | 1504 | 3381.43 | 15926 | 228.09% | 40000 |
| 159 | Normaund | Norman | nrm | 13.54% | 510 | 546 | 587 | 624 | 667 | 3337.30 | 4648 | 761.25% | 110 |
| 160 | Иронау | Ossetian | os | 13.44% | 542 | 599 | 652 | 711 | 775 | 3325.22 | 14488 | 242.46% | 600 |
| 161 | Ślůnski | Silesian | szl | 13.43% | 535 | 591 | 666 | 724 | 784 | 3324.26 | 54692 | 64.19% | 510 |
| 162 | Kernowek/Karnuack | Cornish | kw | 13.34% | 450 | 470 | 496 | 514 | 536 | 3312.95 | 5190 | 671.84% |      |
| 163 | ܐܪܡܝܐ | Aramaic | arc | 13.23% | 587 | 628 | 657 | 669 | 676 | 3298.94 | 1779 | 1,943.46% | 1000 |
| 164 | Nāhuatl | Nahuatl | nah | 13.08% | 501 | 530 | 554 | 583 | 623 | 3280.83 | 7292 | 468.95% | 1700 |
| 165 | Олык Марий (Olyk Marij) | Meadow Mari | mhr | 13.04% | 552 | 601 | 656 | 707 | 750 | 3274.75 | 10368 | 328.60% | 470 |
| 166 | Kabɩyɛ | Kabiye | kbp | 12.99% | 482 | 509 | 524 | 531 | 541 | 3269.24 | 1684 | 2,016.30% | 1000 |
| 167 | Englisc | Anglo-Saxon | ang | 12.82% | 498 | 530 | 566 | 604 | 658 | 3247.17 | 3538 | 946.79% |      |
| 168 | Furlan | Friulian | fur | 12.59% | 482 | 509 | 538 | 564 | 581 | 3217.77 | 3537 | 929.99% | 600 |
| 169 | Lìgure | Ligurian | lij | 12.28% | 471 | 501 | 524 | 558 | 585 | 3178.38 | 10836 | 296.17% | 600 |
| 170 | Mirandés | Mirandese | mwl | 12.24% | 489 | 523 | 553 | 590 | 655 | 3173.16 | 3877 | 825.07% | 15 |
| 171 | West-Vlams | West Flemish | vls | 12.02% | 510 | 570 | 651 | 701 | 765 | 3144.83 | 7537 | 416.87% | 1400 |
| 172 | ភាសាខ្មែរ | Khmer | km | 11.91% | 484 | 547 | 626 | 715 | 807 | 3130.34 | 8471 | 367.50% | 16000 |
| 173 | Minangkabau | Minangkabau | min | 11.74% | 457 | 490 | 527 | 564 | 616 | 3108.20 | 224905 | 13.65% | 5500 |
| 174 | Emiliàn e rumagnòl | Emilian-Romagnol | eml | 11.47% | 459 | 513 | 591 | 675 | 779 | 3071.97 | 12956 | 231.40% | 1800 |
| 175 | Türkmen | Turkmen | tk | 11.45% | 470 | 510 | 549 | 602 | 644 | 3069.08 | 6168 | 485.15% | 11000 |
| 176 | Эрзянь (Erzjanj Kelj) | Erzya | myv | 11.26% | 421 | 454 | 490 | 527 | 569 | 3043.64 | 7048 | 417.57% | 610 |
| 177 | ГӀалгӀай | Ingush | inh | 11.16% | 378 | 395 | 413 | 437 | 456 | 3030.00 | 1874 | 1,556.40% | 500 |
| 178 |  مَزِروني | Mazandarani | mzn | 11.03% | 484 | 538 | 581 | 618 | 652 | 3012.21 | 13382 | 215.40% | 2300 |
| 179 | Արեւմտահայերէն | Western Armenian | hyw | 10.87% | 463 | 504 | 552 | 620 | 680 | 2990.34 | 9111 | 311.80% | 1400 |
| 180 | Cuengh | Zhuang | za | 10.76% | 359 | 392 | 414 | 438 | 462 | 2975.15 | 2003 | 1,403.91% | 16000 |
| 181 | Hornjoserbsce | Upper Sorbian | hsb | 10.75% | 419 | 451 | 479 | 512 | 559 | 2974.47 | 13785 | 203.90% | 13 |
| 182 | Seeltersk | Saterland Frisian | stq | 10.65% | 467 | 511 | 549 | 599 | 637 | 2959.53 | 4049 | 687.23% | 2 |
| 183 |   Hausa / هَوُسَ | Hausa | ha | 10.55% | 401 | 458 | 493 | 535 | 585 | 2945.52 | 13598 | 202.70% | 90000 |
| 184 | Bahasa Banjar | Banjar | bjn | 10.48% | 447 | 501 | 552 | 593 | 638 | 2935.96 | 4473 | 612.21% | 3500 |
| 185 | Volapük | Volapük | vo | 10.34% | 288 | 296 | 313 | 321 | 336 | 2917.02 | 127064 | 21.27% |      |
| 186 | Sámegiella | Northern Sami | se | 10.30% | 422 | 446 | 474 | 508 | 537 | 2911.00 | 7788 | 345.67% | 25 |
| 187 | Corsu | Corsican | co | 10.27% | 362 | 391 | 434 | 470 | 503 | 2906.09 | 6089 | 440.63% | 150 |
| 188 | Na Vosa Vakaviti | Fijian | fj | 10.22% | 386 | 414 | 433 | 447 | 456 | 2899.00 | 1251 | 2,134.24% | 650 |
| 189 | Лезги чІал (Lezgi č’al) | Lezgian | lez | 10.21% | 304 | 317 | 328 | 339 | 349 | 2897.93 | 4224 | 631.62% |      |
| 190 | Dzhudezmo | Ladino | lad | 10.12% | 329 | 346 | 369 | 391 | 429 | 2885.91 | 3611 | 732.73% | 60 |
| 191 | Armãneashce | Aromanian | roa-rup | 10.11% | 332 | 340 | 355 | 357 | 362 | 2883.44 | 1270 | 2,079.80% | 250 |
| 192 | मैथिली | Maithili | mai | 9.94% | 361 | 386 | 420 | 468 | 529 | 2859.84 | 13703 | 189.61% | 33900 |
| 193 | Nnapulitano | Neapolitan | nap | 9.84% | 349 | 375 | 410 | 454 | 489 | 2845.51 | 14694 | 175.06% | 5700 |
| 194 | ᏣᎳᎩ | Cherokee | chr | 9.67% | 376 | 395 | 416 | 439 | 459 | 2820.61 | 1013 | 2,495.06% | 2 |
| 195 | Коми | Komi | kv | 9.67% | 418 | 446 | 469 | 489 | 512 | 2820.15 | 5465 | 462.34% |      |
| 196 | الدارجة | Moroccan Arabic | ary | 9.65% | 373 | 403 | 445 | 478 | 505 | 2817.11 | 4821 | 522.97% |      |
| 197 | Lojban | Lojban | jbo | 9.40% | 325 | 346 | 357 | 362 | 372 | 2780.99 | 1275 | 1,927.05% |      |
| 198 | Interlingue | Interlingue | ie | 9.37% | 300 | 311 | 326 | 336 | 342 | 2776.57 | 8519 | 287.50% |      |
| 199 | Lingaz | Ladin | lld | 9.30% | 277 | 284 | 291 | 296 | 307 | 2766.48 | 1621 | 1,499.95% |      |
| 200 | Aymar | Aymara | ay | 9.17% | 362 | 383 | 408 | 420 | 435 | 2746.60 | 5016 | 477.79% | 1700 |
| 201 | Malti | Maltese | mt | 9.05% | 349 | 375 | 406 | 439 | 476 | 2728.65 | 4365 | 541.90% | 520 |
| 202 | Kaszëbsczi | Kashubian | csb | 9.02% | 342 | 392 | 454 | 521 | 599 | 2724.13 | 5400 | 436.58% | 100 |
| 203 | Picard | Picard | pcd | 8.98% | 349 | 374 | 407 | 442 | 477 | 2718.52 | 5273 | 445.26% | 700 |
| 204 | Arpetan | Franco-Provençal | frp | 8.98% | 293 | 314 | 336 | 364 | 392 | 2718.10 | 5247 | 447.33% |      |
| 205 | Kapampangan | Kapampangan | pam | 8.77% | 319 | 353 | 379 | 413 | 456 | 2686.75 | 8848 | 259.19% |      |
| 206 | isiZulu | Zulu | zu | 8.75% | 331 | 353 | 372 | 399 | 428 | 2683.17 | 10486 | 218.12% |      |
| 207 | isiXhosa | Xhosa | xh | 8.65% | 306 | 325 | 341 | 355 | 368 | 2666.88 | 1224 | 1,845.99% | 19200 |
| 208 |     ދިވެހިބަސް | Divehi | dv | 8.63% | 379 | 450 | 515 | 581 | 632 | 2664.46 | 3010 | 749.30% | 340 |
| 209 | Dolnoserbski | Lower Sorbian | dsb | 8.56% | 301 | 320 | 338 | 361 | 388 | 2652.98 | 3317 | 674.10% |      |
| 210 | Qaraqalpaqsha | Karakalpak | kaa | 8.21% | 280 | 293 | 305 | 319 | 328 | 2598.67 | 1922 | 1,116.23% |      |
| 211 | Bali | Balinese | ban | 8.08% | 282 | 292 | 311 | 325 | 355 | 2577.83 | 10930 | 193.15% |      |
| 212 | Qırımtatarca | Crimean Tatar | crh | 7.99% | 257 | 267 | 275 | 291 | 317 | 2563.09 | 13819 | 151.03% |      |
| 213 | Авар | Avar | av | 7.98% | 304 | 327 | 339 | 368 | 396 | 2562.27 | 2587 | 806.23% |      |
| 214 | Къарачай-Малкъар (Qarachay-Malqar) | Karachay-Balkar | krc | 7.89% | 294 | 308 | 324 | 339 | 351 | 2547.38 | 2051 | 1,005.14% |      |
| 215 | Karjalan | Livvi-Karelian | olo | 7.84% | 247 | 265 | 279 | 289 | 298 | 2538.85 | 3727 | 549.44% |      |
| 216 | ᐃᓄᒃᑎᑐᑦ | Inuktitut | iu | 7.81% | 274 | 289 | 301 | 309 | 318 | 2534.54 | 590 | 3,459.00% |      |
| 217 | Wolof | Wolof | wo | 7.66% | 258 | 270 | 285 | 294 | 313 | 2510.46 | 1645 | 1,217.15% | 5460 |
| 218 | Удмурт кыл | Udmurt | udm | 7.51% | 241 | 250 | 263 | 268 | 278 | 2485.64 | 5121 | 383.29% |      |
| 219 | Novial | Novial | nov | 7.35% | 241 | 254 | 263 | 273 | 283 | 2459.09 | 1522 | 1,262.23% |      |
| 220 | Rumantsch | Romansh | rm | 7.13% | 249 | 265 | 290 | 301 | 324 | 2421.99 | 3721 | 500.83% |      |
| 221 | Лакку | Lak | lbe | 7.12% | 247 | 262 | 280 | 288 | 294 | 2420.32 | 1233 | 1,509.34% |      |
| 222 | Basa Banyumasan | Banyumasan | map-bms | 7.10% | 214 | 221 | 231 | 235 | 244 | 2416.39 | 13727 | 135.13% |      |
| 223 | Papiamentu | Papiamentu | pap | 6.97% | 262 | 284 | 302 | 311 | 321 | 2393.89 | 2267 | 803.08% |      |
| 224 | Ripoarisch | Ripuarian | ksh | 6.92% | 236 | 279 | 314 | 345 | 389 | 2385.77 | 2917 | 619.90% |      |
| 225 | Аԥсуа | Abkhazian | ab | 6.87% | 229 | 239 | 245 | 253 | 261 | 2377.48 | 5863 | 306.28% |      |
| 226 | ꯃꯤꯇꯩꯂꯣꯟ | Meitei | mni | 6.80% | 250 | 277 | 309 | 355 | 410 | 2364.87 | 10023 | 177.26% |      |
| 227 | Мокшень (Mokshanj Kälj) | Moksha | mdf | 6.73% | 212 | 220 | 233 | 240 | 245 | 2352.15 | 1559 | 1,127.43% |      |
| 228 | Hawaiʻi | Hawaiian | haw | 6.70% | 179 | 181 | 189 | 199 | 212 | 2346.94 | 2415 | 724.59% |      |
| 229 | Ikinyarwanda | Kinyarwanda | rw | 6.67% | 219 | 229 | 240 | 250 | 258 | 2342.95 | 2881 | 605.32% |      |
| 230 | Хальмг | Kalmyk | xal | 6.59% | 209 | 223 | 230 | 241 | 253 | 2328.37 | 2047 | 841.38% |      |
| 231 | Tok Pisin | Tok Pisin | tpi | 6.52% | 155 | 159 | 164 | 166 | 167 | 2316.54 | 1683 | 1,012.97% |      |
| 232 | Gagana Samoa | Samoan | sm | 6.41% | 205 | 209 | 210 | 211 | 213 | 2296.40 | 1021 | 1,640.86% |      |
| 233 | Norfuk | Norfolk | pih | 6.27% | 166 | 167 | 173 | 175 | 177 | 2270.44 | 883 | 1,854.66% |      |
| 234 | Sepedi | Northern Sotho | nso | 6.25% | 164 | 173 | 182 | 188 | 197 | 2267.58 | 8490 | 192.41% |      |
| 235 | Тыва | Tuvan | tyv | 6.03% | 269 | 305 | 346 | 372 | 414 | 2227.70 | 3317 | 475.30% | 280 |
| 236 | Xitsonga | Tsonga | ts | 6.03% | 165 | 166 | 168 | 169 | 173 | 2227.44 | 709 | 2,223.16% |      |
| 237 | Kalaallisut | Greenlandic | kl | 5.87% | 136 | 137 | 140 | 141 | 142 | 2198.16 | 810 | 1,895.13% |      |
| 238 | ತುಳು | Tulu | tcy | 5.78% | 190 | 207 | 214 | 233 | 253 | 2179.88 | 1575 | 958.49% |      |
| 239 | Deitsch | Pennsylvania German | pdc | 5.71% | 193 | 210 | 223 | 233 | 245 | 2167.76 | 1930 | 773.51% |      |
| 240 | Taclḥit | Tachelhit | shi | 5.47% | 165 | 176 | 186 | 197 | 204 | 2120.67 | 1076 | 1,327.82% |      |
| 241 | Словѣньскъ | Old Church Slavonic | cu | 5.44% | 188 | 197 | 209 | 214 | 223 | 2115.11 | 872 | 1,629.88% |      |
| 242 | Dagbanli | Dagbani | dag | 5.37% | 162 | 180 | 193 | 204 | 221 | 2102.74 | 949 | 1,480.15% |      |
| 243 | डोटेली | Doteli | dty | 5.27% | 156 | 162 | 166 | 173 | 186 | 2081.21 | 3304 | 416.48% |      |
| 244 | Кырык Мары (Kyryk Mary) | Hill Mari | mrj | 5.24% | 194 | 215 | 242 | 269 | 289 | 2077.16 | 10295 | 133.14% |      |
| 245 | Zeêuws | Zeelandic | zea | 5.16% | 176 | 185 | 195 | 204 | 220 | 2060.23 | 4772 | 282.58% |      |
| 246 | कश्मीरी / كشميري | Kashmiri | ks | 5.04% | 148 | 155 | 162 | 166 | 169 | 2036.76 | 1007 | 1,308.75% |      |
| 247 |      𐌲𐌿𐍄𐌹𐍃𐌺 | Gothic | got | 4.99% | 143 | 155 | 165 | 172 | 179 | 2025.36 | 849 | 1,534.97% |      |
| 248 | Перем Коми (Perem Komi) | Komi-Permyak | koi | 4.95% | 128 | 134 | 140 | 144 | 148 | 2017.69 | 3445 | 375.43% |      |
| 249 | Anarâškielâ | Inari Sami | smn | 4.39% | 124 | 132 | 138 | 146 | 156 | 1900.39 | 3823 | 300.11% |      |
| 250 | Ìgbò | Igbo | ig | 4.33% | 131 | 138 | 146 | 151 | 159 | 1886.64 | 2667 | 423.99% |      |
| 251 | Oromoo | Oromo | om | 4.29% | 157 | 165 | 172 | 176 | 184 | 1877.96 | 1070 | 1,047.11% |      |
| 252 | Basa Acèh | Acehnese | ace | 4.26% | 147 | 167 | 178 | 192 | 202 | 1872.52 | 12528 | 88.91% |      |
| 253 | Sakizaya | Sakizaya | szy | 4.16% | 177 | 190 | 204 | 217 | 226 | 1850.00 | 2014 | 539.87% |      |
| 254 | Atikamekw | Atikamekw | atj | 4.12% | 152 | 163 | 170 | 181 | 189 | 1841.57 | 1870 | 576.15% |      |
| 255 | Māori | Maori | mi | 4.12% | 104 | 107 | 109 | 109 | 112 | 1841.13 | 7282 | 147.88% |      |
| 256 | Diné bizaad | Navajo | nv | 4.11% | 143 | 162 | 171 | 184 | 193 | 1839.65 | 18508 | 58.09% |      |
| 257 | Адыгэбзэ (Adighabze) | Kabardian Circassian | kbd | 4.07% | 139 | 155 | 165 | 181 | 200 | 1830.69 | 1592 | 668.79% |      |
| 258 | Tarandíne | Tarantino | roa-tara | 4.01% | 90 | 92 | 106 | 117 | 120 | 1816.66 | 9305 | 112.68% |      |
| 259 |  गोंयची कोंकणी / Gõychi Konknni | Goan Konkani | gom | 4.01% | 187 | 209 | 225 | 244 | 278 | 1816.37 | 3544 | 295.75% |      |
| 260 | Gagauz | Gagauz | gag | 3.98% | 123 | 136 | 146 | 152 | 161 | 1808.78 | 2790 | 372.54% |      |
| 261 | Latgaļu | Latgalian | ltg | 3.66% | 108 | 121 | 129 | 139 | 144 | 1734.67 | 1015 | 941.82% |      |
| 262 | Kikôngo | Kongo | kg | 3.61% | 100 | 104 | 106 | 106 | 111 | 1724.02 | 1243 | 759.66% |      |
| 263 | अवधी | Awadhi | awa | 3.58% | 112 | 117 | 120 | 122 | 123 | 1715.88 | 2440 | 383.34% |      |
| 264 | گیلکی | Gilaki | glk | 3.46% | 113 | 124 | 128 | 136 | 152 | 1686.13 | 6372 | 141.75% |      |
| 265 | Akana | Akan | ak | 3.44% | 108 | 116 | 123 | 126 | 131 | 1683.37 | 564 | 1,596.19% |      |
| 266 | romani - रोमानी | Romani | rmy | 3.44% | 103 | 108 | 115 | 120 | 130 | 1682.87 | 770 | 1,168.46% |      |
| 267 | Chavacano de Zamboanga | Zamboanga Chavacano | cbk-zam | 3.43% | 74 | 76 | 80 | 87 | 91 | 1680.05 | 3148 | 284.85% |      |
| 268 | SiSwati | Swati | ss | 3.42% | 82 | 84 | 90 | 91 | 94 | 1677.15 | 543 | 1,645.69% |      |
| 269 | Hulontalo | Gorontalo | gor | 3.41% | 102 | 103 | 108 | 111 | 118 | 1674.30 | 12509 | 71.20% |      |
| 270 | မန် | Mon | mnw | 3.40% | 113 | 119 | 128 | 143 | 158 | 1672.38 | 1169 | 760.08% |      |
| 271 | Tsetsêhestâhese | Cheyenne | chy | 3.40% | 135 | 152 | 171 | 196 | 216 | 1672.24 | 622 | 1,428.27% |      |
| 272 | Kotava | Kotava | avk | 3.39% | 102 | 104 | 109 | 118 | 139 | 1670.34 | 18585 | 47.69% |      |
| 273 | လိၵ်ႈတႆး | Shan | shn | 3.30% | 78 | 79 | 85 | 90 | 93 | 1648.06 | 10148 | 85.03% |      |
| 274 | Pälzisch | Palatinate German | pfl | 3.26% | 97 | 114 | 126 | 139 | 159 | 1636.41 | 2735 | 311.05% |      |
| 275 | Pangasinan | Pangasinan | pag | 3.16% | 94 | 98 | 103 | 113 | 116 | 1613.03 | 2572 | 321.38% |      |
| 276 | Bamanankan | Bambara | bm | 3.15% | 81 | 85 | 86 | 90 | 93 | 1609.64 | 720 | 1,143.22% |      |
| 277 | Iñupiatun | Inupiak | ik | 3.14% | 123 | 137 | 146 | 154 | 159 | 1607.55 | 403 | 2,037.18% |      |
| 278 | Tetun | Tetum | tet | 3.12% | 73 | 76 | 83 | 85 | 90 | 1601.08 | 1491 | 546.20% |      |
| 279 | Sesotho | Sesotho | st | 3.11% | 85 | 88 | 92 | 95 | 97 | 1598.43 | 822 | 987.47% |      |
| 280 | Bislama | Bislama | bi | 3.10% | 75 | 78 | 80 | 81 | 82 | 1597.54 | 1364 | 594.42% |      |
| 281 | Luganda | Luganda | lg | 3.04% | 119 | 121 | 129 | 135 | 139 | 1580.63 | 1373 | 578.09% |      |
| 282 | Eʋegbe | Ewe | ee | 3.03% | 55 | 55 | 55 | 56 | 57 | 1579.86 | 384 | 2,064.94% |      |
| 283 | Ποντιακά | Pontic | pnt | 2.95% | 60 | 61 | 63 | 64 | 65 | 1556.66 | 485 | 1,587.26% |      |
| 284 | Chamoru | Chamorro | ch | 2.85% | 56 | 57 | 57 | 57 | 58 | 1530.29 | 534 | 1,393.19% |      |
| 285 | dorerin Naoero | Nauruan | na | 2.79% | 73 | 76 | 78 | 79 | 83 | 1513.87 | 1660 | 438.61% |      |
| 286 | ትግርኛ | Tigrinya | ti | 2.74% | 82 | 88 | 93 | 94 | 94 | 1501.14 | 217 | 3,299.05% |      |
| 287 |     ইমার ঠার/বিষ্ণুপ্রিয়া মণিপুরী | Bishnupriya Manipuri | bpy | 2.66% | 94 | 100 | 110 | 116 | 138 | 1480.21 | 25089 | 27.74% |      |
| 288 | Thuɔŋjäŋ | Dinka | din | 2.54% | 90 | 94 | 97 | 104 | 108 | 1445.90 | 308 | 2,156.39% |      |
| 289 | chiTumbuka | Tumbuka | tum | 2.36% | 44 | 44 | 44 | 45 | 46 | 1393.63 | 601 | 1,026.65% |      |
| 290 | Адыгэбзэ | Adyghe | ady | 2.33% | 64 | 67 | 70 | 71 | 75 | 1383.54 | 448 | 1,357.40% |      |
| 291 | Chichewa | Chichewa | ny | 2.06% | 58 | 60 | 64 | 69 | 73 | 1300.44 | 856 | 627.64% |      |
| 292 | ߒߞߏ | N’Ko | nqo | 1.99% | 55 | 56 | 60 | 63 | 68 | 1280.27 | 1117 | 466.18% |      |
| 293 | سرائیکی | Saraiki | skr | 1.98% | 51 | 55 | 58 | 61 | 66 | 1275.12 | 3822 | 135.15% |      |
| 294 | Twi | Twi | tw | 1.96% | 38 | 39 | 39 | 43 | 46 | 1270.63 | 1234 | 415.65% |      |
| 295 | Sranantongo | Sranan | srn | 1.96% | 40 | 43 | 51 | 52 | 59 | 1268.29 | 1100 | 464.57% |      |
| 296 | पाऴि | Pali | pi | 1.89% | 70 | 74 | 82 | 88 | 98 | 1245.62 | 2574 | 191.50% |      |
| 297 | Li Niha | Nias | nia | 1.88% | 60 | 72 | 80 | 93 | 99 | 1243.63 | 1003 | 489.88% |      |
| 298 | Basa Ugi | Buginese | bug | 1.85% | 41 | 44 | 45 | 47 | 49 | 1235.27 | 14778 | 32.80% |      |
| 299 | Tayal | Tayal | tay | 1.83% | 54 | 59 | 60 | 65 | 68 | 1227.87 | 2406 | 199.07% |      |
| 300 | Алтай | Southern Altai | alt | 1.83% | 35 | 37 | 40 | 40 | 42 | 1226.45 | 1010 | 473.13% |      |
| 301 | Madhurâ | Madurese | mad | 1.79% | 51 | 55 | 59 | 62 | 69 | 1214.49 | 818 | 572.85% |      |
| 302 | Gĩkũyũ | Kikuyu | ki | 1.77% | 54 | 58 | 63 | 68 | 70 | 1207.68 | 1501 | 308.69% |      |
| 303 | Nehiyaw | Cree | cr | 1.74% | 52 | 55 | 57 | 63 | 66 | 1197.58 | 158 | 2,883.74% |      |
| 304 | Setswana | Tswana | tn | 1.69% | 55 | 59 | 62 | 64 | 71 | 1179.66 | 722 | 612.32% |      |
| 305 | faka Tonga | Tongan | to | 1.68% | 47 | 51 | 52 | 56 | 58 | 1174.38 | 1811 | 241.94% |      |
| 306 | Reo Mā`ohi | Tahitian | ty | 1.27% | 26 | 27 | 28 | 29 | 29 | 1020.37 | 1218 | 271.57% |      |
| 307 | Sängö | Sango | sg | 1.22% | 24 | 27 | 27 | 27 | 28 | 1002.90 | 278 | 1,149.40% |      |
| 308 | Fulfulde | Fula | ff | 1.11% | 23 | 24 | 25 | 25 | 25 | 953.48 | 360 | 802.27% |      |
| 309 | Tshivenda | Venda | ve | 0.95% | 27 | 28 | 28 | 28 | 28 | 882.98 | 638 | 388.22% |      |
| 310 | Ikirundi | Kirundi | rn | 0.66% | 24 | 27 | 27 | 28 | 30 | 734.25 | 620 | 276.25% |      |
| 311 | ཇོང་ཁ | Dzongkha | dz | 0.54% | 16 | 16 | 17 | 18 | 20 | 665.32 | 223 | 630.60% |      |
| 312 | Paiwan | Paiwan | pwn | 0.46% | 10 | 10 | 10 | 11 | 11 | 612.52 | 168 | 709.47% |      |
| 313 | Taroko | Seediq | trv | 0.28% | 8 | 8 | 9 | 9 | 9 | 478.54 | 1052 | 69.16% |      |
| 314 | ꆇꉙ | Sichuan Yi | ii | 0.23% | 8 | 8 | 9 | 9 | 10 | 431.38 | 3 | 19,706.43% |      |
| 315 | Pangcah | Amis | ami | 0.21% | 4 | 4 | 4 | 4 | 4 | 416.26 | 815 | 67.54% |      |
| 316 | Ndonga | Ndonga | ng | 0.20% | 3 | 3 | 3 | 4 | 4 | 402.39 | 8 | 6,429.85% |      |
| 317 | Kuanyama | Kuanyama | kj | 0.15% | 3 | 3 | 3 | 3 | 3 | 355.34 | 4 | 10,028.29% |      |
| 318 | Choctaw | Choctaw | cho | 0.15% | 4 | 4 | 6 | 6 | 6 | 354.83 | 6 | 6,666.41% |      |
| 319 | Hiri Motu | Hiri Motu | ho | 0.08% | 1 | 1 | 1 | 1 | 1 | 249.00 | 3 | 6,565.70% |      |
| 320 | Ebon | Marshallese | mh | 0.05% | 2 | 3 | 3 | 3 | 3 | 205.17 | 4 | 3,343.21% |      |
