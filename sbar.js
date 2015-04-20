(function ($) {
  'use strict';

  var _pn = 'sbars',
      _hoverClass = 'ovt-bar-hover',
      _draggingClass = 'ovt-bar-dragging';

  $.sbars = function (owner, options) {
    // Start Of: Fields
    var _plugin = this,
        _$owner = owner,
        _yBar = null,
        _xBar = null;
    // Start Of: Fields

    // Start Of: Methods
    var bar = function ($parent, options) {
      //Start Of: Fields
      var _id = '',
          _$bar = null,
          _barSize = null,
          _viewSize = null,
          _scrollSize = null,
          _contentSize = null,
          _ownerSize = null,
          _ownerContentSize = null,
          _ownerScrollStart = null,

          _place = null,

          _onEnter = null,
          _onLeave = null,

          _hoverTimer = null,
          _hover = null,
          _hoverCompleted = null,
          _onHover = null,
          _onHoverCompleted = null,

          _scrollSign = null,
          _onScroll = null,

          _dragStart = null,
          _dragData = {
            dragging: false,
            start: 0,
            scrollStart: 0
          },
          _onDragStart = null,
          _onDragging = null,
          _onDragCompleted = null;
      //End Of: Fields

      //Start Of: Constructor
      (function () {
        var $w = $(window),
            isBody = _$owner.is('body');

        _id = options.id + '-' + options.axis + 'bar';

        _$bar = $('<div></div>').attr('id', _id).addClass('ovt-bar').addClass('ovt-bar-' + options.axis).addClass('ovt-bar-' + options.axis + '-' + options.align);

        _ownerSize = function () {
          return (isBody ? (options.axis === 'y' ? $w.height() : $w.width()) : (options.axis === 'y' ? _$owner.innerHeight() : _$owner.innerWidth()));
        }

        _ownerContentSize = function () {
          return (options.axis === 'y' ? _$owner[0].scrollHeight : _$owner[0].scrollWidth);
        }

        _ownerScrollStart = function (value) {
          if (value === undefined)
            return (isBody ? (options.axis === 'y' ? $w.scrollTop() : $w.scrollLeft()) : (options.axis === 'y' ? _$owner.scrollTop() : _$owner.scrollLeft()));
          else
            (isBody ? (options.axis === 'y' ? $w.scrollTop(value) : $w.scrollLeft(value)) : (options.axis === 'y' ? _$owner.scrollTop(value) : _$owner.scrollLeft(value)));
        }

        _barSize = function () {
          return 0.2 * _ownerSize();
        };

        _viewSize = function () {
          return _ownerSize() - _barSize();
        };

        _scrollSize = function () {
          return _viewSize() / options.wpv;
        };

        _contentSize = function () {
          return _ownerContentSize() - _ownerSize();
        };

        _place = function () {
          var rect = _$owner[0].getBoundingClientRect(),
              pTop = parseInt(_$owner.css('border-top-width'), 10),
              pRight = parseInt(_$owner.css('border-right-width'), 10),
              pBottom = parseInt(_$owner.css('border-bottom-width'), 10),
              pLeft = parseInt(_$owner.css('border-left-width'), 10);

          if (options.align === 'right') {
            _$bar.css({
              top: (_ownerScrollStart() / _contentSize() * _viewSize()) + (isBody ? 0 : rect.top) + pTop + 'px',
              left: rect.right - pRight - _$bar.width() - 2 + 'px',
              height: _barSize() + 'px'
            });
          }
          else if (options.align === 'left') {
            _$bar.css({
              top: (_ownerScrollStart() / _contentSize() * _viewSize()) + (isBody ? 0 : rect.top) + pTop + 'px',
              left: rect.left + pLeft + 2 + 'px',
              height: _barSize() + 'px'
            });
          }
          else if (options.align === 'bottom') {
            _$bar.css({
              left: (_ownerScrollStart() / _contentSize() * _viewSize()) + (isBody ? 0 : rect.left) + pLeft + 'px',
              top: rect.bottom - pBottom - _$bar.height() - 2 + 'px',
              width: _barSize() + 'px'
            });
          }
          else if (options.align === 'top') {
            _$bar.css({
              left: (_ownerScrollStart() / _contentSize() * _viewSize()) + (isBody ? 0 : rect.left) + pLeft + 'px',
              top: rect.top + pTop + 2 + 'px',
              width: _barSize() + 'px'
            });
          }
        };

        _hover = function () {
          clearTimeout(_hoverTimer);
          if ((_ownerContentSize() > _ownerSize()) && (!_$bar.hasClass(_hoverClass))) {
            _$bar.addClass(_hoverClass);
          }
          _hoverTimer = setTimeout(_hoverCompleted, options.hoverTimeout);
        };

        _hoverCompleted = function () {
          _$bar.removeClass(_hoverClass);
        };

        _onHover = function (e) {
          _hover();
        };

        _onHoverCompleted = function () {
          _hoverCompleted();
        };

        _onEnter = function () {
          //console.log(_id + '_onEnter');
          _place();
          _hover();
        };

        _onLeave = function () {
          _hoverCompleted();
        };

        _scrollSign = function (e) {
          if (e.wheelDeltaY !== undefined && e.wheelDeltaY !== 0)    // Chrome
            return e.wheelDeltaY / 120;
            //return e.wheelDeltaY / 1.2;
          else if (e.wheelDelta !== undefined && e.wheelDelta !== 0) // IE, Opera
            return e.wheelDelta / 120;
            //return e.wheelDelta / 1.2;
          else if (e.detail !== undefined && e.detail !== 0)         // Firefox
            return (e.detail * -33.33 > 0 ? 1 : -1);
          //return e.detail * -33.33;
        };

        _onScroll = function (e) {
          if (e.ctrlKey || (options.axis === 'y' && e.shiftKey) || (options.axis === 'x' && !e.shiftKey))
            return;
          e.preventDefault();
          e.stopPropagation();
          _hover();
          _ownerScrollStart(_ownerScrollStart() - (_scrollSign(e.originalEvent) * _scrollSize()));
          _place();
        };

        _dragStart = function (e) {
          return (options.axis === 'y' ? e.clientY : e.clientX);
        }

        _onDragStart = function (e) {
          e.preventDefault();
          _dragData.dragging = true;
          _dragData.start = _dragStart(e);
          _dragData.scrollStart = _ownerScrollStart();
        };

        _onDragging = function (e) {
          //console.log(_id + '_onDragging_' + Date.now());
          if (_dragData.dragging === true) {
            _hover();
            _$bar.addClass(_draggingClass);
            _ownerScrollStart(_dragData.scrollStart + ((_dragStart(e) - _dragData.start) * (_ownerContentSize() / _ownerSize())));
            _place();
          }
        };

        _onDragCompleted = function () {
          _dragData.dragging = false;
          _$bar.removeClass(_draggingClass);
        };

        $parent.append(_$bar);

        (isBody ? $('html') : _$owner).on('mouseenter.' + _id, _onEnter).on('mouseleave.' + _id, _onLeave).on('mousemove.' + _id, _onHover).on('mousewheel.' + _id + ' DOMMouseScroll.' + _id, _onScroll);
        _$bar.on('mousewheel.' + _id + ' DOMMouseScroll.' + _id, _onScroll).on('mousedown.' + _id, _onDragStart);
        $w.on('mousemove.' + _id, _onDragging).on('mouseup.' + _id, _onDragCompleted);
      }());
      //End Of: Constructor

      //Start Of: Public
      return _plugin;
      //End Of: Public
    };
    // Start Of: Methods

    // Start Of: Constructor
    (function (options) {
      var parentId = '_uiOVTBarParent',
          $parent = $('#' + parentId);
      if ($parent.length === 0) {
        $parent = $('<div></div>').attr('id', parentId).addClass('ovt-bar-parent');
        $('body').append($parent);
      }

      var ownerId = (_$owner.is('body') ? 'body' : _$owner.attr('id'));
      if (ownerId == 'undefined')
        ownerId = Date.now().toString();
      _$owner.addClass('ovt-bar-owner');

      options = $.extend({
        dock: 'yx',
        ybar: {
          axis: 'y',
          align: 'right',
          wpv: 4,
          hoverTimeout: 750
        },
        xbar: {
          axis: 'x',
          align: 'bottom',
          wpv: 4,
          hoverTimeout: 750
        }
      }, options);

      if (options.dock.indexOf('y') != -1) {
        options.ybar.id = ownerId;
        _yBar = bar($parent, options.ybar);
      }
      if (options.dock.indexOf('x') != -1) {
        options.xbar.id = ownerId;
        _xBar = bar($parent, options.xbar);
      }
    }(options));
    // End Of: Constructor

    // Start Of: Public
    // End Of: Public
  };

  $.fn.sbar = function (options) {
    options = (options === undefined ? {} : options);
    return this.each(function () {
      if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|ARM|Touch|Opera Mini/i.test(navigator.userAgent)) {
        var owner = $(this);
        if (typeof (options) === 'object') {
          if (owner.data(_pn) === undefined) {
            owner.data(_pn, new $.sbars(owner, options));
          }
        }
        else if (owner.data(_pn)[options]) {
          owner.data(_pn)[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
          $.error('Method ' + options + ' does not exist in $.' + _pn);
        }
      }
    });
  };

}(jQuery));
