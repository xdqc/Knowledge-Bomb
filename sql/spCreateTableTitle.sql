ALTER PROCEDURE [wiki].[spCreateTableTitle]

AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

	DROP TABLE IF EXISTS wiki.title
	CREATE TABLE wiki.title (wikidata int not null, lang_count int, hypernym int)  
	ALTER TABLE [wiki].[title] ADD  CONSTRAINT [PK__title__wikidata] PRIMARY KEY CLUSTERED 
	(
		[wikidata] ASC
	)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]

	INSERT INTO wiki.title (wikidata, lang_count, hypernym) SELECT id,lang_count,hypernym FROM wiki.item

	DECLARE @idColumn int
	DECLARE @langId nvarchar(20)

	SELECT @idColumn = min([rank]) from wiki.language l
	WHILE @idColumn is not null
	BEGIN

		SELECT @langId = code FROM wiki.language WHERE [rank]=@idColumn
		DECLARE @query nvarchar(max) = CONCAT(
		N'ALTER TABLE wiki.title ADD [', @langId, N'] nvarchar(max) null;')
		exec(@query)
	
		set @query = CONCAT(
		N'UPDATE wiki.title SET [', @langId, N'] = a.title FROM [wiki].[article] a WHERE a.item = wiki.title.wikidata AND a.language = ''', @langId, ''';')
		print CONCAT(@idColumn,' ',@query)
		exec(@query)
	
		select @idColumn = min([rank]) from wiki.language l where l.[rank] > @idColumn
	END

	SELECT COUNT(*) as row_count FROM wiki.title;
	RETURN
END
