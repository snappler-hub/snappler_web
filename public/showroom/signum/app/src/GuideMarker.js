/**
 * Created by snappler on 17/03/14.
 */
GuideMarker = L.Marker.extend( {
  initialize: function ( source, zoom, klazz ) {
    // REMEMBER:: DONT ADD POPUP TO A MARKER BEFORE CLICK (no add marker because popup is over)
    this.property = {
      name: 'Tipico',
      source: source,
      iconSize: Marker.BASE_SIZE.clone(),
      klazz:klazz,
      newMarker: (klazz)?new window[klazz]( source, Map.getInstance().getZoom() ):undefined,
      lastClass:undefined
    };

    /*L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), {icon: new L.DivIcon( {
      className: 'guide-marker',
      iconSize: Marker.BASE_SIZE,
      iconAnchor: Marker.BASE_ANCHOR,
      html: '<img src="' + source + '" style="width:48px; height:48px; margin: 2.35em 0 0 2em"/>'
    } )} );*/

    var icon;
    if(klazz===undefined){
      icon=new L.Icon( {
        className: 'guide-marker',
        iconSize: Marker.BASE_SIZE,
        iconAnchor: Marker.BASE_SIZE,
        iconUrl:source
      } );
    }else{
      icon=this.property.newMarker.options.icon;
    }

    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), {icon: icon } );


    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  },
  onMapClick: function ( e ) {
    //    newMarker = new Marker( this.property.source, Map.getInstance().getZoom() );
    this.property.newMarker.setLatLng( e.latlng );
    this.property.newMarker.getBelongingLayer().addLayer( this.property.newMarker );

    this.property.newMarker.fire('unselected');

    $('.'+this.property.newMarker.property.id ).addClass('marker-on-map');

    if(this.property.klazz!==this.property.lastClass){
      Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
      this.property.lastClass=this.property.klazz;
    }

    this.property.newMarker = new window[this.property.klazz]( this.property.source, Map.getInstance().getZoom() );
  },
  onMouseMove: function ( e ) {
    Map.getInstance()._currentTool.setLatLng( e.latlng );
  },

  _doResize: function ( newIconSize ) {
    // adjust the icon anchor to the new size
    var newIconAnchor = new L.Point( Math.round( newIconSize.x / 2 ), Math.round( newIconSize.y / 2 ) );

    // finally, declare a new icon and update the marker
    var oldIconOptions = this.property.newMarker.options.icon.options;
    oldIconOptions.iconSize = newIconSize;
    oldIconOptions.iconAnchor = newIconAnchor;

    var srcAttr = $( oldIconOptions.html ).filter( 'img' ).attr( 'src' );

    oldIconOptions.html = '<img src="' + srcAttr + '" style="width:' + newIconSize.x + 'px; height:' + newIconSize.x + 'px;"/>'

    var newIcon = new L.DivIcon( oldIconOptions );

    this.setIcon( newIcon );
  },
  updateIconSize: function ( currentZoom ) {
    var newSize=this.property.newMarker.scaleSize(currentZoom);
    this._doResize( new L.Point( newSize, newSize )  );
  },

  close:function(){
    if(this.property.newMarker!==undefined)
      this.property.newMarker.removeMarker();

    this.getBelongingLayer().removeLayer( this );
  }
} );