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


DECLARE @langs TABLE (col nvarchar(20))
INSERT INTO @langs SELECT  [COLUMN_NAME] 
FROM [INFORMATION_SCHEMA].[COLUMNS]
WHERE TABLE_SCHEMA='wiki' AND TABLE_NAME='title'
AND ORDINAL_POSITION > 3 
AND ORDINAL_POSITION < 258


DECLARE @lang nvarchar(MAX);
SELECT @lang = COALESCE(@lang + '],[' + col, col ) FROM @langs
SET @lang = '['+@lang+']'

DECLARE @langnull nvarchar(MAX);
SELECT @langnull = COALESCE(@langnull + '] IS NOT NULL AND [' + col, col ) FROM @langs
SET @langnull = '['+@langnull+'] IS NOT NULL'


DECLARE @query nvarchar(MAX) = CONCAT(
N'SELECT TOP (1000) [wikidata]
      ,[#lang]
      ,[hyper] , '
	  , @lang  ,' FROM [wiki].[title]
  WHERE en is not null --', @langnull, '
  ORDER BY LEN( (CONCAT_WS('' '', ', @lang,'))) DESC')

print @query
exec(@query)
