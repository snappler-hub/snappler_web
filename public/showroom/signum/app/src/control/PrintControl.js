/**
 * Created by snappler on 09/09/14.
 */
PrintControl = L.Control.extend( {
  options: {
    position: 'topleft'
  },

  onAdd: function ( map ) {
    var self = this;
    this.controlDiv = L.DomUtil.create( 'div', 'leaflet-control-print ' );

    L.DomEvent
      .addListener( this.controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( this.controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( this.controlDiv, 'click', function () {
        var ll=L.latLng(Map.getInstance().getBounds().getCenter().lat-(Math.pow(10, -4)), Map.getInstance().getBounds().getCenter().lng);
        Map.getInstance().setView( ll ).on('dragend', self.setupPrint, self);
        Map.getInstance()._currentBaseLayer.setOpacity( 0.5 );
        self.setupPrint();
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-print-interior', this.controlDiv );
    controlUI.title = 'Print';
    return this.controlDiv;
  },

  setupPrint:function(){
    var self = this;

    this.removePrintComponents();
    this.hideControls();

    Map.getInstance().dragging.disable();
    Map.getInstance().touchZoom.disable();
    Map.getInstance().doubleClickZoom.disable();
    Map.getInstance().scrollWheelZoom.disable();

    var parent= $('#map').find('.leaflet-map-pane .leaflet-tile-pane');

    this._overlay=$('<div/>').addClass('leaflet-layer print-overlay')
      .css('transform',' translate(0px, 0px)' )

      .css('width', $('#map').width()+'px' )
      .css('height',$('#map').height()+'px' )
      .css('z-index','2' )
//      .css('opacity','0.5' )
//      .css('background-color','black' )
      .appendTo(parent);

    var imgs=$('#map').find('.leaflet-map-pane .leaflet-tile-pane .leaflet-tile-container img')
      .sort(function(i1,i2){
        var p1 = $(i1).position();
        var p2 = $(i2).position();

        switch (true){
          case((p1.top<p2.top)): return -1; break;
          case((p1.top>p2.top)): return 1; break;
          default:
            return (p1.left-p2.left);
            break;
        }
      });

    var first=$(imgs).first();
    var last=$(imgs).last();

    var viewport_w=$('#map').width()-(first.position().left + first.width())-($('#map').width() - last.position().left);
    var viewport_h=$('#map').height()-(first.position().top + first.height())-($('#map').height() - last.position().top);

    this._viewport = $( '<div/>' ).addClass( 'resizable print-viewport' );
    this._viewport.resizable( {
      handles: "se",

      maxWidth: $('#map').width(),
      maxHeight: $('#map').height(),
      grid: 256,
      helper: "ui-resizable-helper",
      stop: function ( event, ui ) {
        var origin={
          left:ui.position.left,
          top:ui.position.top
        };

        var end={
          left: origin.left+ui.size.width,
          top: origin.top+ui.size.height
        };


        var i_filtered=$(imgs).filter(function(i,img){
          var p = $(img).position();

          var origin_in_top=((p.top+1>=origin.top)&&(p.top+1<=end.top));
          var origin_in_left=((p.left+1>=origin.left)&&(p.left+1<=end.left));

          return (origin_in_left && origin_in_top);
        });

        $(self._overlay ).find('img' ).remove();

        self._overlay.css('top',self._viewport.position().top+'px' )
          .css('left',self._viewport.position().left+'px')
          .css('width', (ui.size.width+5)+'px')
          .css('height', (ui.size.height+5)+'px');

        i_filtered.each(function(i,img){
          var image = new Image(256, 256);
          image.src = $(img).attr('src');

          $(image).appendTo(self._overlay);
        })
      }
    } )
      .css( {'position': 'absolute',
        'z-index': '2147483647',
        'width': viewport_w,
        'height': viewport_h,
        "left": (first.position().left + first.width()),
        "top": (first.position().top + first.height())
      } )
      .insertBefore( this._overlay );
  },
  hideControls:function(){
    $(Map.getInstance().controls[Map.CTRL_LINE_AT]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_LINE_MT]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_LINE_BT]._container ).hide();
//    $(Map.getInstance().controls[Map.CTRL_CURSOR]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_POLYGON]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_SIDEBAR]._container ).hide();
    $(Map.getInstance().controls[Map.CTRL_PRINT]._container ).hide();

    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].hide();
    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();
  },
  showControls:function(){
    this.removePrintComponents();
    $(Map.getInstance().controls[Map.CTRL_LINE_AT]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_LINE_MT]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_LINE_BT]._container ).show();
//    $(Map.getInstance().controls[Map.CTRL_CURSOR]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_POLYGON]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_SIDEBAR]._container ).show();
    $(Map.getInstance().controls[Map.CTRL_PRINT]._container ).show();

    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].show();


    Map.getInstance().dragging.enable();
    Map.getInstance().touchZoom.enable();
    Map.getInstance().doubleClickZoom.enable();
    Map.getInstance().scrollWheelZoom.enable();

    Map.getInstance().off('dragend', this.setupPrint, this);

    Map.getInstance()._currentBaseLayer.setOpacity( 1 );
  },

  removePrintComponents:function(){
    if(this._viewport!==undefined){
      $(this._overlay).remove();
      $(this._viewport).resizable( "destroy" ).remove();

      this._overlay=undefined;
      this._viewport=undefined;
    }
  }

} );