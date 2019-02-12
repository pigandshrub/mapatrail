<?php
  session_start(); 
  require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
  require_once(LIB_PATH . "/home_start.php");
  require_once(INCLUDES_PATH . "/head.php");
  require_once(INCLUDES_PATH . "/header.php");
?>
  <nav class="centered">
    <a id="mapTrail" href="/" title="Map-A-Trail V.0.1.">Map-A-Trail</a>
    <?php if (date("Y") == 2016): ?>
      <p>Copyright &copy; 2016 <a href="https://www.pigandshrub.com">PigandShrub.com</a></p>
    <?php else: ?>
      <p>Copyright &copy; 2016-<?php echo date("Y");?> <a href="https://www.pirgandshrub.com">PigandShrub.com</a></p>
    <?php endif ?>
    <?php if (!$_SESSION['submitted']): ?>
    <form action='process' name="uploadForm" method="post" enctype="multipart/form-data">
      <input type="hidden" name="MAX_FILE_SIZE" value="5000000">
      <input type="hidden" name='file_path' value=''>
      <input type="hidden" name='file_choose' value=''>
      <label id="customFileUpload" title="Start by choosing a GPX file to upload!">
        <input type="file" name="fileToUpload" id="fileToUpload"  accept=".gpx, gpx=application/gpx+xml">
        Choose a file
      </label>
      <input class="hidden" title="Upload now!" type="submit" id="fileSubmit" value="Upload now" name="submit">
    </form>
    <?php endif ?>
  </nav>
<?php
require_once(INCLUDES_PATH . "/footer.php");
require_once(INCLUDES_PATH . "/map_scripts.php") ; 