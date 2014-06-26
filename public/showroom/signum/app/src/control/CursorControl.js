/**
 * Created by snappler on 14/03/14.
 */
CursorControl = L.Control.extend( {
  options: {
    position: 'topleft'
  },

  onAdd: function ( map ) {
    this.controlDiv = L.DomUtil.create( 'div', '' );
    this.actions=[];
    this.actions[0] = L.DomUtil.create( 'ul', 'leaflet-actions', this.controlDiv );
    this.actions[1] = L.DomUtil.create( 'ul', 'leaflet-actions', this.controlDiv );

    li = L.DomUtil.create( 'li', 'line-edit', this.actions[0] );
    Util._createButton( {
      title: 'Finalizar',
      text: 'Finalizar',
      container: li,
      options: { },
      actions: this.actions[0],
      callback: this.updateEdit
    } );

    li = L.DomUtil.create( 'li', 'rotation-edit', this.actions[1] );
    Util._createButton( {
      title: 'Finalizar',
      text: 'Finalizar',
      container: li,
      options: { },
      actions: this.actions[1],
      callback: function(){
        Map.getInstance().enableZoom();
        Map.getInstance().enableDragging();
        Map.getInstance()._currentBaseLayer.setOpacity( 1 );
        Application.finishWork();
      }
    } );

    L.DomEvent
      .addListener( this.controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( this.controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( this.controlDiv, 'click', function () {
        Map.getInstance().cancelCurrentTool();
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-cursor-interior', this.controlDiv );
    controlUI.title = 'Cursor';
    return this.controlDiv;
  },
  showEndEdit: function () {
    Map.getInstance().disableZoom();
    Map.getInstance()._currentBaseLayer.setOpacity( 0.5 );
    $( this.actions[0] ).fadeToggle( 'fast' );

    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].hide();
    $( ".leaflet-control-topbar" ).css( "display", "none" );

    $( ".leaflet-control-sidebar" ).css( "display", "none" );
    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();
  },

  showEndRotation:function() {
    Map.getInstance().disableZoom();
    Map.getInstance().disableDragging();
    Map.getInstance()._currentBaseLayer.setOpacity( 0.5 );
    $( this.actions[1] ).fadeToggle( 'fast' );
  },
  updateEdit: function () {
    Map.getInstance()._currentBaseLayer.setOpacity( 1 );
    Map.getInstance().enableZoom();
    Map.getInstance().contextmenu.setDisabled(1, false);

    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].show();
    $( ".leaflet-control-topbar" ).css( "display", "block" );
    $( ".leaflet-control-sidebar" ).css( "display", "block" );

    if((Map.getInstance()._editableLines!==undefined)&&(Map.getInstance()._editableLines[0]!==undefined)){
      Map.getInstance()._editableLines[0]._editingLine.markersConnecteds.forEach( function ( m ) {
        m.updateIconSize(Map.getInstance().getZoom());
        Map.getInstance().getMarkerLayer().addLayer( m );
      } );

      for ( var i = 0; i < Map.getInstance()._editableLines.length; i++ ) {
        Map.getInstance().setCurrentTool(new Line( Map.getInstance()._editableLines[i]._editingLineDescription ));
        Map.getInstance()._currentTool.setLatLngs( Map.getInstance()._editableLines[i].getLatLngs() );
        Map.getInstance()._currentTool.close( false );
      }

      for ( var i = 0; i < Map.getInstance()._editableLines.length; i++ ) {
        for ( var j = 0; j < Map.getInstance()._editableLines[i].vertexes.length; j++ ) {
          var m = Map.getInstance()._editableLines[i].vertexes[j];
          m.getBelongingLayer().removeLayer(m);
          delete m;
        }
        Map.getInstance().getAuxLayer().removeLayer( Map.getInstance()._editableLines[i] );
        delete Map.getInstance()._editableLines[i];
      }
    }
  }
} );