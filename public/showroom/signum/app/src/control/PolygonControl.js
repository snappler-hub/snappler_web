/**
 * Created by snappler on 14/03/14.
 */
PolygonControl = L.Control.extend( {
  options: {
    position: 'topleft',

    buttons: [
      {
        title: 'Lote Poligonal',
        text: 'Lote Poligonal',
        options: {
          constructor: Polygon
        }
      },
      {
        title: 'Lote Rectangular',
        text: 'Lote Rectangular',
        options: {
          constructor: Rectangle
        }
      },
      {
        title: 'Lote Circular',
        text: 'Lote Circular',
        options: {
          constructor: Circle
        }
      }

    ]
  },

  onAdd: function (  ) {
    var self = this;
    var controlDiv = L.DomUtil.create( 'div', '' );

    this.actions = L.DomUtil.create( 'ul', 'leaflet-actions', controlDiv );

    for ( var i = 0; i < self.options.buttons.length; i++ ) {
      Util._createButton( {
        title: self.options.buttons[i].title,
        text: self.options.buttons[i].text,
        container: L.DomUtil.create( 'li', '', this.actions ),
        options: self.options.buttons[i].options,
        actions: this.actions,
        callback: this.createPolygon
      } );
    }

    L.DomEvent
      .addListener( controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( controlDiv, 'click', function () {
        $( self.actions ).fadeToggle('fast');

        $( Map.getInstance().controls[Map.CTRL_LINE].actions ).hide();
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-polygon-interior', controlDiv );
    controlUI.title = 'Lotes';
    return controlDiv;
  },
  createPolygon: function ( options ) {
    if( Map.getInstance()._editableLine !== undefined ){
      Map.getInstance().controls[Map.CTRL_CURSOR].updateEdit();
    }

    Map.getInstance().cancelCurrentTool();
    Map.getInstance().setCurrentTool(new options.constructor());

    Application.setCrosshairCursor();
  }
} );