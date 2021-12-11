/**
 * Random multilingual qoutes from WikiQuotes api
 * extended functions on github.com/natetyler/wikiquotes-api
 */
var Wikiquote = function (lang) {

  var wqa = {}

  var API_URL = `https://${lang}.wikiquote.org/w/api.php`

/**
 * Query based on `topics` parameter and return page id.
 * If `isMatch` flag set, query exact matching titles on the topics.
 * If multiple page ids are returned, choose the first one.
 * Query includes "redirects" option to automatically traverse redirects.
 * All words will be capitalized as this generally yields more consistent results.
 */
  wqa.queryGeneratorLinks = function (topics, success, errorFunc, isMatch) {
    topics = topics.join('|')
    var payload = {
      format: "json",
      action: "query",
      titles: topics,
      // redirects: "",
    }
    // If `isMatch` flag set, query exact matching titles on the topics.
    if (!isMatch) {
      payload.generator = "links" //"linkshere",
      payload.gplnamespace = '0'
      payload.gpllimit = '10'
    }
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: payload,

      success: function (result, status) {
        if (!result || !result.query) {
          status = 404
          console.log(result)
          errorFunc({code: (lang=='en'?'queryGeneratorLinksNoEN':'queryGeneratorLinksNoAlang')})
          return
        }
        var pages = Object.keys(result.query.pages)
          .filter(p => p > 0)
        if (!pages || pages.length <= 0) {
          errorFunc({code: lang=='en'?'queryGeneratorLinksNoResultEN':'queryGeneratorLinksNoResultAlang'})
          return
        }
        var randomNum = Math.floor(Math.random() * pages.length)
        pageId = pages[randomNum]
        success(pageId)

      },
      error: function (xhr, result, status) {
        error("Error with opensearch for " + topics)
      }
    })
  }

  /**
   * Query based on "titles" parameter and return page id.
   * If multiple page ids are returned, choose the first one.
   * Query includes "redirects" option to automatically traverse redirects.
   * All words will be capitalized as this generally yields more consistent results.
   */
  wqa.queryRandom = function (topics, success, errorFunc) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "query",
        list: "random",
        rnnamespace: "0",
        rnlimit: "10",
        redirects: "",
      },

      success: function (result, status) {
        if (!result || !result.query) {
          status = 404
          errorFunc(result.error)
          return
        }
        var pages = result.query.random
        var pageId = -1
        for (var p in pages) {
          var page = pages[p]
          // api can return invalid recrods, these are marked as "missing"
          if (!("missing" in page)) {
            pageId = page.id
            break
          }
        }
        if (pageId > 0) {
          success(pageId)
        } else {
          error({code: "No results queryRandom"})
        }
      },

      error: function (xhr, result, status) {
        errorFunc("Error processing query: " + lang)
      }
    })
  }

  /**
   * Get the sections for a given page.
   * This makes parsing for quotes more manageable.
   * Returns an array of all "1.x" sections as these usually contain the quotes.
   * If no 1.x sections exists, returns section 1. Returns the titles that were used
   * in case there is a redirect.
   */
  wqa.getSectionsForPage = function (pageId, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        prop: "sections",
        pageid: pageId
      },

      success: function (result, status) {
        var sectionArray = []
        var sections = result.parse.sections
        for (var s in sections) {
          var splitNum = sections[s].number.split('.')
          if (splitNum.length > 1 && splitNum[0] === "1") {
            sectionArray.push(sections[s].index)
          }
        }
        // Use section 1 if there are no "1.x" sections
        // if (sectionArray.length === 0) {
        //   sectionArray.push("1")
        // }
        success({ titles: result.parse.title, sections: sectionArray })
      },
      error: function (xhr, result, status) {
        error("Error getting sections")
      }
    })
  }

  /**
   * Get all quotes for a given section.  Most sections will be of the format:
   * <h3> title </h3>
   * <ul>
   *   <li>
   *     Quote text
   *     <ul>
   *       <li> additional info on the quote </li>
   *     </ul>
   *   </li>
   * <ul>
   * <ul> next quote etc... </ul>
   *
   * The quote may or may not contain sections inside <b /> tags.
   *
   * For quotes with bold sections, only the bold part is returned for brevity
   * (usually the bold part is more well known).
   * Otherwise the entire text is returned.  Returns the titles that were used
   * in case there is a redirect.
   */
  wqa.getQuotesForSection = function (pageId, sectionIndex, chooseQuote, errorFunc) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        noimages: "",
        pageid: pageId,
        section: sectionIndex
      },

      success: function (result, status) {
        if (!result || !result.parse) {
          status = 404
          errorFunc(result.error)
          return
        }
        var quotes = result.parse.text["*"]
        var quoteArray = []
        // Find top level <li> only, or <div class="citation"> (French)
        var $lis = $(quotes).find('li:not(li li, dl li), div.citation')
        $lis.each(function () {
          // Remove all children that aren't <b>
          $(this).children().remove(':not(b)')
          var $bolds = $(this).find('b')

          // If the section has bold text, use it.  Otherwise pull the plain text.
          if ($bolds.length > 0) {
            quoteArray.push($bolds.html())
          } else {
            quoteArray.push($(this).html())
          }
        })
        chooseQuote({ titles: result.parse.title, quotes: quoteArray })
      },
      error: function (xhr, result, status) {
        errorFunc("Error getting quotes")
      }
    })
  }

  /**
   * Search using opensearch api.  Returns an array of search results.
   */
  wqa.openSearch = function (titles, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "opensearch",
        namespace: 0,
        suggest: "",
        search: titles
      },

      success: function (result, status) {
        success(result[1])
      },
      error: function (xhr, result, status) {
        error("Error with opensearch for " + titles)
      }
    })
  }

  /**
   * Get a random quote for the given topics search in topics provided
   * This function searches for a page id for the given title, chooses a random
   * section from the list of sections for the page, and then chooses a random
   * quote from that section.  Returns the titles that were used in case there
   * is a redirect.
   */
  wqa.getRandomQuote = function (topics, success, error, isMatch) {

    var errorFunction = function (msg) {
      error(msg)
    }

    // chooseQuote with length between (10,200)
    var chooseQuote = function (quotes) {
      quotes.quotes = quotes.quotes
        .map(q => q.trim())
        .filter(q => q.length > 10 && q.length < 200)
      var randomNum = Math.floor(Math.random() * quotes.quotes.length)
      success({ titles: quotes.titles, quote: quotes.quotes[randomNum] })
    }

    var getQuotes = function (pageId, sections) {
      var randomNum = Math.floor(Math.random() * sections.sections.length)
      wqa.getQuotesForSection(pageId, sections.sections[randomNum], chooseQuote, errorFunction)
    }

    var getSections = function (pageId) {
      wqa.getSectionsForPage(pageId, function (sections) { getQuotes(pageId, sections); }, errorFunction)
    }

    if (topics && topics.length > 0) {
      wqa.queryGeneratorLinks(topics, getSections, errorFunction, isMatch)
    } else {
      wqa.queryRandom([], getSections, errorFunction)
    }

  }

  /**
   * Capitalize the first letter of each word
   */
  wqa.capitalizeString = function (input) {
    var inputArray = input.split(' ')
    var output = []
    for (s in inputArray) {
      output.push(inputArray[s].charAt(0).toUpperCase() + inputArray[s].slice(1))
    }
    return output.join(' ')
  }

  return wqa
}
