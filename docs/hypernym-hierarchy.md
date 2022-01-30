# Hypernym Hierarchy

All Wikidata items / Wikipedia articles are categorized in buckets. The design principle is: gameplay first, performance (query speed) second, academic last; coarsely classifying as a decision tree, instead of networking as an ontologically precise semantic graph. The tree branches are grown and pruned to achieve balanced number of items/articles per node.

The 64 top-level hypernyms of controlled vocabulary are presented for players to pick during the game by detonating 💣

### Hilbert curve 

The hypernym categories can be arranged from 1D to 2D using Hilbert curve for better localtity of reference for searching performance and information visual locality to reduce users cognitive burden.

Hilbert curve (order=3) of hypernym categories

```
Concept    Religion────Theory────Hypothesis    Appliance──────Machine───────Instrument      Drink
│                │                │             │                                  │          │
│                │                │             │                                  │          │
Myth───────Ideology     Axiom───Mathematics    Tool──────Architecture         Clothing──────Food
                         │                                        │
                         │                                        │
Action──────History    Theorem───Shape       Goods─────Infrastructure     Physical_object───Technology
│                │                │             │                                  │          │
│                │                │             │                                  │          │
Behavior   Phenomenon───Time────Entity    Astronomical_object──Chemical_substance──Matter   Computer_science
│                                                                                             │
│                                                                                             │
Social_behavior──Culture  Group───Organization──Ethnic_group────Property       Humanities───Science
                 │         │                                      │                │
                 │         │                                      │                │
Game──────────Sport     System──Structure    Language───────────Quality        Knowledge───Document
│                                 │             │                                             │
│                                 │             │                                             │
Art          Change───Disease   Anatomy     Physical_property    Object────────Phrase       Message
│                │         │      │             │                 │                │          │
│                │         │      │             │                 │                │          │
Genre─────Technique   Process───Organism     Location────Unit_of_measurement    Information───Sign

```

### Monospaced Hilbert curve

Monospaced Hilbert curve of hypernym categories

[道](https://www.wikidata.org/wiki/Q151885)　 [教](https://www.wikidata.org/wiki/Q9174)──[論](https://www.wikidata.org/wiki/Q17737)──[設](https://www.wikidata.org/wiki/Q41719)　 [置](https://www.wikidata.org/wiki/Q1183543)──[械](https://www.wikidata.org/wiki/Q11019)──[器](https://www.wikidata.org/wiki/Q34379)　 [飲](https://www.wikidata.org/wiki/Q40050)  
│　　│　　　　│　　│　　　　│　　│  
[神](https://www.wikidata.org/wiki/Q12827256)──[意](https://www.wikidata.org/wiki/Q7257)　 [理](https://www.wikidata.org/wiki/Q17736)──[學](https://www.wikidata.org/wiki/Q395)　 [具](https://www.wikidata.org/wiki/Q39546)──[築](https://www.wikidata.org/wiki/Q811979)　 [衣](https://www.wikidata.org/wiki/Q11460)──[食](https://www.wikidata.org/wiki/Q2095)  
　　　　　│　　　　　　│          
[動](https://www.wikidata.org/wiki/Q4026292)──[史](https://www.wikidata.org/wiki/Q309)　 [則](https://www.wikidata.org/wiki/Q65943)──[形](https://www.wikidata.org/wiki/Q207961)　 [貨](https://www.wikidata.org/wiki/Q28877)──[建](https://www.wikidata.org/wiki/Q121359)　 [物](https://www.wikidata.org/wiki/Q223557)──[工](https://www.wikidata.org/wiki/Q11016)  
│　　│　　　　│　　│　　　　│　　│  
[行](https://www.wikidata.org/wiki/Q9332)　 [象](https://www.wikidata.org/wiki/Q483247)──[時](https://www.wikidata.org/wiki/Q11471)──[實](https://www.wikidata.org/wiki/Q35120)　 [星](https://www.wikidata.org/wiki/Q6999)──[素](https://www.wikidata.org/wiki/Q79529)──[粒](https://www.wikidata.org/wiki/Q35758)　 [計](https://www.wikidata.org/wiki/Q21198)  
│　　　　　　　　　　　　　　　　│  
[為](https://www.wikidata.org/wiki/Q921513)──[文](https://www.wikidata.org/wiki/Q11042)　 [群](https://www.wikidata.org/wiki/Q16887380)──[組](https://www.wikidata.org/wiki/Q43229)──[族](https://www.wikidata.org/wiki/Q41710)──[性](https://www.wikidata.org/wiki/Q937228)　 [倫](https://www.wikidata.org/wiki/Q80083)──[格](https://www.wikidata.org/wiki/Q336)  
　　　│　│　　　　　　　│　 │      
[戲](https://www.wikidata.org/wiki/Q11410)──[健](https://www.wikidata.org/wiki/Q349)　 [系](https://www.wikidata.org/wiki/Q58778)──[構](https://www.wikidata.org/wiki/Q6671777)　 [語](https://www.wikidata.org/wiki/Q315)──[品](https://www.wikidata.org/wiki/Q1207505)　 [知](https://www.wikidata.org/wiki/Q9081)──[書](https://www.wikidata.org/wiki/Q49848)  
│　　　　　　 │　 │　　　　　　　 │  
[藝](https://www.wikidata.org/wiki/Q735)　 [變](https://www.wikidata.org/wiki/Q1150070)──[疾](https://www.wikidata.org/wiki/Q12136)　 [解](https://www.wikidata.org/wiki/Q514)　 [質](https://www.wikidata.org/wiki/Q4373292)　 [彼](https://www.wikidata.org/wiki/Q488383)──[言](https://www.wikidata.org/wiki/Q187931)　 [訊](https://www.wikidata.org/wiki/Q628523)  
│　　│　　│　 │　 │　　│　　│　　│  
[風](https://www.wikidata.org/wiki/Q483394)──[技](https://www.wikidata.org/wiki/Q2695280)　 [程](https://www.wikidata.org/wiki/Q3249551)──[生](https://www.wikidata.org/wiki/Q7239)　 [輿](https://www.wikidata.org/wiki/Q2221906)──[衡](https://www.wikidata.org/wiki/Q47574)　 [信](https://www.wikidata.org/wiki/Q11028)──[記](https://www.wikidata.org/wiki/Q3695082)  
  

### Compact tiles

Compact tiles of hypernym categories
  
[道](https://en.wiktionary.org/wiki/道#Definitions) [教](https://en.wiktionary.org/wiki/教#Definitions) [論](https://en.wiktionary.org/wiki/論#Definitions) [設](https://en.wiktionary.org/wiki/設#Definitions) [置](https://en.wiktionary.org/wiki/置#Definitions) [械](https://en.wiktionary.org/wiki/械#Definitions) [器](https://en.wiktionary.org/wiki/器#Definitions) [飲](https://en.wiktionary.org/wiki/飲#Definitions)  
[神](https://en.wiktionary.org/wiki/神#Definitions) [意](https://en.wiktionary.org/wiki/意#Definitions) [理](https://en.wiktionary.org/wiki/理#Definitions) [學](https://en.wiktionary.org/wiki/學#Definitions) [具](https://en.wiktionary.org/wiki/具#Definitions) [築](https://en.wiktionary.org/wiki/築#Definitions) [衣](https://en.wiktionary.org/wiki/衣#Definitions) [食](https://en.wiktionary.org/wiki/食#Definitions)  
[動](https://en.wiktionary.org/wiki/動#Definitions) [史](https://en.wiktionary.org/wiki/史#Definitions) [則](https://en.wiktionary.org/wiki/則#Definitions) [形](https://en.wiktionary.org/wiki/形#Definitions) [貨](https://en.wiktionary.org/wiki/貨#Definitions) [建](https://en.wiktionary.org/wiki/建#Definitions) [物](https://en.wiktionary.org/wiki/物#Definitions) [工](https://en.wiktionary.org/wiki/工#Definitions)  
[行](https://en.wiktionary.org/wiki/行#Definitions) [象](https://en.wiktionary.org/wiki/象#Definitions) [時](https://en.wiktionary.org/wiki/時#Definitions) [實](https://en.wiktionary.org/wiki/實#Definitions) [星](https://en.wiktionary.org/wiki/星#Definitions) [素](https://en.wiktionary.org/wiki/素#Definitions) [粒](https://en.wiktionary.org/wiki/粒#Definitions) [計](https://en.wiktionary.org/wiki/計#Definitions)  
[為](https://en.wiktionary.org/wiki/為#Definitions) [文](https://en.wiktionary.org/wiki/文#Definitions) [群](https://en.wiktionary.org/wiki/群#Definitions) [組](https://en.wiktionary.org/wiki/組#Definitions) [族](https://en.wiktionary.org/wiki/族#Definitions) [性](https://en.wiktionary.org/wiki/性#Definitions) [倫](https://en.wiktionary.org/wiki/倫#Definitions) [格](https://en.wiktionary.org/wiki/格#Definitions)  
[戲](https://en.wiktionary.org/wiki/戲#Definitions) [健](https://en.wiktionary.org/wiki/健#Definitions) [系](https://en.wiktionary.org/wiki/系#Definitions) [構](https://en.wiktionary.org/wiki/構#Definitions) [語](https://en.wiktionary.org/wiki/語#Definitions) [品](https://en.wiktionary.org/wiki/品#Definitions) [知](https://en.wiktionary.org/wiki/知#Definitions) [書](https://en.wiktionary.org/wiki/書#Definitions)  
[藝](https://en.wiktionary.org/wiki/藝#Definitions) [變](https://en.wiktionary.org/wiki/變#Definitions) [疾](https://en.wiktionary.org/wiki/疾#Definitions) [解](https://en.wiktionary.org/wiki/解#Definitions) [質](https://en.wiktionary.org/wiki/質#Definitions) [彼](https://en.wiktionary.org/wiki/彼#Definitions) [言](https://en.wiktionary.org/wiki/言#Definitions) [訊](https://en.wiktionary.org/wiki/訊#Definitions)  
[風](https://en.wiktionary.org/wiki/風#Definitions) [技](https://en.wiktionary.org/wiki/技#Definitions) [程](https://en.wiktionary.org/wiki/程#Definitions) [生](https://en.wiktionary.org/wiki/生#Definitions) [輿](https://en.wiktionary.org/wiki/輿#Definitions) [衡](https://en.wiktionary.org/wiki/衡#Definitions) [信](https://en.wiktionary.org/wiki/信#Definitions) [記](https://en.wiktionary.org/wiki/記#Definitions)  
  

### Tree path

Tree view of hypernym categories

```
Node          Path
-----------------------------------------------------------------------------------------------------------------------
151885        Concept                                   /Concept                                                             
..12827256    │────── Myth                              /Concept/Existence/Myth                                              
..7257        │────── Ideology                          /Concept/Existence/Ideology                                          
...9174       │       └── Religion                      /Concept/Existence/Ideology/Religion                                 
.17737        ├── Theory                                /Concept/Theory                                                      
..41719       │   └── Hypothesis                        /Concept/Theory/Hypothesis                                           
.395          ├── Mathematics                           /Concept/Mathematics                                                 
..17736       │   ├── Axiom                             /Concept/Mathematics/Axiom                                           
..65943       │   ├── Theorem                           /Concept/Mathematics/Theorem                                         
..207961      │   └── Shape                             /Concept/Mathematics/Shape                                           
.35120        └── Entity                                /Concept/Entity                                                      
..11471           ├── Time                              /Concept/Entity/Time                                                 
...483247         │   ├── Phenomenon                    /Concept/Entity/Time/Phenomenon                                      
...309            │   ├── History                       /Concept/Entity/Time/History                                         
...4026292        │   ├── Action                        /Concept/Entity/Time/Action                                          
....9332          │   │   ├── Behavior                  /Concept/Entity/Time/Action/Behavior                                 
.....921513       │   │   │   ├── Social behavior       /Concept/Entity/Time/Action/Behavior/Social_behavior                 
.....11042        │   │   │   ├── Culture               /Concept/Entity/Time/Action/Behavior/Culture                         
.....349          │   │   │   ├── Sport                 /Concept/Entity/Time/Action/Behavior/Sport                           
.....11410        │   │   │   ├── Game                  /Concept/Entity/Time/Action/Behavior/Game                            
.....735          │   │   │   └── Art                   /Concept/Entity/Time/Action/Behavior/Art                             
......483394      │   │   │       └── Genre             /Concept/Entity/Time/Action/Behavior/Art/Genre                       
....2695280       │   │   └── Technique                 /Concept/Entity/Time/Action/Technique                                
...1150070        │   ├── Change                        /Concept/Entity/Time/Change                                          
....12136         │   │   └── Disease                   /Concept/Entity/Time/Change/Disease                                  
...3249551        │   └── Process                       /Concept/Entity/Time/Process                                         
..7239            ├── Organism                          /Concept/Entity/Organism                                             
...514            │   └── Anatomy                       /Concept/Entity/Organism/Anatomy                                     
..6671777         ├── Structure                         /Concept/Entity/Structure                                            
...58778          │   └── System                        /Concept/Entity/Structure/System                                     
....16887380      │       └── Group                     /Concept/Entity/Structure/System/Group                               
.....43229        │           ├── Organization          /Concept/Entity/Structure/System/Group/Organization                  
.....41710        │           └── Ethnic group          /Concept/Entity/Structure/System/Group/Ethnic_group                  
..937228          ├── Property                          /Concept/Entity/Property                                             
...1207505        │   ├── Quality                       /Concept/Entity/Property/Quality                                     
....315           │   │   └── Language                  /Concept/Entity/Property/Quality/Language                            
...4373292        │   ├── Physical property             /Concept/Entity/Property/Physical_property                           
....2221906       │   │   └── Location                  /Concept/Entity/Property/Physical_property/Location                  
...47574          │   └── Unit of measurement           /Concept/Entity/Property/Unit_of_measurement                         
..488383          └── Object                            /Concept/Entity/Object                                               
...187931             ├── Phrase                        /Concept/Entity/Object/Phrase                                        
...11028              ├── Information                   /Concept/Entity/Object/Information                                   
....3695082           │   ├── Sign                      /Concept/Entity/Object/Information/Sign                              
....628523            │   ├── Message                   /Concept/Entity/Object/Information/Message                           
....49848             │   ├── Document                  /Concept/Entity/Object/Information/Document                          
....9081              │   └── Knowledge                 /Concept/Entity/Object/Information/Knowledge                         
.....80083            │       ├── Humanities            /Concept/Entity/Object/Information/Knowledge/Humanities              
.....336              │       └── Science               /Concept/Entity/Object/Information/Knowledge/Science                 
......21198           │           ├── Computer science  /Concept/Entity/Object/Information/Knowledge/Science/Computer_science
......11016           │           └── Technology        /Concept/Entity/Object/Information/Knowledge/Science/Technology      
...223557             └── Physical object               /Concept/Entity/Object/Physical_object                               
....35758                 ├── Matter                    /Concept/Entity/Object/Physical_object/Matter                        
....79529                 ├── Chemical substance        /Concept/Entity/Object/Physical_object/Chemical_substance            
....6999                  ├── Astronomical object       /Concept/Entity/Object/Physical_object/Astronomical_object           
....28877                 └── Goods                     /Concept/Entity/Object/Physical_object/Goods                         
.....121359                   ├── Infrastructure        /Concept/Entity/Object/Physical_object/Goods/Infrastructure          
......811979                  │   └── Architecture      /Concept/Entity/Object/Physical_object/Goods/Infrastructure/Architecture
.....39546                    ├── Tool                  /Concept/Entity/Object/Physical_object/Goods/Tool                    
......1183543                 │   ├── Appliance         /Concept/Entity/Object/Physical_object/Goods/Tool/Appliance          
......11019                   │   ├── Machine           /Concept/Entity/Object/Physical_object/Goods/Tool/Machine            
......34379                   │   └── Instrument        /Concept/Entity/Object/Physical_object/Goods/Tool/Instrument         
.....11460                    ├── Clothing              /Concept/Entity/Object/Physical_object/Goods/Clothing                
.....2095                     └── Food                  /Concept/Entity/Object/Physical_object/Goods/Food                    
......40050                       └── Drink             /Concept/Entity/Object/Physical_object/Goods/Food/Drink              

```


# Monospaced tree path

`Monospaced`[`path`](https://en.wiktionary.org/wiki/道#Definitions)[道](https://www.wikidata.org/wiki/Q151885)    
　　　　　　　　├──[─](https://en.wiktionary.org/wiki/神#Definitions)[神](https://www.wikidata.org/wiki/Q12827256)    
　　　　　　　　├──[─](https://en.wiktionary.org/wiki/意#Definitions)[意](https://www.wikidata.org/wiki/Q7257)    
　　　　　　　　│　　└[─](https://en.wiktionary.org/wiki/教#Definitions)[教](https://www.wikidata.org/wiki/Q9174)    
　　　　　　　　├[─](https://en.wiktionary.org/wiki/論#Definitions)[論](https://www.wikidata.org/wiki/Q17737)    
　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/設#Definitions)[設](https://www.wikidata.org/wiki/Q41719)    
　　　　　　　　├[─](https://en.wiktionary.org/wiki/學#Definitions)[學](https://www.wikidata.org/wiki/Q395)    
　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/理#Definitions)[理](https://www.wikidata.org/wiki/Q17736)    
　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/則#Definitions)[則](https://www.wikidata.org/wiki/Q65943)    
　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/形#Definitions)[形](https://www.wikidata.org/wiki/Q207961)    
　　　　　　　　└[─](https://en.wiktionary.org/wiki/實#Definitions)[實](https://www.wikidata.org/wiki/Q35120)    
　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/時#Definitions)[時](https://www.wikidata.org/wiki/Q11471)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/象#Definitions)[象](https://www.wikidata.org/wiki/Q483247)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/史#Definitions)[史](https://www.wikidata.org/wiki/Q309)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/動#Definitions)[動](https://www.wikidata.org/wiki/Q4026292)    
　　　　　　　　　　│　│　├[─](https://en.wiktionary.org/wiki/行#Definitions)[行](https://www.wikidata.org/wiki/Q9332)    
　　　　　　　　　　│　│　│　├[─](https://en.wiktionary.org/wiki/為#Definitions)[為](https://www.wikidata.org/wiki/Q921513)    
　　　　　　　　　　│　│　│　├[─](https://en.wiktionary.org/wiki/文#Definitions)[文](https://www.wikidata.org/wiki/Q11042)    
　　　　　　　　　　│　│　│　├[─](https://en.wiktionary.org/wiki/健#Definitions)[健](https://www.wikidata.org/wiki/Q349)    
　　　　　　　　　　│　│　│　├[─](https://en.wiktionary.org/wiki/戲#Definitions)[戲](https://www.wikidata.org/wiki/Q11410)    
　　　　　　　　　　│　│　│　└[─](https://en.wiktionary.org/wiki/藝#Definitions)[藝](https://www.wikidata.org/wiki/Q735)    
　　　　　　　　　　│　│　│　　└[─](https://en.wiktionary.org/wiki/風#Definitions)[風](https://www.wikidata.org/wiki/Q483394)    
　　　　　　　　　　│　│　└[─](https://en.wiktionary.org/wiki/技#Definitions)[技](https://www.wikidata.org/wiki/Q2695280)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/變#Definitions)[變](https://www.wikidata.org/wiki/Q1150070)    
　　　　　　　　　　│　│　└[─](https://en.wiktionary.org/wiki/疾#Definitions)[疾](https://www.wikidata.org/wiki/Q12136)    
　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/程#Definitions)[程](https://www.wikidata.org/wiki/Q3249551)    
　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/生#Definitions)[生](https://www.wikidata.org/wiki/Q7239)    
　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/解#Definitions)[解](https://www.wikidata.org/wiki/Q514)    
　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/構#Definitions)[構](https://www.wikidata.org/wiki/Q6671777)    
　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/系#Definitions)[系](https://www.wikidata.org/wiki/Q58778)    
　　　　　　　　　　│　　　└[─](https://en.wiktionary.org/wiki/群#Definitions)[群](https://www.wikidata.org/wiki/Q16887380)    
　　　　　　　　　　│　　　　├[─](https://en.wiktionary.org/wiki/組#Definitions)[組](https://www.wikidata.org/wiki/Q43229)    
　　　　　　　　　　│　　　　└[─](https://en.wiktionary.org/wiki/族#Definitions)[族](https://www.wikidata.org/wiki/Q41710)    
　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/性#Definitions)[性](https://www.wikidata.org/wiki/Q937228)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/品#Definitions)[品](https://www.wikidata.org/wiki/Q1207505)    
　　　　　　　　　　│　│　└[─](https://en.wiktionary.org/wiki/語#Definitions)[語](https://www.wikidata.org/wiki/Q315)    
　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/質#Definitions)[質](https://www.wikidata.org/wiki/Q4373292)    
　　　　　　　　　　│　│　└[─](https://en.wiktionary.org/wiki/輿#Definitions)[輿](https://www.wikidata.org/wiki/Q2221906)    
　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/衡#Definitions)[衡](https://www.wikidata.org/wiki/Q47574)    
　　　　　　　　　　└[─](https://en.wiktionary.org/wiki/彼#Definitions)[彼](https://www.wikidata.org/wiki/Q488383)    
　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/言#Definitions)[言](https://www.wikidata.org/wiki/Q187931)    
　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/信#Definitions)[信](https://www.wikidata.org/wiki/Q11028)    
　　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/記#Definitions)[記](https://www.wikidata.org/wiki/Q3695082)    
　　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/訊#Definitions)[訊](https://www.wikidata.org/wiki/Q628523)    
　　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/書#Definitions)[書](https://www.wikidata.org/wiki/Q49848)    
　　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/知#Definitions)[知](https://www.wikidata.org/wiki/Q9081)    
　　　　　　　　　　　│　　　├[─](https://en.wiktionary.org/wiki/倫#Definitions)[倫](https://www.wikidata.org/wiki/Q80083)    
　　　　　　　　　　　│　　　└[─](https://en.wiktionary.org/wiki/格#Definitions)[格](https://www.wikidata.org/wiki/Q336)    
　　　　　　　　　　　│　　　　　├[─](https://en.wiktionary.org/wiki/計#Definitions)[計](https://www.wikidata.org/wiki/Q21198)    
　　　　　　　　　　　│　　　　　└[─](https://en.wiktionary.org/wiki/工#Definitions)[工](https://www.wikidata.org/wiki/Q11016)    
　　　　　　　　　　　└[─](https://en.wiktionary.org/wiki/物#Definitions)[物](https://www.wikidata.org/wiki/Q223557)    
　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/粒#Definitions)[粒](https://www.wikidata.org/wiki/Q35758)    
　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/素#Definitions)[素](https://www.wikidata.org/wiki/Q79529)    
　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/星#Definitions)[星](https://www.wikidata.org/wiki/Q6999)    
　　　　　　　　　　　　　└[─](https://en.wiktionary.org/wiki/貨#Definitions)[貨](https://www.wikidata.org/wiki/Q28877)    
　　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/建#Definitions)[建](https://www.wikidata.org/wiki/Q121359)    
　　　　　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/築#Definitions)[築](https://www.wikidata.org/wiki/Q811979)    
　　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/具#Definitions)[具](https://www.wikidata.org/wiki/Q39546)    
　　　　　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/置#Definitions)[置](https://www.wikidata.org/wiki/Q1183543)    
　　　　　　　　　　　　　　│　├[─](https://en.wiktionary.org/wiki/械#Definitions)[械](https://www.wikidata.org/wiki/Q11019)    
　　　　　　　　　　　　　　│　└[─](https://en.wiktionary.org/wiki/器#Definitions)[器](https://www.wikidata.org/wiki/Q34379)    
　　　　　　　　　　　　　　├[─](https://en.wiktionary.org/wiki/衣#Definitions)[衣](https://www.wikidata.org/wiki/Q11460)    
　　　　　　　　　　　　　　└[─](https://en.wiktionary.org/wiki/食#Definitions)[食](https://www.wikidata.org/wiki/Q2095)    
　　　　　　　　　　　　　　　　└[─](https://en.wiktionary.org/wiki/飲#Definitions)[飲](https://www.wikidata.org/wiki/Q40050)    

