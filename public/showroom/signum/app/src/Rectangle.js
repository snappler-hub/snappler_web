/**
 * Created by snappler on 10/03/14.
 */

Rectangle = L.Rectangle.extend( {
  initialize: function () {
    var options= {
      stroke: true,
        color: "#ff7800",
        weight: 4,
        opacity: 0.8,
        fill: true,
        clickable: true,
        contextmenu: true,
        contextmenuItems: [ ]
    };

    this.property = {
      name: 'Lote Rectangular',
      bounds: []
    };

    this.defineContextMenuItems( options );

    L.Rectangle.prototype.initialize.call( this, [
      [0, 0],
      [0, 0]
    ], options );

    this.on( 'click', this.onRectangleClick );
    this.on( 'dblclick', this.onRectangleDblClick );
    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getPolygonLayer();
  },
  containsPoint:function(p){
    return this.getBounds().contains(p);
  },
  defineContextMenuItems: function ( options ) {
    var self = this;
    options.contextmenuItems = [
      {
        separator: true
      },
      {
        text: '<b>'+this.property.name+'</b>'
      },
      {
        text: 'Eliminar lote',
        callback: function ( e ) {
          self.removePolygon();
        }
      }
    ];
  },
  onMapClick: function ( e ) {
    if ( this.property.bounds.length < 2 ) {
      this.property.bounds.push( e.latlng );
      if ( !Map.getInstance().hasGuide() ) Map.getInstance().addGuideRectangle( e.latlng );
    }

    if ( this.property.bounds.length == 2 ) {
      this.setBounds( this.property.bounds );
      this.redraw();

      Map.getInstance().removeClosingVertex();
      Map.getInstance().setCurrentTool(new Rectangle());
    }
  },
  onMouseMove: function ( e ) {
    if ( Map.getInstance().hasGuide() ) {
      if ( this.property.bounds.length >= 1 ) {
        Map.getInstance()._guideLine.setBounds( [this.property.bounds[0], e.latlng] );
      }
    }
  },
  onRectangleClick: function(e){
//    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },
  onRectangleDblClick: function(e){
    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },
  removePolygon: function ( e ) {
    this.getBelongingLayer().removeLayer( this );
    delete this;
  },

  removeBorder: function () {
    if ( this.property.border !== undefined ) {
      this.property.border.getBelongingLayer().removeLayer( this.property.border );
      delete this.property.border;
    }
  },
  setBorder: function () {
    this.removeBorder();
    this.property.border = new Border( this.getBounds().pad( 0.07 ) );
    this.property.border.getBelongingLayer().addLayer( this.property.border );
  },
  markSelected:function(){
    this.setBorder();
  },
  unmarkSelected:function(){
    this.removeBorder();
  },
  close:function () {
    Map.getInstance().removeClosingVertex();
    if ( Map.getInstance().hasGuide() ) this.setBounds( [this.property.bounds[0], e.latlng] );
    if ( this.property.bounds.length < 2 ) this.removePolygon( );
  }
} );
