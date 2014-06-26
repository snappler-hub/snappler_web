/**
 * Created by snappler on 13/02/14.
 */
Util = {};

Util.keyCode= {
  BACKSPACE:8,
  COMMA:188,
  DELETE:46,
  DOWN:40,
  END:35,
  ENTER:13,
  ESCAPE:27,
  HOME:36,
  LEFT:37,
  NUMPAD_ADD:107,
  NUMPAD_DECIMAL:110,
  NUMPAD_DIVIDE:111,
  NUMPAD_ENTER:108,
  NUMPAD_MULTIPLY:106,
  NUMPAD_SUBTRACT:109,
  PAGE_DOWN:34,
  PAGE_UP:33,
  PERIOD:190,
  RIGHT:39,
  SPACE:32,
  TAB:9,
  UP:38
};

Util.executeFunctionByName = function ( functionName, context /*, args */ ) {
  var args = Array.prototype.slice.call( arguments, 2 );
  var namespaces = functionName.split( "." );
  var func = namespaces.pop();
  for ( var i = 0; i < namespaces.length; i++ ) {
    context = context[namespaces[i]];
  }
  return context[func].apply( context, args );
};

Util.pointInPolygon = function ( point, latlngs ) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point.lng, y = point.lat;

  var inside = false;
  for ( var i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++ ) {
    var xi = latlngs[i].lng, yi = latlngs[i].lat;
    var xj = latlngs[j].lng, yj = latlngs[j].lat;

    var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if ( intersect ) {
      inside = !inside;
    }
  }

  return inside;
};

Util.pointOverLine = function ( point, line ) {
  return L.GeometryUtil.interpolateOnLine( Map.getInstance(), line.getLatLngs(),
    L.GeometryUtil.locateOnLine( Map.getInstance(), line, point ) ).latLng
};

Util._createButton= function ( options ) {
  var self = this;
  var link = L.DomUtil.create( 'a', options.className || '', options.container );
  link.href = '#';

  if ( options.text ) link.innerHTML = options.text;

  if ( options.title ) link.title = options.title;


  L.DomEvent
    .on( link, 'click', L.DomEvent.stopPropagation )
    .on( link, 'mousedown', L.DomEvent.stopPropagation )
    .on( link, 'dblclick', L.DomEvent.stopPropagation )
    .on( link, 'click', L.DomEvent.preventDefault )
    .on( link, 'click', function(){
      self._selected(options.options, options.actions, options.callback);
    } );

  return link;
};

Util._selected= function( options, actions, callback ) {
  Map.getInstance().cancelCurrentTool();

  callback(options);

  $( actions ).fadeToggle('fast');
  //Hide All Controls
  for(var i=0;i<Map.getInstance().controls.length;i++){
    $(Map.getInstance().controls[i].actions).hide();
  }
};

Util.readableDistance= function (distance, isMetric) {
  var distanceStr;

  if (isMetric) {
    // show metres when distance is < 1km, then show km
    if (distance > 1000) {
      distanceStr = (distance  / 1000).toFixed(2) + ' km';
    } else {
      distanceStr = Math.ceil(distance) + ' m';
    }
  } else {
    distance *= 1.09361;

    if (distance > 1760) {
      distanceStr = (distance / 1760).toFixed(2) + ' miles';
    } else {
      distanceStr = Math.ceil(distance) + ' yd';
    }
  }

  return distanceStr;
}

Array.prototype.clone = function () {
  return this.slice( 0 )
};
Array.range= function(a, b, step){
  var A= [];
//  if(typeof a== 'number'){
  A[0]= a;
  step= step || 1;
  while(a+step<= b){
    A[A.length]= a+= step;
  }
//  }
/*  else{
    var s= 'abcdefghijklmnopqrstuvwxyz';
    if(a=== a.toUpperCase()){
      b=b.toUpperCase();
      s= s.toUpperCase();
    }
    s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
    A= s.split('');
  }*/
  return A;
};

Number.prototype.between  = function (a, b) {
  var min = Math.min.apply(Math, [a,b]), max = Math.max.apply(Math, [a,b]);
  return this >= min && this <= max;
};
Util.clone=function(obj){
  if(obj == null || typeof(obj) != 'object')
    return obj;

  var temp = obj.constructor(); // changed

  for(var key in obj)
    temp[key] = Util.clone(obj[key]);
  return temp;
};

Util.pointBelongsInSegment=function( ll_intersect, ll1, ll2 ){
  var dist_1_2=Util.clipFloat(ll1.distanceTo(ll2), 3);
  var dist_1_int= Util.clipFloat(ll1.distanceTo(ll_intersect), 3);
  var dist_int_2= Util.clipFloat(ll_intersect.distanceTo(ll2), 3);

  return dist_1_2===(Util.clipFloat(dist_1_int+dist_int_2,3));
};

Util.clipFloat=function(num,dec){
  var t=num+"";
  num = parseFloat(t.substring(0,(t.indexOf(".")+dec+1)));
  return (num);
};