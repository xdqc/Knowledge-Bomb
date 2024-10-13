// ==UserScript==
// @name         wikipedia random page filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Samuel Ding
// @match        https://en.wikipedia.org/wiki/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const randomBtn = document.querySelector('li#n-randompage').firstChild;
    const next = () => {
        randomBtn.click();
        //setTimeout(() => window.close(),400)
    }

    const langCount = document.querySelectorAll('li.interlanguage-link').length + 1;
    const isDisputed = !!document.querySelector('table.box-Disputed, table.box-More_citations_needed');
    if (langCount < 20 ||
        document.querySelector('table.biography, table.geography, table.biota, table.vevent, table.ib-settlement, table.ib-country, table.ib-former-subdiv, table.sidebar-games-events') ||
        document.querySelector('span#coordinates') ||
        isDisputed
    ) {
        next();
    } else {
        const dryTitle = document.querySelector("h1#firstHeading").textContent.replace(/\([^()]*\)/g, '').trim();
        const firstPar = Array.from(document.querySelectorAll('p')).find(p => p.textContent.length > 4);
                                  //'Occupation', 'Years active', 'Introduced', 'Venue', 'Location', 'Season', 'Result', 'Date','Capital','Mass','MeSH','Constellation','Religion','Area', 'Borders', 'Music awards', 'Inscription', 'URL',
        const infoStop = new Set(['Abode', 'Abolished', 'Active', 'Active regions', 'Address', 'Administration', 'Adopted', 'Adoption', 'Affiliation', 'Affiliations', 'Allegiance', 'Apastron', 'Appearances', 'Appointer', 'Architect',
                                  'Armiger', 'Associated acts', 'Association', 'Athletes', 'Attendance', 'Author', 'Author(s)', 'Average attendance', 'Awarded for', 'Awards and achievements', 'Ballistic performance', 'Banknotes',
                                  'Beginning coordinates', 'Body and chassis', 'Born', 'Braille', 'Brand', 'Brand(s)', 'Brands', 'Built by', 'Burial', 'CAS Number', 'CAS no.', 'CEO', 'COSPAR ID', 'Cartridge', 'Ceased', 'Centuries', 'Champion',
                                  'Champions', 'Chancellor', 'Circuit length', 'Cleavage', 'Closed', 'Commander', 'Commanders', 'Commissioned by', 'Competition', 'Completed', 'Composed', 'Composer(s)', 'Composers', 'Conductor',
                                  'Confluence', 'Connector types', 'Coordinates', 'Country', 'Created by', 'Crew', 'Crystal system', 'Current champions', 'Current operator(s)', 'DIN standards', 'Date established', 'Date of birth',
                                  'Date of publication', 'Date released', 'Date retired', 'Dates', 'Dates of operation', 'Declination', 'Defending champion', 'Defunct', 'Density', 'Deposition', 'Descended from', 'Designation', 'Designed by', 'Designer',
                                  'Destinations', 'Developer', 'Died', 'Directed by', 'Disbanded', 'Discovered', 'Discovered by', 'Dissolution', 'Dissolved', 'Distance', 'Distributor(s)', 'Eccentricity', 'Elevation', 'Engagements',
                                  'Episodes', 'Established', 'Expenses', 'Expiration', 'FIFA affiliation', 'Feast', 'Filename extension', 'Filling', 'Final ruler', 'First appearance', 'First flight', 'First induction',
                                  'First issued', 'First race', 'Folded', 'Followed by', 'Formed', 'Founded by', 'Founder(s)', 'Fracture', 'Full name', 'Gauge', 'Gender', 'General manager', 'Government', 'Government website', 'Half-life',
                                  'Head coach', 'Headquarters', 'Height', 'Hexadecimal', 'Highest point', 'Highway system', 'Home arena', 'Home stadium', 'Hometown', 'Host', 'Hosts', 'ISBN', 'ISSN', 'In service', 'Inception',
                                  'Inclination', 'Initial release', 'Key people', 'LOINC', 'Language', 'Last champions', 'Launched', 'Leader', 'Leaders', 'Leadership', 'Leading companies', 'League', 'Legal status', 'Lifespan',
                                  'List of years in film', 'List of years in literature', 'List of years in music', 'Locus', 'Lyrics', 'Maiden launch', 'Manager', 'Markets', 'Matches played', 'Maximum speed', 'Medal record',
                                  'Medal record', 'Media type', 'Medium', 'Members', 'Membership', 'Merger of', 'Monarch(s)', 'Most titles', 'Most wins', 'Most wins (team)', 'Motives', 'NCBI', 'National origin', 'Nationality',
                                  'Natural abundance', 'No. of verses', 'No. of words', 'Number built', 'Official website', 'Opened', 'Operating speed', 'Operation', 'Operator', 'Operator(s)', 'Organiser', 'Original owner', 'Owner',
                                  'Parent company', 'Past members', 'Peerage', 'Penumbral', 'Performance', 'Periastron', 'Perpetrator', 'Perpetrators', 'Pfam', 'Pharmacology', 'Phonetic usage', 'Platform', 'Political groups',
                                  'Political position', 'Population', 'Preceded by', 'Presenter(s)', 'President', 'Primary user', 'Produced by', 'Production', 'Products', 'Pronunciations', 'Propulsion', 'PubMed search', 'Publication',
                                  'Publication date', 'Published', 'Published by', 'Published in', 'Publisher', 'Publisher(s)', 'Qualification', 'Race', 'Races', 'RefSeq', 'Regime', 'Registered', 'Registration', 'Regnal titles',
                                  'Release', 'Release date', 'Repealed', 'Response', 'Results', 'Revenues', 'Rivals', 'Route information', 'Runtime', 'SIMBAD', 'Salary', 'Series', 'Service history', 'Settlements', 'Shutter', 'Signatories',
                                  'Source', 'Sovereign', 'Speed', 'Spouse', 'Stations', 'Studio albums', 'Successor', 'TLD type', 'Team colors', 'Teams', 'Temperature', 'The Cyrillic script', 'Thickness', 'Tournament', 'Track gauge',
                                  'Trade names', 'Transmission', 'Tributaries', 'UniProt', 'Unicode codepoint', 'Units', 'Variant form(s)', 'Variants', 'Venerated in', 'Verdict', 'Volumes', 'Web site', 'Website', 'Wingspan',
                                  'Winner', 'X-SAMPA', 'Year of creation', 'Years', 'Years in sports', 'transliteration', 'unicode'
                                 ]);
                                  //'Produced', 'Used by', 'Specifications', 'Manufacturer', 'Capacity',
                                  //'Preceded by', 'Followed by', 'Founder', 'Founded', 'Formation', 'Abolition', 'Inaugurated',
        const tocStop = new Set(['Medal table', 'Medal summary', 'Qualified teams', 'Group A', 'Group 1', 'Division I', 'Matches', 'The match', 'Squads', 'Winners and nominees', 'Fixtures and results',
                         'Semi-finals', 'Championship', 'Match conditions', 'World Group', 'Final round', 'Final ranking', 'Results and standings',
                         'Life', 'Personal life', 'Life and work', 'Early life', 'Later life', 'Biography and work', 'Biography', 'Bibliography', 'Career', 'Debate regarding his life and works',
                         'Holidays and observances', 'Neighbourhoods']);
        const cateStop = new Set(["1st-century Romans",
                                  "2010 censuses", "2020 censuses", "2021 deaths", "2022 deaths", "2023 deaths", "2024 deaths", "20th-century American astronomers",
                                  "6th-century Arab people",
                                  "Achaemenid princesses", "Actress filmographies", "Administrative divisions by country", "African championships", "All stub articles", "American film awards", "American films", "American short films",
                                  "Ancient Arcadian poets", "Ancient Argives", "Ancient Athenian sculptors", "Ancient Egyptian scribes", "Ancient Ephesians", "Ancient Eretrians", "Ancient Greek astronomers", "Ancient Greek biographers",
                                  "Ancient Greek elegiac poets", "Ancient Greek grammarians", "Ancient Greek mathematicians", "Ancient Greek philosophers", "Ancient Greek poets", "Ancient Greek sculptors", "Ancient Greek statesmen",
                                  "Ancient Greek women philosophers", "Ancient Greek women poets", "Ancient Greek writers", "Ancient LGBT people", "Ancient Milesians", "Ancient Roman exiles", "Ancient Roman generals",
                                  "Ancient Roman poets", "Ancient Roman writers", "Ancient women regents", "Ancient women rulers", "Angelic visionaries", "Anglican writers", "Animated film series", "Anime with original screenplays",
                                  "Antipopes", "Aphorists", "Apocryphal epistles", "Arabic alphabets", "Arabic letters", "Arctic expeditions", "Armenian historians", "Association football governing bodies",
                                  "Association football museums and halls of fame", "Association football rankings", "Astronomers of medieval Islam",
                                  "Berber writers", "Billboard charts", "Bisexual poets", "Book of Genesis people", "Books in art", "British Academy Film Awards", "British awards", "Buddhist artists", "Byzantine historians",
                                  "Byzantine painters", "Byzantine people of Armenian descent", "Byzantine poets",
                                  "COVID-19 pandemic by country", "Canon EOS cameras", "Carbines", "Carthaginians", "Chapters in the Quran", "Characters in Greek mythology", "Characters in the Odyssey", "Chemistry set index articles",
                                  "Christian poets", "Christian writers", "Church Fathers", "Circles of latitude", "Climate by country", "College of Cardinals", "Comarques of Catalonia", "Comics awards", "Commentators on Aristotle",
                                  "Configuration files", "Constitutions by country", "Constructed language creators", "Cubist artists",
                                  "Dakar Rally", "Daughters of kings", "Days of the year", "Defunct UEFA club competitions", "Defunct computer companies of the United States", "Defunct national association football supercups",
                                  "Deserts of China", "Development regions of Romania", "Disambiguation pages", "Disproven exoplanets", "Dutch Golden Age painters", "Dutch male painters",
                                  "Early Greek historians", "Elegiac poets", "Emirs of Mosul", "English feminine given names", "English masculine given names", "Ethnic Armenian historians", "Euro coins by issuing country",
                                  "European Union-related lists", "European championships", "European cinema by country", "European film awards", "European youth orchestras", "Eurypontid kings of Sparta", "Euthanasia organizations",
                                  "Executed ancient Greek people", "Explorers of Asia", "Explorers of West Asia",
                                  "FIA Formula 2 Championship seasons", "FIFA World Cup squads", "FIFA World Cup-related lists", "Fabulists", "Fictional characters who use magic", "Fifth-level administrative divisions by country",
                                  "First-level administrative divisions by country", "Forbes lists", "Former counties of Denmark (1970–2006)", "Formula E seasons", "Formula One seasons",
                                  "Fourth-level administrative divisions by country", "Frankish historians", "Frankish warriors", "French Roman Catholics", "French awards", "French film awards", "French poets",
                                  "General elections in the United States", "Generals of Alexander the Great", "Geographical regions of Serbia", "Georgian letters", "German male writers", "German opera companies", "German poets",
                                  "German socialists", "Germanic warriors", "Gigantes", "Given names", "Glossaries of mathematics", "Gnostic apocrypha", "Gnostics", "Golden Globe Awards", "Gospel Books", "Gothic kings",
                                  "Gothic painters", "Gothic warriors", "Grammarians of Latin", "Grammy Awards", "Grand Prix motorcycle racing seasons", "Greek New Testament uncials", "Greek explorers", "Gregorian calendar",
                                  "Halloween television specials", "Hangul jamo", "Heads of government by country", "Hellenistic-era historians", "Heraclius", "High Priests of Israel", "Hill forts", "Historical regions in Azerbaijan",
                                  "Historical regions in Romania", "Historical regions in Russia", "Historical regions in Ukraine", "Historical regions of Transylvania", "Historically recognized angiosperm families",
                                  "Historically recognized angiosperm genera", "Historically recognized angiosperm orders", "Historically recognized angiosperm taxa", "Historically recognized plant families",
                                  "Historically recognized plant genera", "History by country", "Hunnic rulers",
                                  "Illuminated biblical manuscripts", "Individual chimpanzees", "Intel microcontrollers", "International borders", "International professional associations", "International rankings", "Iranian historians",
                                  "Iranian rulers", "Irish explorers", "Islam by country", "Islamic terminology", "Italian male sculptors", "Italian poets",
                                  "Jesuit scientists", "Jewish apocrypha", "Jewish composers", "Jewish historians", "Jewish philosophers",
                                  "Kings in Greek mythology",
                                  "Latin letters with diacritics", "Latin-script digraphs", "Legendary Islamic people", "Letters with stroke", "Lines of succession", "Linguistics books", "Lists and galleries of flags",
                                  "Lists of administrative divisions", "Lists of cities by country", "Lists of counts", "Lists of dukes", "Lists of isotopes by element", "Lists of longest rivers", "Lists of national parks",
                                  "Lists of public holidays by country", "Lists of roads", "Living people", "Lost ancient cities and towns",
                                  "Male actor filmographies", "Male characters in literature", "Male opera composers", "Mars program", "Mathematicians of medieval Islam", "Medieval Italian architecture", "Medieval legends",
                                  "Members of the Unrepresented Nations and Peoples Organization", "Meridians (geography)", "Military trucks", "Motorola mobile phones", "Music industry associations", "Musical quartets",
                                  "Mythological kings",
                                  "National Basketball Association All-Star Game", "National Basketball Association lists", "National academies of arts and humanities", "National academies of sciences",
                                  "National association football supercups", "National coats of arms", "National emblems", "National squares", "Nazi newspapers", "Neoplatonists", "Nokia mobile phones", "Nonexistent people",
                                  "Obsolete animal taxa", "Obsolete gastropod taxa", "Operas", "Opera excerpts",
                                  "Patriarchs of Antioch", "Pauline epistles", "Peninsulas of County Donegal", "People in the Pauline epistles", "People in the canonical gospels", "People of the Quran",
                                  "People whose existence is disputed", "Persian letters", "Pharaohs of the Second Dynasty of Egypt", "Plays set in England", "Politics by country", "Pop-folk music groups", "Praetorian prefects",
                                  "Presidents by country", "Princesses in Greek mythology", "Protestant Reformers", "Psalms", "Pulp magazines",
                                  "Queens consort of the Eighteenth Dynasty of Egypt", "Queens consort of the Fourth Dynasty of Egypt", "Queens consort of the Nineteenth Dynasty of Egypt", "Queens of Egypt",
                                  "Queens of the Achaemenid Empire",
                                  "Railway loop lines", "Regicides", "Regions of Rajasthan", "Regnal titles", "Renaissance architecture in Germany", "Renaissance artists", "Retired Academy Awards", "Roman legions", "Roman-era Jews",
                                  "Roman-era poets", "Russian male poets", "Russian nobility",
                                  "Sanskrit poets", "Satraps of the Alexandrian Empire", "Scheduled association football competitions", "Second-level administrative divisions by country", "Secret police", "Set index articles",
                                  "Set index articles on cars", "Set index articles on Greek mythology", "Set index articles on populated places in Russia", "Set index articles on ships", "Set indices", "Set indices on cars",
                                  "Set indices on comics", "Set indices on populated places in Russia", "Set indices on ships", "Shaiva texts", "Sicilian tyrants", "Society of Authors awards", "Song contests", "Soviet novels",
                                  "Spanish football trophies and awards", "Sports event promotion companies", "Sports world rankings", "Subdivisions of Israel", "Subdivisions of Japan", "Sufi orders", "Sumerian cities",
                                  "Summer Paralympic Games", "Super-heavy tanks", "Surnames", "Syriac writers",
                                  "Tax collectors", "Tectonic plates", "Television festivals", "Temporary maintenance holdings", "Tennis awards", "Tennis tours and series", "Third-level administrative divisions by country",
                                  "Tibetan Buddhists from Tibet", "Time zones", "Top book lists", "Top level football leagues in Europe", "Top lists", "Torah monarchs", "Torah people", "Tourism in Asia by country",
                                  "Tourism in Europe by country", "Tourism-related lists", "Trojan Leaders", "Trojans",
                                  "UEFA European Championship squads", "UEFA competitions", "UTC offsets", "Ulster", "Unidentified astronomical objects", "United Nations days", "Upanishads", "Unfinished books",
                                  "Vehicle registration plates by country", "Veterinarians", "Vetus Latina New Testament manuscripts", "Vice presidents", "Viking explorers", "Volcanic plugs of Asia",
                                  "Welsh historians", "Winter Paralympic Games", "Women astronomers", "Women by country", "Women of the Trojan war", "Women rulers of Egypt", "Women satirists", "World championships in chess",
                                  "Writers from the Russian Empire",
                                  "Year of birth unknown", "Year of death unknown", "Yugoslav communists"
                                 ]);
                       // 'Domain name stubs', 'Flag stubs', 'Greek mythology stubs', 'Explorer stubs', 'Plant stubs', 'Russia river stubs', 'Greek sportspeople stubs', 'Africa river stubs', 'European royalty stubs', 'Pelagonia Region geography stubs', 'Byzantine people stubs', 'Ancient Roman people stubs', 'Theatrical people stubs', 'Philosopher stubs', 'Greek deity stubs', 'Solomon Islands geography stubs',
        const titleStop = ['Wikipedia:', 'Category:', 'Module:', 'Help:', 'Portal:','Template:',
                           'List of', 'Lists of', 'Communes of', 'Districts of', 'Provinces of', 'Prefectures of ', 'Regional units of', 'Municipalities of ', 'Subdivisions of ',
                           'Flag of', 'Flags of', 'Coat of arms of ', 'Official names of', 'Administrative divisions of', 'Local government in', 'Cities of ', 'Towns of ',
                           'by country', 'Geography of', 'Demographics of',
                           'ISO', 'IEEE', 'ATC code', 'Olympics', 'Olympiad', 'UEFA Euro', 'IAAF', 'Championships', 'Islam in', 'Grand Prix', 'AFI',
                           'medal table', 'episodes'];
        if (//!dryTitle ||
            !firstPar ||
            Array.from(document.querySelectorAll('table.infobox th,table.infobox td, table.succession-box th')).some(th => infoStop.has(th.textContent.trim().replace('&nbsp;',' ').replace(/\:$/g, ''))) ||
            Array.from(document.querySelectorAll('span.mw-headline')).some(t => tocStop.has(t.id)) ||
            Array.from(document.querySelectorAll('a[title^=Category]')).some(a => cateStop.has(a.textContent)) ||
            titleStop.some(s => dryTitle.startsWith(s) || dryTitle.endsWith(s)) ||
            !!firstPar.textContent.replace(/(\r\n|\n|\r)/gm, '').match(/( \(?municipality\)?( located)? (in|of) | \(?district\)?( located)? (in|of) | a \(?village\)? | a \(?town\)? | \(?city\)? in | comune of | volcano in | subregion of | surname of | son of | name,? given )/gm) ||
            !!firstPar.textContent.replace(/(\r\n|\n|\r)/gm, '').match(/([0-9]{3,}[^()]+[0-9]{3,}[,;. A-zÀ-ÿ]*\))/gm) ||
            !!firstPar.textContent.replace(/(\r\n|\n|\r)/gm, '').match(/\(.*(born|died|buried|lived)[^()]*[0-9]{2,}.*\)/gm)
            //firstPar regex:: (\([^\(\)]*(Greek|Punic|Latin|Hebrew|ca|c\.):?.*[0-9] (AD|BC|C\.E\.))|
        ){
                next();
            //if (Array.from(document.querySelectorAll('table.infobox th,table.infobox td')).some(th => new Set(['CAS Number','Coordinates','Number built','Crystal system','Crew','Body and chassis','Cartridge','Appearances','Service history','Author(s)','Launched','Revenues','Folded','Website']).has(th.textContent.trim().replace(/\:$/g, '')))) {
            //}
        } else {
            const title = document.querySelector("h1#firstHeading").textContent.trim();

            const langData = Array.from(document.querySelectorAll('li.interlanguage-link'))
              .map(li => li.firstChild.attributes)
              .reduce((s,a) => {s[a.href.value.match(/https:\/\/([a-z\-]+)/)[1]] = a.title.value.replace(/ – [^–]+$/g,''); return s;},{en:title})

            const wikiDataId = document.querySelector('li#t-wikibase').firstChild.href.match(/[0-9]+$/g);

            fetch(`https://localhost:8080/wiki?q=${wikiDataId}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(langData),
            }).then(resp => resp.text())
              .then(data => console.log(data))
              .finally(() => {
               next();
            });
        }
    }
})();
