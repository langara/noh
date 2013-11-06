// [ vim: set tabstop=2 shiftwidth=2 expandtab : ] 

/**                                           
 * @author marek.langiewicz@gmail.com (Marek Langiewicz)
 * @fileoverview
 * <p>
 * This is the <strong>NOH</strong> (NO HTML) library.
 * </p>
 * <p>
 * It allows to create the html documents dynamically in pure JavaScript (with almost no html code at all)
 * It contains a kind of a wrappers to DOM hierarchy.
 * We have a function for every html element like: {@code table, tr, td, div, span} etc..;
 * but also we have functions that constructs many specialized and more complex elements that have some dynamic behaviour
 * implemented (like {@code menu, oneof, bar}, and more).
 * TODO: implement some srccode, some logger and some tester.
 * </p>
 * <p>
 * Please check the files: {@link noh_example.js} (and {@link example.html}) for full (but simple) working example.
 * Main documentation with introduction and examples is available here: {@link index.html|NOH library documentation}
 * Additional API documentation generated with {@link http://usejsdoc.org/|jsdoc3} is available here: {@link apidoc/index.html|NOH API documentation} TODO
 * </p>
 * <p>
 * NOH library depends on jQuery. TODO: Limit jQuery usage for NOH to be able to work with SVG or other elements (not only html)
 * @see http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
 * </p>
 * @licence Released under the MIT license.
 */

/*
 * Example:
 *
 * Instead of HTML code like:
 * <div id="someid">
 *     <h2>EXAMPLE</h2>
 *     <p>
 *         <h4>Some header</h4>
 *         Some content
 *     </p>
 *     <p>
 *         <h4>Other header</h4>
 *         Other content
 *     </p>
 * </div>
 *
 * We write JS code like:
 * div({id:"someid"},
 *     h2("EXAMPLE"),
 *     p(h4("Some header"),"Some content"),
 *     p(h4("Other header"),"Other content")
 * )
 */


/**
 * @namespace Main NOH library namespace.
 */
noh = {};




/** @typedef {{smooth:string|undefined, pollute:boolean|undefined}} */
noh.Options;

/** @typedef {Object.<string, string>} */
noh.Attrs;

/** @typedef {Array.<noh.Node>} */
noh.Nodes;

/** @typedef {(noh.Attrs|noh.Node|string|Array.<noh.AttrsAndNodes>|undefined)} */
noh.AttrsAndNodes;
/** @typedef {(noh.Attrs|noh.Node|string|Array.<noh.AttrsAndNodes2>|Arguments.<AttrsAndNodes2>|undefined)} */
noh.AttrsAndNodes2; // FIXME: Future version. We will try to enable it later (@see noh.organize2)

/** @typedef {{attrs: noh.Attrs, nodes:noh.Nodes}} */
noh.RecAttrsAndNodes;



/**
 * @param {string=} opt_msg
 * @constructor
 * @extends {Error}
 */
noh.NotImplementedError = function(opt_msg) { if(opt_msg) this.message = opt_msg; };
noh.NotImplementedError.prototype = new Error("Not implemented");

/**
 * @param {string=} opt_msg
 * @constructor
 * @extends {NotImplementedError}
 */
noh.NotSupportedError = function(opt_msg) { if(opt_msg) this.message = opt_msg; };
noh.NotSupportedError.prototype = new noh.NotImplementedError("Operation not supported");


/**
 * @param {string=} opt_msg
 * @constructor
 * @extends {Error}
 * TODO: do we need this now? kind of wired to duplicate Node hierarchy to Error hierarchy..
 */
noh.NodeError = function(opt_msg) { if(opt_msg) this.message = opt_msg; };
noh.NodeError.prototype = new Error("Node error");

/**
 * @param {string=} opt_msg
 * @constructor
 * @extends {noh.NodeError}
 * TODO: do we need this now? kind of wired to duplicate Node hierarchy to Error hierarchy..
 */
noh.ElementError = function(opt_msg) { if(opt_msg) this.message = opt_msg; };
noh.ElementError.prototype = new noh.NodeError("Element error");








/**
 * Default NOH library settings. Options can be overridden by {@link:noh.init} function parameter
 * @type {noh.Options}
 */
noh.options = { 
  /** will we pollute global namespace with noh functions; if false (default), everything will be available only under the {@link:noh} namespace */
  pollute: false
};


/**
 * The list of HTML tags (used for automatic helper function generation) (read only)
 * @const
 */
noh.TAGS = [
  //TODO: this is too big - remove unwanted tags later (we want probably only those inside body)..
  //TODO: add SVG related tags (maybe MathML related tags too??) (but maybe in another file(s))
  "html", "head", "body", "script", "meta", "title", "link",
  "div", "p", "span", "a", "img", "br", "hr", "em", "i", "strong",
  "table", "tr", "th", "td", "thead", "tbody", "tfoot", "colgroup", "col",
  "ul", "ol", "li", 
  "dl", "dt", "dd",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "form", "fieldset", "input", "textarea", "label", "select", "option", "b", "pre", "code", "i", "button"
];


/**
 * This function has to be called before any other NOH function. It has to be called exactly once.
 * @param {!noh.Options=} opt_options user can provide here values for some global NOH options to change it behaviour (optional)
 */
noh.init = function(opt_options) {
  if(noh.init.done_)
    throw new NotSupportedError("The init function should be called only once!");

  $.extend(noh.options, opt_options);                           

  noh.text = function(text) { return new noh.Text(text); };

  /**
   * @param {string} tag
   * @return {function(...noh.AttrsAndNodes):noh.Element}
   */
  var genTag = function(tag) {
    return function(var_args) {
      return new noh.Element(tag, arguments);
    };
  };

  for(var i = 0; i < noh.TAGS.length; ++i)
    noh[noh.TAGS[i]] = genTag(noh.TAGS[i]); //TODO: maybe just type all possible functions by hand - to be able to annotate it all with type comments for closure compiler checking and optimisation

  if(noh.options.pollute)
    for(var i = 0; i < noh.TAGS.length; ++i)
      window[noh.TAGS[i]] = noh[noh.TAGS[i]];

  noh.init.done_ = true;
};




/**
 * This helper function is used to parse the arguments in a clever way.
 * We want to get an object representing the attributes of created Element (like {@code {href:"http://foo.com", "class":"some_css_class"..}})
 * and a list of children of new created element, where every child is a Node.
 * But we want the user to have the ability to provide this information in many different ways.
 * So this function have to guess for example:
 * <ul>
 * <li> which arguments represents the Element attributes </li>
 * <li> which are not Nodes but simple strings and have to be wrapped in Text nodes </li>
 * <li> which are single children, and which is a whole list of children (All nested Array like objects are just flattened) </li>
 * <li> which we have to ignore (user can pass some undefined arguments and we will ignore them - not always the last ones) </li>
 * </ul>
 * Pretty examples of using this flexibility should be presented in the main documentation: {@link index.html|NOH Library documentation}
 * @param {!Arguments.<noh.AttrsAndNodes>} args List of arguments parsed as an attributes and children Nodes. TODO: check this Arguments.<..> type..
 * @param {number=} opt_ignore Number of elements to ignore at the beginning of args list. (default is 0)
 * @param {noh.RecAttrsAndNodes=} opt_result A result object to be extended.
 * @return {noh.RecAttrsAndNodes} Attributes and children extracted from args.
 */
noh.organize = function(args, opt_ignore, opt_result) {

  var result = opt_result ? opt_result : {
    attrs: {},
    nodes: []
  };

  if(opt_ignore === undefined)
    opt_ignore = 0;

  for(var i = opt_ignore; i < args.length; ++i) {
    if(args[i] instanceof noh.Node)
      result.nodes.push(args[i]);
    else if(typeof args[i] === "string")
      result.nodes.push(noh.text(args[i]));
    else if(noh.isArrayLike(args[i]))
      noh.organize(args[i], 0, result);
    else if(args[i] instanceof Object)
      $.extend(result.attrs, args[i]);
    else if(args[i] !== undefined)
      throw new TypeError("Unknown argument type: " + typeof args[i] + " value: " + String(args[i]));
  }

  return result;
};

/**
 * FIXME: Second version. Could be better, but first we have to check first version, and then try to switch
 * @param {noh.AttrsAndNodes2} args Arguments parsed as an attributes nodes.
 * @param {number=} opt_ignore Number of elements to ignore at the beginning of args list. It is important only if args is an array-like object (default is 0)
 * @param {noh.RecAttrsAndNodes=} opt_result A result object to be extended.
 * @return {noh.RecAttrsAndNodes} Attributes and children extracted from args.
 */
noh.organize2 = function(args, opt_ignore, opt_result) {

  var result = opt_result ? opt_result : {
    attrs: {},
    nodes: []
  };

  if(args instanceof noh.Node)
    result.nodes.push(args);
  else if(typeof args === "string")
    result.nodes.push(noh.text(args));
  else if(noh.isArrayLike(args))
    for(var i = opt_ignore === undefined ? 0 : opt_ignore; i < args.length; ++i)
      noh.organize2(args[i], 0, result);
  else if(args instanceof Object)
    $.extend(result.attrs, args);
  else if((args === undefined)||(args === null))
    ;
  else
    throw new TypeError("Unknown argument type: " + typeof args + " value: " + String(args));

  return result;
};

/**
 * Inserts one array elements to the other array (at the end).
 * @param {Array} arrIn The source array.
 * @param {Array} arrOut The destination array.
 * @return {number} New length of the destination array.
 * TODO: do we need it now at all?
 */
noh.pushArray = function(arrIn, arrOut) {
  return arrOut.push.apply(arrOut, arrIn);
};


/**
 * @return {number} index of first occurrence of val in arr; or -1 if not found.
 * @param {*} val A value to find in arr.
 * @param {!Array} arr Array to find the val in.
 * TODO: do we need it now at all?
 */
noh.indexOf = function(val, arr) {
  for(var x = 0; x < arr.length; ++x)
    if(val == arr[x])
      return x;
  return -1;
};



/**
 * Converts an array to an object.
 * @param {!Array.<string>} records Array of object property names in the same order as values in arr parameter.
 * @param {Array} arr array (or null).
 * @return {Object} An object that gets it's property names from records parameter, and values from arr parameter.
 * If arr is null, the returned object will be also null.
 * TODO: do we need it now at all?
 */
noh.cnvArrayToObject = function(records, arr) {
  if(arr === null) return null;
  var obj = {};
  for(var x = 0; x < records.length; ++x)
    obj[records[x]] = arr[x];
  return obj;
};

/**
 * Symetric function to the one above.
 * Also accepts null input (and returns null in that case).
 * @param {!Array.<string>} records Array of object property names that defines the order to put the obj values to returned array.
 * @param {Object} obj An input object that provides values to return in array.
 * @return {Array} An array of obj values in order defined by records parameter.
 * TODO: do we need it now at all?
 */
noh.cnvObjectToArray = function(records, obj) {
  if(obj === null) return null;
  var arr = [];
  for(var x = 0; x < records.length; ++x)
    arr.push(obj[records[x]]);
  return arr;
};

/**
 * Checks if the provided object is an array or can be used as an array.
 * @param {Object} arr An object to test.
 * @return {boolean} True if arr is an array like object
 */
noh.isArrayLike = function(arr) {
  var hasOwn = Object.prototype.hasOwnProperty;
  var len;
  return arr != null && ( //Here the != is intentional (we don't want to use !==)
    arr instanceof jQuery ||
    typeof(len = arr.length) === "number" && (
      (
        len >= 0 && hasOwn.call(arr, 0) &&
        hasOwn.call(arr, len - 1)
      ) || jQuery.isArray(arr)
    )
  );
};



/**
 * A base constructor for Node objects. This is base "class" for all UI objects created by NOH.
 * @constructor
 */
noh.Node = function() {

  /** Number of children of this Node. Users can not change this directly!. */
  this.length = 0;

  /**
   * @type {noh.Node}
   */
  this.parent = null;

  /**
   * @type {noh.Node}
   * the dom property have to be overriden in derivatives!
   */
  this.dom = null;

  this.$ = null;
};


/**
 * Adds a new child node at the end.
 * @param {noh.Node} node A node to add as a last child of our node.
 */
noh.Node.prototype.add = function(node) {
  node.attachToDOM(this.dom);
  node.parent = this;
  Array.prototype.push.call(this, node);
};

/**
 * Removes last child node.
 */
noh.Node.prototype.rem = function() {
  var node = Array.prototype.pop.call(this);
  node.parent = null;
  node.detachFromDOM(this.dom);
};


/**
 * This dummy method is only for console to display our Node as an array..
 * @see http://stackoverflow.com/questions/6599071/array-like-objects-in-javascript
 * TODO: implement real splice with callback for inserting and removing DOM elements;
 * then implement other array-like methods using splice. (like: pop, push, shift, unshift) 
 */
noh.Node.prototype.splice = function() { throw new NotSupportedError(); };


/**
 * Attaches a node to given DOM root element
 * @param {!Node} root
 */
noh.Node.prototype.attachToDOM = function(root) {
  root.appendChild(this.dom);
};

/**
 * Detaches a node from given DOM root element
 * @param {!Node} root
 */
noh.Node.prototype.detachFromDOM = function(root) {
  root.removeChild(this.dom);
};



/**
 * @param {string} text
 * @constructor
 * @extends {noh.Node}
 */
noh.Text = function(text) {
  this.text = text;
  noh.Node.call(this);
  this.dom = document.createTextNode(text);
  this.$ = $(this.dom);
};

noh.Text.prototype = new noh.Node();



/**
 * A base constructor for the DOM elements (Besides HTML elements it can be SVG or MathMl elements).
 * @param {string} tag Tag name like: div or img or table etc..
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @see noh.organize for more detailed explanation about attributes and children parameters
 * @constructor
 * @extends {noh.Node}
 */
noh.Element = function(tag, var_args) {
  this.tag = tag;

  noh.Node.call(this);
    
  this.dom = document.createElement(tag);
  this.$ = $(this.dom);

  var an = noh.organize(arguments, 1);

  for(var a in an.attrs)
    this.attr(a, an.attrs[a]);

  for(var i = 0; i < an.nodes.length; ++i)
    this.add(an.nodes[i]);
};

noh.Element.prototype = new noh.Node();

/**
 * Gets or sets element's attribute
 * @param {string} name
 * @param {string=} opt_value
 * @return {string=}
 */
noh.Element.prototype.attr = function(name, opt_value) {
  if(opt_value === undefined)
    return this.$.attr(name);
  else
    this.$.attr(name, opt_value);
};






/* 
 * *************************************************************
 * Core code ends here.
 * The rest of this file contains some basic but useful examples
 * *************************************************************
 */






/**
 * Just a shortcut for a table with one row only
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @see noh.organize for more detailed explanation about attributes and children parameters
 * @return {noh.Element} A new table Node with one row and given attributes and children.
 */
noh.table1r = function(var_args) {
  var an = noh.organize(arguments);
  return noh.table(an.attrs, noh.tbody(noh.tr(an.nodes)));
};



/**
 * A horizontal bar of any given elemens that uses table with one row (with attribute "class" set to "bar" by default)
 * Yes, I know that using tables to force layout is a bad practice :-)
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes.
 */
noh.tablebar = function(var_args) {
    var an = noh.organize(arguments);
    var cells = [];
    for(var x = 0; x < an.children.length; ++x)
        cells.push(j.td(an.nodes[x]));
    return noh.table1r({"class":"noh bar"}, an.attrs, cells);
};
// TODO: better bars: bar(horizontal/vertical, ...); hbar = bar(horizontal, ...); vbar = ... And no tables! (but css)









/**
 * Generates the pre element prepared for SyntaxHighlighter plugin
 * @see http://alexgorbatchev.com/SyntaxHighlighter/
 * @param {string} brush The SyntaxHighlighter brush to use (like "js" fo JavaScript)
 * @param {string} code The code to display.
 * @return {noh.Element} A new pre Element prepared to colorize by SyntaxHighlighter plugin.
 */
noh.syntaxhl = function(brush, code) {
  return noh.pre({"class":"brush: " + brush + "; toolbar: false"}, code);
};

/**
 * This Element creates the "pre" html element with a source code of given function inside.
 * The "pre" element CSS "class" is set to match the SyntaxHighlighter requirements and
 * can be easly coloured using that plugin.
 * @param {function()} afunction The function which source code should be rendered.
 * @return {noh.Element} A new srccode Element.
 * @see {@link http://alexgorbatchev.com/SyntaxHighlighter|SyntaxHighlighter} The highlighting plugin.
 * @see index.html Examples of using this element and SyntaxHighlighter plugin.
 */
noh.srccode = function(afunction) {
  return noh.syntaxhl("js", afunction.toString());
};



/**
 * An object that can show or hide it's content by rolling it down (hidden->visible) or up (visible->hidden)
 * @interface
 */
noh.IBlind = function() {};

/**
 * Returns if the content is visible (down).
 * @return {boolean}
 */
noh.IBlind.prototype.down = function() {};

/**
 * Rolls the blind down (to show it content) or up (hiding the content)
 * @param {boolean} down
 */
noh.IBlind.prototype.roll = function(down) {};



/**
 * An object that can show or hide it's content by rolling it down (hidden->visible) or up (visible->hidden)
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @see noh.organize for more detailed explanation about attributes and children parameters
 * @constructor
 * @extends {noh.Element}
 * @implements {noh.IBlind}
 * TODO: it can change its size smoothly so it should be inside some absolutely positioned block,
 * to avoid forcing browser to relayout the whole page too much; TODO: warnings in documentation
 */
noh.Blind = function(var_args) {
  var smooth = noh.options.smooth ? ' ' + noh.options.smooth : '';
  var content = noh.div({class:'noh blind content smooth' + smooth}, arguments);
  noh.Element.call(this, "div", {class: 'noh blind smooth' + smooth}, content);
  this.content_ = content;
  this.roll(false);
  var this_ = this;
  this.$.show(function() {this_.roll(this_.down());});
};

noh.Blind.prototype = new noh.Element("div");

/**
 * Returns if the content is visible (down).
 * @return {boolean}
 */
noh.Blind.prototype.down = function() { return this.down_; };

/**
 * Rolls the blind down (to show it content) or up (hiding the content)
 * @param {boolean} down
 */
noh.Blind.prototype.roll = function(down) {
  var $blind = this.$;
  var $content = $(this.content_.dom);
  var w = $content.width();
  var h = $content.height();
  $content.css("clip", "rect(0px " + w + "px " + (down ? h : 0) + "px 0px");
  $content.css("opacity", down ? '1' : '0');
  $blind.width(w);
  $blind.height(down ? h : 0);
  this.down_ = down;
};

/**
 * TODO: description
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @return {!noh.Blind}
 */
noh.blind = function(var_args) {
  return new noh.Blind(arguments);
};




/**
 * An object that contains a collection of elements and always one of them can be "selected" (or none)
 * @interface
 */
noh.IOneOf = function() {};

/**
 * Returns which element is selected (or -1 if none is selected)
 * @return {number}
 */
noh.IOneOf.prototype.selected = function() {};

/**
 * Selects an element with given index (-1 means: do not select any element)
 * @param {number} idx
 */
noh.IOneOf.prototype.select = function(idx) {};





/**
 * Element that displays one of his children at a time (or none).
 * (the children are placed one below another and then their visibility is changed respectively)
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @see noh.organize for more detailed explanation about attributes and children parameters
 * @constructor
 * @extends {noh.Element}
 * @implements {noh.IOneOf}
 * TODO: it can change its size smoothly so it should be inside some absolutely positioned block,
 * to avoid forcing browser to relayout the whole page too much; TODO: warnings in documentation
 */
noh.OneOf = function(var_args) {
  var an = noh.organize(arguments);
  for(var i = 0; i < an.nodes.length; ++i) {
    var blind = noh.blind(an.nodes[i]);
    an.nodes[i] = blind;
    blind.oneOfIdx_ = i;
  }
  noh.Element.call(this, "div", {class: 'noh oneof'}, an.attrs, an.nodes);

  this.selected_ = -1; 
};

noh.OneOf.prototype = new noh.Element("div");

/**
 * @return {number}
 */
noh.OneOf.prototype.selected = function() { return this.selected_; };

/**
 * Displays given child and hides all the others.
 * @param {(number|Node)} idx Number of child to display or the child Node itself.
 * (-1 or null means: do not display any child)
 */
noh.OneOf.prototype.select = function(idx) {
  if(idx instanceof noh.Node)
    idx = idx.oneOfIdx_;
  else if(idx === null)
    idx = -1;
  var l = this.length;
  if((idx < -1) || (idx >= l))
    idx = -1;

  if(this.selected_ != -1)
    this[this.selected_].roll(false);

  if(idx != -1)
    this[idx].roll(true);

  this.selected_ = idx;
};

/** @private */
noh.OneOf.prototype.selectModulo_ = function(idx) {
  this.select(idx < 0 ? this.length-1 : idx % this.length);
};

/**
 * Changes the displayed child to the next one.
 */
noh.OneOf.prototype.next = function() { this.selectModulo_(this.selected() + 1); };

/**
 * Changes the displayed child to the previous one.
 */
noh.OneOf.prototype.prev = function() { this.selectModulo_(this.selected() - 1); };


/**
 * TODO: description
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @return {!noh.OneOf}
 */
noh.oneof = function(var_args) {
  return new noh.OneOf(arguments);
};



/**
 * This Element displays the "details..." button, and displays the content only after user clicks it.
 * Then the user can hide the content again by clicking the button again.
 * @param {...noh.AttrsAndNodes} var_args Attributes and children nodes
 * @return {noh.Element} 
 */
noh.details = function(var_args) {
  var content = noh.div({class: "noh details content"}, arguments);
  var blind = noh.blind(content);
  var button = noh.button({class: "noh details button", title: "show/hide details"}, "details...");
  button.$.click(function() {blind.roll(!blind.down());});
  return noh.div({class: "noh details"}, noh.div(button), noh.div(blind));
};




/**
 * An object that can be in two logical states. Selected or not selected.
 * @interface
 */
noh.ISelectable = function() {};

/**
 * Checks if the object is selected or not.
 * @return {boolean} If the object is selected.
 */
noh.ISelectable.prototype.selected = function() {};

/**
 * Selects/deselects the object. (depending on this.selected())
 */
noh.ISelectable.prototype.toggle = function() {};



/** 
 * This Element is prepared to be used as a menu item. It can be selected or not.
 * It will have css classes: "noh", "menu" and "item", (and "selected" if it is in selected state).
 * It changes its state when clicked (selected/not selected) (by calling the toggle method)
 * The toggle method can be overriden to add some functionality when the state is changing.
 * @param {noh.Node|string} content Usually it is just a text to display, but it can be any noh.Node.
 * @constructor               
 * @extends {noh.Element}
 * @implements {noh.ISelectable}
 */
noh.MenuItem = function(content) {
  noh.Element.call(this, "div", {"class": "noh menu item"}, content);
  var this_ = this;
  this.$.click(function() { this_.toggle(); return false; });
}

noh.MenuItem.prototype = new noh.Element("div");

/**
 * This method should be overriden if we want to add some new fuctionality when the state is changing;
 * but you should call the original toggle anyway
 */
noh.MenuItem.prototype.toggle = function() { this.$.toggleClass("selected"); };

noh.MenuItem.prototype.selected = function() { return this.$.hasClass("selected"); };

/**
 * @param {noh.Node|string} content Usually it is just a text to display, but it can be any noh.Node.
 * @return {noh.MenuItem}
 */
noh.menuitem = function(content) { return new noh.MenuItem(content); };

/**
 * A menuitem with additional payload that is shown only when the menuitem is selected
 * @param {noh.ISelectable} item A main part - this is visible all the time
 * @param {noh.Node|string} payload Second part - this is visible only when item is selected. It shows itself below the main part.
 * @return {noh.ISelectable} A menuitem with payload attached.
 * TODO: change to new class BigMenuItem - for better performance and consistency
 */
noh.bigmenuitem = function(item, payload) {
  var oneof = noh.oneof(payload)
  var bigmenuitem = noh.div(
    noh.div(item),
    noh.div(oneof)
  );
  item.toggle_orig_ = item.toggle;
  item.toggle = function() { bigmenuitem.toggle(); };
  bigmenuitem.toggle = function() {
    item.toggle_orig_();  
    oneof.select(this.selected() ? 0 : -1);
  };
  bigmenuitem.selected = function() { return item.selected(); };

  return bigmenuitem;
};

//TODO: test: wrap some menu item with bigmenuitem a few times and check if all payloads are synced
//like: noh.bigmenuitem(noh.bigmenuitem(noh.menuitem("some item"), payload1), payload2)




/**
 * @extends {noh.Element}
 * @implements {noh.IOneOf}
 * @param {...noh.AttrsAndNodes} var_args Attributes and children. Children should be proper menuitems (implement:ISelectable extend:Element)
 */
noh.Menu = function(var_args) {

  var an = noh.organize(arguments);

  noh.Element.call(this, "div", an.attrs, an.nodes);

  this.items_ = an.nodes;

  for(var i = 0; i < this.items_.length; ++i) {
    var item = this.items[i];
    if(item.selected())
      item.toggle();
    item.menu_ = this;
    item.menuIdx_ = i;
    item.toggle_orig_ = item.toggle;
    item.toggle = function() {
      this.menu_.select(this.selected() ? -1 : this.menuIdx_);
    };
  }

  this.selected_ = -1;
};

noh.Menu.prototype = new noh.Element("div");

noh.Menu.prototype.selected = function() { return this.selected_; };

noh.Menu.prototype.select = function(idx) {

  if(this.selected_ != -1)
    this.items_[selected_].toggle_orig_(); // deselects old item

  //TODO: check the idx value in DEBUG mode (check the @define in closure compiler) (make sure it is removed completely in release mode)

  this.selected_ = idx;

  if(idx == -1)
    return;

  this.items_[idx].toggle_orig_(); //selects new item
};


/**
 * TODO: description
 * @param {...noh.AttrsAndNodes} var_args Attributes and children. Children should be proper menuitems (implement:ISelectable extend:Element)
 * @return {!noh.Menu}
 */
noh.menu = function(var_args) {
  return new noh.Menu(arguments);
};



/**
 * A menuitem with additional menu that is shown only when the menuitem is selected
 * @param {noh.ISelectable} item A main part - this is visible all the time
 * @param {noh.Menu} menu Second part - this menu is visible only when item is selected. It shows itself below the main part.
 * @return {noh.ISelectable} A menuitem with menu attached.
 */
noh.submenu = function(item, menu) {
  var submenu = bigmenuitem(item, menu);
  submenu.menu = menu;
  return submenu;
};








/**
 * @interface
 * TODO
 */
noh.IConsole = function() {};





/**
 * @param {noh.Attrs=} opt_attrs Additional attributes of created logger
 * @implements {IConsole}
 */
noh.llogger = function(opt_attrs) {
    var node = noh.text($.extend({style: "font-size: smaller;"}, opt_attrs));
    return noh.h3("TODO");
};

noh.plogger = function() { return noh.h3("TODO"); };




