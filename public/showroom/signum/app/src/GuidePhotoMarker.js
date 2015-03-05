/**
 * Created by snappler on 03/09/14.
 */
GuidePhotoMarker=GuideMarker.extend({
  initialize:function(){
    GuideMarker.prototype.initialize.call( this,"app/assets/images/photo-marker-icon.png");

    this.setIcon(new L.DivIcon( {
      className: 'guide-marker',
      iconSize: [0,0],
      iconAnchor: [0,0],
      html: '<div></div>'
    } ));

    Application.setCrosshairCursor();

    return this;
  },
  onMapClick:function(e){
    var pm = new PhotoMarker( Map.getInstance().getZoom() );
    pm.setLatLng( e.latlng );
    pm.getBelongingLayer().addLayer( pm );

    pm.fire('unselected');

    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  }

});