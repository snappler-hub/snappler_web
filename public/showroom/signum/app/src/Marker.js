/**
 * Created by snappler on 03/02/14.
 */

Marker = L.Marker.extend( {
  initialize: function ( source, zoom, icon) {
    Marker.CANT_CREATED++;

    icon = icon || new L.DivIcon( {
      className: Marker.CANT_CREATED,
      iconSize: Marker.BASE_SIZE,
      iconAnchor: Marker.BASE_ANCHOR,
      html: '<img src="' + source + '"/>'
    } );

    var options = {
      id : Marker.CANT_CREATED,
      icon: icon,
      draggable: false,
      contextmenu: true,
      contextmenuItems: [ ]
    };

    this.defineContextMenuItems( options );

    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), options );

    // REMEMBER:: DONT ADD POPUP TO A MARKER BEFORE CLICK (no add marker because popup is over)
    this.property={
      id : Marker.CANT_CREATED,
      source: source,
      angleRotated : 0,

      size_table: Util.clone(Marker.SIZE_TABLE),
      iconSize : Marker.BASE_SIZE.clone(),
      currentSize: new L.Point( Marker.BASE_SIZE[0], Marker.BASE_SIZE[0] ) ,

      _labelMarkers : [],
      /*      _iconAt128 : L.icon( {iconUrl: source,
       iconSize: [128, 128],
       iconAnchor: [64, 64]} ),*/

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
      {separator: true},
      {
        text: '<b>'+this.property.name+' '+ options.id +'</b>'
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
        icon:'app/assets/images/expand.svg',
        callback: function ( ) {
          Application.startWork('resize', self);
//          Application.showResizeControl( self );
        }
      },{
        text: 'Restaurar tamaños',
        icon:'app/assets/images/reset_size.svg',
        callback: function ( ) {
          self.property.size_table=Util.clone(Marker.SIZE_TABLE);
          self.updateIconSize(Map.getInstance().getZoom());
        }
      },
      {separator: true},
      {
        text: 'Rotar icono',
        icon:'app/assets/images/rotate.svg',
        callback: function ( ) {
          Application.startWork('rotation', self);
//         Application.showKnobRotator( self );
        }
      },
      {
        text: 'Restaurar rotacion',
        icon:'app/assets/images/reset_rotation.svg',
        callback: function ( ) {
          self.property.angleRotated=0;
          self.rotate(self.property.angleRotated);
        }
      },
      { separator: true },
      {
        text: "Mostrar Descripcion",
        icon:'app/assets/images/bars.svg',
        callback: function(){
          Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
        }
      },
      {
        text: "Descargar Catálogo",
        icon:'app/assets/images/download.svg',
        callback: function(){
          Application.downloadPDF("app/data/sample.pdf");
        }
      },
      { separator: true },
      {
        text: 'Agregar etiqueta',
        icon:'app/assets/images/plus.svg',
        callback: function(){
          if(self.property._labelMarkers.length===0){
            self.addLabel();
          }else{
            alert("Éste marcador ya tiene etiquetas asociadas.");
          }
        }
      },
      {
        text: 'Eliminar etiquetas',
        icon:'app/assets/images/minus.svg',
        callback: function(){
          self.removeLabels();
        }
      },
      {
        text: 'Mostrar etiquetas asociadas',
        icon:'app/assets/images/eye.svg',
        callback: function(){
          self.showLabels();
        }
      },
      {
        text: 'Ocultar etiquetas asociadas',
        icon:'app/assets/images/eye-blocked.svg',
        callback: function(){
          self.hideLabels();
        }

      },
      {separator: true},
      {
        text: 'Eliminar icono',
        icon:'app/assets/images/remove.svg',
        callback: function ( ) {
          vex.dialog.confirm({
            message: "Esta seguro de eliminar este marcador",
            callback: function() {
              self.removeMarker( );
            }
          });
        }
      }
    ];
  },
  attachEvents: function () {
    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);

    this.on( 'click', this.onMarkerClick );
    this.on( 'dblclick', this.onMarkerDblClick );

    this.on( 'dragstart', function ( e ) {
      if(this===Map.getInstance()._selected){
        this.property._labelMarkers.forEach(function(lm){
          lm.calculateDistanceToOwner();
        });

        this.hideLabels();
      }else{
        return false;
      }
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
      this.property._labelMarkers.forEach(function(lm){
        lm.relocateToOwner();
      });

      /*if ( this.property.linesConnecteds.length == 0 ) {
       this.bindToBelowLines( this.getLatLng() );
       }*/

      /*      Map.getInstance().getPolylineLayer().eachLayer( function ( layer ) {
       (layer.overIndicator) ? Map.getInstance().getAuxLayer().removeLayer( layer.overIndicator ) : $.noop;
       } );*/

    } );
  },

  _doResize: function ( newIconSize ) {
    this.property.size_table[Map.getInstance().getZoom()]=newIconSize.x;
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
    var newSize=this.scaleSize(currentZoom);
    this._doResize( new L.Point( newSize, newSize )  );

/*    var scaleFactor=this.scaleFactor( currentZoom );
    this._doResize( new L.Point( this.property.currentSize.x * scaleFactor, this.property.currentSize.x * scaleFactor )  );*/
  },
  scaleSize:function(currentZoom){
    return this.property.size_table[currentZoom];
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
    this.getBelongingLayer().removeLayer( this );
    this.removeLabels();
//    Map.getInstance().getTextLayer().removeLayer( this.property._labelMarker );

    this.property.linesConnecteds.forEach( function ( l ) {
      l.markersConnecteds.splice( l.markersConnecteds.indexOf( this ), 1 );
    } );

    delete this;
  },

  onMarkerClick: function ( e ) {
    if ( !Map.getInstance()._currentTool ) {
//    this.setBorder();
      /*      if ( this.property._labelMarker.getLatLng().equals( L.latLng( 0, 0 ) ) )
       this.property._labelMarker.setLatLng( this.getLatLng() );

       this.property._labelMarker.toggle();*/
    }else{
      var navHeight=$('.navbar' ).css('height').replace('px','');
      e.latlng=Map.getInstance().containerPointToLatLng( L.point(e.originalEvent.clientX, e.originalEvent.clientY-navHeight) );

      Map.getInstance().fire('click', e);
    }
  },
  onMarkerDblClick:function(){
    this.dragging.enable();
    Map.getInstance().setSelected(this);
  },
  onMouseMove: function ( e ) {
    Map.getInstance()._currentTool.setLatLng( e.latlng );
  },
  updateBorder:function(){
    if ( this.property.border !== undefined ) {
      var delta = Map.getInstance().latLngToLayerPoint( this.getLatLng() );

      var p1 = Map.getInstance().layerPointToLatLng( [delta.x - (this.property.currentSize.x / 2), delta.y - (this.property.currentSize.y / 2)] );
      var p2 = Map.getInstance().layerPointToLatLng( [delta.x + (this.property.currentSize.x / 2), delta.y + (this.property.currentSize.y / 2)] );

      this.property.border.setBounds([p1, p2]);
    }
  },
  setBorder: function () {
    this.removeBorder();
    var delta = Map.getInstance().latLngToLayerPoint( this.getLatLng() );

    var p1 = Map.getInstance().layerPointToLatLng( [delta.x - (this.property.currentSize.x / 2), delta.y - (this.property.currentSize.y / 2)] );
    var p2 = Map.getInstance().layerPointToLatLng( [delta.x + (this.property.currentSize.x / 2), delta.y + (this.property.currentSize.y / 2)] );

    this.property.border = new Border( [p1, p2] );
    this.property.border.getBelongingLayer().addLayer( this.property.border );

    this.on('move', this.updateBorder);
    this.on('resize', this.updateBorder);

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
    this.fire('resize');
  },
  handleCtrlDown:function(){
    this._doResize( L.point( this.property.currentSize.x+1, this.property.currentSize.y+1 ) );
    this.fire('resize');
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
    this.dragging.disable();
    this.removeBorder();
  },

  addLabel:function(){
    var lm = new TextMarker( this, {text: 'TRF-12JPV', title: '300kVA'}, Map.getInstance().getZoom() );
    this.property._labelMarkers.push(lm);
    lm.toggle();
  },

  removeLabels:function(){
    this.hideLabels();
    this.property._labelMarkers=[];
  },

  showLabels:function(){
    this.property._labelMarkers.forEach(function(lm){
      lm.getBelongingLayer().addLayer( lm );
    });
  },

  hideLabels:function(){
    this.property._labelMarkers.forEach(function(lm){
      lm.getBelongingLayer().removeLayer( lm );
    });
  }
} );

Marker.BASE_SIZE = [48, 48];
Marker.BASE_ANCHOR = [Marker.BASE_SIZE[0] / 3, Marker.BASE_SIZE[0] / 3];

Marker.MIN_SIZE = Marker.BASE_SIZE[0] / 2;

Marker.SIZE_TABLE={
  "15": undefined,
  "16": Marker.BASE_SIZE[0]/2,
  "17": Marker.BASE_SIZE[0],
  "18": Marker.BASE_SIZE[0]*2,
  "19": Marker.BASE_SIZE[0]*3,
  "20": Marker.BASE_SIZE[0]*4,
  "21": Marker.BASE_SIZE[0]*6,
  "22": Marker.BASE_SIZE[0]*8
};

Marker.CANT_CREATED = 0;

Marker.IDEAL_ZOOM=17;

Marker.INFLECTION_ZOOM=15;