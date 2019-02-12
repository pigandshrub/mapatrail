<?php 
require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
$features = [];
$show_alt = 'n';
if (isset($_GET['show_alt'])) {
  $show_alt = $_GET['show_alt'];
} 
require_once(DB_PATH . '/data_get.php');
require_once(INCLUDES_PATH . '/head.php');
?>
<body>
  <?php if ($show_alt == 'y'): ?>
  <div id="map" class="map shrink"></div>
  <?php else: ?>
  <div id="map" class="map"></div>
  <?php endif ?>
  <div class="buttonBorder">
    <button type="button" id="chartButton" class="chartButton" title="Altitude chart"><span class="genericon genericon-activity"></span></button>
  </div>
  <!--Div that will hold the pie chart-->
  <div id="chart_div" class="chart"></div>
  <div class="underside hidden">No altitude information available</div>
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <script src="<?= $config['paths']['js'] ?>/ol.js"></script>
  <script src="js/embed.js"></script>
  <script>drawMap(<?php echo json_encode($features); ?>);</script>
  <script>drawChart(<?php echo json_encode($features); ?>);</script>
</body>
</html>