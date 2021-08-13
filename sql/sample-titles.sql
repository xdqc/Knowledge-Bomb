/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP (10000) id wikidata
      ,[lang_count] #lang
	  ,hypernym
	  ,en.title en
	  ,es.title es
	  ,fr.title fr
	  ,ru.title ru
	  ,de.title de
	  ,it.title it
	  ,uk.title uk
	  ,pt.title pt
	  ,zh.title zh
	  ,ja.title ja
	  ,nl.title nl
	  ,pl.title pl
	  ,ar.title ar
	  ,ca.title ca
	  ,fa.title fa
	  ,sv.title sv
	  ,ko.title ko
	  ,cs.title cs
	  ,fi.title fi
	  ,tr.title tr
	  ,he.title he
	  ,eu.title eu
	  ,el.title el
	  ,la.title la
  FROM [wiki].[item] i
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'en' AND LEN(title) < 16
) en
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'es' AND LEN(title) < 16
) es
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fr' AND LEN(title) < 16
) fr
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ru' AND LEN(title) < 16
) ru
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'de' AND LEN(title) < 16
) de
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'it' AND LEN(title) < 16
) it
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'uk' AND LEN(title) < 16
) uk
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'pt' AND LEN(title) < 16
) pt
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'zh' AND LEN(title) < 16
) zh
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ja' AND LEN(title) < 16
) ja
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'nl' AND LEN(title) < 16
) nl
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'pl' AND LEN(title) < 16
) pl
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ar' AND LEN(title) < 16
) ar
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ca' AND LEN(title) < 16
) ca
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fa' AND LEN(title) < 16
) fa
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'sv' AND LEN(title) < 16
) sv
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ko' AND LEN(title) < 16
) ko
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'cs' AND LEN(title) < 16
) cs
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'fi' AND LEN(title) < 16
) fi
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'tr' AND LEN(title) < 16
) tr
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'he' AND LEN(title) < 16
) he
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'eu' AND LEN(title) < 16
) eu
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'el' AND LEN(title) < 16
) el
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'la' AND LEN(title) < 16
) la
WHERE lang_count >= 20
  AND hypernym NOT IN (937228,3695082)
ORDER BY lang_count DESC,hypernym, id
