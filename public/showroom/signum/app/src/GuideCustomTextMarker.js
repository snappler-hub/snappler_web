/**
 * Created by snappler on 17/07/14.
 */
GuideCustomTextMarker=GuideMarker.extend({
  initialize:function(){
    GuideMarker.prototype.initialize.call( this,"app/assets/images/custom-text-marker-icon.png");

    /*this.setIcon(new L.DivIcon( {
      className: 'guide-marker',
      iconSize: Marker.BASE_SIZE,
      iconAnchor: Marker.BASE_ANCHOR,
      html: '<img src="app/assets/images/custom-text-marker-icon.png" style="width:30px; height:40px; margin: 2.35em 0 0 2em"/>'
    } ));*/
    this.setIcon(new L.DivIcon( {
      className: 'guide-marker',
      iconSize: [0,0],
      iconAnchor: [0,0],
      html: '<div></div>'
    } ));
    
    Application.setCrosshairCursor();

//    Map.getInstance().setZoom(Marker.IDEAL_ZOOM);
    return this;
  },
  onMapClick:function(e){
    var text=Application.prompt("Inserte texto para el nuevo marcador");
    if(text!==null){
      var ctm = new TextMarker( undefined, {text: text} );
      ctm.setLatLng( e.latlng );
      ctm.getBelongingLayer().addLayer( ctm );

      ctm.updateIconSize(Map.getInstance().getZoom());
    }
    //Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  }
});