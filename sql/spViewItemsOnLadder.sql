ALTER PROCEDURE [wiki].[spViewItemsOnLadder]

AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

	
	Declare @ladder as table(lvl int, lo int, hi int)

	insert into @ladder values
		(1,147,300),
		(2,120,147),
		(3,106,120),
		(4,97,106),
		(5,91,97),
		(6,86,91),
		(7,82,86),
		(8,78,82),
		(9,75,78),
		(10,72,75),
		(11,69,72),
		(12,67,69),
		(13,65,67),
		(14,63,65),
		(15,61,63),
		(16,59,61),
		(17,57,59),
		(18,55,57),
		(19,54,55),
		(20,53,54),
		(21,52,53),
		(22,51,52),
		(23,50,51),
		(24,49,50),
		(25,48,49),
		(26,47,48),
		(27,46,47),
		(28,45,46),
		(29,44,45),
		(30,43,44),
		(31,42,43),
		(32,41,42),
		(33,40,41),
		(34,39,40),
		(35,38,39),
		(36,37,38),
		(37,36,37),
		(38,35,36),
		(39,34,35),
		(40,33,34),
		(41,32,33),
		(42,31,32),
		(43,30,31),
		(44,29,30),
		(45,28,29),
		(46,27,28),
		(47,26,27),
		(48,25,26),
		(49,24,25),
		(50,23,24),
		(51,22,23),
		(52,21,22),
		(53,20,21)

	SELECT
		r.lvl
		, r.lo
		, r.hi
		, COUNT(r.lvl) gcount
	FROM wiki.item i
	CROSS APPLY(
		SELECT lvl ,lo ,hi
		FROM @ladder
		WHERE i.lang_count >= lo
		  AND i.lang_count <  hi
	)r
	GROUP BY r.lvl , r.lo, r.hi
	ORDER BY lo DESC, hi DESC

END
