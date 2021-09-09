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
    const isDisputed = !!document.querySelector('table.box-Disputed');
    if (langCount < 20 ||
        document.querySelector('table.biography, table.geography, table.biota, table.vevent, table.ib-settlement, table.ib-country, table.sidebar-games-events') ||
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
                                  'Organiser', 'Formed', 'Dissolved', 'Most wins', 'Venerated in', 'Population', 'Address', 'Body and chassis', 'Service history', 'Destinations',
                                  'Operator', 'Opened', 'Closed', 'Settlements', 'Completed', 'Chancellor', 'Monarch(s)', 'Folded', 'Tournament', 'Volumes', 'Propulsion', 'Products',
                                  'Medal record', 'Date established', 'Date retired', 'Date released', 'Hometown', 'Current operator(s)', 'Variant form(s)', 'Architect', 'Manager',
                                  'Established', 'Dates of operation', 'Cleavage', 'Fracture', 'Results', 'Active regions', 'Operating speed', 'Centuries', 'Episodes', 'Presenter(s)',
                                  'Past members', 'Publisher', 'Published in', 'Published by', 'Date of publication', 'Founded by', 'Route information', 'Highway system', 'Maximum speed',
                                  'Average attendance', 'Nationality', 'Circuit length', 'Most wins (team)', 'Political groups', 'Language', 'Winner', 'League', 'Medium', 'Pharmacology',
                                  'Associated acts', 'Awards and achievements', 'First induction', 'First appearance', 'Number built', 'First issued', 'Primary user', 'Variants', 'Filling',
                                  'Cartridge', 'Transmission', 'Current champions', 'Last champions', 'Connector types', 'Shutter', 'Ballistic performance', 'Wingspan', 'Track gauge', 'Gauge',
                                  'Confluence', 'List of years in literature', 'Dissolution', 'Deposition', 'Commanders', 'Commander', 'Tributaries', 'Beginning coordinates', 'Home arena',
                                  'Merger of', 'Composers', 'Directed by', 'Abolished', 'Races', 'Administration', 'Performance', 'Final ruler', 'Year of creation', 'National origin',
                                  'Publication', 'FIFA affiliation', 'Media type', 'Motives', 'Government',
                                  'unicode', 'Unicode codepoint', 'Hexadecimal', 'Penumbral', 'Phonetic usage', 'transliteration', 'Pronunciations', 'The Cyrillic script']);
                                  //'Produced', 'Used by', 'Specifications', 'Manufacturer', 'Capacity',
                                  //'Preceded by', 'Followed by', 'Founder', 'Founded', 'Formation', 'Abolition', 'Inaugurated',
        const tocStop = ['Medal table', 'Medal summary', 'Qualified teams', 'Group A', 'Group 1', 'Division I', 'Matches', 'The match', 'Squads', 'Winners and nominees', 'Fixtures and results',
                         'Semi-finals', 'Championship', 'Match conditions', 'World Group',
                         'Life',
                         'Holidays and observances', 'Neighbourhoods', 'Personal life', 'Life and work', 'Early life', 'Later life', 'Biography'];
        const cateStop = ['Disambiguation pages',
                          'Temporary maintenance holdings',
                          'All stub articles',
                          'Living people', 'Year of birth unknown', 'Year of death unknown',
                          'Lists and galleries of flags', 'National coats of arms', 'National emblems', 'Presidents by country', 'Heads of government by country', 'Lists of cities by country',
                          'Lists of administrative divisions', 'Administrative divisions by country', 'First-level administrative divisions by country', 'Second-level administrative divisions by country', 'Third-level administrative divisions by country', 'Fourth-level administrative divisions by country', 'Fifth-level administrative divisions by country',
                          'Meridians (geography)', 'Set indices', 'UTC offsets', 'Sports event promotion companies', 'Music industry associations', 'Operas', 'Upanishads', 'Regnal titles',
                          'Characters in Greek mythology', 'Kings in Greek mythology', 'Trojans', 'Lines of succession', 'Grammarians of Latin', 'FIFA World Cup squads',
                          'Obsolete animal taxa', 'Obsolete gastropod taxa', 'Torah people', 'Given names', 'Surnames', 'Iranian historians', 'Ancient Greek sculptors', 'Early Greek historians',
                          'Grammy Awards', 'Disproven exoplanets', 'Gregorian calendar', 'Circles of latitude', 'Television festivals', 'Deserts of China', 'Musical quartets',
                          'Welsh historians', 'Former counties of Denmark (1970–2006)', 'Intel microcontrollers', 'Set indices on populated places in Russia', 'Nokia mobile phones',
                          'Hill forts', 'Volcanic plugs of Asia', 'Veterinarians', 'French poets', 'People in the Pauline epistles', 'Set indices on ships', 'Top lists', 'International rankings',
                          'Jewish historians', 'Church Fathers', 'Ancient Greek writers', 'Ancient Greek grammarians', 'Armenian historians', 'Gnostics', 'Carthaginians', 'Ethnic Armenian historians',
                          'Historically recognized angiosperm orders', 'Historically recognized angiosperm families', 'Commentators on Aristotle', 'Defunct national association football supercups',
                          'UEFA competitions', 'Peninsulas of County Donegal', 'Soviet novels', 'UEFA European Championship squads', 'Ancient Egyptian scribes', 'Byzantine poets', 'Ancient Arcadian poets',
                          'Angelic visionaries', 'Antipopes', 'Ancient Roman generals', 'Ancient Roman writers', 'Islamic terminology', 'British Academy Film Awards', 'Islam by country',
                          'Actress filmographies', 'Male actor filmographies', '2010 censuses', '2020 censuses', 'Heraclius', 'Ancient Greek poets', 'Neoplatonists', 'Viking explorers',
                          'Medieval Italian architecture', 'German male writers', 'Historically recognized plant families', 'COVID-19 pandemic by country', 'German opera companies', 'Canon EOS cameras',
                          'Sicilian tyrants', 'American films', 'FIFA World Cup-related lists', 'French Roman Catholics', 'Pulp magazines', 'Russian male poets', 'Ancient Greek women philosophers',
                          'Greek explorers', 'Nazi newspapers', 'Iranian rulers', 'Lists of counts', 'Lists of dukes', 'Ancient Greek biographers', 'National association football supercups',
                          'Latin letters with diacritics', 'Letters with stroke', 'Latin-script digraphs', 'Persian letters', 'Arabic letters', 'Subdivisions of Japan', 'Comarques of Catalonia',
                          'General elections in the United States', 'Achaemenid princesses', 'Lists of roads', 'Defunct UEFA club competitions', 'Top level football leagues in Europe',
                          'Ancient Greek philosophers', 'Women satirists', 'Ancient Greek mathematicians', 'Roman-era poets', 'Explorers of Asia', '1st-century Romans', 'Italian poets',
                          'Byzantine historians', 'German poets', 'Sanskrit poets', 'Ancient women rulers', 'Praetorian prefects', 'Historically recognized angiosperm genera', 'Historically recognized plant genera',
                          'Ancient Ephesians', 'Ancient Milesians', 'Georgian letters', 'Winter Paralympic Games', 'Association football governing bodies', 'Generals of Alexander the Great',
                          'Hellenistic-era historians', 'Scheduled association football competitions', 'Summer Paralympic Games', 'Forbes lists',
                          'Military trucks', 'Golden Globe Awards', 'European youth orchestras', 'Aphorists'];
                       // 'Domain name stubs', 'Flag stubs', 'Greek mythology stubs', 'Explorer stubs', 'Plant stubs', 'Russia river stubs', 'Greek sportspeople stubs', 'Africa river stubs', 'European royalty stubs', 'Pelagonia Region geography stubs', 'Byzantine people stubs', 'Ancient Roman people stubs', 'Theatrical people stubs', 'Philosopher stubs', 'Greek deity stubs', 'Solomon Islands geography stubs',
        const titleStop = ['Wikipedia:', 'Category:', 'Module:', 'Help:', 'Portal:','Template:',
                           'List of', 'Lists of', 'Communes of', 'Districts of', 'Provinces of', 'Prefectures of ', 'Regional units of', 'Municipalities of ',
                           'Flag of', 'Flags of', 'Coat of arms of ', 'Official names of', 'Administrative divisions of', 'Local government in', 'Cities of ', 'Towns of ',
                           'ISO', 'IEEE', 'ATC code', 'Olympics', 'Olympiad', 'UEFA Euro', 'IAAF', 'Championships', 'Islam in', 'Grand Prix', 'AFI', 'by country',
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
