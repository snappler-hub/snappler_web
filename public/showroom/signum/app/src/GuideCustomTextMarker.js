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
    this.setIcon(L.AwesomeMarkers.icon({
      prefix:'fa',
      icon: 'font',
      markerColor: 'blue'
    }));

//    Map.getInstance().setZoom(Marker.IDEAL_ZOOM);
    return this;
  },
  onMapClick:function(e){
    var text=Application.prompt("Inserte texto para el nuevo marcador");
    if(text!==undefined){
      var ctm = new TextMarker( undefined, {text: text} );
      ctm.setLatLng( e.latlng );
      ctm.getBelongingLayer().addLayer( ctm );
    }
    //Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  }
});