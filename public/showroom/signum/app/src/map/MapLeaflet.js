//Map initialization
MapLeaflet = L.Map.extend( {

  options: {},

  initialize: function () {
    Map.instance = this;
    Map.DEFAULT_ZOOM = 18;

    //TODO:: FIX Map Center Harcoded | Solution:: Geolocation
    Map.DEFAULT_CENTER = [-34.92137, -57.9545];
    Map.TILE_LAYER_OPACITY = 1;

    var /*baseLayer_google, baseLayer_stamen, baseLayer_openstreet,*/ baseLayer_mqcdn, baseLayer_mapbox, baseLayer_mapbox2, baseLayer_arcgis_sat;
    var layer1_lines = new L.LayerGroup();
    var layer2_icons = new L.LayerGroup();
    var layer3_polygons = new L.LayerGroup();
    var layer4_aux = new L.LayerGroup();
    var layer5_text = new L.LayerGroup();


    baseLayer_mapbox = L.tileLayer( 'http://c.tiles.mapbox.com/v3/examples.map-szwdot65/{z}/{x}/{y}.png', {
      maxZoom: 22,
      minZoom: 11
    } );
    baseLayer_mapbox2 = L.tileLayer( 'https://{s}.tiles.mapbox.com/v3/examples.map-zr0njcqy/{z}/{x}/{y}.png', {
      maxZoom: 22,
      minZoom: 11
    } );

//    baseLayer_cloudmade = L.tileLayer( 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
    /*baseLayer_stamen = L.tileLayer( 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
     maxZoom: 22,
     minZoom: 11
     } );*/
    /*baseLayer_google = L.tileLayer( 'http://mt{s}.google.com/vt/v=w2.106&x={x}&y={y}&z={z}&s=', {
     maxZoom: 22,
     minZoom: 11,
     subdomains: '0123'
     } );*/
    /*baseLayer_openstreet = L.tileLayer( 'http://129.206.74.245:8008/tms_rg.ashx?x={x}&y={y}&z={z} ', {
     maxZoom: 18,
     minZoom: 11
     } );*/

    baseLayer_mqcdn = L.tileLayer( 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
      maxZoom: 18,
      minZoom: 11
    } );

    baseLayer_arcgis_sat = L.tileLayer( 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer\
/tile/{z}/{y}/{x}', {
      maxZoom: 17,
      minZoom: 11
    } );

    //baseLayer_mqcdn.setOpacity( Map.TILE_LAYER_OPACITY );

    var overlays = {
      'Marcadores': layer2_icons,
      'Lineas': layer1_lines,
      'Lotes': layer3_polygons,
      'Descripcion': layer5_text
    };

    layerManager = L.control.layers( {
        'Map Quest': baseLayer_mqcdn,
        'Mapbox color': baseLayer_mapbox2,
        'Mapbox': baseLayer_mapbox,
        'Satelital': baseLayer_arcgis_sat
      },
      overlays );

    L.Map.prototype.initialize.call( this, 'map', {
      center: Map.DEFAULT_CENTER,
      zoom: Map.DEFAULT_ZOOM,
      layers: [baseLayer_mqcdn, layer1_lines, layer2_icons, layer3_polygons, layer4_aux, layer5_text]
    } );

    layerManager.addTo( this );
    this._currentBaseLayer = baseLayer_mqcdn;
    this.layers = [layer1_lines, layer2_icons, layer3_polygons, layer4_aux, layer5_text];

    L.control.scale( {metric: true} ).addTo( this );

    this.controls = [new CursorControl(), new LineControl(), new PolygonControl()];

    this.addControl( this.controls[0] );
    this.addControl( this.controls[1] );
    this.addControl( this.controls[2] );

    this.attachEvents();

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
    return this;
  },
  attachEvents: function () {
    this.on( 'dragstart', function () {
      $( "#map" ).attr( 'data-cursor', $( "#map" ).css( "cursor" ) );
      $( "#map" ).css( "cursor", "move" );
    } );
    this.on( 'dragend', function () {
      $( "#map" ).css( "cursor", $( "#map" ).attr( 'data-cursor' ) );
      $( "#map" ).removeAttr( 'data-cursor' );
    } );

    this.on( 'viewreset', this.onZoomChange );

    $( "#map" ).on( 'click', this.onClick );
    this.on( 'contextmenu', this.onRightClick );

    this.on( 'mousemove', function ( e ) {
      if ( e.target._currentTool ) {
        e.target._currentTool.onMouseMove( e );
      }
    } );

    this.on( 'click', function ( e ) {
      if ( e.target._currentTool ) {
        e.target._currentTool.onMapClick( e );
      }else{
        console.log( e.latlng );
      }
    } );

    this.on( 'baselayerchange', function ( e ) {
      Map.getInstance()._currentBaseLayer = e.layer;
    } );

    this.on( 'layeradd', function ( e ) {
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
      }
    } );

  },

//Map Event //scaleMarkersAtZoomChange
  onZoomChange: function ( e ) {
    map = e.target;
    map.getMarkerLayer().eachLayer( function ( marker ) {
      if ( marker.property.type == 'marker' ) {
        marker.updateIconSize( map.getZoom() );
      }
    } );


    map.getPolylineLayer().eachLayer( function ( line ) {
      line.updateWeigth( map.getZoom() );
    } );

    return false;
  },

  onClick: function ( e ) {
//    L.DomEvent.stopPropagation( e );
//    L.DomEvent.preventDefault( e );
    $( '.context-menu' ).hide( 0, function () {
      $( this ).find( 'span' ).remove();
      $( this ).find( 'li' ).remove();
      $( this ).find( 'hr' ).remove();
    } );

    $( Map.getInstance().controls[1].actions ).hide();
    $( Map.getInstance().controls[2].actions ).hide();
  },
  onRightClick: function ( e ) {
    this.onClick( e );

    pointClick = e.latlng;
    var layersUnder = 0;
    var contextMenu = $( '.context-menu' );
    if ( this.layers ) {

      var lyrs = [this.getPolylineLayer(),this.getMarkerLayer(),this.getPolygonLayer()];
      lyrs.forEach( function ( typeLayer ) {
        typeLayer.eachLayer( function ( layer ) {
          if ( layer.containsPoint( pointClick ) ) {
            layersUnder++;
            layer.generateContextMenu( contextMenu );
          }
        } )
      } );

      contextMenu.find( 'hr:last' ).remove();

      if ( layersUnder == 0 ) {
        Util.createContextMenuHeader( contextMenu, 'Mapa' );
      }
    }
    else {
      Util.createContextMenuHeader( contextMenu, 'Mapa' );
    }

    contextMenu
      .show( 0 )
      .css( {
        top: e.originalEvent.clientY + "px",
        left: e.originalEvent.clientX + "px"
      } );
    return false;
  },
  saveMap: function ( e ) {
    map = e.data.map;
    arrayGeoJSON = [];
    this.getMarkerLayer().eachLayer( function ( layer ) {
      if ( layer.type == 'marker' ) {
        arrayGeoJSON.push( layer.toGeoJSON() );
      }
    } );

    this.getPolylineLayer().eachLayer( function ( layer ) {
      if ( layer.type == 'polyline' ) {
        if ( layer.getLatLngs().length > 1 ) {
          arrayGeoJSON.push( layer.toGeoJSON() );
        }
      }
    } );

    this.getPolygonLayer().eachLayer( function ( layer ) {
      if ( layer.getLatLngs().length > 1 ) {
        arrayGeoJSON.push( layer.toGeoJSON() );
      }
    } );
  },

  defaultTool: function ( e ) {
    map = Map.getInstance();
    // ESC key was pressed
    if ( e.keyCode == 27 ) {
      map.cancelCurrentTool();
    }
  },
  destroyGuideAndVertex: function () {
    if ( this._lastVertexMarker ) {
      this.getMarkerLayer().removeLayer( this._lastVertexMarker );
      this.getPolylineLayer().removeLayer( this._guideLine );
      delete this._guideLine;
      delete this._lastVertexMarker;
    }
  },
//Map function
  cancelCurrentTool: function () {
    if ( this._currentTool ) {
      switch ( this._currentTool.property.type ) {
        case 'polyline':
          this.closePolyline( false );
          break;
        case 'polygon':
          this.closePolygon();
          break;
        case 'circle':
          this.closeCircle();
          break;
        case 'rectangle':
          this.closeRectangle();
          break;
        default:
          this.getMarkerLayer().removeLayer( this._currentTool );
          break;
      }

      this.destroyGuideAndVertex();
      delete this._currentTool;
    }
    if ( this._relocatingMarker ) {
      this._relocatingMarker.setLatLng( this._relocatingMarker._lastLatLng );

      this.endRelocatingMarker();
    }

    Map.getInstance().linesOnMap.forEach( function ( arrayTypes ) {
      arrayTypes.forEach( function ( arrayIsDashed ) {
        arrayIsDashed.forEach( function ( l ) {
          l.hideVertexMarkers();
        } )
      } )
    } );

    $( '#map' ).css( "cursor", "default" );
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
  addClosingLineVertex: function () {
    this.addVertexMarkerAndGuideLine();

    this._tooltip = new Tooltip( this );

    this._lastVertexMarker.on( 'click', function () {
      Map.getInstance()._currentTool.calculateDistance();
      Map.getInstance().closePolyline( true );
      Map.getInstance()._tooltip.dispose();
    } );
  },
  addClosingPolygonVertex: function () {
    this.addVertexMarkerAndGuideLine();

    this._lastVertexMarker.on( 'click', function () {
      map.closePolygon();
    } );
  },

  addVertexMarkerAndGuideLine: function () {
    this._lastVertexMarker = new CircleMarker();
    this.getMarkerLayer().addLayer( this._lastVertexMarker );

    this._guideLine = new DashedLine();
    this.getPolylineLayer().addLayer( this._guideLine );
  },
  addEmptyMarkerAndGuideRect: function ( point ) {
    this._lastVertexMarker = {};
    this._guideLine = new DashedRectangle( point );
    this.getPolylineLayer().addLayer( this._guideLine );
  },
  addEmptyMarkerAndGuideCirc: function ( point ) {
    this._lastVertexMarker = {};
    this._guideLine = new DashedCircle( point );
    this.getPolylineLayer().addLayer( this._guideLine );
  },
  removeEmptyMarkerAndGuideCirc: function () {
    if ( this._lastVertexMarker ) {
      this.getMarkerLayer().removeLayer( this._lastVertexMarker );
      this.getPolylineLayer().removeLayer( this._guideLine );
      delete this._guideLine;
      delete this._lastVertexMarker;
    }
  },

  removeVertexMarkerAndGuideLine: function () {
    if ( this._lastVertexMarker ) {
      this.getMarkerLayer().removeLayer( this._lastVertexMarker );
      this.getPolylineLayer().removeLayer( this._guideLine );
      delete this._guideLine;
      delete this._lastVertexMarker;
    }
  },
  closePolyline: function ( createOther ) {
    Map.getInstance()._tooltip.dispose();
    if ( this._currentTool.getLatLngs().length < Line.MIN_VERTEX_SIZE ) {
      this._currentTool.removeLine();
    }
    else {
      this._currentTool.setVertexMarkers();
      this._currentTool.hideVertexMarkers();

      this._currentTool.calculateDistance();

      this._currentTool.on( 'contextmenu', function ( e ) {
        Map.getInstance().onRightClick( e );
      } );

      this.linesOnMap[(this._currentTool.description.type == 'BT') ? 0 : 1][+this._currentTool.description.dashed].push( this._currentTool );
    }

    if ( createOther ) {
      polyline = new Line( this._currentTool.description );
      this._currentTool = polyline;
      this.getPolylineLayer().addLayer( polyline );
      this.removeVertexMarkerAndGuideLine();
      this.controls[1].showVertexesOfSameType();
    }
    else {
      this._currentTool = undefined;
    }
  },

  closePolygon: function () {
    this._currentTool.closeCurrentPolygon();

    if ( this._currentTool.getLatLngs().length < Polygon.MIN_VERTEX_SIZE ) {
      this._currentTool.removePolygon();
    }
    this._currentTool.on( 'contextmenu', function ( e ) {
      Map.getInstance().onRightClick( e );
    } );

    polygon = new Polygon();
    this._currentTool = polygon;
    this.getPolylineLayer().addLayer( polygon );
    this.removeVertexMarkerAndGuideLine();
  },
  closeCircle: function () {
    if ( Map.getInstance()._guideLine ) {
      this._currentTool.setRadius( Map.getInstance()._guideLine.getRadius() );
    }
    if ( this._currentTool.getRadius() < Circle.MIN_RADIUS ) {
      this.getPolygonLayer().removeLayer( this._currentTool );
    }
  },
  closeRectangle: function () {
    this._currentTool.setBounds( this._guideLine.getBounds() );
    this._currentTool.redraw();
  }
} );

Map.getInstance = function () {
  return Map.instance;
}