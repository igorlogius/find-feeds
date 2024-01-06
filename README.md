Detects and lists feeds (rss,atom,json) of a page. RSS and Atom feeds are still
a very useful method to keep up to date on news and other kind of information.
On many sites the feed capabilites are still available but sometimes badly
maintained, so that it can be hard to access or find these. This Addon tries to
make it easy to find all available feeds a site has to offer.

<b>Usage: (Basic) </b>
<ol>
  <li>
    Visit a site which contains feeds for example:
    <ul>
      <li>https://blog.mozilla.org/</li>
      <li>https://en.wikipedia.org/wiki/RSS</li>
      <li>https://www.youtube.com/user/Mozilla</li>
      <li>
        https://www.youtube.com/watch?v=4fviHC7xlX0&list=PLnRGhgZaGeBvDBzQGf4M8HIepPXA9cq-C
      </li>
      <li>https://jsonfeed.org/</li>
    </ul>
  </li>
  <li>
    The toolbar icon will be colored when you visit a page where at least one
    feed is found
  </li>
  <li>click on the toolbar icon, to show the feeds</li>
</ol>

<b>Usage: (Advanced) </b>
You can write your own feed probing / detection functions in Javascript The
supplied function must return an Array as URLs as Strings. Those URLs will be
probed via a HEAD Request and if the server returns a Content-Type which might
align with a feed object, it will be added to the feed list. Example functions
can be found on the github page (see. custom-feed-detectors.json)

<b>Notes:</b>
<ol>
    <li><b>Permissions:</b>
        This add-on tries to use the minimal number of required permissions to successfully fullfill its intended purpose.
        If you think this could be improved please let me know by opening an issue and i will try to look into it.
        More Details on the individual permission can be found here: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions
    </li>
    <li><b>Cost/Payment:</b>
        This Add-on is and forever will be subscription and payment free to use for everyone however they like.
        If you are feeling generous you can send me a tip via my bitcoin address 35WK2GqZHPutywCdbHKa9BQ52GND3Pd6h4
    </li>
    <li><b>Stars/Reviews:</b>
        If you found this add-on useful leave some stars or a review so others have an  easier time finding it.
    </li>
    <li><b>Bugs, Suggestions or Requests:</b>
        If you have any issues (for example a site it does not work but you think it should) or have improvement suggestions or a feature request please open an issue at the Support Site
    </li>
</ol>

