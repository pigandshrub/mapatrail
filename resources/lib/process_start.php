<?php
  if (isset($_GET['embed']) && $_GET['embed'] == 'done') {
    $_SESSION['embedrequest'] = true;
  } else {
    $_SESSION['embedrequest'] = false;
  }

  if (isset($_GET['embed']) && $_GET['embed'] == 'confirm') {
    $_SESSION['embedConfirm'] = true;
  } else {
    $_SESSION['embedConfirm'] = false;
  }

  try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

      if (isset($_POST['file_path'])) {
        $file = $_POST['file_path'];
        $mod_name = substr($file, strrpos($file, "\\"));        
      }

      if (isset($_POST['submit'])) {
        require_once(DB_PATH . '/upload.php');
        $_SESSION['mod_name'] = $mod_name;
        $_SESSION['target_file'] = $target_file;
        $page = 'process.php?review';
        header('Location: '. $page);
      }

      if (isset($_POST['embed']) && file_exists($_SESSION['uploads'])) {
        $page = 'process.php?embed=confirm';
        header('Location: '. $page);
      } else if (isset($_POST['embed'])) {
        $_SESSION['message'] = "For security reasons, this session has timed-out and your uploaded file has been deleted from our server. Please click RESET to try again.";
      }

      if (isset($_POST['confirmOkay']) && isset($_SESSION['id_name']) && $_SESSION['id_name'] == '') {
        require_once(DB_PATH . '/data_run.php');
        $page = 'process.php?embed=done';
        header('Location: '. $page);
      } else if (isset($_POST['confirmOkay'])) {
        require_once(DB_PATH . '/data_delete.php');
        $_SESSION['message'] = "A previous request was left incomplete. All requests and GPX data submitted in this session have been deleted for security reasons. Please click RESET to try again.";
        $page = 'process.php?embed=cancelled';
        $_SESSION['id_name'] = "";
        $_SESSION['confirm'] = "";
        $_SESSION['submitted'] = false;
        header('Location: '. $page);
        exit();
      }

      if (isset($_POST['confirmCancel']) && isset($_SESSION['id_name']) && $_SESSION['id_name'] == '') {
        $page = 'process.php?review';
        header('Location: '. $page);
      } else if (isset($_POST['confirmCancel'])) {
        require_once(DB_PATH . '/data_delete.php');
        $_SESSION['message'] = "A previous request was left incomplete. For security reasons, the incomplete request with its generated link and applicable GPX data have been cleared from our records. Click RESET to map another trail or just close this browser to end the session.";
        $page = 'process.php?embed=cancelled';
        $_SESSION['id_name'] = "";
        $_SESSION['confirm'] = "";
        $_SESSION['submitted'] = false;
        header('Location: '. $page);
        exit();
      }

      if (isset($_POST['okayButton'])) {
        require_once(DB_PATH . '/data_confirm.php');
        $_SESSION['submitted'] = false;
        $_SESSION['embedrequest'] = false;
        $_SESSION['ok'] = true;
        $_SESSION['message'] = "Thank you for using Map-A-Trail!<br>Your embed link is activated and ready to use.<br>Click RESET to map another trail or just close this browser to end the session.";
        $_SESSION['id_name'] = "";
        $_SESSION['confirm'] = "";
      }


      if (isset($_POST['value']) && $_POST['value'] == 'unload') {
        if (is_dir($_SESSION['uploads']) && $_SESSION['uploads'] != "") {
          foreach (glob($_SESSION['uploads'] . '*') as $filename) {
            unlink($filename);
          }
          rmdir($_SESSION['uploads']);
        }
      }

      if (isset($_POST['reset'])) {
        $_SESSION['submitted'] = false;
        if (is_dir($_SESSION['uploads']) && $_SESSION['uploads'] != "") {
          foreach (glob($_SESSION['uploads'] . '*') as $filename) {
            unlink($filename);
          }
          rmdir($_SESSION['uploads']);
        }
        ob_start();
        header('Location: '. 'home.php');
        ob_end_flush();
        exit();
      }

    };
    
  } catch (Exception $e) {
    echo $e->getMessage();
  }