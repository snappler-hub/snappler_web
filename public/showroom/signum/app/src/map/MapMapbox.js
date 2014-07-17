Map={};
MapMapbox=L.mapbox.Map.extend({
  initialize: function(element, _) {
    Map.DEFAULT_ZOOM = 19;
    Map.DEFAULT_CENTER = [-34.92137, -57.9545];
    Map.TILE_LAYER_OPACITY =1;

    Map.CTRL_CURSOR=0;
    Map.CTRL_LINE=1;
    Map.CTRL_POLYGON=2;
    Map.CTRL_TOOGLE_SIDEBAR=3;
    Map.CTRL_TOOGLE_TOPBAR=4;
    Map.CTRL_SIDEBAR=5;

    var layer1_lines = new L.LayerGroup(),
      layer2_icons = new L.LayerGroup(),
      layer3_polygons = new L.LayerGroup(),
      layer4_aux = new L.LayerGroup(),
      layer5_text = new L.LayerGroup();

    var overlays = {
      'Marcadores': layer2_icons,
      'Lineas': layer1_lines,
      'Lotes': layer3_polygons,
      'Etiquetas': layer5_text
    };

    var options= {
      keyboard:false,
      infoControl: false,
      attributionControl: false,
      contextmenu: true,
      contextmenuWidth: 220,
      contextmenuItems:[{ text: '<b>Mapa</b>',
        icon:'app/assets/images/map.svg'},

        { text: 'Editar todas las lineas',
          callback:this.editAllLines,
          icon:'app/assets/images/edit-lines.svg'}]
    };

    L.mapbox.Map.prototype.initialize.call(this, element, undefined, options);

    this.setView(Map.DEFAULT_CENTER, Map.DEFAULT_ZOOM);


    this.controls = [new CursorControl(),
      new LineControl(),
      new PolygonControl(),
      new SidebarControl(),
      new TopbarControl(),
      L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'right'
      })];

    this.addControl( this.controls[Map.CTRL_CURSOR] );
    this.addControl( this.controls[Map.CTRL_LINE] );
    this.addControl( this.controls[Map.CTRL_POLYGON] );
    this.addControl( this.controls[Map.CTRL_TOOGLE_SIDEBAR] );
    this.addControl( this.controls[Map.CTRL_TOOGLE_TOPBAR] );
    this.addControl( this.controls[Map.CTRL_SIDEBAR] );


    this._currentBaseLayer=L.tileLayer( 'http://c.tiles.mapbox.com/v3/examples.map-szwdot65/{z}/{x}/{y}.png', {minZoom: 11, maxZoom: 22 } );
    L.control.layers({
      'Grey Map': this._currentBaseLayer.addTo(this),
      'Base Map': L.tileLayer( 'http://c.tiles.mapbox.com/v3/examples.map-zr0njcqy/{z}/{x}/{y}.png', {minZoom: 11, maxZoom: 22 } )
    }, overlays).addTo(this);
    /*
     this._currentBaseLayer=L.mapbox.tileLayer('gastonambrogi.i1m3c21e').setFormat('jpg70');
     L.control.layers({
     'Base Map': this._currentBaseLayer.addTo(this),
     'Grey Map': L.mapbox.tileLayer('examples.map-szwdot65').setFormat('jpg70')
     }, overlays).addTo(this);
     */

    this.layers = [layer1_lines, layer2_icons, layer3_polygons, layer4_aux, layer5_text];

    this.addLayer(layer4_aux);

    L.control.scale( {metric: true} ).addTo( this );
    new L.Hash(this);

    this.initializeLinesOnMap();

    this.addEventHandlers();

    Map.instance = this;
    Map.keyboardHandler=new KeyboardHandler();

    this._lastZoom=Map.DEFAULT_ZOOM;

    return this;
  },
  initializeLinesOnMap:function(){
    this.linesOnMap = [
      [
        [],
        []
      ],
      [
        [],
        []
      ]
    ];
  },
  addEventHandlers:function(){
    this.on( 'baselayerchange', this._onBaseLayerChange );
    this.on( 'layeradd', this._onLayerAdd );

    this.on( 'dragstart', this._onDragStart );
    this.on( 'dragend', this._onDragEnd );

    this.on( 'mousemove', this._onMouseMove );

    this.on( 'click', this._onClick);

    this.on( 'zoomstart', this._onZoomStart );
    this.on( 'viewreset', this._onZoomChange );
    this.on('contextmenu.show',this._onContextMenuShow);
  },
  _onBaseLayerChange:function ( e ) {
    e.target._currentBaseLayer = e.layer;
    Map.getInstance().setZoom((Map.getInstance().getZoom()>19)?19:Map.getInstance().getZoom());
  },

  _onLayerAdd:function ( e ) {
    console.log('TODO:: falta implementar el metodo #_onLayerAdd en MapMapbox');
    /*
    if ( (e.layer.property !== undefined) && (e.layer.property.type == 'marker') ) {
      var m = e.layer;
      m.property._lastIcon = m.options.icon;

      $( "." + m.property.id )
        .on( 'mouseenter', function ( ev ) {
          ev.stopImmediatePropagation();
          ev.preventDefault();

          if ( ( map._currentTool ) && ( map._currentTool.property.type == 'polyline' ) ) {
            m.setIconAngle(0);
            $( "." + m.property.id ).find( 'img' ).css( 'width', '128px' );
            $( "." + m.property.id ).find( 'img' ).css( 'height', '128px' );

            $( "." + m.property.id ).css( 'margin-left', '-64px' );
            $( "." + m.property.id ).css( 'margin-top', '-64px' );

            var snapSvg = Snap();

            $( "." + m.property.id ).append( snapSvg.node );

            Application.relocateSvg( snapSvg, m );
            var layer_point_marker = Map.getInstance().latLngToLayerPoint( m.getLatLng() );

            var a_snap_circ = [];
            m.property.connect.forEach( function ( p ,i ) {
              if(m.property.linesConnecteds[i]===undefined){
                var trans_point = {x: p.x, y: 128 - p.y};

                var circ_connect = snapSvg.circle( trans_point.x, trans_point.y, 8 ).attr( {
                  fill: "#bada55",
                  stroke: "#000",
                  strokeWidth: 2,
                  opacity: 0.8
                } );

                a_snap_circ.push( circ_connect );

                circ_connect._position = {x: layer_point_marker.x - 64 + p.x, y: layer_point_marker.y + 64 - p.y};

                circ_connect.click( function () {
                  a_snap_circ.forEach( function ( c ) {
                    c.attr( { fill: "#bada55" } );
                  } );

                  this.attr( { fill: 'blue' } );

                  var trnsfm_to_lat_lng = {
                    x: layer_point_marker.x + (((m.property.currentSize.x / 128) * ( this._position.x ))-((m.property.currentSize.x / 128) * ( layer_point_marker.x ))),
                    y: layer_point_marker.y + (((m.property.currentSize.y / 128) * ( this._position.y ))-((m.property.currentSize.y / 128) * ( layer_point_marker.y )))
                  };

                  ev.latlng = map.layerPointToLatLng( L.point( trnsfm_to_lat_lng.x, trnsfm_to_lat_lng.y ) );
                  if(m.bindLine( map._currentTool, ev.latlng, i )){
                    map._currentTool.onMapClick( ev );
                  }
                } );
              }
            } );

          }
        } )

        .on( 'mouseleave', function ( ev ) {
          ev.stopImmediatePropagation();
          ev.preventDefault();

          if ( ( map._currentTool ) && ( map._currentTool.property.type == 'polyline' ) ) {
            m._calculateRotation();
            $( "." + m.property.id ).find( 'img' ).css( 'width', m.property.currentSize.x + 'px' );
            $( "." + m.property.id ).find( 'img' ).css( 'height', m.property.currentSize.x + 'px' );

            $( "." + m.property.id ).css( 'margin-left', '-' + (m.property.currentSize.x / 2) + 'px' );
            $( "." + m.property.id ).css( 'margin-top', '-' + (m.property.currentSize.x / 2) + 'px' );

            $( "." + m.property.id ).find( 'svg' ).remove();
            m.updateIconSize( Map.getInstance().getZoom() );

            if(map._currentTool.getLatLngs().length >= Line.MIN_VERTEX_SIZE){
              map.closePolyline( true );
            }
          }

        } )
    }*/
  },

  _onDragStart:function () {
    $( "#map" ).attr( 'data-cursor', $( "#map" ).css( "cursor" ) ).css( "cursor", "move" );
  },

  _onDragEnd:function () {
    $( "#map" ).css( "cursor", $( "#map" ).attr( 'data-cursor' ) ).removeAttr( 'data-cursor' );
  },
  _onZoomStart:function(e){
    Map.getInstance()._lastZoom=Map.getInstance().getZoom();
  },
  _onZoomChange:function(e){
    Map.getInstance().getMarkerLayer().eachLayer( function ( marker ) {
      marker.updateIconSize( Map.getInstance().getZoom() );
    } );

    Map.getInstance().getPolylineLayer().eachLayer( function ( line ) {
      line.updateWeigth( Map.getInstance().getZoom() );
    } );
    return false;
  },

  _onMouseMove:function ( e ) {
    if ( e.target._currentTool ) e.target._currentTool.onMouseMove( e );
  },

  _onClick:function ( e ) {
    //TODO:: Div en el pie de la pagina la coordenada clickeada o en movimiento
    console.log( e.latlng );
    this.unsetSelected();

    if ( e.target._currentTool ){
      e.target._currentTool.onMapClick( e );
    }else{
      this.controls[Map.CTRL_SIDEBAR].hide();
    }

  },
  _onContextMenuShow:function(e){
    if(e.relatedTarget!==undefined) Map.getInstance().setSelected(e.relatedTarget);
  },

  getPolylineLayer: function () {
    return this.layers[0];
  },
  getMarkerLayer: function () {
    return this.layers[1];
  },
  getPolygonLayer: function () {
    return this.layers[2];
  },
  getAuxLayer: function () {
    return this.layers[3];
  },
  getTextLayer: function () {
    return this.layers[4];
  },

  showClosingVertex: function(){
    this._closingVertexMarker = new CircleMarker();
    this._closingVertexMarker.getBelongingLayer().addLayer( this._closingVertexMarker );
  },

  updateClosingVertex: function(ll){
    Map.getInstance()._closingVertexMarker.setLatLng( ll );
  },
  hideClosingVertex:function(){
    this._closingVertexMarker.getBelongingLayer().removeLayer( this._closingVertexMarker );
    delete this._closingVertexMarker;
  },

  showGuideLine:function(dashed){
    this._guideLine = dashed;
    this._guideLine.getBelongingLayer().addLayer( this._guideLine );
  },
  hideGuideLine:function(){
    this._guideLine.getBelongingLayer().removeLayer( this._guideLine );
    delete this._guideLine;
  },

  showTooltip:function(){
    this._tooltip = new Tooltip( this );
  },
  hideTooltip:function(){
    this._tooltip.dispose();
  },

  addClosingVertex:function () {
    this.showClosingVertex();
    this.showGuideLine(new DashedLine());
    this.showTooltip();

    this._closingVertexMarker.on( 'click', function () {
      Map.getInstance()._currentTool.close( true );
    } );
  },

  addGuideRectangle: function ( point ) {
    this.showClosingVertex();
    this.showGuideLine(new DashedRectangle( point ));
  },
  addGuideCircle: function ( point ) {
    this.showClosingVertex();
    this.showGuideLine(new DashedCircle( point ));
  },

  removeClosingVertex:function () {
    if ( this.hasGuide() ) {
      this.hideGuideLine();
      this.hideClosingVertex();
    }
  },

  hasGuide:function(){
    return (this._guideLine !== undefined);
  },
  setSelected:function(target){
    this.unsetSelected();
    this._selected=target;
    target.fire('selected');
    $( 'html' ).focus();
  },
  unsetSelected:function(){
    if(this._selected){
      this._selected.fire('unselected');
      this._selected=undefined;
    }
  },
  setCurrentTool:function(tool){
    this._currentTool=tool;
    this._currentTool.getBelongingLayer().addLayer(this._currentTool);
  },
  cancelCurrentTool: function () {
    this.unsetSelected();
    if(Map.getInstance()._editableLines) Map.getInstance().controls[Map.CTRL_CURSOR].updateEdit();
    if(Application.workingTarget!== undefined) Application.finishWork();

    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();

    if ( this._currentTool ) {
      this._currentTool.close(false);
      Map.getInstance()._currentTool = undefined;
    }

    this.hideConnectorVertexOfLines();
    Application.resetCursor();
  },
  enableZoom:function(){
    $(".leaflet-control-zoom").css("display", "block");
    $( ".leaflet-control-layers" ).css( "display", "block" );
    this.touchZoom.enable();
    this.doubleClickZoom.enable();
    this.scrollWheelZoom.enable();
    if (this.tap) this.tap.enable();
  },

  disableZoom:function(){
    $(".leaflet-control-zoom").css("display", "none");
    $( ".leaflet-control-layers" ).css( "display", "none" );
    this.touchZoom.disable();
    this.doubleClickZoom.disable();
    this.scrollWheelZoom.disable();
    if (this.tap) this.tap.disable();
  },

  enableDragging:function(){
    this.dragging.enable();
  },
  disableDragging:function(){
    this.dragging.disable();
  },
  disableContextMenu:function(){
    this.on('contextmenu.show', function(){
      Map.getInstance().contextmenu.hide();
    });
  },
  enableContextMenu:function(){
    this.off('contextmenu.show');
  },

  addLineByType:function(l){
    this.linesOnMap[(l.description.type == 'BT') ? 0 : 1][+l.description.dashed].push( l );
  },
  removeLineByType:function(l){
    if(this.getLinesOfTypeLine(l).indexOf(l)>=0)
      this.getLinesOfTypeLine(l).splice(this.getLinesOfTypeLine(l).indexOf(l),1 );
  },
  getLinesOfTypeLine:function(l){
    return this.linesOnMap[(l.description.type == 'BT') ? 0 : 1][+l.description.dashed];
  },
  getLinesOfTypeCurrentLine:function(){
    return Map.getInstance().linesOnMap[(Map.getInstance()._currentTool.description.type == 'BT') ? 0 : 1][+Map.getInstance()._currentTool.description.dashed]
  },
  hideConnectorVertexOfLines: function () {
    this.linesOnMap.forEach( function ( arrayTypes ) {
      arrayTypes.forEach( function ( arrayIsDashed ) {
        arrayIsDashed.forEach( function ( l ) {
          l.hideVertexMarkers();
        } )
      } )
    } );
  },
  showVertexesOfSameType: function () {
    Map.getInstance().hideConnectorVertexOfLines();
    Map.getInstance().getLinesOfTypeCurrentLine().forEach( function ( l ) {
      l.showVertexMarkers();
    } );
  },
  editAllLines: function(){
    Map.getInstance().cancelCurrentTool();
    Map.getInstance()._editableLines = [];

    Map.getInstance().getPolylineLayer().getLayers().forEach( function ( l ) {
        var el=new EditableLine( l );

        Map.getInstance()._editableLines.push(el);
        Map.getInstance().getAuxLayer().addLayer( el );
        l.removeLine( true );
      }
    );

    if(Map.getInstance()._editableLines.length>0){
      Map.getInstance().contextmenu.setDisabled(1, true);
      Map.getInstance().controls[Map.CTRL_CURSOR].showEndEdit();
    }

  }
});

Map.getInstance = function () {
  return Map.instance;
};