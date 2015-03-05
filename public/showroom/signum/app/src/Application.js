Application = {};
Application.setup = function ( ) {
  $( '.leaflet-control-layers-selector[type=checkbox]' ).trigger( "click" );

  $( '#map' ).focus();

  $( 'tbody td' ).each( function ( i, td ) {
    $( $( 'thead th' )[i] ).css( 'width', $( td ).css( 'width' ) );
  } );

  vex.defaultOptions.className = 'vex-theme-default';

//CLICK THEAD TOGGLE TBODY VISIBILITY
  /*  $('#ver-minimalist thead tr' ).on('click', function(e){
   $('tbody').fadeToggle(0);
   $('#map' ).css('top', $('.navbar' ).css('height'));
   });*/
};

Application.resetCursor = function () {
  $( '#map' ).css( "cursor", "default" );
};
Application.setCrosshairCursor = function () {
  $( '#map' ).css( "cursor", "crosshair" );
};

Application.showKnobRotator = function () {
  var point = Map.getInstance().latLngToContainerPoint( Application.workingTarget.getLatLng() );

  Application.knobRotator = $( '<input/>' ).val( Application.workingTarget.property.angleRotated );
  Application.knobRotator.knob( {
    'cursor': 15,
    'displayInput': false,
    'min': 0,
    'max': 360,
    'step': 1,
    'thickness': ".2",
    'width': Application.workingTarget.property.currentSize.x+100,
    'height': Application.workingTarget.property.currentSize.x+100,
    'fgColor': '#000000',
    'change': function ( angle ) {
      Application.workingTarget.rotate( angle );
    },
    'release': function ( angle ) {
      Application.workingTarget.rotate( angle );
    }
  } )
    .css( {'position': 'absolute',
      'z-index': '2147483647',
      "left": point.x - (Application.workingTarget.property.currentSize.x+100)/2,
      "top": point.y- (Application.workingTarget.property.currentSize.x+100)/2
    } )
    .insertBefore( '#map' );
};
Application.hideKnobRotator = function () {
  Application.knobRotator.parent().remove();
};

Application.showResizeControl = function () {
  var point = Map.getInstance().latLngToContainerPoint( Application.workingTarget.getLatLng() );

  Application.resizeControl = $( '<div/>' ).addClass( 'resizable' );
  Application.resizeControl.resizable( {
    handles: 'se',
    aspectRatio: true,

    minHeight: Marker.MIN_SIZE,
    minWidth: Marker.MIN_SIZE,
    grid: 6,
    helper: "ui-resizable-helper",

    stop: function ( event, ui ) {
      Application.workingTarget._doResize( L.point( ui.size.width, ui.size.height ) );

      var ll = Map.getInstance().containerPointToLatLng( L.point( ui.position.left + Application.workingTarget.property.currentSize.x / 2,
                                                                  ui.position.top + Application.workingTarget.property.currentSize.y / 2 ) );

      Application.workingTarget.setLatLng( ll );
    }
  } )
    .css( {'position': 'absolute',
      'z-index': '2147483647',
      'width': Application.workingTarget.property.currentSize.x,
      'height': Application.workingTarget.property.currentSize.y,
      "left": point.x - Application.workingTarget.property.currentSize.x / 2,
      "top": point.y - Application.workingTarget.property.currentSize.y / 2
    } )
    .insertBefore( '#map' );
};

Application.hideResizeControl = function () {
//  $('.'+Application.workingTarget.property.id ).removeClass('resizable');
//  $('.'+Application.workingTarget.property.id ).resizable( "destroy" );
  Application.resizeControl.resizable( "destroy" );
  Application.resizeControl.remove();
};
Application.startWork = function ( work, target ) {
  Application.workingOn = work;
  Application.workingTarget = target;
//  Application.workingTarget.hideLabels();

//  Map.getInstance().getTextLayer().removeLayer( Application.workingTarget.property._labelMarker );
  Map.getInstance().controls[Map.CTRL_CURSOR].showEndRotation();
  Map.getInstance().disableContextMenu();

  Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].hide();
  $( ".leaflet-control-topbar" ).css( "display", "none" );

  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();
  $( ".leaflet-control-sidebar" ).css( "display", "none" );

  Application.workingTarget.dragging.disable();

  switch ( Application.workingOn ) {
    case 'rotation':
      Map.getInstance().once( 'focused', Application.showKnobRotator );
      break;
    case 'resize':
      Application._lastRotation= Application.workingTarget.property.angleRotated;
      Application.workingTarget.rotate(0);
      Map.getInstance().once( 'focused', Application.showResizeControl );
      break;
    default:
      break;
  }
  Map.getInstance().setView( Application.workingTarget.getLatLng() ).fire( 'focused' );
};
Application.finishWork = function () {
  switch ( Application.workingOn ) {
    case 'rotation':
      Application.hideKnobRotator();
      break;
    case 'resize':
      Application.hideResizeControl();
      Application.workingTarget.rotate(Application._lastRotation);
      Application._lastRotation=undefined;
      break;
    case 'resize-text-marker':
      Application.workingTarget.dragging.enable();
      Application.hideResizeControl();
      Application.workingTarget.rotate(Application._lastRotation);
      Application._lastRotation=undefined;
      break;
    default: break;
  }

  if(Application.workingOn !== undefined){

    Application.workingTarget.fire(Application.workingOn);

    Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].show();
    $( ".leaflet-control-topbar" ).css( "display", "block" );
    $( ".leaflet-control-sidebar" ).css( "display", "block" );

    Map.getInstance().controls[Map.CTRL_CURSOR].endMarkerAction();

    Map.getInstance().enableContextMenu();

    Application.workingOn = undefined;
    Application.workingTarget = undefined;
  }else{
    if(Application._polyTarget!==undefined){
      Map.getInstance().off('mousemove', Application._onMapMouseMove);
      Map.getInstance().off('click', Application._onMapClick);

      Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].show();
      $( ".leaflet-control-topbar" ).css( "display", "block" );
      $( ".leaflet-control-sidebar" ).css( "display", "block" );

      Map.getInstance().controls[Map.CTRL_CURSOR].endMarkerAction();

      Map.getInstance().enableContextMenu();

      if(Application._polyPhantom!==undefined)
        Map.getInstance().getAuxLayer().removeLayer(Application._polyPhantom);

      Application._polyTarget=undefined;
      Application._polyPhantom=undefined;
      Application._polyLastCenter=undefined;
    }
  }
};

Application.relocateSvg = function ( s, marker ) {
  s.attr( { preserveAspectRatio: "xMinYMin meet" } );

  $( "." + marker.property.id ).find( 'svg' ).css( "z-index", "2147483647" );
  $( "." + marker.property.id ).find( 'svg' ).css( 'position', 'fixed' );
  $( "." + marker.property.id ).find( 'svg' ).css( "top", '0px' );
  $( "." + marker.property.id ).find( 'svg' ).css( "left", '0px' );
  $( "." + marker.property.id ).find( 'svg' ).css( "width", "200" );
  $( "." + marker.property.id ).find( 'svg' ).css( "height", "150" );
};

Application.showFancyBox=function (image){
  $('.fancybox' ).attr("href", image ).click();
};

Application.prompt=function(message, returnedString){
//  return prompt(message);

  var defer = $.Deferred();
  vex.dialog.open({
    message: message,
    input: '<textarea id="promptTextArea" name="promptTextArea" ></textarea>',
    callback:function(value){
      if(value!==false)
        defer.resolve(value.promptTextArea.replaceAll('\n','<br/>'));
      else
        defer.resolve(value);
    }
  });

  return defer.promise();
};

Application.downloadPDF=function(url){
  vex.dialog.alert({
    message:"Aguarde un momento..."
  });

  setTimeout(function(){
    window.open(url);
  }, 500);

};

Application.printMap=function(DOMid){
  if(Application.pdfGenerator===undefined)
    Application.pdfGenerator=new jsPDF('l');


  Application.pdfGenerator.addHTML(document.getElementById('map'), function() {
    var string = Application.pdfGenerator.output('datauristring');
//    $('.preview-pane').attr('src', string);
    window.open(string);
  });
};

Application._move=function(poly, phantom){

  Map.getInstance().controls[Map.CTRL_CURSOR].showEndRotation();
  Map.getInstance().disableContextMenu();

  Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].hide();
  $( ".leaflet-control-topbar" ).css( "display", "none" );

  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();
  $( ".leaflet-control-sidebar" ).css( "display", "none" );

  Application._polyTarget=poly;
  Application._polyLastCenter=poly.getBounds().getCenter();

  Application._polyPhantom = phantom;

  Map.getInstance().getAuxLayer().addLayer(Application._polyPhantom);

  Map.getInstance().on('mousemove', Application._onMapMouseMove);
  Map.getInstance().on('click', Application._onMapClick);
};
Application.moveCircle=function(circle){
  Application._move(circle, new L.Circle(circle.getLatLng(), circle.getRadius(),{
    color:"#0000ff",
    dashArray:[5, 10],
    fill:false
  }));
};
Application.movePolygon=function(poly){
  Application._move(poly, new L.Polygon(poly.getLatLngs(), {
    color:"#0000ff",
    dashArray:[5, 10],
    fill:false
  }));
};
Application._onMapClick=function(e){
  Map.getInstance().off('mousemove', Application._onMapMouseMove);
  Map.getInstance().off('click', Application._onMapClick);


  if(typeof Application._polyPhantom.setLatLngs === "function")
    Application._polyTarget.setLatLngs(Application._polyPhantom.getLatLngs());
  else
    Application._polyTarget.setLatLng(Application._polyPhantom.getLatLng());

  Map.getInstance().getAuxLayer().removeLayer(Application._polyPhantom);

  Application.finishWork();
};
Application._onMapMouseMove=function(e){
  if(typeof Application._polyPhantom.setLatLngs === "function")
    Application._polyPhantom.setLatLngs(Util.relocateCoords(Application._polyLastCenter, e.latlng, Application._polyPhantom.getLatLngs()));
  else
    Application._polyPhantom.setLatLng(Util.relocateCoords(Application._polyLastCenter, e.latlng, Application._polyPhantom.getLatLng()));

  Application._polyLastCenter=e.latlng;
};

Application.showResizeControlForTextMarker = function (target) {
  //TODO::REFACTOR!!!
  Application.workingTarget = target;
  Application.workingOn = 'resize-text-marker';

  Map.getInstance().controls[Map.CTRL_CURSOR].showEndRotation();
  Map.getInstance().disableContextMenu();

  Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].hide();
  $( ".leaflet-control-topbar" ).css( "display", "none" );

  Map.getInstance().controls[Map.CTRL_TOOGLE_SIDEBAR].hide();
  $( ".leaflet-control-sidebar" ).css( "display", "none" );

  Application.workingTarget.dragging.disable();

  /*switch ( Application.workingOn ) {
    case 'rotation':
      Map.getInstance().once( 'focused', Application.showKnobRotator );
      break;
    case 'resize':
      Application._lastRotation= Application.workingTarget.property.angleRotated;
      Application.workingTarget.rotate(0);
      Map.getInstance().once( 'focused', Application.showResizeControl );
      break;
    default:
      break;
  }
  */
  Map.getInstance().setView( Application.workingTarget.getLatLng() ).fire( 'focused' );
  /*------------------------------------------------------------------------------------------------------------------*/
  var point = Map.getInstance().latLngToContainerPoint( Application.workingTarget.getLatLng() );

  Application.resizeControl = $( '<div/>' ).addClass( 'resizable' );
  Application.resizeControl.resizable( {
    handles: 'se',
    aspectRatio: true,

    minWidth: Application.workingTarget.getBaseFontSize()*TextMarker.SIZE_TABLE[15]*Application.workingTarget.getMaxLengthRow(),
//    minHeight: Application.workingTarget.getBaseFontSize()*TextMarker.SIZE_TABLE[15]*Application.workingTarget.getCantRows(),
    maxWidth:($('#map').width()/2)-50,
    maxHeight:($('#map').height()/2)-20,
    grid: 1,
    helper: "ui-resizable-helper",

    stop: function ( event, ui ) {
      var w = (ui.size.width / (Application.workingTarget.getBaseFontSize() * Application.workingTarget.getMaxLengthRow())).toFixed(2);

//      var w = (ui.size.width / Util.getElementFontSize()).toFixed(2);
      Application.workingTarget._doResize( L.point( w, w ) );

/*      console.log('-----------------------------------------------------------------------');
      console.log('minWidth:'+ Application.workingTarget.getBaseFontSize()*TextMarker.SIZE_TABLE[15]*Application.workingTarget.getMaxLengthRow());
      console.log('minHeight:'+ Application.workingTarget.getBaseFontSize()*TextMarker.SIZE_TABLE[15]*Application.workingTarget.getCantRows());
      console.log('-----------------------------------------------------------------------');
      console.log('getLength:'+Application.workingTarget.getLength(), 'getMaxLengthRow:'+Application.workingTarget.getMaxLengthRow(), 'getCantRows:'+Application.workingTarget.getCantRows());
      console.log('getBoxWidth:'+Application.workingTarget.getBoxWidth(), 'getWidth:'+Application.workingTarget.getWidth());
      console.log('getBoxHeight:'+Application.workingTarget.getBoxHeight(), 'getHeight:'+Application.workingTarget.getHeight());
      console.log('getCurrentFontSize:'+Application.workingTarget.getCurrentFontSize(), 'getBaseFontSize:'+Application.workingTarget.getBaseFontSize(), 'getClassNameFontSize:'+Application.workingTarget.getClassNameFontSize());
      console.log(ui.size.width, w);*/

/*      var ll = Map.getInstance().containerPointToLatLng( L.point( ui.position.left - Application.workingTarget.getWidth() / 2,
                                                                  ui.position.top - Application.workingTarget.getHeight() / 2 ) );
      Application.workingTarget.setLatLng( ll );*/
    }
  } )
    .css( {'position': 'absolute',
      'z-index': '2147483647',
      'width': Application.workingTarget.getBoxWidth(),
      'height': Application.workingTarget.getBoxHeight(),
      "left": point.x,
      "top": point.y
    } )
    .insertBefore( '#map' );
};

Application.initTestTextMarker=function(){
  var tx = new TextMarker( undefined, {text: '1q2w3e<br/>4r5t6y'} );
  tx.setLatLng(Map.getInstance().getCenter());
  tx.getBelongingLayer().addLayer( tx );
  tx.updateIconSize(Map.getInstance().getZoom());
//  Application.showResizeControlForTextMarker(tx);
  return tx;
};

Application.initSelectionBox=function(){
  L.DomUtil.disableTextSelection();
  L.DomUtil.disableImageDrag();
  Map.getInstance().cancelCurrentTool();
  Map.getInstance().controls[Map.CTRL_CURSOR].showEndRotation();
  Map.getInstance().disableContextMenu();

  Map.selectionBoxHandler=new SelectionBoxHandler();
};

Application.finishSelectionBox=function(){
  L.DomUtil.enableTextSelection();
  L.DomUtil.enableImageDrag();
  Map.getInstance().controls[Map.CTRL_TOOGLE_TOPBAR].show();
  $( ".leaflet-control-topbar" ).css( "display", "block" );
  $( ".leaflet-control-sidebar" ).css( "display", "block" );

  Map.getInstance().controls[Map.CTRL_CURSOR].endMarkerAction();

  Map.getInstance().enableContextMenu();

  Map.getInstance().controls[Map.CTRL_CURSOR].endMarkerAction();

  Map.selectionBoxHandler.removeBoxSelection();
  Map.selectionBoxHandler.__removeHandlers();
  Map.selectionBoxHandler=undefined;

};