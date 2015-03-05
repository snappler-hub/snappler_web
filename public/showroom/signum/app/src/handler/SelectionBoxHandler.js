/**
 * Created by snappler on 09/10/14.
 */
SelectionBoxHandler= L.Class.extend({
  _boxStyle:{
    stroke: true,
    color: "#0000ff",
    weight: 2,
    opacity: 0.8,
    fill: true,
    fillColor:'#ffffff',
    dashArray:[3, 7],
    contextmenu: true,
    contextmenuItems: [
      {
        text: 'Mover items seleccionados',
        icon:'app/assets/images/arrows.svg'
      },
      {
        text: 'Eliminar items seleccionados',
        icon:'app/assets/images/minus.svg'
      }
    ]
  },
  __initHandlers: function () {
    this._mousemoved = false;
    Map.getInstance().once( 'mousedown', this._onMouseDown, this );
    Map.getInstance().on( 'mousemove', this._onMouseMove, this );
    Map.getInstance().once( 'mouseup', this._onMouseUp, this );
  },
  __removeHandlers:function(){
    Map.getInstance().off( 'mousedown', this._onMouseDown, this );
    Map.getInstance().off( 'mousemove', this._onMouseMove, this );
    Map.getInstance().off( 'mouseup', this._onMouseUp, this );
  },
  initialize:function(){
    this._box=undefined;
    this._toPaste=false;
    this.__initHandlers();
  },
  _onMouseDown:function(e){
    this._mousemoved=true;
    this._toPaste=false;
    if(this._box===undefined){
      this._selectionBounds=[e.latlng, undefined];
      this._box=new L.Rectangle( [[0, 0], [0, 0]], this._boxStyle);
      Map.getInstance().getAuxLayer().addLayer(this._box);
    }

  },
  moveSelection: function ( latlng ) {
    this._box.setLatLngs( Util.relocateCoords( this._lastCenter, latlng, this._box.getLatLngs() ) );
    this._groupedLayer.eachLayer( function ( l ) {
      if ( typeof(l.setLatLngs) === 'function' ) {
        l.setLatLngs( Util.relocateCoords( this._lastCenter, latlng, l.getLatLngs() ) );
      }
      else {
        l.setLatLng( Util.relocateCoords( this._lastCenter, latlng, l.getLatLng() ) );
      }
    }, this );
  },
  _onMouseMove:function(e){
    if(this._mousemoved){
      this._selectionBounds[1]=e.latlng;
      this._box.setBounds(this._selectionBounds);
    }else{
      if (!e.originalEvent.ctrlKey || ((e.originalEvent.which !== 1) && (e.originalEvent.button !== 1))) { return false; }

      if( e.originalEvent.ctrlKey ){
        this.moveSelection( e.latlng );
        this._lastCenter = e.latlng;
      }
    }
  },
  checkLayersIntersectsBounds: function () {
    var aSinglePointLayers = [Map.getInstance().getMarkerLayer(), Map.getInstance().getTextLayer(), Map.getInstance().getPhotoLayer()];
    var aMultiPointsLayers = [Map.getInstance().getPolylineLayer(), Map.getInstance().getPolygonLayer()];

    var aSPLInBounds = this.checkSinglePointLayersInBounds( aSinglePointLayers,
      L.latLngBounds( this._selectionBounds ) );
    var aMPLInBounds = this.checkMultiPointsLayersInBounds( aMultiPointsLayers,
      L.latLngBounds( this._selectionBounds ) );

    var aElementsInBounds = [].concat( aSPLInBounds ).concat( aMPLInBounds );
    return {aSinglePointLayers: aSinglePointLayers, aMultiPointsLayers: aMultiPointsLayers, aElementsInBounds: aElementsInBounds};
  },
  _onMouseUp:function(e) {
//    Map.getInstance().off('mousemove', this._onMouseMove);
//    Map.getInstance().getAuxLayer().removeLayer( this._box );
//    this._box = undefined;
    if(this._selectionBounds.length==2){
      this._mousemoved = false;
      var self = this;

      var __ret = this.checkLayersIntersectsBounds();

      var aSinglePointLayers = __ret.aSinglePointLayers;
      var aMultiPointsLayers = __ret.aMultiPointsLayers;
      var aElementsInBounds = __ret.aElementsInBounds;

      this._groupedLayer = L.featureGroup( [] );
      Map.getInstance().addLayer( this._groupedLayer );

      aSinglePointLayers.forEach( function ( l ) {
        aElementsInBounds.forEach( function ( elem ) {
          if ( l.hasLayer( elem ) ) {
            l.removeLayer( elem );
            self._groupedLayer.addLayer( elem );
          }
        } )
      } );

      aMultiPointsLayers.forEach( function ( l ) {
        aElementsInBounds.forEach( function ( elem ) {
          if ( l.hasLayer( elem ) ) {
            l.removeLayer( elem );
            self._groupedLayer.addLayer( elem );
          }
        } )
      } );

      this._lastCenter = this._box.getBounds().getCenter();
    }
  },
  checkSinglePointLayersInBounds:function(layers, latlngbounds){
    var list=[];
    layers.forEach(function(layer){
      layer.eachLayer(function(l){
        if(latlngbounds.contains( l.getLatLng())) list.push(l);
      });
    });
    return list;
  },
  checkMultiPointsLayersInBounds:function(layers, latlngbounds){
    var list=[];
    layers.forEach(function(layer){
      layer.eachLayer(function(l){
        if(latlngbounds.intersects( l.getBounds())) list.push(l);
      });
    });
    return list;
  },

  backElementsToOwnLayer: function () {
    this._groupedLayer.eachLayer( function ( l ) {
      this._groupedLayer.removeLayer( l );
      l.getBelongingLayer().addLayer( l );
    }, this );
  },

  removeBoxSelection:function(){
    if(this._groupedLayer!==undefined){
      this.backElementsToOwnLayer();
      Map.getInstance().removeLayer( this._groupedLayer );
      this._groupedLayer = undefined;

      Map.getInstance().getAuxLayer().removeLayer( this._box );
      this._box = undefined;

      this.__initHandlers();
    }
  },

  indicatorToMove:function(e){
    this._nextCenter= e.latlng;
    this._nextCenterIndicator= L.circleMarker( this._nextCenter );
    Map.getInstance().getAuxLayer().addLayer( this._nextCenterIndicator );
  },
  cloneGroupedLayer:function(){
    this.backElementsToOwnLayer();
    Map.getInstance().removeLayer( this._groupedLayer );

    this._groupedLayer = L.featureGroup( [] );
    Map.getInstance().addLayer( this._groupedLayer );

    var __ret= this.checkLayersIntersectsBounds();
    var aSinglePointLayers = __ret.aSinglePointLayers;
    var aMultiPointsLayers = __ret.aMultiPointsLayers;
    var aElementsInBounds = __ret.aElementsInBounds;
    var self = this;

    aSinglePointLayers.forEach( function ( l ) {
      aElementsInBounds.forEach( function ( elem ) {
        if ( l.hasLayer( elem ) ) {
          var newMarker = new window[elem.property.klass]( elem.property.source, Map.getInstance().getZoom() );
          newMarker.setLatLng( elem.getLatLng() );
          self._groupedLayer.addLayer( newMarker );
        }
      } )
    } );

    aMultiPointsLayers.forEach( function ( l ) {
      aElementsInBounds.forEach( function ( elem ) {
        if ( l.hasLayer( elem ) ) {
          var newPoly = new window[elem.property.klass]( elem.description, Map.getInstance().getZoom() );
          newPoly.setLatLngs( elem.getLatLngs() );
          self._groupedLayer.addLayer( newPoly );
        }
      } )
    } );

    this._lastCenter = this._box.getBounds().getCenter();
  }
});