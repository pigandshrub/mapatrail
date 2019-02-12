<?php 
  session_start();
  require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
  require_once(LIB_PATH . "/process_start.php");
  require_once(INCLUDES_PATH . "/head.php");
  require_once(INCLUDES_PATH . "/header.php");
?>

<nav>
  <form method="post">
    <input id="reset" name="reset" title="Clear the map to start again" type="submit" value="Reset">
  </form>
  <form method="post">
    <?php if ($_SESSION['submitted']): ?>
      <input id="embed" name="embed" title="Get your embed link!" type="submit" value="Embed">
    <?php endif ?>
  </form>
</nav>
<div class="message-section">
  <?php if ($_SESSION['message'] && $_SESSION['message'] != ""): ?>
    <div id="message"><p><?= $_SESSION['message']; ?></p></div>
  <?php endif ?>
</div>
<?php
  if ($_SESSION['embedConfirm']) {
    echo '<div class="embedBack">
      <form method="post" class="embedBox left">' .
      file_get_contents($config['paths']['articles'] . '/terms.html') . 
      '<hr>
      <h2>Final Reminder</h2>
      <p>Map-A-Trail collects your GPX file\'s trail, route, elevation, and waypoint data to generate your map. This data is stored in our server\'s secure database and retrieved by your embed link to recreate the map in your own site. Because Map-A-Trail generates a shareable embed link, this means that anyone you give the link to has the ability to view your map and share it with others too.<p>
      <hr>
      <p>Are you sure you want to proceed?</p>
      <div class="buttons"><input type="submit" name="confirmOkay" class="okayButton" value="Yes"><input type="submit" name="confirmCancel" class="cancelButton" value="No"></div></form></div>';
  }
  if ($_SESSION['embedrequest']) {
    echo '<div class="embedBack">
      <form method="post" class="embedBox">
      <h2>Activate Your Link!<br>First...</h2>
      <h3>Your Confirmation Number*: <b>' . $_SESSION['confirm'] . '</b></h3>
      <p><small><em>*Please do NOT discard this number or share it with others. This number is required for authentication purposes or to deactivate services in the future.</em></small></p>
      <p>To embed this map in your website, copy the following HTML and paste it in your source code:</p>
      <textarea>' . '<iframe title="Map-A-Trail viewer" width="480" height="390" src="' . $_SESSION['sitebase'] . '/embed/map?id=' . $_SESSION['id_name'] . '&amp;show_alt=n' . '"></iframe>' . '</textarea>
      <p><strong>Make sure the above code and confirmation number are written down. They cannot be retrieved once this message is closed.</strong><p>
      <h3>Click "OK" to activate your link.</h3>
      <div class="buttons"><input type="submit" name="okayButton" class="okayButton" value="OK"></div></form></div>';
  }
?>
<!--Div that will hold the map-->
<div id="map" class="map"></div> 
<div class="buttonBorder">
  <button type="button" id="chartButton" class="chartButton" title="Altitude chart"><span class="genericon genericon-activity"></span></button>
</div>

<!--Div that will hold the pie chart-->
<div id="chart_div" class="chart"></div>
<div class="underside hidden">No altitude information available</div>
  
<?php
  require_once(INCLUDES_PATH . '/chart_scripts.php');
  require_once(INCLUDES_PATH . '/map_scripts.php');
  if ($_SESSION['submitted'] || $_SESSION['embedrequest'] || $_SESSION['ok']) {
    $name = 'other/' . basename($_SESSION['uploads']) . '/' . basename($_SESSION['target_file']);
    $file = json_encode($name);
    echo "<script>uploadFile($file)</script>";
    
  }
  require_once(INCLUDES_PATH . '/footer.php');