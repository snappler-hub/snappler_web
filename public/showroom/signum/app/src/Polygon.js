/**
 * Created by snappler on 11/02/14.
 */
Polygon = L.Polygon.extend( {
  options: {},
  initialize: function () {
    var polygonOptions = {
      stroke: true,
      color: '#bada55',
      weight: 4,
      opacity: 0.8,
      fill: true,
      clickable: true,
      contextmenu: true,
      contextmenuItems: [ ]
    };

    this.property = {
      name: 'Lote'
    };
    this.defineContextMenuItems( polygonOptions );

    L.Polygon.prototype.initialize.call( this, [], polygonOptions );

    this.on( 'click', this.onPolygonClick );
    this.on( 'dblclick', this.onPolygonDblClick );
    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getPolygonLayer();
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
      callback: function ( ) {
        self.removePolygon();
      }
    },
    {
      text: 'Eliminar ultimo punto',
      callback: function ( ev ) {
        self.removeLastVertex( ev );
      }
    }
  ];
},

  containsPoint:function(p){
    return Util.pointInPolygon( p, this.getLatLngs() );
  },

  removeLastVertex: function ( e ) {
    var lastVertex = this.getLatLngs().pop();
    this.redraw();
    if ( this.getLatLngs().length < Polygon.MIN_VERTEX_SIZE ) {
      this.removePolygon( e );
    }
    return lastVertex;
  },
  removePolygon: function ( e ) {
    this.getBelongingLayer().removeLayer( this );
    delete this;
  },
  onMapClick: function ( e ) {
    if ( !Map.getInstance().hasGuide() ) Map.getInstance().addClosingVertex();

    if ( Map.getInstance()._currentTool ) {
      Map.getInstance()._currentTool.addLatLng( e.latlng );

      Map.getInstance()._guideLine.getLatLngs().shift();
      Map.getInstance()._guideLine.redraw();
    }
    else {
      Map.getInstance().setCurrentTool(new Polygon());
    }

    Map.getInstance().updateClosingVertex( e.latlng );
  },

  onMouseMove: function ( e ) {
    if ( Map.getInstance().hasGuide() )
      Map.getInstance()._guideLine.setLatLngs( [Map.getInstance()._closingVertexMarker.getLatLng(), e.latlng] );
  },

  onPolygonClick: function(e){
//    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },
  onPolygonDblClick: function(e){
    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
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
  close:function(createOther){
    Map.getInstance().removeClosingVertex();
    if ( this.getLatLngs().length < Polygon.MIN_VERTEX_SIZE ) {
      this.removePolygon();
    }

    if(createOther){
      Map.getInstance().setCurrentTool(new Polygon());
      Map.getInstance().removeClosingVertex();
    }else {
      Map.getInstance()._currentTool = undefined;
    }
  }

} );


Polygon.MIN_VERTEX_SIZE = 3;

//TODO:: Calcular area de un poligono
//(LGeo.area(layer) / 1000000).toFixed(2)