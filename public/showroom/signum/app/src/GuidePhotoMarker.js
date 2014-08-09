/**
 * Created by snappler on 17/07/14.
 */
GuidePhotoMarker=GuideMarker.extend({
  initialize:function(){
    GuideMarker.prototype.initialize.call( this,"app/assets/images/photo-marker-icon.png");

    this.setIcon(new L.DivIcon( {
      className: 'guide-marker',
      iconSize: Marker.BASE_SIZE,
      iconAnchor: Marker.BASE_ANCHOR,
      html: '<img src="app/assets/images/photo-marker-icon.png" style="width:30px; height:40px; margin: 2.35em 0 0 2em"/>'
    } ));

    return this;
  },
  onMapClick:function(e){
    var pm = new PhotoMarker( Map.getInstance().getZoom() );
    pm.setLatLng( e.latlng );
    pm.getBelongingLayer().addLayer( pm );

    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },

});