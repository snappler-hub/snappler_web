/**
 * Created by snappler on 21/03/14.
 */
EditableLine = L.Polyline.extend( {
  initialize: function ( line, lls ) {
    this._editingLine = line;
    this._editingLineDescription = line.description;
    this.vertexes = [];

    var latlngs = lls || line.getLatLngs();
    var self = this;

    L.Polyline.prototype.initialize.call( this, latlngs, {
      stroke: true,
      color: '#077',
      weight: 4,
      opacity: 1,
      fill: false,
      clickable: true,
      contextmenu: true,
      contextmenuItems: [
        {
          separator: true
        },
        {
          text: '<b> Linea editable </b>'
        },
        {
        text: 'Eliminar segmento',
        callback:
          function(e) {
            self.removeSegment( Line._getIndexesSegment( self, e.latlng ) );
          }
      } ]
    } );

    for ( var i = 0; i < latlngs.length; i++ ) {
      var m = this.createCustomMarker( line, i, latlngs[i], (i==0)||(i==latlngs.length-1));
      m.getBelongingLayer().addLayer(m);
      this.vertexes.push( m );
    }
    this.attachEvent(line, latlngs);
  },

  createCustomMarker: function ( line, i, latlng, isLimit) {
    var self = this;
    var markerFiltered=[];

    if(i>-1){
      markerFiltered = line.markersConnecteds.filter( function ( m ) {
        return m.getLatLng().equals( latlng );
      } );
    }

    return new VertexIndicator(self, latlng, i, markerFiltered[0], isLimit );
  },
  attachEvent:function(line){
    var self = this;

    this.on( 'click', function ( e ) {
      self._segmentSelected=Line._getIndexesSegment( self, e.latlng );
      Map.getInstance().setSelected(self);
    });

    this.on( 'dblclick', function ( e ) {
      var insertAt = Line._getIndexesSegment( self, e.latlng );
      var m = this.createCustomMarker( line, insertAt[1], e.latlng);
      m.getBelongingLayer().addLayer(m);

      self.vertexes.splice( insertAt[1], 0, m );

      for ( var i = 0; i < self.vertexes.length; i++ ) {
        self.vertexes[i]._index = i;
      }

      self.getLatLngs().splice( insertAt[1], 0, m.getLatLng() );
    } );

    this.on('selected',this.markSelected);
    this.on('unselected',this.unmarkSelected);
  },

  removeSegment: function(segmentClicked){
    var self = this;
    var pointsToSegment = self.getLatLngs().slice( 0, segmentClicked[0] + 1 );
    var pointsToNextSegment = self.getLatLngs().slice( segmentClicked[1] );

    if ( pointsToSegment.length >= Line.MIN_VERTEX_SIZE ) {
      self.setLatLngs(pointsToSegment);

      var vtx = self.vertexes.splice( segmentClicked[0] + 1, Number.MAX_VALUE );

      vtx.forEach(function(m){
        Map.getInstance().getAuxLayer().removeLayer( m );
        delete m;
      });
    }else{
      Map.getInstance().getAuxLayer().removeLayer( self );
      self.vertexes.forEach(function(m){
        Map.getInstance().getAuxLayer().removeLayer( m );
        delete m;
      });
      Map.getInstance()._editableLines.splice(Map.getInstance()._editableLines.indexOf(self),1);
    }

    if ( pointsToNextSegment.length >= Line.MIN_VERTEX_SIZE ) {
      var el2 = new EditableLine( this._editingLine, pointsToNextSegment );
      Map.getInstance()._editableLines.push(el2);
      Map.getInstance().getAuxLayer().addLayer( el2 );
    }
  },
  setBorder:function(){},
  handleDel:function(){
    this.removeSegment( this._segmentSelected );
    Map.getInstance().getPolylineLayer().removeLayer(this._segment);
  },
  handleUp:function(){
    this._keyBoardTarget.setLatLng( L.latLng(this._keyBoardTarget.getLatLng().lat+0.0000025, this._keyBoardTarget.getLatLng().lng));
    this.getLatLngs().splice( this._keyBoardTarget._index, 1, this._keyBoardTarget.getLatLng() );
    this.redraw();
  },
  handleDown:function(){
    this._keyBoardTarget.setLatLng( L.latLng(this._keyBoardTarget.getLatLng().lat-0.0000025, this._keyBoardTarget.getLatLng().lng));
    this.getLatLngs().splice( this._keyBoardTarget._index, 1, this._keyBoardTarget.getLatLng() );
    this.redraw();
  },
  handleLeft:function(){
    this._keyBoardTarget.setLatLng( L.latLng(this._keyBoardTarget.getLatLng().lat, this._keyBoardTarget.getLatLng().lng-0.0000025));
    this.getLatLngs().splice( this._keyBoardTarget._index, 1, this._keyBoardTarget.getLatLng() );
    this.redraw();
  },
  handleRight:function(){
    this._keyBoardTarget.setLatLng( L.latLng(this._keyBoardTarget.getLatLng().lat, this._keyBoardTarget.getLatLng().lng+0.0000025));
    this.getLatLngs().splice( this._keyBoardTarget._index, 1, this._keyBoardTarget.getLatLng() );
    this.redraw();
  },
  markSelected:function(e){
    if(this._segmentSelected){
      var lls=this.getLatLngs().slice(this._segmentSelected[0], this._segmentSelected[1]+1);

      this._segment=L.polyline(lls, {
        color:'#c00',
        opacity:1,
        dashArray : [5, 10]} );
      Map.getInstance().getPolylineLayer().addLayer(this._segment);
    }
  },
  unmarkSelected:function(){
    if(this._segment) Map.getInstance().getPolylineLayer().removeLayer(this._segment);
    this.vertexes[0].unmarkSelected();
    this.vertexes[this.vertexes.length-1].unmarkSelected();
  }
} );