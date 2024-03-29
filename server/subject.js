'use strict';

function Subject() {
  this.events = {};
}

Subject.prototype.addObserver = function(observer, event) {
  this.events[event] = (this.events[event] || []).concat([observer]);
};

Subject.prototype.removeObserver = function(observer, event) {
  if (this.events[event]) {
    this.events[event] = this.events[event].filter((o) => {
      if (o !== observer) {
        return o;
      }
    });
  }
};

Subject.prototype.notify = function(entity, event) {
  if (this.events[event]) {
    this.events[event].forEach((o) => {
      o.notify(entity, event);
    }, this);
  }
};

module.exports = Subject;
