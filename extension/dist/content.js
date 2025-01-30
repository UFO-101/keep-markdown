(function() {
  "use strict";
  const element = document.createElement("i");
  function decodeNamedCharacterReference(value) {
    const characterReference2 = "&" + value + ";";
    element.innerHTML = characterReference2;
    const char = element.textContent;
    if (char.charCodeAt(char.length - 1) === 59 && value !== "semi") {
      return false;
    }
    return char === characterReference2 ? false : char;
  }
  function splice(list2, start, remove, items) {
    const end = list2.length;
    let chunkStart = 0;
    let parameters;
    if (start < 0) {
      start = -start > end ? 0 : end + start;
    } else {
      start = start > end ? end : start;
    }
    remove = remove > 0 ? remove : 0;
    if (items.length < 1e4) {
      parameters = Array.from(items);
      parameters.unshift(start, remove);
      list2.splice(...parameters);
    } else {
      if (remove) list2.splice(start, remove);
      while (chunkStart < items.length) {
        parameters = items.slice(chunkStart, chunkStart + 1e4);
        parameters.unshift(start, 0);
        list2.splice(...parameters);
        chunkStart += 1e4;
        start += 1e4;
      }
    }
  }
  function push(list2, items) {
    if (list2.length > 0) {
      splice(list2, list2.length, 0, items);
      return list2;
    }
    return items;
  }
  const hasOwnProperty$1 = {}.hasOwnProperty;
  function combineExtensions(extensions) {
    const all = {};
    let index = -1;
    while (++index < extensions.length) {
      syntaxExtension(all, extensions[index]);
    }
    return all;
  }
  function syntaxExtension(all, extension) {
    let hook;
    for (hook in extension) {
      const maybe = hasOwnProperty$1.call(all, hook) ? all[hook] : void 0;
      const left = maybe || (all[hook] = {});
      const right = extension[hook];
      let code;
      if (right) {
        for (code in right) {
          if (!hasOwnProperty$1.call(left, code)) left[code] = [];
          const value = right[code];
          constructs(
            // @ts-expect-error Looks like a list.
            left[code],
            Array.isArray(value) ? value : value ? [value] : []
          );
        }
      }
    }
  }
  function constructs(existing, list2) {
    let index = -1;
    const before = [];
    while (++index < list2.length) {
      (list2[index].add === "after" ? existing : before).push(list2[index]);
    }
    splice(existing, 0, 0, before);
  }
  function combineHtmlExtensions(htmlExtensions) {
    const handlers = {};
    let index = -1;
    while (++index < htmlExtensions.length) {
      htmlExtension(handlers, htmlExtensions[index]);
    }
    return handlers;
  }
  function htmlExtension(all, extension) {
    let hook;
    for (hook in extension) {
      const maybe = hasOwnProperty$1.call(all, hook) ? all[hook] : void 0;
      const left = maybe || (all[hook] = {});
      const right = extension[hook];
      let type;
      if (right) {
        for (type in right) {
          left[type] = right[type];
        }
      }
    }
  }
  function decodeNumericCharacterReference(value, base) {
    const code = Number.parseInt(value, base);
    if (
      // C0 except for HT, LF, FF, CR, space.
      code < 9 || code === 11 || code > 13 && code < 32 || // Control character (DEL) of C0, and C1 controls.
      code > 126 && code < 160 || // Lone high surrogates and low surrogates.
      code > 55295 && code < 57344 || // Noncharacters.
      code > 64975 && code < 65008 || /* eslint-disable no-bitwise */
      (code & 65535) === 65535 || (code & 65535) === 65534 || /* eslint-enable no-bitwise */
      // Out of range
      code > 1114111
    ) {
      return "�";
    }
    return String.fromCodePoint(code);
  }
  const characterReferences = { '"': "quot", "&": "amp", "<": "lt", ">": "gt" };
  function encode(value) {
    return value.replace(/["&<>]/g, replace);
    function replace(value2) {
      return "&" + characterReferences[
        /** @type {keyof typeof characterReferences} */
        value2
      ] + ";";
    }
  }
  function normalizeIdentifier(value) {
    return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
  }
  const asciiAlpha = regexCheck(/[A-Za-z]/);
  const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
  const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
  function asciiControl(code) {
    return (
      // Special whitespace codes (which have negative values), C0 and Control
      // character DEL
      code !== null && (code < 32 || code === 127)
    );
  }
  const asciiDigit = regexCheck(/\d/);
  const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
  const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
  function markdownLineEnding(code) {
    return code !== null && code < -2;
  }
  function markdownLineEndingOrSpace(code) {
    return code !== null && (code < 0 || code === 32);
  }
  function markdownSpace(code) {
    return code === -2 || code === -1 || code === 32;
  }
  const unicodePunctuation = regexCheck(new RegExp("\\p{P}|\\p{S}", "u"));
  const unicodeWhitespace = regexCheck(/\s/);
  function regexCheck(regex) {
    return check;
    function check(code) {
      return code !== null && code > -1 && regex.test(String.fromCharCode(code));
    }
  }
  function sanitizeUri(url, protocol) {
    const value = encode(normalizeUri(url || ""));
    if (!protocol) {
      return value;
    }
    const colon = value.indexOf(":");
    const questionMark = value.indexOf("?");
    const numberSign = value.indexOf("#");
    const slash = value.indexOf("/");
    if (
      // If there is no protocol, it’s relative.
      colon < 0 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
      slash > -1 && colon > slash || questionMark > -1 && colon > questionMark || numberSign > -1 && colon > numberSign || // It is a protocol, it should be allowed.
      protocol.test(value.slice(0, colon))
    ) {
      return value;
    }
    return "";
  }
  function normalizeUri(value) {
    const result = [];
    let index = -1;
    let start = 0;
    let skip = 0;
    while (++index < value.length) {
      const code = value.charCodeAt(index);
      let replace = "";
      if (code === 37 && asciiAlphanumeric(value.charCodeAt(index + 1)) && asciiAlphanumeric(value.charCodeAt(index + 2))) {
        skip = 2;
      } else if (code < 128) {
        if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code))) {
          replace = String.fromCharCode(code);
        }
      } else if (code > 55295 && code < 57344) {
        const next = value.charCodeAt(index + 1);
        if (code < 56320 && next > 56319 && next < 57344) {
          replace = String.fromCharCode(code, next);
          skip = 1;
        } else {
          replace = "�";
        }
      } else {
        replace = String.fromCharCode(code);
      }
      if (replace) {
        result.push(value.slice(start, index), encodeURIComponent(replace));
        start = index + skip + 1;
        replace = "";
      }
      if (skip) {
        index += skip;
        skip = 0;
      }
    }
    return result.join("") + value.slice(start);
  }
  const hasOwnProperty = {}.hasOwnProperty;
  const protocolHref = /^(https?|ircs?|mailto|xmpp)$/i;
  const protocolSource = /^https?$/i;
  function compile(options) {
    const settings = options || {};
    let tags = true;
    const definitions = {};
    const buffers = [[]];
    const mediaStack = [];
    const tightStack = [];
    const defaultHandlers = {
      enter: {
        blockQuote: onenterblockquote,
        codeFenced: onentercodefenced,
        codeFencedFenceInfo: buffer,
        codeFencedFenceMeta: buffer,
        codeIndented: onentercodeindented,
        codeText: onentercodetext,
        content: onentercontent,
        definition: onenterdefinition,
        definitionDestinationString: onenterdefinitiondestinationstring,
        definitionLabelString: buffer,
        definitionTitleString: buffer,
        emphasis: onenteremphasis,
        htmlFlow: onenterhtmlflow,
        htmlText: onenterhtml,
        image: onenterimage,
        label: buffer,
        link: onenterlink,
        listItemMarker: onenterlistitemmarker,
        listItemValue: onenterlistitemvalue,
        listOrdered: onenterlistordered,
        listUnordered: onenterlistunordered,
        paragraph: onenterparagraph,
        reference: buffer,
        resource: onenterresource,
        resourceDestinationString: onenterresourcedestinationstring,
        resourceTitleString: buffer,
        setextHeading: onentersetextheading,
        strong: onenterstrong
      },
      exit: {
        atxHeading: onexitatxheading,
        atxHeadingSequence: onexitatxheadingsequence,
        autolinkEmail: onexitautolinkemail,
        autolinkProtocol: onexitautolinkprotocol,
        blockQuote: onexitblockquote,
        characterEscapeValue: onexitdata,
        characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
        characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
        characterReferenceValue: onexitcharacterreferencevalue,
        codeFenced: onexitflowcode,
        codeFencedFence: onexitcodefencedfence,
        codeFencedFenceInfo: onexitcodefencedfenceinfo,
        codeFencedFenceMeta: onresumedrop,
        codeFlowValue: onexitcodeflowvalue,
        codeIndented: onexitflowcode,
        codeText: onexitcodetext,
        codeTextData: onexitdata,
        data: onexitdata,
        definition: onexitdefinition,
        definitionDestinationString: onexitdefinitiondestinationstring,
        definitionLabelString: onexitdefinitionlabelstring,
        definitionTitleString: onexitdefinitiontitlestring,
        emphasis: onexitemphasis,
        hardBreakEscape: onexithardbreak,
        hardBreakTrailing: onexithardbreak,
        htmlFlow: onexithtml,
        htmlFlowData: onexitdata,
        htmlText: onexithtml,
        htmlTextData: onexitdata,
        image: onexitmedia,
        label: onexitlabel,
        labelText: onexitlabeltext,
        lineEnding: onexitlineending,
        link: onexitmedia,
        listOrdered: onexitlistordered,
        listUnordered: onexitlistunordered,
        paragraph: onexitparagraph,
        reference: onresumedrop,
        referenceString: onexitreferencestring,
        resource: onresumedrop,
        resourceDestinationString: onexitresourcedestinationstring,
        resourceTitleString: onexitresourcetitlestring,
        setextHeading: onexitsetextheading,
        setextHeadingLineSequence: onexitsetextheadinglinesequence,
        setextHeadingText: onexitsetextheadingtext,
        strong: onexitstrong,
        thematicBreak: onexitthematicbreak
      }
    };
    const handlers = (
      /** @type {NormalizedHtmlExtension} */
      combineHtmlExtensions([defaultHandlers, ...settings.htmlExtensions || []])
    );
    const data = {
      definitions,
      tightStack
    };
    const context = {
      buffer,
      encode: encode$1,
      getData,
      lineEndingIfNeeded,
      options: settings,
      raw,
      resume,
      setData,
      tag
    };
    let lineEndingStyle = settings.defaultLineEnding;
    return compile2;
    function compile2(events) {
      let index = -1;
      let start = 0;
      const listStack = [];
      let head = [];
      let body = [];
      while (++index < events.length) {
        if (!lineEndingStyle && (events[index][1].type === "lineEnding" || events[index][1].type === "lineEndingBlank")) {
          lineEndingStyle = /** @type {LineEnding} */
          events[index][2].sliceSerialize(events[index][1]);
        }
        if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") {
          if (events[index][0] === "enter") {
            listStack.push(index);
          } else {
            prepareList(events.slice(listStack.pop(), index));
          }
        }
        if (events[index][1].type === "definition") {
          if (events[index][0] === "enter") {
            body = push(body, events.slice(start, index));
            start = index;
          } else {
            head = push(head, events.slice(start, index + 1));
            start = index + 1;
          }
        }
      }
      head = push(head, body);
      head = push(head, events.slice(start));
      index = -1;
      const result = head;
      if (handlers.enter.null) {
        handlers.enter.null.call(context);
      }
      while (++index < events.length) {
        const handles = handlers[result[index][0]];
        const kind = result[index][1].type;
        const handle = handles[kind];
        if (hasOwnProperty.call(handles, kind) && handle) {
          handle.call({
            sliceSerialize: result[index][2].sliceSerialize,
            ...context
          }, result[index][1]);
        }
      }
      if (handlers.exit.null) {
        handlers.exit.null.call(context);
      }
      return buffers[0].join("");
    }
    function prepareList(slice) {
      const length = slice.length;
      let index = 0;
      let containerBalance = 0;
      let loose = false;
      let atMarker;
      while (++index < length) {
        const event = slice[index];
        if (event[1]._container) {
          atMarker = void 0;
          if (event[0] === "enter") {
            containerBalance++;
          } else {
            containerBalance--;
          }
        } else switch (event[1].type) {
          case "listItemPrefix": {
            if (event[0] === "exit") {
              atMarker = true;
            }
            break;
          }
          case "linePrefix": {
            break;
          }
          case "lineEndingBlank": {
            if (event[0] === "enter" && !containerBalance) {
              if (atMarker) {
                atMarker = void 0;
              } else {
                loose = true;
              }
            }
            break;
          }
          default: {
            atMarker = void 0;
          }
        }
      }
      slice[0][1]._loose = loose;
    }
    function setData(key, value) {
      data[key] = value;
    }
    function getData(key) {
      return data[key];
    }
    function buffer() {
      buffers.push([]);
    }
    function resume() {
      const buf = buffers.pop();
      return buf.join("");
    }
    function tag(value) {
      if (!tags) return;
      setData("lastWasTag", true);
      buffers[buffers.length - 1].push(value);
    }
    function raw(value) {
      setData("lastWasTag");
      buffers[buffers.length - 1].push(value);
    }
    function lineEnding2() {
      raw(lineEndingStyle || "\n");
    }
    function lineEndingIfNeeded() {
      const buffer2 = buffers[buffers.length - 1];
      const slice = buffer2[buffer2.length - 1];
      const previous2 = slice ? slice.charCodeAt(slice.length - 1) : null;
      if (previous2 === 10 || previous2 === 13 || previous2 === null) {
        return;
      }
      lineEnding2();
    }
    function encode$1(value) {
      return getData("ignoreEncode") ? value : encode(value);
    }
    function onresumedrop() {
      resume();
    }
    function onenterlistordered(token) {
      tightStack.push(!token._loose);
      lineEndingIfNeeded();
      tag("<ol");
      setData("expectFirstItem", true);
    }
    function onenterlistunordered(token) {
      tightStack.push(!token._loose);
      lineEndingIfNeeded();
      tag("<ul");
      setData("expectFirstItem", true);
    }
    function onenterlistitemvalue(token) {
      if (getData("expectFirstItem")) {
        const value = Number.parseInt(this.sliceSerialize(token), 10);
        if (value !== 1) {
          tag(' start="' + encode$1(String(value)) + '"');
        }
      }
    }
    function onenterlistitemmarker() {
      if (getData("expectFirstItem")) {
        tag(">");
      } else {
        onexitlistitem();
      }
      lineEndingIfNeeded();
      tag("<li>");
      setData("expectFirstItem");
      setData("lastWasTag");
    }
    function onexitlistordered() {
      onexitlistitem();
      tightStack.pop();
      lineEnding2();
      tag("</ol>");
    }
    function onexitlistunordered() {
      onexitlistitem();
      tightStack.pop();
      lineEnding2();
      tag("</ul>");
    }
    function onexitlistitem() {
      if (getData("lastWasTag") && !getData("slurpAllLineEndings")) {
        lineEndingIfNeeded();
      }
      tag("</li>");
      setData("slurpAllLineEndings");
    }
    function onenterblockquote() {
      tightStack.push(false);
      lineEndingIfNeeded();
      tag("<blockquote>");
    }
    function onexitblockquote() {
      tightStack.pop();
      lineEndingIfNeeded();
      tag("</blockquote>");
      setData("slurpAllLineEndings");
    }
    function onenterparagraph() {
      if (!tightStack[tightStack.length - 1]) {
        lineEndingIfNeeded();
        tag("<p>");
      }
      setData("slurpAllLineEndings");
    }
    function onexitparagraph() {
      if (tightStack[tightStack.length - 1]) {
        setData("slurpAllLineEndings", true);
      } else {
        tag("</p>");
      }
    }
    function onentercodefenced() {
      lineEndingIfNeeded();
      tag("<pre><code");
      setData("fencesCount", 0);
    }
    function onexitcodefencedfenceinfo() {
      const value = resume();
      tag(' class="language-' + value + '"');
    }
    function onexitcodefencedfence() {
      const count = getData("fencesCount") || 0;
      if (!count) {
        tag(">");
        setData("slurpOneLineEnding", true);
      }
      setData("fencesCount", count + 1);
    }
    function onentercodeindented() {
      lineEndingIfNeeded();
      tag("<pre><code>");
    }
    function onexitflowcode() {
      const count = getData("fencesCount");
      if (count !== void 0 && count < 2 && data.tightStack.length > 0 && !getData("lastWasTag")) {
        lineEnding2();
      }
      if (getData("flowCodeSeenData")) {
        lineEndingIfNeeded();
      }
      tag("</code></pre>");
      if (count !== void 0 && count < 2) lineEndingIfNeeded();
      setData("flowCodeSeenData");
      setData("fencesCount");
      setData("slurpOneLineEnding");
    }
    function onenterimage() {
      mediaStack.push({
        image: true
      });
      tags = void 0;
    }
    function onenterlink() {
      mediaStack.push({});
    }
    function onexitlabeltext(token) {
      mediaStack[mediaStack.length - 1].labelId = this.sliceSerialize(token);
    }
    function onexitlabel() {
      mediaStack[mediaStack.length - 1].label = resume();
    }
    function onexitreferencestring(token) {
      mediaStack[mediaStack.length - 1].referenceId = this.sliceSerialize(token);
    }
    function onenterresource() {
      buffer();
      mediaStack[mediaStack.length - 1].destination = "";
    }
    function onenterresourcedestinationstring() {
      buffer();
      setData("ignoreEncode", true);
    }
    function onexitresourcedestinationstring() {
      mediaStack[mediaStack.length - 1].destination = resume();
      setData("ignoreEncode");
    }
    function onexitresourcetitlestring() {
      mediaStack[mediaStack.length - 1].title = resume();
    }
    function onexitmedia() {
      let index = mediaStack.length - 1;
      const media = mediaStack[index];
      const id = media.referenceId || media.labelId;
      const context2 = media.destination === void 0 ? definitions[normalizeIdentifier(id)] : media;
      tags = true;
      while (index--) {
        if (mediaStack[index].image) {
          tags = void 0;
          break;
        }
      }
      if (media.image) {
        tag('<img src="' + sanitizeUri(context2.destination, settings.allowDangerousProtocol ? void 0 : protocolSource) + '" alt="');
        raw(media.label);
        tag('"');
      } else {
        tag('<a href="' + sanitizeUri(context2.destination, settings.allowDangerousProtocol ? void 0 : protocolHref) + '"');
      }
      tag(context2.title ? ' title="' + context2.title + '"' : "");
      if (media.image) {
        tag(" />");
      } else {
        tag(">");
        raw(media.label);
        tag("</a>");
      }
      mediaStack.pop();
    }
    function onenterdefinition() {
      buffer();
      mediaStack.push({});
    }
    function onexitdefinitionlabelstring(token) {
      resume();
      mediaStack[mediaStack.length - 1].labelId = this.sliceSerialize(token);
    }
    function onenterdefinitiondestinationstring() {
      buffer();
      setData("ignoreEncode", true);
    }
    function onexitdefinitiondestinationstring() {
      mediaStack[mediaStack.length - 1].destination = resume();
      setData("ignoreEncode");
    }
    function onexitdefinitiontitlestring() {
      mediaStack[mediaStack.length - 1].title = resume();
    }
    function onexitdefinition() {
      const media = mediaStack[mediaStack.length - 1];
      const id = normalizeIdentifier(media.labelId);
      resume();
      if (!hasOwnProperty.call(definitions, id)) {
        definitions[id] = mediaStack[mediaStack.length - 1];
      }
      mediaStack.pop();
    }
    function onentercontent() {
      setData("slurpAllLineEndings", true);
    }
    function onexitatxheadingsequence(token) {
      if (getData("headingRank")) return;
      setData("headingRank", this.sliceSerialize(token).length);
      lineEndingIfNeeded();
      tag("<h" + getData("headingRank") + ">");
    }
    function onentersetextheading() {
      buffer();
      setData("slurpAllLineEndings");
    }
    function onexitsetextheadingtext() {
      setData("slurpAllLineEndings", true);
    }
    function onexitatxheading() {
      tag("</h" + getData("headingRank") + ">");
      setData("headingRank");
    }
    function onexitsetextheadinglinesequence(token) {
      setData("headingRank", this.sliceSerialize(token).charCodeAt(0) === 61 ? 1 : 2);
    }
    function onexitsetextheading() {
      const value = resume();
      lineEndingIfNeeded();
      tag("<h" + getData("headingRank") + ">");
      raw(value);
      tag("</h" + getData("headingRank") + ">");
      setData("slurpAllLineEndings");
      setData("headingRank");
    }
    function onexitdata(token) {
      raw(encode$1(this.sliceSerialize(token)));
    }
    function onexitlineending(token) {
      if (getData("slurpAllLineEndings")) {
        return;
      }
      if (getData("slurpOneLineEnding")) {
        setData("slurpOneLineEnding");
        return;
      }
      if (getData("inCodeText")) {
        raw(" ");
        return;
      }
      raw(encode$1(this.sliceSerialize(token)));
    }
    function onexitcodeflowvalue(token) {
      raw(encode$1(this.sliceSerialize(token)));
      setData("flowCodeSeenData", true);
    }
    function onexithardbreak() {
      tag("<br />");
    }
    function onenterhtmlflow() {
      lineEndingIfNeeded();
      onenterhtml();
    }
    function onexithtml() {
      setData("ignoreEncode");
    }
    function onenterhtml() {
      if (settings.allowDangerousHtml) {
        setData("ignoreEncode", true);
      }
    }
    function onenteremphasis() {
      tag("<em>");
    }
    function onenterstrong() {
      tag("<strong>");
    }
    function onentercodetext() {
      setData("inCodeText", true);
      tag("<code>");
    }
    function onexitcodetext() {
      setData("inCodeText");
      tag("</code>");
    }
    function onexitemphasis() {
      tag("</em>");
    }
    function onexitstrong() {
      tag("</strong>");
    }
    function onexitthematicbreak() {
      lineEndingIfNeeded();
      tag("<hr />");
    }
    function onexitcharacterreferencemarker(token) {
      setData("characterReferenceType", token.type);
    }
    function onexitcharacterreferencevalue(token) {
      const value = this.sliceSerialize(token);
      const decoded = getData("characterReferenceType") ? decodeNumericCharacterReference(value, getData("characterReferenceType") === "characterReferenceMarkerNumeric" ? 10 : 16) : decodeNamedCharacterReference(value);
      raw(encode$1(
        /** @type {string} */
        decoded
      ));
      setData("characterReferenceType");
    }
    function onexitautolinkprotocol(token) {
      const uri = this.sliceSerialize(token);
      tag('<a href="' + sanitizeUri(uri, settings.allowDangerousProtocol ? void 0 : protocolHref) + '">');
      raw(encode$1(uri));
      tag("</a>");
    }
    function onexitautolinkemail(token) {
      const uri = this.sliceSerialize(token);
      tag('<a href="' + sanitizeUri("mailto:" + uri) + '">');
      raw(encode$1(uri));
      tag("</a>");
    }
  }
  function factorySpace(effects, ok, type, max) {
    const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
    let size = 0;
    return start;
    function start(code) {
      if (markdownSpace(code)) {
        effects.enter(type);
        return prefix(code);
      }
      return ok(code);
    }
    function prefix(code) {
      if (markdownSpace(code) && size++ < limit) {
        effects.consume(code);
        return prefix;
      }
      effects.exit(type);
      return ok(code);
    }
  }
  const content$1 = {
    tokenize: initializeContent
  };
  function initializeContent(effects) {
    const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
    let previous2;
    return contentStart;
    function afterContentStartConstruct(code) {
      if (code === null) {
        effects.consume(code);
        return;
      }
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return factorySpace(effects, contentStart, "linePrefix");
    }
    function paragraphInitial(code) {
      effects.enter("paragraph");
      return lineStart(code);
    }
    function lineStart(code) {
      const token = effects.enter("chunkText", {
        contentType: "text",
        previous: previous2
      });
      if (previous2) {
        previous2.next = token;
      }
      previous2 = token;
      return data(code);
    }
    function data(code) {
      if (code === null) {
        effects.exit("chunkText");
        effects.exit("paragraph");
        effects.consume(code);
        return;
      }
      if (markdownLineEnding(code)) {
        effects.consume(code);
        effects.exit("chunkText");
        return lineStart;
      }
      effects.consume(code);
      return data;
    }
  }
  const document$2 = {
    tokenize: initializeDocument
  };
  const containerConstruct = {
    tokenize: tokenizeContainer
  };
  function initializeDocument(effects) {
    const self = this;
    const stack = [];
    let continued = 0;
    let childFlow;
    let childToken;
    let lineStartOffset;
    return start;
    function start(code) {
      if (continued < stack.length) {
        const item = stack[continued];
        self.containerState = item[1];
        return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
      }
      return checkNewContainers(code);
    }
    function documentContinue(code) {
      continued++;
      if (self.containerState._closeFlow) {
        self.containerState._closeFlow = void 0;
        if (childFlow) {
          closeFlow();
        }
        const indexBeforeExits = self.events.length;
        let indexBeforeFlow = indexBeforeExits;
        let point;
        while (indexBeforeFlow--) {
          if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
            point = self.events[indexBeforeFlow][1].end;
            break;
          }
        }
        exitContainers(continued);
        let index = indexBeforeExits;
        while (index < self.events.length) {
          self.events[index][1].end = {
            ...point
          };
          index++;
        }
        splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
        self.events.length = index;
        return checkNewContainers(code);
      }
      return start(code);
    }
    function checkNewContainers(code) {
      if (continued === stack.length) {
        if (!childFlow) {
          return documentContinued(code);
        }
        if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
          return flowStart(code);
        }
        self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
      }
      self.containerState = {};
      return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
    }
    function thereIsANewContainer(code) {
      if (childFlow) closeFlow();
      exitContainers(continued);
      return documentContinued(code);
    }
    function thereIsNoNewContainer(code) {
      self.parser.lazy[self.now().line] = continued !== stack.length;
      lineStartOffset = self.now().offset;
      return flowStart(code);
    }
    function documentContinued(code) {
      self.containerState = {};
      return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
    }
    function containerContinue(code) {
      continued++;
      stack.push([self.currentConstruct, self.containerState]);
      return documentContinued(code);
    }
    function flowStart(code) {
      if (code === null) {
        if (childFlow) closeFlow();
        exitContainers(0);
        effects.consume(code);
        return;
      }
      childFlow = childFlow || self.parser.flow(self.now());
      effects.enter("chunkFlow", {
        _tokenizer: childFlow,
        contentType: "flow",
        previous: childToken
      });
      return flowContinue(code);
    }
    function flowContinue(code) {
      if (code === null) {
        writeToChild(effects.exit("chunkFlow"), true);
        exitContainers(0);
        effects.consume(code);
        return;
      }
      if (markdownLineEnding(code)) {
        effects.consume(code);
        writeToChild(effects.exit("chunkFlow"));
        continued = 0;
        self.interrupt = void 0;
        return start;
      }
      effects.consume(code);
      return flowContinue;
    }
    function writeToChild(token, endOfFile) {
      const stream = self.sliceStream(token);
      if (endOfFile) stream.push(null);
      token.previous = childToken;
      if (childToken) childToken.next = token;
      childToken = token;
      childFlow.defineSkip(token.start);
      childFlow.write(stream);
      if (self.parser.lazy[token.start.line]) {
        let index = childFlow.events.length;
        while (index--) {
          if (
            // The token starts before the line ending…
            childFlow.events[index][1].start.offset < lineStartOffset && // …and either is not ended yet…
            (!childFlow.events[index][1].end || // …or ends after it.
            childFlow.events[index][1].end.offset > lineStartOffset)
          ) {
            return;
          }
        }
        const indexBeforeExits = self.events.length;
        let indexBeforeFlow = indexBeforeExits;
        let seen;
        let point;
        while (indexBeforeFlow--) {
          if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
            if (seen) {
              point = self.events[indexBeforeFlow][1].end;
              break;
            }
            seen = true;
          }
        }
        exitContainers(continued);
        index = indexBeforeExits;
        while (index < self.events.length) {
          self.events[index][1].end = {
            ...point
          };
          index++;
        }
        splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
        self.events.length = index;
      }
    }
    function exitContainers(size) {
      let index = stack.length;
      while (index-- > size) {
        const entry = stack[index];
        self.containerState = entry[1];
        entry[0].exit.call(self, effects);
      }
      stack.length = size;
    }
    function closeFlow() {
      childFlow.write([null]);
      childToken = void 0;
      childFlow = void 0;
      self.containerState._closeFlow = void 0;
    }
  }
  function tokenizeContainer(effects, ok, nok) {
    return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
  }
  function classifyCharacter(code) {
    if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) {
      return 1;
    }
    if (unicodePunctuation(code)) {
      return 2;
    }
  }
  function resolveAll(constructs2, events, context) {
    const called = [];
    let index = -1;
    while (++index < constructs2.length) {
      const resolve = constructs2[index].resolveAll;
      if (resolve && !called.includes(resolve)) {
        events = resolve(events, context);
        called.push(resolve);
      }
    }
    return events;
  }
  const attention = {
    name: "attention",
    resolveAll: resolveAllAttention,
    tokenize: tokenizeAttention
  };
  function resolveAllAttention(events, context) {
    let index = -1;
    let open;
    let group;
    let text2;
    let openingSequence;
    let closingSequence;
    let use;
    let nextEvents;
    let offset;
    while (++index < events.length) {
      if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
        open = index;
        while (open--) {
          if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && // If the markers are the same:
          context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
            if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) {
              continue;
            }
            use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
            const start = {
              ...events[open][1].end
            };
            const end = {
              ...events[index][1].start
            };
            movePoint(start, -use);
            movePoint(end, use);
            openingSequence = {
              type: use > 1 ? "strongSequence" : "emphasisSequence",
              start,
              end: {
                ...events[open][1].end
              }
            };
            closingSequence = {
              type: use > 1 ? "strongSequence" : "emphasisSequence",
              start: {
                ...events[index][1].start
              },
              end
            };
            text2 = {
              type: use > 1 ? "strongText" : "emphasisText",
              start: {
                ...events[open][1].end
              },
              end: {
                ...events[index][1].start
              }
            };
            group = {
              type: use > 1 ? "strong" : "emphasis",
              start: {
                ...openingSequence.start
              },
              end: {
                ...closingSequence.end
              }
            };
            events[open][1].end = {
              ...openingSequence.start
            };
            events[index][1].start = {
              ...closingSequence.end
            };
            nextEvents = [];
            if (events[open][1].end.offset - events[open][1].start.offset) {
              nextEvents = push(nextEvents, [["enter", events[open][1], context], ["exit", events[open][1], context]]);
            }
            nextEvents = push(nextEvents, [["enter", group, context], ["enter", openingSequence, context], ["exit", openingSequence, context], ["enter", text2, context]]);
            nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
            nextEvents = push(nextEvents, [["exit", text2, context], ["enter", closingSequence, context], ["exit", closingSequence, context], ["exit", group, context]]);
            if (events[index][1].end.offset - events[index][1].start.offset) {
              offset = 2;
              nextEvents = push(nextEvents, [["enter", events[index][1], context], ["exit", events[index][1], context]]);
            } else {
              offset = 0;
            }
            splice(events, open - 1, index - open + 3, nextEvents);
            index = open + nextEvents.length - offset - 2;
            break;
          }
        }
      }
    }
    index = -1;
    while (++index < events.length) {
      if (events[index][1].type === "attentionSequence") {
        events[index][1].type = "data";
      }
    }
    return events;
  }
  function tokenizeAttention(effects, ok) {
    const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
    const previous2 = this.previous;
    const before = classifyCharacter(previous2);
    let marker;
    return start;
    function start(code) {
      marker = code;
      effects.enter("attentionSequence");
      return inside(code);
    }
    function inside(code) {
      if (code === marker) {
        effects.consume(code);
        return inside;
      }
      const token = effects.exit("attentionSequence");
      const after = classifyCharacter(code);
      const open = !after || after === 2 && before || attentionMarkers2.includes(code);
      const close = !before || before === 2 && after || attentionMarkers2.includes(previous2);
      token._open = Boolean(marker === 42 ? open : open && (before || !close));
      token._close = Boolean(marker === 42 ? close : close && (after || !open));
      return ok(code);
    }
  }
  function movePoint(point, offset) {
    point.column += offset;
    point.offset += offset;
    point._bufferIndex += offset;
  }
  const autolink = {
    name: "autolink",
    tokenize: tokenizeAutolink
  };
  function tokenizeAutolink(effects, ok, nok) {
    let size = 0;
    return start;
    function start(code) {
      effects.enter("autolink");
      effects.enter("autolinkMarker");
      effects.consume(code);
      effects.exit("autolinkMarker");
      effects.enter("autolinkProtocol");
      return open;
    }
    function open(code) {
      if (asciiAlpha(code)) {
        effects.consume(code);
        return schemeOrEmailAtext;
      }
      if (code === 64) {
        return nok(code);
      }
      return emailAtext(code);
    }
    function schemeOrEmailAtext(code) {
      if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) {
        size = 1;
        return schemeInsideOrEmailAtext(code);
      }
      return emailAtext(code);
    }
    function schemeInsideOrEmailAtext(code) {
      if (code === 58) {
        effects.consume(code);
        size = 0;
        return urlInside;
      }
      if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) && size++ < 32) {
        effects.consume(code);
        return schemeInsideOrEmailAtext;
      }
      size = 0;
      return emailAtext(code);
    }
    function urlInside(code) {
      if (code === 62) {
        effects.exit("autolinkProtocol");
        effects.enter("autolinkMarker");
        effects.consume(code);
        effects.exit("autolinkMarker");
        effects.exit("autolink");
        return ok;
      }
      if (code === null || code === 32 || code === 60 || asciiControl(code)) {
        return nok(code);
      }
      effects.consume(code);
      return urlInside;
    }
    function emailAtext(code) {
      if (code === 64) {
        effects.consume(code);
        return emailAtSignOrDot;
      }
      if (asciiAtext(code)) {
        effects.consume(code);
        return emailAtext;
      }
      return nok(code);
    }
    function emailAtSignOrDot(code) {
      return asciiAlphanumeric(code) ? emailLabel(code) : nok(code);
    }
    function emailLabel(code) {
      if (code === 46) {
        effects.consume(code);
        size = 0;
        return emailAtSignOrDot;
      }
      if (code === 62) {
        effects.exit("autolinkProtocol").type = "autolinkEmail";
        effects.enter("autolinkMarker");
        effects.consume(code);
        effects.exit("autolinkMarker");
        effects.exit("autolink");
        return ok;
      }
      return emailValue(code);
    }
    function emailValue(code) {
      if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
        const next = code === 45 ? emailValue : emailLabel;
        effects.consume(code);
        return next;
      }
      return nok(code);
    }
  }
  const blankLine = {
    partial: true,
    tokenize: tokenizeBlankLine
  };
  function tokenizeBlankLine(effects, ok, nok) {
    return start;
    function start(code) {
      return markdownSpace(code) ? factorySpace(effects, after, "linePrefix")(code) : after(code);
    }
    function after(code) {
      return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
    }
  }
  const blockQuote = {
    continuation: {
      tokenize: tokenizeBlockQuoteContinuation
    },
    exit,
    name: "blockQuote",
    tokenize: tokenizeBlockQuoteStart
  };
  function tokenizeBlockQuoteStart(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      if (code === 62) {
        const state = self.containerState;
        if (!state.open) {
          effects.enter("blockQuote", {
            _container: true
          });
          state.open = true;
        }
        effects.enter("blockQuotePrefix");
        effects.enter("blockQuoteMarker");
        effects.consume(code);
        effects.exit("blockQuoteMarker");
        return after;
      }
      return nok(code);
    }
    function after(code) {
      if (markdownSpace(code)) {
        effects.enter("blockQuotePrefixWhitespace");
        effects.consume(code);
        effects.exit("blockQuotePrefixWhitespace");
        effects.exit("blockQuotePrefix");
        return ok;
      }
      effects.exit("blockQuotePrefix");
      return ok(code);
    }
  }
  function tokenizeBlockQuoteContinuation(effects, ok, nok) {
    const self = this;
    return contStart;
    function contStart(code) {
      if (markdownSpace(code)) {
        return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
      }
      return contBefore(code);
    }
    function contBefore(code) {
      return effects.attempt(blockQuote, ok, nok)(code);
    }
  }
  function exit(effects) {
    effects.exit("blockQuote");
  }
  const characterEscape = {
    name: "characterEscape",
    tokenize: tokenizeCharacterEscape
  };
  function tokenizeCharacterEscape(effects, ok, nok) {
    return start;
    function start(code) {
      effects.enter("characterEscape");
      effects.enter("escapeMarker");
      effects.consume(code);
      effects.exit("escapeMarker");
      return inside;
    }
    function inside(code) {
      if (asciiPunctuation(code)) {
        effects.enter("characterEscapeValue");
        effects.consume(code);
        effects.exit("characterEscapeValue");
        effects.exit("characterEscape");
        return ok;
      }
      return nok(code);
    }
  }
  const characterReference = {
    name: "characterReference",
    tokenize: tokenizeCharacterReference
  };
  function tokenizeCharacterReference(effects, ok, nok) {
    const self = this;
    let size = 0;
    let max;
    let test;
    return start;
    function start(code) {
      effects.enter("characterReference");
      effects.enter("characterReferenceMarker");
      effects.consume(code);
      effects.exit("characterReferenceMarker");
      return open;
    }
    function open(code) {
      if (code === 35) {
        effects.enter("characterReferenceMarkerNumeric");
        effects.consume(code);
        effects.exit("characterReferenceMarkerNumeric");
        return numeric;
      }
      effects.enter("characterReferenceValue");
      max = 31;
      test = asciiAlphanumeric;
      return value(code);
    }
    function numeric(code) {
      if (code === 88 || code === 120) {
        effects.enter("characterReferenceMarkerHexadecimal");
        effects.consume(code);
        effects.exit("characterReferenceMarkerHexadecimal");
        effects.enter("characterReferenceValue");
        max = 6;
        test = asciiHexDigit;
        return value;
      }
      effects.enter("characterReferenceValue");
      max = 7;
      test = asciiDigit;
      return value(code);
    }
    function value(code) {
      if (code === 59 && size) {
        const token = effects.exit("characterReferenceValue");
        if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) {
          return nok(code);
        }
        effects.enter("characterReferenceMarker");
        effects.consume(code);
        effects.exit("characterReferenceMarker");
        effects.exit("characterReference");
        return ok;
      }
      if (test(code) && size++ < max) {
        effects.consume(code);
        return value;
      }
      return nok(code);
    }
  }
  const nonLazyContinuation = {
    partial: true,
    tokenize: tokenizeNonLazyContinuation
  };
  const codeFenced = {
    concrete: true,
    name: "codeFenced",
    tokenize: tokenizeCodeFenced
  };
  function tokenizeCodeFenced(effects, ok, nok) {
    const self = this;
    const closeStart = {
      partial: true,
      tokenize: tokenizeCloseStart
    };
    let initialPrefix = 0;
    let sizeOpen = 0;
    let marker;
    return start;
    function start(code) {
      return beforeSequenceOpen(code);
    }
    function beforeSequenceOpen(code) {
      const tail = self.events[self.events.length - 1];
      initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
      marker = code;
      effects.enter("codeFenced");
      effects.enter("codeFencedFence");
      effects.enter("codeFencedFenceSequence");
      return sequenceOpen(code);
    }
    function sequenceOpen(code) {
      if (code === marker) {
        sizeOpen++;
        effects.consume(code);
        return sequenceOpen;
      }
      if (sizeOpen < 3) {
        return nok(code);
      }
      effects.exit("codeFencedFenceSequence");
      return markdownSpace(code) ? factorySpace(effects, infoBefore, "whitespace")(code) : infoBefore(code);
    }
    function infoBefore(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("codeFencedFence");
        return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
      }
      effects.enter("codeFencedFenceInfo");
      effects.enter("chunkString", {
        contentType: "string"
      });
      return info(code);
    }
    function info(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceInfo");
        return infoBefore(code);
      }
      if (markdownSpace(code)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceInfo");
        return factorySpace(effects, metaBefore, "whitespace")(code);
      }
      if (code === 96 && code === marker) {
        return nok(code);
      }
      effects.consume(code);
      return info;
    }
    function metaBefore(code) {
      if (code === null || markdownLineEnding(code)) {
        return infoBefore(code);
      }
      effects.enter("codeFencedFenceMeta");
      effects.enter("chunkString", {
        contentType: "string"
      });
      return meta(code);
    }
    function meta(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceMeta");
        return infoBefore(code);
      }
      if (code === 96 && code === marker) {
        return nok(code);
      }
      effects.consume(code);
      return meta;
    }
    function atNonLazyBreak(code) {
      return effects.attempt(closeStart, after, contentBefore)(code);
    }
    function contentBefore(code) {
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return contentStart;
    }
    function contentStart(code) {
      return initialPrefix > 0 && markdownSpace(code) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
    }
    function beforeContentChunk(code) {
      if (code === null || markdownLineEnding(code)) {
        return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
      }
      effects.enter("codeFlowValue");
      return contentChunk(code);
    }
    function contentChunk(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("codeFlowValue");
        return beforeContentChunk(code);
      }
      effects.consume(code);
      return contentChunk;
    }
    function after(code) {
      effects.exit("codeFenced");
      return ok(code);
    }
    function tokenizeCloseStart(effects2, ok2, nok2) {
      let size = 0;
      return startBefore;
      function startBefore(code) {
        effects2.enter("lineEnding");
        effects2.consume(code);
        effects2.exit("lineEnding");
        return start2;
      }
      function start2(code) {
        effects2.enter("codeFencedFence");
        return markdownSpace(code) ? factorySpace(effects2, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
      }
      function beforeSequenceClose(code) {
        if (code === marker) {
          effects2.enter("codeFencedFenceSequence");
          return sequenceClose(code);
        }
        return nok2(code);
      }
      function sequenceClose(code) {
        if (code === marker) {
          size++;
          effects2.consume(code);
          return sequenceClose;
        }
        if (size >= sizeOpen) {
          effects2.exit("codeFencedFenceSequence");
          return markdownSpace(code) ? factorySpace(effects2, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
        }
        return nok2(code);
      }
      function sequenceCloseAfter(code) {
        if (code === null || markdownLineEnding(code)) {
          effects2.exit("codeFencedFence");
          return ok2(code);
        }
        return nok2(code);
      }
    }
  }
  function tokenizeNonLazyContinuation(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      if (code === null) {
        return nok(code);
      }
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return lineStart;
    }
    function lineStart(code) {
      return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
    }
  }
  const codeIndented = {
    name: "codeIndented",
    tokenize: tokenizeCodeIndented
  };
  const furtherStart = {
    partial: true,
    tokenize: tokenizeFurtherStart
  };
  function tokenizeCodeIndented(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      effects.enter("codeIndented");
      return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code);
    }
    function afterPrefix(code) {
      const tail = self.events[self.events.length - 1];
      return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code) : nok(code);
    }
    function atBreak(code) {
      if (code === null) {
        return after(code);
      }
      if (markdownLineEnding(code)) {
        return effects.attempt(furtherStart, atBreak, after)(code);
      }
      effects.enter("codeFlowValue");
      return inside(code);
    }
    function inside(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("codeFlowValue");
        return atBreak(code);
      }
      effects.consume(code);
      return inside;
    }
    function after(code) {
      effects.exit("codeIndented");
      return ok(code);
    }
  }
  function tokenizeFurtherStart(effects, ok, nok) {
    const self = this;
    return furtherStart2;
    function furtherStart2(code) {
      if (self.parser.lazy[self.now().line]) {
        return nok(code);
      }
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return furtherStart2;
      }
      return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code);
    }
    function afterPrefix(code) {
      const tail = self.events[self.events.length - 1];
      return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok(code) : markdownLineEnding(code) ? furtherStart2(code) : nok(code);
    }
  }
  const codeText = {
    name: "codeText",
    previous,
    resolve: resolveCodeText,
    tokenize: tokenizeCodeText
  };
  function resolveCodeText(events) {
    let tailExitIndex = events.length - 4;
    let headEnterIndex = 3;
    let index;
    let enter;
    if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
      index = headEnterIndex;
      while (++index < tailExitIndex) {
        if (events[index][1].type === "codeTextData") {
          events[headEnterIndex][1].type = "codeTextPadding";
          events[tailExitIndex][1].type = "codeTextPadding";
          headEnterIndex += 2;
          tailExitIndex -= 2;
          break;
        }
      }
    }
    index = headEnterIndex - 1;
    tailExitIndex++;
    while (++index <= tailExitIndex) {
      if (enter === void 0) {
        if (index !== tailExitIndex && events[index][1].type !== "lineEnding") {
          enter = index;
        }
      } else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
        events[enter][1].type = "codeTextData";
        if (index !== enter + 2) {
          events[enter][1].end = events[index - 1][1].end;
          events.splice(enter + 2, index - enter - 2);
          tailExitIndex -= index - enter - 2;
          index = enter + 2;
        }
        enter = void 0;
      }
    }
    return events;
  }
  function previous(code) {
    return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
  }
  function tokenizeCodeText(effects, ok, nok) {
    let sizeOpen = 0;
    let size;
    let token;
    return start;
    function start(code) {
      effects.enter("codeText");
      effects.enter("codeTextSequence");
      return sequenceOpen(code);
    }
    function sequenceOpen(code) {
      if (code === 96) {
        effects.consume(code);
        sizeOpen++;
        return sequenceOpen;
      }
      effects.exit("codeTextSequence");
      return between(code);
    }
    function between(code) {
      if (code === null) {
        return nok(code);
      }
      if (code === 32) {
        effects.enter("space");
        effects.consume(code);
        effects.exit("space");
        return between;
      }
      if (code === 96) {
        token = effects.enter("codeTextSequence");
        size = 0;
        return sequenceClose(code);
      }
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return between;
      }
      effects.enter("codeTextData");
      return data(code);
    }
    function data(code) {
      if (code === null || code === 32 || code === 96 || markdownLineEnding(code)) {
        effects.exit("codeTextData");
        return between(code);
      }
      effects.consume(code);
      return data;
    }
    function sequenceClose(code) {
      if (code === 96) {
        effects.consume(code);
        size++;
        return sequenceClose;
      }
      if (size === sizeOpen) {
        effects.exit("codeTextSequence");
        effects.exit("codeText");
        return ok(code);
      }
      token.type = "codeTextData";
      return data(code);
    }
  }
  class SpliceBuffer {
    /**
     * @param {ReadonlyArray<T> | null | undefined} [initial]
     *   Initial items (optional).
     * @returns
     *   Splice buffer.
     */
    constructor(initial) {
      this.left = initial ? [...initial] : [];
      this.right = [];
    }
    /**
     * Array access;
     * does not move the cursor.
     *
     * @param {number} index
     *   Index.
     * @return {T}
     *   Item.
     */
    get(index) {
      if (index < 0 || index >= this.left.length + this.right.length) {
        throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
      }
      if (index < this.left.length) return this.left[index];
      return this.right[this.right.length - index + this.left.length - 1];
    }
    /**
     * The length of the splice buffer, one greater than the largest index in the
     * array.
     */
    get length() {
      return this.left.length + this.right.length;
    }
    /**
     * Remove and return `list[0]`;
     * moves the cursor to `0`.
     *
     * @returns {T | undefined}
     *   Item, optional.
     */
    shift() {
      this.setCursor(0);
      return this.right.pop();
    }
    /**
     * Slice the buffer to get an array;
     * does not move the cursor.
     *
     * @param {number} start
     *   Start.
     * @param {number | null | undefined} [end]
     *   End (optional).
     * @returns {Array<T>}
     *   Array of items.
     */
    slice(start, end) {
      const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
      if (stop < this.left.length) {
        return this.left.slice(start, stop);
      }
      if (start > this.left.length) {
        return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
      }
      return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
    }
    /**
     * Mimics the behavior of Array.prototype.splice() except for the change of
     * interface necessary to avoid segfaults when patching in very large arrays.
     *
     * This operation moves cursor is moved to `start` and results in the cursor
     * placed after any inserted items.
     *
     * @param {number} start
     *   Start;
     *   zero-based index at which to start changing the array;
     *   negative numbers count backwards from the end of the array and values
     *   that are out-of bounds are clamped to the appropriate end of the array.
     * @param {number | null | undefined} [deleteCount=0]
     *   Delete count (default: `0`);
     *   maximum number of elements to delete, starting from start.
     * @param {Array<T> | null | undefined} [items=[]]
     *   Items to include in place of the deleted items (default: `[]`).
     * @return {Array<T>}
     *   Any removed items.
     */
    splice(start, deleteCount, items) {
      const count = deleteCount || 0;
      this.setCursor(Math.trunc(start));
      const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
      if (items) chunkedPush(this.left, items);
      return removed.reverse();
    }
    /**
     * Remove and return the highest-numbered item in the array, so
     * `list[list.length - 1]`;
     * Moves the cursor to `length`.
     *
     * @returns {T | undefined}
     *   Item, optional.
     */
    pop() {
      this.setCursor(Number.POSITIVE_INFINITY);
      return this.left.pop();
    }
    /**
     * Inserts a single item to the high-numbered side of the array;
     * moves the cursor to `length`.
     *
     * @param {T} item
     *   Item.
     * @returns {undefined}
     *   Nothing.
     */
    push(item) {
      this.setCursor(Number.POSITIVE_INFINITY);
      this.left.push(item);
    }
    /**
     * Inserts many items to the high-numbered side of the array.
     * Moves the cursor to `length`.
     *
     * @param {Array<T>} items
     *   Items.
     * @returns {undefined}
     *   Nothing.
     */
    pushMany(items) {
      this.setCursor(Number.POSITIVE_INFINITY);
      chunkedPush(this.left, items);
    }
    /**
     * Inserts a single item to the low-numbered side of the array;
     * Moves the cursor to `0`.
     *
     * @param {T} item
     *   Item.
     * @returns {undefined}
     *   Nothing.
     */
    unshift(item) {
      this.setCursor(0);
      this.right.push(item);
    }
    /**
     * Inserts many items to the low-numbered side of the array;
     * moves the cursor to `0`.
     *
     * @param {Array<T>} items
     *   Items.
     * @returns {undefined}
     *   Nothing.
     */
    unshiftMany(items) {
      this.setCursor(0);
      chunkedPush(this.right, items.reverse());
    }
    /**
     * Move the cursor to a specific position in the array. Requires
     * time proportional to the distance moved.
     *
     * If `n < 0`, the cursor will end up at the beginning.
     * If `n > length`, the cursor will end up at the end.
     *
     * @param {number} n
     *   Position.
     * @return {undefined}
     *   Nothing.
     */
    setCursor(n) {
      if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
      if (n < this.left.length) {
        const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
        chunkedPush(this.right, removed.reverse());
      } else {
        const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
        chunkedPush(this.left, removed.reverse());
      }
    }
  }
  function chunkedPush(list2, right) {
    let chunkStart = 0;
    if (right.length < 1e4) {
      list2.push(...right);
    } else {
      while (chunkStart < right.length) {
        list2.push(...right.slice(chunkStart, chunkStart + 1e4));
        chunkStart += 1e4;
      }
    }
  }
  function subtokenize(eventsArray) {
    const jumps = {};
    let index = -1;
    let event;
    let lineIndex;
    let otherIndex;
    let otherEvent;
    let parameters;
    let subevents;
    let more;
    const events = new SpliceBuffer(eventsArray);
    while (++index < events.length) {
      while (index in jumps) {
        index = jumps[index];
      }
      event = events.get(index);
      if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
        subevents = event[1]._tokenizer.events;
        otherIndex = 0;
        if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
          otherIndex += 2;
        }
        if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
          while (++otherIndex < subevents.length) {
            if (subevents[otherIndex][1].type === "content") {
              break;
            }
            if (subevents[otherIndex][1].type === "chunkText") {
              subevents[otherIndex][1]._isInFirstContentOfListItem = true;
              otherIndex++;
            }
          }
        }
      }
      if (event[0] === "enter") {
        if (event[1].contentType) {
          Object.assign(jumps, subcontent(events, index));
          index = jumps[index];
          more = true;
        }
      } else if (event[1]._container) {
        otherIndex = index;
        lineIndex = void 0;
        while (otherIndex--) {
          otherEvent = events.get(otherIndex);
          if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
            if (otherEvent[0] === "enter") {
              if (lineIndex) {
                events.get(lineIndex)[1].type = "lineEndingBlank";
              }
              otherEvent[1].type = "lineEnding";
              lineIndex = otherIndex;
            }
          } else if (otherEvent[1].type === "linePrefix") ;
          else {
            break;
          }
        }
        if (lineIndex) {
          event[1].end = {
            ...events.get(lineIndex)[1].start
          };
          parameters = events.slice(lineIndex, index);
          parameters.unshift(event);
          events.splice(lineIndex, index - lineIndex + 1, parameters);
        }
      }
    }
    splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
    return !more;
  }
  function subcontent(events, eventIndex) {
    const token = events.get(eventIndex)[1];
    const context = events.get(eventIndex)[2];
    let startPosition = eventIndex - 1;
    const startPositions = [];
    const tokenizer = token._tokenizer || context.parser[token.contentType](token.start);
    const childEvents = tokenizer.events;
    const jumps = [];
    const gaps = {};
    let stream;
    let previous2;
    let index = -1;
    let current = token;
    let adjust = 0;
    let start = 0;
    const breaks = [start];
    while (current) {
      while (events.get(++startPosition)[1] !== current) {
      }
      startPositions.push(startPosition);
      if (!current._tokenizer) {
        stream = context.sliceStream(current);
        if (!current.next) {
          stream.push(null);
        }
        if (previous2) {
          tokenizer.defineSkip(current.start);
        }
        if (current._isInFirstContentOfListItem) {
          tokenizer._gfmTasklistFirstContentOfListItem = true;
        }
        tokenizer.write(stream);
        if (current._isInFirstContentOfListItem) {
          tokenizer._gfmTasklistFirstContentOfListItem = void 0;
        }
      }
      previous2 = current;
      current = current.next;
    }
    current = token;
    while (++index < childEvents.length) {
      if (
        // Find a void token that includes a break.
        childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line
      ) {
        start = index + 1;
        breaks.push(start);
        current._tokenizer = void 0;
        current.previous = void 0;
        current = current.next;
      }
    }
    tokenizer.events = [];
    if (current) {
      current._tokenizer = void 0;
      current.previous = void 0;
    } else {
      breaks.pop();
    }
    index = breaks.length;
    while (index--) {
      const slice = childEvents.slice(breaks[index], breaks[index + 1]);
      const start2 = startPositions.pop();
      jumps.push([start2, start2 + slice.length - 1]);
      events.splice(start2, 2, slice);
    }
    jumps.reverse();
    index = -1;
    while (++index < jumps.length) {
      gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
      adjust += jumps[index][1] - jumps[index][0] - 1;
    }
    return gaps;
  }
  const content = {
    resolve: resolveContent,
    tokenize: tokenizeContent
  };
  const continuationConstruct = {
    partial: true,
    tokenize: tokenizeContinuation
  };
  function resolveContent(events) {
    subtokenize(events);
    return events;
  }
  function tokenizeContent(effects, ok) {
    let previous2;
    return chunkStart;
    function chunkStart(code) {
      effects.enter("content");
      previous2 = effects.enter("chunkContent", {
        contentType: "content"
      });
      return chunkInside(code);
    }
    function chunkInside(code) {
      if (code === null) {
        return contentEnd(code);
      }
      if (markdownLineEnding(code)) {
        return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
      }
      effects.consume(code);
      return chunkInside;
    }
    function contentEnd(code) {
      effects.exit("chunkContent");
      effects.exit("content");
      return ok(code);
    }
    function contentContinue(code) {
      effects.consume(code);
      effects.exit("chunkContent");
      previous2.next = effects.enter("chunkContent", {
        contentType: "content",
        previous: previous2
      });
      previous2 = previous2.next;
      return chunkInside;
    }
  }
  function tokenizeContinuation(effects, ok, nok) {
    const self = this;
    return startLookahead;
    function startLookahead(code) {
      effects.exit("chunkContent");
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return factorySpace(effects, prefixed, "linePrefix");
    }
    function prefixed(code) {
      if (code === null || markdownLineEnding(code)) {
        return nok(code);
      }
      const tail = self.events[self.events.length - 1];
      if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) {
        return ok(code);
      }
      return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
    }
  }
  function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
    const limit = max || Number.POSITIVE_INFINITY;
    let balance = 0;
    return start;
    function start(code) {
      if (code === 60) {
        effects.enter(type);
        effects.enter(literalType);
        effects.enter(literalMarkerType);
        effects.consume(code);
        effects.exit(literalMarkerType);
        return enclosedBefore;
      }
      if (code === null || code === 32 || code === 41 || asciiControl(code)) {
        return nok(code);
      }
      effects.enter(type);
      effects.enter(rawType);
      effects.enter(stringType);
      effects.enter("chunkString", {
        contentType: "string"
      });
      return raw(code);
    }
    function enclosedBefore(code) {
      if (code === 62) {
        effects.enter(literalMarkerType);
        effects.consume(code);
        effects.exit(literalMarkerType);
        effects.exit(literalType);
        effects.exit(type);
        return ok;
      }
      effects.enter(stringType);
      effects.enter("chunkString", {
        contentType: "string"
      });
      return enclosed(code);
    }
    function enclosed(code) {
      if (code === 62) {
        effects.exit("chunkString");
        effects.exit(stringType);
        return enclosedBefore(code);
      }
      if (code === null || code === 60 || markdownLineEnding(code)) {
        return nok(code);
      }
      effects.consume(code);
      return code === 92 ? enclosedEscape : enclosed;
    }
    function enclosedEscape(code) {
      if (code === 60 || code === 62 || code === 92) {
        effects.consume(code);
        return enclosed;
      }
      return enclosed(code);
    }
    function raw(code) {
      if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace(code))) {
        effects.exit("chunkString");
        effects.exit(stringType);
        effects.exit(rawType);
        effects.exit(type);
        return ok(code);
      }
      if (balance < limit && code === 40) {
        effects.consume(code);
        balance++;
        return raw;
      }
      if (code === 41) {
        effects.consume(code);
        balance--;
        return raw;
      }
      if (code === null || code === 32 || code === 40 || asciiControl(code)) {
        return nok(code);
      }
      effects.consume(code);
      return code === 92 ? rawEscape : raw;
    }
    function rawEscape(code) {
      if (code === 40 || code === 41 || code === 92) {
        effects.consume(code);
        return raw;
      }
      return raw(code);
    }
  }
  function factoryLabel(effects, ok, nok, type, markerType, stringType) {
    const self = this;
    let size = 0;
    let seen;
    return start;
    function start(code) {
      effects.enter(type);
      effects.enter(markerType);
      effects.consume(code);
      effects.exit(markerType);
      effects.enter(stringType);
      return atBreak;
    }
    function atBreak(code) {
      if (size > 999 || code === null || code === 91 || code === 93 && !seen || // To do: remove in the future once we’ve switched from
      // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
      // which doesn’t need this.
      // Hidden footnotes hook.
      /* c8 ignore next 3 */
      code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) {
        return nok(code);
      }
      if (code === 93) {
        effects.exit(stringType);
        effects.enter(markerType);
        effects.consume(code);
        effects.exit(markerType);
        effects.exit(type);
        return ok;
      }
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return atBreak;
      }
      effects.enter("chunkString", {
        contentType: "string"
      });
      return labelInside(code);
    }
    function labelInside(code) {
      if (code === null || code === 91 || code === 93 || markdownLineEnding(code) || size++ > 999) {
        effects.exit("chunkString");
        return atBreak(code);
      }
      effects.consume(code);
      if (!seen) seen = !markdownSpace(code);
      return code === 92 ? labelEscape : labelInside;
    }
    function labelEscape(code) {
      if (code === 91 || code === 92 || code === 93) {
        effects.consume(code);
        size++;
        return labelInside;
      }
      return labelInside(code);
    }
  }
  function factoryTitle(effects, ok, nok, type, markerType, stringType) {
    let marker;
    return start;
    function start(code) {
      if (code === 34 || code === 39 || code === 40) {
        effects.enter(type);
        effects.enter(markerType);
        effects.consume(code);
        effects.exit(markerType);
        marker = code === 40 ? 41 : code;
        return begin;
      }
      return nok(code);
    }
    function begin(code) {
      if (code === marker) {
        effects.enter(markerType);
        effects.consume(code);
        effects.exit(markerType);
        effects.exit(type);
        return ok;
      }
      effects.enter(stringType);
      return atBreak(code);
    }
    function atBreak(code) {
      if (code === marker) {
        effects.exit(stringType);
        return begin(marker);
      }
      if (code === null) {
        return nok(code);
      }
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return factorySpace(effects, atBreak, "linePrefix");
      }
      effects.enter("chunkString", {
        contentType: "string"
      });
      return inside(code);
    }
    function inside(code) {
      if (code === marker || code === null || markdownLineEnding(code)) {
        effects.exit("chunkString");
        return atBreak(code);
      }
      effects.consume(code);
      return code === 92 ? escape : inside;
    }
    function escape(code) {
      if (code === marker || code === 92) {
        effects.consume(code);
        return inside;
      }
      return inside(code);
    }
  }
  function factoryWhitespace(effects, ok) {
    let seen;
    return start;
    function start(code) {
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        seen = true;
        return start;
      }
      if (markdownSpace(code)) {
        return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
      }
      return ok(code);
    }
  }
  const definition = {
    name: "definition",
    tokenize: tokenizeDefinition
  };
  const titleBefore = {
    partial: true,
    tokenize: tokenizeTitleBefore
  };
  function tokenizeDefinition(effects, ok, nok) {
    const self = this;
    let identifier;
    return start;
    function start(code) {
      effects.enter("definition");
      return before(code);
    }
    function before(code) {
      return factoryLabel.call(
        self,
        effects,
        labelAfter,
        // Note: we don’t need to reset the way `markdown-rs` does.
        nok,
        "definitionLabel",
        "definitionLabelMarker",
        "definitionLabelString"
      )(code);
    }
    function labelAfter(code) {
      identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
      if (code === 58) {
        effects.enter("definitionMarker");
        effects.consume(code);
        effects.exit("definitionMarker");
        return markerAfter;
      }
      return nok(code);
    }
    function markerAfter(code) {
      return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
    }
    function destinationBefore(code) {
      return factoryDestination(
        effects,
        destinationAfter,
        // Note: we don’t need to reset the way `markdown-rs` does.
        nok,
        "definitionDestination",
        "definitionDestinationLiteral",
        "definitionDestinationLiteralMarker",
        "definitionDestinationRaw",
        "definitionDestinationString"
      )(code);
    }
    function destinationAfter(code) {
      return effects.attempt(titleBefore, after, after)(code);
    }
    function after(code) {
      return markdownSpace(code) ? factorySpace(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
    }
    function afterWhitespace(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("definition");
        self.parser.defined.push(identifier);
        return ok(code);
      }
      return nok(code);
    }
  }
  function tokenizeTitleBefore(effects, ok, nok) {
    return titleBefore2;
    function titleBefore2(code) {
      return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
    }
    function beforeMarker(code) {
      return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
    }
    function titleAfter(code) {
      return markdownSpace(code) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
    }
    function titleAfterOptionalWhitespace(code) {
      return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
    }
  }
  const hardBreakEscape = {
    name: "hardBreakEscape",
    tokenize: tokenizeHardBreakEscape
  };
  function tokenizeHardBreakEscape(effects, ok, nok) {
    return start;
    function start(code) {
      effects.enter("hardBreakEscape");
      effects.consume(code);
      return after;
    }
    function after(code) {
      if (markdownLineEnding(code)) {
        effects.exit("hardBreakEscape");
        return ok(code);
      }
      return nok(code);
    }
  }
  const headingAtx = {
    name: "headingAtx",
    resolve: resolveHeadingAtx,
    tokenize: tokenizeHeadingAtx
  };
  function resolveHeadingAtx(events, context) {
    let contentEnd = events.length - 2;
    let contentStart = 3;
    let content2;
    let text2;
    if (events[contentStart][1].type === "whitespace") {
      contentStart += 2;
    }
    if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") {
      contentEnd -= 2;
    }
    if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) {
      contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
    }
    if (contentEnd > contentStart) {
      content2 = {
        type: "atxHeadingText",
        start: events[contentStart][1].start,
        end: events[contentEnd][1].end
      };
      text2 = {
        type: "chunkText",
        start: events[contentStart][1].start,
        end: events[contentEnd][1].end,
        contentType: "text"
      };
      splice(events, contentStart, contentEnd - contentStart + 1, [["enter", content2, context], ["enter", text2, context], ["exit", text2, context], ["exit", content2, context]]);
    }
    return events;
  }
  function tokenizeHeadingAtx(effects, ok, nok) {
    let size = 0;
    return start;
    function start(code) {
      effects.enter("atxHeading");
      return before(code);
    }
    function before(code) {
      effects.enter("atxHeadingSequence");
      return sequenceOpen(code);
    }
    function sequenceOpen(code) {
      if (code === 35 && size++ < 6) {
        effects.consume(code);
        return sequenceOpen;
      }
      if (code === null || markdownLineEndingOrSpace(code)) {
        effects.exit("atxHeadingSequence");
        return atBreak(code);
      }
      return nok(code);
    }
    function atBreak(code) {
      if (code === 35) {
        effects.enter("atxHeadingSequence");
        return sequenceFurther(code);
      }
      if (code === null || markdownLineEnding(code)) {
        effects.exit("atxHeading");
        return ok(code);
      }
      if (markdownSpace(code)) {
        return factorySpace(effects, atBreak, "whitespace")(code);
      }
      effects.enter("atxHeadingText");
      return data(code);
    }
    function sequenceFurther(code) {
      if (code === 35) {
        effects.consume(code);
        return sequenceFurther;
      }
      effects.exit("atxHeadingSequence");
      return atBreak(code);
    }
    function data(code) {
      if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
        effects.exit("atxHeadingText");
        return atBreak(code);
      }
      effects.consume(code);
      return data;
    }
  }
  const htmlBlockNames = [
    "address",
    "article",
    "aside",
    "base",
    "basefont",
    "blockquote",
    "body",
    "caption",
    "center",
    "col",
    "colgroup",
    "dd",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "iframe",
    "legend",
    "li",
    "link",
    "main",
    "menu",
    "menuitem",
    "nav",
    "noframes",
    "ol",
    "optgroup",
    "option",
    "p",
    "param",
    "search",
    "section",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "title",
    "tr",
    "track",
    "ul"
  ];
  const htmlRawNames = ["pre", "script", "style", "textarea"];
  const htmlFlow = {
    concrete: true,
    name: "htmlFlow",
    resolveTo: resolveToHtmlFlow,
    tokenize: tokenizeHtmlFlow
  };
  const blankLineBefore = {
    partial: true,
    tokenize: tokenizeBlankLineBefore
  };
  const nonLazyContinuationStart = {
    partial: true,
    tokenize: tokenizeNonLazyContinuationStart
  };
  function resolveToHtmlFlow(events) {
    let index = events.length;
    while (index--) {
      if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") {
        break;
      }
    }
    if (index > 1 && events[index - 2][1].type === "linePrefix") {
      events[index][1].start = events[index - 2][1].start;
      events[index + 1][1].start = events[index - 2][1].start;
      events.splice(index - 2, 2);
    }
    return events;
  }
  function tokenizeHtmlFlow(effects, ok, nok) {
    const self = this;
    let marker;
    let closingTag;
    let buffer;
    let index;
    let markerB;
    return start;
    function start(code) {
      return before(code);
    }
    function before(code) {
      effects.enter("htmlFlow");
      effects.enter("htmlFlowData");
      effects.consume(code);
      return open;
    }
    function open(code) {
      if (code === 33) {
        effects.consume(code);
        return declarationOpen;
      }
      if (code === 47) {
        effects.consume(code);
        closingTag = true;
        return tagCloseStart;
      }
      if (code === 63) {
        effects.consume(code);
        marker = 3;
        return self.interrupt ? ok : continuationDeclarationInside;
      }
      if (asciiAlpha(code)) {
        effects.consume(code);
        buffer = String.fromCharCode(code);
        return tagName;
      }
      return nok(code);
    }
    function declarationOpen(code) {
      if (code === 45) {
        effects.consume(code);
        marker = 2;
        return commentOpenInside;
      }
      if (code === 91) {
        effects.consume(code);
        marker = 5;
        index = 0;
        return cdataOpenInside;
      }
      if (asciiAlpha(code)) {
        effects.consume(code);
        marker = 4;
        return self.interrupt ? ok : continuationDeclarationInside;
      }
      return nok(code);
    }
    function commentOpenInside(code) {
      if (code === 45) {
        effects.consume(code);
        return self.interrupt ? ok : continuationDeclarationInside;
      }
      return nok(code);
    }
    function cdataOpenInside(code) {
      const value = "CDATA[";
      if (code === value.charCodeAt(index++)) {
        effects.consume(code);
        if (index === value.length) {
          return self.interrupt ? ok : continuation;
        }
        return cdataOpenInside;
      }
      return nok(code);
    }
    function tagCloseStart(code) {
      if (asciiAlpha(code)) {
        effects.consume(code);
        buffer = String.fromCharCode(code);
        return tagName;
      }
      return nok(code);
    }
    function tagName(code) {
      if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
        const slash = code === 47;
        const name = buffer.toLowerCase();
        if (!slash && !closingTag && htmlRawNames.includes(name)) {
          marker = 1;
          return self.interrupt ? ok(code) : continuation(code);
        }
        if (htmlBlockNames.includes(buffer.toLowerCase())) {
          marker = 6;
          if (slash) {
            effects.consume(code);
            return basicSelfClosing;
          }
          return self.interrupt ? ok(code) : continuation(code);
        }
        marker = 7;
        return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
      }
      if (code === 45 || asciiAlphanumeric(code)) {
        effects.consume(code);
        buffer += String.fromCharCode(code);
        return tagName;
      }
      return nok(code);
    }
    function basicSelfClosing(code) {
      if (code === 62) {
        effects.consume(code);
        return self.interrupt ? ok : continuation;
      }
      return nok(code);
    }
    function completeClosingTagAfter(code) {
      if (markdownSpace(code)) {
        effects.consume(code);
        return completeClosingTagAfter;
      }
      return completeEnd(code);
    }
    function completeAttributeNameBefore(code) {
      if (code === 47) {
        effects.consume(code);
        return completeEnd;
      }
      if (code === 58 || code === 95 || asciiAlpha(code)) {
        effects.consume(code);
        return completeAttributeName;
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return completeAttributeNameBefore;
      }
      return completeEnd(code);
    }
    function completeAttributeName(code) {
      if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
        effects.consume(code);
        return completeAttributeName;
      }
      return completeAttributeNameAfter(code);
    }
    function completeAttributeNameAfter(code) {
      if (code === 61) {
        effects.consume(code);
        return completeAttributeValueBefore;
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return completeAttributeNameAfter;
      }
      return completeAttributeNameBefore(code);
    }
    function completeAttributeValueBefore(code) {
      if (code === null || code === 60 || code === 61 || code === 62 || code === 96) {
        return nok(code);
      }
      if (code === 34 || code === 39) {
        effects.consume(code);
        markerB = code;
        return completeAttributeValueQuoted;
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return completeAttributeValueBefore;
      }
      return completeAttributeValueUnquoted(code);
    }
    function completeAttributeValueQuoted(code) {
      if (code === markerB) {
        effects.consume(code);
        markerB = null;
        return completeAttributeValueQuotedAfter;
      }
      if (code === null || markdownLineEnding(code)) {
        return nok(code);
      }
      effects.consume(code);
      return completeAttributeValueQuoted;
    }
    function completeAttributeValueUnquoted(code) {
      if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace(code)) {
        return completeAttributeNameAfter(code);
      }
      effects.consume(code);
      return completeAttributeValueUnquoted;
    }
    function completeAttributeValueQuotedAfter(code) {
      if (code === 47 || code === 62 || markdownSpace(code)) {
        return completeAttributeNameBefore(code);
      }
      return nok(code);
    }
    function completeEnd(code) {
      if (code === 62) {
        effects.consume(code);
        return completeAfter;
      }
      return nok(code);
    }
    function completeAfter(code) {
      if (code === null || markdownLineEnding(code)) {
        return continuation(code);
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return completeAfter;
      }
      return nok(code);
    }
    function continuation(code) {
      if (code === 45 && marker === 2) {
        effects.consume(code);
        return continuationCommentInside;
      }
      if (code === 60 && marker === 1) {
        effects.consume(code);
        return continuationRawTagOpen;
      }
      if (code === 62 && marker === 4) {
        effects.consume(code);
        return continuationClose;
      }
      if (code === 63 && marker === 3) {
        effects.consume(code);
        return continuationDeclarationInside;
      }
      if (code === 93 && marker === 5) {
        effects.consume(code);
        return continuationCdataInside;
      }
      if (markdownLineEnding(code) && (marker === 6 || marker === 7)) {
        effects.exit("htmlFlowData");
        return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
      }
      if (code === null || markdownLineEnding(code)) {
        effects.exit("htmlFlowData");
        return continuationStart(code);
      }
      effects.consume(code);
      return continuation;
    }
    function continuationStart(code) {
      return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code);
    }
    function continuationStartNonLazy(code) {
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return continuationBefore;
    }
    function continuationBefore(code) {
      if (code === null || markdownLineEnding(code)) {
        return continuationStart(code);
      }
      effects.enter("htmlFlowData");
      return continuation(code);
    }
    function continuationCommentInside(code) {
      if (code === 45) {
        effects.consume(code);
        return continuationDeclarationInside;
      }
      return continuation(code);
    }
    function continuationRawTagOpen(code) {
      if (code === 47) {
        effects.consume(code);
        buffer = "";
        return continuationRawEndTag;
      }
      return continuation(code);
    }
    function continuationRawEndTag(code) {
      if (code === 62) {
        const name = buffer.toLowerCase();
        if (htmlRawNames.includes(name)) {
          effects.consume(code);
          return continuationClose;
        }
        return continuation(code);
      }
      if (asciiAlpha(code) && buffer.length < 8) {
        effects.consume(code);
        buffer += String.fromCharCode(code);
        return continuationRawEndTag;
      }
      return continuation(code);
    }
    function continuationCdataInside(code) {
      if (code === 93) {
        effects.consume(code);
        return continuationDeclarationInside;
      }
      return continuation(code);
    }
    function continuationDeclarationInside(code) {
      if (code === 62) {
        effects.consume(code);
        return continuationClose;
      }
      if (code === 45 && marker === 2) {
        effects.consume(code);
        return continuationDeclarationInside;
      }
      return continuation(code);
    }
    function continuationClose(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("htmlFlowData");
        return continuationAfter(code);
      }
      effects.consume(code);
      return continuationClose;
    }
    function continuationAfter(code) {
      effects.exit("htmlFlow");
      return ok(code);
    }
  }
  function tokenizeNonLazyContinuationStart(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return after;
      }
      return nok(code);
    }
    function after(code) {
      return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
    }
  }
  function tokenizeBlankLineBefore(effects, ok, nok) {
    return start;
    function start(code) {
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return effects.attempt(blankLine, ok, nok);
    }
  }
  const htmlText = {
    name: "htmlText",
    tokenize: tokenizeHtmlText
  };
  function tokenizeHtmlText(effects, ok, nok) {
    const self = this;
    let marker;
    let index;
    let returnState;
    return start;
    function start(code) {
      effects.enter("htmlText");
      effects.enter("htmlTextData");
      effects.consume(code);
      return open;
    }
    function open(code) {
      if (code === 33) {
        effects.consume(code);
        return declarationOpen;
      }
      if (code === 47) {
        effects.consume(code);
        return tagCloseStart;
      }
      if (code === 63) {
        effects.consume(code);
        return instruction;
      }
      if (asciiAlpha(code)) {
        effects.consume(code);
        return tagOpen;
      }
      return nok(code);
    }
    function declarationOpen(code) {
      if (code === 45) {
        effects.consume(code);
        return commentOpenInside;
      }
      if (code === 91) {
        effects.consume(code);
        index = 0;
        return cdataOpenInside;
      }
      if (asciiAlpha(code)) {
        effects.consume(code);
        return declaration;
      }
      return nok(code);
    }
    function commentOpenInside(code) {
      if (code === 45) {
        effects.consume(code);
        return commentEnd;
      }
      return nok(code);
    }
    function comment(code) {
      if (code === null) {
        return nok(code);
      }
      if (code === 45) {
        effects.consume(code);
        return commentClose;
      }
      if (markdownLineEnding(code)) {
        returnState = comment;
        return lineEndingBefore(code);
      }
      effects.consume(code);
      return comment;
    }
    function commentClose(code) {
      if (code === 45) {
        effects.consume(code);
        return commentEnd;
      }
      return comment(code);
    }
    function commentEnd(code) {
      return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
    }
    function cdataOpenInside(code) {
      const value = "CDATA[";
      if (code === value.charCodeAt(index++)) {
        effects.consume(code);
        return index === value.length ? cdata : cdataOpenInside;
      }
      return nok(code);
    }
    function cdata(code) {
      if (code === null) {
        return nok(code);
      }
      if (code === 93) {
        effects.consume(code);
        return cdataClose;
      }
      if (markdownLineEnding(code)) {
        returnState = cdata;
        return lineEndingBefore(code);
      }
      effects.consume(code);
      return cdata;
    }
    function cdataClose(code) {
      if (code === 93) {
        effects.consume(code);
        return cdataEnd;
      }
      return cdata(code);
    }
    function cdataEnd(code) {
      if (code === 62) {
        return end(code);
      }
      if (code === 93) {
        effects.consume(code);
        return cdataEnd;
      }
      return cdata(code);
    }
    function declaration(code) {
      if (code === null || code === 62) {
        return end(code);
      }
      if (markdownLineEnding(code)) {
        returnState = declaration;
        return lineEndingBefore(code);
      }
      effects.consume(code);
      return declaration;
    }
    function instruction(code) {
      if (code === null) {
        return nok(code);
      }
      if (code === 63) {
        effects.consume(code);
        return instructionClose;
      }
      if (markdownLineEnding(code)) {
        returnState = instruction;
        return lineEndingBefore(code);
      }
      effects.consume(code);
      return instruction;
    }
    function instructionClose(code) {
      return code === 62 ? end(code) : instruction(code);
    }
    function tagCloseStart(code) {
      if (asciiAlpha(code)) {
        effects.consume(code);
        return tagClose;
      }
      return nok(code);
    }
    function tagClose(code) {
      if (code === 45 || asciiAlphanumeric(code)) {
        effects.consume(code);
        return tagClose;
      }
      return tagCloseBetween(code);
    }
    function tagCloseBetween(code) {
      if (markdownLineEnding(code)) {
        returnState = tagCloseBetween;
        return lineEndingBefore(code);
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return tagCloseBetween;
      }
      return end(code);
    }
    function tagOpen(code) {
      if (code === 45 || asciiAlphanumeric(code)) {
        effects.consume(code);
        return tagOpen;
      }
      if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
        return tagOpenBetween(code);
      }
      return nok(code);
    }
    function tagOpenBetween(code) {
      if (code === 47) {
        effects.consume(code);
        return end;
      }
      if (code === 58 || code === 95 || asciiAlpha(code)) {
        effects.consume(code);
        return tagOpenAttributeName;
      }
      if (markdownLineEnding(code)) {
        returnState = tagOpenBetween;
        return lineEndingBefore(code);
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return tagOpenBetween;
      }
      return end(code);
    }
    function tagOpenAttributeName(code) {
      if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
        effects.consume(code);
        return tagOpenAttributeName;
      }
      return tagOpenAttributeNameAfter(code);
    }
    function tagOpenAttributeNameAfter(code) {
      if (code === 61) {
        effects.consume(code);
        return tagOpenAttributeValueBefore;
      }
      if (markdownLineEnding(code)) {
        returnState = tagOpenAttributeNameAfter;
        return lineEndingBefore(code);
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return tagOpenAttributeNameAfter;
      }
      return tagOpenBetween(code);
    }
    function tagOpenAttributeValueBefore(code) {
      if (code === null || code === 60 || code === 61 || code === 62 || code === 96) {
        return nok(code);
      }
      if (code === 34 || code === 39) {
        effects.consume(code);
        marker = code;
        return tagOpenAttributeValueQuoted;
      }
      if (markdownLineEnding(code)) {
        returnState = tagOpenAttributeValueBefore;
        return lineEndingBefore(code);
      }
      if (markdownSpace(code)) {
        effects.consume(code);
        return tagOpenAttributeValueBefore;
      }
      effects.consume(code);
      return tagOpenAttributeValueUnquoted;
    }
    function tagOpenAttributeValueQuoted(code) {
      if (code === marker) {
        effects.consume(code);
        marker = void 0;
        return tagOpenAttributeValueQuotedAfter;
      }
      if (code === null) {
        return nok(code);
      }
      if (markdownLineEnding(code)) {
        returnState = tagOpenAttributeValueQuoted;
        return lineEndingBefore(code);
      }
      effects.consume(code);
      return tagOpenAttributeValueQuoted;
    }
    function tagOpenAttributeValueUnquoted(code) {
      if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) {
        return nok(code);
      }
      if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
        return tagOpenBetween(code);
      }
      effects.consume(code);
      return tagOpenAttributeValueUnquoted;
    }
    function tagOpenAttributeValueQuotedAfter(code) {
      if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
        return tagOpenBetween(code);
      }
      return nok(code);
    }
    function end(code) {
      if (code === 62) {
        effects.consume(code);
        effects.exit("htmlTextData");
        effects.exit("htmlText");
        return ok;
      }
      return nok(code);
    }
    function lineEndingBefore(code) {
      effects.exit("htmlTextData");
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return lineEndingAfter;
    }
    function lineEndingAfter(code) {
      return markdownSpace(code) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
    }
    function lineEndingAfterPrefix(code) {
      effects.enter("htmlTextData");
      return returnState(code);
    }
  }
  const labelEnd = {
    name: "labelEnd",
    resolveAll: resolveAllLabelEnd,
    resolveTo: resolveToLabelEnd,
    tokenize: tokenizeLabelEnd
  };
  const resourceConstruct = {
    tokenize: tokenizeResource
  };
  const referenceFullConstruct = {
    tokenize: tokenizeReferenceFull
  };
  const referenceCollapsedConstruct = {
    tokenize: tokenizeReferenceCollapsed
  };
  function resolveAllLabelEnd(events) {
    let index = -1;
    const newEvents = [];
    while (++index < events.length) {
      const token = events[index][1];
      newEvents.push(events[index]);
      if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
        const offset = token.type === "labelImage" ? 4 : 2;
        token.type = "data";
        index += offset;
      }
    }
    if (events.length !== newEvents.length) {
      splice(events, 0, events.length, newEvents);
    }
    return events;
  }
  function resolveToLabelEnd(events, context) {
    let index = events.length;
    let offset = 0;
    let token;
    let open;
    let close;
    let media;
    while (index--) {
      token = events[index][1];
      if (open) {
        if (token.type === "link" || token.type === "labelLink" && token._inactive) {
          break;
        }
        if (events[index][0] === "enter" && token.type === "labelLink") {
          token._inactive = true;
        }
      } else if (close) {
        if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
          open = index;
          if (token.type !== "labelLink") {
            offset = 2;
            break;
          }
        }
      } else if (token.type === "labelEnd") {
        close = index;
      }
    }
    const group = {
      type: events[open][1].type === "labelLink" ? "link" : "image",
      start: {
        ...events[open][1].start
      },
      end: {
        ...events[events.length - 1][1].end
      }
    };
    const label = {
      type: "label",
      start: {
        ...events[open][1].start
      },
      end: {
        ...events[close][1].end
      }
    };
    const text2 = {
      type: "labelText",
      start: {
        ...events[open + offset + 2][1].end
      },
      end: {
        ...events[close - 2][1].start
      }
    };
    media = [["enter", group, context], ["enter", label, context]];
    media = push(media, events.slice(open + 1, open + offset + 3));
    media = push(media, [["enter", text2, context]]);
    media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
    media = push(media, [["exit", text2, context], events[close - 2], events[close - 1], ["exit", label, context]]);
    media = push(media, events.slice(close + 1));
    media = push(media, [["exit", group, context]]);
    splice(events, open, events.length, media);
    return events;
  }
  function tokenizeLabelEnd(effects, ok, nok) {
    const self = this;
    let index = self.events.length;
    let labelStart;
    let defined;
    while (index--) {
      if ((self.events[index][1].type === "labelImage" || self.events[index][1].type === "labelLink") && !self.events[index][1]._balanced) {
        labelStart = self.events[index][1];
        break;
      }
    }
    return start;
    function start(code) {
      if (!labelStart) {
        return nok(code);
      }
      if (labelStart._inactive) {
        return labelEndNok(code);
      }
      defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
        start: labelStart.end,
        end: self.now()
      })));
      effects.enter("labelEnd");
      effects.enter("labelMarker");
      effects.consume(code);
      effects.exit("labelMarker");
      effects.exit("labelEnd");
      return after;
    }
    function after(code) {
      if (code === 40) {
        return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
      }
      if (code === 91) {
        return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
      }
      return defined ? labelEndOk(code) : labelEndNok(code);
    }
    function referenceNotFull(code) {
      return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
    }
    function labelEndOk(code) {
      return ok(code);
    }
    function labelEndNok(code) {
      labelStart._balanced = true;
      return nok(code);
    }
  }
  function tokenizeResource(effects, ok, nok) {
    return resourceStart;
    function resourceStart(code) {
      effects.enter("resource");
      effects.enter("resourceMarker");
      effects.consume(code);
      effects.exit("resourceMarker");
      return resourceBefore;
    }
    function resourceBefore(code) {
      return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
    }
    function resourceOpen(code) {
      if (code === 41) {
        return resourceEnd(code);
      }
      return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
    }
    function resourceDestinationAfter(code) {
      return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
    }
    function resourceDestinationMissing(code) {
      return nok(code);
    }
    function resourceBetween(code) {
      if (code === 34 || code === 39 || code === 40) {
        return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
      }
      return resourceEnd(code);
    }
    function resourceTitleAfter(code) {
      return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
    }
    function resourceEnd(code) {
      if (code === 41) {
        effects.enter("resourceMarker");
        effects.consume(code);
        effects.exit("resourceMarker");
        effects.exit("resource");
        return ok;
      }
      return nok(code);
    }
  }
  function tokenizeReferenceFull(effects, ok, nok) {
    const self = this;
    return referenceFull;
    function referenceFull(code) {
      return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
    }
    function referenceFullAfter(code) {
      return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
    }
    function referenceFullMissing(code) {
      return nok(code);
    }
  }
  function tokenizeReferenceCollapsed(effects, ok, nok) {
    return referenceCollapsedStart;
    function referenceCollapsedStart(code) {
      effects.enter("reference");
      effects.enter("referenceMarker");
      effects.consume(code);
      effects.exit("referenceMarker");
      return referenceCollapsedOpen;
    }
    function referenceCollapsedOpen(code) {
      if (code === 93) {
        effects.enter("referenceMarker");
        effects.consume(code);
        effects.exit("referenceMarker");
        effects.exit("reference");
        return ok;
      }
      return nok(code);
    }
  }
  const labelStartImage = {
    name: "labelStartImage",
    resolveAll: labelEnd.resolveAll,
    tokenize: tokenizeLabelStartImage
  };
  function tokenizeLabelStartImage(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      effects.enter("labelImage");
      effects.enter("labelImageMarker");
      effects.consume(code);
      effects.exit("labelImageMarker");
      return open;
    }
    function open(code) {
      if (code === 91) {
        effects.enter("labelMarker");
        effects.consume(code);
        effects.exit("labelMarker");
        effects.exit("labelImage");
        return after;
      }
      return nok(code);
    }
    function after(code) {
      return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
    }
  }
  const labelStartLink = {
    name: "labelStartLink",
    resolveAll: labelEnd.resolveAll,
    tokenize: tokenizeLabelStartLink
  };
  function tokenizeLabelStartLink(effects, ok, nok) {
    const self = this;
    return start;
    function start(code) {
      effects.enter("labelLink");
      effects.enter("labelMarker");
      effects.consume(code);
      effects.exit("labelMarker");
      effects.exit("labelLink");
      return after;
    }
    function after(code) {
      return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
    }
  }
  const lineEnding = {
    name: "lineEnding",
    tokenize: tokenizeLineEnding
  };
  function tokenizeLineEnding(effects, ok) {
    return start;
    function start(code) {
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return factorySpace(effects, ok, "linePrefix");
    }
  }
  const thematicBreak = {
    name: "thematicBreak",
    tokenize: tokenizeThematicBreak
  };
  function tokenizeThematicBreak(effects, ok, nok) {
    let size = 0;
    let marker;
    return start;
    function start(code) {
      effects.enter("thematicBreak");
      return before(code);
    }
    function before(code) {
      marker = code;
      return atBreak(code);
    }
    function atBreak(code) {
      if (code === marker) {
        effects.enter("thematicBreakSequence");
        return sequence(code);
      }
      if (size >= 3 && (code === null || markdownLineEnding(code))) {
        effects.exit("thematicBreak");
        return ok(code);
      }
      return nok(code);
    }
    function sequence(code) {
      if (code === marker) {
        effects.consume(code);
        size++;
        return sequence;
      }
      effects.exit("thematicBreakSequence");
      return markdownSpace(code) ? factorySpace(effects, atBreak, "whitespace")(code) : atBreak(code);
    }
  }
  const list = {
    continuation: {
      tokenize: tokenizeListContinuation
    },
    exit: tokenizeListEnd,
    name: "list",
    tokenize: tokenizeListStart
  };
  const listItemPrefixWhitespaceConstruct = {
    partial: true,
    tokenize: tokenizeListItemPrefixWhitespace
  };
  const indentConstruct = {
    partial: true,
    tokenize: tokenizeIndent
  };
  function tokenizeListStart(effects, ok, nok) {
    const self = this;
    const tail = self.events[self.events.length - 1];
    let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
    let size = 0;
    return start;
    function start(code) {
      const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
      if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
        if (!self.containerState.type) {
          self.containerState.type = kind;
          effects.enter(kind, {
            _container: true
          });
        }
        if (kind === "listUnordered") {
          effects.enter("listItemPrefix");
          return code === 42 || code === 45 ? effects.check(thematicBreak, nok, atMarker)(code) : atMarker(code);
        }
        if (!self.interrupt || code === 49) {
          effects.enter("listItemPrefix");
          effects.enter("listItemValue");
          return inside(code);
        }
      }
      return nok(code);
    }
    function inside(code) {
      if (asciiDigit(code) && ++size < 10) {
        effects.consume(code);
        return inside;
      }
      if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
        effects.exit("listItemValue");
        return atMarker(code);
      }
      return nok(code);
    }
    function atMarker(code) {
      effects.enter("listItemMarker");
      effects.consume(code);
      effects.exit("listItemMarker");
      self.containerState.marker = self.containerState.marker || code;
      return effects.check(
        blankLine,
        // Can’t be empty when interrupting.
        self.interrupt ? nok : onBlank,
        effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix)
      );
    }
    function onBlank(code) {
      self.containerState.initialBlankLine = true;
      initialSize++;
      return endOfPrefix(code);
    }
    function otherPrefix(code) {
      if (markdownSpace(code)) {
        effects.enter("listItemPrefixWhitespace");
        effects.consume(code);
        effects.exit("listItemPrefixWhitespace");
        return endOfPrefix;
      }
      return nok(code);
    }
    function endOfPrefix(code) {
      self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
      return ok(code);
    }
  }
  function tokenizeListContinuation(effects, ok, nok) {
    const self = this;
    self.containerState._closeFlow = void 0;
    return effects.check(blankLine, onBlank, notBlank);
    function onBlank(code) {
      self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
      return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
    }
    function notBlank(code) {
      if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
        self.containerState.furtherBlankLines = void 0;
        self.containerState.initialBlankLine = void 0;
        return notInCurrentItem(code);
      }
      self.containerState.furtherBlankLines = void 0;
      self.containerState.initialBlankLine = void 0;
      return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
    }
    function notInCurrentItem(code) {
      self.containerState._closeFlow = true;
      self.interrupt = void 0;
      return factorySpace(effects, effects.attempt(list, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
    }
  }
  function tokenizeIndent(effects, ok, nok) {
    const self = this;
    return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
    function afterPrefix(code) {
      const tail = self.events[self.events.length - 1];
      return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
    }
  }
  function tokenizeListEnd(effects) {
    effects.exit(this.containerState.type);
  }
  function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
    const self = this;
    return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1);
    function afterPrefix(code) {
      const tail = self.events[self.events.length - 1];
      return !markdownSpace(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
    }
  }
  const setextUnderline = {
    name: "setextUnderline",
    resolveTo: resolveToSetextUnderline,
    tokenize: tokenizeSetextUnderline
  };
  function resolveToSetextUnderline(events, context) {
    let index = events.length;
    let content2;
    let text2;
    let definition2;
    while (index--) {
      if (events[index][0] === "enter") {
        if (events[index][1].type === "content") {
          content2 = index;
          break;
        }
        if (events[index][1].type === "paragraph") {
          text2 = index;
        }
      } else {
        if (events[index][1].type === "content") {
          events.splice(index, 1);
        }
        if (!definition2 && events[index][1].type === "definition") {
          definition2 = index;
        }
      }
    }
    const heading = {
      type: "setextHeading",
      start: {
        ...events[text2][1].start
      },
      end: {
        ...events[events.length - 1][1].end
      }
    };
    events[text2][1].type = "setextHeadingText";
    if (definition2) {
      events.splice(text2, 0, ["enter", heading, context]);
      events.splice(definition2 + 1, 0, ["exit", events[content2][1], context]);
      events[content2][1].end = {
        ...events[definition2][1].end
      };
    } else {
      events[content2][1] = heading;
    }
    events.push(["exit", heading, context]);
    return events;
  }
  function tokenizeSetextUnderline(effects, ok, nok) {
    const self = this;
    let marker;
    return start;
    function start(code) {
      let index = self.events.length;
      let paragraph;
      while (index--) {
        if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
          paragraph = self.events[index][1].type === "paragraph";
          break;
        }
      }
      if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
        effects.enter("setextHeadingLine");
        marker = code;
        return before(code);
      }
      return nok(code);
    }
    function before(code) {
      effects.enter("setextHeadingLineSequence");
      return inside(code);
    }
    function inside(code) {
      if (code === marker) {
        effects.consume(code);
        return inside;
      }
      effects.exit("setextHeadingLineSequence");
      return markdownSpace(code) ? factorySpace(effects, after, "lineSuffix")(code) : after(code);
    }
    function after(code) {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("setextHeadingLine");
        return ok(code);
      }
      return nok(code);
    }
  }
  const flow$1 = {
    tokenize: initializeFlow
  };
  function initializeFlow(effects) {
    const self = this;
    const initial = effects.attempt(
      // Try to parse a blank line.
      blankLine,
      atBlankEnding,
      // Try to parse initial flow (essentially, only code).
      effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix"))
    );
    return initial;
    function atBlankEnding(code) {
      if (code === null) {
        effects.consume(code);
        return;
      }
      effects.enter("lineEndingBlank");
      effects.consume(code);
      effects.exit("lineEndingBlank");
      self.currentConstruct = void 0;
      return initial;
    }
    function afterConstruct(code) {
      if (code === null) {
        effects.consume(code);
        return;
      }
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      self.currentConstruct = void 0;
      return initial;
    }
  }
  const resolver = {
    resolveAll: createResolver()
  };
  const string$1 = initializeFactory("string");
  const text$1 = initializeFactory("text");
  function initializeFactory(field) {
    return {
      resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
      tokenize: initializeText
    };
    function initializeText(effects) {
      const self = this;
      const constructs2 = this.parser.constructs[field];
      const text2 = effects.attempt(constructs2, start, notText);
      return start;
      function start(code) {
        return atBreak(code) ? text2(code) : notText(code);
      }
      function notText(code) {
        if (code === null) {
          effects.consume(code);
          return;
        }
        effects.enter("data");
        effects.consume(code);
        return data;
      }
      function data(code) {
        if (atBreak(code)) {
          effects.exit("data");
          return text2(code);
        }
        effects.consume(code);
        return data;
      }
      function atBreak(code) {
        if (code === null) {
          return true;
        }
        const list2 = constructs2[code];
        let index = -1;
        if (list2) {
          while (++index < list2.length) {
            const item = list2[index];
            if (!item.previous || item.previous.call(self, self.previous)) {
              return true;
            }
          }
        }
        return false;
      }
    }
  }
  function createResolver(extraResolver) {
    return resolveAllText;
    function resolveAllText(events, context) {
      let index = -1;
      let enter;
      while (++index <= events.length) {
        if (enter === void 0) {
          if (events[index] && events[index][1].type === "data") {
            enter = index;
            index++;
          }
        } else if (!events[index] || events[index][1].type !== "data") {
          if (index !== enter + 2) {
            events[enter][1].end = events[index - 1][1].end;
            events.splice(enter + 2, index - enter - 2);
            index = enter + 2;
          }
          enter = void 0;
        }
      }
      return extraResolver ? extraResolver(events, context) : events;
    }
  }
  function resolveAllLineSuffixes(events, context) {
    let eventIndex = 0;
    while (++eventIndex <= events.length) {
      if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
        const data = events[eventIndex - 1][1];
        const chunks = context.sliceStream(data);
        let index = chunks.length;
        let bufferIndex = -1;
        let size = 0;
        let tabs;
        while (index--) {
          const chunk = chunks[index];
          if (typeof chunk === "string") {
            bufferIndex = chunk.length;
            while (chunk.charCodeAt(bufferIndex - 1) === 32) {
              size++;
              bufferIndex--;
            }
            if (bufferIndex) break;
            bufferIndex = -1;
          } else if (chunk === -2) {
            tabs = true;
            size++;
          } else if (chunk === -1) ;
          else {
            index++;
            break;
          }
        }
        if (size) {
          const token = {
            type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
            start: {
              _bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
              _index: data.start._index + index,
              line: data.end.line,
              column: data.end.column - size,
              offset: data.end.offset - size
            },
            end: {
              ...data.end
            }
          };
          data.end = {
            ...token.start
          };
          if (data.start.offset === data.end.offset) {
            Object.assign(data, token);
          } else {
            events.splice(eventIndex, 0, ["enter", token, context], ["exit", token, context]);
            eventIndex += 2;
          }
        }
        eventIndex++;
      }
    }
    return events;
  }
  const document$1 = {
    [42]: list,
    [43]: list,
    [45]: list,
    [48]: list,
    [49]: list,
    [50]: list,
    [51]: list,
    [52]: list,
    [53]: list,
    [54]: list,
    [55]: list,
    [56]: list,
    [57]: list,
    [62]: blockQuote
  };
  const contentInitial = {
    [91]: definition
  };
  const flowInitial = {
    [-2]: codeIndented,
    [-1]: codeIndented,
    [32]: codeIndented
  };
  const flow = {
    [35]: headingAtx,
    [42]: thematicBreak,
    [45]: [setextUnderline, thematicBreak],
    [60]: htmlFlow,
    [61]: setextUnderline,
    [95]: thematicBreak,
    [96]: codeFenced,
    [126]: codeFenced
  };
  const string = {
    [38]: characterReference,
    [92]: characterEscape
  };
  const text = {
    [-5]: lineEnding,
    [-4]: lineEnding,
    [-3]: lineEnding,
    [33]: labelStartImage,
    [38]: characterReference,
    [42]: attention,
    [60]: [autolink, htmlText],
    [91]: labelStartLink,
    [92]: [hardBreakEscape, characterEscape],
    [93]: labelEnd,
    [95]: attention,
    [96]: codeText
  };
  const insideSpan = {
    null: [attention, resolver]
  };
  const attentionMarkers = {
    null: [42, 95]
  };
  const disable = {
    null: []
  };
  const defaultConstructs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    attentionMarkers,
    contentInitial,
    disable,
    document: document$1,
    flow,
    flowInitial,
    insideSpan,
    string,
    text
  }, Symbol.toStringTag, { value: "Module" }));
  function createTokenizer(parser, initialize, from) {
    let point = {
      _bufferIndex: -1,
      _index: 0,
      line: from && from.line || 1,
      column: from && from.column || 1,
      offset: from && from.offset || 0
    };
    const columnStart = {};
    const resolveAllConstructs = [];
    let chunks = [];
    let stack = [];
    const effects = {
      attempt: constructFactory(onsuccessfulconstruct),
      check: constructFactory(onsuccessfulcheck),
      consume,
      enter,
      exit: exit2,
      interrupt: constructFactory(onsuccessfulcheck, {
        interrupt: true
      })
    };
    const context = {
      code: null,
      containerState: {},
      defineSkip,
      events: [],
      now,
      parser,
      previous: null,
      sliceSerialize,
      sliceStream,
      write
    };
    let state = initialize.tokenize.call(context, effects);
    if (initialize.resolveAll) {
      resolveAllConstructs.push(initialize);
    }
    return context;
    function write(slice) {
      chunks = push(chunks, slice);
      main();
      if (chunks[chunks.length - 1] !== null) {
        return [];
      }
      addResult(initialize, 0);
      context.events = resolveAll(resolveAllConstructs, context.events, context);
      return context.events;
    }
    function sliceSerialize(token, expandTabs) {
      return serializeChunks(sliceStream(token), expandTabs);
    }
    function sliceStream(token) {
      return sliceChunks(chunks, token);
    }
    function now() {
      const {
        _bufferIndex,
        _index,
        line,
        column,
        offset
      } = point;
      return {
        _bufferIndex,
        _index,
        line,
        column,
        offset
      };
    }
    function defineSkip(value) {
      columnStart[value.line] = value.column;
      accountForPotentialSkip();
    }
    function main() {
      let chunkIndex;
      while (point._index < chunks.length) {
        const chunk = chunks[point._index];
        if (typeof chunk === "string") {
          chunkIndex = point._index;
          if (point._bufferIndex < 0) {
            point._bufferIndex = 0;
          }
          while (point._index === chunkIndex && point._bufferIndex < chunk.length) {
            go(chunk.charCodeAt(point._bufferIndex));
          }
        } else {
          go(chunk);
        }
      }
    }
    function go(code) {
      state = state(code);
    }
    function consume(code) {
      if (markdownLineEnding(code)) {
        point.line++;
        point.column = 1;
        point.offset += code === -3 ? 2 : 1;
        accountForPotentialSkip();
      } else if (code !== -1) {
        point.column++;
        point.offset++;
      }
      if (point._bufferIndex < 0) {
        point._index++;
      } else {
        point._bufferIndex++;
        if (point._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
        // strings.
        /** @type {string} */
        chunks[point._index].length) {
          point._bufferIndex = -1;
          point._index++;
        }
      }
      context.previous = code;
    }
    function enter(type, fields) {
      const token = fields || {};
      token.type = type;
      token.start = now();
      context.events.push(["enter", token, context]);
      stack.push(token);
      return token;
    }
    function exit2(type) {
      const token = stack.pop();
      token.end = now();
      context.events.push(["exit", token, context]);
      return token;
    }
    function onsuccessfulconstruct(construct, info) {
      addResult(construct, info.from);
    }
    function onsuccessfulcheck(_, info) {
      info.restore();
    }
    function constructFactory(onreturn, fields) {
      return hook;
      function hook(constructs2, returnState, bogusState) {
        let listOfConstructs;
        let constructIndex;
        let currentConstruct;
        let info;
        return Array.isArray(constructs2) ? (
          /* c8 ignore next 1 */
          handleListOfConstructs(constructs2)
        ) : "tokenize" in constructs2 ? (
          // Looks like a construct.
          handleListOfConstructs([
            /** @type {Construct} */
            constructs2
          ])
        ) : handleMapOfConstructs(constructs2);
        function handleMapOfConstructs(map) {
          return start;
          function start(code) {
            const left = code !== null && map[code];
            const all = code !== null && map.null;
            const list2 = [
              // To do: add more extension tests.
              /* c8 ignore next 2 */
              ...Array.isArray(left) ? left : left ? [left] : [],
              ...Array.isArray(all) ? all : all ? [all] : []
            ];
            return handleListOfConstructs(list2)(code);
          }
        }
        function handleListOfConstructs(list2) {
          listOfConstructs = list2;
          constructIndex = 0;
          if (list2.length === 0) {
            return bogusState;
          }
          return handleConstruct(list2[constructIndex]);
        }
        function handleConstruct(construct) {
          return start;
          function start(code) {
            info = store();
            currentConstruct = construct;
            if (!construct.partial) {
              context.currentConstruct = construct;
            }
            if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
              return nok();
            }
            return construct.tokenize.call(
              // If we do have fields, create an object w/ `context` as its
              // prototype.
              // This allows a “live binding”, which is needed for `interrupt`.
              fields ? Object.assign(Object.create(context), fields) : context,
              effects,
              ok,
              nok
            )(code);
          }
        }
        function ok(code) {
          onreturn(currentConstruct, info);
          return returnState;
        }
        function nok(code) {
          info.restore();
          if (++constructIndex < listOfConstructs.length) {
            return handleConstruct(listOfConstructs[constructIndex]);
          }
          return bogusState;
        }
      }
    }
    function addResult(construct, from2) {
      if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
        resolveAllConstructs.push(construct);
      }
      if (construct.resolve) {
        splice(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
      }
      if (construct.resolveTo) {
        context.events = construct.resolveTo(context.events, context);
      }
    }
    function store() {
      const startPoint = now();
      const startPrevious = context.previous;
      const startCurrentConstruct = context.currentConstruct;
      const startEventsIndex = context.events.length;
      const startStack = Array.from(stack);
      return {
        from: startEventsIndex,
        restore
      };
      function restore() {
        point = startPoint;
        context.previous = startPrevious;
        context.currentConstruct = startCurrentConstruct;
        context.events.length = startEventsIndex;
        stack = startStack;
        accountForPotentialSkip();
      }
    }
    function accountForPotentialSkip() {
      if (point.line in columnStart && point.column < 2) {
        point.column = columnStart[point.line];
        point.offset += columnStart[point.line] - 1;
      }
    }
  }
  function sliceChunks(chunks, token) {
    const startIndex = token.start._index;
    const startBufferIndex = token.start._bufferIndex;
    const endIndex = token.end._index;
    const endBufferIndex = token.end._bufferIndex;
    let view;
    if (startIndex === endIndex) {
      view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
    } else {
      view = chunks.slice(startIndex, endIndex);
      if (startBufferIndex > -1) {
        const head = view[0];
        if (typeof head === "string") {
          view[0] = head.slice(startBufferIndex);
        } else {
          view.shift();
        }
      }
      if (endBufferIndex > 0) {
        view.push(chunks[endIndex].slice(0, endBufferIndex));
      }
    }
    return view;
  }
  function serializeChunks(chunks, expandTabs) {
    let index = -1;
    const result = [];
    let atTab;
    while (++index < chunks.length) {
      const chunk = chunks[index];
      let value;
      if (typeof chunk === "string") {
        value = chunk;
      } else switch (chunk) {
        case -5: {
          value = "\r";
          break;
        }
        case -4: {
          value = "\n";
          break;
        }
        case -3: {
          value = "\r\n";
          break;
        }
        case -2: {
          value = expandTabs ? " " : "	";
          break;
        }
        case -1: {
          if (!expandTabs && atTab) continue;
          value = " ";
          break;
        }
        default: {
          value = String.fromCharCode(chunk);
        }
      }
      atTab = chunk === -2;
      result.push(value);
    }
    return result.join("");
  }
  function parse(options) {
    const settings = options || {};
    const constructs2 = (
      /** @type {FullNormalizedExtension} */
      combineExtensions([defaultConstructs, ...settings.extensions || []])
    );
    const parser = {
      constructs: constructs2,
      content: create(content$1),
      defined: [],
      document: create(document$2),
      flow: create(flow$1),
      lazy: {},
      string: create(string$1),
      text: create(text$1)
    };
    return parser;
    function create(initial) {
      return creator;
      function creator(from) {
        return createTokenizer(parser, initial, from);
      }
    }
  }
  function postprocess(events) {
    while (!subtokenize(events)) {
    }
    return events;
  }
  const search = /[\0\t\n\r]/g;
  function preprocess() {
    let column = 1;
    let buffer = "";
    let start = true;
    let atCarriageReturn;
    return preprocessor;
    function preprocessor(value, encoding, end) {
      const chunks = [];
      let match;
      let next;
      let startPosition;
      let endPosition;
      let code;
      value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
      startPosition = 0;
      buffer = "";
      if (start) {
        if (value.charCodeAt(0) === 65279) {
          startPosition++;
        }
        start = void 0;
      }
      while (startPosition < value.length) {
        search.lastIndex = startPosition;
        match = search.exec(value);
        endPosition = match && match.index !== void 0 ? match.index : value.length;
        code = value.charCodeAt(endPosition);
        if (!match) {
          buffer = value.slice(startPosition);
          break;
        }
        if (code === 10 && startPosition === endPosition && atCarriageReturn) {
          chunks.push(-3);
          atCarriageReturn = void 0;
        } else {
          if (atCarriageReturn) {
            chunks.push(-5);
            atCarriageReturn = void 0;
          }
          if (startPosition < endPosition) {
            chunks.push(value.slice(startPosition, endPosition));
            column += endPosition - startPosition;
          }
          switch (code) {
            case 0: {
              chunks.push(65533);
              column++;
              break;
            }
            case 9: {
              next = Math.ceil(column / 4) * 4;
              chunks.push(-2);
              while (column++ < next) chunks.push(-1);
              break;
            }
            case 10: {
              chunks.push(-4);
              column = 1;
              break;
            }
            default: {
              atCarriageReturn = true;
              column = 1;
            }
          }
        }
        startPosition = endPosition + 1;
      }
      if (end) {
        if (atCarriageReturn) chunks.push(-5);
        if (buffer) chunks.push(buffer);
        chunks.push(null);
      }
      return chunks;
    }
  }
  function micromark(value, encoding, options) {
    if (typeof encoding !== "string") {
      options = encoding;
      encoding = void 0;
    }
    return compile(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
  }
  function createPreviewPanel() {
    const preview = document.createElement("div");
    preview.className = "markdown-preview hidden";
    preview.id = "markdown-preview";
    document.body.appendChild(preview);
    return preview;
  }
  function handleNoteClick(event) {
    const noteElement = event.target.closest(".IZ65Hb-n0tgWb");
    if (!noteElement) return;
    const noteContent = noteElement.querySelector(".h1U9Be-YPqjbf");
    if (!noteContent) return;
    const preview = document.getElementById("markdown-preview") || createPreviewPanel();
    preview.classList.remove("hidden");
    document.body.classList.add("markdown-preview-active");
    const markdownText = noteContent.textContent;
    const htmlContent = micromark(markdownText);
    preview.innerHTML = htmlContent;
  }
  function init() {
    document.addEventListener("click", handleNoteClick);
    const preview = createPreviewPanel();
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = "position:absolute;right:10px;top:10px;font-size:20px;cursor:pointer;";
    closeButton.addEventListener("click", () => {
      preview.classList.add("hidden");
      document.body.classList.remove("markdown-preview-active");
    });
    preview.appendChild(closeButton);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=content.js.map
