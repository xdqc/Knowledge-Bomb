ALTER PROCEDURE [wiki].[spViewHierarchy]


AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

	DROP TABLE IF EXISTS wiki.#CateTree

	-- update h_count
	UPDATE wiki.category
	SET h_count = (
		SELECT COUNT (hypernym)
		FROM wiki.item i
		WHERE wiki.category.item = i.hypernym
	)

	-- Recursive select on self-referenced table
	;WITH Hierarchy AS
	(
		SELECT
			item, hypernym, title, title_mono, seq,
			CAST('' + CAST(title AS nvarchar(20)) AS nvarchar(max)) AS [Path],
			CAST('' + CAST(title_monos AS nvarchar(20)) AS nvarchar(max)) AS [PathS],
			CAST('' + CAST(title_mono AS nvarchar(20)) AS nvarchar(max)) AS [PathM],
			CAST('/' + CAST(seq AS varchar(20)) AS varchar(max)) AS [Path0],
			CAST('/' + CAST(title AS varchar(20)) AS varchar(max)) AS [PathF],
			CAST('' AS varchar(50)) AS Prefix
		FROM wiki.category
		WHERE hypernym IS NULL

		UNION ALL

		SELECT
			t.item, t.hypernym, t.title, t.title_mono, t.seq,
			CAST(dbo.RemovePattern(h.[Path], '%[a-z]%') + ' ' + CAST(t.title AS nvarchar(20)) AS nvarchar(max)),
			CAST(dbo.RemovePattern(h.[PathS], '%[^　]%') + '　' + CAST(t.title_monos AS nvarchar(20)) AS nvarchar(max)),
			CAST(dbo.RemovePattern(h.[PathM], '%[^　]%') + '　' + CAST(t.title_mono AS nvarchar(20)) AS nvarchar(max)),
			CAST(h.[Path0] + '/' + CAST(t.seq AS varchar(20)) AS varchar(max)),
			CAST(h.[PathF] + '/' + CAST(t.title AS varchar(20)) AS varchar(max)),
			CAST(h.Prefix + '.' AS varchar(50))
		FROM Hierarchy h
		INNER JOIN wiki.category t
			ON t.hypernym = h.item
	)

	SELECT item 
		,Prefix + CAST(item AS varchar(20)) AS Node
		,RANK() OVER (ORDER BY (Path0)) Place
		,LEN(Prefix) Depth
		,[Path]
		,[PathS]
		,[PathM]
		,[PathF]
		,h_count
		,Path0
		,CAST(Prefix + CAST(item AS varchar(12)) AS char(14)) + CAST(REPLACE([PathF], ' ', '_') as nchar(69))  temp_md
	INTO wiki.#CateTree
	FROM Hierarchy h

	CROSS APPLY (
		SELECT
		  [hypernym]
		  ,COUNT(hypernym) h_count
		  ,a.title
	  FROM [wiki].[item] i
	  LEFT JOIN wiki.article a on i.hypernym = a.item and a.language = 'en'
	  WHERE h.item = i.hypernym
	  GROUP BY hypernym,a.title 
	  HAVING COUNT(hypernym) > 0
	) i

	SELECT * FROM wiki.#CateTree
	ORDER BY [Path0]

	UPDATE wiki.category
	SET place = t.Place, depth = t.Depth
	FROM wiki.category c
	JOIN wiki.#CateTree t
	ON c.item = t.item and c.h_count > 0

	DROP TABLE wiki.#CateTree
END
