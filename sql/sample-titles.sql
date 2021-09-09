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


DROP TABLE IF EXISTS wiki.title
CREATE TABLE wiki.title (wikidata int not null, #lang int, hyper int)  
ALTER TABLE [wiki].[title] ADD  CONSTRAINT [PK__title__wikidata] PRIMARY KEY CLUSTERED 
(
	[wikidata] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

INSERT INTO wiki.title (wikidata, #lang, hyper) SELECT id,lang_count,hypernym FROM wiki.item

DECLARE @idColumn int
DECLARE @langId nvarchar(20)

SELECT @idColumn = min(id) from wiki.language l
WHILE @idColumn is not null
BEGIN
	/*
		Do all the stuff that you need to do
	*/
	SELECT @langId = code FROM wiki.language WHERE id=@idColumn
	DECLARE @query nvarchar(max) = CONCAT(
	N'ALTER TABLE wiki.title ADD [', @langId, N'] nvarchar(max) null;')
	exec(@query)
	
	set @query = CONCAT(
	N'UPDATE wiki.title SET [', @langId, N'] = a.title FROM [wiki].[article] a WHERE a.item = wiki.title.wikidata AND a.language = ''', @langId, ''';')
	print @query
	exec(@query)
	
	select @idColumn = min(id) from wiki.language l where l.id > @idColumn
END
SELECT * FROM wiki.title;
GO
;


SELECT TOP (10000) wikidata
      ,[#lang]
	  ,en en
	  ,es es
	  ,fr fr
	  ,de de
	  ,it it
	  ,pt pt
	  ,ru ru
	  ,uk uk
	  ,zh zh
	  ,ja ja
	  ,nl nl
	  ,pl pl
	  ,ar ar
	  ,fa fa
	  ,ca ca
	  ,sv sv
	  ,ko ko
	  ,cs cs
	  ,fi fi
	  ,id id
	  ,tr tr
	  ,no no
	  ,he he
	  ,eu eu
	  ,el el
	  ,la la
	  ,hyper
  FROM [wiki].[title] t

ORDER BY 
	 LEN(dbo.RemoveParen(en))
	+LEN(dbo.RemoveParen(es))
	+LEN(dbo.RemoveParen(fr))
	+LEN(dbo.RemoveParen(ru))
	+LEN(dbo.RemoveParen(de))
	+LEN(dbo.RemoveParen(it))
	+LEN(dbo.RemoveParen(uk))
	+LEN(dbo.RemoveParen(pt))
	+LEN(dbo.RemoveParen(zh))
	+LEN(dbo.RemoveParen(ja))
	+LEN(dbo.RemoveParen(nl))
	+LEN(dbo.RemoveParen(pl))
	+LEN(dbo.RemoveParen(ar))
	+LEN(dbo.RemoveParen(ca))
	+LEN(dbo.RemoveParen(fa))
	+LEN(dbo.RemoveParen(sv))
	+LEN(dbo.RemoveParen(ko))
	+LEN(dbo.RemoveParen(cs))
	+LEN(dbo.RemoveParen(fi))
	+LEN(dbo.RemoveParen(id))
	+LEN(dbo.RemoveParen(tr))
	+LEN(dbo.RemoveParen(no))
	+LEN(dbo.RemoveParen(he))
	+LEN(dbo.RemoveParen(eu))
	+LEN(dbo.RemoveParen(el))
	+LEN(dbo.RemoveParen(la))
	,hypernym, lang_count DESC, id
GO
