--
-- assume this was already done: CREATE DATABASE photoapp;
--

USE photoapp;

DROP TABLE IF EXISTS metadata;

CREATE TABLE metadata
(
    assetid      int not null AUTO_INCREMENT,
    
    longtitude   
    latitude       
    PRIMARY KEY (assetid),
    FOREIGN KEY (assetid) REFERENCES assets(assetid),
);

--
-- DONE
--
