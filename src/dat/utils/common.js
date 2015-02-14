/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

define([
], function() {
  
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  // filled by setupDynamicProperty() below
  var dynamicPropertiesByObject = {};

  // called by getPropertyValue() and setPropertyValue() below
  var isPropertyDynamic = function( object, property ) {
    if ( dynamicPropertiesByObject[ object ] !== undefined && dynamicPropertiesByObject[ object ][ property ] === Object( dynamicPropertiesByObject[ object ][ property ] ) ) {
      return true;
    }
    return false;
  };

  return { 
    
    BREAK: {},
  
    extend: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (!this.isUndefined(obj[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
      
    },
    
    defaults: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (this.isUndefined(target[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
    
    },
    
    compose: function() {
      var toCall = ARR_SLICE.call(arguments);
            return function() {
              var args = ARR_SLICE.call(arguments);
              for (var i = toCall.length -1; i >= 0; i--) {
                args = [toCall[i].apply(this, args)];
              }
              return args[0];
            }
    },
    
    each: function(obj, itr, scope) {

      if (!obj) return;

      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) { 
        
        obj.forEach(itr, scope);
        
      } else if (obj.length === obj.length + 0) { // Is number but not NaN
        
        for (var key = 0, l = obj.length; key < l; key++)
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
            return;
            
      } else {

        for (var key in obj) 
          if (itr.call(scope, obj[key], key) === this.BREAK)
            return;
            
      }
            
    },
    
    defer: function(fnc) {
      setTimeout(fnc, 0);
    },
    
    toArray: function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function(obj) {
      return obj === undefined;
    },
    
    isNull: function(obj) {
      return obj === null;
    },
    
    isNaN: function(obj) {
      return obj !== obj;
    },
    
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    
    isObject: function(obj) {
      return obj === Object(obj);
    },
    
    isNumber: function(obj) {
      return obj === obj+0;
    },
    
    isString: function(obj) {
      return obj === obj+'';
    },
    
    isBoolean: function(obj) {
      return obj === false || obj === true;
    },
    
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    },

    // called from GUI.js add()
    // @return {boolean} Whether the property is indeed dynamic (true), or not (false).
    setupDynamicProperty: function( object, property ) {
      if ( dynamicPropertiesByObject[ object ] === undefined ) {
        dynamicPropertiesByObject[ object ] = {};
      }
      if ( dynamicPropertiesByObject[ object ][ property ] === undefined ) {
        var ucProperty = property.charAt(0).toUpperCase() + property.slice(1);
        var getter = object[ "get"+ucProperty ];
        var setter = object[ "set"+ucProperty ];
        if ( typeof getter === "function" || typeof setter === "function" ) {
          dynamicPropertiesByObject[ object ][ property ] = { getter: getter, setter: setter };
          return true;
        }
      }
      return false;
    },

    // called from Controller.prototype.getValue() and controllers/factory.js
    getPropertyValue: function( object, property ) {
      if ( isPropertyDynamic( object, property ) === true ) {
        return dynamicPropertiesByObject[ object ][ property ].getter.call( object );
      }
      else {
        return object[ property ];
      }
    }, 

    // called from the Controller.prototype.setValue() and controllers/factory.js
    setPropertyValue: function( object, property, value ) {
      if ( isPropertyDynamic( object, property ) === true ) {
        dynamicPropertiesByObject[ object ][ property ].setter.call( object, value );
      }
      else {
        object[ property ] = value;
      }
    }
  
  };
    
});