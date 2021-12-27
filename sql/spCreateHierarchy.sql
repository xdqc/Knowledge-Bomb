ALTER PROCEDURE [wiki].[spViewHierarchy]


AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

	-- Recursive select on self-referenced table
	;WITH Hierarchy AS
	(
		SELECT
			item, hypernym, title, seq,
			CAST('/' + CAST(title AS varchar(20)) AS varchar(max)) AS [Path],
			CAST('/' + CAST(seq AS varchar(20)) AS varchar(max)) AS [Path0],
			CAST('' AS varchar(50)) AS Prefix
		FROM wiki.category
		WHERE hypernym IS NULL

		UNION ALL

		SELECT
			t.item, t.hypernym, t.title, t.seq,
			CAST(h.[Path] + '/' + CAST(t.title AS varchar(20)) AS varchar(max)),
			CAST(h.[Path0] + '/' + CAST(t.seq AS varchar(20)) AS varchar(max)),
			CAST(h.Prefix + '.' AS varchar(50))
		FROM Hierarchy h
		INNER JOIN wiki.category t
			ON t.hypernym = h.item
	)

	SELECT Prefix + CAST(item AS varchar(20)) AS Node
		,[Path]
		, h_count
		,Path0
		,CAST(Prefix + CAST(item AS varchar(12)) AS char(14)) + REPLACE([Path], ' ', '_')
	FROM Hierarchy h
	OUTER APPLY (
		SELECT
		  [hypernym]
		  ,COUNT(hypernym) h_count
		  ,a.title
	  FROM [wiki].[item] i
	  LEFT JOIN wiki.article a on i.hypernym = a.item and a.language = 'en'
	  WHERE h.item = i.hypernym
	  GROUP BY hypernym,a.title
	) i
	ORDER BY [Path0]

END
