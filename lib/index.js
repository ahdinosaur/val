'use strict';

exports.__esModule = true;

exports.default = function (createElement) {
  return function () {
    var lname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
    var attrs = arguments[1];

    lname = ensureLocalName(lname);
    attrs = typeof lname === 'string' ? ensureAttrs(lname, attrs) : attrs;

    for (var _len = arguments.length, chren = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      chren[_key - 2] = arguments[_key];
    }

    return createElement.apply(undefined, [lname, attrs].concat(chren));
  };
};

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _window = window,
    customElements = _window.customElements;

var cacheCtorLocalNames = new Map();
var cacheElementEventHandlers = exports.cacheElementEventHandlers = new WeakMap();

// Override customElements.define() to cache constructor local names.
if (customElements) {
  var define = customElements.define;

  customElements.define = function (name, Ctor) {
    cacheCtorLocalNames.set(Ctor, name);
    return define(name, Ctor);
  };
}

// Applies attributes to the ref element. It doesn't traverse through
// existing attributes and assumes that the supplied object will supply
// all attributes that the applicator should care about, even ones that
// should be removed.
function applyAttrs(e, attrs) {
  Object.keys(attrs || {}).forEach(function (name) {
    var value = attrs[name];
    if (value == null) {
      e.removeAttribute(name);
    } else {
      e.setAttribute(name, value);
    }
  });
}

function applyEvents(e, events) {
  var handlers = cacheElementEventHandlers.get(e) || {};
  cacheElementEventHandlers.set(e, events = events || {});

  // Remove any old listeners that are different - or aren't specified
  // in - the new set.
  Object.keys(handlers).forEach(function (name) {
    if (handlers[name] && handlers[name] !== events[name]) {
      e.removeEventListener(name, handlers[name]);
    }
  });

  // Bind new listeners.
  Object.keys(events || {}).forEach(function (name) {
    if (events[name] !== handlers[name]) {
      e.addEventListener(name, events[name]);
    }
  });
}

// Sets props. Straight up.
function applyProps(e, props) {
  Object.keys(props || {}).forEach(function (name) {
    e[name] = props[name];
  });
}

// Ensures that if a ref was specified that it's called as normal.
function applyRef(e, ref) {
  if (ref) {
    ref(e);
  }
}

// Ensures attrs, events and props are all set as the consumer intended.
function ensureAttrs(name, objs) {
  var _ref = objs || {},
      attrs = _ref.attrs,
      events = _ref.events,
      ref = _ref.ref,
      props = _objectWithoutProperties(_ref, ['attrs', 'events', 'ref']);

  var newRef = ensureRef({ attrs: attrs, events: events, props: props, ref: ref });
  return { ref: newRef };
}

// Ensures a ref is supplied that set each member appropriately and that
// the original ref is called.
function ensureRef(_ref2) {
  var attrs = _ref2.attrs,
      events = _ref2.events,
      props = _ref2.props,
      ref = _ref2.ref;

  return function (e) {
    if (e) {
      applyAttrs(e, attrs);
      applyEvents(e, events);
      applyProps(e, props);
    }
    applyRef(e, ref);
  };
}

// Returns the custom element local name if it exists or the original
// value.
function ensureLocalName(lname) {
  var temp = cacheCtorLocalNames.get(lname);
  return temp || lname;
}

// Provides a function that takes the original createElement that is being
// wrapped. It returns a function that you call like you normally would.
//
// It requires support for:
// - `ref`
