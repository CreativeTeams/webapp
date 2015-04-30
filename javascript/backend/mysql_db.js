/**
 * Author: Habib Naderi
 * Department of Computer Science, University of Auckland
 * 
 * This module implements a set of methods for accessing and manipulating data in mysql DB. Refer to
 * 'database design' document for more detailed information about the structure of the DB.
 */

module.exports = function (conn) {
	var utils = require('./utils.js')();
	var logger = require('./logger.js')()
	return {
		getActiveUsersCount: function(msg, callback, args) {
			conn.query('select * from users where users.Active = "1"', function(err, rows){
	            if(err) throw err;
	            if (callback)
	            	callback(rows.length, args);
	            else {
	            	logger.log(msg+"Total Number of users: ", rows.length);
	            }
	        });
		},
		
		activateUser: function(teamID, userID) {
			post = {Active: 1};
			conn.query('UPDATE users SET ? WHERE users.TeamID = ' + teamID + ' AND users.UserID = ' + userID + ';', 
					post, function(err, result) {});
		},
		
		deactivateUser: function(teamID, userID) {
			post = {Active: 0};
			conn.query('UPDATE users SET ? WHERE users.TeamID = ' + teamID + ' AND users.UserID = ' + userID + ';', 
					post, function(err, result) {});
		},

		deactivateAllUsers: function() {
			post = {Active: 0};
			conn.query('UPDATE users SET ? ;', post, function(err, result) {});
		},
		
		enableUser: function(teamID, userID) {
			post = {Enabled: 1};
			conn.query('UPDATE users SET ? WHERE users.TeamID = ' + teamID + ' AND users.userID = ' + userID + ';', 
					post, function(err, result) {});
		},

		disableUser: function(teamID, userID) {
			post = {Enabled: 0};
			conn.query('UPDATE users SET ? WHERE users.TeamID = ' + teamID + ' AND users.userID = ' + userID + ';', 
					post, function(err, result) {});
		},
		
		saveTransaction: function(teamID, userID, testID, transaction) {
			var q = 'INSERT INTO `transactions`(`TeamID`, `TestID`, `UserID`, `ScreenNumber`, `Object`, `Operation`, `OperationData`, `Time`) VALUES ("'+
				teamID + '","' + testID + '","'+ userID + '","' + transaction.ScreenNumber + '","' + transaction.ObjectID + '","' + 
				transaction.Operation + '","' + JSON.stringify(transaction.OperationData).replace(/["]/g, '\\\"') +
				'",'+ new Date().getTime() + ');';
            query = conn.query(q, post, function(err, result) {
                if(err) {
                    logger.log("Saving a transaction:" + query.sql);
                	throw err;
                }
            });			
		},
		
		getTransactions: function(teamID, testID, screen, callback, args) {
			conn.query('select * from transactions where transactions.TeamID = "'+ teamID + 
							 '" and transactions.TestID = "' + testID +
							 '" and transactions.ScreenNumber = "' + screen + '"', function(err, rows) {
				if (err) throw err;
				
				callback(rows, args);
			});
		},
		
		getUser: function(teamID, userID, callback, args) {
			conn.query('select * from users where users.TeamID="'+teamID+'" and users.UserID="'+userID+'"',
					function(err, rows) {
				if (err) throw err;
				callback(rows[0], args);
			});
		},
		
		setUserName: function(teamID, userID, name) {
			var post  = {Name: name};
			conn.query('UPDATE users SET ? WHERE users.teamID = "'+ teamID + 
					   '" and users.UserID="' + userID + '"', post, function(err, row) {if (err) throw err;});
		},
		
		getTestTimeLimit: function(testID, callback, args) {
			var name = utils.getTestName(testID);
			conn.query('select ' + name + 'TimeLimit from config', function(err, rows) {
				if (err) throw err;
				callback(eval("rows[0]."+name+"TimeLimit"), args);
			});			
		},
		
		getTestInstructionFile: function(testID, callback, args) {
			var name = utils.getTestName(testID);
			conn.query('select * from config', function(err, rows) {
				if (err) throw err;
				callback(eval("rows[0].InstructionsPath")+"/"+name+".html", eval("rows[0]."+name+"TimeLimit"), args);
			});			
		},

		getIntroductionFile: function(callback, args) {			
			conn.query('select * from config', function(err, rows) {
				if (err) throw err;
				callback(eval("rows[0].InstructionsPath")+"/Introduction.html", 0, args);
			});			
		},

		getEndPageFile: function(callback, args) {			
			conn.query('select * from config', function(err, rows) {
				if (err) throw err;
				callback(eval("rows[0].InstructionsPath")+"/End.html", 0, args);
			});			
		},
		
		getResultsPath: function(callback, args) {
			conn.query('select ResultsPath from config', function(err, rows) {
				if (err) throw err;
				callback(rows[0].ResultsPath, args);
			});						
		},
		
		savePicConResults: function(teamID, results) {
			q = conn.query('insert into picconres values (' + teamID + ',"' + results.title + '")', 
					function(err, result) {
						if (err) {
							logger.log(q.sql);
							throw error;
						}
					}); 
		},
		
		savePicCompResults: function(teamID, results) {
			saveResults(teamID, results, 'piccompres');
		},

		saveParLinesResults: function(teamID, results) {
			saveResults(teamID, results, 'parlinesres');
		},

		saveDesChalResults: function(teamID, results) {
			saveResults(teamID, results, 'deschalres');
		},
		
		saveParticipants: function(teamID, testID, participants, callback, args) {
			for (i = 0; i < participants.length; i++) {
				q = conn.query('insert into participation values (' + teamID + ',' + utils.getUserID(participants[i]) + ',' + testID + ')',
						function(err, result) {
							if (err) {
								console.error(q.sql)
								throw err;
							}
					});
			}
			
			callback(args);
		},
		
		saveIdeaGenResults: function(teamID, results) {
			for (i = 0; i < results.length; i++) {
				q = conn.query('insert into ideagenres values ('+ teamID + ',' + results[i].userID + ',"' +
						results[i].title + '","' + results[i].description + '",' + results[i].ideaNo + ')',
						function(err, result) {
							if (err) {
								console.error(q.sql)
								throw err;
							}					
				});
			}
		},

		saveAltUsesResults: function(teamID, results) {
			for (i = 0; i < results.length; i++) {
				q = conn.query('insert into altusesres values ('+ teamID + ',' + results[i].userID + ',"' +
						results[i].use + '",' + results[i].useNo + ')',
						function(err, result) {
							if (err) {
								console.error(q.sql)
								throw err;
							}					
				});
			}
		},
		
		getTestsOrder: function(callback, args) {
			conn.query('select * from config', function(err, rows) {
				if (err) throw err;
				callback(eval("rows[0].TestsOrder").split(','), args);
			});			
			
		},
		
		delTeamInfo: function(teamID, callback, args) {
			conn.query('delete from altusesres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});
			conn.query('delete from deschalres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});						
			conn.query('delete from ideagenres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});						
			conn.query('delete from parlinesres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});						
			conn.query('delete from piccompres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});						
			conn.query('delete from picconres where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});						
			conn.query('delete from transactions where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});
			conn.query('delete from participation where TeamID='+teamID, function(err, rows) {
				if (err) throw err;
			});												
		}
		
	};
	
	function saveResults(teamID, results, table) {
		conn.query('select * from '+ table + ' where TeamID=' + teamID + " and screenNumber=" + results.screenNumber, function(err, rows) {
			if (err) throw err;
			if (rows.length == 0) {
				q = conn.query('insert into ' + table + ' values (' + teamID + ',' + results.screenNumber + ',"' + results.title + '")', 
						function(err, result) {
							if (err) {
								logger.log(q.sql);
								throw error;
							}
						}); 
			} else {		
				post = {title: results.title};
				q = conn.query('update ' + table + ' set ? where TeamID=' + teamID + " and ScreenNumber=" + results.screenNumber, post, 
						function(err, result) {
							if (err) { 
								logger.log(q.sql);									
								throw err;									
							}
						}); 					
			}
		}); 
	}
		
	
};