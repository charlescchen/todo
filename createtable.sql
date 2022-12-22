CREATE DATABASE tasks;

USE tasks;

CREATE TABLE task (
	taskid int NOT NULL AUTO_INCREMENT,
    item varchar(255),
    due DATE,
    complete BOOLEAN,
    PRIMARY KEY (taskid)
);