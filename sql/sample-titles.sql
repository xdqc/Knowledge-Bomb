/****** Object:  UserDefinedFunction [dbo].[RemoveParenLen] ******/
DROP FUNCTION [RemoveParen]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [RemoveParen] (@item nvarchar(MAX))
RETURNS nvarchar(MAX) AS BEGIN
DECLARE @res nvarchar(MAX)

;WITH 
Base AS 
	( SELECT n FROM (VALUES(0), (0), (0), (0), (0), (0), (0), (0), (0), (0), (0) ) t(n) )
,Tally AS
	(
	SELECT ROW_NUMBER() OVER(ORDER  BY @@VERSION) AS n
	FROM Base AS a
	CROSS JOIN Base AS b
	)
,exploded AS
	(
	SELECT *
		,SUM(
		CASE
		WHEN s.cur_char = '(' THEN 1
		WHEN s.prev_char = ')' THEN -1
		ELSE 0
		END)
	OVER(ORDER BY t.n ROWS UNBOUNDED PRECEDING) AS paren_cnt
	FROM Tally AS t
	CROSS APPLY (VALUES(SUBSTRING(@item, n, 1), SUBSTRING(@item, n-1, 1))) s(cur_char, prev_char)
	WHERE t.n <= LEN(@item)
	)
SELECT @res = 
(
	SELECT
		CASE
		WHEN e.cur_char = ' ' AND LEAD(e.cur_char, 1, ' ') OVER(ORDER BY e.n) IN ('.', ' ') THEN ''
		ELSE e.cur_char
		END 
	FROM exploded AS e
	WHERE e.paren_cnt = 0
	ORDER BY e.n
	FOR XML PATH, TYPE
).value('.', 'nvarchar(max)')

RETURN @res
END
GO


SELECT TOP (10000) [id] wikidata
      ,[lang_count] #lang
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
	  ,id.title id
	  ,tr.title tr
	  ,no.title no
	  ,he.title he
	  ,eu.title eu
	  ,el.title el
	  ,la.title la
	  ,hypernym

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
	WHERE a.item = i.id AND a.language = 'ru' AND LEN(title) < 14
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
	WHERE a.item = i.id AND a.language = 'uk' AND LEN(title) < 14
) uk
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'pt' AND LEN(title) < 16
) pt
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'zh' AND LEN(title) < 8
) zh
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'ja' AND LEN(title) < 10
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
	WHERE a.item = i.id AND a.language = 'ko' AND LEN(title) < 10
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
	WHERE a.item = i.id AND a.language = 'id' AND LEN(title) < 16
) id
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'tr' AND LEN(title) < 16
) tr
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'no' AND LEN(title) < 16
) no
CROSS APPLY(
	SELECT item,title FROM wiki.article a
	WHERE a.item = i.id AND a.language = 'he' AND LEN(title) < 14
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

ORDER BY 
	 LEN(dbo.RemoveParen(en.title))
	+LEN(dbo.RemoveParen(es.title))
	+LEN(dbo.RemoveParen(fr.title))
	+LEN(dbo.RemoveParen(ru.title))
	+LEN(dbo.RemoveParen(de.title))
	+LEN(dbo.RemoveParen(it.title))
	+LEN(dbo.RemoveParen(uk.title))
	+LEN(dbo.RemoveParen(pt.title))
	+LEN(dbo.RemoveParen(zh.title))
	+LEN(dbo.RemoveParen(ja.title))
	+LEN(dbo.RemoveParen(nl.title))
	+LEN(dbo.RemoveParen(pl.title))
	+LEN(dbo.RemoveParen(ar.title))
	+LEN(dbo.RemoveParen(ca.title))
	+LEN(dbo.RemoveParen(fa.title))
	+LEN(dbo.RemoveParen(sv.title))
	+LEN(dbo.RemoveParen(ko.title))
	+LEN(dbo.RemoveParen(cs.title))
	+LEN(dbo.RemoveParen(fi.title))
	+LEN(dbo.RemoveParen(id.title))
	+LEN(dbo.RemoveParen(tr.title))
	+LEN(dbo.RemoveParen(no.title))
	+LEN(dbo.RemoveParen(he.title))
	+LEN(dbo.RemoveParen(eu.title))
	+LEN(dbo.RemoveParen(el.title))
	+LEN(dbo.RemoveParen(la.title))
	,hypernym, lang_count DESC, id
GO
