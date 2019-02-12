<?php
  require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
  $servername = $config['db']['db1']['host'];
  $username = $config['db']['db1']['username'];
  $password = $config['db']['db1']['password'];
  $dbname = $config['db']['db1']['dbname'];
  $id_name = $_SESSION['id_name'];
  $trans_id = $_SESSION['confirm'];

  function tableExists($conn, $file) {
    // Try a select statement against the table
    // Run it in try/catch in case PDO is in ERRMODE_EXCEPTION.
    try {
      $file = str_replace('-', '', $file); // Precautionary measure: no file names should have dashes in this case.
      $result = $conn->query("SELECT 1 FROM $file LIMIT 1");
    } catch (Exception $e) {
      // We got an exception == table not found
      return FALSE;
    }

    // Result is either boolean FALSE (no table found) or PDOStatement Object (table found)
    return $result !== FALSE;
  }
  
  try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if (tableExists($conn, $id_name)) {
      // sql to update user table
      $sql = "UPDATE users SET status='active' WHERE trans_id=$trans_id;";
      $stmt = $conn->prepare($sql);
      $stmt->execute();
    }
    $conn = null;

  } catch(PDOException $e) {
    $_SESSION['id_name'] = "";
    $_SESSION['confirm'] = "";
    header('HTTP/1.1 404 Not Found', true, 404);
    $_GET['e'] = 404; 
    exit();
  }

  $conn = null;