
/** Transforms IDP Agent role to human readable agent role. */
TransformAgentRole = function(idpRole) {
	switch (idpRole) {
		case "clientcare-agent":
			return "Client Care Agent";

		case "clientcare-teamleader":
			return "Client Care Team Leader";

		case "clientcare-manager":
			return "Client Care Manager";

		case "clientcareadmin-agent":
			return "Client Care Admin Agent";

		case "clientcareadmin-teamleader":
			return "Client Care Admin Team Leader";

		case "clientcareadmin-manager":
			return "Client Care Admin Manager";

		case "helpdesk-agent":
			return "Help Desk Agent";

		case "helpdesk-teamleader":
			return "Help Desk Team Leader";

		case "helpdesk-manager":
			return "Help Desk Manager";

		case "serviceadmin-agent":
			return "Service Admin Agent";

		case "serviceadmin-teamleader":
			return "Service Admin Team Leader";

		case "serviceadmin-manager":
			return "Service Admin Manager";

		case "utd-agent":
			return "UTD Agent";

		case "utd-teamleader":
			return "UTD Team Leader";

		case "utd-manager":
			return "UTD Manager";

		case "aml-agent":
			return "AML Agent";

		case "aml-teamleade,":
			return "AML Team Leader";

		case "aml-manager":
			return "AML Manager";

		case "fraudmonitoring-agent":
			return "Fraud Monitoring Agent";

		case "fraudmonitoring-teamleader":
			return "Fraud Monitoring Team Leader";

		case "fraudmonitoring-manager":
			return "Fraud Monitoring Manager";

		case "complaintmanagement-agent":
			return "Complaint Management Agent";

		case "complaintmanagement-teamleader":
			return "Complaint Management Team Leader";

		case "complaintmanagement-manager":
			return "Complaint Management Manager";

		default:
			return idpRole;
	}
}