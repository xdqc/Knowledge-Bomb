/****** Script for SelectTopNRows command from SSMS  ******/
DECLARE @en40 AS int
	= (SELECT TOP(1) cc.c FROM (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 40) cc)
DECLARE @simple40 AS int
	= (SELECT TOP(1) cc.c FROM (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 40) cc)
DECLARE @simpleArticle AS int
	= (SELECT TOP(1) articles FROM wiki.language WHERE code = 'simple')

SELECT TOP (1000)
	RANK() OVER (ORDER BY lc_30.c DESC) '№ (Q30)'	 
	,[name] 'Language'
	,[name_local] 'Language(Local)'
	,[code] 'Wiki'
	,FORMAT(CAST(lc_40.c AS float) / @en40, 'P2') 'Coverage% (Q40)'
	,lc_40.c 'Q40 Items'
	,lc_30.c 'Q30 Items'
	,lc_20.c 'Q20 Items'
	,articles 'Articles'
	,FORMAT(CAST(lc_40.c AS float)/articles / @simple40*@simpleArticle, 'P2') 'Solidness%'
FROM [wiki].[language] l
  
CROSS APPLY (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item
		AND a.language = l.code
		AND i.lang_count >= 20
) lc_20
  
CROSS APPLY (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item
		AND a.language = l.code
		AND i.lang_count >= 30
) lc_30
  
CROSS APPLY (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item
		AND a.language = l.code
		AND i.lang_count >= 40
) lc_40

ORDER BY lc_20.c desc
		,lc_30.c desc
		,lc_40.c desc
