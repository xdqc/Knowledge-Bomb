/****** Script for SelectTopNRows command from SSMS  ******/
DECLARE @enWSM AS int
	= (SELECT TOP(1) (c20.c+c30.c+c40.c+c50.c+c60.c) FROM 
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 20) c20
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 30) c30
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 40) c40
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 50) c50
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'en'	AND i.lang_count >= 60) c60
)
DECLARE @simpleWSM AS int
	= (SELECT TOP(1) (c20.c+c30.c+c40.c+c50.c+c60.c) FROM 
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 20) c20
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 30) c30
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 40) c40
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 50) c50
	,
	(SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item AND a.language = 'simple'	AND i.lang_count >= 60) c60
)
DECLARE @simpleArticle AS int
	= (SELECT TOP(1) articles FROM wiki.language WHERE code = 'simple')

SELECT TOP (1000)
	RANK() OVER (ORDER BY (lc_20.c+lc_30.c+lc_40.c+lc_50.c+lc_60.c) DESC, lc_60.c DESC, lc_50.c DESC, lc_40.c DESC, lc_30.c DESC, lc_20.c DESC) '№'	 
	,[name_local] 'Language(Local)'
	,[name] 'Language'
	,[code] 'Wiki'
	,FORMAT(CAST((lc_20.c+lc_30.c+lc_40.c+lc_50.c+lc_60.c) AS float) / @enWSM, 'P2') 'Coverage%'
	,lc_60.c 'Q60 Diamond'
	,lc_50.c 'Q50 Gold'
	,lc_40.c 'Q40 Silver'
	,lc_30.c 'Q30 Bronze'
	,lc_20.c 'Q20 Iron'
	,(lc_20.c+lc_30.c+lc_40.c+lc_50.c+lc_60.c) 'WSM'
	,articles 'Articles'
	,speakers 'Speakers'
	,FORMAT(CAST((lc_20.c+lc_30.c+lc_40.c+lc_50.c+lc_60.c) AS float) / articles / @simpleWSM*@simpleArticle, 'P2') 'Solidness%'
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

CROSS APPLY (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item
		AND a.language = l.code
		AND i.lang_count >= 50
) lc_50

CROSS APPLY (
	SELECT COUNT(*) c FROM wiki.article a
	JOIN wiki.item i ON i.id = a.item
		AND a.language = l.code
		AND i.lang_count >= 60
) lc_60

ORDER BY (lc_20.c+lc_30.c+lc_40.c+lc_50.c+lc_60.c) DESC
	, lc_60.c DESC
	, lc_50.c DESC
	, lc_40.c DESC
	, lc_30.c DESC
	, lc_20.c DESC
