/**
 * Life health questions
 *
 * @export
 * @constant insureLifeQuestionnaire
 */
export const insureLifeQuestionnaire = {
	"questions": [
		{
			"groupId": "1",
			"description": "What is your monthly income BEFORE any deductions?",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "11",
					"questionGroupId": "1",
					"detail": "Less than R10 000 pm",
					"hasDescription": false
				},
				{
					"answerId": "12",
					"questionGroupId": "1",
					"detail": "R10 000 – R20 000 pm",
					"hasDescription": false
				},
				{
					"answerId": "13",
					"questionGroupId": "1",
					"detail": "R20 000 – R35 000 pm",
					"hasDescription": false
				},
				{
					"answerId": "14",
					"questionGroupId": "1",
					"detail": "More than R35 000 pm",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "2",
			"description": "When did you last smoke or use a tobacco product? (including vaping)",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "21",
					"questionGroupId": "2",
					"detail": "In the last month",
					"hasDescription": false
				},
				{
					"answerId": "22",
					"questionGroupId": "2",
					"detail": "More than one month ago, but within the last year",
					"hasDescription": false
				},
				{
					"answerId": "23",
					"questionGroupId": "2",
					"detail": "Between 2-3 years ago",
					"hasDescription": false
				},
				{
					"answerId": "24",
					"questionGroupId": "2",
					"detail": "More than 3 years ago",
					"hasDescription": false
				},
				{
					"answerId": "25",
					"questionGroupId": "2",
					"detail": "Never",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "3",
			"description": "Tick any of the following that you have ever received treatment for, or been diagnosed with:",
			"type": "AnyOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "31",
					"questionGroupId": "3",
					"detail": "Organ Transplant",
					"hasDescription": false
				},
				{
					"answerId": "32",
					"questionGroupId": "3",
					"detail": "Paralysis",
					"hasDescription": true,
					"description": "Like: being confined to a wheelchair, paralaysed on one side of your body or being bedridden."
				},
				{
					"answerId": "33",
					"questionGroupId": "3",
					"detail": "Heart Condition",
					"hasDescription": true,
					"description": "Like:heart attack; heart valve disorders; Coronary Artery Bypass Graft"
				},
				{
					"answerId": "34",
					"questionGroupId": "3",
					"detail": "Ongoing Liver, Lung or Kidney Disease",
					"hasDescription": true,
					"description": "Like:kidney failure, dialysis, chronic obstructive lung disease"
				},
				{
					"answerId": "35",
					"questionGroupId": "3",
					"detail": "Mental Health Condition",
					"hasDescription": true,
					"description": "Such as:major depression, schizophrenia, bipolar disorder"
				},
				{
					"answerId": "36",
					"questionGroupId": "3",
					"detail": "Stroke, Cancer, Diabetes, HIV/AIDS",
					"hasDescription": false
				},
				{
					"answerId": "37",
					"questionGroupId": "3",
					"detail": "None of the above",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "4",
			"description": "Do you have any other medical conditions that require regular treatments or follow-ups?",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "41",
					"questionGroupId": "4",
					"detail": "Yes",
					"hasDescription": false
				},
				{
					"answerId": "42",
					"questionGroupId": "4",
					"detail": "No",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "4b",
			"description": "Do you have a medical condition that requires repeat scripts? \r\n[excluding birth control and hormone replacement]",
			"type": "OneOf",
			"isReflexive": true,
			"dependentAnswerName": "41",
			"dependentAnswerCondition": true,
			"answers": [
				{
					"answerId": "4b1",
					"questionGroupId": "4b",
					"detail": "Yes",
					"hasDescription": false
				},
				{
					"answerId": "4b2",
					"questionGroupId": "4b",
					"detail": "No",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "5",
			"description": "When did you last: \r\n•\tstay at a medical facility for 5 or more consecutive days, or\r\n•\tget booked off work for 10 or more consecutive working days for medical reasons?",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "51",
					"questionGroupId": "5",
					"detail": "In the last 12 months",
					"hasDescription": false
				},
				{
					"answerId": "52",
					"questionGroupId": "5",
					"detail": "Between 1 and 5 years ago",
					"hasDescription": false
				},
				{
					"answerId": "53",
					"questionGroupId": "5",
					"detail": "More than 5 years ago",
					"hasDescription": false
				},
				{
					"answerId": "54",
					"questionGroupId": "5",
					"detail": "Never",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "5b",
			"description": "Tick the reasons for staying at the medical facility or being booked off work:",
			"type": "AnyOf",
			"isReflexive": true,
			"dependentAnswerName": "51",
			"dependentAnswerCondition": true,
			"answers": [
				{
					"answerId": "5b1",
					"questionGroupId": "5b",
					"detail": "Childbirth",
					"hasDescription": false
				},
				{
					"answerId": "5b2",
					"questionGroupId": "5b",
					"detail": "Dentistry procedures",
					"hasDescription": false
				},
				{
					"answerId": "5b3",
					"questionGroupId": "5b",
					"detail": "Head injury",
					"hasDescription": false
				},
				{
					"answerId": "5b4",
					"questionGroupId": "5b",
					"detail": "Fracture or broken bones",
					"hasDescription": false
				},
				{
					"answerId": "5b5",
					"questionGroupId": "5b",
					"detail": "Other:",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "6",
			"description": "Do you have any hospital stays, surgery, medical investigations, or follow-ups planned?",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "61",
					"questionGroupId": "6",
					"detail": "Yes",
					"hasDescription": false
				},
				{
					"answerId": "62",
					"questionGroupId": "6",
					"detail": "No",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "6b",
			"description": "Tick the reasons these plans relate to:",
			"type": "AnyOf",
			"isReflexive": true,
			"dependentAnswerName": "61",
			"dependentAnswerCondition": true,
			"answers": [
				{
					"answerId": "6b1",
					"questionGroupId": "6b",
					"detail": "Pregnancy check-ups or procedures",
					"hasDescription": false
				},
				{
					"answerId": "6b2",
					"questionGroupId": "6b",
					"detail": "Routine check-up for existing condition",
					"hasDescription": false
				},
				{
					"answerId": "6b3",
					"questionGroupId": "6b",
					"detail": "Annaul eye or dentistry consultation",
					"hasDescription": false
				},
				{
					"answerId": "6b4",
					"questionGroupId": "6b",
					"detail": "Dentistry procedure",
					"hasDescription": false
				},
				{
					"answerId": "6b5",
					"questionGroupId": "6b",
					"detail": "Other:",
					"hasDescription": false
				}
			]
		},
		{
			"groupId": "7",
			"description": "If you were not feeling well and needed to see a doctor, who would you consult with?",
			"type": "OneOf",
			"isReflexive": false,
			"dependentAnswerCondition": false,
			"answers": [
				{
					"answerId": "71",
					"questionGroupId": "7",
					"detail": "My Regular Doctor",
					"hasDescription": false
				},
				{
					"answerId": "72",
					"questionGroupId": "7",
					"detail": "My Local Clinic",
					"hasDescription": false
				},
				{
					"answerId": "73",
					"questionGroupId": "7",
					"detail": "My Local Hospital",
					"hasDescription": false
				},
				{
					"answerId": "74",
					"questionGroupId": "7",
					"detail": "I dont Know",
					"hasDescription": false
				}
			]
		}
	]
};