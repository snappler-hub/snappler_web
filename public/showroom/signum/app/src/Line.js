Line = L.Polyline.extend( {
  initialize: function ( lineOptions ) {
    var polylineOptions = {
      stroke: true,
      color: lineOptions.color,
      weight: 2,
      opacity: 0.8,
      fill: false,
      clickable: true,
      contextmenu: true,
      contextmenuItems: [ ]
    };
    this.description = lineOptions;

    this.property={
      options: polylineOptions,
      name: "Tendido " + this.description.type,
      insertMethod: "push"
    };

    if ( lineOptions.dashed ) {
      polylineOptions.dashArray = [5, 10];
    }

    this.defineContextMenuItems( polylineOptions );

    L.Polyline.prototype.initialize.call( this, [], polylineOptions );

    this.startVertex = new TransparentCircleMarker( 'start', this );
    this.lastVertex = new TransparentCircleMarker( 'last', this );

    this.markersConnecteds = [];

    this.vertexClicked = undefined;

    this.on( 'click', this.onLineClick );
    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);

    return this;
  },

  getBelongingLayer:function(){
    return Map.getInstance().getPolylineLayer();
  },
  defineContextMenuItems: function ( options ) {
    var self = this;
    options.contextmenuItems = [
      {
        separator: true
      },
      {
        text: 'Editar linea',
        icon:'app/assets/images/edit-lines.svg',
        callback: function(){
          self.edit();
        }
      }
    ];
  },

  _continueLineFrom: function(from){
    Map.getInstance()._currentTool = this;
    this.property.insertMethod = from.insertMethod;

    Map.getInstance().removeClosingVertex();
    Map.getInstance().addClosingVertex();
    Map.getInstance().updateClosingVertex( from.continueFrom );

    Map.getInstance()._closingVertexMarker.off( 'click' );

    var self = this;
    Map.getInstance()._closingVertexMarker.on( 'click', function () {
      self.calculateDistance();
      Map.getInstance().cancelCurrentTool();
    } );

    Map.getInstance().showVertexesOfSameType();

    Application.setCrosshairCursor();
  },

  continueLineFromStart: function () {
    this._continueLineFrom({continueFrom: this.getFirstVertex(), insertMethod: "unshift" });
  },

  continueLineFromEnd: function () {
    this._continueLineFrom({continueFrom: this.getLastVertex(), insertMethod: "push" });
  },

  removeLine: function ( deleteLine ) {
    deleteLine = (deleteLine===undefined)? true: deleteLine;
    Map.getInstance().getAuxLayer().removeLayer( this.startVertex );
    Map.getInstance().getAuxLayer().removeLayer( this.lastVertex );

    this.getBelongingLayer().removeLayer( this );

    if ( deleteLine ) {
      Map.getInstance().removeLineByType(this);
      delete this.startVertex;
      delete this.lastVertex;
      delete this;
    }
  },
  removeLastVertex: function ( e ) {
    var lastVertex = this.getLatLngs().pop();
    this.updateLastVertex();
    this.calculateDistance();
    this.redraw();
    if ( this.getLatLngs().length < Line.MIN_VERTEX_SIZE ) this.removeLine(true);
    return lastVertex;
  },

  getFirstVertex: function () {
    return this.getLatLngs()[0];
  },
  getLastVertex: function () {
    return this.getLatLngs()[this.getLatLngs().length - 1];
  },

  calculateDistance: function () {
    if ( this.description.distance != Math.round( L.GeometryUtil.length( this )) )
      this.description.distance = Math.round( L.GeometryUtil.length( this ) );

    //this.bindPopup( "<p>Este tendido tiene una distancia de " + distance + " metros.</p>" );
  },

  onMapClick: function ( e ) {
    if ( !Map.getInstance().hasGuide() ) Map.getInstance().addClosingVertex();

    if ( Map.getInstance()._currentTool ) {
      Util.executeFunctionByName( this.property.insertMethod,this.getLatLngs(), e.latlng );
      this.redraw();

      Map.getInstance()._guideLine.getLatLngs().shift();
      Map.getInstance()._guideLine.redraw();
    }
    else {
      Map.getInstance().setCurrentTool(new Line( Map.getInstance()._currentTool.description ));
    }
    Map.getInstance().updateClosingVertex( e.latlng );
  },
  close: function ( createOther ) {
    Map.getInstance().hideTooltip();
    Map.getInstance().removeClosingVertex();

    if ( this.getLatLngs().length < Line.MIN_VERTEX_SIZE ) {
      this.removeLine(true);
    }
    else {
      this.setVertexMarkers();
      this.hideVertexMarkers();
      this.calculateDistance();

      Map.getInstance().addLineByType(this);
    }

    if ( createOther ) {
      Map.getInstance().setCurrentTool(new Line( this.description ));
      Map.getInstance().removeClosingVertex();
      Map.getInstance().showVertexesOfSameType();
    }
    else {
      Map.getInstance()._currentTool = undefined;
      Map.getInstance().hideConnectorVertexOfLines();
    }
  },
  onLineClick: function ( e ) {
    Map.getInstance().setSelected(this);
//    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].show();
  },

  onMouseMove: function ( e ) {
    if ( Map.getInstance().hasGuide() ) {
      Map.getInstance()._guideLine.setLatLngs( [Map.getInstance()._closingVertexMarker.getLatLng(), e.latlng] );
      Map.getInstance()._currentTool.calculateDistance();

      Map.getInstance()._tooltip.updateContent( {text:'', subtext: Util.readableDistance( Map.getInstance()._currentTool.description.distance + L.GeometryUtil.length( Map.getInstance()._guideLine ) , true )} );
      Map.getInstance()._tooltip.updatePosition( e.latlng );
    }
  },
  updateWeigth: function ( z ) {
    /*this.property.options.weight = Math.pow( 2, Math.floor( (z / 2) ) - 7 );
    this.setStyle( this.property.options );*/
  },

  updateStartVertex: function () {
    this.startVertex.setLatLng( this.getFirstVertex() );
  },

  updateLastVertex: function () {
    this.lastVertex.setLatLng( this.getLastVertex() );
  },

  setVertexMarkers: function () {
    this.updateStartVertex();
    this.updateLastVertex();

    this.startVertex.on( 'click', this.startVertex.clickHandler );
    this.lastVertex.on( 'click', this.lastVertex.clickHandler );
  },

  showVertexMarkers: function () {
    if(this.startVertex !== undefined){
      this.startVertex.getBelongingLayer().addLayer( this.startVertex );
      this.lastVertex.getBelongingLayer().addLayer( this.lastVertex );
    }
  },

  hideVertexMarkers: function () {
    if(this.startVertex !== undefined){
      this.startVertex.getBelongingLayer().removeLayer( this.startVertex );
      this.lastVertex.getBelongingLayer().removeLayer( this.lastVertex );
    }
  },

  edit: function () {
//    this.hideMarkersConnected();

//    Map.getInstance()._editableLines = [new EditableLine( this )];
//    Map.getInstance().getAuxLayer().addLayer( Map.getInstance()._editableLines[0] );
    Map.getInstance().cancelCurrentTool();

    var el = new EditableLine( this );
    Map.getInstance()._editableLines = [el];
    Map.getInstance().getAuxLayer().addLayer( el );
    this.removeLine( true );

    Map.getInstance().contextmenu.setDisabled(1, true);
    Map.getInstance().controls[Map.CTRL_CURSOR].showEndEdit();
  },
  hideMarkersConnected:function(){
    this.markersConnecteds.forEach( function ( m ) {
      Map.getInstance().getMarkerLayer().removeLayer( m );
    } );
  },
  containsPoint: function ( p ) {
    this._iSegment = Line._getIndexesSegment( this, p );
    return ( this._iSegment instanceof Array );
  },

  removeBorder: function () {
    if ( this.property.border !== undefined ) {
      this.property.border.getBelongingLayer().removeLayer( this.property.border );
      delete this.property.border;
    }
  },
  setBorder: function () {
    this.removeBorder();
    this.property.border = new Border( this.getBounds().pad( 0.07 ) );
    this.property.border.getBelongingLayer().addLayer( this.property.border );
  },
  markSelected:function(){
    this.setBorder();
  },
  unmarkSelected:function(){
    this.removeBorder();
  }
} );

Line._getIndexesSegment = function ( line, point ) {
  var pts = line.getLatLngs(),
      segments=[],
      res=[];
  for ( var i = 1; i <= pts.length - 1; i++ ){
    var lat_is_in=point.lat.between(pts[i - 1].lat, pts[i].lat);
    var lng_is_in=point.lng.between(pts[i - 1].lng, pts[i].lng);

    if(lat_is_in && lng_is_in){
      segments.push({a:i - 1, b: i});
    }
  }

  if(segments[0]!==undefined){
    if(segments.length>1){
      for ( var i = 0; i <= segments.length - 1; i++ ){
        if (L.GeometryUtil.belongsSegment( point, pts[segments[i].a], pts[segments[i].b], 0.001 ) ){
          res.push(segments[i].a, segments[i].b);
          break;
        }
      }
    }else{
      res.push(segments[0].a, segments[0].b);
    }
  }
  return res;
};

Line.MIN_VERTEX_SIZE = 2;