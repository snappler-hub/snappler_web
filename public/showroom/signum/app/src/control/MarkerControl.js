/**
 * Created by snappler on 18/03/14.
 */
$( '.marker' ).on( 'click', function () {
  Map.getInstance().cancelCurrentTool();

  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();

  if( Map.getInstance()._editableLine !== undefined ) Map.getInstance().controls[Map.CTRL_CURSOR].updateEdit();

  var sourceForMap=$( this ).attr( 'src' ).replace('_menu', '');
  Map.getInstance().setCurrentTool(new GuideMarker( sourceForMap, Map.getInstance().getZoom() ))
} );
