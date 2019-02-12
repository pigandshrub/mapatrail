# Map-A-Trail *(Discontinued)*

Map-A-Trail is a site that allows you to use your GPX file to share your tracks, waypoints, and routes with family and friends.

This site was built using PHP and Javascript and mySQL.


## What It Works
It generates a line of code that you embed into your personal site, which then loads a map of your route.


## How Is the GPX file Used
Each gpx file provides a set of coordinates and matching features that are stored in one database table.
A primary key was generated for each uploaded gpx file and stored in another database table.
A foreign key was then generated and assigned to a column in both tables to identify the relationship between the many coordinates to the one file.

