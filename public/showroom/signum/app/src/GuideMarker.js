/**
 * Created by snappler on 17/03/14.
 */
GuideMarker = L.Marker.extend( {
  initialize: function ( source, zoom, klazz ) {
    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), {icon: new L.DivIcon( {
      className: 'guide-marker',
      iconSize: Marker.BASE_SIZE,
      iconAnchor: Marker.BASE_ANCHOR,
      html: '<img src="' + source + '" style="width:48px; height:48px; margin: 2.35em 0 0 2em"/>'
    } )} );

    // REMEMBER:: DONT ADD POPUP TO A MARKER BEFORE CLICK (no add marker because popup is over)
    this.property = {
      name: 'Tipico',
      source: source,
      iconSize: Marker.BASE_SIZE.clone(),
      klazz:klazz,
      lastClass:undefined
    };

    Map.getInstance().setZoom(Marker.IDEAL_ZOOM);
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  },
  onMapClick: function ( e ) {
    var newMarker;
    newMarker = new window[this.property.klazz]( this.property.source, Map.getInstance().getZoom() );
//    newMarker = new Marker( this.property.source, Map.getInstance().getZoom() );

    newMarker.setLatLng( e.latlng );
    newMarker.getBelongingLayer().addLayer( newMarker );

    newMarker.fire('unselected');
    if(this.property.klazz!==this.property.lastClass){
      Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
      this.property.lastClass=this.property.klazz;
    }
  },
  onMouseMove: function ( e ) {
    Map.getInstance()._currentTool.setLatLng( e.latlng );
  },

  updateIconSize:function(){ },

  close:function(){
    this.getBelongingLayer().removeLayer( this );
  }
} );