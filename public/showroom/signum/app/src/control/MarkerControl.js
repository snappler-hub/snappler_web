/**
 * Created by snappler on 18/03/14.
 */
$( '.marker' ).on( 'click', function () {
  Map.getInstance().cancelCurrentTool();

  var sourceForMap=$( this ).attr( 'src' ).replace('_menu', '');
  Map.getInstance().setCurrentTool(new GuideMarker( sourceForMap, Map.getInstance().getZoom(),$( this ).data('class')  ));
  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].sidebarSelector="#sidebar .markers";
} );

$('.photo-marker').on('click', function(){
  Map.getInstance().cancelCurrentTool();

  Map.getInstance().setCurrentTool(new GuidePhotoMarker( Map.getInstance().getZoom() ));

  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].sidebarSelector="#sidebar .fotos";
});

$('.custom-text-marker').on('click', function(){
  Map.getInstance().cancelCurrentTool();

  Map.getInstance().setCurrentTool(new GuideCustomTextMarker( Map.getInstance().getZoom() ));

  //Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].sidebarSelector="#sidebar .fotos";
});
