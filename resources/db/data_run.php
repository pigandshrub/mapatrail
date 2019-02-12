<?php
  require_once(dirname($_SERVER["DOCUMENT_ROOT"]) . '/resources/config.php');
  $servername = $config['db']['db1']['host'];
  $username = $config['db']['db1']['username'];
  $password = $config['db']['db1']['password'];
  $dbname = $config['db']['db1']['dbname'];
  $mod_name = $_SESSION['mod_name'];
  $target_file = $_SESSION['target_file'];

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

  function checkTable($conn, $file, $num) {
    $file = str_replace('-', '', $file);
    $newfile = $file . ($num);

    if (tableExists($conn, $newfile)) {
      checkTable($conn, $file, random_int(1, 1000));
    }
    // Result is either boolean FALSE (no table found) or PDOStatement Object (table found)
    return $newfile;
  }

  try {

    if (file_exists($target_file)) {
      // Interpret the gpx file into an object whose lines can be 
      // parsed and handled by PHP
      $xml_file = simplexml_load_file($target_file);

      if ($xml_file === false) {
        echo "Failed to load GPX file: ";
        foreach(libxml_get_errors() as $error) {
          echo "<br>", $error->message;
        }

      } else {        

        // Set up map id
        $characters = "bcdefghjklmnpqrstvwxyzBCDEFGHJKLMNPQRSTVWXYZ012345789";
        $char_length = strlen($characters) - 1;
        $random_length = random_int(15, 30);
        $mod_name_final = '';
        for ($i = 0; $i < $random_length; $i++) {
          $mod_name_final .= $characters[random_int(0, $char_length)];
        }

        // Create a connection to the database
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->exec("SET CHARACTER SET utf8");

        // If table already exists, try using another name to create a new table
        if (tableExists($conn, $mod_name_final)) {
          $mod_name_final = checkTable($conn, $mod_name_final, random_int(1, 100000));
        } 

        // Only create a table if a file has been submitted and not already entered 
        // into the database
        if (file_exists($target_file)) {
          $_SESSION['id_name'] = $mod_name_final;
        
          // sql to create table
          $sql = "CREATE TABLE IF NOT EXISTS $mod_name_final (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
            lat FLOAT(30) NOT NULL DEFAULT '0',
            lon FLOAT(30) NOT NULL DEFAULT '0',
            alt FLOAT(30) NOT NULL DEFAULT '0',
            point_date VARCHAR(20) NOT NULL DEFAULT '0000-00-00T00:00:00Z'
            ) CHARSET=utf8 COLLATE=utf8_general_ci AUTO_INCREMENT=1; 
            ";

          $conn->exec($sql);

          $stmt = $conn->prepare("INSERT INTO $mod_name_final (lat, lon, alt, point_date) VALUES (:lat, :lon, :alt, :point_date)");
          $stmt->bindParam(':lat', $lat);
          $stmt->bindParam(':lon', $lon);
          $stmt->bindParam(':alt', $alt);
          $stmt->bindParam(':point_date', $date);

          $trks = array();
          $rtes = array();

          foreach ($xml_file->trk as $trk) {
            $trks[] = $trk->trkseg->trkpt;
          }

          foreach ($trks as $trkpt) {
            $i = 0;
            while ($i < count($trkpt)) {
              $lat = $trkpt[$i]['lat'] ? $trkpt[$i]['lat'] : '0';
              $lon = $trkpt[$i]['lon'] ? $trkpt[$i]['lon'] : '0';
              $alt = $trkpt[$i]->ele ? $trkpt[$i]->ele : '0';
              $date = $trkpt[$i]->time ? $trkpt[$i]->time : '0000-00-00T00:00:00Z'; 
              $stmt->execute();
              $i++;
            }
          }

          foreach($xml_file->rte as $rte) {
            $rtes[] = $rte->rtept;
          }

          foreach ($rtes as $rtept) {
            $i = 0;
            while ($i < count($rtept)) {
              $lat = $rtept[$i]['lat'] ? $rtept[$i]['lat'] : '0';
              $lon = $rtept[$i]['lon'] ? $rtept[$i]['lon'] : '0';
              $alt = $rtept[$i]->ele ? $rtept[$i]->ele : '0';
              $date = $rtept[$i]->time ? $rtept[$i]->time : '0000-00-00T00:00:00Z'; 
              $stmt->execute();
              $i++;
            }
          }

          $stmt = $conn->prepare("INSERT INTO users (map_id, status) VALUES (:map_name, :status)");
          $stmt->bindParam(':map_name', $map_name);
          $stmt->bindParam(':status', $status);
          $map_name = $mod_name_final;
          $status = "unconfirmed";
          $stmt->execute();

          // Get confirm id
          $q = $conn->query("SELECT trans_id FROM users WHERE map_id='$map_name'");
          $_SESSION['confirm'] = $q->fetchColumn();
          
        }
      }

    } else {
      $conn = null;
      $_SESSION['id_name'] = "";
      $_SESSION['confirm'] = "";
      header('HTTP/1.1 404 Not Found', true, 404);
      $_GET['e'] = 404; 
      exit();
    } 

  } catch(PDOException $e) {
    $_SESSION['id_name'] = "";
    $_SESSION['confirm'] = "";
    header('HTTP/1.1 404 Not Found', true, 404);
    $_GET['e'] = 404; 
    exit();
  }

  $conn = null;
  
