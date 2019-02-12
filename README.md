# Map-A-Trail

This project generates embed code to place on your site that will load an interactive trail map based on an uploaded gpx file.

This site was built using PHP and Javascript and mySQL.

Each gpx file provided a set of coordinates and matching features that was read off the file and stored in one database table.
A primary key was generated for each uploaded gpx file and stored in another database table.
A foreign key was then generated and assigned to a column in both tables to identify the relationship between the many coordinates to the one file.

