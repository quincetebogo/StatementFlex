/**
 * Client Insights mock response
 *
 * @export
 * @constant insightsMocks
 */

export const insightsMocks = [
	{
		"entityId": "71da20cb-4e25-40ac-b363-aa9300833000",
		"nbaId": 100,
		"parentCategoryId": 23,
		"reference": "ID",
		"message": "Recall request awaiting feedback\n\nDescription: Recall request\nRef #: In7891011\nDate Logged: 20 Jan 2018\nStatus: Inprogress\nOwner: Savings team",
		"actions": [
		{
		"displayName": "This was useful",
		"type": "deepLink",
		"data": {
		"constant": "STrack"
		},
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJPcGVuIFNUcmFjayJ9"
		},
		{
		"displayName": "This didn't help",
		"type": "NoAction",
		"data": null,
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJGdWxmaWxsIE5lZWQifQ=="
		}
		]
	},
	{
		"entityId": "3265468a-72ff-4865-8740-735b22441996",
		"nbaId": 267,
		"parentCategoryId": 65,
		"reference": null,
		"message": "Open a savings account\nYou could earn more interest by moving money into a flexible savings account. Open a savings account on our app or at a branch today!",
		"actions": [
			{
				"displayName": "Thumbsup",
				"type": "NoAction",
				"data": {
					"constant": null
				},
				"replyReference": "eyJ0cmFja2luZ0lkIjoiMTExYWQ3Y2EtNGUyNS00ZDQ0LWE1N2YtOGFmNzU2UTY5MjVlIiwiRW50aXR5SWQiOiIzMjY1NDY4YS03MmZmLTQ4NjUtODc0MC03MzViMjI0NDE5OTYiLCJOYmFJZCI6MjY3LCJQYXJlbnRDYXRlZ29yeUlkIjo2NSwiQWN0aW9uRGlzcGxheU5hbWUiOiJUaHVtYnN1cCIsIkFjdGlvblR5cGUiOjR9"
			},
			{
				"displayName": "Thumbsdown",
				"type": "NoAction",
				"data": {
					"constant": null
				},
				"replyReference": "eyJ0cmFja2luZ0lkIjoiMTExYWQ3Y2EtNGUyNS00ZDQ0LWE1N2YtOGFmNzU1YTU5MjVlIiwiRW50aXR5SWQiOiIzMjY1NDY4YS03MmZmLTQ4NjUtODc0MC03MzViMjI0NDE5OTYiLCJOYmFJZCI6MjY3LCJQYXJlbnRDYXRlZ29yeUlkIjo2NSwiQWN0aW9uRGlzcGxheU5hbWUiOiJUaHVtYnNkb3duIiwiQWN0aW9uVHlwZSI6NH0="
			}
		]
		}
];