/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP (10000) id wikidata
      ,[lang_count] #lang
	  ,en.title en
	  ,es.title es
	  ,ca.title ca
	  ,fr.title fr
	  ,pt.title pt
	  ,it.title it
	  ,de.title de
	  ,nl.title nl
	  ,pl.title pl
	  ,cs.title cs
	  ,ru.title ru
	  ,uk.title uk
	  ,sv.title sv
	  ,zh.title zh
	  ,ja.title ja
	  ,ko.title ko
	  ,ar.title ar
	  ,fa.title fa
	  ,he.title he
	  ,fi.title fi
	  ,tr.title tr
	  ,eu.title eu
	  ,el.title el
	  ,la.title la
  FROM [wiki].[item] i
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'en'
) en
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'es'
) es
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fr'
) fr
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ru'
) ru
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'de'
) de
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'it'
) it
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'uk'
) uk
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'pt'
) pt
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'zh'
) zh
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ja'
) ja
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'nl'
) nl
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'pl'
) pl
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ar'
) ar
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ca'
) ca
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fa'
) fa
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'sv'
) sv
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ko'
) ko
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'cs'
) cs
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fi'
) fi
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'tr'
) tr
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'he'
) he
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'eu'
) eu
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'el'
) el
OUTER APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'la'
) la
WHERE lang_count > 100 
   OR lang_count IN (99,88,77,66,55,44,33)
ORDER BY lang_count DESC, id
