
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
