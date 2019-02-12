<?php
  require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
  $servername = $config['db']['db1']['host'];
  $username = $config['db']['db1']['username'];
  $password = $config['db']['db1']['password'];
  $dbname = $config['db']['db1']['dbname'];
  if (!isset($_GET['id'])) {
    $_SESSION['id_name'] = "";
    $_SESSION['confirm'] = "";
    header('HTTP/1.1 404 Not Found', true, 404);
    $_GET['e'] = 404; 
    exit();

  } else {
    $id_name = $_GET['id'];
  }

  
  try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $getTrail = $conn->prepare("SELECT * FROM $id_name ORDER BY id ASC");
    $getTrail->execute();
    $trail = $getTrail->fetchAll(); // returns an array and assigns it to $trail
    if ( count($trail) ) {
      $features = $trail;
    } else {
      echo "No rows returned.";
    }

  } catch(PDOException $e) {
    $_SESSION['id_name'] = "";
    $_SESSION['confirm'] = "";
    header('HTTP/1.1 404 Not Found', true, 404);
    $_GET['e'] = 404; 
    exit();
  }

  $conn = null;