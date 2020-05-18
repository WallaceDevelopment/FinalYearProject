SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


create database db_users;

use db_users;

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `userID` int(11) NOT NULL,
  `userTypeID` int(11) NOT NULL,
  `username` varchar(16) NOT NULL,
  `full_name` varchar(60) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) 

ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1;

INSERT INTO `tbl_users` (`userID`,`userTypeID`, `username`,`full_name`, `email`, `password`) VALUES
(1, 0,'john', 'John Doe', 'JohnDoe@test.com', '6607a999607711cd339dce1de6d64425a0985cfd');

--
-- Table structure for table `userType`
--

CREATE TABLE `userType` (
  `userTypeID` int(11) NOT NULL AUTO_INCREMENT,
  `Type` varchar(45) NOT NULL,
  PRIMARY KEY (`userTypeID`),
  CONSTRAINT `userTypeID` FOREIGN KEY (`userTypeID`) REFERENCES `tbl_users_test` (`id`)
) 

--
-- Table structure for table `knife_crime_data`
--

CREATE TABLE `knife_crime_data` (
  `Minor Text` text,
  `Month-Year` text,
  `Borough` text,
  `Sum Value` int(11) DEFAULT NULL
) 

ALTER TABLE `knife_crime_data`
  ADD PRIMARY KEY (`Borough`);

--
-- Table structure for table `youth_budgets`
--

CREATE TABLE `youth_budgets` (
  `LSOA_Code` varchar(45) NOT NULL,
  `Borough` varchar(45) NOT NULL,
  `2011_Budget` decimal(15,2) DEFAULT NULL,
  `2019_Budget` decimal(15,2) DEFAULT NULL,
  `Chng_Earl_Year` decimal(15,2) DEFAULT NULL,
  `%_Change` decimal(5,2) DEFAULT NULL,
  `Note` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Borough`)
) 

CREATE TABLE `db_users`.`Borough` (
  `BoroughID` INT NOT NULL,
  `KnifeCrimeID` INT NULL,
  `YSBID` INT NULL,
  `Borough_Code` VARCHAR(15) NULL,
  `Borough_Name` VARCHAR(15) NULL,
  PRIMARY KEY (`BoroughID`),
  CONSTRAINT `KnifeCrimeID`
    FOREIGN KEY ()
    REFERENCES `db_users`.`knife_crime_data` ()
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `YSBID`
    FOREIGN KEY ()
    REFERENCES `db_users`.`youth_budgets` ()
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

