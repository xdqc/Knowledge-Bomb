// ==UserScript==K
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
        const dryTitle = [].reduce.call(document.querySelector("h1#firstHeading").childNodes, (a, b) => a + (b.nodeType === 3 ? b.textContent : ''), '').replace(/\([^()]*\)/g, '').trim();
        const firstPar = Array.from(document.querySelectorAll('p')).find(p => p.textContent.length > 4);
                                  //'Occupation', 'Years active', 'Introduced', 'Venue', 'Location', 'Season', 'Result', 'Date','Capital','Mass','MeSH','Constellation','Religion','Area', 'Borders', 'Music awards', 'Inscription',
        const infoStop = new Set(['CAS Number', 'CAS no.', 'PubMed search', 'SIMBAD', 'X-SAMPA', 'Pfam', 'RefSeq', 'Locus', 'ISSN', 'ISBN', 'TLD type', 'COSPAR ID', 'NCBI',
                                  'Full name', 'Born', 'Died', 'Burial', 'Date of birth', 'Gender', 'Spouse', 'Website', 'Web site', 'Official website', 'URL', 'Government website',
                                  'Active', 'Founder(s)', 'Leaders', 'Leader', 'Author', 'Author(s)', 'Affiliations', 'Appearances', 'Adopted', 'Adoption', 'Registration', 'Engagements',
                                  'Teams', 'Members', 'Champion', 'Champions', 'Competition', 'Association', 'Production', 'Release', 'Repealed', 'Response', 'Membership', 'Ceased',
                                  'Coordinates', 'Speed', 'Distance', 'Height', 'Elevation', 'Discovery date', 'Inclination', 'Declination', 'Density', 'First flight', 'Disbanded',
                                  'Medal record', 'Team colors', 'Head coach', 'General manager', 'Home stadium', 'Produced by', 'Maiden launch', 'Launched', 'Qualification', 'Athletes',
                                  'Headquarters', 'Revenues', 'Expenses', 'Developer1', 'Initial release', 'Brand(s)', 'Brands', 'Brand', 'Operator(s)', 'Regnal titles', 'Defending champion',
                                  'Half-life', 'Crystal system', 'Years', 'List of years in film', 'List of years in music', 'Years in sports', 'Successor', 'Attendance', 'Defunct',
                                  'Publication date', 'Studio albums','Composed', 'Composer(s)', 'Conductor', 'Owner', 'Published', 'Lyrics', 'Operation', 'Host', 'Feast', 'Leadership',
                                  'Salary', 'Allegiance', 'Armiger', 'In service', 'No. of words', 'No. of verses', 'Crew', 'Regime', 'Sovereign', 'Lifespan', 'Series', 'Abode', 'Source',
                                  'Organiser', 'Formed', 'Dissolved', 'Most wins', 'Venerated in', 'Population', 'Address', 'Body and chassis', 'Service history', 'Destinations', 'Rivals',
                                  'Operator', 'Opened', 'Closed', 'Settlements', 'Completed', 'Chancellor', 'Monarch(s)', 'Folded', 'Tournament', 'Volumes', 'Propulsion', 'Products',
                                  'Medal record', 'Date established', 'Date retired', 'Date released', 'Hometown', 'Current operator(s)', 'Variant form(s)', 'Architect', 'Manager',
                                  'Established', 'Dates of operation', 'Cleavage', 'Fracture', 'Results', 'Active regions', 'Operating speed', 'Centuries', 'Episodes', 'Presenter(s)',
                                  'Past members', 'Publisher', 'Published in', 'Published by', 'Date of publication', 'Founded by', 'Route information', 'Highway system', 'Maximum speed',
                                  'Average attendance', 'Nationality', 'Circuit length', 'Most wins (team)', 'Political groups', 'Language', 'Winner', 'League', 'Medium', 'Pharmacology',
                                  'Associated acts', 'Awards and achievements', 'First induction', 'First appearance', 'Number built', 'First issued', 'Primary user', 'Variants', 'Filling',
                                  'Cartridge', 'Transmission', 'Current champions', 'Last champions', 'Connector types', 'Shutter', 'Ballistic performance', 'Wingspan', 'Track gauge', 'Gauge',
                                  'Confluence', 'List of years in literature', 'Dissolution', 'Deposition', 'Commanders', 'Commander', 'Tributaries', 'Beginning coordinates', 'Home arena',
                                  'Merger of', 'Composers', 'Directed by', 'Abolished', 'Races', 'Administration', 'Performance', 'Final ruler', 'Year of creation', 'National origin', 'Original owner',
                                  'Publication', 'FIFA affiliation', 'Media type', 'Motives', 'Government', 'Distributor(s)', 'Matches played', 'Leading companies', 'Country', 'Stations',
                                  'Commissioned by',
                                  'unicode', 'Unicode codepoint', 'Hexadecimal', 'Penumbral', 'Phonetic usage', 'transliteration', 'Pronunciations', 'The Cyrillic script']);
                                  //'Produced', 'Used by', 'Specifications', 'Manufacturer', 'Capacity',
                                  //'Preceded by', 'Followed by', 'Founder', 'Founded', 'Formation', 'Abolition', 'Inaugurated',
        const tocStop = ['Medal table', 'Medal summary', 'Qualified teams', 'Group A', 'Group 1', 'Division I', 'Matches', 'The match', 'Squads', 'Winners and nominees', 'Fixtures and results',
                         'Semi-finals', 'Championship', 'Match conditions', 'World Group',
                         'Life', 'Personal life', 'Life and work', 'Early life', 'Later life', 'Biography and work', 'Biography', 'Bibliography', 'Career',
                         'Holidays and observances', 'Neighbourhoods', ];
        const cateStop = ['Disambiguation pages',
                          'Temporary maintenance holdings',
                          'All stub articles',
                          'Living people', 'Year of birth unknown', 'Year of death unknown', 'People whose existence is disputed', 'Given names', 'Surnames',
                          'Set indices', 'Set indices on populated places in Russia', 'Set indices on ships', 'Top lists',
                          'UTC offsets', 'Meridians (geography)', 'Circles of latitude', 'Disproven exoplanets', 'Unidentified astronomical objects',
                          'Lists of administrative divisions', 'Lists of cities by country', 'Lists of counts', 'Lists of dukes', 'Lists of roads',
                          'Administrative divisions by country', 'First-level administrative divisions by country', 'Second-level administrative divisions by country', 'Third-level administrative divisions by country', 'Fourth-level administrative divisions by country', 'Fifth-level administrative divisions by country',
                          'Lists and galleries of flags', 'National coats of arms', 'National emblems', 'Presidents by country', 'Heads of government by country', 'History by country',
                          'Constitutions by country', 'Politics by country', 'Islam by country', 'COVID-19 pandemic by country', 'Tourism in Europe by country', 'Tourism in Asia by country',
                          'European championships', 'UEFA European Championship squads', 'Top level football leagues in Europe', 'UEFA competitions', 'Defunct UEFA club competitions', 'European youth orchestras',
                          'FIFA World Cup squads', 'Association football rankings', 'Winter Paralympic Games', 'Summer Paralympic Games', 'Association football governing bodies', 'FIFA World Cup-related lists',
                          'National academies of sciences', 'National academies of arts and humanities', 'National Basketball Association lists', 'National association football supercups',
                          'Association football museums and halls of fame', 'Scheduled association football competitions', 'Defunct national association football supercups',
                          'Fabulists', 'Praetorian prefects', 'Veterinarians', 'People in the Pauline epistles', 'Formula One seasons', 'Formula E seasons',
                          'Ancient Greek philosophers', 'Ancient Greek women philosophers', 'Ancient Greek writers', 'Ancient Greek grammarians', 'Ancient Greek sculptors', 'Ancient Greek biographers',
                          'Ancient Greek poets', 'Ancient Greek mathematicians', 'Early Greek historians', 'Ancient Ephesians', 'Ancient Milesians', 'Greek explorers', 'Viking explorers',
                          'Ancient Roman generals', 'Ancient Roman writers', 'Ancient Egyptian scribes', 'Ancient Arcadian poets', 'Ancient women rulers', 'Sicilian tyrants',
                          'Byzantine poets', 'Byzantine historians', 'Byzantine painters', 'Gothic painters', 'Iranian historians', 'Iranian rulers',
                          'Italian poets', 'Roman-era poets', 'French poets', 'German poets', 'Sanskrit poets', 'Russian male poets', 'German male writers',
                          'Hellenistic-era historians', 'Armenian historians', 'Ethnic Armenian historians', 'Jewish historians', 'Welsh historians',
                          'Aphorists', 'Explorers of Asia', '1st-century Romans', 'Torah people', 'People of the Quran', 'Legendary Islamic people',
                          'Satraps of the Alexandrian Empire', 'Generals of Alexander the Great', 'Characters in Greek mythology', 'Kings in Greek mythology',
                          'Church Fathers', 'Gnostics', 'Carthaginians', 'Commentators on Aristotle', 'Trojans', 'Lines of succession', 'Grammarians of Latin',
                          'High Priests of Israel', 'Roman-era Jews', 'Mythological kings', 'Regicides', 'Regnal titles', 'Angelic visionaries', 'Antipopes',
                          'Women satirists', 'Women astronomers', 'Queens consort of the Fourth Dynasty of Egypt',
                          'Forbes lists', 'International rankings', '2010 censuses', '2020 censuses', '2021 deaths', '2022 deaths',
                          'Nazi newspapers', 'Soviet novels','Pulp magazines', 'Operas', 'Upanishads', 'Gregorian calendar', 'Heraclius', 'Neoplatonists',
                          'Grammy Awards', 'Television festivals', 'Musical quartets', 'Tennis awards', 'Golden Globe Awards', 'French awards',
                          'Music industry associations', 'Islamic terminology', 'British Academy Film Awards', 'National Basketball Association All-Star Game',
                          'Actress filmographies', 'Male actor filmographies', 'American films','Billboard charts', 'Anime with original screenplays',
                          'Latin letters with diacritics', 'Letters with stroke', 'Latin-script digraphs', 'Persian letters', 'Arabic letters', 'Georgian letters',
                          'Subdivisions of Japan', 'Comarques of Catalonia', 'General elections in the United States', 'Achaemenid princesses',
                          'Halloween television specials', 'International professional associations', 'Secret police', 'Tibetan Buddhists from Tibet', 'College of Cardinals',
                          'Medieval Italian architecture', 'German opera companies', 'Sports event promotion companies', 'Railway loop lines', 'French Roman Catholics',
                          'Intel microcontrollers', 'Nokia mobile phones', 'Motorola mobile phones', 'Canon EOS cameras',
                          'Obsolete animal taxa', 'Obsolete gastropod taxa', 'Individual chimpanzees',
                          'Historically recognized plant families', 'Historically recognized plant genera', 'Historically recognized angiosperm orders', 'Historically recognized angiosperm families', 'Historically recognized angiosperm genera',
                          'Peninsulas of County Donegal', 'Deserts of China', 'Hill forts', 'Volcanic plugs of Asia', 'Former counties of Denmark (1970–2006)',
                          'Military trucks', ];
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
            //Array.from(document.querySelectorAll('table.infobox th,table.infobox td')).some(th => new Set(['CAS Number']).has(th.textContent.trim().replace(/\:$/g, ''))) ||
            Array.from(document.querySelectorAll('span.toctext')).some(toc => tocStop.find(t => t == toc.textContent)) ||
            cateStop.some(c => document.querySelector('a[title="Category:'+c+'"]')) ||
            titleStop.some(s => dryTitle.startsWith(s) || dryTitle.endsWith(s)) ||
            firstPar.textContent.replace(/(\r\n|\n|\r)/gm, '').match(/\(.*(born|died|buried|lived)[^()]*[0-9]{2,}.*\)|([0-9]{2,}[^()]+[0-9]{2,}[,;. A-zÀ-ÿ]*\))|( \(?municipality\)?( located)? (in|of) | \(?district\)?( located)? (in|of) | a \(?village\)? | a \(?town\)? | \(?city\)? in | comune of | volcano in | subregion of | surname of | son of | name,? given )/gm)
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

            fetch(`http://localhost:8080/wiki?q=${wikiDataId}`,{
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
