<?php
require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
if ($_SESSION['uploads'] != "") {
  return;
}

$dirname = $_SERVER["DOCUMENT_ROOT"] . '/other/' . time() . '/';
if (!mkdir($dirname)) {
    exit("Error in creating files");
} else {
    $old = umask(0);   
    chmod($dirname, 0755);
    umask($old);
}
$_SESSION['uploads'] = $dirname;  
$target_file = $_SESSION['uploads'] . time() . random_int(0, 300);
$thisFileType = pathinfo($mod_name,PATHINFO_EXTENSION);
$fileType = strtolower($thisFileType);

// Check that file has been selected and successfully uploaded.
if ($mod_name == null) {
    $_SESSION['submitted'] = false;
    $_SESSION['message'] = "File uploading error. Please RESET and try uploading the file again.";
    ob_start();
    header('Location: '. $_SERVER['REQUEST_URI']);
    ob_end_flush();
    exit();

} else if (file_exists($target_file)) {
    unlink($_SESSION['target_file']);
    $_SESSION['submitted'] = false;
    $_SESSION['message'] = "File uploading error. Please RESET and upload the file again.";
    ob_start();
    header('Location: '. $_SERVER['REQUEST_URI']);
    ob_end_flush();
    exit();

} else if ($fileType !== "gpx") {
    $_SESSION['message'] = "Sorry, only GPX files are allowed. Your file was not uploaded. To upload another file, click RESET.";

} else if ($_FILES["fileToUpload"]["size"] > 5000000) {
    $_SESSION['message'] = "Sorry, your file is too large. The file cannot exceed 5 mb.";
} else {
  
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $_SESSION['message'] = basename($_FILES["fileToUpload"]["name"]). " has been successfully uploaded.";
        $_SESSION['submitted'] = true;
        chmod($target_file, 0644);
        
    } else {
        $_SESSION['message'] = "Please check if your file has a valid GPX format. Your file could not be uploaded.";
    }
}


