when a client is built, due to trash legacy code, we need to edit the client side
first override the index.js
due to the unminified index.js, you can see the webpack structure at the top level of index.js

there are two react prod min jses, you can just search for the @license React or something
ALL OF THIS MAKES BETTER SENSE IF YOU USE VSC TO SEE THE WHOLE FILE (i.e. collapsing functions)
find the first one, find its id, you will see something like:
/***/ <ID>:
/***/ ((__unused_webpack_module, exports) => {

...react react react...

/***/ }),

so then find the *second* react instance, should look like the first one

and make it (e.g. 827 is the 2nd react id -- keep this to whatever it already is dont touch it):
/***/ 827:
/***/ ((__unused_webpack_module, exports) => {

__unused_webpack_module.exports = __webpack_require__(287); // 287 is the index of the other react

/***/ }),
287 is the id from <ID>, just replace it and if you override the index.js file, on reload, you should have a working client