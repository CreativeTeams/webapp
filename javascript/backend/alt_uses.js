/**
 * New node file
 */

module.exports = 
{
		installHandlers: function(context) {
			var commons = require('./commons.js')(context);
			var utils = require('./utils')();
			var logger = require('./logger')(context);
			var results = require('./results')(context);
					
	        context.socket.on(GET_TEST_STATE_REQ, function() {
	        	commons.sendTestStateRsp();
	        });
	               
	        context.socket.on(GET_SESSION_STATE_REQ, function() {
	        	commons.sendSessionStateRsp();
	        });
	        
	        context.socket.on(GET_STATE_REQ, function() {
	        	commons.sendStateRsp();
	        });	        
	        
	        context.socket.on(GET_TRANSACTIONS_REQ, function() {
	        	commons.sendTransactions(ALT_USES);
	        });	        
	                
	        context.socket.on(PERM_REQ, function(op) {
	        	switch (op) {
	        	case LOAD_TEST_PAGE:
	        		commons.checkAllReady(op, ALT_USES, altUsesSetupTestTimer);
	        		break;
	        	}
	        });
	        
	        function altUsesSetupTestTimer() {
	    	        commons.setupTestTime(ALT_USES, altUsesTestComplete);
	        }
	        
	        context.socket.on(ADD_USE_MSG, function(use) {
	        	context.rdb.genIdeaID(context.session.TeamID, altUsesAddMsg, use);
	        });
	        
	        function altUsesAddMsg(id, use) {
	        	use.OperationData.id = id;
	        	commons.saveAndBroadcastTransaction(ADD_USE_MSG, ALT_USES, use);
	        }

	        context.socket.on(DEL_USE_MSG, function(use) {
	        	commons.saveAndBroadcastTransaction(DEL_USE_MSG, ALT_USES, use);
	        });

	        context.socket.on(UPDATE_USE_MSG, function(use) {
	        	commons.saveAndBroadcastTransaction(UPDATE_USE_MSG, ALT_USES, use);
	        });
	        
	        context.socket.on(DISCONNECT_MSG, function() {
	        	commons.disconnectUser();
	        });	
	        
	        context.socket.on(IS_BACKEND_READY_REQ, function() {
	        	commons.sendIsBackendReadyRsp(ALT_USES);
	        });

	        context.socket.on(GET_RESULTS_RSP, function(res) {
	        	results.saveAltUsesResults(res);
	        	
	        	logger.debug("Redirect team " + context.session.TeamID + " to ", utils.getInstructionURL(utils.getNextTestID(ALT_USES)));
	        	results.saveParticipants(ALT_USES, commons.moveToNextTest, ALT_USES);
	        });
	        	        	        
	        context.socket.on(GET_TEST_INSTRUCTION_REQ, function() {
	        	commons.sendInstructionFile(ALT_USES);
	        });	        
	        	        	       	              
	        function altUsesTestComplete() {
	        	commons.sendTestComplete();
	        	commons.sendGetResultsReq();	        	
	        }
	          
	        logger.debug("Hanlders were installed for alternative uses test.");	        
		}		
};