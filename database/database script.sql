SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


create database db_users;
-- --------------------------------------------------------
use db_users;


--
-- Database: `db_users`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users_main` (
  `userID` int(11) NOT NULL,
  `userTypeID` int(11) NOT NULL,
  `username` varchar(16) NOT NULL,
  `full_name` varchar(60) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`userID`,`userTypeID`, `username`,`full_name`, `email`, `password`) VALUES
(1, 0,'john', 'John Doe', 'JohnDoe@test.com', '6607a999607711cd339dce1de6d64425a0985cfd');

-- 
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;