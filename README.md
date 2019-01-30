NOH
===

Prehistoric NO HTML library
---------------

It allows to create the html documents dynamically in pure JavaScript (with almost no html code at all)
It contains a kind of a wrappers to DOM hierarchy.
We have a function for every html element like: {@code table, tr, td, div, span} etc..;
but also we have functions that constructs many specialized and more complex elements that have some dynamic behaviour
implemented (like `menu`, `blind`, `oneof`, `bar`, `logger`, and more).
User can easely use those basic and more advanced elements as a blocks to construct more complex elements.

Please check the files: `noh_example.js` (and `noh_example.html`) for full (but simple) working example.
Main documentation with introduction and examples is available here: [NOH library documentation](noh_doc.html)
Additional API documentation generated with [JSDoc3](http://usejsdoc.org/) will be available here: [NOH API documentation](apidoc/index.html)

NOH library depends on jQuery. TODO: Limit jQuery usage for NOH to be able to work with SVG or other elements (not only html)
[jQuery SVG problems](http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element)

__The simplest example:__

Instead of HTML code like:

    <div id="someid">
        <h2>EXAMPLE</h2>
        <p>
            <h4>Some header</h4>
            Some content
        </p>
        <p>
            <h4>Other header</h4>
            Other content
        </p>
    </div>

We write JS code like:

    noh.div({id:"someid"},
        noh.h2("EXAMPLE"),
        noh.p(noh.h4("Some header"),"Some content"),
        noh.p(noh.h4("Other header"),"Other content")
    );

