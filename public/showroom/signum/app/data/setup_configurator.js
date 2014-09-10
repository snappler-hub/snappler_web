/**
 * Created by snappler on 08/09/14.
 */

Configurator={
  init:function(){
    Application.resetCursor();
    Map.getInstance().controls[Map.CTRL_LINE_AT].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_LINE_MT].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_LINE_BT].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_CURSOR].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_POLYGON].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].removeFrom(Map.getInstance());
    Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].removeFrom(Map.getInstance());

    Map.getInstance().setZoom(18);
    Map.getInstance().off('contextmenu');

    var lines_starts_at = this.addMarkersToMap();
    this.addLinesToMap(lines_starts_at);

    this._onZoomChanges();

    Map.getInstance().on('viewreset', this._onZoomChanges );

    $('.show-general-size-slider #general-plus-size' ).on('click', this._onPlusSizesClick );
    $('.show-general-size-slider #general-minus-size' ).on('click', this._onMinusSizesClick );
  },

  addMarkersToMap:function(){
    var self=this,
      arr=[],
      page=10,
      rows=Math.ceil(elements.length/page);

    for(var i=0; i<rows; i++){
      arr.push(elements.slice(page*i, (page*i)+page));
    }

    var zoom_control_width=43;

    var w = $( "#map" ).width()-zoom_control_width;
    var h = $( "#map" ).height();

    var mw=w;
    var mh=Math.floor(h*(2/3));

    var m_cell_w=Math.floor(mw/page);
    var m_cell_h=Math.floor(mh/rows);

    var m_cell_start, m_cell_end=0;

    arr.forEach(function(elems){
      m_cell_start=zoom_control_width;
      elems.forEach(function(e){
        var el=new window[e.klass]( e.source, Map.getInstance().getZoom() ),

          start_ll=Map.getInstance().containerPointToLatLng( new L.Point(m_cell_start, m_cell_end)),
          end_ll=Map.getInstance().containerPointToLatLng( new L.Point(m_cell_start+m_cell_w, m_cell_end+m_cell_h) ),

          tmp_bounds=new L.LatLngBounds(start_ll, end_ll);

        el.setLatLng(tmp_bounds.getCenter());
        el.getBelongingLayer().addLayer( el );

        el.off('contextmenu');

        el.on('selected', self._onMarkerSelected);
        el.on('unselected', self._onMarkerUnselected);

        m_cell_start+=m_cell_w;
      });
      m_cell_end+=m_cell_h;
    });

    return m_cell_end;
  },

  addLinesToMap: function(lines_starts_at_top){
    var self=this;
    var arr=[],
      page=3,
      rows=Math.ceil(lines.length/page);

    for(var i=0; i<rows; i++){
      arr.push(lines.slice(page*i, (page*i)+page));
    }

    var zoom_control_width=43;

    var w = $( "#map" ).width()-zoom_control_width;
    var h = $( "#map" ).height();

    var lw=w;
    var lh=Math.floor(h*(1/3));

    var l_cell_w=Math.floor(lw/page);
    var l_cell_h=Math.floor(lh/rows);

    var l_cell_start=zoom_control_width, l_cell_end=lines_starts_at_top;

    arr.forEach(function(lines){
      l_cell_start=zoom_control_width;

      lines.forEach(function(line){
        var l= new Line(line),

          start_ll=Map.getInstance().containerPointToLatLng( new L.Point(l_cell_start, l_cell_end) ),
          end_ll=Map.getInstance().containerPointToLatLng( new L.Point(l_cell_start+l_cell_w-zoom_control_width, l_cell_end+l_cell_h) ),

          tmp_bounds=new L.LatLngBounds(start_ll, end_ll);

        l.addLatLng(start_ll);
        l.addLatLng(end_ll);

        l.getBelongingLayer().addLayer( l );

        l.off('contextmenu');

        l.on('selected', self._onLineSelected);
        l.on('unselected', self._onLineUnselected);

        l_cell_start+=l_cell_w;
      });

      l_cell_end+=l_cell_h;
    });
  },

  _onZoomChanges:function(){
    $('.show-zoom .z' ).text(Map.getInstance().getZoom());

    if(Marker.SIZE_TABLE[Map.getInstance().getZoom()]!== undefined)
      $('.show-general-size .size').text(Marker.SIZE_TABLE[Map.getInstance().getZoom()]+'px * '+Marker.SIZE_TABLE[Map.getInstance().getZoom()]+'px');
    else
      $('.show-general-size .size').text('Difiere en cada elemento');
  },
  _onPlusSizesClick:function(){
    Map.getInstance().getMarkerLayer().eachLayer(function(m){
      var cs= m.property.size_table[Map.getInstance().getZoom()],
        tmp_size= L.point(cs*1.1, cs*1.1);

//      if(tmp_size.x<=Marker.MAX_SIZE[0])
      m._doResize(tmp_size);

    });
  },
  _onMinusSizesClick:function(){
    Map.getInstance().getMarkerLayer().eachLayer(function(m){
      var cs= m.property.size_table[Map.getInstance().getZoom()],
        tmp_size= L.point(cs*0.9, cs*0.9);

//      if(tmp_size.x>=Marker.MIN_SIZE[0])
      m._doResize(tmp_size);

    });
  },
  _onMarkerSelected:function(){
    var m = Map.getInstance()._selected;
    $('.marker-general-config' ).hide(0);
    $('.line-specific-config' ).hide(0);

    $('<img width="32" height="32"/>' ).attr('src', m.property.source ).appendTo($('.marker-specific-config' ).find('.show-specific-icon'));

    $('.marker-specific-config' ).find('.show-specific-size .size').text(m.property.size_table[Map.getInstance().getZoom()]+'px * '+
                                                                         m.property.size_table[Map.getInstance().getZoom()]+'px');

    $('.marker-specific-config' ).show(0);
  },
  _onMarkerUnselected:function(){
    $('.marker-specific-config' ).hide(0).find('.show-specific-icon' ).html('');

    $('.line-specific-config' ).hide(0);

    $('.marker-general-config' ).show(0);
  },
  _onLineSelected:function(){
    $('.marker-specific-config' ).hide(0);
    $('.marker-general-config' ).hide(0);

    $('.line-specific-config' ).show(0);
  },
  _onLineUnselected:function(){
    $('.marker-specific-config' ).hide(0);
    $('.line-specific-config' ).hide(0);

    $('.marker-general-config' ).show(0);
  }
};
