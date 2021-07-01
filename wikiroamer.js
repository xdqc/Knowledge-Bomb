// ==UserScript==
// @name         wikipedia random page filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Samuel Ding
// @match        https://en.wikipedia.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const randomBtn = document.querySelector('li#n-randompage').firstChild;
    const langCount = document.querySelectorAll('li.interlanguage-link').length + 1;
    const isDisputed = !!document.querySelector('table.box-Disputed');
    if (langCount < 20 ||
        document.querySelector('table.biography, table.geography, table.biota, table.vevent, table.sidebar-games-events, table.succession-box') ||
        document.querySelector('span#coordinates') ||
        isDisputed
    ) {
        randomBtn.click();
    } else {
        const dryTitle = [].reduce.call(document.querySelector("h1#firstHeading").childNodes, (a, b) => a + (b.nodeType === 3 ? b.textContent : ''), '').replace(/\([^()]*\)/g, '').trim();
        const firstPar = Array.from(document.querySelectorAll('p')).find(p => p.textContent.length > 4);
        const infoStop = new Set(['CAS Number', 'PubMed search', 'MeSH', 'SIMBAD', 'X-SAMPA', 'Pfam', 'RefSeq', 'Locus', 'ISSN', 'ISBN', 'TLD type', 'COSPAR ID',
                                  'Full name', 'Born', 'Died', 'Burial', 'Date of birth', 'Gender', 'Spouse', 'Religion', 'Website', 'Web site', 'Official website', 'URL', 'Government website', //'Occupation', 'Years active', 'Introduced', 'Venue', 'Location', 'Season', 'Result', 'Date','Capital',
                                  'Founded', 'Founder(s)', 'Founder', 'Leaders', 'Leader', 'Author', 'Author(s)', 'Affiliation', 'Affiliations', 'Appearances', 'Adopted', 'Adoption', 'Registration',
                                  'Teams', 'Members', 'Champion', 'Champions', 'Competition', 'Association', 'Produced', 'Production', 'Manufacturer', 'Release', 'Active', 'Repealed', 'Response',
                                  'Speed', 'Mass', 'Distance', 'Length', 'Height', 'Width', 'Weight', 'Elevation', 'Constellation', 'Discovery date', 'Inclination', 'Declination', 'Density',
                                  'Medal record', 'Team colors', 'Head coach', 'General manager', 'Home stadium', 'Produced by', 'Maiden launch', 'Launched', 'Qualification', 'Athletes',
                                  'Headquarters', 'Revenues', 'Expenses', 'Developer', 'Initial release', 'Brand(s)', 'Brands', 'Brand', 'Operator(s)', 'Regnal titles', 'Defending champion',
                                  'Half-life', 'Crystal system', 'Years', 'List of years in film', 'List of years in music', 'Years in sports', 'Successor', 'Attendance', 'Used by',
                                  'Publication date', 'Music awards', 'Studio albums','Composed', 'Composer(s)', 'Conductor', 'Owner', 'Published', 'Lyrics', 'Operation', 'Capacity', 'Host',
                                  'Formation', 'Salary', 'Allegiance', 'Armiger', 'In service', 'No. of words', 'No. of verses', 'Crew', 'Regime', 'Sovereign', 'Lifespan', 'Inaugurated',
                                  'Organiser', 'Specifications', 'Formed', 'Dissolved', 'Most wins', 'Venerated in', 'Feast', 'Borders', 'Coordinates', 'Area', 'Population', 'Address',
                                  'Operator', 'Opened', 'Closed', 'Settlements', 'Completed', 'Chancellor', 'Monarch(s)', 'Preceded by', 'Followed by', 'Folded', 'Tournament', 'Volumes',
                                  'Medal record', 'Date established', 'Date retired', 'Date released', 'Hometown', 'Current operator(s)', 'Variant form(s)', 'Architect', 'Manager',
                                  'Established', 'Dates of operation', 'Cleavage', 'Fracture', 'Results', 'Active regions', 'Operating speed', 'Centuries', 'Episodes', 'Presenter(s)',
                                  'Past members', 'Publisher', 'Published in', 'Published by', 'Date of publication', 'Founded by', 'Route information', 'Highway system', 'Inscription',
                                  'Average attendance', 'Nationality', 'Circuit length', 'Most wins (team)', 'Political groups', 'Abolition', 'Language', 'Winner', 'League', 'Medium',
                                  'Associated acts', 'Awards and achievements', 'First induction', 'First appearance', 'Number built',
                                  'unicode', 'Unicode', 'Unicode codepoint', 'Hexadecimal', 'Penumbral', 'Phonetic usage', 'transliteration', 'Pronunciations', 'The Cyrillic script']);
        const tocStop = ['Medal table', 'Medal summary', 'Qualified teams', 'Group A', 'Group 1', 'Division I', 'Events', 'Matches', 'The match', 'Squads', 'Winners and nominees', 'Fixtures and results',
                         'Semi-finals', 'Championship', 'Match conditions', 'World Group',
                         'Holidays and observances', 'Neighbourhoods', 'Personal life', 'Life', 'Life and work', 'Early life', 'Later life', 'Biography'];
        const cateStop = ['All stub articles', 'Disambiguation pages',
                          'Living people', 'Year of birth unknown', 'Year of death unknown',
                          'Lists and galleries of flags', 'National coats of arms', 'National emblems', 'Presidents by country', 'Heads of government by country', 'Lists of cities by country',
                          'Lists of administrative divisions', 'Administrative divisions by country', 'First-level administrative divisions by country', 'Second-level administrative divisions by country', 'Third-level administrative divisions by country', 'Fourth-level administrative divisions by country', 'Fifth-level administrative divisions by country',
                          'Set indices', 'UTC offsets', 'Meridians (geography)', 'Sports event promotion companies', 'Music industry associations', 'Operas',
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
                          'Medieval Italian architecture', 'German male writers', 'Historically recognized plant families', 'COVID-19 pandemic by country', 'German opera companies',
                          'Sicilian tyrants', 'American films', 'FIFA World Cup-related lists', 'French Roman Catholics', 'Pulp magazines', 'Russian male poets', 'Ancient Greek women philosophers',
                          'Greek explorers', 'Nazi newspapers', 'Iranian rulers', 'Lists of counts', 'Lists of dukes', 'Ancient Greek biographers', 'National association football supercups+',
                          'Historical regions', 'Military trucks', 'Golden Globe Awards', 'European youth orchestras', 'Aphorists'];
                       // 'Domain name stubs', 'Flag stubs', 'Greek mythology stubs', 'Explorer stubs', 'Plant stubs', 'Russia river stubs', 'Greek sportspeople stubs', 'Africa river stubs', 'European royalty stubs', 'Pelagonia Region geography stubs', 'Byzantine people stubs', 'Ancient Roman people stubs', 'Theatrical people stubs', 'Philosopher stubs', 'Greek deity stubs', 'Solomon Islands geography stubs',
        const titleStop = ['Wikipedia:', 'List of', 'Lists of', 'Communes of', 'Districts of', 'Provinces of', 'Prefectures of ', 'Regional units of', 'Municipalities of ',
                           'Flag of', 'Flags of', 'Coat of arms of ', 'Official names of', 'Administrative divisions of', 'Local government in', 'Cities of ', 'Towns of ',
                           'ISO', 'IEEE', 'ATC code', 'Olympics', 'Olympiad', 'UEFA Euro', 'IAAF', 'Championships', 'Islam in', 'Grand Prix', 'AFI',
                           'medal table', 'episodes'];
        if (//!dryTitle ||
            !firstPar ||
            Array.from(document.querySelectorAll('table.infobox th, table.infobox td')).some(th => infoStop.has(th.textContent.trim().replace(/\:$/g, ''))) ||
            Array.from(document.querySelectorAll('span.toctext')).some(toc => tocStop.find(t => t == toc.textContent)) ||
            cateStop.some(c => document.querySelector('a[title="Category:'+c+'"]')) ||
            titleStop.some(s => dryTitle.startsWith(s) || dryTitle.endsWith(s)) ||
            firstPar.textContent.replace(/(\r\n|\n|\r)/gm, '').match(/\(.*(born|died|buried|lived)[^()]*[0-9]{2,}.*\)|([0-9]{2,}[^()]+[0-9]{2,}[,. A-zÀ-ÿ]*\))|( \(?municipality\)? (in|of) | \(?district\)? (in|of) | a \(?village\)? | a \(?town\)? | \(?city\)? in | comune of | located in | volcano in | subregion of | surname of | son of | name,? given )/gm)
            //firstPar regex:: (\([^\(\)]*(Greek|Punic|Latin|Hebrew|ca|c\.):?.*[0-9] (AD|BC|C\.E\.))|
        ){
                randomBtn.click();
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
              .finally(() => randomBtn.click());
        }
    }
})();
