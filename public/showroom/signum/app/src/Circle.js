/**
 * Created by snappler on 10/03/14.
 */

Circle = L.Circle.extend( {
  initialize: function () {
    this.property = {
      name: 'Lote Circular'
    };

    var options= {
      stroke: true,
        color: '#c1c1c1',
        weight: 4,
        opacity: 0.5,
        fill: true,
        clickable: true,
        contextmenu: true,
        contextmenuItems: [ ]
    };
    this.defineContextMenuItems( options );

    L.Circle.prototype.initialize.call( this, [0, 0], 0, options );
    this.on( 'click', this._onCircleClick );
    this.on( 'dblclick', this._onCircleDblClick );

    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);
    return this;
  },
  defineContextMenuItems: function ( options ) {
    var self = this;
    options.contextmenuItems = Map.getInstance().options.contextmenuItems.concat( [
      {
        separator: true
      },
      {
        text: '<b>'+this.property.name+'</b>'
      },
      {
        separator: true
      },
      {
        text: 'Mover lote',
        callback: function ( ) {
          Application.moveCircle(self);
        }
      },
      {
        text: 'Eliminar lote',
        callback: function ( e ) {
          self.removePolygon();
        }
      }
    ]);
  },
  _onCircleClick: function(e){
//    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },
  _onCircleDblClick: function(e){
    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },

  containsPoint:function(p){
    return this.getBounds().contains(p);
  },

  getBelongingLayer:function(){
    return Map.getInstance().getPolygonLayer();
  },
  onMapClick: function ( e ) {
    if(this.getLatLng().equals([0, 0])) this.setLatLng( e.latlng );

    if ( !Map.getInstance().hasGuide() ) {
      Map.getInstance().addGuideCircle( e.latlng );
    }else{
      if(Map.getInstance()._guideLine.getRadius()>0){
        this.setRadius(Map.getInstance()._guideLine.getRadius());
        Map.getInstance().removeClosingVertex();
        Map.getInstance().setCurrentTool(new Circle());
      }
    }
  },

  onMouseMove: function ( e ) {
    if ( Map.getInstance().hasGuide() ) Map.getInstance()._guideLine.setRadius( this.getLatLng().distanceTo(e.latlng) );
  },

  removePolygon: function ( e ) {
    this.getBelongingLayer().removeLayer( this );
    delete this;
  },
  close:function () {
    Map.getInstance().removeClosingVertex();
    if ( Map.getInstance().hasGuide() ) this.setRadius( Map.getInstance()._guideLine.getRadius() );
    if ( this.getRadius() < Circle.MIN_RADIUS ) this.removePolygon( );
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
  }
} );

Circle.MIN_RADIUS=1;