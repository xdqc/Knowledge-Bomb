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
        const infoStop = new Set(['CAS Number', 'CAS no.', 'PubMed search', 'SIMBAD', 'X-SAMPA', 'Pfam', 'RefSeq', 'Locus', 'ISSN', 'ISBN', 'TLD type', 'COSPAR ID', 'NCBI', 'UniProt', 'DIN standards', 'LOINC',
                                  'Full name', 'Born', 'Died', 'Burial', 'Date of birth', 'Gender', 'Spouse', 'Website', 'Web site', 'Official website', 'Government website',
                                  'Active', 'Founder(s)', 'Leaders', 'Leader', 'Author', 'Author(s)', 'Affiliations', 'Affiliation', 'Appearances', 'Adopted', 'Adoption', 'Registration', 'Engagements',
                                  'Teams', 'Members', 'Champion', 'Champions', 'Competition', 'Association', 'Production', 'Release', 'Release date', 'Repealed', 'Response', 'Membership', 'Ceased', 'Hosts',
                                  'Coordinates', 'Speed', 'Distance', 'Height', 'Elevation', 'Temperature', 'Inclination', 'Declination', 'Density', 'First flight', 'Disbanded', 'Founded by',
                                  'Medal record', 'Team colors', 'Head coach', 'General manager', 'Home stadium', 'Produced by', 'Maiden launch', 'Launched', 'Qualification', 'Athletes',
                                  'Headquarters', 'Revenues', 'Expenses', 'Developer', 'Initial release', 'Brand(s)', 'Brands', 'Brand', 'Operator(s)', 'Regnal titles', 'Defending champion',
                                  'Half-life', 'Crystal system', 'Years', 'List of years in film', 'List of years in music', 'Years in sports', 'Successor', 'Attendance', 'Defunct',
                                  'Publication date', 'Studio albums','Composed', 'Composer(s)', 'Conductor', 'Owner', 'Published', 'Lyrics', 'Operation', 'Host', 'Feast', 'Leadership', 'CEO',
                                  'Salary', 'Allegiance', 'Armiger', 'In service', 'No. of words', 'No. of verses', 'Crew', 'Regime', 'Sovereign', 'Lifespan', 'Series', 'Abode', 'Source',
                                  'Organiser', 'Formed', 'Dissolved', 'Most wins', 'Venerated in', 'Population', 'Address', 'Body and chassis', 'Service history', 'Destinations', 'Rivals',
                                  'Operator', 'Opened', 'Closed', 'Settlements', 'Completed', 'Chancellor', 'Monarch(s)', 'Folded', 'Tournament', 'Volumes', 'Propulsion', 'Products',
                                  'Medal record', 'Date established', 'Date retired', 'Date released', 'Hometown', 'Current operator(s)', 'Variant form(s)', 'Architect', 'Manager', 'Units',
                                  'Established', 'Dates of operation', 'Cleavage', 'Fracture', 'Results', 'Active regions', 'Operating speed', 'Centuries', 'Episodes', 'Presenter(s)',
                                  'Past members', 'Publisher', 'Publisher(s)', 'Published in', 'Published by', 'Date of publication', 'Route information', 'Highway system', 'Maximum speed',
                                  'Average attendance', 'Nationality', 'Circuit length', 'Most wins (team)', 'Political groups', 'Language', 'Winner', 'League', 'Medium', 'Pharmacology',
                                  'Associated acts', 'Awards and achievements', 'First induction', 'First appearance', 'Number built', 'First issued', 'Primary user', 'Variants', 'Filling',
                                  'Cartridge', 'Transmission', 'Current champions', 'Last champions', 'Connector types', 'Shutter', 'Ballistic performance', 'Wingspan', 'Track gauge', 'Gauge',
                                  'Confluence', 'List of years in literature', 'Dissolution', 'Deposition', 'Commanders', 'Commander', 'Tributaries', 'Beginning coordinates', 'Home arena',
                                  'Merger of', 'Composers', 'Directed by', 'Abolished', 'Race', 'Races', 'Administration', 'Performance', 'Final ruler', 'Year of creation', 'National origin', 'Original owner',
                                  'Publication', 'FIFA affiliation', 'Media type', 'Motives', 'Government', 'Distributor(s)', 'Matches played', 'Leading companies', 'Country', 'Stations',
                                  'Commissioned by', 'Key people', 'First race', 'Created by', 'President', 'Appointer', 'Trade names', 'Discovered', 'Discovered by', 'Natural abundance', 'Filename extension',
                                  'Political position', 'Highest point', 'Periastron', 'Apastron', 'Eccentricity', 'Most titles', 'Markets', 'Verdict', 'Designation', 'Inception', 'Runtime',
                                  'Peerage', 'Registered', 'Perpetrator', 'Perpetrators', 'Thickness', 'Designed by', 'Parent company',
                                  'Braille', 'unicode', 'Unicode codepoint', 'Hexadecimal', 'Penumbral', 'Phonetic usage', 'transliteration', 'Pronunciations', 'The Cyrillic script']);
                                  //'Produced', 'Used by', 'Specifications', 'Manufacturer', 'Capacity',
                                  //'Preceded by', 'Followed by', 'Founder', 'Founded', 'Formation', 'Abolition', 'Inaugurated',
        const tocStop = new Set(['Medal table', 'Medal summary', 'Qualified teams', 'Group A', 'Group 1', 'Division I', 'Matches', 'The match', 'Squads', 'Winners and nominees', 'Fixtures and results',
                         'Semi-finals', 'Championship', 'Match conditions', 'World Group', 'Final round', 'Final ranking', 'Results and standings',
                         'Life', 'Personal life', 'Life and work', 'Early life', 'Later life', 'Biography and work', 'Biography', 'Bibliography', 'Career', 'Debate regarding his life and works',
                         'Holidays and observances', 'Neighbourhoods']);
        const cateStop = new Set(['Disambiguation pages',
                          'All stub articles',
                          'Set index articles', 'Set index articles on populated places in Russia', 'Chemistry set index articles',
                          'Set indices', 'Set indices on populated places in Russia', 'Set indices on ships', 'Set indices on cars', 'Set indices on comics', 'Set index articles on ships', 'Set index articles on Greek mythology',
                          'Temporary maintenance holdings',
                          'Living people', 'Year of birth unknown', 'Year of death unknown', 'Nonexistent people', 'People whose existence is disputed', 'Given names', 'Surnames',
                          'English masculine given names', 'English feminine given names',
                          'Days of the year',
                          'UTC offsets', 'Meridians (geography)', 'Circles of latitude', 'Disproven exoplanets', 'Unidentified astronomical objects',
                          'Lists of administrative divisions', 'Lists of cities by country', 'Lists of counts', 'Lists of dukes', 'Lists of roads', 'Lists of national parks',
                          'Lists and galleries of flags', 'Lists of longest rivers', 'Lists of isotopes by element', 'Vehicle registration plates by country',
                          'Top lists', 'Forbes lists', 'International rankings', 'Sports world rankings', 'Top book lists', 'Glossaries of mathematics',
                          'National coats of arms', 'National emblems', 'Presidents by country', 'Heads of government by country', 'History by country', 'Climate by country',
                          'Administrative divisions by country', 'First-level administrative divisions by country', 'Second-level administrative divisions by country', 'Third-level administrative divisions by country', 'Fourth-level administrative divisions by country', 'Fifth-level administrative divisions by country',
                          'Constitutions by country', 'Politics by country', 'Islam by country', 'COVID-19 pandemic by country', 'Tourism in Europe by country', 'Tourism in Asia by country', 'European cinema by country',
                          'Subdivisions of Israel', 'Women by country', 'Lists of public holidays by country', 'European Union-related lists', 'Tourism-related lists',
                          'European championships', 'UEFA European Championship squads', 'Top level football leagues in Europe', 'UEFA competitions', 'Defunct UEFA club competitions', 'European youth orchestras',
                          'FIFA World Cup squads', 'Association football rankings', 'Winter Paralympic Games', 'Summer Paralympic Games', 'Association football governing bodies', 'FIFA World Cup-related lists',
                          'National academies of sciences', 'National academies of arts and humanities', 'National Basketball Association lists', 'National association football supercups',
                          'Association football museums and halls of fame', 'Scheduled association football competitions', 'Defunct national association football supercups',
                          'Formula One seasons', 'Formula E seasons', 'FIA Formula 2 Championship seasons', 'Grand Prix motorcycle racing seasons',
                          'Fabulists', 'Praetorian prefects', 'Veterinarians', 'People in the Pauline epistles', 'Pauline epistles', 'Apocryphal epistles', 'People in the canonical gospels',
                          'Ancient Greek philosophers', 'Ancient Greek women philosophers', 'Ancient Greek writers', 'Ancient Greek grammarians', 'Ancient Greek sculptors', 'Ancient Greek biographers',
                          'Ancient Greek poets', 'Ancient Greek mathematicians', 'Early Greek historians', 'Ancient Greek statesmen', 'Ancient Greek astronomers', 'Ancient Greek elegiac poets',
                          'Ancient Ephesians', 'Ancient Milesians', 'Ancient Roman generals', 'Ancient Roman writers', 'Ancient Egyptian scribes', 'Ancient Arcadian poets', 'Sicilian tyrants',
                          'Ancient Roman poets', 'Ancient Roman exiles', 'Roman legions', 'Roman-era poets', 'Roman-era Jews', 'Christian poets',
                          'Italian poets', 'French poets', 'German poets', 'Sanskrit poets', 'Russian male poets', 'German male writers', 'Anglican writers', 'Syriac writers', 'Christian writers',
                          'Byzantine poets', 'Byzantine historians', 'Byzantine painters', 'Iranian historians', 'Berber writers', 'Male opera composers', 'Ancient Athenian sculptors',
                          'Cubist artists', 'Renaissance artists', 'Buddhist artists', 'Dutch Golden Age painters', 'Ancient Argives', 'Gigantes',
                          'Gothic kings', 'Gothic warriors', 'Gothic painters', 'Germanic warriors', 'Frankish warriors',
                          'Hellenistic-era historians', 'Armenian historians', 'Ethnic Armenian historians', 'Jewish historians', 'Welsh historians', 'Frankish historians',
                          'Greek explorers', 'Viking explorers', 'Irish explorers', 'Jewish philosophers', 'Jewish composers', 'Constructed language creators',
                          'Hunnic rulers', 'Iranian rulers', 'Ancient women rulers', 'Women rulers of Egypt', 'Queens of Egypt', 'Emirs of Mosul',
                          'Queens consort of the Fourth Dynasty of Egypt', 'Queens consort of the Nineteenth Dynasty of Egypt', 'Queens consort of the Eighteenth Dynasty of Egypt',
                          'Queens of the Achaemenid Empire', 'Pharaohs of the Second Dynasty of Egypt', 'Torah monarchs',
                          'Aphorists', 'Explorers of Asia', '1st-century Romans', 'Torah people', 'People of the Quran', 'Chapters in the Quran', 'Satraps of the Alexandrian Empire',
                          'Characters in Greek mythology', 'Characters in the Odyssey', 'Kings in Greek mythology', 'Princesses in Greek mythology',
                          'Legendary Islamic people', 'Mathematicians of medieval Islam', 'Astronomers of medieval Islam',
                          'Medieval legends', 'Tax collectors',
                          'Church Fathers', 'Carthaginians', 'Commentators on Aristotle', 'Trojans', 'Lines of succession', 'Grammarians of Latin', 'Yugoslav communists',
                          'Gnostics', 'Gnostic apocrypha', 'Psalms', 'Jewish apocrypha', 'Greek New Testament uncials', 'Vetus Latina New Testament manuscripts', 'Illuminated biblical manuscripts', 'Gospel Books',
                          'Mythological kings', 'Regicides', 'Regnal titles', 'Angelic visionaries', 'Antipopes', 'Ulster', 'Ancient Eretrians', 'Ancient LGBT people',
                          'Male characters in literature', 'High Priests of Israel', 'Patriarchs of Antioch', 'Eurypontid kings of Sparta', 'Byzantine people of Armenian descent',
                          'Nazi newspapers', 'Soviet novels','Pulp magazines', 'Operas', 'Upanishads', 'Gregorian calendar', 'Heraclius', 'Neoplatonists',
                          '2010 censuses', '2020 censuses', '2021 deaths', '2022 deaths', '2023 deaths',
                          'Billboard charts', 'Plays set in England', 'Anime with original screenplays', 'Women satirists', 'Women astronomers', 'Vice presidents',
                          'Grammy Awards', 'Television festivals', 'Musical quartets', 'Tennis awards', 'Golden Globe Awards', 'French awards', 'British awards', 'Song contests', 'African championships',
                          'Music industry associations', 'Islamic terminology', 'British Academy Film Awards', 'National Basketball Association All-Star Game', 'Dakar Rally', 'World championships in chess',
                          'Actress filmographies', 'Male actor filmographies', 'American films', 'American film awards', 'French film awards', 'European film awards', 'Spanish football trophies and awards',
                          'Society of Authors awards', 'Retired Academy Awards', 'Animated film series', 'American short films', 'Comics awards',
                          'Sufi orders', 'Euro coins by issuing country',
                          'Latin letters with diacritics', 'Letters with stroke', 'Latin-script digraphs', 'Persian letters', 'Arabic letters', 'Georgian letters', 'Arabic alphabets', 'Hangul jamo',
                          'Subdivisions of Japan', 'Comarques of Catalonia', 'General elections in the United States', 'Achaemenid princesses', 'Generals of Alexander the Great',
                          'Halloween television specials', 'International professional associations', 'Secret police', 'Tibetan Buddhists from Tibet', 'College of Cardinals',
                          'Medieval Italian architecture', 'German opera companies', 'Sports event promotion companies', 'Railway loop lines', 'French Roman Catholics',
                          'Intel microcontrollers', 'Nokia mobile phones', 'Motorola mobile phones', 'Canon EOS cameras', 'Defunct computer companies of the United States',
                          'Super-heavy tanks', 'Carbines',
                          'Configuration files', 'Mars program', 'United Nations days', 'National squares',
                          'Time zones', 'International borders', 'Regions of Rajasthan', 'Lost ancient cities and towns', 'Sumerian cities', 'Members of the Unrepresented Nations and Peoples Organization',
                          'Historical regions of Transylvania', 'Historical regions in Russia', 'Historical regions in Ukraine', 'Historical regions in Romania', 'Historical regions in Azerbaijan',
                          'Development regions of Romania', 'Geographical regions of Serbia',
                          'Obsolete animal taxa', 'Obsolete gastropod taxa', 'Historically recognized angiosperm taxa', 'Individual chimpanzees',
                          'Historically recognized plant families', 'Historically recognized plant genera', 'Historically recognized angiosperm orders', 'Historically recognized angiosperm families', 'Historically recognized angiosperm genera',
                          'Peninsulas of County Donegal', 'Deserts of China', 'Hill forts', 'Volcanic plugs of Asia', 'Former counties of Denmark (1970–2006)', 'Renaissance architecture in Germany',
                          'Military trucks']);
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
