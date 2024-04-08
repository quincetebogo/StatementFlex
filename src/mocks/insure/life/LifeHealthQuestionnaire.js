/**
 * Life health questions
 *
 * @export
 * @constant insureLifeQuestionnaire
 */
export const insureLifeQuestionnaire = {
    "questions": [
        {
            "groupId": `1`,
            "description": `What is your total monthly income before any deductions?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `11`,
                    "questionGroupId": `1`,
                    "detail": `Less than R15 000`,
                    "hasDescription": false
                },
                {
                    "answerId": `12`,
                    "questionGroupId": `1`,
                    "detail": `R15 001 - R20 000`,
                    "hasDescription": false
                },
                {
                    "answerId": `13`,
                    "questionGroupId": `1`,
                    "detail": `R20 001 - R35 000`,
                    "hasDescription": false
                },
                {
                    "answerId": `14`,
                    "questionGroupId": `1`,
                    "detail": `More than R35 000`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `2`,
            "description": `Do you take any regular medicine for high sugar levels or diabetes?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `21`,
                    "questionGroupId": `2`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `22`,
                    "questionGroupId": `2`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `3`,
            "description": `Do you take regular medicine for your lungs, liver, kidneys or heart disease?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `31`,
                    "questionGroupId": `3`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `32`,
                    "questionGroupId": `3`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `4`,
            "description": `Has any other insurance company declined you for life insurance before?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `41`,
                    "questionGroupId": `4`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `42`,
                    "questionGroupId": `4`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `5`,
            "description": `Have you ever had any of the following: Tuberculosis (TB), HIV/AIDS, cancer, heart attack, heart surgery or stroke?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `51`,
                    "questionGroupId": `5`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `52`,
                    "questionGroupId": `5`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `6`,
            "description": `Do you smoke or vape more than 3 times a week?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `61`,
                    "questionGroupId": `6`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `62`,
                    "questionGroupId": `6`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `7`,
            "description": `Have you been told to take medicine for high blood pressure?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `71`,
                    "questionGroupId": `7`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `72`,
                    "questionGroupId": `7`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        },
        {
            "groupId": `8`,
            "description": `Have you been told to take medicine for high cholesterol?`,
            "type": `OneOf`,
            "isReflexive": false,
            "dependentAnswerCondition": false,
            "answers": [
                {
                    "answerId": `81`,
                    "questionGroupId": `8`,
                    "detail": `Yes`,
                    "hasDescription": false
                },
                {
                    "answerId": `82`,
                    "questionGroupId": `8`,
                    "detail": `No`,
                    "hasDescription": false
                }
            ]
        }
    ]
};