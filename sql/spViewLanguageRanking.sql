ALTER PROCEDURE [wiki].[spViewLanguageRanking]
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON
	DECLARE @enWSM AS float
		= (SELECT TOP(1) (s.c) FROM 
		(SELECT (SUM(lang_count*lang_count)) c FROM wiki.article a
		JOIN wiki.item i ON i.id = a.item AND a.language = 'en') s
	)
	DECLARE @simpleWSM AS float
		= (SELECT TOP(1) (s.c) FROM 
		(SELECT (SUM(lang_count*lang_count)) c FROM wiki.article a
		JOIN wiki.item i ON i.id = a.item AND a.language = 'simple') s
	)
	DECLARE @simpleArticle AS float
		= (SELECT TOP(1) articles FROM wiki.language WHERE code = 'simple')

	DROP TABLE IF EXISTS wiki.#RankTable

	SELECT TOP (1000)
		RANK() OVER (ORDER BY (ss.s) DESC, l.code) 'Rank'	 
		,[name_local] 'Language(Local)'
		,[name] 'Language'
		,[code] 'Wiki'
		,FORMAT( ss.s / @enWSM, 'P2') 'Coverage%'
		,CONVERT(DECIMAL(10,2), SQRT(ss.s)) 'WSM'
		,lc_60.c 'Q60 Diamond'
		,lc_50.c 'Q50 Gold'
		,lc_40.c 'Q40 Silver'
		,lc_30.c 'Q30 Bronze'
		,lc_20.c 'Q20 Iron'
		,articles 'Articles'
		,FORMAT( ss.s / @simpleWSM * @simpleArticle / CAST(articles as float), 'P2') 'Solidness%'
		,speakers 'Speakers'
	INTO wiki.#RankTable
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

	CROSS APPLY (
		SELECT CAST(SUM(lang_count * lang_count) as float) s
		FROM wiki.article a
		JOIN wiki.item i ON i.id = a.item
			AND a.language = l.code
	) ss

	ORDER BY ss.s DESC


	SELECT * from wiki.#RankTable

	UPDATE wiki.language 
	SET  rank = rt.Rank 
	FROM wiki.language la
	LEFT JOIN wiki.#RankTable rt
	ON la.code = rt.Wiki

	DROP TABLE IF EXISTS wiki.#RankTable

END
