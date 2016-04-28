;(function() {
  'use strict';

  var React;
  var ReactDOM;
  var ModalFormBase;
  if (typeof require !== 'undefined') {
    React = require('react');
    ReactDOM = require('react-dom');
    ModalFormBase = require('./base');
  } else if (typeof window !== 'undefined') {
    React = window.React;
    ReactDOM = window.ReactDOM;
    ModalFormBase = window.ZUIModalFormBase;
  }

  var MEDIA_SELECTOR = 'img, video';

  var POINTER_STYLE = {
    position: 'absolute'
  };

  function StickyModalForm() {
    ModalFormBase.apply(this, arguments);
  }

  StickyModalForm.propTypes = Object.assign({}, ModalFormBase.propTypes, {
    side: React.PropTypes.oneOf([
      'left',
      'right',
      'top',
      'bottom'
    ]),
    pointerStyle: React.PropTypes.object
  });

  StickyModalForm.defaultProps = Object.assign({}, ModalFormBase.defaultProps, {
    side: 'bottom',
    pointerStyle: {}
  });

  StickyModalForm.prototype = Object.assign(Object.create(ModalFormBase.prototype), {
    componentDidMount: function() {
      ModalFormBase.prototype.componentDidMount.apply(this, arguments);
      // TODO: Figure out a way to add a global load event listener.
      Array.prototype.forEach.call(document.querySelectorAll(MEDIA_SELECTOR), function(media) {
        media.addEventListener('load', this.reposition)
      }, this);
    },

    componentWillUnmount: function() {
      ModalFormBase.prototype.componentWillUnmount.apply(this, arguments);
      Array.prototype.forEach.call(document.querySelectorAll(MEDIA_SELECTOR), function(media) {
        media.removeEventListener('load', this.reposition)
      }, this);
    },

    reposition: function(props) {
      ModalFormBase.prototype.reposition.apply(this, arguments);

      if (props === undefined || props instanceof Event) {
        props = this.props;
      }

      var anchor = ReactDOM.findDOMNode(this).parentNode;
      var anchorRect = this.getRectWithMargin(anchor);
      var anchorParent = anchor.parentElement;

      var current_node = anchor
      while(current_node !== document.body && getComputedStyle(current_node).overflow !== 'hidden'){
        current_node = current_node.parentNode;
      }
      var viewport = current_node.getBoundingClientRect();

      var form = this.refs.form;
      form.style.left = '';
      form.style.top = '';
      var formRect = this.getRectWithMargin(form);
      var formPosition = this.getPosition[props.side].call(this, formRect, anchorRect, viewport);
      form.style.left = pageXOffset + formPosition.left + 'px';
      form.style.top = pageYOffset + formPosition.top + 'px';

      var pointer = this.refs.pointer;
      pointer.style.left = '';
      pointer.style.top = '';
      var pointerRect = this.getRectWithMargin(pointer);
      var pointerPosition = this.getPosition[props.side].call(this, pointerRect, anchorRect, viewport);
      pointer.style.left = pageXOffset + pointerPosition.left + 'px';
      pointer.style.top = pageYOffset + pointerPosition.top + 'px';
    },

    getRectWithMargin: function(domNode) {
      var rect = domNode.getBoundingClientRect();
      var style = getComputedStyle(domNode);
      var result = {
        top: rect.top - (parseFloat(style.marginTop) || 0),
        right: rect.right + (parseFloat(style.marginRight) || 0),
        bottom: rect.bottom + (parseFloat(style.marginBottom) || 0),
        left: rect.left - (parseFloat(style.marginLeft) || 0)
      };
      result.width = result.right - result.left,
      result.height = result.bottom - result.top
      return result;
    },

    anchorInsideViewport: function(anchorRect, viewport) {
      var visibleAnchor = {};
      if (anchorRect.left + anchorRect.width > viewport.left + viewport.width){
        visibleAnchor.right = viewport.left + viewport.width;
      } else {
        visibleAnchor.right = anchorRect.left + anchorRect.width
      }
      if (anchorRect.left < viewport.left) {
        visibleAnchor.left = viewport.left;
      } else {
        visibleAnchor.left = anchorRect.left
      }
      if (anchorRect.top < viewport.top){
        visibleAnchor.top = viewport.top;
      } else {
        visibleAnchor.top = anchorRect.top
      }
      if (anchorRect.top + anchorRect.height > viewport.top + viewport.height){
        visibleAnchor.bottom = viewport.top + viewport.height;
      } else {
        visibleAnchor.bottom = anchorRect.top + anchorRect.height
      }
      
      visibleAnchor.width = visibleAnchor.right - visibleAnchor.left
      visibleAnchor.height = visibleAnchor.bottom - visibleAnchor.top 
      return visibleAnchor;
    },

    getHorizontallyCenteredLeft: function(movableRect, anchorRect, viewport) {
      var visibleAnchor = this.anchorInsideViewport(anchorRect, viewport);
      var left = visibleAnchor.left - ((movableRect.width - visibleAnchor.width) / 2);
      left = Math.max(left, -1 * pageXOffset);
      return left;
    },

    getVerticalCenteredTop: function(movableRect, anchorRect, viewport) {
      var visibleAnchor = this.anchorInsideViewport(anchorRect, viewport);
      var top = visibleAnchor.top - ((movableRect.height - visibleAnchor.height) / 2);
      top = Math.max(top, -1 * pageYOffset);
      return top;
    },

    getPosition: {
      left: function(movableRect, anchorRect, viewport) {
        return {
          left: anchorRect.left - movableRect.width,
          top: this.getVerticalCenteredTop.apply(this, arguments)
        }
      },

      right: function(movableRect, anchorRect, viewport) {
        return {
          left: anchorRect.right,
          top: this.getVerticalCenteredTop.apply(this, arguments)
        }
      },

      top: function(movableRect, anchorRect, viewport) {
        return {
          left: this.getHorizontallyCenteredLeft.apply(this, arguments),
          top: anchorRect.top - movableRect.height,
        };
      },

      bottom: function(movableRect, anchorRect, viewport) {
        return {
          left: this.getHorizontallyCenteredLeft.apply(this, arguments),
          top: anchorRect.bottom,
        };
      }
    },

    getUnderlayChildren: function() {
      var pointer = React.createElement('div', {
        ref: 'pointer',
        className: ('modal-form-pointer ' + (this.props.className || '')).trim(),
        style: Object.assign({}, POINTER_STYLE, this.props.pointerStyle)
      });
      var originalChildren = ModalFormBase.prototype.getUnderlayChildren.apply(this, arguments);
      return [].concat(originalChildren, pointer);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = StickyModalForm;
  } else if (typeof window !== 'undefined') {
    window.ZUIStickyModalForm = StickyModalForm;
  }
}());
