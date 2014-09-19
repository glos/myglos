var catalogQueryXML       = "<query xmlns=\"http:\/\/basex.org\/rest\">\n  <text>\n  <![CDATA[\n\tdeclare namespace gmd=\"http:\/\/www.isotc211.org\/2005\/gmd\"; \n\tdeclare namespace gco=\"http:\/\/www.isotc211.org\/2005\/gco\"; \n\tdeclare namespace gmi=\"http:\/\/www.isotc211.org\/2005\/gmi\";\n\tdeclare namespace gml=\"http:\/\/www.opengis.net\/gml\";\n\tdeclare namespace xs=\"http:\/\/www.w3.org\/2001\/XMLSchema\";\n\t\n\tdeclare function local:FreeTextQueryFunction($textsearch)\n\t{\n\t  let $searchTerms := tokenize($textsearch,'\\s+')\n\t\n\t  for $val in \/*\n\t\twhere ($val\/\/text() contains text {$searchTerms} all words using fuzzy)\n\t\t  return$val\n\t};\n\t\n\tdeclare function local:GeoSpatialWithinQueryFunction($sequences, $west, $east, $north, $south)\n\t{\n\t  for $val in $sequences\n\t\tlet $bbox := $val\/\/*:EX_GeographicBoundingBox\n\t\tlet $westB := $bbox\/*:westBoundLongitude\/*:Decimal\n\t\tlet $eastB := $bbox\/*:eastBoundLongitude\/*:Decimal\n\t\tlet $southB := $bbox\/*:southBoundLatitude\/*:Decimal\n\t\tlet $northB := $bbox\/*:northBoundLatitude\/*:Decimal\n\t\twhere ($west <= $westB and \n\t\t\t   $east >= $eastB and\n\t\t\t   $south <= $southB and\n\t\t\t   $north >= $northB)\n\t\t  return $val   \n\t};\n\t\n\tdeclare function local:TemporalIntersectsQueryFunction($sequences, $startQ, $endQ)\n\t{\n\t  for $val in $sequences\n\t\tlet $bbox := $val\/\/*:TimePeriod\n\t\tlet $startB := $bbox\/*:beginPosition\n\t\tlet $endB := $bbox\/*:endPosition\n\t\t\n\t\tlet $now := xs:string(adjust-dateTime-to-timezone(current-dateTime(),xs:dayTimeDuration(\"PT0H\")))\n\t\t\n\t\tlet $endB := if($endB\/@indeterminatePosition = \"now\") then\n\t\t\t\t\t   $now\n\t\t\t\t\t else\n\t\t\t\t\t   $endB\n\t\t\n\t\tlet $startB := if($startB\/@indeterminatePosition = \"now\") then\n\t\t\t\t\t   $now\n\t\t\t\t\t else\n\t\t\t\t\t   $startB\n\t\t\n\t\twhere (\n\t\t\t\t$startB != \"\" and $startQ <= $startB and $startB <= $endQ \n\t\t\t\tor\n\t\t\t\t$endB != \"\" and $endQ >= $endB and $endB >= $startQ\n\t\t\t\tor\n\t\t\t\t$startB != \"\" and $endB != \"\" and  $startB <= $startQ and $startQ <= $endB\n\t\t\t\tor \n\t\t\t\t$endB != \"\" and $startB != \"\" and $endB >= $endQ and $endQ >= $startB\n\t\t\t\t\n\t\t\t\t)\n\t\t  return $val   \n\t};\n\t\n\t\n\tdeclare function local:GeoSpatialIntersectsQueryFunction($sequences, $westQ, $eastQ, $northQ, $southQ)\n\t{\n\t  for $val in $sequences\n\t\tlet $bbox := $val\/\/*:EX_GeographicBoundingBox\n\t\tlet $westB := $bbox\/*:westBoundLongitude\/*:Decimal\n\t\tlet $eastB := $bbox\/*:eastBoundLongitude\/*:Decimal\n\t\tlet $southB := $bbox\/*:southBoundLatitude\/*:Decimal\n\t\tlet $northB := $bbox\/*:northBoundLatitude\/*:Decimal\n\t\twhere (\n\t\t\t\t(:If the query bounds contains any corner of the FOI's bounds:)\n\t\t\t\t($eastQ >= $westB and $westB >= $westQ or\n\t\t\t\t $westQ <= $eastB and $eastB <= $eastQ or\n\t\t\t\t $eastB >= $westQ and $westQ >= $westB or \n\t\t\t\t $westB <= $eastQ and $eastQ <= $eastB) \n\t\t\t\t and \n\t\t\t\t($northQ >= $northB and $northB >= $southQ or\n\t\t\t\t $southQ <= $southB and $southB <= $northQ or \n\t\t\t\t $northB >= $northQ and $northQ >= $southB or\n\t\t\t\t $southB <= $southQ and $southQ <= $northB)\n\t\t\t  )\n\t\t  return $val   \n\t};\n\t\n\tdeclare function local:OrderByFunction($sequences)\n\t{\n\t  for $val in $sequences\n\t\tlet $title := $val\/\/*:identificationInfo\/*:MD_DataIdentification\/*:citation\/*:CI_Citation\/*:title\/*:CharacterString\/text()\n\t\torder by $title\n\t\treturn $val\n\t};\n\t\n\t\n\tdeclare function local:FormatResult($fois)\n\t{\n\t\n\t  for $foi in $fois\n\t  return\n\t  <gmd:MD_Metadata>\n\t  {$foi\/gmd:fileIdentifier}\n\t  {$foi\/gmd:identificationInfo}\n\t  {$foi\/gmd:distributionInfo}\n\t  {$foi\/gmd:contentInfo}\n\t  <\/gmd:MD_Metadata>\n\t  \n\t};\n\t\n\t\n\tdeclare variable $records as xs:integer external := 20;\n\tdeclare variable $start as xs:integer external := 1;\n\t\t\n\tdeclare variable $textSearch as xs:boolean external := true();\n\tdeclare variable $searchTerm as xs:string external := \"water temperature\";\n\t\t\n\tdeclare variable $geoSearch as xs:boolean external := false();\n\tdeclare variable $west as xs:decimal external  := -96.0;\n\tdeclare variable $east as xs:decimal external  := -61.9;\n\tdeclare variable $north as xs:decimal external := 56.;\n\tdeclare variable $south as xs:decimal external := 33.;\n\t\t\n\tdeclare variable $temporalSearch as xs:boolean external := false();\n\tdeclare variable $tstart as xs:string external := \"1990-04-18T13:24:00\";\n\tdeclare variable $tend as xs:string external := \"1990-04-18T13:26:01\";\n\t\n\t\n\t(:Select some data - all of the MD_DataIdentificaiton Elements:)\n\tlet $tokens := tokenize($searchTerm,'\\s+')\n\tlet $resultSequence := if ($textSearch) then\n\t\t\t\t\t\t\t for $val in \/*\n\t\t\t\t\t\t\t   where ($val\/\/text() contains text {$tokens} all words using fuzzy)\n\t\t\t\t\t\t\t\t return $val\n\t\t\t\t\t\t\telse\n\t\t\t\t\t\t\t \/*\n\t\n\tlet $resultSequence := if ($geoSearch) then\n\t\t\t\t\t\t\t local:GeoSpatialIntersectsQueryFunction($resultSequence, $west, $east, $north, $south)\n\t\t\t\t\t\t\telse\n\t\t\t\t\t\t\t  $resultSequence\n\t\n\tlet $resultSequence := if ($temporalSearch) then\n\t\t\t\t\t\t\t local:TemporalIntersectsQueryFunction($resultSequence, $tstart, $tend)\n\t\t\t\t\t\t\telse\n\t\t\t\t\t\t\t  $resultSequence\n\t\n\t\n\t\n\tlet $resultSequence := if (not ($textSearch)) then\n\t\t\t\t\t\t\t local:OrderByFunction($resultSequence)\n\t\t\t\t\t\t\telse\n\t\t\t\t\t\t\t $resultSequence\n\t\t\t\t\t\t\t  \n\t\n\tlet $max := count($resultSequence)\n\tlet $end := min (($start + $records - 1, $max))\n\tlet $num := min (($max, $records))\n\t\n\treturn \n\t  <csw:GetRecordsResponse xmlns:csw=\"http:\/\/www.opengis.net\/cat\/csw\/2.0.2\" xmlns:ogc=\"http:\/\/www.opengis.net\/ogc\" xmlns:gmd=\"http:\/\/www.isotc211.org\/2005\/gmd\" xmlns:ows=\"http:\/\/www.opengis.net\/ows\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" xmlns:xsi=\"http:\/\/www.w3.org\/2001\/XMLSchema-instance\" version=\"2.0.2\" xsi:schemaLocation=\"http:\/\/www.opengis.net\/cat\/csw\/2.0.2 http:\/\/schemas.opengis.net\/csw\/2.0.2\/CSW-discovery.xsd\">\n\t\t<csw:RequestId\/>\n\t\t<csw:SearchStatus timestamp=\"{current-dateTime()}\"\/>\n\t\t<csw:SearchResults nextRecord=\"{$end + 1}\" numberOfRecordsMatched=\"{$max}\" numberOfRecordsReturned=\"{$num}\" recordSchema=\"http:\/\/www.isotc211.org\/2005\/gmd\">\n\t\t  {local:FormatResult(subsequence($resultSequence, $start, $records))}\n\t\t<\/csw:SearchResults>\n\t  <\/csw:GetRecordsResponse>\n\n]]>\n  <\/text>\n  <variable name=\"records\" value=\"___LIMIT___\"\/>\n  <variable name=\"start\" value=\"___START___\"\/>\n  \n  <variable name=\"textSearch\" value=\"___TEXTSEARCH___\"\/>\n  <variable name=\"searchTerm\" value=\"___ANYTEXT___\"\/>\n  \n  <variable name=\"geoSearch\" value=\"___GEOSEARCH___\"\/>\n  <variable name=\"west\" value=\"___WEST___\"\/>\n  <variable name=\"east\" value=\"___EAST___\"\/>\n  <variable name=\"north\" value=\"___NORTH___\"\/>\n  <variable name=\"south\" value=\"___SOUTH___\"\/>\n\n  <variable name=\"temporalSearch\" value=\"___TEMPORALSEARCH___\"\/>\n  <variable name=\"tstart\" value=\"___TSTART___\"\/>\n  <variable name=\"tend\" value=\"___TEND___\"\/>\n\n<\/query>";

var map;
var lyrQuery;
var mapDate;
var catalog = [];
var plotData = [];
var prevPt;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");

var buttonClasses = [
   'primary'
  ,'success'
  ,'info'
  ,'warning'
  ,'danger'
  ,'dark-blue'
  ,'tan'
  ,'dark-green'
  ,'brown'
  ,'aqua'
  ,'dark-pink'
  ,'mustard'
];
var name2Color = {};

var lineColors = [
   ['#66C2A5','#1B9E77']
  ,['#FC8D62','#D95F02']
  ,['#8DA0CB','#7570B3']
  ,['#E78AC3','#E7298A']
  ,['#A6D854','#66A61E']
  ,['#FFD92F','#E6AB02']
  ,['#E5C494','#A6761D']
  ,['#B3B3B3','#666666']
];

var activeMapLayersTableOffset = 170;
var queryResultsFooterOffset = 40;

function resize() {
  var 	mapOffset 	= 103,
        activeMapLayersTableOffset = 170,
        timeSliderOffset = 150;
	sliderOffset = 50;
  $('#mapView').height($(window).height() - mapOffset - sliderOffset - timeSliderOffset);
  $('#results .table-wrapper').height($(window).height() - 216);
  $('#active-layers .table-wrapper').height($(window).height() - activeMapLayersTableOffset);
  $('#query-results_wrapper .dataTables_scrollBody').css('height',$(window).height() - activeMapLayersTableOffset - queryResultsFooterOffset);
  $('.dataTables_scrollBody').height(($(window).height() - 250));
  $('#query-results_wrapper .dataTables_scrollBody').css('overflow-x','hidden');
  fixCellWidth();
  map.updateSize();
  plot();
}

function fixCellWidth() {
  if (hasScrollBar($('#active-layers .table-wrapper')[0]))
    $('#active-layers table tbody td:last-child').css('width', '37px');
  else {
    $('#active-layers table tbody td:last-child').css('width', '54px');
    $('#active-layers .table-wrapper').css('height', 'auto');
  }
}

window.onresize = resize;

function categoryClick() {
  syncFilters($('#categories.btn-group input:checked').attr('id'));
  syncQueryResults();
}

function filterValueSelect() {
  var id = $(this).attr('id').replace('list','filter-btn');
  $('#' + id).addClass('active');
  // Give the button time to add its class (which is used for testing in the query).
  setTimeout(function() {
    syncQueryResults();
  },100);
}

function prepareAddToMap() {
  var idx  = $(this).data('idx');
  var name = $(this).data('name');
  var svc  = $(this).data('svc-type');
  var c    = _.findWhere(catalog,{idx : idx});
  if (!c.times && /wms/i.test(svc)) {
    wmsGetCaps(c.url,idx,name);
  }
  else {
    addToMap(svc,c,name);
  }
}

function addToMap(svc,c,lyrName) {
  var obs = /sos/i.test(svc);
  var lc = 0;
  if (_.isEmpty(map.getLayersByName(c.name + '-' + lyrName))) {
    if (!mapDate) {
      mapDate = c.times ? isoDateToDate(c.times[c.times.length - 1]) : isoDateToDate(c.temporal[0]);
    }
    if (obs) {
      lyrName = addObs({
         group    : c.name
        ,url      : c.url
        ,layers   : lyrName
        ,times    : c.temporal
        ,bbox     : new OpenLayers.Bounds(c.spatial).transform(proj4326,proj3857)
      });
    }
    else {
      lyrName = addWMS({
         group  : c.name
        ,url    : c.url
        ,layers : lyrName
        ,styles : c.layers[lyrName]
        ,times  : c.times
        ,bbox   : new OpenLayers.Bounds(c.spatial).transform(proj4326,proj3857)
      });
    }
    lc++;
  }

  if (lc > 0) {
    $('ul.nav li:last-child a').trigger('click');
    syncTimeSlider(c.temporal);

    var title = obs ? '' : 'title="<img src=\'' + getLayerLegend(lyrName) + '\' alt=\'\'>"';
    var ts = obs ? '' : '<span class="glyphicon glyphicon-time" name="' + lyrName + '"></span><input type="text" name="' + lyrName + '" value="" disabled class="form-control">';
    var rowHtml = '<tr data-toggle="tooltip" data-placement="right" data-html="true" ' + title + '><td><div><p title="' + lyrName + '">' + lyrName + '</p>' + ts + '<a href="#" data-name="' + lyrName + '" data-toggle="modal" data-target="#layer-settings"><span class="glyphicon glyphicon-cog"></span><a href="#" title="Zoom To" data-name="' + lyrName + '"><span class="glyphicon glyphicon-zoom-in"></span><img src="./img/loading.gif"></a><a href="#" class="popover-link" data-toggle="popover" title="' + lyrName + '" data-html= "true"  data-name="' + lyrName + '" data-content="' + c.tSpan + '\n' + '<a target=\'_blank\' href=\'' + c.url + '\'>' + c.url + '</a>"><span class="glyphicon glyphicon-info-sign"></span></a></div></td>';
    rowHtml += '<td class="checkbox-cell"><input type="checkbox" checked value="' + lyrName + '" /></td>';
    $('#active-layers table tbody').append(rowHtml);
    $('#active-layers input:checkbox').off('click');
    $('#active-layers input:checkbox').click(function() { 
      toggleLayerVisibility(($(this).val()));
    });
    $('#active-layers a[title="Zoom To"]').off('click');
    $('#active-layers a[title="Zoom To"]').click(function() {
      zoomToLayer(($(this).data('name')));
    });
    fixCellWidth();
  }
  else {
    alert('Oops.  This dataset is already on your map.');
  }
}

function hasScrollBar(div) {
    return (div.scrollHeight != div.clientHeight);
}

$(document).ready(function() {
  $('ul.nav li:first-child a').on('click', function(e){
    e.preventDefault();
    if ($(this).hasClass('active'))
      return false;
    else {
      $('#mapView, #map-view-col, #map-col').hide();
      $('#catalogue').show();
      $('li.active').removeClass('active');
      $(this).parent().addClass('active');
      resize();
    }
  });

  $('ul.nav li:last-child a').on('click', function(e){
    e.preventDefault();
    if ($(this).hasClass('active'))
      return false;
    else {
      $('#catalogue').hide();
      $('#mapView, #map-view-col, #map-col').show();
      $('li.active').removeClass('active');
      $(this).parent().addClass('active');
      resize();
    }
  });

  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
      'default' : new OpenLayers.Style(
        OpenLayers.Util.applyDefaults({
           pointRadius       : 5
          ,strokeColor       : '#000000'
          ,strokeOpacity     : 1
          ,fillColor         : '#ff0000'
          ,fillOpacity       : 1
        })
      )
    })}
  );

  $('body').on('click', function(e){
    if ($('.popover.fade.right.in').css('display') == 'block')
      if (!$(e.target.parentNode).hasClass('popover') && !$(e.target.parentNode).hasClass('popover-link'))
        $('.popover').popover('hide');
  });

  map = new OpenLayers.Map('mapView',{
    layers  : [
      new OpenLayers.Layer.Google('Google Terrain',{
         type          : google.maps.MapTypeId.TERRAIN
      })
/*
      new OpenLayers.Layer.XYZ(
         'ESRI Ocean'
        ,'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}.jpg'
        ,{
           sphericalMercator : true
          ,isBaseLayer       : true
          ,wrapDateLine      : true
        }
      )
*/
      ,lyrQuery
    ]
    ,center : new OpenLayers.LonLat(-83,28).transform(proj4326,proj3857)
    ,zoom   : 5
  });

  map.events.register('click',this,function(e) {
    clearQuery();
    query(e.xy);
  });

  map.events.register('addlayer',this,function(e) {
    // keep important stuff on top
    map.setLayerIndex(lyrQuery,map.layers.length - 1);
    _.each(_.filter(map.layers,function(o){return o.renderer && o.name != 'Query points'}),function(o) {
      map.setLayerIndex(o,map.layers.length - 2);
    });
  });

  $('#query-results').DataTable({
     processing     : true
    ,serverSide     : true
    ,searching      : false
    ,lengthChange   : false
    ,iDisplayLength : 50
    ,sScrollY       : $(window).height() - activeMapLayersTableOffset - queryResultsFooterOffset
    ,fnDrawCallback : function() {
      $('#results .table-wrapper td a').on('click', prepareAddToMap);
      $('.dataTables_scrollHead').hide();
    }
    ,ajax       : function (data,callback,settings) {
      var q = catalogQueryXML;
      q = q.replace('___LIMIT___',data.length).replace('___START___',data.start);
      q = q.replace('___TEXTSEARCH___',1).replace('___ANYTEXT___','modis');
      q = q.replace('___GEOSEARCH___',0);
      q = q.replace('___TEMPORALSEARCH___',0);
      q = q.replace(/___(WEST|EAST|NORTH|SOUTH)___/g,'0');
      q = q.replace(/___(TSTART|TEND)___/g,'1800-01-01T00:00:00');
      $.ajax({
         url      : 'post.php?http://user:glos@64.9.200.121:8984/rest/glos'
        ,dataType : 'xml'
        ,type     : 'POST'
        ,data     : q
        ,draw     : data.draw
        ,success  : function(r) {
          var data = [];
          $(r).find('MD_Metadata').each(function() {
            var d = {cswId : $(this).find('fileIdentifier').find('CharacterString').text()};
            $(this).find('identificationInfo').each(function() {
              $(this).find('MD_DataIdentification').each(function() {
                d.abstract = $(this).find('abstract').find('CharacterString').text();
                $(this).find('citation').find('CI_Citation').first().each(function() {
                  d.title    = $(this).find('title').find('CharacterString').text();
                  d.provider = $(this).find('citedResponsibleParty').find('CI_ResponsibleParty').find('organisationName').find('CharacterString').text();
                });
                $(this).find('extent').find('EX_Extent').each(function() {
                  $(this).find('geographicElement').find('EX_GeographicBoundingBox').each(function() {
                    d.spatial = [
                       $(this).find('westBoundLongitude').find('Decimal').text()
                      ,$(this).find('southBoundLatitude').find('Decimal').text()
                      ,$(this).find('eastBoundLongitude').find('Decimal').text()
                      ,$(this).find('northBoundLatitude').find('Decimal').text()
                    ];
                  });
                  $(this).find('temporalElement').find('EX_TemporalExtent').find('extent').find('TimePeriod').each(function() {
                    d.temporal = [
                       $(this).find('beginPosition').text()
                      ,$(this).find('endPosition').text()
                    ];
                  });
                });
              });
              d.services = [];
              $(this).find('SV_ServiceIdentification').each(function() {
                var s = {
                   id         : $(this).attr('id')
                  ,operations : []
                };
                $(this).find('containsOperations').find('SV_OperationMetadata').each(function() {
                  s.operations.push({
                     name : $(this).find('operationName').find('CharacterString').text()
                    ,url  : $(this).find('connectPoint').find('CI_OnlineResource').find('linkage').find('URL').text()
                  });
                });
                d.services.push(s);
              });
            });
            d.dimensions = [];
            $(this).find('contentInfo').find('MI_CoverageDescription').find('dimension').find('MD_Band').each(function() {
              d.dimensions.push({
                 name     : $(this).find('descriptor').find('CharacterString').text()
                ,niceName : $(this).find('sequenceIdentifier').find('MemberName').find('aName').find('CharacterString').text()
              });
            });
            data.push(d);
          });
          catalog = makeCatalog(data);
          callback({
             data : _.map(catalog,function(o){return [o.tr[0]]})
            ,draw : this.draw
            ,recordsFiltered : $(r).find('SearchResults').attr('numberOfRecordsMatched')
            ,recordsTotal    : $(r).find('SearchResults').attr('numberOfRecordsMatched')
          });
        }
      });
    }
  });

  $('.selectpicker').selectpicker().on('change', filterValueSelect);

  $('#time-slider').slider({
    step: 6 * 3600000,
    formater: function(value) {
      var dateTime = new Date(value);
      return dateTime.format('UTC:yyyy-mm-dd HH:00"Z"');
    },
  });
  $('#time-slider').slider().on('slideStop',function(e) {
    setDate(new Date($(this).data('slider').getValue()));
  });
  $('#depth-slider').slider({
    orientation: 'vertical'
  });

  $('.btn').button().mouseup(function(){$(this).blur();});
  $('#active-layers button').on('click', clearMap);
  $('#clear-query').on('click', clearQuery);
  $('#active-layers div table tbody').tooltip({selector: 'tr'});
  $('#active-layers div table tbody').popover({selector: 'a.popover-link'}).on('mouseup', function(e) {
    if ($('.popover.fade.right.in').css('display') == 'block')
        $('.popover').popover('hide');
  });

  $('#time-series-graph').bind('plothover',function(event,pos,item) {
    if (item) {
      var x = new Date(item.datapoint[0]);
      var y = item.datapoint[1];
      if (prevPoint != item.dataIndex) {
        $('#tooltip').remove();
        var a = item.series.label.match(/(\([^\)]*\))<\/a>/);
        if (a.length == 2) {
          var u = a.pop();
          u = u.substr(1,u.length - 2);
        }
        showToolTip(item.pageX,item.pageY,new Date(x).format('UTC:yyyy-mm-dd HH:00"Z"') + ' : ' + (Math.round(y * 100) / 100) + ' ' + u);
      }
      prevPoint = item.dataIndex;
    }
    else {
      $('#tooltip').remove();
      prevPoint = null;
    }
  });

  resize();
  if (!/DEV/.test(document.title)) {
    $('#beta-notice').modal();
  }
  $('#layer-settings').on('show.bs.modal', function (e) {
    $('#layer-settings .modal-dialog .modal-header h4').text(e.relatedTarget.attributes["data-name"].value);
    $('#layer-settings .modal-dialog .modal-body').html('<span class="label label-default">Color ramp</span><select class="selectpicker"></select></div>');
    $('.modal-body .selectpicker').selectpicker();
    if (navigator.userAgent.match(/Firefox/i)) {
      $('#layer-settings .modal-dialog .modal-body span.label').css({paddingTop:'9px',paddingBottom:'7px'});
    }
  });
});

function syncTimeSlider(t) {
  var times = t ? t : [];
  $.each($('#active-layers table tbody tr td:first-child'),function() {
    var lyr = map.getLayersByName($(this).text())[0];
    if (lyr.visibility) {
      times = times.concat(lyr.times);
    }
  });
  if (times.length > 1) {
    if (!$('#time-slider-wrapper').is(':visible')) {
      $('#time-slider-wrapper').toggle();
    }
    times.sort();
    var startDate = isoDateToDate(times[0]);
    var endDate = isoDateToDate(times[times.length - 1]);
    if (!mapDate || !(startDate <= mapDate && mapDate <= endDate)) {
      setDate(startDate);
    }
    $('#time-slider').data('slider').min = startDate.getTime();
    $('#time-slider').data('slider').max = endDate.getTime();
    $('#time-slider').slider('setValue',mapDate.getTime());
    $('#time-slider-min').val(startDate.format('UTC:yyyy-mm-dd'));
    $('#time-slider-max').val(endDate.format('UTC:yyyy-mm-dd'));
  }
  else {
    if ($('#time-slider-wrapper').is(':visible')) {
      $('#time-slider-wrapper').toggle();
    }
    mapDate = false;
  }
}

function makeCatalog(data) {
  var catalog = [];
  var i = 0;
  _.each(data,function(o) {
    d = {
       category  : 'modis'
      ,org_model : 'GLOS'
      ,storm     : 'none'
      ,idx       : o.cswId
      ,name      : o.title
      ,spatial   : o.spatial.slice()
      ,temporal  : o.temporal.slice()
      ,abstract  : o.abstract
      ,layers    : []
    };
    var layers  = [];

    var svc = _.findWhere(o.services,{id : 'OGC-WMS'});
    var op  = svc && _.findWhere(svc.operations,{name : 'GetCapabilities'});
    if (!svc && !op) {
      svc = _.findWhere(o.services,{id : 'SOS'});
      op  = svc && _.findWhere(svc.operations,{name : 'GetObservation'});
    }
    if (svc && op) {
      d.url = op.url;
      _.each(_.filter(_.map(o.dimensions,function(o){return [o.name.split(' (').shift(),o.niceName.split(/(double|int|byte)$/).shift()]}),function(o){return !_.isEmpty(o[0])}),function(o) {
        if (!/^(latitude|longitude|time)$/i.test(o[0])) {
          if (!name2Color[o[0]]) {
            name2Color[o[0]] = buttonClasses[_.size(name2Color) % buttonClasses.length];
          }
          d.layers[o[1]] = '';
          layers.push('<a href="#" data-svc-type="' + svc.id + '" data-idx="' + d.idx + '" data-name="' + o[1] + '" class="btn btn-' + name2Color[o[0]] + '">' + o[0] + '</a>');
        }
      });
    }
    layers = _.sortBy(layers,function(o){return $(o).data('name').toLowerCase()});
 
    var tSpan = '';
    var minT = o.temporal[0];
    var maxT = o.temporal[1];
    if (minT != '' && maxT != '') {
      if (isoDateToDate(minT).format('UTC:mmm d, yyyy') == isoDateToDate(maxT).format('UTC:mmm d, yyyy')) {
        tSpan = isoDateToDate(minT).format('UTC:mmm d, yyyy');
      }
      else if (isoDateToDate(minT).format('UTC:yyyy') == isoDateToDate(maxT).format('UTC:yyyy')) {
        if (isoDateToDate(minT).format('UTC:mmm') == isoDateToDate(maxT).format('UTC:mmm')) {
          tSpan = isoDateToDate(minT).format('UTC:mmm d') + ' - ' + isoDateToDate(maxT).format('UTC:d, yyyy');
        }
        else {
          tSpan = isoDateToDate(minT).format('UTC:mmm d') + ' - ' + isoDateToDate(maxT).format('UTC:mmm d, yyyy');
        }
      }
      else {
        tSpan = isoDateToDate(minT).format('UTC:mmm d, yyyy') + ' - ' + isoDateToDate(maxT).format('UTC:mmm d, yyyy');
      }
    }
    d.tSpan = tSpan;

    var src = d.spatial[0] == d.spatial[2] && d.spatial[1] == d.spatial[3]
      ? 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBuB8P_e6vQcucjnE64Kh2Fwu6WzhMXZzI&markers=' + d.spatial[1] + ',' + d.spatial[0] + '&zoom=8&size=60x60&sensor=false'
      : 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBuB8P_e6vQcucjnE64Kh2Fwu6WzhMXZzI&path=weight:1|fillcolor:0x0000AA11|color:0x0000FFBB|' + d.spatial[1] + ',' + d.spatial[0] + '|' + d.spatial[1] + ',' + d.spatial[2] + '|' + d.spatial[3] + ',' + d.spatial[2] + '|' + d.spatial[3] + ',' + d.spatial[0] + '|' + d.spatial[1] + ',' + d.spatial[0] + '&size=60x60&sensor=false';
    var thumb = '<img width=60 height=60 src="' + src + '" title="Data boundaries" alt="Data boundaries">';
    var abstract = !_.isEmpty(d.abstract) ? '<p>' + d.abstract + '</p>' : '';
    // d.tr = ['<div class="thumbnail">' + thumb + '</div><div class="title">' + d.name + '</div><br />' + abstract + '<div class="time-range"><div class="time-range-label"><span class="glyphicon glyphicon-time"></span>Time Range</div><input type="text" name="timeRange" value="' + d.tSpan + '" disabled class="form-control"></div><div class="download-data"><a target=_blank href="' + d.url + '" title="Download Data"><span class="glyphicon glyphicon-download"></span>Download Data</a></div>' + layers.join(' ')];
    d.tr = ['<div class="thumbnail">' + thumb + '</div><div class="title">' + d.name + '</div><br />' + abstract + '<div class="time-range"><div class="time-range-label"><span class="glyphicon glyphicon-time"></span>Time Range</div><input type="text" name="timeRange" value="' + d.tSpan + '" disabled class="form-control"></div><div class="download-data"><a target=_blank href="' + d.url + '" title="Download Data"><span class="glyphicon glyphicon-download"></span>Download Data</a></div>' + layers.join(' ')];
    catalog.push(d);
  });
  return catalog;
}

function syncFilters(cat) {
  $('#event-list').empty();
  $('#event-list').append('<option checked value="' + 'ALL' + '">' + 'ALL' + '</option>');
  _.each(_.sortBy(_.uniq(_.pluck(_.filter(catalog,function(o){return o.category == cat}),'storm')),function(o){return o.toUpperCase()}),function(o) {
    $('#event-list').append('<option value="' + o + '">' + o + '</option>');
  });
   $('#event-list').selectpicker('refresh');

  $('#model-list').empty();
  $('#model-list').append('<option checked value="' + 'ALL' + '">' + 'ALL' + '</option>');
  _.each(_.sortBy(_.uniq(_.pluck(_.filter(catalog,function(o){return o.category == cat}),'org_model')),function(o){return o.toUpperCase()}),function(o) {
    $('#model-list').append('<option value="' + o + '">' + o + '</option>');
  });
  $('#model-list').selectpicker('refresh');
}

function syncQueryResults() {
  $('#query-results').DataTable().clear();
  $('#query-results').DataTable().row.add(['Loading...']).draw();
  // give the table a chance to show the Loading... line
  setTimeout(function() {
    var i = 0;
    var c = catalog.filter(function(o) {
      var category = o.category == $('#categories.btn-group input:checked').attr('id');
      var event = $('#event-list option:selected').val() == 'ALL' || $('#event-list option:selected').val() == o.storm;
      var model = $('#model-list option:selected').val() == 'ALL' || $('#model-list option:selected').val() == o.org_model;
      return category && event && model;
    });
    $('#query-results').DataTable().clear();
    $('#query-results').DataTable().rows.add(_.pluck(_.sortBy(c,function(o){return o.name.toUpperCase()}),'tr')).draw();
  },100);
}

function isoDateToDate(s) {
  // 2010-01-01T00:00:00 or 2010-01-01 00:00:00
  s = s.replace("\n",'');
  var p = s.split(/T| /);
  if (p.length == 2) {
    var ymd = p[0].split('-');
    var hm = p[1].split(':');
    var d = new Date(
       ymd[0]
      ,ymd[1] - 1
      ,ymd[2]
      ,hm[0]
      ,hm[1]
    );
    return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
  }
  else {
    return false;
  }
}

function addWMS(d) {
  _gaq.push(['_trackEvent','add layer',d.group + '-' + d.layers]);
  var lyr = new OpenLayers.Layer.WMS(
     d.group + '-' + d.layers
    ,d.url.replace(/getcapabilities/i,'GetMap').replace('1.3.0','1.1.1') // wmsEndpoint + d.group + '/'
    ,{
       layers      : d.layers
      ,transparent : true
      ,styles      : d.styles
      ,format      : 'image/png'
      ,TIME        : getNearestDate(mapDate,d.times).format('UTC:yyyy-mm-dd"T"HH:MM:00')
    }
    ,{
       isBaseLayer      : false
      ,projection       : proj3857
      ,singleTile       : singleTile
      ,wrapDateLine     : true
      ,visibility       : true
      ,opacity          : 1
      ,noMagic          : true
      ,transitionEffect : 'resize'
    }
  );
  lyr.group = d.group;
  lyr.times = d.times;
  lyr.bbox  = d.bbox;
  lyr.activeQuery = 0;
  map.zoomToExtent(d.bbox);

  lyr.events.register('loadstart',this,function(e) {
    $('#active-layers a[data-name="' + e.object.name + '"] img').show();
    $('#active-layers a[data-name="' + e.object.name + '"] span').hide();
    var d = isoDateToDate(e.object.params.TIME);
    var dt = Math.round(Math.abs(d.getTime() - mapDate.getTime()) / 3600000 / 24);
    var timeEl = $('#active-layers span[name="' + e.object.name + '"].glyphicon-time');
    if (dt > 7) {
      timeEl.addClass('red');
      timeEl.tooltip().attr('data-original-title','Over ' + dt + ' day(s) old').tooltip('fixTitle');
    }
    else {
      timeEl.removeClass('red');
      timeEl.tooltip().attr('data-original-title','').tooltip('fixTitle');
    }
    $('#active-layers input:text[name="' + e.object.name + '"]').val(d.format('UTC:yyyy-mm-dd'));
  });
  lyr.events.register('loadend',this,function(e) {
    if (e.object.activeQuery == 0) {
      $('#active-layers a[data-name="' + e.object.name + '"] img').hide();
      $('#active-layers a[data-name="' + e.object.name + '"] span').show();
    }
  });
  lyr.events.register('visibilitychanged',this,function(e) {
    syncTimeSlider();
  });
  map.addLayer(lyr);
  return lyr.name;
}

function addObs(d) {
  var lyr = new OpenLayers.Layer.Vector(
     d.group + '-' + d.layers
  );
  lyr.group = d.group;
  lyr.times = d.times;
  lyr.bbox  = d.bbox;
  lyr.activeQuery = 0;
  map.zoomToExtent(d.bbox);

  var center = lyr.bbox.getCenterLonLat();

  var f = new OpenLayers.Feature.Vector(
    new OpenLayers.Geometry.Point(center.lon,center.lat)
  );
  var p = OpenLayers.Util.getParameters(d.url);
  p.observedProperty = d.layers;
  p.eventtime = isoDateToDate(d.times[0]).format('UTC:yyyy-mm-dd"T"HH:MM:00"Z"') + '/' + isoDateToDate(d.times[1]).format('UTC:yyyy-mm-dd"T"HH:MM:00"Z"');
  f.attributes = {
     getObs : d.url.split('?').shift() + '?' + OpenLayers.Util.getParameterString(p)
    ,name   : d.group
    ,prop   : d.layers
  };
  lyr.addFeatures([f]); 

  lyr.events.register('loadstart',this,function(e) {
    $('#active-layers a[data-name="' + e.object.name + '"] img').show();
    $('#active-layers a[data-name="' + e.object.name + '"] span').hide();
  });
  lyr.events.register('loadend',this,function(e) {
    if (e.object.activeQuery == 0) {
      $('#active-layers a[data-name="' + e.object.name + '"] img').hide();
      $('#active-layers a[data-name="' + e.object.name + '"] span').show();
    }
  });
  lyr.events.register('visibilitychanged',this,function(e) {
    syncTimeSlider();
  });
  map.addLayer(lyr);
  return lyr.name;
}

function getLayerLegend(name) {
  var lyr = map.getLayersByName(name)[0];
  return lyr.getFullRequestString({
     REQUEST : 'GetLegendGraphic'
    ,LAYER   : lyr.params.LAYERS
    ,TIME    : getNearestDate(mapDate,lyr.times).format('UTC:yyyy-mm-dd"T"HH:MM:00')
  }).replace(/getmap/i,'GetLegendGraphic');
}

function toggleLayerVisibility(name) {
  var lyr = map.getLayersByName(name)[0];
  lyr.setVisibility(!lyr.visibility);
}

function zoomToLayer(name) {
  map.zoomToExtent(map.getLayersByName(name)[0].bbox);
}

function setDate(dt) {
  mapDate = dt;
  $.each($('#active-layers table tbody tr td:first-child'),function() {
    var lyr = map.getLayersByName($(this).text())[0];
    if (lyr.DEFAULT_PARAMS) {
      lyr.mergeNewParams({TIME : getNearestDate(mapDate,lyr.times).format('UTC:yyyy-mm-dd"T"HH:MM:00')});
    }
  });
  plot();
}

function getNearestDate(dt,times) {
  // find nearest time w/o going over
  var t1 = new Date(dt.getTime());
  var t  = new Date(dt.getTime());
  for (var i = 0; i < times.length; i++) {
    var t0 = isoDateToDate(times[i]).getTime();
    if (t0 <= t1) {
      t = new Date(t0);
    } 
  }
  return t;
}

function clearMap() {
  clearQuery();
  $.each($('#active-layers table tbody tr td:first-child'),function() {
    map.removeLayer(map.getLayersByName($(this).text())[0]);
  });
  $('#active-layers table tbody tr').remove();
  $('#active-layers table thead th:last-child').css('width', '30px');
  if ($('#time-slider-wrapper').is(':visible')) {
    $('#time-slider-wrapper').toggle();
  }
  mapDate = false;
}

function clearQuery() {
  plotData = [];
  plot();
  lyrQuery.removeAllFeatures();
}

function query(xy) {
  plotData = [];
  var lonLat = map.getLonLatFromPixel(xy);
  var pt = new OpenLayers.Geometry.Point(lonLat.lon,lonLat.lat);
  var f  = new OpenLayers.Feature.Vector(pt);
  lyrQuery.addFeatures([f]);

  _.each(_.filter(map.layers,function(o){return o.features && o.features.length > 0 && o.features[0].attributes && o.features[0].attributes.getObs && o.visibility}),function(l) {
    // find the closest site w/i a tolerance
    var f;
    var minD;
    _.each(l.features,function(o) {
      var d = pt.distanceTo(o.geometry.getCentroid());
      if (d <= 10000) {
        if (_.isUndefined(minD) || d < minD) {
          f = o.clone();
        }
        minD = d;
      }
    });
    if (f) {
      l.events.triggerEvent('loadstart');
      l.activeQuery++;
      $.ajax({
         url      : 'get.php?' + f.attributes.getObs
        ,title    : l.name
        ,attrs    : f.attributes
        ,dataType : 'xml'
        ,success  : function(r) {
          var lyr = map.getLayersByName(this.title)[0];
          if (lyr) {
            lyr.activeQuery--;
            lyr.events.triggerEvent('loadend');
          }
          var $xml = $(r);
          var d = {
             data  : []
            ,label : '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' (' + $xml.find('[name="' + this.attrs.prop + '"] uom[code]').attr('code') + ')' + '</a>'
          };
          var z = [];
          _.each($xml.find('values').text().split(/ |\n/),function(o) {
            var a = o.split(',');
            if ((a.length == 2 || a.length == 3) && $.isNumeric(a[1])) {
              // only take the 1st value for each time
              var t = isoDateToDate(a[0]).getTime();
              if (!_.find(d.data,function(o){return o[0] == t})) {
                d.data.push([t,a[1]]);
                if (a.length == 3) {
                  z.push(a[2]);
                }
              }
            }
          });
          if (!_.isEmpty(z)) {
            z = _.uniq(z.sort(function(a,b){return a-b}),true);
            d.label = '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' [' + $($xml.find('field')[2]).attr('name') + ' ' + z[0];
            if (z.length > 1) {
              d.label += ' - ' + z[z.length - 1];
            }
            d.label += '] (' + $xml.find('uom').attr('code') + ')' + '</a>';
          }
          d.color = lineColors[plotData.length % lineColors.length][0];
          d.points = {show : d.data.length == 1 || this.url.indexOf('herokuapp') >= 0};
          d.lines  = {show : d.data.length > 1 && this.url.indexOf('herokuapp') < 0};
          plotData.push(d);
          plot();
        }
        ,error    : function(r) {
          var lyr = map.getLayersByName(this.title)[0];
          if (lyr) {
            lyr.activeQuery--;
            lyr.events.triggerEvent('loadend');
          }
          var d = {
             data  : []
            ,label : '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' <font color=red><b>ERROR</b></font>'
          };
          d.color = lineColors[plotData.length % lineColors.length][0];
          plotData.push(d);
          plot();
        }
      });
    }
  });

  _.each(_.filter(map.layers,function(o){return o.DEFAULT_PARAMS && o.visibility}),function(l) {
    l.events.triggerEvent('loadstart');
    var u = l.getFullRequestString({
       REQUEST      : 'GetFeatureInfo'
      ,INFO_FORMAT  : 'text/javascript'
      ,QUERY_LAYERS : l.params.LAYERS
      ,BBOX         : map.getExtent().toBBOX()
      ,WIDTH        : map.size.w
      ,HEIGHT       : map.size.h
      ,X            : Math.round(xy.x)
      ,Y            : Math.round(xy.y)
      ,TIME         : new Date($('#time-slider').data('slider').min).format('UTC:yyyy-mm-dd"T"HH:MM:00') + '/' + new Date($('#time-slider').data('slider').max).format('UTC:yyyy-mm-dd"T"HH:MM:00')
    });
    l.activeQuery++;
    $.ajax({
       url      : u
      ,dataType : 'jsonp'
      ,v        : l.params.LAYERS
      ,title    : l.name
      ,timeout  : 60000 // JSONP won't trap errors natively, so use a timeout.
      ,success  : function(r) {
        _gaq.push(['_trackEvent','query layer - OK',this.title]);
        var lyr = map.getLayersByName(this.title)[0];
        if (lyr) {
          lyr.activeQuery--;
          lyr.events.triggerEvent('loadend');
        }
        var uv = this.v.split(',');
        if (uv.length == 2 && r.properties[uv[0]] && r.properties[uv[1]]) {
          var d = {
             data  : []
            ,vData : []
            ,label : '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' (' + r.properties[uv[0]].units + ')' + '</a>'
          };
          for (var i = 0; i < r.properties.time.values.length; i++) {
            var u = r.properties[uv[0]].values[i];
            var v = r.properties[uv[1]].values[i];
            var spd = Math.sqrt(Math.pow(u,2) + Math.pow(v,2));
            var dir = Math.atan2(u,v) * 180 / Math.PI;
            dir += dir < 0 ? 360 : 0;
            d.data.push([isoDateToDate(r.properties.time.values[i]).getTime(),spd]);
            d.vData.push([isoDateToDate(r.properties.time.values[i]).getTime(),dir]);
          }
          d.color = lineColors[plotData.length % lineColors.length][0];
          plotData.push(d);
        }
        else if (r.properties[this.v]) {
          var d = {
             data  : []
            ,label : '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' (' + r.properties[this.v].units + ')' + '</a>'
          };
          for (var i = 0; i < r.properties.time.values.length; i++) {
            var val = _.isUndefined(r.properties[this.v].values[i]) ? r.properties[this.v].values[0] : r.properties[this.v].values[i];
            d.data.push([isoDateToDate(r.properties.time.values[i]).getTime(),val]);
          }
          d.color = lineColors[plotData.length % lineColors.length][0];
          plotData.push(d); 
        }
        plot();
      }
      ,error    : function(r) {
        _gaq.push(['_trackEvent','query layer - ERROR',this.title]);
        var lyr = map.getLayersByName(this.title)[0];
        if (lyr) {
          lyr.activeQuery--;
          lyr.events.triggerEvent('loadend');
        }
        var d = {
           data  : []
          ,label : '<a target=_blank href="' + this.url + '">' + '&nbsp;' + this.title + ' <font color=red><b>ERROR</b></font>'
        };
        d.color = lineColors[plotData.length % lineColors.length][0];
        plotData.push(d);
        plot();
      } 
    });
  });
}

function plot() {
  $('#time-series-graph').empty();
  if (_.size(plotData) > 0) {
    var plot = $.plot(
       $('#time-series-graph')
      ,plotData
      ,{
         xaxis     : {mode  : "time"}
        ,crosshair : {mode  : 'x'   }
        ,grid      : {
           backgroundColor : {colors : ['#fff','#eee']}
          ,borderWidth     : 1
          ,borderColor     : '#99BBE8'
          ,hoverable       : true
          ,markings        : [{color : '#0e90d2',lineWidth : 2,xaxis : {from : mapDate.getTime(),to : mapDate.getTime()}}]
        }
        ,zoom      : {interactive : false}
        ,pan       : {interactive : false}
        ,legend    : {backgroundOpacity : 0.3}
      }
    );

    // go back and plot any vectors
    var imageSize = 80;
    _.each(plotData,function(d) {
      if (d.vData) {
        var c = _.find(lineColors,function(o){return o[0] == d.color})[1];
        // assume 1:1 for u:v
        for (var i = 0; i < d.data.length; i++) {
          var o = plot.pointOffset({x : d.data[i][0],y : d.data[i][1]});
          $('#time-series-graph').prepend('<div class="dir" style="position:absolute;left:' + (o.left-imageSize/2) + 'px;top:' + (o.top-(imageSize/2)) + 'px;background-image:url(\'./img/arrows/' + imageSize + 'x' + imageSize + '.dir' + Math.round(d.vData[i][1]) + '.' + c.replace('#','') + '.png\');width:' + imageSize + 'px;height:' + imageSize + 'px;"></div>');
        }
      }
    });
  }
}

function wmsGetCaps(url,idx,name) {
  $.ajax({
     url     : 'get.php?' + url
    ,idx     : idx
    ,name    : name
    ,success : function(r) {
      var caps = new OpenLayers.Format.WMSCapabilities().read(r);
      if (!caps || !caps.capability) {
        alert('There was an error querying this data service.');
        return;
      }
      var layers = [];
      for (var i = 0; i < caps.capability.layers.length; i++) {
        var sTitles = [];
        var s       = {};
        for (var j = 0; j < caps.capability.layers[i].styles.length; j++) {
          sTitles.push(caps.capability.layers[i].styles[j].title);
          s[caps.capability.layers[i].styles[j].title] = [
             caps.capability.layers[i].styles[j].title
            ,caps.capability.layers[i].styles[j].name
          ];
        }
        sTitles.sort();
        var styles = [];
        for (var j = 0; j < sTitles.length; j++) {
          styles.push(s[sTitles[j]]);
        }
        var t = [];
        if (caps.capability.layers[i].dimensions && caps.capability.layers[i].dimensions['time'] && caps.capability.layers[i].dimensions['time'].values) {
          for (var j = 0; j < caps.capability.layers[i].dimensions['time'].values.length; j++) {
            t.push(caps.capability.layers[i].dimensions['time'].values[j].replace(/ |\n/g,''));
          }
        }
        var times = [];
        for (var j = 0; j < t.length; j++) {
          var p = t[j].split('/');
          if (p.length == 3) {
            var d0 = isoDateToDate(p[0]);
            var d1 = isoDateToDate(p[1]);
            // We're not going to support everything under the sun.  But TDS is doing some whack intervals.
            // P7DT5M would be OK.
            var a = p[2].split(/P(.*)DT(.*)M/);
            if (a.length == 4) {
              for (var k = d0.getTime(); k <= d1.getTime(); k += 60000 * (60 * 24 * Number(a[1]) + Number(a[2]))) {
                times.push(new Date(k).format('UTC:yyyy-mm-dd HH:MM:00"Z"'));
              }
            }
            else {
              times.push(
                 d0.format('UTC:yyyy-mm-dd HH:MM:00"Z"')
                ,d1.format('UTC:yyyy-mm-dd HH:MM:00"Z"')
              );
            }
          }
          else if (t[j].indexOf('1969') != 0) {
            times.push(t[j]);
          }
        }
        layers.push({
           title  : caps.capability.layers[i].title
          ,name   : caps.capability.layers[i].name
          ,bbox   : caps.capability.layers[i].llbbox
          ,url    : caps.capability.request.getmap.get.href
          ,styles : styles.sort()
          ,times  : times.sort()
        });
      }
      // The times should be uniform for all datasets, so pick off the 1st.
      var c = _.findWhere(catalog,{idx : this.idx});
      c.times = layers[0].times;
      addToMap('wms',c,this.name);
    }
  });
}

function showToolTip(x,y,contents) {
  $('<div id="tooltip">' + contents + '</div>').css({
     position           : 'absolute'
    ,display            : 'none'
    ,top                : y + 10
    ,left               : x + 10
    ,border             : '1px solid #99BBE8'
    ,padding            : '2px'
    ,'background-color' : '#fff'
    ,opacity            : 0.80
    ,'z-index'          : 10000001
  }).appendTo("body").fadeIn(200);
}
