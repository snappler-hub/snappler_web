/**
 * Created by snappler on 03/02/14.
 */

Marker = L.Marker.extend( {
  initialize: function ( source, zoom ) {
    Marker.CANT_CREATED++;

    var options = {
      id : Marker.CANT_CREATED,
      icon: new L.DivIcon( {
        className: Marker.CANT_CREATED,
        iconSize: Marker.BASE_SIZE,
        iconAnchor: Marker.BASE_ANCHOR,
        html: '<img src="' + source + '"/>'
      } ),
      draggable: true,
      contextmenu: true,
      contextmenuItems: [ ]
    };

    this.defineContextMenuItems( options );

    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), options );

    // REMEMBER:: DONT ADD POPUP TO A MARKER BEFORE CLICK (no add marker because popup is over)
    this.property={
      id : Marker.CANT_CREATED,
      name : 'Tipico',
      source: source,
      angleRotated : 0,

      iconSize : Marker.BASE_SIZE.clone(),
      currentSize: new L.Point( Marker.BASE_SIZE[0], Marker.BASE_SIZE[0] ) ,

      _labelMarker : new TextMarker( this, {text: 'TRF-12JPV', title: '300kVA'}, Map.getInstance().getZoom() ),
      _iconAt128 : L.icon( {iconUrl: source,
        iconSize: [128, 128],
        iconAnchor: [64, 64]} ),

      connect : Util.clone( signum.data.connect ),

      linesConnecteds : new Array(signum.data.connect.length),
      indexOnLinesConnecteds : [],
      border:undefined
    };

    this._calculateRotation();
    this.updateIconSize( zoom );

    this.attachEvents();
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getMarkerLayer();
  },
   defineContextMenuItems:function(options){
    var self = this;
    options.contextmenuItems = [
      {
        separator: true
      },
      {
        text: '<b>Tipico '+ options.id +'</b>'
      },
      /*{
        text: 'Agrandar icono',
        callback: function ( ) {
          self.enlargeMarker( );
        }
      },{
       text: 'Achicar icono',
       callback: function ( ) {
       self.reduceMarker( );
       }
       },*/
      {
        text: 'Ajustar tamaño',
        callback: function ( ) {
          Application.startWork('resize', self);
//          Application.showResizeControl( self );
        }
      },{
       text: 'Rotar icono',
       callback: function ( ) {
         Application.startWork('rotation', self);
//         Application.showKnobRotator( self );
       }
       },
      {
        text: 'Eliminar icono',
        callback: function ( ) {
          self.removeMarker( );
        }
      }
    ];
  },
  attachEvents: function () {
    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);

    this.on( 'click', this.onMarkerClick );

    this.on( 'dragstart', function ( e ) {
      this.property._labelMarker._distanceToOwner = { lat: this.getLatLng().lat - this.property._labelMarker.getLatLng().lat,
                                                      lng: this.getLatLng().lng - this.property._labelMarker.getLatLng().lng};

      this.property._labelMarker.getBelongingLayer().removeLayer( this.property._labelMarker );
    });

    this.on( 'drag', function ( e ) {
      var self = this;

      this.property.linesConnecteds.forEach( function ( l ) {
        self.unbindLine( l );
      } );
      /*
       if ( this.property.linesConnecteds == 0 ) {
       Map.getInstance().getPolylineLayer().eachLayer( function ( layer ) {
       (layer.overIndicator) ? Map.getInstance().getAuxLayer().removeLayer( layer.overIndicator ) : $.noop;

       if ( self.property.linesConnecteds.indexOf( layer ) == -1 ) {
       var a = Line._getIndexesSegment( layer, self.getLatLng() );
       if ( a instanceof Array ) {
       layer.overIndicator = L.circleMarker( self.getLatLng(), {radius: self.property.iconSize[0] / 2} );
       Map.getInstance().getAuxLayer().addLayer( layer.overIndicator );
       }
       }
       } );
       }*/
    } );

    this.on( 'dragend', function ( e ) {
      this._calculateRotation();

      var ll = L.latLng(this.getLatLng().lat - this.property._labelMarker._distanceToOwner.lat,
                        this.getLatLng().lng - this.property._labelMarker._distanceToOwner.lng);

      this.property._labelMarker.setLatLng( ll );
      this.property._labelMarker._distanceToOwner= {lat: 0, lng: 0};
      /*if ( this.property.linesConnecteds.length == 0 ) {
       this.bindToBelowLines( this.getLatLng() );
       }*/

      /*      Map.getInstance().getPolylineLayer().eachLayer( function ( layer ) {
       (layer.overIndicator) ? Map.getInstance().getAuxLayer().removeLayer( layer.overIndicator ) : $.noop;
       } );*/

    } );
  },

  _doResize: function ( newIconSize ) {
    this.property.currentSize = newIconSize;

    // adjust the icon anchor to the new size
    var newIconAnchor = new L.Point( Math.round( this.property.currentSize.x / 2 ), Math.round( this.property.currentSize.y / 2 ) );

    // finally, declare a new icon and update the marker
    var oldIconOptions = this.options.icon.options;
    oldIconOptions.iconSize = this.property.currentSize;
    oldIconOptions.iconAnchor = newIconAnchor;

    srcAttr = $( oldIconOptions.html ).filter( 'img' ).attr( 'src' );

    oldIconOptions.html = '<img src="' + srcAttr + '" style="width:' + this.property.currentSize.x + 'px; height:' + this.property.currentSize.x + 'px;"/>'

    var newIcon = new L.DivIcon( oldIconOptions );

    this.setIcon( newIcon );
  },
  updateIconSize: function ( currentZoom ) {
    var scaleFactor=this.scaleFactor( currentZoom );
    this._doResize( new L.Point( this.property.currentSize.x * scaleFactor, this.property.currentSize.x * scaleFactor )  );
  },
  scaleFactor: function ( zoom ) {
//    if ( zoom > 14 ) return Math.pow( 2, zoom - Map.DEFAULT_ZOOM );
//    else return Math.pow( 2, -4 );
    return Math.pow( 2, Map.getInstance().getZoom()-Map.getInstance()._lastZoom );
  },

  _calculateRotation: function () {
    this.setIconAngle( this.property.angleRotated );
  },
  rotate: function ( angle ) {
    this.property.angleRotated = angle % 360;
    this._calculateRotation();
  },

  removeMarker: function ( e ) {
    this.removeBorder();
    Map.getInstance().getMarkerLayer().removeLayer( this );
    Map.getInstance().getTextLayer().removeLayer( this.property._labelMarker );

    this.property.linesConnecteds.forEach( function ( l ) {
      l.markersConnecteds.splice( l.markersConnecteds.indexOf( this ), 1 );
    } );

    delete this;
  },

  onMarkerClick: function ( e ) {
    Map.getInstance().setSelected(this);
//    this.setBorder();

    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
    Map.getInstance().setView(this.getLatLng());

    if ( !Map.getInstance()._currentTool ) {
      if ( this.property._labelMarker.getLatLng().equals( L.latLng( 0, 0 ) ) )
        this.property._labelMarker.setLatLng( this.getLatLng() );

      this.property._labelMarker.toggle();
    }
  },
  onMouseMove: function ( e ) {
    Map.getInstance()._currentTool.setLatLng( e.latlng );
  },

  setBorder: function () {
    this.removeBorder();
    var delta = Map.getInstance().latLngToLayerPoint( this.getLatLng() );

    var p1 = Map.getInstance().layerPointToLatLng( [delta.x - (this.property.currentSize.x / 2), delta.y - (this.property.currentSize.y / 2)] );
    var p2 = Map.getInstance().layerPointToLatLng( [delta.x + (this.property.currentSize.x / 2), delta.y + (this.property.currentSize.y / 2)] );

    this.property.border = new Border( [p1, p2] );
    this.property.border.getBelongingLayer().addLayer( this.property.border );
/*
    var self = this;
    setTimeout( function () {
      self.removeBorder()
    }, 1000 );*/
  },
  removeBorder: function () {
    if ( this.property.border !== undefined ) {
      Map.getInstance().getAuxLayer().removeLayer( this.property.border );
      delete this.property.border;
    }
  },

  bindToBelowLines: function ( latlng ) {
    var point = latlng;
    var rotation = 0;
    var self = this;

    Map.getInstance().getPolylineLayer().eachLayer( function ( layer ) {
      //TODO:: Select which line want to be binded.
      if ( self.property.linesConnecteds.indexOf( layer ) == -1 ) {
        var a = Line._getIndexesSegment( layer, point );
        if ( a instanceof Array ) {
          point = Util.pointOverLine( point, layer );
          rotation = L.GeometryUtil.computeAngle( Map.getInstance().latLngToLayerPoint( layer.getLatLngs()[a[0]] ),
            Map.getInstance().latLngToLayerPoint( layer.getLatLngs()[a[1]] ) );

          self.bindLine( layer, point );

          var overIndicator = L.circleMarker( point, {radius: self.property.iconSize[0] / 2} );

          Map.getInstance().getAuxLayer().addLayer( overIndicator );
          setTimeout( function () {
            Map.getInstance().getAuxLayer().removeLayer( overIndicator )
          }, 200 );

          layer.markersConnecteds.forEach( function ( m ) {
            m.property.indexOnLinesConnecteds[m.property.linesConnecteds.indexOf( layer )] = layer.getLatLngs().indexOf( m.getLatLng() );
          } );

        }
      }
    } );
    if ( point.equals( latlng ) ) {
      self.setLatLng( point );
    }

    self.rotate( rotation );
  },

  containsPoint: function ( point ) {
    return point.equals( this.getLatLng() );
  },

  bindLine: function ( layer, point, i ) {
    if ( layer.markersConnecteds.indexOf( this ) == -1 ) {
      /*      a = Line._getIndexesSegment( layer, point );
       point = Util.pointOverLine( point, layer );

       if ( layer.getLatLngs().indexOf( point ) == -1 ) {
       layer.getLatLngs().splice( a[1], 0, point );
       this.setLatLng( point );
       }*/
      this.property.linesConnecteds[i]=layer;
      layer.markersConnecteds.push( this );
      return true;
    }else{
      alert('La linea ya a sido conectada a este elemento');
      return false;
    }
  },
  unbindLine: function ( l ) {
    indexOfCurrentLine = this.property.linesConnecteds.indexOf( l );

    if ( indexOfCurrentLine > -1 ) {
      this.property.linesConnecteds[indexOfCurrentLine].markersConnecteds.splice( this.property.linesConnecteds[indexOfCurrentLine].markersConnecteds.indexOf( this ), 1 );
      this.property.linesConnecteds.splice( indexOfCurrentLine, 1 );
    }
  },

  close:function(){
    Map.getInstance().getMarkerLayer().removeLayer( this );
  },
  handleDel:function(){
    this.removeMarker();
  },
  handleUp:function(){
    this.setLatLng( L.latLng(this.getLatLng().lat+0.0000025, this.getLatLng().lng));
  },
  handleDown:function(){
    this.setLatLng( L.latLng(this.getLatLng().lat-0.0000025, this.getLatLng().lng));
  },
  handleLeft:function(){
    this.setLatLng( L.latLng(this.getLatLng().lat, this.getLatLng().lng-0.0000025));
  },
  handleRight:function(){
    this.setLatLng( L.latLng(this.getLatLng().lat, this.getLatLng().lng+0.0000025));
  },

  handleCtrlUp:function(){
    this._doResize( L.point( this.property.currentSize.x-1, this.property.currentSize.y-1 ) );
  },
  handleCtrlDown:function(){
    this._doResize( L.point( this.property.currentSize.x+1, this.property.currentSize.y+1 ) );
  },
  handleCtrlLeft:function(){
    this.rotate(this.property.angleRotated-1);
  },
  handleCtrlRight:function(){
    this.rotate(this.property.angleRotated+1);
  },

  markSelected:function(e){
    this.setBorder();
  },
  unmarkSelected:function(){
    this.removeBorder();
  }

} );

Marker.BASE_SIZE = [24, 24];
Marker.BASE_ANCHOR = [Marker.BASE_SIZE[0] / 3, Marker.BASE_SIZE[0] / 3];

Marker.MIN_SIZE = Marker.BASE_SIZE[0] / 2;
Marker.MAX_SIZE = Marker.BASE_SIZE[0] * 4;

Marker.CANT_CREATED = 0;