<?php if (isset($_SESSION['embedrequest']) && $_SESSION['embedrequest']): ?>
<body class="noscroll">
<?php else: ?>
<body>
<?php endif ?>
<?php include_once("analyticstracking.php") ?>
<div class="info-section">
  <section>FAQ<article><?php include_once($config['paths']['articles'] . '/faq.html') ?></article></section>
  <section>Contact<article><?php include_once($config['paths']['articles'] . '/contact.html') ?></article></section>
  <section>Terms of Use<article><?php include_once($config['paths']['articles'] . '/terms.html') ?></article></section>
  <section>Privacy<article><?php include_once($config['paths']['articles'] . '/privacy.html') ?></article></section>
</div>